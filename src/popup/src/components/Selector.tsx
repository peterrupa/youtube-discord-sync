import { useCallback, useState } from 'react';

import { DiscordTab, SyncItem, YouTubeTab } from '../types';
import { DiscordItem } from './DiscordItem';
import { YouTubeItem } from './YoutubeItem';

type SelectorProps = {
    youtubeTabs: YouTubeTab[];
    discordTabs: DiscordTab[];
    syncItems: SyncItem[];
    onSync: (youtubeTab: YouTubeTab, discordTab: DiscordTab) => void;
};

export function Selector({
    youtubeTabs,
    discordTabs,
    syncItems,
    onSync,
}: SelectorProps) {
    const [selectedYouTubeTab, setSelectedYouTubeTab] =
        useState<YouTubeTab | null>(null);
    const [selectedDiscordTab, setSelectedDiscordTab] =
        useState<DiscordTab | null>(null);

    const isTabSyncing = useCallback(
        (tabId: number) => {
            const youtubeSyncingTabIds = syncItems.map(
                (item) => item.youtubeTab.tabId,
            );
            const discordSyncingTabIds = syncItems.map(
                (item) => item.discordTab.tabId,
            );

            return (
                youtubeSyncingTabIds.includes(tabId) ||
                discordSyncingTabIds.includes(tabId)
            );
        },
        [syncItems],
    );

    function handleYouTubeTabSelect(tab: YouTubeTab): void {
        setSelectedYouTubeTab(tab);

        if (selectedDiscordTab) {
            onSync(tab, selectedDiscordTab);
        }
    }

    function handleDiscordTabSelect(tab: DiscordTab) {
        setSelectedDiscordTab(tab);

        if (selectedYouTubeTab) {
            onSync(selectedYouTubeTab, tab);
        }
    }

    // defer rendering until data is loaded
    if (!youtubeTabs || !discordTabs) {
        return;
    }

    return (
        <div>
            <h2 className="font-bold mb-1">YouTube</h2>
            <div className="mb-4">
                {youtubeTabs &&
                    (youtubeTabs.length ? (
                        youtubeTabs.map((tab) => (
                            <YouTubeItem
                                tab={tab}
                                onClick={() => handleYouTubeTabSelect(tab)}
                                selected={
                                    selectedYouTubeTab?.tabId === tab.tabId
                                }
                            />
                        ))
                    ) : (
                        <div>No open YouTube tabs</div>
                    ))}
            </div>

            <h2 className="font-bold mb-1">Discord</h2>
            <div>
                {discordTabs &&
                    (discordTabs.length ? (
                        discordTabs.map((tab) => (
                            <DiscordItem
                                tab={tab}
                                onClick={() => handleDiscordTabSelect(tab)}
                                selected={
                                    selectedDiscordTab?.tabId === tab.tabId
                                }
                                disabled={isTabSyncing(tab.tabId)}
                            />
                        ))
                    ) : (
                        <div>No open Discord tabs</div>
                    ))}
            </div>
        </div>
    );
}
