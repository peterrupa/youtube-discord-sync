import { FaPlus } from 'react-icons/fa';

import { SyncItem as SyncItemType } from '../types';
import { ClearButton } from './ClearButton';
import { SyncItem } from './SyncItem';

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

    const isSyncing = syncItems.length;

    return (
        <div>
            <div className="flex justify-between mb-4">
                <h1 className="text-xl font-bold">
                    {isSyncing ? 'Now syncing' : 'Welcome!'}
                </h1>
                <ClearButton onClick={onAddSyncClick}>
                    <FaPlus />
                </ClearButton>
            </div>
            <div>
                {isSyncing ? (
                    syncItems.map((item) => (
                        <SyncItem
                            data={item}
                            onClick={() => handleSyncItemClick(item)}
                        />
                    ))
                ) : (
                    <>
                        <p className="mb-2">
                            To start, open a YouTube livestream and a Discord
                            tab with the server channel you wish to sync. Then,
                            click the + icon on the top right.
                        </p>
                        <p className="mb-2">
                            Do note that this works only for Discord web!
                        </p>
                        <p>
                            Tip: Upon syncing, Discord will try to scroll up
                            until it reaches the current timestamp of the video.
                            This might take a while if there has been many chat
                            messages ever since. I recommend using Discord's
                            search for messages that is close to the current
                            timestamp of the video.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
