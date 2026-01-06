import { UseMutateFunction } from '@tanstack/react-query';
import { useEffect } from 'react';
import { SyncItem } from '../types';
import { useStorage } from './useStorage';
import { useTabs } from './useTabs';

export function useSyncItems(): [
    SyncItem[],
    UseMutateFunction<void, unknown, SyncItem[], unknown>
] {
    const tabs = useTabs();
    const [syncItems, setSyncItems] = useStorage<SyncItem[]>('syncItems', []);

    function cancelSyncItemIfClosed() {
        if (!tabs || !syncItems) {
            return;
        }

        const syncItemsToRemove = syncItems.filter((syncItem) => {
            const tabIds = tabs.map((tab) => tab.tabId);

            return (
                !tabIds.includes(syncItem.youtubeTab.tabId) ||
                !tabIds.includes(syncItem.discordTab.tabId)
            );
        });

        if (syncItemsToRemove.length) {
            const syncItemsToRemoveId = syncItemsToRemove.map(
                (item) => item.id
            );

            setSyncItems(
                syncItems.filter(
                    (syncItem) => !syncItemsToRemoveId.includes(syncItem.id)
                )
            );
        }
    }

    useEffect(cancelSyncItemIfClosed, [setSyncItems, syncItems, tabs]);

    return [syncItems ?? [], setSyncItems];
}
