'use client';

interface ToastProps {
  message: string;
  type?: 'error' | 'info';
  onClose: () => void;
}

export default function Toast({ message, type = 'error', onClose }: ToastProps) {
  return (
    <div
      role="alert"
      className={`fixed bottom-5 right-4 left-4 sm:left-auto z-[200] flex items-start gap-3 rounded-xl px-4 py-3 shadow-2xl max-w-sm sm:max-w-xs mx-auto sm:mx-0 border animate-fade-in-up ${
        type === 'error'
          ? 'bg-[#0d1b1e] border-red-500/40'
          : 'bg-[#0d1b1e] border-[#00d4ff]/40'
      }`}
    >
      {type === 'error' ? (
        <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg className="w-4 h-4 text-[#00d4ff] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 102 0v-5a1 1 0 10-2 0v5z"
            clipRule="evenodd"
          />
        </svg>
      )}
      <p className="text-white text-sm flex-1 leading-snug">{message}</p>
      <button
        onClick={onClose}
        aria-label="Dismiss"
        className="text-gray-500 hover:text-white transition-colors flex-shrink-0 mt-0.5"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
