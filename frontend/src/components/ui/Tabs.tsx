import React from 'react';
import { motion } from 'framer-motion';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
  style,
}) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px',
        background: 'rgba(6, 10, 8, 0.8)',
        border: '1px solid rgba(57, 255, 136, 0.08)',
        borderRadius: '12px',
        padding: '4px',
        overflowX: 'auto',
        maxWidth: '100%',
        ...style,
      }}
      className={`tabs-container ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            role="tab"
            aria-selected={isActive}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '7px 14px',
              fontSize: '0.81rem',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#E8F5EC' : '#6B8F76',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              borderRadius: '9px',
              transition: 'color 0.15s ease',
              fontFamily: 'var(--font-sans)',
              zIndex: 1,
            }}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabPill"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(57, 255, 136, 0.08)',
                  border: '1px solid rgba(57, 255, 136, 0.15)',
                  borderRadius: '9px',
                  zIndex: -1,
                }}
              />
            )}
            {tab.icon && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: isActive ? '#39FF88' : '#6B8F76',
                }}
              >
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                style={{
                  fontSize: '0.68rem',
                  padding: '1px 6px',
                  borderRadius: '6px',
                  background: isActive ? 'rgba(57, 255, 136, 0.12)' : 'rgba(57, 255, 136, 0.04)',
                  color: isActive ? '#39FF88' : '#6B8F76',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};