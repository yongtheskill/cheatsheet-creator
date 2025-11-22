import React from 'react';
import { clsx } from 'clsx';

interface A4PageProps {
  children?: React.ReactNode;
  margin?: number; // in mm
  className?: string;
}

export const A4Page: React.FC<A4PageProps> = ({ children, margin = 5, className }) => {
  return (
    <div
      className={clsx(
        'bg-white shadow-2xl shadow-slate-200/50 mx-auto relative overflow-hidden print:shadow-none print:m-0 print:overflow-visible transition-shadow duration-300',
        className
      )}
      style={{
        width: '297mm',
        height: '210mm',
        padding: `${margin}mm`,
      }}>
      <div className='w-full h-full relative'>{children}</div>
    </div>
  );
};
