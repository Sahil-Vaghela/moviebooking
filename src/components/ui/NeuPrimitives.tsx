import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

type CardVariant = 'cream' | 'white' | 'mint' | 'peach' | 'sage' | 'inset' | 'floating';

const CARD_VARIANT_CLASS: Record<CardVariant, string> = {
  cream: 'neu-card',
  white: 'neu-card-white',
  mint: 'neu-card-mint',
  peach: 'neu-card-peach',
  sage: 'neu-card-sage',
  inset: 'neu-inset',
  floating: 'neu-floating',
};

interface NeuCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children: ReactNode;
}

export function NeuCard({
  variant = 'cream',
  className = '',
  children,
  ...rest
}: NeuCardProps) {
  return (
    <div
      className={`rounded-[26px] ${CARD_VARIANT_CLASS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

type ButtonVariant = 'primary' | 'soft' | 'peach' | 'mint';
type ButtonSize = 'sm' | 'md' | 'lg';

const BUTTON_VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'neu-btn-primary',
  soft: 'neu-btn',
  peach: 'neu-btn-peach',
  mint: 'neu-btn-mint',
};

const BUTTON_SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-xs font-semibold',
  md: 'px-5 py-2.5 text-sm font-semibold',
  lg: 'px-7 py-3.5 text-sm font-semibold',
};

interface NeuButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pill?: boolean;
}

export function NeuButton({
  variant = 'soft',
  size = 'md',
  pill = true,
  className = '',
  children,
  ...rest
}: NeuButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#567360] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5EBDD] ${
        pill ? 'rounded-full' : 'rounded-2xl'
      } ${BUTTON_VARIANT_CLASS[variant]} ${BUTTON_SIZE_CLASS[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function NeuInput({
  className = '',
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`neu-input rounded-2xl px-4 py-2.5 text-sm w-full ${className}`}
      {...rest}
    />
  );
}

export function NeuSelect({
  className = '',
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`neu-input rounded-2xl px-4 py-2.5 text-sm cursor-pointer ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
}
