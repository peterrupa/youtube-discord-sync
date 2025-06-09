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

        const responses = (await Promise.all(requests)).filter(
            (response) => !!response
        );

        sendResponse(responses);

        return;
    }

    if (request.message === 'youtube_active') {
        // check if this tab should be playing
        const { syncItems } = await chrome.storage.local.get(['syncItems']);

        if (!syncItems) {
            return;
        }

        if (
            syncItems
                .map((syncItem) => syncItem.youtubeTab.tabId)
                .includes(sender.tab.id)
        ) {
            chrome.tabs.sendMessage(sender.tab.id, {
                message: 'youtube_start',
            });
        }
    }

    if (request.message === 'discord_active') {
        // check if this tab should be playing
        const { syncItems } = await chrome.storage.local.get(['syncItems']);

        if (!syncItems) {
            return;
        }

        if (
            syncItems
                .map((syncItem) => syncItem.discordTab.tabId)
                .includes(sender.tab.id)
        ) {
            chrome.tabs.sendMessage(sender.tab.id, {
                message: 'discord_start',
            });
        }
    }

    if (request.message === 'youtube_timeupdate') {
        const { syncItems } = await chrome.storage.local.get(['syncItems']);

        if (!syncItems) {
            return;
        }

        // @TODO: make this a filter to support 1:n youtube:discord sync
        const syncItem = syncItems.find(
            (syncItem) => syncItem.youtubeTab.tabId === sender.tab.id
        );

        if (!syncItem) {
            return;
        }

        if (syncItem.options.isPaused) {
            return;
        }

        const { currentTime, duration } = request;
        let { startDateTime, endDateTime } = request;

        startDateTime = new Date(startDateTime);
        endDateTime = new Date(endDateTime);

        if (syncItem.options.isPremiere) {
            // startDateTime does not include the countdown timer
            // Instead, lets figure out the startDateTime by using the video length and endStartDate
            // Why not use that for actual livestreams? I don't know, when I do this for livestreams, there's a noticable delay in chat
            startDateTime = new Date(endDateTime.getTime() - duration * 1000);
        }

        const timestamp = new Date(
            startDateTime.getTime() +
                (currentTime - syncItem.options.offset) * 1000
        ).toISOString();

        chrome.tabs.sendMessage(syncItem.discordTab.tabId, {
            message: 'discord_timeupdate',
            timestamp: timestamp,
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
