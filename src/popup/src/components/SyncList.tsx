import { FaPlus } from 'react-icons/fa';

import { SyncItem as SyncItemType } from '../types';
import { ClearButton } from './ClearButton';
import { SyncItem } from './SyncItem';

type SyncListProps = {
    syncItems: SyncItemType[];
    onAddSyncClick: () => void;
    onActiveSyncSelect: (syncItem: SyncItemType) => void;
};

export function SyncList({
    syncItems,
    onAddSyncClick,
    onActiveSyncSelect,
}: SyncListProps) {
    function handleSyncItemClick(syncItem: SyncItemType) {
        onActiveSyncSelect(syncItem);
    }

    return (
        <div>
            <div className="flex justify-between mb-4">
                <h1 className="text-xl font-bold">Now syncing</h1>
                <ClearButton onClick={onAddSyncClick}>
                    <FaPlus />
                </ClearButton>
            </div>
            <div>
                {syncItems.map((item) => (
                    <SyncItem
                        data={item}
                        onClick={() => handleSyncItemClick(item)}
                    />
                ))}
            </div>
        </div>
    );
}
