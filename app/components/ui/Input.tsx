import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export default function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      className={`w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg 
        text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 
        transition-all ${className}`}
      {...props}
    />
  );
}
