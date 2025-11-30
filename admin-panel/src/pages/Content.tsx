import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Calendar, Newspaper, Trash2, Edit2, Download, Languages } from 'lucide-react';
import { Modal } from '../components/Modal';
import { api } from '../lib/api';

// Content item types are inferred from Supabase responses

export const Content: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'news' | 'events' | 'landmarks'>('news');
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
        end_date: '',
        latitude: '',
        longitude: '',
        category: 'historical'
    });
    const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
    const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
    const [_uploading, setUploading] = useState(false);
    const [translating, setTranslating] = useState(false);
    const [importing, setImporting] = useState(false);
    const [retranslating, setRetranslating] = useState(false);

    const fetchItems = async () => {
        setLoading(true);
        const table = activeTab === 'news' ? 'news' : activeTab === 'events' ? 'events' : 'landmarks';
        const orderBy = activeTab === 'news' ? 'start_date' : activeTab === 'events' ? 'date' : 'created_at';
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .order(orderBy, { ascending: false });
        if (error) console.error(error);
        else setItems(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchItems();
    }, [activeTab]);

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + photoPreviewUrls.length > 3) {
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
        const urlToRemove = photoPreviewUrls[index];

        if (urlToRemove.startsWith('data:')) {
            // It's a new photo. Find its index in selectedPhotos.
            let newPhotoIndex = 0;
            for (let i = 0; i < index; i++) {
                if (photoPreviewUrls[i].startsWith('data:')) {
                    newPhotoIndex++;
                }
            }
            setSelectedPhotos(prev => prev.filter((_, i) => i !== newPhotoIndex));
        }

        setPhotoPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const uploadPhotos = async (): Promise<string[]> => {
        const photoUrls: string[] = [];

        for (const photo of selectedPhotos) {
            const fileName = `news/${Date.now()}_${Math.random().toString(36).substring(7)}_${photo.name}`;
            const { error } = await supabase.storage
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
            // Upload photos first if this is news with photos or landmarks with photo
            let photoUrls: string[] = [];
            let landmarkPhotoUrl = '';

            if (activeTab === 'news' && selectedPhotos.length > 0) {
                photoUrls = await uploadPhotos();
            } else if (activeTab === 'landmarks' && selectedPhotos.length > 0) {
                const urls = await uploadPhotos();
                landmarkPhotoUrl = urls[0] || ''; // Landmarks only need one photo
            }

            const endpoint = activeTab === 'news' ? '/api/news' : activeTab === 'events' ? '/api/events' : '/api/landmarks';

            let payload: any;
            if (activeTab === 'news') {
                payload = {
                    title: formData.title,
                    description: formData.description,
                    type: formData.type,
                    sourceLang: formData.sourceLang,
                    photo_urls: photoUrls
                };
            } else if (activeTab === 'events') {
                payload = {
                    title: formData.title,
                    description: formData.description,
                    date: formData.date,
                    type: formData.type,
                    sourceLang: formData.sourceLang
                };
            } else {
                // landmarks
                payload = {
                    title: formData.title,
                    description: formData.description,
                    latitude: parseFloat(formData.latitude),
                    longitude: parseFloat(formData.longitude),
                    category: formData.category,
                    sourceLang: formData.sourceLang,
                    photo_url: landmarkPhotoUrl
                };
            }

            await api.request(endpoint, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            setShowAddModal(false);
            setFormData({
                title: '',
                description: '',
                sourceLang: 'sq',
                type: 'news',
                date: new Date().toISOString().split('T')[0],
                start_date: new Date().toISOString().split('T')[0],
                end_date: '',
                latitude: '',
                longitude: '',
                category: 'historical'
            });
            setSelectedPhotos([]);
            setPhotoPreviewUrls([]);
            fetchItems();
        } catch (error) {
            console.error('Error adding item:', error);
            alert(`Error: ${error}`);
        } finally {
            setTranslating(false);
            setUploading(false);
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTranslating(true);

        try {
            // 1. Upload new photos
            let newUploadedUrls: string[] = [];
            if (selectedPhotos.length > 0) {
                newUploadedUrls = await uploadPhotos();
            }

            // 2. Construct final list of URLs
            // Take current previews, keep only http ones (existing), and append new uploaded ones
            const currentExistingUrls = photoPreviewUrls.filter(url => !url.startsWith('data:'));
            const finalPhotoUrls = [...currentExistingUrls, ...newUploadedUrls];

            const table = activeTab === 'news' ? 'news' : activeTab === 'events' ? 'events' : 'landmarks';

            let updateData: any;
            if (activeTab === 'news') {
                updateData = {
                    title: formData.title,
                    description: formData.description,
                    type: formData.type,
                    start_date: formData.start_date,
                    end_date: formData.end_date || null,
                    photo_urls: finalPhotoUrls
                };
            } else if (activeTab === 'events') {
                updateData = {
                    title: formData.title,
                    description: formData.description,
                    date: formData.date,
                    type: formData.type
                };
            } else {
                // landmarks
                updateData = {
                    title: formData.title,
                    description: formData.description,
                    latitude: parseFloat(formData.latitude),
                    longitude: parseFloat(formData.longitude),
                    category: formData.category,
                    photo_url: finalPhotoUrls[0] || null
                };
            }

            const { error } = await supabase
                .from(table)
                .update(updateData)
                .eq('id', selectedItem.id);

            if (!error) {
                setShowEditModal(false);
                setSelectedItem(null);
                setSelectedPhotos([]);
                setPhotoPreviewUrls([]);
                fetchItems();
            } else {
                console.error('Error updating item:', error);
                alert(`Error updating: ${error.message}`);
            }
        } catch (error) {
            console.error('Error updating item:', error);
            alert(`Error: ${error}`);
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
            end_date: item.end_date ? new Date(item.end_date).toISOString().split('T')[0] : '',
            latitude: item.latitude?.toString() || '',
            longitude: item.longitude?.toString() || '',
            category: item.category || 'historical'
        });

        // Reset selectedPhotos to empty (new photos will be added separately)
        setSelectedPhotos([]);

        // Populate existing photo URLs for display
        if (item.photo_urls && item.photo_urls.length > 0) {
            setPhotoPreviewUrls(item.photo_urls);
        } else if (item.photo_url) {
            setPhotoPreviewUrls([item.photo_url]);
        } else {
            setPhotoPreviewUrls([]);
        }

        setShowEditModal(true);
    };

    const handleDelete = async (id: string) => {
        try {
            const endpoint = activeTab === 'news' ? '/api/news' : activeTab === 'events' ? '/api/events' : '/api/landmarks';
            await api.request(`${endpoint}/${id}`, {
                method: 'DELETE'
            });
            fetchItems();
        } catch (error) {
            console.error('Error deleting item:', error);
            alert(`Failed to delete: ${error}`);
        }
    };

    const importHolidays = async () => {
        setImporting(true);
        try {
            const year = new Date().getFullYear();
            await api.holidays.import(year);
            alert(`Successfully imported holidays for ${year}`);
            fetchItems();
        } catch (error) {
            console.error('Error importing holidays:', error);
            alert('Failed to import holidays');
        } finally {
            setImporting(false);
        }
    };

    const handleRetranslate = async () => {
        if (!selectedItem) return;
        setRetranslating(true);

        try {
            const endpoint = activeTab === 'news' ? '/api/news' : activeTab === 'events' ? '/api/events' : '/api/landmarks';

            // Get existing photo URLs for news/landmarks
            let photoUrls: string[] = [];
            let landmarkPhotoUrl = '';
            if (activeTab === 'news') {
                photoUrls = photoPreviewUrls.filter(url => !url.startsWith('data:'));
            } else if (activeTab === 'landmarks') {
                landmarkPhotoUrl = photoPreviewUrls.filter(url => !url.startsWith('data:'))[0] || '';
            }

            let payload: any;
            if (activeTab === 'news') {
                payload = {
                    title: formData.title,
                    description: formData.description,
                    type: formData.type,
                    sourceLang: formData.sourceLang,
                    photo_urls: photoUrls,
                    start_date: formData.start_date,
                    end_date: formData.end_date || null
                };
            } else if (activeTab === 'events') {
                payload = {
                    title: formData.title,
                    description: formData.description,
                    date: formData.date,
                    type: formData.type,
                    sourceLang: formData.sourceLang
                };
            } else {
                // landmarks
                payload = {
                    title: formData.title,
                    description: formData.description,
                    latitude: parseFloat(formData.latitude),
                    longitude: parseFloat(formData.longitude),
                    category: formData.category,
                    sourceLang: formData.sourceLang,
                    photo_url: landmarkPhotoUrl
                };
            }

            // Delete old item and create new one with translations
            await api.request(`${endpoint}/${selectedItem.id}`, { method: 'DELETE' });
            await api.request(endpoint, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            setShowEditModal(false);
            setSelectedItem(null);
            setSelectedPhotos([]);
            setPhotoPreviewUrls([]);
            fetchItems();
            alert('Content re-translated successfully!');
        } catch (error) {
            console.error('Error re-translating:', error);
            alert(`Error: ${error}`);
        } finally {
            setRetranslating(false);
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
                        Add {activeTab === 'news' ? 'News' : activeTab === 'events' ? 'Event' : 'Landmark'}
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
                <button
                    onClick={() => setActiveTab('landmarks')}
                    className={`pb-4 px-2 font-medium transition-all ${activeTab === 'landmarks' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Landmarks
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
                                {activeTab === 'news' ? <Newspaper size={24} /> : activeTab === 'events' ? <Calendar size={24} /> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>}
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
                    {activeTab === 'landmarks' ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Photo</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoSelect}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                />
                                {photoPreviewUrls.length > 0 && (
                                    <div className="mt-3">
                                        <img
                                            src={photoPreviewUrls[0]}
                                            alt="Preview"
                                            className="w-full h-48 object-cover rounded-lg border border-slate-200"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
                                    <input
                                        type="number"
                                        step="0.000001"
                                        required
                                        value={formData.latitude}
                                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                        placeholder="41.5128"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
                                    <input
                                        type="number"
                                        step="0.000001"
                                        required
                                        value={formData.longitude}
                                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                        placeholder="20.9574"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                >
                                    <option value="historical">Historical</option>
                                    <option value="religious">Religious</option>
                                    <option value="museum">Museum</option>
                                    <option value="monument">Monument</option>
                                    <option value="nature">Nature</option>
                                    <option value="restaurant">Restaurant</option>
                                </select>
                            </div>
                        </>
                    ) : activeTab === 'events' ? (
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
                    {activeTab !== 'landmarks' && (
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
                    )}
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
            <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedItem(null); }} title={`Edit ${activeTab === 'news' ? 'News' : activeTab === 'events' ? 'Event' : 'Landmark'}`}>
                <form onSubmit={handleEdit} className="space-y-4">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-xs text-amber-700">
                            <strong>Note:</strong> "Update" saves changes without re-translating. Use "Re-translate" to regenerate all language versions.
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Source Language (for re-translation)</label>
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

                    {(activeTab === 'news' || activeTab === 'landmarks') && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Photos {activeTab === 'news' ? '(Max 3)' : ''}</label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple={activeTab === 'news'}
                                onChange={handlePhotoSelect}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                            />
                            {photoPreviewUrls.length > 0 && (
                                <div className={`mt-3 grid ${activeTab === 'news' ? 'grid-cols-3' : 'grid-cols-1'} gap-2`}>
                                    {photoPreviewUrls.map((url, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={url}
                                                alt={`Preview ${index + 1}`}
                                                className={`w-full ${activeTab === 'news' ? 'h-24' : 'h-48'} object-cover rounded-lg border border-slate-200`}
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

                    {activeTab === 'landmarks' ? (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
                                    <input
                                        type="number"
                                        step="0.000001"
                                        required
                                        value={formData.latitude}
                                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
                                    <input
                                        type="number"
                                        step="0.000001"
                                        required
                                        value={formData.longitude}
                                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                >
                                    <option value="historical">Historical</option>
                                    <option value="religious">Religious</option>
                                    <option value="museum">Museum</option>
                                    <option value="monument">Monument</option>
                                    <option value="nature">Nature</option>
                                    <option value="restaurant">Restaurant</option>
                                </select>
                            </div>
                        </>
                    ) : activeTab === 'events' ? (
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

                    {activeTab !== 'landmarks' && (
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
                    )}

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={translating || retranslating}
                            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
                        >
                            {translating ? 'Updating...' : 'Update'}
                        </button>
                        <button
                            type="button"
                            onClick={handleRetranslate}
                            disabled={translating || retranslating}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
                            title="Re-translate content to all languages"
                        >
                            <Languages size={18} />
                            {retranslating ? 'Translating...' : 'Re-translate'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div >
    );
};
