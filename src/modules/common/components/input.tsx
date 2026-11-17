import { useState } from 'react';
import { TbEye, TbEyeClosed, TbSearch } from 'react-icons/tb';

import { cx } from '@/modules/common/styles/cx';
import {
  focusInput,
  focusRing,
  hasErrorInput,
} from '@/modules/common/styles/interactive';
import { tv, type VariantProps } from '@/modules/common/styles/tv';
import { text } from '@/modules/common/utils/i18n';

import type React from 'react';

const inputStyles = tv({
  base: [
    'relative block h-11 w-full appearance-none rounded-8 border px-4 py-2 text-sm outline-hidden transition',
    // border
    'border-stroke-primary',
    // teks
    'text-content-primary',
    // placeholder
    'placeholder-content-tertiary',
    // latar
    'bg-base-white',
    // disabled
    'disabled:border-neutral-300 disabled:bg-neutral-100 disabled:text-content-tertiary',
    // input file
    [
      'file:-my-2 file:-ml-2.5 file:cursor-pointer file:rounded-l-4 file:rounded-r-none file:border-0 file:px-3 file:py-2 file:outline-hidden focus:outline-hidden disabled:pointer-events-none file:disabled:pointer-events-none',
      'file:border-solid file:border-neutral-300 file:bg-neutral-50 file:text-neutral-500 file:hover:bg-neutral-100',
      'file:[border-inline-end-width:1px] file:me-3',
      'file:disabled:bg-neutral-100 file:disabled:text-neutral-500',
    ],
    // fokus
    focusInput,
    '[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden',
  ],
  variants: {
    hasError: {
      true: hasErrorInput,
    },
    // input angka: sembunyikan spinner bawaan bila tidak dipakai
    enableStepper: {
      false:
        '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
    },
  },
});

interface InputProps
  // ComponentProps<'input'> membawa ref (React 19); InputHTMLAttributes tidak.
  extends React.ComponentProps<'input'>, VariantProps<typeof inputStyles> {
  /** Class tambahan untuk elemen <input> di dalam pembungkus. */
  inputClassName?: string;
  /** Elemen di sisi kanan input, mis. tombol atau satuan. */
  rightElement?: React.ReactNode;
}

/**
 * Input dasar. `data-testid` diteruskan ke elemen `<input>` (UI Contract).
 * `aria-invalid` ikut menyala saat `hasError` agar pembaca layar tahu.
 * React 19: `ref` diterima sebagai props biasa, tanpa `forwardRef`.
 */
function Input({
  className,
  inputClassName,
  hasError,
  enableStepper = true,
  type,
  rightElement,
  ref,
  ...props
}: InputProps): React.JSX.Element {
  const [typeState, setTypeState] = useState(type);

  const isPassword = type === 'password';
  const isSearch = type === 'search';

  return (
    <div className={cx('relative w-full', className)}>
      <input
        ref={ref}
        type={isPassword ? typeState : type}
        aria-invalid={hasError || undefined}
        className={cx(
          inputStyles({ hasError, enableStepper }),
          {
            'pl-10': isSearch,
            'pr-10': isPassword || Boolean(rightElement),
          },
          inputClassName,
        )}
        {...props}
      />
      {isSearch && (
        <div className="pointer-events-none absolute bottom-0 left-3 flex h-full items-center justify-center">
          <TbSearch
            className="size-5 shrink-0 text-content-tertiary"
            aria-hidden="true"
          />
        </div>
      )}
      {rightElement && (
        <div className="absolute right-0 bottom-0 flex h-full items-center justify-center px-3">
          {rightElement}
        </div>
      )}
      {isPassword && !rightElement && (
        <div className="absolute right-0 bottom-0 flex h-full items-center justify-center px-3">
          <button
            type="button"
            aria-label={
              typeState === 'password'
                ? text('Tampilkan kata sandi', 'Show password')
                : text('Sembunyikan kata sandi', 'Hide password')
            }
            className={cx(
              'size-fit cursor-pointer rounded-4 outline-hidden transition-all',
              'text-content-primary',
              focusRing,
            )}
            onClick={() => {
              setTypeState(typeState === 'password' ? 'text' : 'password');
            }}
          >
            {typeState === 'password' ? (
              <TbEyeClosed aria-hidden="true" className="size-5 shrink-0" />
            ) : (
              <TbEye aria-hidden="true" className="size-5 shrink-0" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export { Input, inputStyles, type InputProps };
