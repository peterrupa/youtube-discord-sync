import { FaArrowLeft } from 'react-icons/fa';

import { DiscordTab, SyncItem, YouTubeTab } from '../types';
import { ClearButton } from './ClearButton';
import { Selector } from './Selector';

type SelectionProps = {
    youtubeTabs: YouTubeTab[];
    discordTabs: DiscordTab[];
    syncItems: SyncItem[];
    onSync: (youtubeTab: YouTubeTab, discordTab: DiscordTab) => void;
    onBack?: () => void;
};

export function Selection({
    youtubeTabs,
    discordTabs,
    syncItems,
    onSync,
    onBack,
}: SelectionProps) {
    return (
        <div>
            {onBack && (
                <div className="mb-2 -ml-1">
                    <ClearButton onClick={onBack}>
                        <FaArrowLeft />
                    </ClearButton>
                </div>
            )}
            <Selector
                youtubeTabs={youtubeTabs}
                discordTabs={discordTabs}
                syncItems={syncItems}
                onSync={onSync}
            />
        </div>
    );
}
