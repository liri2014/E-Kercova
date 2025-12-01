import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { MapPin, Filter, Layers, RefreshCw } from 'lucide-react';

interface ReportLocation {
    id: string;
    lat: number;
    lng: number;
    category: string;
    status: string;
    title: string;
    created_at: string;
}

interface HeatPoint {
    lat: number;
    lng: number;
    intensity: number;
}

const CATEGORY_COLORS: Record<string, string> = {
    road: '#ef4444',
    lighting: '#f59e0b',
    garbage: '#22c55e',
    greenery: '#10b981',
    water: '#3b82f6',
    other: '#8b5cf6',
};

const STATUS_COLORS: Record<string, string> = {
    pending: '#f59e0b',
    in_progress: '#3b82f6',
    resolved: '#22c55e',
};

export const HeatMap: React.FC = () => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [reports, setReports] = useState<ReportLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        category: 'all',
        status: 'all',
        timeRange: '30d',
    });
    const [viewMode, setViewMode] = useState<'heatmap' | 'clusters' | 'points'>('clusters');
    const [mapInstance, setMapInstance] = useState<any>(null);
    const [stats, setStats] = useState({
        total: 0,
        hotspots: 0,
        mostCommon: '',
    });

    useEffect(() => {
        fetchReports();
    }, [filter]);

    useEffect(() => {
        if (reports.length > 0 && mapRef.current) {
            initializeMap();
        }
    }, [reports, viewMode]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const daysBack = filter.timeRange === '7d' ? 7 : filter.timeRange === '30d' ? 30 : 90;
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - daysBack);

            let query = supabase
                .from('reports')
                .select('id, lat, lng, category, status, title, created_at')
                .gte('created_at', startDate.toISOString())
                .not('lat', 'is', null)
                .not('lng', 'is', null);

            if (filter.category !== 'all') {
                query = query.eq('category', filter.category);
            }
            if (filter.status !== 'all') {
                query = query.eq('status', filter.status);
            }

            const { data, error } = await query;

            if (error) throw error;

            setReports(data || []);

            // Calculate stats
            const categoryCounts: Record<string, number> = {};
            data?.forEach(r => {
                categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
            });
            const mostCommon = Object.entries(categoryCounts)
                .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

            setStats({
                total: data?.length || 0,
                hotspots: calculateHotspots(data || []),
                mostCommon,
            });

        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateHotspots = (data: ReportLocation[]): number => {
        // Simple hotspot detection - grid-based clustering
        const gridSize = 0.01; // ~1km grid
        const grid: Record<string, number> = {};

        data.forEach(r => {
            const key = `${Math.floor(r.lat / gridSize)},${Math.floor(r.lng / gridSize)}`;
            grid[key] = (grid[key] || 0) + 1;
        });

        // Count cells with more than 3 reports as hotspots
        return Object.values(grid).filter(count => count >= 3).length;
    };

    const initializeMap = async () => {
        if (!mapRef.current || !window.L) return;

        // Clear existing map
        if (mapInstance) {
            mapInstance.remove();
        }

        // Center on Kicevo, Macedonia (or use first report location)
        const center = reports.length > 0
            ? [reports[0].lat, reports[0].lng]
            : [41.5128, 20.9589];

        const map = window.L.map(mapRef.current).setView(center as [number, number], 13);

        // Add tile layer
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add markers based on view mode
        if (viewMode === 'points') {
            reports.forEach(report => {
                const color = filter.category !== 'all' 
                    ? CATEGORY_COLORS[report.category] 
                    : STATUS_COLORS[report.status] || '#6366f1';

                window.L.circleMarker([report.lat, report.lng], {
                    radius: 8,
                    fillColor: color,
                    color: '#fff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.8,
                }).bindPopup(`
                    <strong>${report.title}</strong><br/>
                    <span style="color: ${color}">${report.category}</span> • ${report.status}<br/>
                    <small>${new Date(report.created_at).toLocaleDateString()}</small>
                `).addTo(map);
            });
        } else if (viewMode === 'clusters') {
            // Simple clustering by grid
            const gridSize = 0.005;
            const clusters: Record<string, ReportLocation[]> = {};

            reports.forEach(r => {
                const key = `${Math.floor(r.lat / gridSize) * gridSize},${Math.floor(r.lng / gridSize) * gridSize}`;
                if (!clusters[key]) clusters[key] = [];
                clusters[key].push(r);
            });

            Object.entries(clusters).forEach(([key, clusterReports]) => {
                const [lat, lng] = key.split(',').map(Number);
                const avgLat = clusterReports.reduce((sum, r) => sum + r.lat, 0) / clusterReports.length;
                const avgLng = clusterReports.reduce((sum, r) => sum + r.lng, 0) / clusterReports.length;

                const size = Math.min(40, 15 + clusterReports.length * 3);
                const color = clusterReports.length >= 5 ? '#ef4444' : clusterReports.length >= 3 ? '#f59e0b' : '#6366f1';

                const marker = window.L.divIcon({
                    className: 'cluster-marker',
                    html: `<div style="
                        width: ${size}px;
                        height: ${size}px;
                        background: ${color};
                        border: 3px solid white;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: bold;
                        font-size: ${size > 25 ? 14 : 12}px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    ">${clusterReports.length}</div>`,
                    iconSize: [size, size],
                    iconAnchor: [size / 2, size / 2],
                });

                window.L.marker([avgLat, avgLng], { icon: marker })
                    .bindPopup(`
                        <strong>${clusterReports.length} Reports</strong><br/>
                        ${clusterReports.slice(0, 3).map(r => `• ${r.title}`).join('<br/>')}
                        ${clusterReports.length > 3 ? `<br/><em>+${clusterReports.length - 3} more</em>` : ''}
                    `)
                    .addTo(map);
            });
        } else if (viewMode === 'heatmap') {
            // Heatmap visualization using gradient circles
            const gridSize = 0.003;
            const heatGrid: Record<string, number> = {};

            reports.forEach(r => {
                const key = `${Math.floor(r.lat / gridSize) * gridSize},${Math.floor(r.lng / gridSize) * gridSize}`;
                heatGrid[key] = (heatGrid[key] || 0) + 1;
            });

            const maxCount = Math.max(...Object.values(heatGrid));

            Object.entries(heatGrid).forEach(([key, count]) => {
                const [lat, lng] = key.split(',').map(Number);
                const intensity = count / maxCount;
                const radius = 200 + intensity * 300;

                // Gradient from green (low) to red (high)
                const hue = (1 - intensity) * 120;
                const color = `hsl(${hue}, 100%, 50%)`;

                window.L.circle([lat + gridSize / 2, lng + gridSize / 2], {
                    radius,
                    fillColor: color,
                    fillOpacity: 0.4 + intensity * 0.3,
                    stroke: false,
                }).addTo(map);
            });

            // Add points on top
            reports.forEach(report => {
                window.L.circleMarker([report.lat, report.lng], {
                    radius: 4,
                    fillColor: '#1e293b',
                    color: '#fff',
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8,
                }).addTo(map);
            });
        }

        // Fit bounds to show all reports
        if (reports.length > 0) {
            const bounds = window.L.latLngBounds(reports.map(r => [r.lat, r.lng]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }

        setMapInstance(map);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Problem Heat Map</h1>
                    <p className="text-slate-500 mt-1">Visualize issue hotspots across the city</p>
                </div>
                <button
                    onClick={fetchReports}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Total Reports</p>
                            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                            <Layers size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Hotspot Areas</p>
                            <p className="text-2xl font-bold text-slate-900">{stats.hotspots}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
                            <Filter size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Most Common</p>
                            <p className="text-2xl font-bold text-slate-900 capitalize">{stats.mostCommon}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Time Range */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">Time:</span>
                        <div className="flex gap-1">
                            {(['7d', '30d', '90d'] as const).map(range => (
                                <button
                                    key={range}
                                    onClick={() => setFilter({ ...filter, timeRange: range })}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                        filter.timeRange === range
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="w-px h-6 bg-slate-200" />

                    {/* Category Filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">Category:</span>
                        <select
                            value={filter.category}
                            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                            className="px-3 py-1.5 rounded-lg text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">All Categories</option>
                            <option value="road">Roads & Sidewalks</option>
                            <option value="lighting">Street Lighting</option>
                            <option value="garbage">Waste Management</option>
                            <option value="greenery">Parks & Greenery</option>
                            <option value="water">Water & Sewage</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">Status:</span>
                        <select
                            value={filter.status}
                            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                            className="px-3 py-1.5 rounded-lg text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                        </select>
                    </div>

                    <div className="w-px h-6 bg-slate-200" />

                    {/* View Mode */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">View:</span>
                        <div className="flex gap-1">
                            {(['clusters', 'heatmap', 'points'] as const).map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                                        viewMode === mode
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="h-[600px] flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div ref={mapRef} className="h-[600px] w-full" />
                )}
            </div>

            {/* Legend */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <h3 className="font-semibold text-slate-900 mb-3">Legend</h3>
                <div className="flex flex-wrap gap-6">
                    {viewMode === 'clusters' && (
                        <>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-indigo-600" />
                                <span className="text-sm text-slate-600">1-2 reports</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-amber-500" />
                                <span className="text-sm text-slate-600">3-4 reports</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-red-500" />
                                <span className="text-sm text-slate-600">5+ reports (hotspot)</span>
                            </div>
                        </>
                    )}
                    {viewMode === 'heatmap' && (
                        <>
                            <div className="flex items-center gap-2">
                                <div className="w-16 h-4 rounded bg-gradient-to-r from-green-500 via-yellow-500 to-red-500" />
                                <span className="text-sm text-slate-600">Low → High density</span>
                            </div>
                        </>
                    )}
                    {viewMode === 'points' && (
                        <>
                            {Object.entries(filter.category !== 'all' ? CATEGORY_COLORS : STATUS_COLORS).map(([key, color]) => (
                                <div key={key} className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                                    <span className="text-sm text-slate-600 capitalize">{key.replace('_', ' ')}</span>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// Add Leaflet types declaration
declare global {
    interface Window {
        L: any;
    }
}

