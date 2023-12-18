import clsx from 'clsx';
import { PropsWithChildren } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

type ButtonProps = {
  variant: ButtonVariant;
  isDisabled?: boolean;
  onClick: () => any;
  className?: string;
};

export default function Button({
  children,
  variant,
  isDisabled,
  onClick,
  className,
}: PropsWithChildren<ButtonProps>) {
  const variantClasses = (variant: ButtonVariant) => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-500 hover:bg-blue-400';
      case 'secondary':
        return 'bg-yellow-500 hover:bg-yellow-400';
      case 'danger':
        return 'bg-red-500 hover:bg-red-400';
    }
  };

  return (
    <button
      onClick={() => onClick()}
      disabled={isDisabled}
      className={clsx(
        variantClasses(variant),
        'text-white rounded block py-2 px-4',
        className && className
      )}
    >
      {children}
    </button>
  );
}
