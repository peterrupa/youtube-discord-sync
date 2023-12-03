import { Tooltip } from 'react-tooltip';
import { FaArrowLeft } from 'react-icons/fa';
import { SyntheticEvent } from 'react';
import { useSyncItems } from '../hooks/useSyncItems';

import './style.css';
import { ClearButton } from '../ClearButton';

type SyncProps = {
    id: string;
    onBack: () => void;
    onPauseChange: (value: boolean) => void;
    onCancel: () => void;
    onPremiereChange: (value: boolean) => void;
};

export function Sync({
    id,
    onBack,
    onPauseChange,
    onCancel,
    onPremiereChange,
}: SyncProps) {
    const [syncItems] = useSyncItems();

    const syncItem = syncItems.find((item) => item.id === id);

    if (!syncItem) {
        onBack();

        return;
    }

    function togglePause() {
        onPauseChange(!syncItem?.options.isPaused);
    }

    function handlePremiereClick(e: SyntheticEvent<HTMLInputElement>) {
        const target = e.target as typeof e.target & {
            checked: boolean;
        };

        onPremiereChange(target.checked);
    }

    return (
        <div>
            <div
                className="sync-thumbnail"
                style={{
                    backgroundImage: `url(${syncItem.youtubeTab.thumbnail})`,
                }}
            >
                <div className="sync-thumbnail-overlay">
                    <div>
                        <div>
                            <ClearButton
                                className="sync-back-button"
                                onClick={onBack}
                            >
                                <FaArrowLeft />
                            </ClearButton>
                            <strong>{syncItem.youtubeTab.title}</strong>
                        </div>

                        <div>
                            <div>{syncItem.youtubeTab.channelTitle}</div>
                        </div>
                    </div>

                    <div className="sync-discord-item">
                        <img
                            className="DiscordItem-favicon"
                            src={syncItem.discordTab.favIconUrl}
                        />
                        <strong>{syncItem.discordTab.channelName}</strong>
                    </div>
                </div>
            </div>
            <div className="sync-nav-row">
                <button onClick={togglePause}>
                    {syncItem.options.isPaused ? 'Resume Sync' : 'Pause Sync'}
                </button>

                <button onClick={onCancel}>Cancel</button>
            </div>
            <div className="sync-checklist-row">
                <input
                    type="checkbox"
                    onChange={handlePremiereClick}
                    checked={syncItem.options.isPremiere}
                />{' '}
                <span
                    data-tooltip-id="premiere-tooltip"
                    data-tooltip-content="Check this option if you are watching a premiered video instead of a livestream, or else Discord chat can be delayed."
                >
                    Premiere Video
                </span>
            </div>
            <Tooltip id="premiere-tooltip" />
        </div>
    );
}
