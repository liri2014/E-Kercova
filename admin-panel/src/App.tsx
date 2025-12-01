import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Reports } from './pages/Reports';
import { Content } from './pages/Content';
import { Parking } from './pages/Parking';
import { Users } from './pages/Users';
import { Notifications } from './pages/Notifications';
import { Analytics } from './pages/Analytics';
import { HeatMap } from './pages/HeatMap';
import { LayoutDashboard, FileText, Calendar, Car, Users as UsersIcon, Bell, BarChart3, Map, LogOut, ShieldAlert } from 'lucide-react';

const Sidebar: React.FC = () => {
    const { signOut } = useAuth();

    return (
        <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                    <LayoutDashboard size={18} />
                </div>
                <span className="font-bold text-lg">E-Kicevo Admin</span>
            </div>

            <nav className="space-y-2 flex-1">
                <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Overview" />
                <NavItem to="/analytics" icon={<BarChart3 size={20} />} label="Analytics" />
                <NavItem to="/heatmap" icon={<Map size={20} />} label="Heat Map" />
                <NavItem to="/reports" icon={<FileText size={20} />} label="Reports" />
                <NavItem to="/content" icon={<Calendar size={20} />} label="News & Events" />
                <NavItem to="/parking" icon={<Car size={20} />} label="Parking" />
                <NavItem to="/users" icon={<UsersIcon size={20} />} label="Users" />
                <NavItem to="/notifications" icon={<Bell size={20} />} label="Notifications" />
            </nav>

            <button onClick={signOut} className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all mt-auto">
                <LogOut size={20} />
                <span className="font-medium">Sign Out</span>
            </button>
        </div>
    );
};

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => (
    <Link to={to} className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
        {icon}
        <span className="font-medium">{label}</span>
    </Link>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { session, loading, user } = useAuth();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [checkingRole, setCheckingRole] = useState(true);

    useEffect(() => {
        const checkAdminRole = async () => {
            if (!user) {
                setCheckingRole(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;
                setIsAdmin(data?.role === 'admin');
            } catch (err) {
                console.error('Error checking admin role:', err);
                setIsAdmin(false);
            } finally {
                setCheckingRole(false);
            }
        };

        if (user) {
            checkAdminRole();
        } else {
            setCheckingRole(false);
        }
    }, [user]);

    if (loading || checkingRole) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Verifying access...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return <Navigate to="/login" />;
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldAlert className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
                    <p className="text-slate-600 mb-6">
                        You don't have admin privileges to access this panel.
                        Please contact the system administrator.
                    </p>
                    <button
                        onClick={() => supabase.auth.signOut()}
                        className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="pl-64 min-h-screen bg-slate-50">
            <Sidebar />
            <main className="p-8">{children}</main>
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                    <Route path="/heatmap" element={<ProtectedRoute><HeatMap /></ProtectedRoute>} />
                    <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                    <Route path="/content" element={<ProtectedRoute><Content /></ProtectedRoute>} />
                    <Route path="/parking" element={<ProtectedRoute><Parking /></ProtectedRoute>} />
                    <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
                    <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
