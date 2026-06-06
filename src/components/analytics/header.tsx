import React from 'react';
import { Bell, Plus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';

export function Header() {
  const { user, signOut, userRole } = useAuth();
  const { openAddCustomerModal, openCommandPalette } = useApp();

  const username = user?.email?.split('@')[0] || 'User';
  const initials = username.substring(0, 2).toUpperCase();

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div 
          className="relative cursor-text"
          onClick={openCommandPalette}
        >
          <input
            type="text"
            placeholder="Search or press ⌘K"
            readOnly
            className="w-full px-4 py-2 bg-slate-100 rounded-lg text-sm placeholder-slate-500 focus:outline-none focus:bg-white focus:border border-slate-300 cursor-text pointer-events-none"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-white px-2 py-1 rounded border border-slate-200 pointer-events-none">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 ml-8">
        {/* Notification */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></span>
        </Button>

        {/* Add Client Button */}
        <Button 
          onClick={openAddCustomerModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </Button>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {initials}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={signOut}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="text-sm">
          <p className="font-semibold text-slate-900">{username}</p>
          <p className="text-xs text-slate-500">{userRole === 'admin' ? 'Admin' : 'User'}</p>
        </div>
      </div>
    </header>
  );
}
