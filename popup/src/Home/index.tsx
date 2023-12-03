import { FaPlus } from 'react-icons/fa';

import { ClearButton } from '../ClearButton';
import { SyncItem } from '../SyncItem';
import { SyncItem as SyncItemType } from '../types';
import './style.css';

type HomeProps = {
    syncItems: SyncItemType[];
    onAddSyncClick: () => void;
    onActiveSyncSelect: (syncItem: SyncItemType) => void;
};

export function Home({
    syncItems,
    onAddSyncClick,
    onActiveSyncSelect,
}: HomeProps) {
    function handleSyncItemClick(syncItem: SyncItemType) {
        onActiveSyncSelect(syncItem);
    }

    return (
        <>
            <ClearButton className="add-sync-button" onClick={onAddSyncClick}>
                <FaPlus />
            </ClearButton>
            {syncItems.length === 0 ? (
                <div>
                    <h1 className="welcome-text">Welcome!</h1>
                    <p>
                        To start, open a YouTube livestream and a Discord tab
                        with the server channel you wish to sync. Then, click
                        the + icon on the top right.
                    </p>
                    <p>Do note that this works only for Discord web!</p>
                    <p>
                        Tip: Upon syncing, Discord will try to scroll up until
                        it reaches the current timestamp of the video. This
                        might take a while if there has been many chat messages
                        ever since. I recommend using Discord's search for
                        messages that is close to the current timestamp of the
                        video.
                    </p>
                </div>
            ) : (
                <div>
                    <h2>Now syncing</h2>
                    <div>
                        {syncItems.map((item) => (
                            <SyncItem
                                data={item}
                                onClick={() => handleSyncItemClick(item)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
