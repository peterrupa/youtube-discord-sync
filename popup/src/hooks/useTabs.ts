import { Tab } from '../types';

import { useState, useEffect } from 'react';

export function useTabs(): Tab[] | null {
    const [tabs, setTabs] = useState<Tab[] | null>(null);

    function fetchTabs() {
        async function run() {
            const tabs = await chrome.tabs.query({
                url: [
                    'https://www.youtube.com/watch*',
                    'https://discord.com/channels/*/*',
                ],
            });

            setTabs(
                tabs.map((tab) => {
                    const type = tab.url?.startsWith('https://discord')
                        ? 'discord'
                        : 'youtube';

                    return {
                        tabId: tab.id ?? 1,
                        url: tab.url ?? '',
                        favIconUrl: tab.favIconUrl ?? '',
                        title: tab.title ?? '',
                        type,
                    };
                })
            );
        }

        run();
    }

    useEffect(fetchTabs, []);

    return tabs;
}
