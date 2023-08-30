import { SyntheticEvent } from 'react';
import { DiscordTabWithMetadata, YouTubeTabWithMetadata } from '../types';

type SyncProps = {
    youtubeTab: YouTubeTabWithMetadata;
    discordTab: DiscordTabWithMetadata;
    isPaused: boolean;
    isPremiere: boolean;
    onPremiereChange: (isPremiere: boolean) => void;
    onPause: () => void;
    onResume: () => void;
    onCancel: () => void;
};

export function Sync({
    youtubeTab,
    discordTab,
    isPaused,
    isPremiere,
    onPremiereChange,
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

    function handlePremiereClick(e: SyntheticEvent<HTMLInputElement>) {
        const target = e.target as typeof e.target & {
            checked: boolean;
        };

        onPremiereChange(target.checked);
    }

    return (
        <div>
            <button onClick={onCancel}>Cancel</button>
            <div>{youtubeTab.title}</div>
            <div>{discordTab.channelName}</div>
            <button onClick={togglePause}>
                {isPaused ? 'Resume' : 'Pause'}
            </button>
            <input
                type="checkbox"
                onChange={handlePremiereClick}
                checked={isPremiere}
            />{' '}
            Premiere Video
        </div>
    );
}
