async function handleMessage(request, sender, sendResponse) {
    if (request.message === 'fetch_youtube_metadata') {
        const metadata = await getMetadata();

        sendResponse({
            id: new URL(window.location).searchParams.get('v'),
            title: metadata.name,
            channelTitle: metadata.author,
            thumbnail: metadata.thumbnailUrl[0],
            isLivestream:
                metadata.publication?.[0]['@type'] === 'BroadcastEvent',
        });

        return;
    }

    if (request.message === 'youtube_start') {
        const metadata = await getMetadata();

        if (!metadata.publication) {
            return;
        }

        const videoElement = await waitForElement('.video-stream');

        const endDateTime = new Date(metadata.publication[0].endDate);
        const startDateTime = new Date(metadata.publication[0].startDate);

        function handleTimeUpdate(event) {
            chrome.runtime.sendMessage({
                message: 'youtube_timeupdate',
                startDateTime,
                endDateTime,
                currentTime: event.target.currentTime,
                duration: videoElement.duration,
            });
        }

        console.log('YouTube Discord VOD initialized.');

        videoElement.addEventListener('timeupdate', handleTimeUpdate);
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

async function getMetadata() {
    const scriptTag = await waitForElement('#scriptTag');

    const metadata = JSON.parse(scriptTag.textContent);

    return metadata;
}

// https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
function waitForElement(selector) {
    return new Promise((resolve) => {
        if (document.querySelector(selector)) {
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
