import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Calendar, Newspaper, Trash2, Edit2, Download } from 'lucide-react';
import { Modal } from '../components/Modal';

interface NewsItem {
    id: string;
    title: string;
    description: string;
    title_mk?: string;
    title_sq?: string;
    title_en?: string;
    description_mk?: string;
    description_sq?: string;
    description_en?: string;
    type: string;
    start_date: string;
    end_date?: string;
}

interface EventItem {
    id: string;
    title: string;
    title_mk?: string;
    title_sq?: string;
    title_en?: string;
    description?: string;
    description_mk?: string;
    description_sq?: string;
    description_en?: string;
    date: string;
    type: string;
    is_holiday?: boolean;
}

export const Content: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'news' | 'events'>('news');
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        sourceLang: 'sq',
        type: 'news',
        date: new Date().toISOString().split('T')[0]
    });
    const [translating, setTranslating] = useState(false);
    const [importing, setImporting] = useState(false);

    const fetchItems = async () => {
        setLoading(true);
        const table = activeTab === 'news' ? 'news' : 'events';
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .order(activeTab === 'news' ? 'start_date' : 'date', { ascending: false });
        if (error) console.error(error);
        else setItems(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchItems();
    }, [activeTab]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setTranslating(true);

        try {
            const endpoint = activeTab === 'news' ? '/api/news' : '/api/events';
            const payload = activeTab === 'news'
                ? {
                    title: formData.title,
                    description: formData.description,
                    type: formData.type,
                    sourceLang: formData.sourceLang
                }
                : {
                    title: formData.title,
                    description: formData.description,
                    date: formData.date,
                    type: formData.type,
                    sourceLang: formData.sourceLang
                };

            const response = await fetch(`http://localhost:3000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setShowAddModal(false);
                setFormData({
                    title: '',
                    description: '',
                    sourceLang: 'sq',
                    type: 'news',
                    date: new Date().toISOString().split('T')[0]
                });
                fetchItems();
            }
        } catch (error) {
            console.error('Error adding item:', error);
        } finally {
            setTranslating(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const endpoint = activeTab === 'news' ? '/api/news' : '/api/events';
            const response = await fetch(`http://localhost:3000${endpoint}/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchItems();
            }
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    const importHolidays = async () => {
        setImporting(true);
        try {
            const year = new Date().getFullYear();
            const response = await fetch(`http://localhost:3000/api/holidays/import`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ year })
            });

            if (response.ok) {
                alert(`Successfully imported holidays for ${year}`);
                fetchItems();
            }
        } catch (error) {
            console.error('Error importing holidays:', error);
            alert('Failed to import holidays');
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Content Management</h1>
                <div className="flex gap-3">
                    {activeTab === 'events' && (
                        <button
                            onClick={importHolidays}
                            disabled={importing}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                        >
                            <Download size={20} />
                            {importing ? 'Importing...' : 'Import Holidays'}
                        </button>
                    )}
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                    >
                        <Plus size={20} />
                        Add {activeTab === 'news' ? 'News' : 'Event'}
                    </button>
                </div>
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
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                                {activeTab === 'news' ? <Newspaper size={24} /> : <Calendar size={24} />}
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>

                            {/* Show multilingual content */}
                            <div className="space-y-2 mb-4">
                                {item.title_mk && (
                                    <div className="text-xs">
                                        <span className="font-semibold text-slate-500">MK:</span>
                                        <span className="text-slate-600 ml-1">{item.title_mk}</span>
                                    </div>
                                )}
                                {item.title_sq && (
                                    <div className="text-xs">
                                        <span className="font-semibold text-slate-500">SQ:</span>
                                        <span className="text-slate-600 ml-1">{item.title_sq}</span>
                                    </div>
                                )}
                                {item.title_en && (
                                    <div className="text-xs">
                                        <span className="font-semibold text-slate-500">EN:</span>
                                        <span className="text-slate-600 ml-1">{item.title_en}</span>
                                    </div>
                                )}
                            </div>

                            <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                                {activeTab === 'news' ? item.description : new Date(item.date).toLocaleDateString()}
                            </p>
                            <div className="flex gap-2">
                                <span className="text-xs font-medium uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                                    {item.type}
                                </span>
                                {item.is_holiday && (
                                    <span className="text-xs font-medium uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                                        Holiday
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Modal */}
            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={`Add ${activeTab === 'news' ? 'News' : 'Event'}`}>
                <form onSubmit={handleAdd} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Source Language</label>
                        <select
                            value={formData.sourceLang}
                            onChange={(e) => setFormData({ ...formData, sourceLang: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                        >
                            <option value="sq">Albanian</option>
                            <option value="mk">Macedonian</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                            placeholder="Enter title..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                            rows={4}
                            placeholder="Enter description..."
                        />
                    </div>
                    {activeTab === 'events' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                        >
                            {activeTab === 'news' ? (
                                <>
                                    <option value="news">News</option>
                                    <option value="alert">Alert</option>
                                    <option value="maintenance">Maintenance</option>
                                </>
                            ) : (
                                <>
                                    <option value="municipal">Municipal</option>
                                    <option value="cultural">Cultural</option>
                                    <option value="sports">Sports</option>
                                </>
                            )}
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={translating}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
                    >
                        {translating ? 'Translating & Creating...' : 'Create'}
                    </button>
                </form>
            </Modal>
        </div>
    );
};
