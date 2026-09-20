import React, { useState } from 'react';
import {
  Shield,
  Compass,
  Terminal,
  LayoutGrid,
  UserCheck,
  Network,
  Layers,
  CalendarClock,
  HelpCircle,
  FileText,
  Bot,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Activity,
  Database,
  Settings,
  ScanSearch,
  ChevronDown,
} from 'lucide-react';

export interface SidebarProps {
  currentView: 'landing' | 'workspace' | 'components';
  activeTab?: string;
  recentCases?: Array<{ id: string; title: string }>;
  onNavigate: (view: 'landing' | 'workspace' | 'components') => void;
  onTabChange?: (tab: string) => void;
  onOpenCopilot: () => void;
  onOpenCreateModal: () => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  count?: number;
  collapsed?: boolean;
  onClick: () => void;
}> = ({ icon, label, active, count, collapsed, onClick }) => (
  <button
    onClick={onClick}
    title={collapsed ? label : undefined}
    style={{
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: collapsed ? '9px 0' : '9px 12px',
      justifyContent: collapsed ? 'center' : 'flex-start',
      borderRadius: '8px',
      background: active ? 'rgba(57, 255, 136, 0.07)' : 'transparent',
      border: 'none',
      borderLeft: active && !collapsed ? '2px solid #39FF88' : '2px solid transparent',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
      color: active ? '#39FF88' : '#6B8F76',
      fontSize: '0.82rem',
      fontWeight: active ? 600 : 500,
      fontFamily: 'var(--font-sans)',
      textAlign: 'left',
      marginLeft: active && !collapsed ? '-2px' : '0',
    }}
    onMouseEnter={(e) => {
      if (!active) {
        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(57, 255, 136, 0.04)';
        (e.currentTarget as HTMLButtonElement).style.color = '#A8C4B0';
      }
    }}
    onMouseLeave={(e) => {
      if (!active) {
        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        (e.currentTarget as HTMLButtonElement).style.color = '#6B8F76';
      }
    }}
  >
    <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', width: '16px', height: '16px', color: active ? '#39FF88' : 'inherit' }}>
      {icon}
    </span>
    {!collapsed && (
      <>
        <span style={{ flex: 1, lineHeight: 1 }}>{label}</span>
        {count !== undefined && (
          <span style={{
            fontSize: '0.66rem',
            padding: '1px 5px',
            borderRadius: '5px',
            background: active ? 'rgba(57, 255, 136, 0.15)' : 'rgba(57, 255, 136, 0.04)',
            color: active ? '#39FF88' : '#6B8F76',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
          }}>{count}</span>
        )}
      </>
    )}
  </button>
);

