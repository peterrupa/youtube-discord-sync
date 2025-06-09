import { useState } from 'react';
import {
    DiscordTabWithMetadata,
    SyncItem,
    YouTubeTabWithMetadata,
} from '../types';

import { Home } from '../Home';
import { useSyncItems } from '../hooks/useSyncItems';
import { Selection } from '../Selection';
import { Sync } from '../Sync';
import './style.css';

type Page = 'home' | 'selection' | 'sync-details';

function App() {
    const [currentPage, setCurrentPage] = useState<Page>('home');

    const [syncItems, setSyncItems] = useSyncItems();

    const [selectedSyncItem, setSelectedSyncItem] = useState<string | null>(
        null
    );

    async function initializeSyncing(
        youtubeTab: YouTubeTabWithMetadata,
        discordTab: DiscordTabWithMetadata
    ) {
        const id = `${youtubeTab.tabId}/${discordTab.tabId}`;

        const newSyncItem: SyncItem = {
            id,
            youtubeTab,
            discordTab,
            options: {
                isPaused: false,
                isPremiere: false,
                offset: 0,
            },
        };

        setSyncItems([...(syncItems ?? []), newSyncItem]);

        chrome.tabs.sendMessage(youtubeTab.tabId, { message: 'youtube_start' });
        chrome.tabs.sendMessage(discordTab.tabId, { message: 'discord_start' });

        setCurrentPage('home');
    }

    function handleSyncCancel(id: string) {
        const syncItem = syncItems.find((item) => item.id === id);

        if (!syncItem) {
            return;
        }

        chrome.tabs.sendMessage(syncItem.youtubeTab.tabId, {
            message: 'youtube_cancel',
        });

        chrome.tabs.sendMessage(syncItem.discordTab.tabId, {
            message: 'discord_cancel',
        });

        setSyncItems(syncItems.filter((item) => item.id !== id));
    }

    function handlePauseChange(id: string, value: boolean) {
        const syncItem = syncItems.find((item) => item.id === id);

        if (!syncItem) {
            return;
        }

        setSyncItems(
            syncItems
                .filter((item) => item.id !== id)
                .concat({
                    ...syncItem,
                    options: {
                        ...syncItem.options,
                        isPaused: value,
                    },
                })
        );
    }

    function handlePremiereChange(id: string, value: boolean) {
        const syncItem = syncItems.find((item) => item.id === id);

        if (!syncItem) {
            return;
        }

        setSyncItems(
            syncItems
                .filter((item) => item.id !== id)
                .concat({
                    ...syncItem,
                    options: {
                        ...syncItem.options,
                        isPremiere: value,
                    },
                })
        );
    }

    function handleOffsetChange(id: string, value: number) {
        const syncItem = syncItems.find((item) => item.id === id);

        if (!syncItem) {
            return;
        }

        setSyncItems(
            syncItems
                .filter((item) => item.id !== id)
                .concat({
                    ...syncItem,
                    options: {
                        ...syncItem.options,
                        offset: value,
                    },
                })
        );
    }

    function handleAddSync() {
        setCurrentPage('selection');
    }

    function handleBack() {
        setCurrentPage('home');
    }

    function handleActiveSyncSelect(syncItem: SyncItem) {
        setSelectedSyncItem(syncItem.id);
        setCurrentPage('sync-details');
    }

    if (currentPage === 'sync-details' && selectedSyncItem) {
        return (
            <Sync
                id={selectedSyncItem}
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
        return <Selection onSync={initializeSyncing} onBack={handleBack} />;
    }

    return (
        <Home
            syncItems={syncItems ?? []}
            onAddSyncClick={handleAddSync}
            onActiveSyncSelect={handleActiveSyncSelect}
        />
    );
}

export default App;
