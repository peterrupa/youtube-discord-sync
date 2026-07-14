import clsx from 'clsx';
import { YouTubeTab } from '../types';

type YouTubeItemProps = {
    tab: YouTubeTab;
    selected: boolean;
    onClick: () => void;
    disabled?: boolean;
};

export function YouTubeItem({
    tab,
    selected,
    onClick,
    disabled,
}: YouTubeItemProps) {
    return (
        <button
            className={clsx(
                'flex -mx-4 px-4 py-2 text-left w-[calc(100%+2rem)]',
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
                        backgroundImage: `url(${tab.metadata.thumbnail})`,
                    }}
                />
            </div>
            <div className="pl-2 min-w-0 overflow-hidden">
                <div className="font-bold mb-1">{tab.metadata.title}</div>
                {tab.metadata.channelTitle && (
                    <div className="text-xs">{tab.metadata.channelTitle}</div>
                )}
            </div>
        </button>
    );
}
