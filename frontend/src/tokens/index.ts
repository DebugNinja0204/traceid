/**
 * TRACEID Centralized Design System Tokens
 * Dark Matte Cybersecurity Aesthetic — Neon Green + Dark Matte
 */

export const colors = {
  bg: {
    base: '#070B09',
    subtle: '#0A0F0C',
    surface: '#0D1510',
    card: 'rgba(13, 21, 16, 0.92)',
    cardHover: 'rgba(18, 28, 22, 0.97)',
    glass: 'rgba(13, 21, 16, 0.75)',
    overlay: 'rgba(0, 0, 0, 0.65)',
    sidebar: '#060A08',
    input: 'rgba(13, 21, 16, 0.8)',
  },
  border: {
    subtle: 'rgba(57, 255, 136, 0.06)',
    medium: 'rgba(57, 255, 136, 0.1)',
    strong: 'rgba(57, 255, 136, 0.2)',
    glass: 'rgba(255, 255, 255, 0.05)',
    active: '#39FF88',
  },
  text: {
    primary: '#E8F5EC',
    secondary: '#A8C4B0',
    muted: '#6B8F76',
    subtle: '#3D5E47',
    inverse: '#070B09',
  },
  accent: {
    green: '#39FF88',
    greenSoft: '#8FFFC0',
    greenMuted: '#1FA463',
    greenDark: '#0C3B25',
    glow: 'rgba(57, 255, 136, 0.12)',
    glowStrong: 'rgba(57, 255, 136, 0.22)',
  },
  status: {
    strong: {
      color: '#39FF88',
      bg: 'rgba(57, 255, 136, 0.08)',
      border: 'rgba(57, 255, 136, 0.2)',
      glow: 'rgba(57, 255, 136, 0.12)',
    },
    possible: {
      color: '#38BDF8',
      bg: 'rgba(56, 189, 248, 0.08)',
      border: 'rgba(56, 189, 248, 0.2)',
      glow: 'rgba(56, 189, 248, 0.1)',
    },
    ambiguous: {
      color: '#FBBF24',
      bg: 'rgba(251, 191, 36, 0.08)',
      border: 'rgba(251, 191, 36, 0.2)',
      glow: 'rgba(251, 191, 36, 0.1)',
    },
    insufficient: {
      color: '#6B8F76',
      bg: 'rgba(107, 143, 118, 0.07)',
      border: 'rgba(107, 143, 118, 0.18)',
      glow: 'rgba(107, 143, 118, 0.08)',
    },
    different: {
      color: '#F87171',
      bg: 'rgba(248, 113, 113, 0.08)',
      border: 'rgba(248, 113, 113, 0.2)',
      glow: 'rgba(248, 113, 113, 0.1)',
    },
  },
  tiers: {
    discriminating: {
      color: '#39FF88',
      bg: 'rgba(57, 255, 136, 0.07)',
      border: 'rgba(57, 255, 136, 0.18)',
    },
    corroborating: {
      color: '#38BDF8',
      bg: 'rgba(56, 189, 248, 0.07)',
      border: 'rgba(56, 189, 248, 0.18)',
    },
    weak: {
      color: '#6B8F76',
      bg: 'rgba(107, 143, 118, 0.06)',
      border: 'rgba(107, 143, 118, 0.15)',
    },
  },
};

export const typography = {
  fonts: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', Roboto, sans-serif",
    mono: "'JetBrains Mono', 'SF Mono', ui-monospace, Menlo, Monaco, monospace",
  },
  sizes: {
    display: '2.25rem',
    h1: '1.75rem',
    h2: '1.35rem',
    h3: '1.1rem',
    body: '0.9rem',
    small: '0.8rem',
    caption: '0.72rem',
  },
};

export const springs = {
  snappy: { type: 'spring', stiffness: 450, damping: 32 },
  gentle: { type: 'spring', stiffness: 300, damping: 26 },
  bouncy: { type: 'spring', stiffness: 400, damping: 20 },
};

export const transitions = {
  fast: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
  normal: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
  slow: 'all 0.38s cubic-bezier(0.16, 1, 0.3, 1)',
};