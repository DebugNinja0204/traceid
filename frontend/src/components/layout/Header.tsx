import React from 'react';
import { Bot, PlusCircle, Activity, Server, Scale, Search } from 'lucide-react';
import { Button } from '../ui/Button';

export interface HeaderProps {
  currentView: 'landing' | 'workspace' | 'components';
  breadcrumb?: string;
  onNavigate: (view: 'landing' | 'workspace' | 'components') => void;
  onOpenCopilot: () => void;
  onOpenCreateModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  breadcrumb,
  onOpenCopilot,
  onOpenCreateModal,
}) => {
  const viewLabel = currentView === 'landing' ? 'Overview' : currentView === 'workspace' ? 'Workspace' : 'Components';

  return (
    <header
      style={{
        height: '52px',
        background: 'rgba(7, 11, 9, 0.92)',
        borderBottom: '1px solid rgba(57, 255, 136, 0.06)',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        flexShrink: 0,
      }}
    >
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#6B8F76', fontFamily: 'var(--font-mono)' }}>
        <span>TRACEID</span>
        <span style={{ color: '#3D5E47' }}>/</span>
        <span style={{ color: '#A8C4B0', fontWeight: 600 }}>{viewLabel}</span>
        {breadcrumb && (
          <>
            <span style={{ color: '#3D5E47' }}>/</span>
            <span style={{ color: '#E8F5EC', fontWeight: 600 }}>{breadcrumb}</span>
          </>
        )}
      </div>

      {/* Center: Search */}
      <button
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          background: 'rgba(13, 21, 16, 0.8)',
          border: '1px solid rgba(57, 255, 136, 0.08)',
          borderRadius: '8px',
          color: '#3D5E47',
          fontSize: '0.78rem',
          fontFamily: 'var(--font-mono)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          minWidth: '200px',
          justifyContent: 'space-between',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(57, 255, 136, 0.16)';
          (e.currentTarget as HTMLButtonElement).style.color = '#6B8F76';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(57, 255, 136, 0.08)';
          (e.currentTarget as HTMLButtonElement).style.color = '#3D5E47';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Search size={13} />
          <span>Search cases...</span>
        </div>
        <span style={{
          fontSize: '0.64rem',
          padding: '1px 5px',
          background: 'rgba(57, 255, 136, 0.05)',
          border: '1px solid rgba(57, 255, 136, 0.1)',
          borderRadius: '4px',
        }}>⌘K</span>
      </button>

      {/* Right: Status + Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* System Status Dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {[
            { icon: <Server size={11} />, label: 'API Online', color: '#39FF88' },
            { icon: <Activity size={11} />, label: 'Safe Sandbox', color: '#38BDF8' },
            { icon: <Scale size={11} />, label: 'Core I9', color: '#FBBF24' },
          ].map((s) => (
            <div
              key={s.label}
              title={s.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.7rem',
                color: s.color,
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
              }}
            >
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: s.color,
                boxShadow: `0 0 6px ${s.color}66`,
                flexShrink: 0,
              }} />
              <span style={{ color: '#6B8F76' }}>{s.label}</span>
            </div>
          ))}
        </div>

        <div style={{ width: '1px', height: '20px', background: 'rgba(57, 255, 136, 0.08)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            variant="ghost"
            size="sm"
            icon={<Bot size={14} color="#39FF88" />}
            onClick={onOpenCopilot}
            style={{ color: '#A8C4B0', fontSize: '0.76rem' }}
          >
            Copilot
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<PlusCircle size={14} />}
            onClick={onOpenCreateModal}
            style={{ fontSize: '0.76rem' }}
          >
            New Case
          </Button>
        </div>

        {/* Avatar */}
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1FA463 0%, #0C3B25 100%)',
          border: '1px solid rgba(57, 255, 136, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.7rem',
          fontWeight: 700,
          color: '#39FF88',
          cursor: 'pointer',
          flexShrink: 0,
        }}>
          H
        </div>
      </div>
    </header>
  );
};