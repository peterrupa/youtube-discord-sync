import clsx from 'clsx';
import { YouTubeMetadata } from '../types';

import './style.css';

type YouTubeItemProps = {
    item: YouTubeMetadata;
    selected: boolean;
    onClick: () => void;
    disabled?: boolean;
};

// @TODO: handle overflow
// @TODO: add skeleton state

export function YouTubeItem({
    item,
    selected,
    onClick,
    disabled,
}: YouTubeItemProps) {
    return (
        <button
            className={clsx(
                'YouTubeItem-wrapper',
                selected && 'YouTubeItem-wrapper-active'
            )}
            onClick={onClick}
            disabled={disabled}
        >
            <div>
                <div
                    className={
                        'YouTubeItem-thumbnail ' + (disabled ? 'disabled' : '')
                    }
                    style={{
                        backgroundImage: `url(${item.thumbnail})` ?? 'none',
                    }}
                />
            </div>
            <div className="YouTubeItem-info-container">
                <div className="YouTubeItem-title">{item.title}</div>
                {item.channelTitle && (
                    <div className="YouTubeItem-channel-title">
                        {item.channelTitle}
                    </div>
                )}
            </div>
        </button>
    );
}
