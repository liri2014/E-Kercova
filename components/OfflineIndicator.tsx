import React, { useState, useEffect } from 'react';
import { Icon } from './ui/Icon';
import { offlineQueue, QueuedAction } from '../services/offlineQueue';

interface OfflineIndicatorProps {
  className?: string;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ className = '' }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queue, setQueue] = useState<QueuedAction[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribe = offlineQueue.subscribe(setQueue);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  const handleSync = async () => {
    if (!isOnline || syncing) return;
    
    setSyncing(true);
    try {
      await offlineQueue.forceSync();
    } finally {
      setSyncing(false);
    }
  };

  // Don't show anything if online and no queued items
  if (isOnline && queue.length === 0) {
    return null;
  }

  return (
    <div className={`fixed top-16 left-4 right-4 z-50 ${className}`}>
      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-amber-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 mb-2">
          <Icon name="wifiOff" className="w-5 h-5" />
          <span className="font-medium">You're offline</span>
          {queue.length > 0 && (
            <span className="ml-auto text-sm bg-white/20 px-2 py-0.5 rounded">
              {queue.length} pending
            </span>
          )}
        </div>
      )}

      {/* Queued Items Indicator */}
      {queue.length > 0 && isOnline && (
        <div 
          className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg cursor-pointer"
          onClick={() => setShowDetails(!showDetails)}
        >
          <div className="flex items-center gap-2">
            <Icon name="clock" className="w-5 h-5" />
            <span className="font-medium">{queue.length} pending actions</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSync();
              }}
              disabled={syncing}
              className="ml-auto bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm transition-colors disabled:opacity-50"
            >
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>

          {/* Details Panel */}
          {showDetails && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <div className="text-sm space-y-2">
                {queue.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded">
                    <span className="capitalize">{item.type}</span>
                    <span className="text-white/70">→</span>
                    <span className="text-white/70">{item.action}</span>
                    {item.retryCount > 0 && (
                      <span className="ml-auto text-xs bg-red-400/50 px-1.5 py-0.5 rounded">
                        Retry {item.retryCount}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;

