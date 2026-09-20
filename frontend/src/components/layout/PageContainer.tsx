import React from 'react';

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = '',
  style,
}) => {
  return (
    <div
      style={{
        maxWidth: '1680px',
        margin: '0 auto',
        padding: '24px 28px',
        width: '100%',
        flex: 1,
        ...style,
      }}
      className={`page-container ${className}`}
    >
      {children}
    </div>
  );
};