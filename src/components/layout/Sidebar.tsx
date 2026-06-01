import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Phone, BarChart3, Users, FileText, Settings, Moon, Sun, LogOut, TrendingUp, Package } from 'lucide-react';
import { cn } from '../../utils';

const Sidebar: React.FC = () => {
    const { signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const navItems = [
        { path: '/', label: 'Dashboard', icon: BarChart3 },
        { path: '/analytics', label: 'Analytics', icon: BarChart3 },
        { path: '/call-mode', label: 'Call Mode', icon: Phone },
        { path: '/clients', label: 'Clients', icon: Users },
        { path: '/products', label: 'Products', icon: Package },
        { path: '/reports', label: 'Reports', icon: FileText },
        { path: '/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <aside className="fixed left-0 top-0 bottom-0 z-50 w-[260px] bg-white dark:bg-slate-900 border-r border-border p-6 flex flex-col transition-all duration-300">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                    <div className="font-bold text-foreground">CRM Pro</div>
                    <div className="text-xs text-muted-foreground">PCD Pharma</div>
                </div>
            </div>

            {/* Performance Section */}
            <div className="mb-8">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    Today's Performance
                </div>
                <div className="space-y-6">
                    <div>
                        <div className="text-sm text-muted-foreground mb-2">Calls Made</div>
                        <div className="flex items-baseline gap-2">
                            <div className="text-3xl font-bold text-foreground">24</div>
                            <div className="text-green-600 text-sm font-semibold">+12%</div>
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground mb-2">Conversion</div>
                        <div className="flex items-baseline gap-2">
                            <div className="text-3xl font-bold text-foreground">18%</div>
                            <div className="text-green-600 text-sm font-semibold">+5%</div>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full mt-3">
                            <div className="w-3/5 h-full bg-green-500 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2 mb-8 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                            isActive ? "bg-green-600 text-white" : "text-foreground hover:bg-muted"
                        )}
                    >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Section */}
            <div className="space-y-2 pt-8 border-t border-border">
                <button 
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                    {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    Theme Mode
                </button>
                <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/10 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;


