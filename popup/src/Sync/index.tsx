import { DiscordTabWithMetadata, YouTubeTabWithMetadata } from '../types';

type SyncProps = {
    youtubeTab: YouTubeTabWithMetadata;
    discordTab: DiscordTabWithMetadata;
    isPaused: boolean;
    onPause: () => void;
    onResume: () => void;
    onCancel: () => void;
};

export function Sync({
    youtubeTab,
    discordTab,
    isPaused,
    onPause,
    onResume,
    onCancel,
}: SyncProps) {
    function togglePause() {
        if (isPaused) {
            onResume();
        } else {
            onPause();
        }
    }

    return (
        <div>
            <button onClick={onCancel}>Cancel</button>
            <div>{youtubeTab.title}</div>
            <div>{discordTab.channelName}</div>
            <button onClick={togglePause}>
                {isPaused ? 'Resume' : 'Pause'}
            </button>
        </div>
    );
}
