import { useEffect, useState } from 'react';
import { getCurrentTab } from '../utils/chrome';
import { Default } from './Default';
import { Discord } from './Discord';
import { YouTube } from './YouTube';

function App() {
    const [mode, setMode] = useState<'youtube' | 'discord' | 'default' | null>(
        null,
    );

    function startup() {
        async function run() {
            const tab = await getCurrentTab();

            const url = new URL(tab.url ?? '');

            if (url.hostname.includes('youtube.com')) {
                setMode('youtube');
            } else if (url.hostname.includes('discord.com')) {
                setMode('discord');
            } else {
                setMode('default');
            }

            chrome.runtime.sendMessage({
                message: 'popup_opened',
                tabId: tab.id,
            });
        }

        run();
    }

    useEffect(startup, []);

    if (mode === 'youtube') {
        return <YouTube />;
    } else if (mode === 'discord') {
        return <Discord />;
    }

    return <Default />;
}

export default App;
