async function handleMessage(request, sender, sendResponse) {
    if (request.message === 'fetch_youtube_metadata') {
        try {
            const metadata = getMetadata();

            sendResponse({
                id: new URL(window.location).searchParams.get('v'),
                title: metadata.title,
                channelTitle: metadata.channelTitle,
                thumbnail: metadata.thumbnail,
                isLivestream: metadata.isLivestream,
            });

            return;
        } catch (e) {
            sendResponse(null);
        }
    }

    if (request.message === 'youtube_start') {
        try {
            const metadata = getMetadata();

            const videoElement = await waitForElement('.video-stream');

            function handleTimeUpdate(event) {
                chrome.runtime.sendMessage({
                    message: 'youtube_timeupdate',
                    startDateTime: metadata.startDateTime,
                    endDateTime: metadata.endDateTime,
                    currentTime: event.target.currentTime,
                    duration: videoElement.duration,
                });
            }

            console.log('YouTube Discord VOD initialized.');

            videoElement.addEventListener('timeupdate', handleTimeUpdate);
        } catch (e) {
            sendMessage(null);
        }
    }

    if (request.message === 'youtube_cancel') {
        console.log('YouTube Discord VOD stopped.');

        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
    }
}

chrome.runtime.sendMessage({
    message: 'youtube_active',
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    handleMessage(request, sender, sendResponse);
});

function getMetadata() {
    const title = document
        .querySelector('meta[itemprop="name"]')
        ?.getAttribute('content');
    const thumbnail = document
        .querySelector('link[itemprop="thumbnailUrl"]')
        ?.getAttribute('href');
    const channelTitle = document
        .querySelector('span[itemprop="author"] link[itemprop="name"]')
        ?.getAttribute('content');
    const isLivestream =
        document
            .querySelector(
                'span[itemprop="publication"] meta[itemprop="isLiveBroadcast"]'
            )
            ?.getAttribute('content') === 'True';
    const startDateTime = new Date(
        document
            .querySelector(
                'span[itemprop="publication"] meta[itemprop="startDate"]'
            )
            ?.getAttribute('content')
    );
    const endDateTime = new Date(
        document
            .querySelector(
                'span[itemprop="publication"] meta[itemprop="endDate"]'
            )
            ?.getAttribute('content')
    );

    if (!title || !channelTitle || !startDateTime) {
        throw new Error('Incomplete YouTube metadata');
    }

    return {
        title,
        channelTitle,
        thumbnail,
        isLivestream,
        startDateTime,
        endDateTime,
    };
}

const WAIT_FOR_ELEMENT_DURATION = 2000;

// https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
function waitForElement(selector) {
    return new Promise((resolve, reject) => {
        const timeoutCountdown = setTimeout(() => {
            reject(`Element ${selector} not found.`);
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
