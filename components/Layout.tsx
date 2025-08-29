
import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PowerIcon, UserCircleIcon } from './Icons';

interface LayoutProps {
  children: ReactNode;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[var(--kiet-dark-bg)] text-gray-900 dark:text-gray-200">
      <header className="bg-white dark:bg-[var(--kiet-dark-card)] shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className='flex items-center gap-4'>
                <div className='p-2 bg-[var(--kiet-primary)] rounded-lg'>
                    <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.5 0l-1.49-1.49L2.25 12l-1.49 1.49L2.25 15l1.49-1.49zM18 19.5l-1.49-1.49L15 21l-1.49-1.49L12 21l-1.49-1.49L9 21l-1.49-1.49L6 21l-1.49-1.49L3 21m15 0l1.49-1.49L21 18l1.49 1.49L24 18l1.49 1.49L27 18" />
                    </svg>
                </div>
                <h1 className="hidden sm:block text-xl font-bold text-gray-800 dark:text-white">{title}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <UserCircleIcon className="h-8 w-8 text-gray-500" />
                <div className="text-right">
                  <p className="font-semibold text-sm">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Logout"
              >
                <PowerIcon className="h-6 w-6 text-red-500" />
              </button>
            </div>
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;