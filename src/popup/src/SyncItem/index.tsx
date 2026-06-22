import { SyncItem as SyncItemType } from '../types';

type SyncItemProps = {
    data: SyncItemType;
    onClick: () => void;
};

export function SyncItem({ data, onClick }: SyncItemProps) {
    return (
        <button
            className="-mx-4 w-[calc(100%+2rem)] flex items-center p-4 text-left cursor-pointer hover:bg-[rgba(255,255,255,0.1)]"
            onClick={onClick}
        >
            <div className="flex-1">
                <img
                    className="w-30 h-17 rounded-xs"
                    src={data.youtubeTab.thumbnail || ''}
                />
            </div>
            <div className="flex-1 flex items-center h-full">
                <img className="w-4 mr-2" src={data.discordTab.favIconUrl} />
                <span>{data.discordTab.channelName}</span>
            </div>
        </button>
    );
}