const SectionLabel: React.FC<{ label: string; collapsed?: boolean }> = ({ label, collapsed }) => (
  !collapsed ? (
    <div style={{
      fontSize: '0.62rem',
      fontWeight: 700,
      letterSpacing: '0.1em',
      color: '#3D5E47',
      textTransform: 'uppercase',
      padding: '14px 12px 6px',
      fontFamily: 'var(--font-mono)',
    }}>
      {label}
    </div>
  ) : (
    <div style={{ height: '1px', background: 'rgba(57, 255, 136, 0.06)', margin: '10px 8px' }} />
  )
);

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  activeTab,
  recentCases = [],
  onNavigate,
  onTabChange,
  onOpenCopilot,
  onOpenCreateModal,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [recentExpanded, setRecentExpanded] = useState(true);

  const width = collapsed ? 56 : 232;

  return (
    <aside
      style={{
        width,
        minWidth: width,
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid rgba(57, 255, 136, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 50,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Brand Logo */}
      <div
        style={{
          padding: collapsed ? '18px 0' : '18px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid rgba(57, 255, 136, 0.05)',
          gap: '10px',
          cursor: 'pointer',
        }}
        onClick={() => onNavigate('landing')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              background: 'rgba(57, 255, 136, 0.1)',
              border: '1px solid rgba(57, 255, 136, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#39FF88',
              flexShrink: 0,
            }}
          >
            <Shield size={17} strokeWidth={2.2} />
          </div>
          {!collapsed && (
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: '0.95rem',
                fontWeight: 800,
                color: '#E8F5EC',
                letterSpacing: '-0.01em',
                lineHeight: 1,
              }}>
                TRACEID
              </div>
              <div style={{
                fontSize: '0.6rem',
                color: '#3D5E47',
                fontFamily: 'var(--font-mono)',
                marginTop: '2px',
              }}>
                Identity Intelligence
              </div>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={(e) => { e.stopPropagation(); setCollapsed(true); }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#3D5E47',
              cursor: 'pointer',
              padding: '3px',
              display: 'flex',
              borderRadius: '5px',
            }}
          >
            <ChevronLeft size={14} />
          </button>
        )}
        {collapsed && (
          <button
            onClick={(e) => { e.stopPropagation(); setCollapsed(false); }}
            style={{
              position: 'absolute',
              right: '-10px',
              top: '22px',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#0D1510',
              border: '1px solid rgba(57, 255, 136, 0.15)',
              color: '#6B8F76',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            <ChevronRight size={11} />
          </button>
        )}
      </div>

      {/* Scrollable Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: collapsed ? '8px 4px' : '8px 8px' }}>

        <SectionLabel label="Main" collapsed={collapsed} />
        <NavItem icon={<Compass size={15} />} label="Overview" active={currentView === 'landing'} collapsed={collapsed} onClick={() => onNavigate('landing')} />
        <NavItem icon={<Terminal size={15} />} label="Workspace" active={currentView === 'workspace'} collapsed={collapsed} onClick={() => onNavigate('workspace')} />
        <NavItem icon={<LayoutGrid size={15} />} label="Components" active={currentView === 'components'} collapsed={collapsed} onClick={() => onNavigate('components')} />

        {currentView === 'workspace' && onTabChange && (
          <>
            <SectionLabel label="Intelligence" collapsed={collapsed} />
            <NavItem icon={<UserCheck size={15} />} label="Candidates" active={activeTab === 'matrix'} collapsed={collapsed} onClick={() => onTabChange('matrix')} />
            <NavItem icon={<Network size={15} />} label="Entity Graph" active={activeTab === 'graph'} collapsed={collapsed} onClick={() => onTabChange('graph')} />
            <NavItem icon={<Layers size={15} />} label="Sources" active={activeTab === 'sources'} collapsed={collapsed} onClick={() => onTabChange('sources')} />
            <NavItem icon={<CalendarClock size={15} />} label="Timeline" active={activeTab === 'timeline'} collapsed={collapsed} onClick={() => onTabChange('timeline')} />
            <NavItem icon={<HelpCircle size={15} />} label="Gaps" active={activeTab === 'gaps'} collapsed={collapsed} onClick={() => onTabChange('gaps')} />
            <NavItem icon={<FileText size={15} />} label="Dossier" active={activeTab === 'report'} collapsed={collapsed} onClick={() => onTabChange('report')} />
          </>
        )}

        <SectionLabel label="System" collapsed={collapsed} />
        <NavItem icon={<Bot size={15} />} label="Copilot" collapsed={collapsed} onClick={onOpenCopilot} />
        <NavItem icon={<ScanSearch size={15} />} label="New Case" collapsed={collapsed} onClick={onOpenCreateModal} />
        <NavItem icon={<Activity size={15} />} label="API Status" collapsed={collapsed} onClick={() => {}} />
        <NavItem icon={<Database size={15} />} label="Evidence DB" collapsed={collapsed} onClick={() => {}} />
        <NavItem icon={<Settings size={15} />} label="Settings" collapsed={collapsed} onClick={() => {}} />

        {/* Recent Cases */}
        {!collapsed && recentCases.length > 0 && (
          <>
            <button
              onClick={() => setRecentExpanded(!recentExpanded)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 12px 6px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#3D5E47',
              }}
            >
              <span style={{
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
              }}>Recent Cases</span>
              <ChevronDown
                size={11}
                style={{
                  transform: recentExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                  transition: 'transform 0.15s ease',
                }}
              />
            </button>
            {recentExpanded && recentCases.slice(0, 5).map((c) => (
              <button
                key={c.id}
                onClick={() => onNavigate('workspace')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 12px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6B8F76',
                  fontSize: '0.78rem',
                  textAlign: 'left',
                  borderRadius: '7px',
                  fontFamily: 'var(--font-sans)',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(57, 255, 136, 0.04)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >
                <FolderOpen size={12} style={{ flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.title}
                </span>
              </button>
            ))}
          </>
        )}
      </nav>

      {/* User Profile */}
      <div style={{
        padding: collapsed ? '12px 4px' : '12px 12px',
        borderTop: '1px solid rgba(57, 255, 136, 0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
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
          flexShrink: 0,
        }}>
          H
        </div>
        {!collapsed && (
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#A8C4B0', lineHeight: 1 }}>Harish</div>
            <div style={{ fontSize: '0.66rem', color: '#3D5E47', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>Analyst</div>
          </div>
        )}
      </div>
    </aside>
  );
};
