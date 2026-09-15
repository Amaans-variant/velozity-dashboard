import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'ghost' | 'subtle' | 'danger';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-accent to-accent-dim text-base-950 font-semibold shadow-glow hover:brightness-110',
  ghost: 'border border-white/12 text-ink-100 hover:bg-white/5',
  subtle: 'text-ink-300 hover:text-ink-100 hover:bg-white/5',
  danger: 'border border-rose-500/30 text-rose-300 hover:bg-rose-500/10',
};

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-ink-100 placeholder:text-ink-500 transition-colors focus:border-accent/50 focus:bg-white/[0.07] focus:outline-none ${props.className || ''}`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-lg border border-white/10 bg-base-850 px-3 py-2.5 text-sm text-ink-100 transition-colors focus:border-accent/50 focus:outline-none ${props.className || ''}`}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-ink-100 placeholder:text-ink-500 transition-colors focus:border-accent/50 focus:bg-white/[0.07] focus:outline-none ${props.className || ''}`}
    />
  );
}
