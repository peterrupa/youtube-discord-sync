import clsx from 'clsx';
import { DiscordTabWithMetadata } from '../types';

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
                '-mx-4 px-4 py-2 w-[calc(100%+2rem)] text-left text-sm font-bold flex items-center',
                selected && 'bg-green-900!',
                !disabled && 'hover:bg-[rgba(255,255,255,0.1)] cursor-pointer',
                disabled && 'opacity-50',
            )}
            onClick={onClick}
            disabled={disabled}
        >
            <img className="w-4 mr-2" src={item.favIconUrl} />
            {`${item.serverName} - ${item.channelName}`}
        </button>
    );
}
