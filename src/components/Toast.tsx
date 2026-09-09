import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  id?: string;
  type?: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
  onClose?: () => void;
}

export const Toast = ({ type = 'info', message, duration = 4000, onClose }: ToastProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const bgColors = {
    success: '#DEF7EC',
    error: '#FDE8E8',
    info: '#E1EFFE'
  };

  const textColors = {
    success: '#03543F',
    error: '#9B1C1C',
    info: '#1E429F'
  };

  const borderColors = {
    success: '#31C48D',
    error: '#F98080',
    info: '#76A9FA'
  };

  const icons = {
    success: <CheckCircle2 size={18} color="#0E9F6E" />,
    error: <AlertCircle size={18} color="#E02424" />,
    info: <Info size={18} color="#3F83F8" />
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.85rem 1.25rem',
      backgroundColor: bgColors[type],
      color: textColors[type],
      borderLeft: `4px solid ${borderColors[type]}`,
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      animation: 'slideIn 0.3s ease-out',
      maxWidth: '380px'
    }}>
      {icons[type]}
      <span style={{ fontSize: '0.875rem', fontWeight: 500, flex: 1 }}>{message}</span>
      <button 
        onClick={() => { setVisible(false); if (onClose) onClose(); }}
        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'inherit', padding: '0.2rem' }}
        aria-label="Close"
      >
        <X size={16} />
      </button>
      <style>{`
        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
