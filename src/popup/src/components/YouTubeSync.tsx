import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { FaPause, FaPlay } from 'react-icons/fa';
import {
    DiscordTab,
    YouTubeSyncOptions,
    YouTubeTabInformation,
} from '../types';
import { ClearButton } from './ClearButton';
import { DiscordItem } from './DiscordItem';
import { DiscordLogo } from './DiscordLogo';

type YouTubeSyncProps = {
    tab: YouTubeTabInformation;
    onOptionChange: (option: Partial<YouTubeSyncOptions>) => void;
    discordTabs: DiscordTab[];
};

export function YouTubeSync({
    tab,
    onOptionChange,
    discordTabs,
}: YouTubeSyncProps) {
    const queryClient = useQueryClient();

    const [currentTimestamp, setCurrentTimestamp] = useState<Date | null>(null);

    function handleTogglePause() {
        onOptionChange({ isPaused: !tab.options.isPaused });
    }

    function handleOffsetChange(offset: number) {
        onOptionChange({ offset });
    }

    function handleSync(tabId: number) {
        chrome.tabs.sendMessage(tab.id, {
            message: 'sync_start',
            tabId,
        });

        queryClient.invalidateQueries({
            queryKey: ['tabInformation'],
        });
    }

    function handleUnsync(tabId: number) {
        chrome.tabs.sendMessage(tab.id, {
            message: 'sync_stop',
            tabId,
        });

        queryClient.invalidateQueries({
            queryKey: ['tabInformation'],
        });
    }

    function listenForTimestampUpdate() {
        async function poll() {
            const response = (await chrome.tabs.sendMessage(tab.id, {
                message: 'fetch_timestamp',
            })) as { timestamp: string | null };

            setCurrentTimestamp(
                response.timestamp ? new Date(response.timestamp) : null,
            );
        }

        poll();

        const interval = setInterval(poll, 500);

        return () => {
            clearInterval(interval);
        };
    }

    useEffect(listenForTimestampUpdate, [tab.id]);

    if (!tab.metadata) {
        return <div>Go to a YouTube livestream VOD to start syncing</div>;
    }

    return (
        <div>
            <div
                className="-mx-4 -mt-4 w-[calc(100%+2rem)] h-40 bg-gray-700 bg-cover bg-center relative mb-4"
                style={{
                    backgroundImage: `url(${tab.metadata.thumbnail})`,
                }}
            >
                <div className="w-full h-full bg-[rgba(0,0,0,0.75)] absolute top-0 left-0 p-4 flex flex-col justify-between pb-4">
                    <div className="mb-2 text-xs">
                        <p className="font-bold mb-1 line-clamp-2">
                            {tab.metadata.title}
                        </p>
                        <p className="line-clamp-2">
                            {tab.metadata.channelTitle}
                        </p>
                    </div>
                    <div className="flex justify-between items-center">
                        <div>
                            {currentTimestamp && (
                                <div className="text-xs">
                                    {currentTimestamp.toLocaleString()}
                                </div>
                            )}
                        </div>
                        <div className="text-xl">
                            <ClearButton onClick={handleTogglePause}>
                                {tab.options.isPaused ? (
                                    <FaPlay />
                                ) : (
                                    <FaPause />
                                )}
                            </ClearButton>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mb-4">
                <div className="flex items-center">
                    <span className="mr-2">Offset:</span>
                    <input
                        className="w-15 py-1 px-2 mr-2 bg-[rgba(0,0,0,0.3)]"
                        type="number"
                        value={tab.options.offset}
                        onChange={(e) =>
                            handleOffsetChange(parseInt(e.target.value))
                        }
                    />
                    <span> seconds</span>
                </div>
            </div>
            <hr className="my-4" />
            <div className="font-bold mb-2 flex items-center space-x-1">
                <DiscordLogo />
                <span>Sync with</span>
            </div>
            <div className="font-bold flex flex-col space-y-1 -mx-4">
                {discordTabs.length ? (
                    discordTabs.map((discordTab) => (
                        <DiscordItem
                            key={discordTab.id}
                            tab={discordTab}
                            syncing={
                                tab.activeSyncs.includes(discordTab.id) &&
                                discordTab.state === 'active'
                            }
                            onSync={() => handleSync(discordTab.id)}
                            onUnsync={() => handleUnsync(discordTab.id)}
                        />
                    ))
                ) : (
                    <div className="pl-4 text-white/50">
                        No Discord tabs open
                    </div>
                )}
            </div>
        </div>
    );
}
