async function handleMessage(request, sender, sendResponse) {
    if (request.message === 'video_timeupdate') {
        const { tabId } = request;

        chrome.tabs.sendMessage(tabId, {
            message: 'video_timeupdate',
            timestamp: request.timestamp,
        });
    }

    // this case happens when youtube content script triggers the stop
    if (request.message === 'sync_stop') {
        const { tabId } = request;

        chrome.tabs.sendMessage(tabId, {
            message: 'sync_stop',
            tabId: sender.tab.id,
        });

        const youtubeTabsRaw = await chrome.tabs.query({
            url: [
                'https://www.youtube.com/watch*',
                'https://www.youtube.com/live/*',
            ],
        });

        let activeSyncsCount = 0;

        for (const tab of youtubeTabsRaw) {
            if (!tab.id) {
                continue;
            }

            const response = await chrome.tabs.sendMessage(tab.id, {
                message: 'fetch_info',
            });

            if (response?.activeSyncs?.length > 0) {
                activeSyncsCount = activeSyncsCount + 1;
            }
        }

        if (activeSyncsCount === 0) {
            browser.action.setIcon({
                path: {
                    16: '../assets/16_gray.png',
                    32: '../assets/32_gray.png',
                    48: '../assets/48_gray.png',
                    128: '../assets/128_gray.png',
                },
            });
        }
    }
}

async function run() {
    console.log('YouTube Discord VOD service worker is running.');

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        handleMessage(request, sender, sendResponse);

        return true;
    });

    // initially, set all icons to gray
    browser.action.setIcon({
        path: {
            16: '../assets/16_gray.png',
            32: '../assets/32_gray.png',
            48: '../assets/48_gray.png',
            128: '../assets/128_gray.png',
        },
    });
}

run();
