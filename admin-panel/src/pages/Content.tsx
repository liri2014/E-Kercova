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
    photo_urls?: string[];
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
        date: new Date().toISOString().split('T')[0],
        start_date: new Date().toISOString().split('T')[0],
        end_date: ''
    });
    const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
    const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
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

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + selectedPhotos.length > 3) {
            alert('Maximum 3 photos allowed');
            return;
        }

        setSelectedPhotos([...selectedPhotos, ...files]);

        // Generate preview URLs
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreviewUrls(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removePhoto = (index: number) => {
        setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
        setPhotoPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const uploadPhotos = async (): Promise<string[]> => {
        const photoUrls: string[] = [];

        for (const photo of selectedPhotos) {
            const fileName = `news/${Date.now()}_${Math.random().toString(36).substring(7)}_${photo.name}`;
            const { data, error } = await supabase.storage
                .from('app-uploads')
                .upload(fileName, photo);

            if (error) {
                console.error('Photo upload error:', error);
                continue;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('app-uploads')
                .getPublicUrl(fileName);

            photoUrls.push(publicUrl);
        }

        return photoUrls;
    };


    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setTranslating(true);
        setUploading(true);

        try {
            // Upload photos first if this is news with photos
            let photoUrls: string[] = [];
            if (activeTab === 'news' && selectedPhotos.length > 0) {
                photoUrls = await uploadPhotos();
            }

            const endpoint = activeTab === 'news' ? '/api/news' : '/api/events';
            const payload = activeTab === 'news'
                ? {
                    title: formData.title,
                    description: formData.description,
                    type: formData.type,
                    sourceLang: formData.sourceLang,
                    photo_urls: photoUrls
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
                    date: new Date().toISOString().split('T')[0],
                    start_date: new Date().toISOString().split('T')[0],
                    end_date: ''
                });
                setSelectedPhotos([]);
                setPhotoPreviewUrls([]);
                fetchItems();
            }
        } catch (error) {
            console.error('Error adding item:', error);
        } finally {
            setTranslating(false);
            setUploading(false);
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTranslating(true);

        try {
            const table = activeTab === 'news' ? 'news' : 'events';
            const updateData: any = activeTab === 'news'
                ? {
                    title: formData.title,
                    description: formData.description,
                    type: formData.type,
                    start_date: formData.start_date,
                    end_date: formData.end_date || null
                }
                : {
                    title: formData.title,
                    description: formData.description,
                    date: formData.date,
                    type: formData.type
                };

            const { error } = await supabase
                .from(table)
                .update(updateData)
                .eq('id', selectedItem.id);

            if (!error) {
                setShowEditModal(false);
                setSelectedItem(null);
                fetchItems();
            } else {
                console.error('Error updating item:', error);
            }
        } catch (error) {
            console.error('Error updating item:', error);
        } finally {
            setTranslating(false);
        }
    };

    const openEditModal = (item: any) => {
        setSelectedItem(item);
        setFormData({
            title: item.title || '',
            description: item.description || '',
            sourceLang: 'sq',
            type: item.type || 'news',
            date: item.date ? new Date(item.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            start_date: item.start_date ? new Date(item.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            end_date: item.end_date ? new Date(item.end_date).toISOString().split('T')[0] : ''
        });
        setShowEditModal(true);
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
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button
                                    onClick={() => openEditModal(item)}
                                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                                >
                                    <Edit2 size={16} />
                                </button>
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
                    {activeTab === 'news' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Photos (Max 3)</label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handlePhotoSelect}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                            />
                            {photoPreviewUrls.length > 0 && (
                                <div className="mt-3 grid grid-cols-3 gap-2">
                                    {photoPreviewUrls.map((url, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={url}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-lg border border-slate-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'events' ? (
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
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">End Date (Optional)</label>
                                <input
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                />
                            </div>
                        </>
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

            {/* Edit Modal */}
            <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedItem(null); }} title={`Edit ${activeTab === 'news' ? 'News' : 'Event'}`}>
                <form onSubmit={handleEdit} className="space-y-4">
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
                    {activeTab === 'events' ? (
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
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">End Date (Optional)</label>
                                <input
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                />
                            </div>
                        </>
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
                        {translating ? 'Updating...' : 'Update'}
                    </button>
                </form>
            </Modal>
        </div >
    );
};
