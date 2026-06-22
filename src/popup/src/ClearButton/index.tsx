import { ButtonHTMLAttributes } from 'react';

type ClearButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function ClearButton(props: ClearButtonProps) {
    return (
        <button
            {...props}
            className={'cursor-pointer p-1' + (props.className ?? '')}
        />
    );
}
