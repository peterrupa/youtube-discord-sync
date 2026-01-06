import { SyncItem as SyncItemType } from '../types';

import './style.css';

type SyncItemProps = {
    data: SyncItemType;
    onClick: () => void;
};

export function SyncItem({ data, onClick }: SyncItemProps) {
    return (
        <button className="sync-item-container" onClick={onClick}>
            <div>
                <div
                    className="sync-item-thumbnail"
                    style={{
                        backgroundImage: `url(${data.youtubeTab.thumbnail})`,
                    }}
                ></div>
            </div>
            <div className="sync-item-discord-container">
                <img
                    className="DiscordItem-favicon"
                    src={data.discordTab.favIconUrl}
                />
                <span>{data.discordTab.channelName}</span>
            </div>
        </button>
    );
}
