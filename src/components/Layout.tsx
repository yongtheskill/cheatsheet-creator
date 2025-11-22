import React, { useState } from 'react';
import { ChevronLeft, Menu } from 'lucide-react';
import { clsx } from 'clsx';

interface LayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ sidebar, children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className='flex h-screen w-screen overflow-hidden bg-slate-50 print:bg-white print:h-auto print:w-auto print:block'>
      <aside
        className={clsx(
          'bg-white/80 backdrop-blur-md border-r border-slate-200 flex flex-col print:hidden z-10 transition-all duration-300 ease-in-out relative shadow-sm',
          isCollapsed ? 'w-0 border-r-0' : 'w-80'
        )}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={clsx(
            'absolute top-4 rounded-lg p-2 hover:bg-slate-50 hover:shadow-md z-20 cursor-pointer text-slate-600',
            isCollapsed
              ? 'left-5 border border-gray-200 shadow-md bg-slate-50 hover:bg-slate-100'
              : 'right-5 bg-transparent'
          )}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}>
          {isCollapsed ? <Menu size={18} /> : <ChevronLeft size={20} />}
        </button>

        <div
          className={clsx(
            'flex-1 flex flex-col overflow-hidden w-80 transition-opacity duration-200',
            isCollapsed && 'invisible opacity-0'
          )}>
          {sidebar}
        </div>
      </aside>
      <main className='flex-1 overflow-auto p-8 print:p-0 print:overflow-visible scroll-smooth'>
        <div className='min-h-full flex flex-col items-center gap-8 print:block print:gap-0 pb-20'>
          {children}
        </div>
      </main>
    </div>
  );
};
