import { FaArrowLeft } from 'react-icons/fa';

import { Selector } from '../Selector';
import { DiscordTabWithMetadata, YouTubeTabWithMetadata } from '../types';
import { ClearButton } from '../ClearButton';

import './style.css';

type SelectionProps = {
    onSync: (
        youtubeTab: YouTubeTabWithMetadata,
        discordTab: DiscordTabWithMetadata
    ) => void;
    onBack: () => void;
};

export function Selection({ onSync, onBack }: SelectionProps) {
    return (
        <div>
            <div className="nav-container">
                <ClearButton onClick={onBack}>
                    <FaArrowLeft />
                </ClearButton>
            </div>
            <Selector onSync={onSync} />
        </div>
    );
}
