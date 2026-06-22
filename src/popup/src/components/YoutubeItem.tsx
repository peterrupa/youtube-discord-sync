import clsx from 'clsx';
import { YouTubeMetadata } from '../types';

type YouTubeItemProps = {
    item: YouTubeMetadata;
    selected: boolean;
    onClick: () => void;
    disabled?: boolean;
};

// @TODO: handle overflow
// @TODO: add skeleton state

export function YouTubeItem({
    item,
    selected,
    onClick,
    disabled,
}: YouTubeItemProps) {
    return (
        <button
            className={clsx(
                'flex -mx-4 px-4 py-2 text-left',
                selected && 'bg-green-900!',
                !disabled && 'hover:bg-[rgba(255,255,255,0.1)] cursor-pointer',
                disabled && 'hover:bg-none hover:cursor-default && opacity-50',
            )}
            onClick={onClick}
            disabled={disabled}
        >
            <div>
                <div
                    className={
                        'w-25 h-14 rounded-xs bg-gray-700 bg-cover bg-center'
                    }
                    style={{
                        backgroundImage: `url(${item.thumbnail})`,
                    }}
                />
            </div>
            <div className="pl-2">
                <div className="font-bold mb-1">{item.title}</div>
                {item.channelTitle && (
                    <div className="text-xs">{item.channelTitle}</div>
                )}
            </div>
        </button>
    );
}
