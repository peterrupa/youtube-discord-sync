import { useEffect, useMemo, useState } from 'react';
import {
    DiscordTabWithMetadata,
    Tab,
    YouTubeMetadata,
    YouTubeTabWithMetadata,
} from '../types';

import './style.css';
import { Selector } from '../Selector';
import { Sync } from '../Sync';
import { useStorage } from '../hooks/useStorage';

function App() {
    const [tabs, setTabs] = useState<Tab[] | null>(null);
    const [youtubeMetadataMap, setYoutubeMetadataMap] = useState<Record<
        string,
        YouTubeMetadata
    > | null>(null);

    const [selectedYouTubeTab, setSelectedYouTubeTab] =
        useStorage<YouTubeTabWithMetadata | null>('selectedYouTubeTab', null);
    const [selectedDiscordTab, setSelectedDiscordTab] =
        useStorage<DiscordTabWithMetadata | null>('selectedDiscordTab', null);

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
        // @TODO: remove livestreams

        if (!youtubeMetadataMap) {
            return null;
        }

        return (
            youtubeTabs?.map((tab) => {
                const defaultMetadata: YouTubeMetadata = {
                    id: '',
                    title: tab.title,
                    thumbnail: null,
                    channelTitle: null,
                };

                return {
                    ...(youtubeMetadataMap[getIDFromURL(tab.url)] ??
                        defaultMetadata),
                    tabId: tab.tabId,
                };
            }) ?? null
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

    function fetchTabs() {
        async function run() {
            const tabs = await chrome.tabs.query({
                url: [
                    'https://www.youtube.com/watch*',
                    'https://discord.com/channels/*/*',
                ],
            });

            setTabs(
                tabs.map((tab) => {
                    const type = tab.url?.startsWith('https://discord')
                        ? 'discord'
                        : 'youtube';

                    return {
                        tabId: tab.id ?? 1,
                        url: tab.url ?? '',
                        favIconUrl: tab.favIconUrl ?? '',
                        title: tab.title ?? '',
                        type,
                    };
                })
            );
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

    function cancelSelectionIfTabClosed() {
        if (!youtubeTabs || !discordTabs) {
            return;
        }

        const selectedYoutubeTabIsClosed =
            selectedYouTubeTab &&
            !youtubeTabs
                ?.map((tab) => tab.tabId)
                .includes(selectedYouTubeTab.tabId);

        const selectedDiscordTabIsClosed =
            selectedDiscordTab &&
            !discordTabs
                ?.map((tab) => tab.tabId)
                .includes(selectedDiscordTab.tabId);

        if (selectedYoutubeTabIsClosed || selectedDiscordTabIsClosed) {
            setSelectedYouTubeTab(null);
            setSelectedDiscordTab(null);
        }
    }

    function initializeSyncing(
        youtubeTab: YouTubeTabWithMetadata,
        discordTab: DiscordTabWithMetadata
    ) {
        chrome.tabs.sendMessage(youtubeTab.tabId, { message: 'youtube_start' });
        chrome.tabs.sendMessage(discordTab.tabId, { message: 'discord_start' });
    }

    function handleYouTubeTabSelect(tab: YouTubeTabWithMetadata): void {
        setSelectedYouTubeTab(tab);

        if (selectedDiscordTab) {
            initializeSyncing(tab, selectedDiscordTab);
        }
    }

    function handleDiscordTabSelect(tab: DiscordTabWithMetadata) {
        setSelectedDiscordTab(tab);

        if (selectedYouTubeTab) {
            initializeSyncing(selectedYouTubeTab, tab);
        }
    }

    function handleSyncCancel() {
        if (selectedYouTubeTab) {
            chrome.tabs.sendMessage(selectedYouTubeTab.tabId, {
                message: 'youtube_cancel',
            });
        }

        if (selectedDiscordTab) {
            chrome.tabs.sendMessage(selectedDiscordTab.tabId, {
                message: 'discord_cancel',
            });
        }

        setSelectedYouTubeTab(null);
        setSelectedDiscordTab(null);
    }

    useEffect(fetchTabs, []);
    useEffect(updateYouTubeMetadataMap, [youtubeTabs]);
    useEffect(cancelSelectionIfTabClosed, [
        discordTabs,
        selectedDiscordTab,
        selectedYouTubeTab,
        setSelectedDiscordTab,
        setSelectedYouTubeTab,
        youtubeTabs,
    ]);

    if (!youtubeTabsWithMetadata || !discordTabsWithMetadata) {
        return <div></div>;
    }

    if (!selectedYouTubeTab || !selectedDiscordTab) {
        return (
            <Selector
                youtubeTabs={youtubeTabsWithMetadata}
                discordTabs={discordTabsWithMetadata}
                onYouTubeSelect={handleYouTubeTabSelect}
                onDiscordSelect={handleDiscordTabSelect}
                selectedYouTubeTab={selectedYouTubeTab}
                selectedDiscordTab={selectedDiscordTab}
            />
        );
    }

    return (
        <Sync
            youtubeTab={selectedYouTubeTab}
            discordTab={selectedDiscordTab}
            onCancel={handleSyncCancel}
        />
    );
}

export default App;

function getIDFromURL(url: string): string {
    const urlObject = new URL(url);

    const id = urlObject.searchParams.get('v');

    if (!id) {
        throw new Error('ID not found in URL');
    }

    return id;
}
