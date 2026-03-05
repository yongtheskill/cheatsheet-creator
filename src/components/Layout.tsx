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
      <div
        className={clsx(
          'relative flex-shrink-0 print:hidden transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-0' : 'w-80',
        )}>
        <aside
          className={clsx(
            'h-full bg-white/80 backdrop-blur-md border-r border-slate-200 flex flex-col z-10 transition-all duration-300 ease-in-out shadow-sm',
            isCollapsed ? 'w-0 border-r-0' : 'w-80',
          )}>
          <div
            className={clsx(
              'flex-1 flex flex-col overflow-hidden w-80 transition-opacity duration-200',
              isCollapsed && 'invisible opacity-0',
            )}>
            {sidebar}
          </div>
        </aside>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className='absolute top-1/2 left-full -translate-y-1/2 z-20 rounded-r-full py-2 pl-0.5 pr-1.5 bg-white border border-l-0 border-slate-200 shadow-md hover:bg-slate-50 cursor-pointer text-slate-600'
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}>
          {isCollapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
      <main className='flex-1 overflow-auto p-8 print:p-0 print:overflow-visible scroll-smooth'>
        <div className='min-h-full flex flex-col items-center gap-8 print:block print:gap-0 pb-20'>
          {children}
        </div>
      </main>
    </div>
  );
};
