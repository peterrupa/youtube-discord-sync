async function run() {
    let tabsToSync = [];

    const microformatElement = await waitForElement('#microformat');
    const videoStreamElement = await waitForElement('.video-stream');

    let metadata = getMetadata();

    function handleMessage(request, sender, sendResponse) {
        if (request.message === 'fetch_info') {
            sendResponse({ metadata, activeSyncs: tabsToSync });
        }

        if (request.message === 'sync_start') {
            const { tabId } = request;

            syncStart(tabId);
        }

        if (request.message === 'sync_stop') {
            const { tabId } = request;

            syncStop(tabId);
        }

        if (request.message === 'sync_option_update') {
            const { tabId, options } = request;

            tabsToSync = tabsToSync.map((tab) => {
                if (tab.tabId === tabId) {
                    return {
                        ...tab,
                        options: {
                            ...tab.options,
                            ...options,
                        },
                    };
                }

                return tab;
            });
        }
    }

    chrome.runtime.onMessage.addListener(handleMessage);

    if (!microformatElement || !videoStreamElement) {
        return;
    }

    // always send a timestamp update whenever the main video element is played
    function handleTimeUpdate(event) {
        tabsToSync.forEach((tab) => {
            if (tab.options.isPaused) {
                return;
            }

            const currentTime = event.target.currentTime;
            const duration = videoStreamElement.duration;

            let startDateTime = metadata.startDateTime;
            let endDateTime = metadata.endDateTime;

            startDateTime = new Date(startDateTime);
            endDateTime = new Date(endDateTime);

            if (tab.options.isPremiere) {
                // startDateTime does not include the countdown timer
                // Instead, lets figure out the startDateTime by using the video length and endStartDate
                // Why not use that for actual livestreams? I don't know, when I do this for livestreams, there's a noticable delay in chat
                startDateTime = new Date(
                    endDateTime.getTime() - duration * 1000,
                );
            }

            const timestamp = new Date(
                startDateTime.getTime() +
                    (currentTime - tab.options.offset) * 1000,
            ).toISOString();

            chrome.runtime.sendMessage({
                message: 'video_timeupdate',
                tabId: tab.tabId,
                timestamp,
            });
        });
    }

    videoStreamElement.addEventListener('timeupdate', handleTimeUpdate);

    // everytime the metadata changes, update the metadata internal state
    const microformatObserver = new MutationObserver((mutations) => {
        metadata = getMetadata();
    });

    microformatObserver.observe(microformatElement, {
        childList: true,
        subtree: true,
    });

    // reset the metadata information when navigating away from a video, and close any ongoing syncs
    const videoStreamObserver = new MutationObserver((mutations) => {
        if (!videoStreamElement.hasAttribute('src')) {
            metadata = null;

            clearAllSync();
        }
    });

    videoStreamObserver.observe(videoStreamElement, { attributes: true });

    function syncStart(tabId) {
        tabsToSync.push({
            tabId,
            options: {
                offset: 3,
                isPaused: false,
                isPremiere: false,
            },
        });
    }

    function syncStop(tabId) {
        tabsToSync = tabsToSync.filter((tab) => tab.tabId !== tabId);
    }

    function clearAllSync() {
        tabsToSync.forEach((tab) => {
            chrome.runtime.sendMessage({
                message: 'sync_stop',
                tabId: tab.tabId,
            });
        });

        tabsToSync = [];
    }
}

run();

function getMetadata() {
    const scriptElement = document.querySelector(
        '#microformat script[type="application/ld+json"]',
    );

    if (!scriptElement) {
        return null;
    }

    const microformat = JSON.parse(scriptElement.textContent);

    const url = new URL(microformat['@id']);

    let id = null;

    if (url.pathname.includes('/live/')) {
        id = url.pathname.split('/live/')[1];
    } else {
        id = url.searchParams.get('v');
    }

    const title = microformat.name;
    const thumbnail = microformat.thumbnailUrl?.[0];
    const channelTitle = microformat.author;

    const publication = microformat.publication[0] ?? {};

    const isLivestream = publication.isLiveBroadcast ?? false;
    const startDateTime = new Date(publication.startDate);
    const endDateTime = new Date(publication.endDate);

    if (!title || !channelTitle || !startDateTime) {
        throw new Error('Incomplete YouTube metadata');
    }

    return {
        id,
        title,
        channelTitle,
        thumbnail,
        isLivestream,
        startDateTime,
        endDateTime,
    };
}

// https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
function waitForElement(selector) {
    const WAIT_FOR_ELEMENT_DURATION = 2000;

    return new Promise((resolve, reject) => {
        const timeoutCountdown = setTimeout(() => {
            resolve(null);
        }, WAIT_FOR_ELEMENT_DURATION);

        if (document.querySelector(selector)) {
            clearTimeout(timeoutCountdown);

            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver((mutations) => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    });
}
