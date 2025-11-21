import { supabase } from '../supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper to handle API responses
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || 'API Request Failed');
    }
    return response.json();
};

export const api = {
    // --- REPORTS (Write via Backend) ---
    submitReport: async (formData: FormData) => {
        // formData should contain 'photo' (File), 'user_id', 'lat', 'lng', 'description'
        const response = await fetch(`${API_URL}/api/reports`, {
            method: 'POST',
            body: formData,
        });
        return handleResponse(response);
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
        const response = await fetch(`${API_URL}/api/parking/pay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentData),
        });
        return handleResponse(response);
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId }),
        });
        return handleResponse(response);
    }
};
