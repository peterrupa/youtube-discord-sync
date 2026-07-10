import { useMemo, useState } from 'react';
import {
    DiscordTab,
    SyncItem,
    YouTubeMetadata,
    YouTubeSyncState,
    YouTubeTab,
} from '../types';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Selection } from './Selection';
import { Sync } from './Sync';
import { SyncList } from './SyncList';

type Page = 'home' | 'selection' | 'sync-details';

function App() {
    const queryClient = useQueryClient();
    const [currentPage, setCurrentPage] = useState<Page>('home');

    const { data: youtubeTabs } = useQuery<YouTubeTab[]>({
        queryKey: ['youtubeTabs'],
        queryFn: async () => {
            const _youtubeTabs: YouTubeTab[] = [];

            const youtubeTabsRaw = await chrome.tabs.query({
                url: [
                    'https://www.youtube.com/watch*',
                    'https://www.youtube.com/live/*',
                ],
            });

            for (const tab of youtubeTabsRaw) {
                if (!tab.id) {
                    continue;
                }

                const response = (await chrome.tabs.sendMessage(tab.id, {
                    message: 'fetch_info',
                })) as {
                    metadata: YouTubeMetadata | null;
                    activeSyncs: YouTubeSyncState[];
                } | null;

                if (!response) {
                    continue;
                }

                const { metadata } = response;

                if (!metadata) {
                    continue;
                }

                _youtubeTabs.push({
                    tabId: tab.id,
                    metadata,
                    activeSyncs: response.activeSyncs,
                });
            }

            return _youtubeTabs;
        },
    });

    const { data: discordTabs } = useQuery<DiscordTab[]>({
        queryKey: ['discordTabs'],
        queryFn: async () => {
            const _discordTabs: DiscordTab[] = [];

            const discordTabsRaw = await chrome.tabs.query({
                url: 'https://discord.com/channels/*/*',
            });

            for (const tab of discordTabsRaw) {
                if (!tab.id) {
                    continue;
                }

                const response = (await chrome.tabs.sendMessage(tab.id, {
                    message: 'fetch_info',
                })) as {
                    activeSyncs: YouTubeSyncState[];
                } | null;

                if (!response) {
                    continue;
                }

                const [, channelName, serverName] = tab.title!.split(' | ');

                _discordTabs.push({
                    tabId: tab.id,
                    metadata: {
                        favIconUrl: tab.favIconUrl ?? '',
                        serverName,
                        channelName,
                    },
                    activeSyncs: response.activeSyncs,
                });
            }

            return _discordTabs;
        },
    });

    const syncItems = useMemo(() => {
        if (!discordTabs || !youtubeTabs) {
            return [];
        }

        const _syncItems: SyncItem[] = [];

        for (const discordTab of discordTabs) {
            for (const activeSync of discordTab.activeSyncs) {
                const youtubeTab = youtubeTabs.find((tab) => {
                    return tab.tabId === activeSync.tabId;
                });

                if (!youtubeTab) {
                    continue;
                }

                const syncStateFromYouTube = youtubeTab.activeSyncs.find(
                    (sync) => {
                        return sync.tabId === discordTab.tabId;
                    },
                );

                if (!syncStateFromYouTube) {
                    continue;
                }

                _syncItems.push({
                    id: `${discordTab.tabId}/${activeSync.tabId}`,
                    youtubeTab,
                    discordTab,
                    options: syncStateFromYouTube!.options,
                });
            }
        }

        return _syncItems;
    }, [youtubeTabs, discordTabs]);

    const [selectedSyncItemId, setSelectedSyncItemId] = useState<string | null>(
        null,
    );

    const selectedSyncItem = syncItems.find(
        (item) => item.id === selectedSyncItemId,
    );

    async function initializeSyncing(
        youtubeTab: YouTubeTab,
        discordTab: DiscordTab,
    ) {
        chrome.tabs.sendMessage(youtubeTab.tabId, {
            message: 'sync_start',
            tabId: discordTab.tabId,
        });
        chrome.tabs.sendMessage(discordTab.tabId, {
            message: 'sync_start',
            tabId: youtubeTab.tabId,
        });

        queryClient.invalidateQueries({ queryKey: ['youtubeTabs'] });
        queryClient.invalidateQueries({ queryKey: ['discordTabs'] });

        setCurrentPage('home');
    }

    function handleSyncCancel(syncItem: SyncItem) {
        chrome.tabs.sendMessage(syncItem.youtubeTab.tabId, {
            message: 'sync_stop',
            tabId: syncItem.discordTab.tabId,
        });

        chrome.tabs.sendMessage(syncItem.discordTab.tabId, {
            message: 'sync_stop',
            tabId: syncItem.youtubeTab.tabId,
        });

        queryClient.invalidateQueries({ queryKey: ['youtubeTabs'] });
        queryClient.invalidateQueries({ queryKey: ['discordTabs'] });
    }

    function handlePauseChange(syncItem: SyncItem, value: boolean) {
        chrome.tabs.sendMessage(syncItem.youtubeTab.tabId, {
            message: 'sync_option_update',
            tabId: syncItem.discordTab.tabId,
            options: {
                isPaused: value,
            },
        });

        queryClient.invalidateQueries({ queryKey: ['youtubeTabs'] });
    }

    function handlePremiereChange(syncItem: SyncItem, value: boolean) {
        chrome.tabs.sendMessage(syncItem.youtubeTab.tabId, {
            message: 'sync_option_update',
            tabId: syncItem.discordTab.tabId,
            options: {
                isPremiere: value,
            },
        });

        queryClient.invalidateQueries({ queryKey: ['youtubeTabs'] });
    }

    function handleOffsetChange(syncItem: SyncItem, value: number) {
        chrome.tabs.sendMessage(syncItem.youtubeTab.tabId, {
            message: 'sync_option_update',
            tabId: syncItem.discordTab.tabId,
            options: {
                offset: value,
            },
        });

        queryClient.invalidateQueries({ queryKey: ['youtubeTabs'] });
    }

    function handleAddSync() {
        setCurrentPage('selection');
    }

    function handleBack() {
        setCurrentPage('home');
    }

    function handleActiveSyncSelect(syncItem: SyncItem) {
        setSelectedSyncItemId(syncItem.id);
        setCurrentPage('sync-details');
    }

    if (!youtubeTabs || !discordTabs) {
        return <div></div>;
    }

    if (currentPage === 'sync-details' && selectedSyncItem) {
        return (
            <Sync
                item={selectedSyncItem}
                onBack={handleBack}
                onPauseChange={(value) =>
                    handlePauseChange(selectedSyncItem, value)
                }
                onCancel={() => handleSyncCancel(selectedSyncItem)}
                onPremiereChange={(value) =>
                    handlePremiereChange(selectedSyncItem, value)
                }
                onOffsetChange={(value) =>
                    handleOffsetChange(selectedSyncItem, value)
                }
            />
        );
    }

    if (currentPage === 'selection') {
        return (
            <Selection
                youtubeTabs={youtubeTabs}
                discordTabs={discordTabs}
                syncItems={syncItems}
                onSync={initializeSyncing}
                onBack={handleBack}
            />
        );
    }

    if (!syncItems.length) {
        return (
            <Selection
                youtubeTabs={youtubeTabs}
                discordTabs={discordTabs}
                syncItems={syncItems}
                onSync={initializeSyncing}
            />
        );
    }

    return (
        <SyncList
            syncItems={syncItems}
            onAddSyncClick={handleAddSync}
            onActiveSyncSelect={handleActiveSyncSelect}
        />
    );
}

export default App;
