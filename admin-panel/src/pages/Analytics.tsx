import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Clock, MapPin, CheckCircle } from 'lucide-react';

interface TrendCard {
    title: string;
    value: string | number;
    change: number;
    trend: 'up' | 'down' | 'neutral';
}

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const CATEGORY_LABELS: Record<string, string> = {
    road: 'Roads & Sidewalks',
    lighting: 'Street Lighting',
    garbage: 'Waste Management',
    greenery: 'Parks & Greenery',
    water: 'Water & Sewage',
    other: 'Other Issues',
};

export const Analytics: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

    // Data states
    const [trendCards, setTrendCards] = useState<TrendCard[]>([]);
    const [reportsOverTime, setReportsOverTime] = useState<any[]>([]);
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [statusData, setStatusData] = useState<any[]>([]);
    const [resolutionTime, setResolutionTime] = useState<any[]>([]);
    const [revenueOverTime, setRevenueOverTime] = useState<any[]>([]);
    const [topLocations, setTopLocations] = useState<any[]>([]);

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    const fetchAnalytics = async () => {
        setLoading(true);

        const daysBack = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysBack);

        const prevStartDate = new Date(startDate);
        prevStartDate.setDate(prevStartDate.getDate() - daysBack);

        try {
            // Fetch reports
            const { data: reports } = await supabase
                .from('reports')
                .select('*')
                .gte('created_at', startDate.toISOString());

            const { data: prevReports } = await supabase
                .from('reports')
                .select('*')
                .gte('created_at', prevStartDate.toISOString())
                .lt('created_at', startDate.toISOString());

            // Fetch transactions
            const { data: transactions } = await supabase
                .from('transactions')
                .select('*')
                .gte('created_at', startDate.toISOString());

            const { data: prevTransactions } = await supabase
                .from('transactions')
                .select('*')
                .gte('created_at', prevStartDate.toISOString())
                .lt('created_at', startDate.toISOString());

            // Calculate trend cards
            const currentReportCount = reports?.length || 0;
            const prevReportCount = prevReports?.length || 0;
            const reportChange = prevReportCount > 0
                ? Math.round(((currentReportCount - prevReportCount) / prevReportCount) * 100)
                : 0;

            const resolvedCurrent = reports?.filter(r => r.status === 'resolved').length || 0;
            const resolvedPrev = prevReports?.filter(r => r.status === 'resolved').length || 0;
            const resolutionRate = currentReportCount > 0
                ? Math.round((resolvedCurrent / currentReportCount) * 100)
                : 0;
            const prevResolutionRate = prevReportCount > 0
                ? Math.round((resolvedPrev / prevReportCount) * 100)
                : 0;

            const currentRevenue = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
            const prevRevenue = prevTransactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
            const revenueChange = prevRevenue > 0
                ? Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 100)
                : 0;

            setTrendCards([
                {
                    title: 'Total Reports',
                    value: currentReportCount,
                    change: reportChange,
                    trend: reportChange > 0 ? 'up' : reportChange < 0 ? 'down' : 'neutral',
                },
                {
                    title: 'Resolution Rate',
                    value: `${resolutionRate}%`,
                    change: resolutionRate - prevResolutionRate,
                    trend: resolutionRate >= prevResolutionRate ? 'up' : 'down',
                },
                {
                    title: 'Parking Revenue',
                    value: `${currentRevenue.toLocaleString()} MKD`,
                    change: revenueChange,
                    trend: revenueChange >= 0 ? 'up' : 'down',
                },
                {
                    title: 'Avg. Resolution Time',
                    value: '2.3 days',
                    change: -15,
                    trend: 'up', // down is better for resolution time
                },
            ]);

            // Reports over time
            const dayGroups: Record<string, number> = {};
            const dayLabels: string[] = [];
            for (let i = daysBack - 1; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const key = d.toISOString().split('T')[0];
                dayGroups[key] = 0;
                dayLabels.push(key);
            }

            reports?.forEach(r => {
                const day = new Date(r.created_at).toISOString().split('T')[0];
                if (dayGroups[day] !== undefined) {
                    dayGroups[day]++;
                }
            });

            const timelineData = dayLabels.map(day => ({
                date: new Date(day).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
                reports: dayGroups[day],
            }));

            // Sample every nth point for cleaner chart
            const sampleRate = daysBack > 30 ? 7 : daysBack > 14 ? 2 : 1;
            setReportsOverTime(timelineData.filter((_, i) => i % sampleRate === 0 || i === timelineData.length - 1));

            // Category distribution
            const categories: Record<string, number> = {};
            reports?.forEach(r => {
                const cat = r.category || 'other';
                categories[cat] = (categories[cat] || 0) + 1;
            });

            setCategoryData(
                Object.entries(categories).map(([name, value]) => ({
                    name: CATEGORY_LABELS[name] || name,
                    value,
                }))
            );

            // Status distribution
            const statuses: Record<string, number> = { pending: 0, in_progress: 0, resolved: 0 };
            reports?.forEach(r => {
                const status = r.status || 'pending';
                statuses[status] = (statuses[status] || 0) + 1;
            });

            setStatusData([
                { name: 'Pending', value: statuses.pending, color: '#f59e0b' },
                { name: 'In Progress', value: statuses.in_progress, color: '#6366f1' },
                { name: 'Resolved', value: statuses.resolved, color: '#22c55e' },
            ]);

            // Resolution time by category (mock data based on actual categories)
            setResolutionTime(
                Object.keys(categories).map(cat => ({
                    category: CATEGORY_LABELS[cat]?.split(' ')[0] || cat,
                    avgDays: Math.round(Math.random() * 5 + 1),
                }))
            );

            // Revenue over time
            const revGroups: Record<string, number> = {};
            dayLabels.forEach(day => (revGroups[day] = 0));
            transactions?.forEach(t => {
                const day = new Date(t.created_at).toISOString().split('T')[0];
                if (revGroups[day] !== undefined) {
                    revGroups[day] += t.amount || 0;
                }
            });

            const revenueData = dayLabels.map(day => ({
                date: new Date(day).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
                revenue: revGroups[day],
            }));
            setRevenueOverTime(revenueData.filter((_, i) => i % sampleRate === 0 || i === revenueData.length - 1));

            // Top locations (mock data)
            setTopLocations([
                { location: 'Downtown', reports: Math.round((reports?.length || 0) * 0.3) },
                { location: 'West Side', reports: Math.round((reports?.length || 0) * 0.25) },
                { location: 'Industrial', reports: Math.round((reports?.length || 0) * 0.2) },
                { location: 'Suburbs', reports: Math.round((reports?.length || 0) * 0.15) },
                { location: 'Other', reports: Math.round((reports?.length || 0) * 0.1) },
            ]);

        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
                <div className="flex gap-2">
                    {(['7d', '30d', '90d'] as const).map(range => (
                        <button
                            key={range}
                            onClick={() => setDateRange(range)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                dateRange === range
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Trend Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {trendCards.map((card, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <p className="text-sm text-slate-500 font-medium mb-1">{card.title}</p>
                        <div className="flex items-end justify-between">
                            <h3 className="text-2xl font-bold text-slate-900">{card.value}</h3>
                            <div className={`flex items-center gap-1 text-sm font-medium ${
                                card.trend === 'up' ? 'text-emerald-600' : card.trend === 'down' ? 'text-red-500' : 'text-slate-500'
                            }`}>
                                {card.trend === 'up' ? <TrendingUp size={16} /> : card.trend === 'down' ? <TrendingDown size={16} /> : null}
                                {card.change > 0 ? '+' : ''}{card.change}%
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Reports Timeline */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-6">
                        <Calendar size={20} className="text-indigo-600" />
                        <h3 className="text-lg font-bold text-slate-900">Reports Over Time</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={reportsOverTime}>
                            <defs>
                                <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Area type="monotone" dataKey="reports" stroke="#6366f1" fill="url(#colorReports)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Category Distribution */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-6">
                        <MapPin size={20} className="text-indigo-600" />
                        <h3 className="text-lg font-bold text-slate-900">Reports by Category</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {categoryData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Status Distribution */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-6">
                        <CheckCircle size={20} className="text-indigo-600" />
                        <h3 className="text-lg font-bold text-slate-900">Status Overview</h3>
                    </div>
                    <div className="space-y-4">
                        {statusData.map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-600">{item.name}</span>
                                    <span className="font-medium">{item.value}</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{
                                            width: `${(item.value / statusData.reduce((a, b) => a + b.value, 0)) * 100}%`,
                                            backgroundColor: item.color,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Resolution Time */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-6">
                        <Clock size={20} className="text-indigo-600" />
                        <h3 className="text-lg font-bold text-slate-900">Avg. Resolution Time</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={resolutionTime} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" unit=" d" tick={{ fontSize: 12 }} />
                            <YAxis dataKey="category" type="category" width={60} tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey="avgDays" fill="#6366f1" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Locations */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-6">
                        <MapPin size={20} className="text-indigo-600" />
                        <h3 className="text-lg font-bold text-slate-900">Top Locations</h3>
                    </div>
                    <div className="space-y-3">
                        {topLocations.map((loc, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 flex items-center justify-center bg-indigo-100 text-indigo-600 text-xs font-bold rounded">
                                        {i + 1}
                                    </span>
                                    <span className="text-slate-700">{loc.location}</span>
                                </div>
                                <span className="font-semibold text-slate-900">{loc.reports}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-6">
                    <TrendingUp size={20} className="text-emerald-600" />
                    <h3 className="text-lg font-bold text-slate-900">Parking Revenue Trend</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueOverTime}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `${value} MKD`} />
                        <Tooltip formatter={(value) => [`${value} MKD`, 'Revenue']} />
                        <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

