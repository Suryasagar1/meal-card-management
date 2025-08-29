import React, { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon } from './Icons';

export interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error';
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 4000);

    return () => {
      clearTimeout(timer);
    };
  }, [id, onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const Icon = type === 'success' ? CheckCircleIcon : XCircleIcon;

  return (
    <div className={`relative flex items-center p-4 mb-4 text-white rounded-lg shadow-lg ${bgColor} animate-fade-in-right`}>
      <Icon className="w-6 h-6 mr-3" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button onClick={() => onClose(id)} className="ml-4 -mr-2 p-1.5 rounded-md hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white">
        <span className="sr-only">Close</span>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
      </button>
    </div>
  );
};

export default Toast;
