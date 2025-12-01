// Offline Queue Service - Stores actions when offline and syncs when back online
import { Preferences } from '@capacitor/preferences';

export interface QueuedAction {
  id: string;
  type: 'report' | 'parking' | 'wallet';
  action: string;
  payload: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
}

interface SyncResult {
  success: boolean;
  error?: string;
}

const QUEUE_KEY = 'offline_queue';
const MAX_RETRIES = 3;

class OfflineQueueService {
  private queue: QueuedAction[] = [];
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private listeners: Set<(queue: QueuedAction[]) => void> = new Set();

  constructor() {
    this.init();
  }

  private async init() {
    // Load persisted queue
    await this.loadQueue();

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Try to sync on init if online
    if (this.isOnline && this.queue.length > 0) {
      this.syncQueue();
    }
  }

  private async loadQueue() {
    try {
      const { value } = await Preferences.get({ key: QUEUE_KEY });
      if (value) {
        this.queue = JSON.parse(value);
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.queue = [];
    }
  }

  private async saveQueue() {
    try {
      await Preferences.set({
        key: QUEUE_KEY,
        value: JSON.stringify(this.queue),
      });
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener([...this.queue]));
  }

  // Subscribe to queue changes
  subscribe(listener: (queue: QueuedAction[]) => void): () => void {
    this.listeners.add(listener);
    // Immediately notify with current state
    listener([...this.queue]);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Add action to queue
  async enqueue(
    type: QueuedAction['type'],
    action: string,
    payload: Record<string, unknown>
  ): Promise<string> {
    const queuedAction: QueuedAction = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      action,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(queuedAction);
    await this.saveQueue();

    // Try to sync immediately if online
    if (this.isOnline) {
      this.syncQueue();
    }

    return queuedAction.id;
  }

  // Remove action from queue
  async dequeue(id: string) {
    this.queue = this.queue.filter((item) => item.id !== id);
    await this.saveQueue();
  }

  // Get current queue
  getQueue(): QueuedAction[] {
    return [...this.queue];
  }

  // Get queue count
  getQueueCount(): number {
    return this.queue.length;
  }

  // Check if online
  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  // Process a single queued action
  private async processAction(action: QueuedAction): Promise<SyncResult> {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    try {
      let endpoint = '';
      let method = 'POST';
      let body = action.payload;

      switch (action.type) {
        case 'report':
          if (action.action === 'create') {
            endpoint = '/api/reports';
          } else if (action.action === 'update') {
            endpoint = `/api/reports/${action.payload.id}`;
            method = 'PUT';
          }
          break;

        case 'parking':
          if (action.action === 'start') {
            endpoint = '/api/parking/start';
          } else if (action.action === 'extend') {
            endpoint = '/api/parking/extend';
          }
          break;

        case 'wallet':
          if (action.action === 'topup') {
            endpoint = '/api/wallet/topup';
          }
          break;

        default:
          return { success: false, error: 'Unknown action type' };
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || `HTTP ${response.status}`,
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Sync all queued actions
  async syncQueue(): Promise<{ synced: number; failed: number }> {
    if (this.syncInProgress || !this.isOnline || this.queue.length === 0) {
      return { synced: 0, failed: 0 };
    }

    this.syncInProgress = true;
    let synced = 0;
    let failed = 0;

    // Process queue in order (FIFO)
    const toProcess = [...this.queue];

    for (const action of toProcess) {
      const result = await this.processAction(action);

      if (result.success) {
        await this.dequeue(action.id);
        synced++;
      } else {
        action.retryCount++;

        if (action.retryCount >= MAX_RETRIES) {
          // Remove from queue after max retries
          await this.dequeue(action.id);
          console.error(
            `Action ${action.id} failed after ${MAX_RETRIES} retries:`,
            result.error
          );
        }

        failed++;
      }
    }

    this.syncInProgress = false;
    await this.saveQueue();

    return { synced, failed };
  }

  // Force sync (manual trigger)
  async forceSync(): Promise<{ synced: number; failed: number }> {
    if (!this.isOnline) {
      return { synced: 0, failed: 0 };
    }
    return this.syncQueue();
  }

  // Clear all queued actions
  async clearQueue() {
    this.queue = [];
    await this.saveQueue();
  }
}

// Export singleton instance
export const offlineQueue = new OfflineQueueService();

// React hook for using offline queue
export function useOfflineQueue() {
  const [queue, setQueue] = React.useState<QueuedAction[]>([]);
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const unsubscribe = offlineQueue.subscribe(setQueue);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    queue,
    queueCount: queue.length,
    isOnline,
    enqueue: offlineQueue.enqueue.bind(offlineQueue),
    forceSync: offlineQueue.forceSync.bind(offlineQueue),
    clearQueue: offlineQueue.clearQueue.bind(offlineQueue),
  };
}

// Import React at the top level for the hook
import * as React from 'react';

