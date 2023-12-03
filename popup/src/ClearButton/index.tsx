import { ButtonHTMLAttributes } from 'react';

import './style.css';

type ClearButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function ClearButton(props: ClearButtonProps) {
    return (
        <button
            {...props}
            className={'clear-button ' + (props.className ?? '')}
        />
    );
}
