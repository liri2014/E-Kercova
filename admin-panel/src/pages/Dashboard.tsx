import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, AlertCircle, Car, Users } from 'lucide-react';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div className={`p-4 rounded-full ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-500 font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        </div>
    </div>
);

export const Dashboard: React.FC = () => {
    const [stats, setStats] = useState({
        totalReports: 0,
        pendingReports: 0,
        parkingRevenue: 0,
        activeUsers: 0
    });
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            // Real data counts
            const { count: totalReports } = await supabase.from('reports').select('*', { count: 'exact', head: true });
            const { count: pendingReports } = await supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending');
            const { count: activeUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

            // Real revenue calculation
            const { data: transactions } = await supabase.from('transactions').select('amount');
            const revenue = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;

            setStats({
                totalReports: totalReports || 0,
                pendingReports: pendingReports || 0,
                parkingRevenue: revenue,
                activeUsers: activeUsers || 0
            });

            // Calculate real chart data from reports in the last 7 days
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

            const { data: recentReports } = await supabase
                .from('reports')
                .select('created_at')
                .gte('created_at', sevenDaysAgo.toISOString());

            // Group reports by day
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const reportsByDay: { [key: string]: number } = {};

            // Initialize all 7 days with 0
            for (let i = 0; i < 7; i++) {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                const dayName = dayNames[date.getDay()];
                reportsByDay[dayName] = 0;
            }

            // Count reports for each day
            recentReports?.forEach(report => {
                const date = new Date(report.created_at);
                const dayName = dayNames[date.getDay()];
                reportsByDay[dayName] = (reportsByDay[dayName] || 0) + 1;
            });

            // Convert to chart format maintaining order
            const chartDataArray = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                const dayName = dayNames[date.getDay()];
                chartDataArray.push({
                    name: dayName,
                    reports: reportsByDay[dayName] || 0
                });
            }

            setChartData(chartDataArray);
        };

        fetchStats();
    }, []);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Reports" value={stats.totalReports} icon={<FileText size={24} />} color="bg-blue-500" />
                <StatCard title="Pending Issues" value={stats.pendingReports} icon={<AlertCircle size={24} />} color="bg-amber-500" />
                <StatCard title="Parking Revenue" value={`${stats.parkingRevenue} MKD`} icon={<Car size={24} />} color="bg-emerald-500" />
                <StatCard title="Active Citizens" value={stats.activeUsers} icon={<Users size={24} />} color="bg-indigo-500" />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Reports Activity</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="reports" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
