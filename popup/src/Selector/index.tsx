import { DiscordItem } from '../DiscordItem';
import { YouTubeItem } from '../YouTubeItem';
import { DiscordTabWithMetadata, YouTubeTabWithMetadata } from '../types';

type SelectorProps = {
    youtubeTabs: YouTubeTabWithMetadata[] | null;
    discordTabs: DiscordTabWithMetadata[] | null;
    selectedYouTubeTab?: YouTubeTabWithMetadata | null;
    selectedDiscordTab?: DiscordTabWithMetadata | null;
    onYouTubeSelect: (tab: YouTubeTabWithMetadata) => void;
    onDiscordSelect: (tab: DiscordTabWithMetadata) => void;
};

export function Selector({
    youtubeTabs,
    discordTabs,
    selectedYouTubeTab,
    selectedDiscordTab,
    onYouTubeSelect,
    onDiscordSelect,
}: SelectorProps) {
    function handleYouTubeSelect(tab: YouTubeTabWithMetadata) {
        onYouTubeSelect(tab);
    }

    function handleDiscordSelect(tab: DiscordTabWithMetadata) {
        onDiscordSelect(tab);
    }

    return (
        <div>
            <h2>YouTube</h2>
            <div className="items-container">
                {youtubeTabs &&
                    (youtubeTabs.length ? (
                        youtubeTabs.map((tab) => (
                            <YouTubeItem
                                item={tab}
                                onClick={() => handleYouTubeSelect(tab)}
                                selected={
                                    selectedYouTubeTab?.tabId === tab.tabId
                                }
                            />
                        ))
                    ) : (
                        <div className="items-container-empty-item">
                            No open YouTube tabs
                        </div>
                    ))}
            </div>

            <h2>Discord</h2>
            <div className="items-container">
                {discordTabs &&
                    (discordTabs.length ? (
                        discordTabs.map((tab) => (
                            <DiscordItem
                                item={tab}
                                onClick={() => handleDiscordSelect(tab)}
                                selected={
                                    selectedDiscordTab?.tabId === tab.tabId
                                }
                            />
                        ))
                    ) : (
                        <div className="items-container-empty-item">
                            No open Discord tabs
                        </div>
                    ))}
            </div>
        </div>
    );
}
