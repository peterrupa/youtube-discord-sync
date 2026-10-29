import { FaExclamationCircle } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import { DiscordTab } from '../types';

type DiscordItemProps = {
    tab: DiscordTab;
    syncing: boolean;
    onSync: () => void;
    onUnsync: () => void;
};

export function DiscordItem({
    tab,
    syncing,
    onSync,
    onUnsync,
}: DiscordItemProps) {
    function handleClick() {
        if (syncing) {
            onUnsync();
        } else {
            onSync();
        }
    }

    const disabled = tab.state === 'error';

    return (
        <button
            className="cursor-pointer w-full text-left px-4 py-2 flex justify-between items-center  disabled:cursor-default disabled:hover:bg-transparent disabled:[&>*:first-child]:opacity-50 hover:bg-sky-700/20"
            disabled={disabled}
            onClick={handleClick}
        >
            <div>{tab.channelName}</div>
            <div>
                {syncing && <span className="text-white/50">Syncing</span>}
                {tab.error && (
                    <>
                        <FaExclamationCircle
                            className="text-red-500 opacity-100"
                            data-tooltip-id="error-tooltip"
                            data-tooltip-content={tab.error}
                        />
                        <Tooltip id="error-tooltip" />
                    </>
                )}
            </div>
        </button>
    );
}
