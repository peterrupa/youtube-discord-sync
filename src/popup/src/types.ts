export type YouTubeMetadata = {
    id: string;
    title: string;
    thumbnail: string | null;
    channelTitle: string | null;
    isLivestream: boolean;
    isPremiere: boolean;
};

export type YouTubeSyncOptions = {
    offset: number;
    isPaused: boolean;
    isPremiere: boolean;
};

export type YouTubeTabInformation = {
    id: number;
    metadata: YouTubeMetadata | null;
    activeSyncs: number[];
    options: YouTubeSyncOptions;
};

export type MessageEvent = {
    message: string;
};

export type TimestampUpdateEvent = MessageEvent & {
    message: 'video_timeupdate';
    timestamp: string;
};

export type DiscordTab = {
    id: number;
    error: string | null;
} & (
    | {
          state: 'active'; // available for syncing, or is already syncing
          serverName: string | null;
          channelName: string;
      }
    | {
          state: 'error';
          serverName: string | null;
          channelName: string | null;
      }
    | {
          state: 'invalid'; // not in a syncable channel page
          serverName: string | null;
          channelName: null;
      }
);
