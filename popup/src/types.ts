export type Tab = {
    tabId: number;
    url: string;
    favIconUrl: string;
    title: string;
    type: 'youtube' | 'discord';
};

export type YouTubeMetadata = {
    id: string;
    title: string;
    thumbnail: string | null;
    channelTitle: string | null;
    isLivestream: boolean;
};

export type YouTubeTabWithMetadata = YouTubeMetadata & {
    tabId: number;
};

export type DiscordTabWithMetadata = {
    tabId: number;
    favIconUrl: string;
    serverName: string;
    channelName: string;
};
