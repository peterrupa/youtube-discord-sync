import { FaArrowLeft } from 'react-icons/fa';

import { DiscordTabWithMetadata, YouTubeTabWithMetadata } from '../types';
import { ClearButton } from './ClearButton';
import { Selector } from './Selector';

type SelectionProps = {
    onSync: (
        youtubeTab: YouTubeTabWithMetadata,
        discordTab: DiscordTabWithMetadata,
    ) => void;
    onBack?: () => void;
};

export function Selection({ onSync, onBack }: SelectionProps) {
    return (
        <div>
            {onBack && (
                <div className="mb-2 -ml-1">
                    <ClearButton onClick={onBack}>
                        <FaArrowLeft />
                    </ClearButton>
                </div>
            )}
            <Selector onSync={onSync} />
        </div>
    );
}
