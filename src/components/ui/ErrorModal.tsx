'use client';

import React, { useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  message,
  onClose,
}) => {
  // ESC 키 이벤트 처리
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop - 클릭해도 닫히지 않음 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-0 animate-fade-in"
        style={{
          animation: 'fadeIn 0.3s ease-out forwards'
        }}
      />
      
      {/* Modal */}
      <div 
        className="relative z-10 w-full max-w-md mx-4 transform scale-75 opacity-0"
        style={{
          animation: 'modalAppear 0.4s ease-out forwards'
        }}
      >
        <div className="bg-white/90 backdrop-blur-lg border border-red-200/50 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  로그인 오류
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-full transition-colors duration-200"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-700 text-center leading-relaxed mb-6">
              {message}
            </p>
            
            {/* Action Button */}
            <div className="flex justify-center">
              <button
                onClick={onClose}
                className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                확인
              </button>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-400/20 to-red-500/20 rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-red-400/20 to-pink-400/20 rounded-full translate-y-12 -translate-x-12" />
        </div>
      </div>
    </div>
  );
};
