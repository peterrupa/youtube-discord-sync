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
