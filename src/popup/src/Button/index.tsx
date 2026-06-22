import clsx from 'clsx';
import { ButtonHTMLAttributes } from 'react';

export function Button({
    className,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            className={clsx(
                'cursor-pointer py-1 px-2 bg-gray-700 rounded-xs',
                className,
            )}
            {...props}
        />
    );
}
