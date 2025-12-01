import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../../i18n';
import { Icon, Icons, Card } from '../ui';

interface SearchResult {
    id: string;
    _type: 'news' | 'event' | 'report';
    _title: string;
    _description: string;
    photo_urls?: string[];
    category?: string;
    status?: string;
    date?: string;
    type?: string;
    created_at: string;
}

interface SearchResults {
    all: SearchResult[];
    news: SearchResult[];
    events: SearchResult[];
    reports: SearchResult[];
}

interface SearchViewProps {
    onViewChange: (view: string) => void;
    initialQuery?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'https://e-kicevo-backend.onrender.com';

export const SearchView: React.FC<SearchViewProps> = ({ onViewChange, initialQuery = '' }) => {
    const { t, language } = useTranslation();
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState<SearchResults | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'news' | 'events' | 'reports'>('all');
    const [suggestions, setSuggestions] = useState<Array<{ text: string; type: string }>>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Debounced search
    const search = useCallback(async (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setResults(null);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `${API_URL}/api/search?q=${encodeURIComponent(searchQuery)}&language=${language}`
            );
            const data = await response.json();
            
            if (data.success) {
                setResults(data.results);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    }, [language]);

    // Fetch suggestions
    const fetchSuggestions = useCallback(async (q: string) => {
        if (q.length < 2) {
            setSuggestions([]);
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/api/search/suggestions?q=${encodeURIComponent(q)}&language=${language}`
            );
            const data = await response.json();
            setSuggestions(data.suggestions || []);
        } catch (error) {
            console.error('Suggestions error:', error);
        }
    }, [language]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length >= 2) {
                search(query);
                fetchSuggestions(query);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, search, fetchSuggestions]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowSuggestions(false);
        search(query);
    };

    const selectSuggestion = (text: string) => {
        setQuery(text);
        setShowSuggestions(false);
        search(text);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'news': return Icons.news;
            case 'event': return Icons.calendarDays;
            case 'report': return Icons.report;
            default: return Icons.search;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'news': return 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30';
            case 'event': return 'text-orange-500 bg-orange-100 dark:bg-orange-900/30';
            case 'report': return 'text-rose-500 bg-rose-100 dark:bg-rose-900/30';
            default: return 'text-slate-500 bg-slate-100 dark:bg-slate-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'resolved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'in_progress': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
        }
    };

    const displayResults = results?.[activeTab] || [];
    const counts = results ? {
        all: results.all.length,
        news: results.news.length,
        events: results.events.length,
        reports: results.reports.length
    } : { all: 0, news: 0, events: 0, reports: 0 };

    return (
        <div className="space-y-4">
            {/* Search Header */}
            <div className="flex items-center gap-3 mb-2">
                <button
                    onClick={() => onViewChange('dashboard')}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                >
                    <Icon path={Icons.chevronLeft} size={20} />
                </button>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('search') || 'Search'}</h2>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSubmit} className="relative">
                <div className="relative">
                    <Icon 
                        path={Icons.search} 
                        size={20} 
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" 
                    />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder={t('search_placeholder') || 'Search news, events, reports...'}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {loading && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                        {suggestions.map((suggestion, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => selectSuggestion(suggestion.text)}
                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                            >
                                <Icon 
                                    path={getTypeIcon(suggestion.type)} 
                                    size={16} 
                                    className="text-slate-400" 
                                />
                                <span className="text-slate-700 dark:text-slate-200 truncate">
                                    {suggestion.text}
                                </span>
                                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${getTypeColor(suggestion.type)}`}>
                                    {suggestion.type}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </form>

            {/* Tabs */}
            {results && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                    {(['all', 'news', 'events', 'reports'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                                activeTab === tab
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                        >
                            {t(tab) || tab.charAt(0).toUpperCase() + tab.slice(1)}
                            {counts[tab] > 0 && (
                                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                                    activeTab === tab 
                                        ? 'bg-white/20' 
                                        : 'bg-slate-200 dark:bg-slate-700'
                                }`}>
                                    {counts[tab]}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Results */}
            <div className="space-y-3">
                {displayResults.length > 0 ? (
                    displayResults.map((item) => (
                        <Card 
                            key={`${item._type}-${item.id}`}
                            className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            onClick={() => {
                                if (item._type === 'news') onViewChange('news');
                                else if (item._type === 'event') onViewChange('events');
                                else if (item._type === 'report') onViewChange('community');
                            }}
                        >
                            <div className="flex gap-3">
                                {/* Image */}
                                {item.photo_urls && item.photo_urls.length > 0 && (
                                    <div className="flex-shrink-0">
                                        <img 
                                            src={item.photo_urls[0]} 
                                            alt="" 
                                            className="w-16 h-16 object-cover rounded-xl"
                                        />
                                    </div>
                                )}
                                
                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTypeColor(item._type)}`}>
                                            {item._type === 'news' ? t('news') : 
                                             item._type === 'event' ? t('events') : 
                                             t('report') || 'Report'}
                                        </span>
                                        {item.status && (
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(item.status)}`}>
                                                {item.status}
                                            </span>
                                        )}
                                        {item.category && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                                                {item.category}
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-1">
                                        {item._title}
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                                        {item._description}
                                    </p>
                                    {item.date && (
                                        <p className="text-xs text-indigo-500 mt-1">
                                            📅 {new Date(item.date).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))
                ) : query.length >= 2 && !loading ? (
                    <div className="text-center py-12">
                        <Icon path={Icons.search} size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                        <p className="text-slate-500 dark:text-slate-400">
                            {t('no_results') || 'No results found'}
                        </p>
                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                            {t('try_different_search') || 'Try a different search term'}
                        </p>
                    </div>
                ) : !query && (
                    <div className="text-center py-12">
                        <Icon path={Icons.search} size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                        <p className="text-slate-500 dark:text-slate-400">
                            {t('start_searching') || 'Start typing to search'}
                        </p>
                        <div className="flex flex-wrap justify-center gap-2 mt-4">
                            {['news', 'events', 'road', 'garbage'].map(term => (
                                <button
                                    key={term}
                                    onClick={() => {
                                        setQuery(term);
                                        search(term);
                                    }}
                                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    {term}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

