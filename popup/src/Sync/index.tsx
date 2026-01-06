import { ChangeEvent, SyntheticEvent, useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import { useSyncItems } from '../hooks/useSyncItems';

import { ClearButton } from '../ClearButton';
import { TimestampUpdateEvent } from '../types';
import './style.css';

type SyncProps = {
    id: string;
    onBack: () => void;
    onPauseChange: (value: boolean) => void;
    onCancel: () => void;
    onPremiereChange: (value: boolean) => void;
    onOffsetChange: (value: number) => void;
};

export function Sync({
    id,
    onBack,
    onPauseChange,
    onCancel,
    onPremiereChange,
    onOffsetChange,
}: SyncProps) {
    const [currentTimestamp, setCurrentTimestamp] = useState<number | null>(
        null
    );

    const [syncItems] = useSyncItems();

    const syncItem = syncItems.find((item) => item.id === id);

    function togglePause() {
        onPauseChange(!syncItem?.options.isPaused);
    }

    function handlePremiereClick(e: SyntheticEvent<HTMLInputElement>) {
        const target = e.target as typeof e.target & {
            checked: boolean;
        };

        onPremiereChange(target.checked);
    }

    function handleOffsetChange(e: ChangeEvent<HTMLInputElement>) {
        const value = parseFloat(e.target.value);

        onOffsetChange(value);
    }

    function handleTimestampUpdate(request: unknown) {
        if (
            request &&
            typeof request === 'object' &&
            'message' in request &&
            typeof request.message === 'string' &&
            request.message === 'youtube_timeupdate'
        ) {
            const currentRequest = request as TimestampUpdateEvent;

            const startTimestamp = new Date(
                currentRequest.startDateTime
            ).getTime();
            const currentTimeInMilliseconds = currentRequest.currentTime * 1000;

            setCurrentTimestamp(startTimestamp + currentTimeInMilliseconds);
        }
    }

    function listenForTimestampUpdate() {
        chrome.runtime.onMessage.addListener(handleTimestampUpdate);

        return () => {
            chrome.runtime.onMessage.removeListener(handleTimestampUpdate);
        };
    }

    useEffect(listenForTimestampUpdate, []);

    if (!syncItem) {
        onBack();

        return;
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

                    <div className="sync-bottom-row">
                        <div className="sync-discord-item">
                            <img
                                className="DiscordItem-favicon"
                                src={syncItem.discordTab.favIconUrl}
                            />
                            <strong>{syncItem.discordTab.channelName}</strong>
                        </div>
                        {currentTimestamp && (
                            <div className="sync-current-time">
                                {new Date(currentTimestamp).toLocaleString()}
                            </div>
                        )}
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
            <div className="sync-offset-row">
                <span className="offset">Offset:</span>
                <input
                    type="number"
                    onChange={handleOffsetChange}
                    value={syncItem.options.offset}
                />
                <span> seconds</span>
            </div>
            <Tooltip id="premiere-tooltip" />
        </div>
    );
}
