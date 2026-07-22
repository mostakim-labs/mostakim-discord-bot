interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'red' | 'yellow' | 'blue' | 'violet' | 'gray';
  size?: 'sm' | 'md';
  dot?: boolean;
}

const variants = {
  green:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  red:    'bg-red-500/15 text-red-400 border-red-500/20',
  yellow: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  blue:   'bg-blue-500/15 text-blue-400 border-blue-500/20',
  violet: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  gray:   'bg-white/5 text-white/50 border-white/10',
};

const dots = {
  green:  'bg-emerald-400',
  red:    'bg-red-400',
  yellow: 'bg-yellow-400',
  blue:   'bg-blue-400',
  violet: 'bg-violet-400',
  gray:   'bg-white/50',
};

export default function Badge({ children, variant = 'gray', size = 'sm', dot }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 border rounded-full font-medium ${variants[variant]} ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dots[variant]} animate-pulse`} />}
      {children}
    </span>
  );
}
