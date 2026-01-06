import { useState, useMemo, useEffect, useCallback } from 'react';

import { DiscordItem } from '../DiscordItem';
import { YouTubeItem } from '../YouTubeItem';
import {
    DiscordTabWithMetadata,
    Tab,
    YouTubeMetadata,
    YouTubeTabWithMetadata,
} from '../types';
import { useTabs } from '../hooks/useTabs';
import { useSyncItems } from '../hooks/useSyncItems';

type SelectorProps = {
    onSync: (
        youtubeTab: YouTubeTabWithMetadata,
        discordTab: DiscordTabWithMetadata
    ) => void;
};

export function Selector({ onSync }: SelectorProps) {
    const tabs = useTabs();
    const [youtubeMetadataMap, setYoutubeMetadataMap] = useState<Record<
        string,
        YouTubeMetadata
    > | null>(null);
    const [selectedYouTubeTab, setSelectedYouTubeTab] =
        useState<YouTubeTabWithMetadata | null>(null);
    const [selectedDiscordTab, setSelectedDiscordTab] =
        useState<DiscordTabWithMetadata | null>(null);
    const [syncItems = []] = useSyncItems();

    const youtubeTabs = useMemo<Tab[] | null>(() => {
        if (!tabs) {
            return null;
        }

        return tabs.filter((tab) => tab.type === 'youtube');
    }, [tabs]);

    const discordTabs = useMemo<Tab[] | null>(() => {
        if (!tabs) {
            return null;
        }

        return tabs.filter((tab) => tab.type === 'discord');
    }, [tabs]);

    const youtubeTabsWithMetadata = useMemo<
        YouTubeTabWithMetadata[] | null
    >(() => {
        if (!youtubeMetadataMap) {
            return null;
        }

        return (
            youtubeTabs
                ?.map((tab) => {
                    const defaultMetadata: YouTubeMetadata = {
                        id: '',
                        title: tab.title,
                        thumbnail: null,
                        channelTitle: null,
                        isLivestream: false,
                    };

                    return {
                        ...(youtubeMetadataMap[getIDFromURL(tab.url)] ??
                            defaultMetadata),
                        tabId: tab.tabId,
                    };
                })
                .filter((tab) => tab.isLivestream) ?? null
        );
    }, [youtubeMetadataMap, youtubeTabs]);

    const discordTabsWithMetadata = useMemo<
        DiscordTabWithMetadata[] | null
    >(() => {
        return (
            discordTabs?.map((tab) => {
                const [, channelName, serverName] = tab.title.split(' | ');

                return {
                    tabId: tab.tabId,
                    favIconUrl: tab.favIconUrl,
                    serverName,
                    channelName,
                };
            }) ?? null
        );
    }, [discordTabs]);

    const isTabSyncing = useCallback(
        (tabId: number) => {
            const youtubeSyncingTabIds = syncItems.map(
                (item) => item.youtubeTab.tabId
            );
            const discordSyncingTabIds = syncItems.map(
                (item) => item.discordTab.tabId
            );

            return (
                youtubeSyncingTabIds.includes(tabId) ||
                discordSyncingTabIds.includes(tabId)
            );
        },
        [syncItems]
    );

    function updateYouTubeMetadataMap() {
        async function run() {
            try {
                if (!youtubeTabs) {
                    return;
                }

                if (!youtubeTabs.length) {
                    setYoutubeMetadataMap({});
                }

                const newMetadata: YouTubeMetadata[] =
                    await fetchYouTubeMetadata(
                        youtubeTabs.map((tab) => tab.tabId)
                    );

                const newMetadataMap = newMetadata.reduce(
                    (acc, current) => ({ ...acc, [current.id]: current }),
                    {}
                );

                setYoutubeMetadataMap((youtubeMetadataMap) => ({
                    ...youtubeMetadataMap,
                    ...newMetadataMap,
                }));
            } catch (e) {
                console.warn('Failed fetching YouTube metadata');
                console.error(e);
            }
        }

        run();
    }

    async function fetchYouTubeMetadata(
        tabIDs: number[]
    ): Promise<YouTubeMetadata[]> {
        const response = await chrome.runtime.sendMessage({
            message: 'fetch_youtube_metadata',
            tabIDs,
        });

        return response;
    }

    function handleYouTubeTabSelect(tab: YouTubeTabWithMetadata): void {
        setSelectedYouTubeTab(tab);

        if (selectedDiscordTab) {
            onSync(tab, selectedDiscordTab);
        }
    }

    function handleDiscordTabSelect(tab: DiscordTabWithMetadata) {
        setSelectedDiscordTab(tab);

        if (selectedYouTubeTab) {
            onSync(selectedYouTubeTab, tab);
        }
    }

    useEffect(updateYouTubeMetadataMap, [youtubeTabs]);

    return (
        <div>
            <h2>YouTube</h2>
            <div className="items-container">
                {youtubeTabsWithMetadata &&
                    (youtubeTabsWithMetadata.length ? (
                        youtubeTabsWithMetadata.map((tab) => (
                            <YouTubeItem
                                item={tab}
                                onClick={() => handleYouTubeTabSelect(tab)}
                                selected={
                                    selectedYouTubeTab?.tabId === tab.tabId
                                }
                                disabled={isTabSyncing(tab.tabId)}
                            />
                        ))
                    ) : (
                        <div className="items-container-empty-item">
                            No open YouTube tabs
                        </div>
                    ))}
            </div>

            <h2>Discord</h2>
            <div className="items-container">
                {discordTabsWithMetadata &&
                    (discordTabsWithMetadata.length ? (
                        discordTabsWithMetadata.map((tab) => (
                            <DiscordItem
                                item={tab}
                                onClick={() => handleDiscordTabSelect(tab)}
                                selected={
                                    selectedDiscordTab?.tabId === tab.tabId
                                }
                                disabled={isTabSyncing(tab.tabId)}
                            />
                        ))
                    ) : (
                        <div className="items-container-empty-item">
                            No open Discord tabs
                        </div>
                    ))}
            </div>
        </div>
    );
}

function getIDFromURL(url: string): string {
    const urlObject = new URL(url);

    const id = urlObject.searchParams.get('v');

    if (!id) {
        throw new Error('ID not found in URL');
    }

    return id;
}
