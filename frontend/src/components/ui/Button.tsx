import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'glass'
  | 'gradient';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children' | 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      loading = false,
      icon,
      iconRight,
      children,
      disabled,
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    const getVariantStyles = (): React.CSSProperties => {
      switch (variant) {
        case 'primary':
          return {
            background: '#39FF88',
            color: '#070B09',
            border: '1px solid rgba(57, 255, 136, 0.4)',
            boxShadow: '0 0 16px rgba(57, 255, 136, 0.18)',
          };
        case 'gradient':
          return {
            background: 'linear-gradient(135deg, #39FF88 0%, #1FA463 100%)',
            color: '#070B09',
            border: '1px solid rgba(57, 255, 136, 0.3)',
            boxShadow: '0 0 20px rgba(57, 255, 136, 0.2)',
          };
        case 'destructive':
          return {
            background: 'rgba(248, 113, 113, 0.08)',
            color: '#F87171',
            border: '1px solid rgba(248, 113, 113, 0.2)',
          };
        case 'outline':
          return {
            background: 'transparent',
            color: '#E8F5EC',
            border: '1px solid rgba(57, 255, 136, 0.2)',
          };
        case 'ghost':
          return {
            background: 'transparent',
            color: '#A8C4B0',
            border: '1px solid transparent',
          };
        case 'glass':
          return {
            background: 'rgba(13, 21, 16, 0.8)',
            color: '#E8F5EC',
            border: '1px solid rgba(57, 255, 136, 0.12)',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
          };
        case 'secondary':
        default:
          return {
            background: 'rgba(13, 21, 16, 0.85)',
            color: '#A8C4B0',
            border: '1px solid rgba(57, 255, 136, 0.1)',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.25)',
          };
      }
    };

    const getSizeStyles = (): React.CSSProperties => {
      switch (size) {
        case 'xs':
          return { padding: '4px 9px', fontSize: '0.72rem', borderRadius: '7px', gap: '4px' };
        case 'sm':
          return { padding: '6px 13px', fontSize: '0.78rem', borderRadius: '9px', gap: '6px' };
        case 'lg':
          return { padding: '12px 24px', fontSize: '0.94rem', borderRadius: '12px', gap: '9px' };
        case 'icon':
          return { width: '36px', height: '36px', padding: '0', borderRadius: '9px', justifyContent: 'center' };
        case 'md':
        default:
          return { padding: '8px 16px', fontSize: '0.84rem', borderRadius: '10px', gap: '7px' };
      }
    };

    const baseStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 600,
      fontFamily: 'var(--font-sans)',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled || loading ? 0.5 : 1,
      transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
      userSelect: 'none',
      whiteSpace: 'nowrap',
      ...getSizeStyles(),
      ...getVariantStyles(),
      ...style,
    };

    return (
      <motion.button
        ref={ref}
        whileTap={disabled || loading ? undefined : { scale: 0.97 }}
        whileHover={
          disabled || loading
            ? undefined
            : {
                filter: variant === 'primary' ? 'brightness(1.08)' : 'brightness(1.05)',
                y: -1,
              }
        }
        disabled={disabled || loading}
        style={baseStyle as any}
        className={`btn-component ${className}`}
        {...(props as any)}
      >
        {loading && <Loader2 className="animate-spin" size={size === 'xs' ? 12 : 14} />}
        {!loading && icon}
        {children}
        {!loading && iconRight}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';