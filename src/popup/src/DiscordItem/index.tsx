import './style.css';
import { DiscordTabWithMetadata } from '../types';
import clsx from 'clsx';

type DiscordItemProps = {
    item: DiscordTabWithMetadata;
    selected: boolean;
    onClick: () => void;
    disabled?: boolean;
};

// @TODO: handle overflow

export function DiscordItem({
    item,
    selected,
    onClick,
    disabled,
}: DiscordItemProps) {
    return (
        <button
            className={clsx(
                'DiscordItem-wrapper',
                selected && 'DiscordItem-wrapper-active'
            )}
            onClick={onClick}
            disabled={disabled}
        >
            <img className="DiscordItem-favicon" src={item.favIconUrl} />
            {`${item.serverName} - ${item.channelName}`}
        </button>
    );
}
