import { Button, type ButtonProps } from '@tulipfarm/sprout/button';
import type { ReactNode } from 'react';

export default function LinkButton({
  href,
  download,
  variant,
  children,
}: {
  href: string;
  download?: string;
  variant?: ButtonProps['variant'];
  children: ReactNode;
}) {
  return (
    <Button
      nativeButton={false}
      variant={variant}
      render={
        <a href={href} download={download}>
          {children}
        </a>
      }
    />
  );
}
