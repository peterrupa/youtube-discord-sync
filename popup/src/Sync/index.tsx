import { DiscordTabWithMetadata, YouTubeTabWithMetadata } from '../types';

type SyncProps = {
    youtubeTab: YouTubeTabWithMetadata;
    discordTab: DiscordTabWithMetadata;
    onCancel: () => void;
};

export function Sync({ youtubeTab, discordTab, onCancel }: SyncProps) {
    return (
        <div>
            <button onClick={onCancel}>Cancel</button>
            <div>{youtubeTab.title}</div>
            <div>{discordTab.channelName}</div>
        </div>
    );
}
