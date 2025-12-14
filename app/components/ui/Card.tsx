import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white/10 backdrop-blur-md rounded-2xl p-6 text-white shadow-lg ${className}`}>
      {children}
    </div>
  );
}
