import React from 'react';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  size = 'lg',
  style,
  ...props
}) => {
  const maxWidthMap = {
    sm: '768px',
    md: '1024px',
    lg: 'var(--container-max-width)',
    full: '100%',
  };

  return (
    <div
      className={`container ${className}`.trim()}
      style={{
        maxWidth: maxWidthMap[size],
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};
