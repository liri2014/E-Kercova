import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Calendar, Newspaper, Trash2 } from 'lucide-react';

export const Content: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'news' | 'events'>('news');
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchItems = async () => {
        setLoading(true);
        const table = activeTab === 'news' ? 'news' : 'events';
        const { data, error } = await supabase.from(table).select('*').order(activeTab === 'news' ? 'start_date' : 'date', { ascending: false });
        if (error) console.error(error);
        else setItems(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchItems();
    }, [activeTab]);

    const deleteItem = async (id: string) => {
        if (confirm('Delete this item?')) {
            const table = activeTab === 'news' ? 'news' : 'events';
            await supabase.from(table).delete().eq('id', id);
            fetchItems();
        }
    };

    const createItem = async () => {
        // Placeholder for creation logic (modal or form)
        const title = prompt(`Enter ${activeTab} title:`);
        if (!title) return;

        const table = activeTab === 'news' ? 'news' : 'events';
        const payload = activeTab === 'news'
            ? { title, description: 'New announcement', type: 'news', start_date: new Date() }
            : { title, date: new Date(), type: 'municipal' };

        await supabase.from(table).insert(payload);
        fetchItems();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Content Management</h1>
                <button onClick={createItem} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all">
                    <Plus size={20} />
                    Add {activeTab === 'news' ? 'News' : 'Event'}
                </button>
            </div>

            <div className="flex gap-4 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('news')}
                    className={`pb-4 px-2 font-medium transition-all ${activeTab === 'news' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    News & Announcements
                </button>
                <button
                    onClick={() => setActiveTab('events')}
                    className={`pb-4 px-2 font-medium transition-all ${activeTab === 'events' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    City Events
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-500">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative group">
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => deleteItem(item.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                                {activeTab === 'news' ? <Newspaper size={24} /> : <Calendar size={24} />}
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                            <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                                {activeTab === 'news' ? item.description : new Date(item.date).toLocaleDateString()}
                            </p>
                            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                                {item.type}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
