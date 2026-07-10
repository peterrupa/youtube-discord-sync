import { ChangeEvent, SyntheticEvent, useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';

import { SyncItem, TimestampUpdateEvent } from '../types';
import { Button } from './Button';
import { ClearButton } from './ClearButton';

type SyncProps = {
    item: SyncItem;
    onBack: () => void;
    onPauseChange: (value: boolean) => void;
    onCancel: () => void;
    onPremiereChange: (value: boolean) => void;
    onOffsetChange: (value: number) => void;
};

export function Sync({
    item,
    onBack,
    onPauseChange,
    onCancel,
    onPremiereChange,
    onOffsetChange,
}: SyncProps) {
    const [currentTimestamp, setCurrentTimestamp] = useState<Date | null>(null);

    function togglePause() {
        onPauseChange(!item.options.isPaused);
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
            request.message === 'video_timeupdate'
        ) {
            const currentRequest = request as TimestampUpdateEvent;

            setCurrentTimestamp(new Date(currentRequest.timestamp));
        }
    }

    function listenForTimestampUpdate() {
        chrome.runtime.onMessage.addListener(handleTimestampUpdate);

        return () => {
            chrome.runtime.onMessage.removeListener(handleTimestampUpdate);
        };
    }

    useEffect(listenForTimestampUpdate, []);

    if (!item) {
        onBack();

        return;
    }

    return (
        <div>
            <div
                className="-mx-4 -mt-4 w-[calc(100%+2rem)] h-40 bg-gray-700 bg-cover bg-center relative"
                style={{
                    backgroundImage: `url(${item.youtubeTab.metadata.thumbnail})`,
                }}
            >
                <div className="w-full h-full bg-[rgba(0,0,0,0.75)] absolute top-0 left-0 p-4 flex flex-col justify-between pb-4">
                    <div className="mb-2 -ml-2">
                        <ClearButton onClick={onBack}>
                            <FaArrowLeft />
                        </ClearButton>
                    </div>

                    <div className="mb-2 text-xs">
                        <p className="font-bold mb-1">
                            {item.youtubeTab.metadata.title}
                        </p>
                        <p>{item.youtubeTab.metadata.channelTitle}</p>
                    </div>

                    <div className="flex justify-between items-center py-2">
                        <div className="flex items-center">
                            <img
                                className="w-4 mr-2"
                                src={item.discordTab.metadata.favIconUrl}
                            />
                            <p className="font-bold">
                                {item.discordTab.metadata.channelName}
                            </p>
                        </div>
                        {currentTimestamp && (
                            <div className="text-xs">
                                {currentTimestamp.toLocaleString()}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex justify-between items-center py-4">
                <Button onClick={togglePause}>
                    {item.options.isPaused ? 'Resume Sync' : 'Pause Sync'}
                </Button>

                <Button onClick={onCancel}>Cancel</Button>
            </div>
            <div className="flex items-center mb-4">
                <input
                    className="mr-2"
                    type="checkbox"
                    onChange={handlePremiereClick}
                    checked={item.options.isPremiere}
                />
                <span
                    data-tooltip-id="premiere-tooltip"
                    data-tooltip-content="Check this option if you are watching a premiered video instead of a livestream, or else Discord chat can be delayed."
                >
                    Premiere Video
                </span>
            </div>
            <div className="flex items-center">
                <span className="mr-2">Offset:</span>
                <input
                    className="w-15 py-1 px-2 mr-2 bg-[rgba(0,0,0,0.3)]"
                    type="number"
                    onChange={handleOffsetChange}
                    value={item.options.offset}
                />
                <span> seconds</span>
            </div>
            <Tooltip id="premiere-tooltip" />
        </div>
    );
}
