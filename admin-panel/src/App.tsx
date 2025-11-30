import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Reports } from './pages/Reports';
import { Content } from './pages/Content';
import { Parking } from './pages/Parking';
import { Users } from './pages/Users';
import { Notifications } from './pages/Notifications';
import { LayoutDashboard, FileText, Calendar, Car, Users as UsersIcon, Bell, LogOut } from 'lucide-react';

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
    const { session, loading } = useAuth();
    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!session) return <Navigate to="/login" />;
    return <div className="pl-64 min-h-screen bg-slate-50"><Sidebar /><main className="p-8">{children}</main></div>;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
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
