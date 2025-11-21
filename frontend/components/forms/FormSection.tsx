import { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  titleColor?: string;
  children: ReactNode;
  className?: string;
}

export default function FormSection({ 
  title, 
  titleColor = 'text-sky-aqua', 
  children,
  className = '' 
}: FormSectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className={`text-sm font-bold ${titleColor} uppercase tracking-widest border-b border-white/10 pb-2`}>
        {title}
      </h3>
      {children}
    </div>
  );
}

