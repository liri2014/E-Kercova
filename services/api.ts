import { supabase } from '../supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper to handle API responses
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error. Please check your connection.' }));

        // Provide user-friendly error messages
        if (response.status === 404) {
            throw new Error('Service not found. Please try again later.');
        } else if (response.status === 500) {
            throw new Error('Server error. Please try again later.');
        } else if (response.status === 503) {
            throw new Error('Service temporarily unavailable. Please wait a moment and try again.');
        }

        throw new Error(error.error || 'Something went wrong. Please try again.');
    }
    return response.json();
};

export const api = {
    // Test function to verify Railway connectivity
    testHealth: async () => {
        try {
            const response = await fetch(`${API_URL}/health`);
            const data = await response.json();
            return data;
        } catch (error) {
            throw error;
        }
    },
    // --- REPORTS (Write via Backend) ---
    submitReport: async (formData: FormData) => {
        // formData should contain 'photo' (File), 'user_id', 'lat', 'lng', 'description'
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            const response = await fetch(`${API_URL}/api/reports`, {
                method: 'POST',
                body: formData,
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            return handleResponse(response);
        } catch (error: any) {
            if (error.name === 'AbortError') {
                throw new Error('Request timed out. Please check your internet connection and try again.');
            }
            if (!navigator.onLine) {
                throw new Error('No internet connection. Please connect to the internet and try again.');
            }
            console.error('Report submission error:', error);
            throw new Error(error.message || 'Failed to submit report. Please try again.');
        }
    },

    getMyReports: async (userId: string) => {
        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // --- PARKING (Write via Backend, Read via Supabase) ---
    getParkingZones: async () => {
        const { data, error } = await supabase
            .from('parking_zones')
            .select('*');

        if (error) throw error;
        return data;
    },

    payParking: async (paymentData: { user_id: string; zone_id: string; duration: number; plate_number: string; amount: number }) => {
        try {
            const response = await fetch(`${API_URL}/api/parking/pay`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentData),
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Parking payment error:', error);
            throw error;
        }
    },

    // --- NEWS & EVENTS (Read via Supabase) ---
    getNews: async () => {
        const { data, error } = await supabase
            .from('news')
            .select('*')
            .order('start_date', { ascending: false });

        if (error) throw error;
        return data;
    },

    getEvents: async () => {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('date', { ascending: true });

        if (error) throw error;
        return data;
    },

    // --- AUTH (Delete Account via Backend) ---
    deleteAccount: async (userId: string) => {
        const response = await fetch(`${API_URL}/api/auth/account`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id: userId }),
        });
        return handleResponse(response);
    }
};
