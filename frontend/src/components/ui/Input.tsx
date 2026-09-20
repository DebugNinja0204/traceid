import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, icon, className = '', style, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#334155',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {label}
          </label>
        )}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {icon && (
            <span
              style={{
                position: 'absolute',
                left: '12px',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
              }}
            >
              {icon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            style={{
              width: '100%',
              padding: icon ? '10px 14px 10px 38px' : '10px 14px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.88)',
              border: error
                ? '1px solid rgba(225, 29, 72, 0.5)'
                : '1px solid rgba(0, 0, 0, 0.12)',
              color: '#0f172a',
              fontSize: '0.88rem',
              fontFamily: 'var(--font-sans)',
              outline: 'none',
              transition: 'all 0.16s ease',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
              ...style,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = error ? '#e11d48' : '#0284c7';
              e.currentTarget.style.boxShadow = error
                ? '0 0 0 3px rgba(225, 29, 72, 0.15)'
                : '0 0 0 3px rgba(2, 132, 199, 0.15)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = error
                ? 'rgba(225, 29, 72, 0.5)'
                : 'rgba(0, 0, 0, 0.12)';
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.03)';
            }}
            className={`input-component ${className}`}
            {...props}
          />
        </div>
        {error && (
          <span style={{ fontSize: '0.75rem', color: '#e11d48', fontWeight: 500 }}>
            {error}
          </span>
        )}
        {!error && helperText && (
          <span style={{ fontSize: '0.74rem', color: '#64748b' }}>{helperText}</span>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helperText, error, className = '', style, id, rows = 3, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#334155',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          rows={rows}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.88)',
            border: error
              ? '1px solid rgba(225, 29, 72, 0.5)'
              : '1px solid rgba(0, 0, 0, 0.12)',
            color: '#0f172a',
            fontSize: '0.88rem',
            fontFamily: 'var(--font-sans)',
            outline: 'none',
            resize: 'vertical',
            transition: 'all 0.16s ease',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
            ...style,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = error ? '#e11d48' : '#0284c7';
            e.currentTarget.style.boxShadow = error
              ? '0 0 0 3px rgba(225, 29, 72, 0.15)'
              : '0 0 0 3px rgba(2, 132, 199, 0.15)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error
              ? 'rgba(225, 29, 72, 0.5)'
              : 'rgba(0, 0, 0, 0.12)';
            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.03)';
          }}
          className={`textarea-component ${className}`}
          {...props}
        />
        {error && (
          <span style={{ fontSize: '0.75rem', color: '#e11d48', fontWeight: 500 }}>
            {error}
          </span>
        )}
        {!error && helperText && (
          <span style={{ fontSize: '0.74rem', color: '#64748b' }}>{helperText}</span>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';