/// <reference types="vite/client" />

// API Configuration for Admin Panel
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = {
    baseUrl: API_BASE_URL,

    // Helper to make requests
    async request(endpoint: string, options: RequestInit = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        return response.json();
    },

    // Parking Zones
    parking: {
        createZone: (data: { name: string; rate: number; capacity: number }) =>
            api.request('/api/parking/zones', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        updateZone: (id: string, data: { name: string; rate: number; capacity: number }) =>
            api.request(`/api/parking/zones/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),

        deleteZone: (id: string) =>
            api.request(`/api/parking/zones/${id}`, {
                method: 'DELETE',
            }),
    },

    // News
    news: {
        create: (data: any) =>
            api.request('/api/news', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        delete: (id: string) =>
            api.request(`/api/news/${id}`, {
                method: 'DELETE',
            }),
    },

    // Events
    events: {
        create: (data: any) =>
            api.request('/api/events', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        delete: (id: string) =>
            api.request(`/api/events/${id}`, {
                method: 'DELETE',
            }),
    },

    // Landmarks
    landmarks: {
        create: (data: any) =>
            api.request('/api/landmarks', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        delete: (id: string) =>
            api.request(`/api/landmarks/${id}`, {
                method: 'DELETE',
            }),
    },

    // Holidays
    holidays: {
        import: (year: number) =>
            api.request('/api/holidays/import', {
                method: 'POST',
                body: JSON.stringify({ year }),
            }),
    },
};
