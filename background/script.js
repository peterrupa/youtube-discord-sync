async function handleMessage(request, sender, sendResponse) {
    if (request.message === 'fetch_youtube_metadata') {
        const { tabIDs } = request;

        const requests = tabIDs.map(async (id) => {
            try {
                const response = await chrome.tabs.sendMessage(id, {
                    message: 'fetch_youtube_metadata',
                });

                return response;
            } catch (e) {
                console.error(e);
            }
        });

        const responses = await Promise.all(requests);

        sendResponse(responses);

        return;
    }

    if (request.message === 'youtube_active') {
        // check if this tab should be playing
        const { selectedYouTubeTab } = await chrome.storage.local.get([
            'selectedYouTubeTab',
        ]);

        if (selectedYouTubeTab && selectedYouTubeTab.tabId === sender.tab.id) {
            chrome.tabs.sendMessage(sender.tab.id, {
                message: 'youtube_start',
            });
        }
    }

    if (request.message === 'discord_active') {
        // check if this tab should be playing
        const { selectedDiscordTab } = await chrome.storage.local.get([
            'selectedDiscordTab',
        ]);

        if (selectedDiscordTab && selectedDiscordTab.tabId === sender.tab.id) {
            chrome.tabs.sendMessage(sender.tab.id, {
                message: 'discord_start',
            });
        }
    }

    if (request.message === 'youtube_timeupdate') {
        const { selectedDiscordTab } = await chrome.storage.local.get([
            'selectedDiscordTab',
        ]);

        chrome.tabs.sendMessage(selectedDiscordTab.tabId, {
            message: 'discord_timeupdate',
            timestamp: request.timestamp,
        });
    }
}

async function run() {
    console.log('YouTube Discord VOD service worker is running.');

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        handleMessage(request, sender, sendResponse);

        return true;
    });
}

run();
