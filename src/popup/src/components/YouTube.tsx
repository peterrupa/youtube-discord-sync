import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    DiscordTab,
    YouTubeMetadata,
    YouTubeSyncOptions,
    YouTubeTabInformation,
} from '../types';
import { getCurrentTab, getDiscordTabs } from '../utils/chrome';
import { YouTubeSync } from './YouTubeSync';

export function YouTube() {
    const queryClient = useQueryClient();

    const {
        data: tabInformation,
        error: tabInformationError,
        isLoading: tabInformationIsLoading,
    } = useQuery<YouTubeTabInformation>({
        queryKey: ['tabInformation'],
        queryFn: getYouTubeTabInfomation,
    });

    const { data: discordTabs, isLoading: discordTabsIsLoading } = useQuery<
        DiscordTab[]
    >({
        queryKey: ['discordTabs'],
        queryFn: getDiscordTabsWithInformation,
    });

    function handleOptionChange(options: Partial<YouTubeSyncOptions>) {
        if (!tabInformation) return;

        chrome.tabs.sendMessage(tabInformation.id, {
            message: 'sync_option_update',
            options,
        });

        queryClient.invalidateQueries({
            queryKey: ['tabInformation'],
        });
    }

    if (tabInformationError) {
        // @TODO:
        return <div>Something went wrong. Please refresh the page.</div>;
    }

    const isLoading = tabInformationIsLoading || discordTabsIsLoading;

    if (isLoading || !tabInformation || !discordTabs) {
        return <div />;
    }

    return (
        <YouTubeSync
            tab={tabInformation}
            onOptionChange={handleOptionChange}
            discordTabs={discordTabs}
        />
    );
}

async function getYouTubeTabInfomation() {
    try {
        const currentTab = await getCurrentTab();

        const response = (await chrome.tabs.sendMessage(currentTab.id!, {
            message: 'fetch_info',
        })) as {
            metadata: YouTubeMetadata | null;
            activeSyncs: number[];
            options: YouTubeSyncOptions;
        } | null;

        if (!response) {
            throw new Error('Failed to fetch tab information');
        }

        return { id: currentTab.id!, ...response };
    } catch {
        throw new Error('Failed to fetch tab information');
    }
}

async function getDiscordTabsWithInformation() {
    const tabs = await getDiscordTabs();

    const tabsWithInfo: DiscordTab[] = tabs.map((tab) => {
        // check if we can infer the channelName and serverName from the tab's title
        let channelName = null;
        let serverName = null;
        const url = new URL(tab.url!);

        // usual channel urls
        if (/discord\.com\/channels\/\d+\/\d+/.test(url.href)) {
            [, channelName, serverName] = tab.title!.split(' | ');
        }
        // direct message urls
        else if (/discord\.com\/channels\/@me\/\d+/.test(url.href)) {
            [, channelName] = tab.title!.split(' | ');
        }

        if (channelName) {
            return {
                id: tab.id!,
                state: 'active',
                channelName,
                serverName,
                error: null,
            };
        } else {
            return {
                id: tab.id!,
                state: 'invalid',
                channelName: null,
                serverName,
                error: null,
            };
        }
    });
    return tabsWithInfo.filter((tab) => tab.state !== 'invalid');
}
