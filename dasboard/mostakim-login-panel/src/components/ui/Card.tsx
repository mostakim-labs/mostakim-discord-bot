import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  gradient?: boolean;
  title?: string;
  description?: string;
  actions?: ReactNode;
}

export default function Card({ children, className = '', gradient, title, description, actions }: CardProps) {
  const inner = (
    <div className={`glass rounded-[20px] p-5 ${className}`}>
      {(title || description || actions) && (
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            {title && <h3 className="text-base font-bold text-white">{title}</h3>}
            {description && <p className="text-sm text-white/40 mt-0.5">{description}</p>}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );

  if (gradient) {
    return (
      <div className="grad-border">
        {inner}
      </div>
    );
  }

  return inner;
}
