import { Slot } from '@radix-ui/react-slot';
import { TbLoader2 } from 'react-icons/tb';

import { focusRing } from '@/modules/common/styles/interactive';
import { tv, type VariantProps } from '@/modules/common/styles/tv';
import { text } from '@/modules/common/utils/i18n';

import type React from 'react';

const buttonVariants = tv({
  base: [
    'relative inline-flex cursor-pointer items-center justify-center rounded-8 border px-4 py-3 text-center text-sm font-semibold whitespace-nowrap transition-all duration-200 ease-in-out',
    'disabled:pointer-events-none disabled:shadow-none aria-disabled:pointer-events-none',
    focusRing,
  ],
  variants: {
    variant: {
      primary: [
        'border-transparent bg-brand-primary text-content-on-brand',
        'hover:bg-brand-primary/85',
        'disabled:bg-background-secondary disabled:text-content-tertiary',
      ],
      secondary: [
        'border-stroke-primary bg-base-white text-content-primary',
        'hover:bg-neutral-50',
        'disabled:bg-background-secondary disabled:text-content-tertiary',
      ],
      light: [
        'border-transparent bg-background-secondary text-content-primary shadow-none',
        'hover:bg-neutral-200/70',
        'disabled:bg-neutral-100 disabled:text-neutral-400',
      ],
      ghost: [
        'border-transparent bg-transparent text-content-primary shadow-none',
        'hover:bg-neutral-100',
        'disabled:bg-background-secondary disabled:text-content-tertiary',
      ],
      outline: [
        'border-stroke-primary bg-transparent text-content-primary shadow-none',
        'hover:bg-neutral-100',
        'disabled:bg-background-secondary disabled:text-content-tertiary',
      ],
      destructive: [
        'border-transparent bg-negative-600 text-content-on-negative',
        'hover:bg-negative-600/85',
        'disabled:bg-negative-300',
      ],
      'destructive-outline': [
        'border-stroke-primary bg-transparent text-content-negative shadow-none',
        'hover:bg-negative-50',
        'disabled:text-content-tertiary disabled:opacity-50',
      ],
      'destructive-ghost': [
        'border-transparent bg-transparent text-content-negative shadow-none',
        'hover:bg-negative-50',
        'disabled:text-content-secondary disabled:opacity-50',
      ],
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});

interface ButtonProps
  extends React.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  /** Render sebagai child (mis. <a>). State loading tidak ditampilkan dalam mode ini. */
  asChild?: boolean;
  isLoading?: boolean;
  /** Teks saat loading; default: children. */
  loadingText?: string;
}

/**
 * Tombol dasar. Default `type="button"`: tombol submit form wajib menulis `type="submit"`.
 * Tombol ikon tanpa teks wajib diberi `aria-label`.
 * `data-testid` diteruskan ke elemen tombol (UI Contract), tidak perlu prop khusus.
 */
function Button({
  asChild = false,
  isLoading = false,
  loadingText,
  className,
  disabled,
  variant,
  type = 'button',
  children,
  ...props
}: ButtonProps): React.JSX.Element {
  const classes = buttonVariants({ variant, class: className });
  const isDisabled = disabled || isLoading;

  if (asChild) {
    // Slot butuh tepat satu child, jadi tidak dibungkus span loading.
    // `disabled` tidak valid untuk <a>; cukup aria-disabled.
    return (
      <Slot
        className={classes}
        aria-disabled={isDisabled || undefined}
        {...props}
      >
        {children}
      </Slot>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? (
        <span className="pointer-events-none flex shrink-0 items-center justify-center gap-1.5">
          <TbLoader2
            className="size-4 shrink-0 animate-spin"
            aria-hidden="true"
          />
          {loadingText ?? (
            <>
              <span className="sr-only">{text('Memuat', 'Loading')}</span>
              {/* Spasi nyata agar accessible name tidak menjadi "MemuatSimpan". */}{' '}
              {children}
            </>
          )}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export { Button, buttonVariants, type ButtonProps };
