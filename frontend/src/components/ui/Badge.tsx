import React from 'react';

export type BadgeVariant =
  | 'discriminating'
  | 'corroborating'
  | 'weak'
  | 'verified'
  | 'origin'
  | 'mirror'
  | 'flagged'
  | 'neutral'
  | 'status-strong'
  | 'status-possible'
  | 'status-ambiguous'
  | 'status-insufficient'
  | 'status-different';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  dot = false,
  icon,
  children,
  className = '',
  style,
  ...props
}) => {
  const getBadgeStyle = (): React.CSSProperties => {
    switch (variant) {
      case 'discriminating':
        return {
          background: 'rgba(57, 255, 136, 0.08)',
          color: '#39FF88',
          border: '1px solid rgba(57, 255, 136, 0.2)',
        };
      case 'corroborating':
      case 'status-possible':
        return {
          background: 'rgba(56, 189, 248, 0.08)',
          color: '#38BDF8',
          border: '1px solid rgba(56, 189, 248, 0.2)',
        };
      case 'weak':
      case 'status-insufficient':
        return {
          background: 'rgba(107, 143, 118, 0.07)',
          color: '#6B8F76',
          border: '1px solid rgba(107, 143, 118, 0.18)',
        };
      case 'verified':
      case 'origin':
      case 'status-strong':
        return {
          background: 'rgba(57, 255, 136, 0.07)',
          color: '#8FFFC0',
          border: '1px solid rgba(57, 255, 136, 0.18)',
        };
      case 'mirror':
      case 'status-ambiguous':
        return {
          background: 'rgba(251, 191, 36, 0.07)',
          color: '#FBBF24',
          border: '1px solid rgba(251, 191, 36, 0.2)',
        };
      case 'flagged':
      case 'status-different':
        return {
          background: 'rgba(248, 113, 113, 0.07)',
          color: '#F87171',
          border: '1px solid rgba(248, 113, 113, 0.2)',
        };
      case 'neutral':
      default:
        return {
          background: 'rgba(57, 255, 136, 0.04)',
          color: '#6B8F76',
          border: '1px solid rgba(57, 255, 136, 0.1)',
        };
    }
  };

  const getDotColor = (): string => {
    switch (variant) {
      case 'discriminating': return '#39FF88';
      case 'corroborating':
      case 'status-possible': return '#38BDF8';
      case 'verified':
      case 'origin':
      case 'status-strong': return '#39FF88';
      case 'mirror':
      case 'status-ambiguous': return '#FBBF24';
      case 'flagged':
      case 'status-different': return '#F87171';
      default: return '#6B8F76';
    }
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 9px',
        borderRadius: '7px',
        fontSize: '0.68rem',
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        lineHeight: 1.25,
        ...getBadgeStyle(),
        ...style,
      }}
      className={`badge-component ${className}`}
      {...props}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: getDotColor(),
            flexShrink: 0,
          }}
        />
      )}
      {icon}
      {children}
    </span>
  );
};