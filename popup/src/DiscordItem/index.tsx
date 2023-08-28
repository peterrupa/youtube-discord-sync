import './style.css';
import { DiscordTabWithMetadata } from '../types';
import clsx from 'clsx';

type DiscordItemProps = {
    item: DiscordTabWithMetadata;
    selected: boolean;
    onClick: () => void;
};

// @TODO: handle overflow

export function DiscordItem({ item, selected, onClick }: DiscordItemProps) {
    return (
        <button
            className={clsx(
                'DiscordItem-wrapper',
                selected && 'DiscordItem-wrapper-active'
            )}
            onClick={onClick}
        >
            <img className="DiscordItem-favicon" src={item.favIconUrl} />
            {`${item.serverName} - ${item.channelName}`}
        </button>
    );
}
