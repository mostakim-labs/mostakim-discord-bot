import { ReactNode } from 'react';

interface PageHeaderProps {
  icon: ReactNode;
  iconBg?: string;
  title: string;
  description: string;
  badge?: ReactNode;
  actions?: ReactNode;
}

export default function PageHeader({ icon, iconBg = 'from-violet-600/20 to-blue-600/20', title, description, badge, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${iconBg} border border-white/10 shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-extrabold text-white">{title}</h1>
          {badge}
        </div>
        <p className="text-white/40 text-sm mt-0.5">{description}</p>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
