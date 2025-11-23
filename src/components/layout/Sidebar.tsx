import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const Sidebar: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const toggleSidebar = () => setIsCollapsed(!isCollapsed);

    const handleSignOut = async () => {
        await signOut();
        className = {`
                        w-full flex items-center px-4 py-3 rounded-xl 
                        text-slate-500 dark:text-slate-400 
                        hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 
                        transition-all duration-300 group
                        ${isCollapsed ? 'justify-center' : ''}
                    `}
    title = "Sign Out"
        >
        <div className={`
                        w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center 
                        group-hover:bg-red-100 dark:group-hover:bg-red-900/30 group-hover:text-red-600 transition-colors
                        ${isCollapsed ? '' : 'mr-3'}
                    `}>
            <i className="fas fa-sign-out-alt"></i>
        </div>
    { !isCollapsed && <span className="font-medium text-sm">Sign Out</span> }
        </button >
    </div >
        </aside >
    );
};

export default Sidebar;

