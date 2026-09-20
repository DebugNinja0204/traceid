import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export type CardVariant = 'standard' | 'elevated' | 'glass' | 'interactive' | 'metric' | 'bento';

export interface CardProps extends HTMLMotionProps<'div'> {
  variant?: CardVariant;
  glowColor?: string;
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'standard', glowColor, children, className = '', style, ...props }, ref) => {
    const getVariantStyles = (): React.CSSProperties => {
      switch (variant) {
        case 'elevated':
          return {
            background: 'rgba(13, 21, 16, 0.95)',
            border: '1px solid rgba(57, 255, 136, 0.08)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.35)',
          };
        case 'glass':
          return {
            background: 'rgba(13, 21, 16, 0.75)',
            border: '1px solid rgba(57, 255, 136, 0.06)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
          };
        case 'interactive':
          return {
            background: 'rgba(13, 21, 16, 0.9)',
            border: '1px solid rgba(57, 255, 136, 0.08)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
            cursor: 'pointer',
          };
        case 'metric':
          return {
            background: 'rgba(12, 59, 37, 0.2)',
            border: '1px solid rgba(57, 255, 136, 0.12)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
          };
        case 'bento':
          return {
            background: 'rgba(13, 21, 16, 0.85)',
            border: '1px solid rgba(57, 255, 136, 0.07)',
            boxShadow: '0 6px 28px rgba(0, 0, 0, 0.45)',
            position: 'relative',
            overflow: 'hidden',
          };
        case 'standard':
        default:
          return {
            background: 'rgba(13, 21, 16, 0.92)',
            border: '1px solid rgba(57, 255, 136, 0.06)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4), 0 1px 4px rgba(0, 0, 0, 0.25)',
          };
      }
    };

    const isInteractive = variant === 'interactive';

    return (
      <motion.div
        ref={ref}
        whileHover={
          isInteractive
            ? {
                y: -2,
                borderColor: 'rgba(57, 255, 136, 0.16)',
                boxShadow: glowColor
                  ? `0 12px 36px -4px ${glowColor}`
                  : '0 12px 36px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(57, 255, 136, 0.1)',
              }
            : undefined
        }
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        style={{
          borderRadius: '16px',
          padding: '22px',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
          ...getVariantStyles(),
          ...style,
        }}
        className={`card-component ${className}`}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
Card.displayName = 'Card';