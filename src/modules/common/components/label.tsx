import { cx } from '@/modules/common/styles/cx';

import type React from 'react';

interface LabelProps extends React.ComponentPropsWithoutRef<'label'> {
  /** Tampilan nonaktif: `aria-disabled` + token teks disabled. */
  disabled?: boolean;
}

/**
 * Label kontrol form. Asosiasikan lewat `htmlFor`/`id`,
 * atau bungkus langsung kontrolnya di dalam label.
 * `data-testid` diteruskan ke elemen `<label>` (UI Contract).
 * React 19: `ref` diterima sebagai props biasa, tanpa `forwardRef`.
 */
function Label({
  className,
  disabled = false,
  ...props
}: LabelProps): React.JSX.Element {
  return (
    // Label generik: asosiasi kontrol disediakan pemakai lewat htmlFor
    // atau pembungkusan, jadi aturan ini nonaktif di primitif ini.
    // eslint-disable-next-line jsx-a11y-x/label-has-associated-control
    <label
      aria-disabled={disabled || undefined}
      className={cx(
        'text-sm font-medium text-content-primary',
        { 'text-content-disabled': disabled },
        className,
      )}
      {...props}
    />
  );
}

export { Label, type LabelProps };
