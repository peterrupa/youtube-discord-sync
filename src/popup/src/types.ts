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
    isPremiere: boolean;
};

export type YouTubeTab = {
    tabId: number;
    metadata: YouTubeMetadata;
    activeSyncs: YouTubeSyncState[];
};

export type DiscordTab = {
    tabId: number;
    metadata: {
        favIconUrl: string;
        serverName: string;
        channelName: string;
    };
    activeSyncs: SyncState[];
};

export type SyncItem = {
    id: string;
    youtubeTab: YouTubeTab;
    discordTab: DiscordTab;
    options: {
        isPaused: boolean;
        offset: number;
    };
};

export type MessageEvent = {
    message: string;
};

export type TimestampUpdateEvent = MessageEvent & {
    message: 'video_timeupdate';
    timestamp: string;
};

export type SyncState = {
    tabId: number;
};

export type YouTubeSyncState = SyncState & {
    options: {
        isPaused: boolean;
        offset: number;
    };
};
