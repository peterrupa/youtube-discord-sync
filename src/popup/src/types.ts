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

export type SyncItem = {
    id: string;
    youtubeTab: YouTubeTabWithMetadata;
    discordTab: DiscordTabWithMetadata;
    options: {
        isPaused: boolean;
        isPremiere: boolean;
        offset: number;
    };
};

export type MessageEvent = {
    message: string;
};

export type TimestampUpdateEvent = MessageEvent & {
    message: 'youtube_timeupdate';
    startDateTime: string;
    endDateTime: string;
    currentTime: number;
    duration: number;
};
