// @TODO: handle url changes

async function run() {
    const videoElement = await waitForElement('.video-stream');

    const startDateTimeElement = await waitForElement(
        'meta[itemprop="startDate"]'
    );
    const endDateTimeElement = await waitForElement('meta[itemprop="endDate"]');

    const endDateTime = new Date(endDateTimeElement.getAttribute('content'));
    const startDateTime = new Date(
        startDateTimeElement.getAttribute('content')
    );

    // @TODO: can't differentiate between premieres and livestream...

    // premiers have a varying countdown but it is part of startDate element
    // hence, get the startDateTime by computing it rather than relying on startDate element
    const _startDateTime = new Date(
        endDateTime.getTime() - videoElement.duration * 1000
    );

    function handleTimeUpdate(event) {
        chrome.runtime.sendMessage({
            message: 'youtube_timeupdate',
            timestamp: new Date(
                startDateTime.getTime() + event.target.currentTime * 1000
            ).toISOString(),
        });
    }

    chrome.runtime.sendMessage({
        message: 'youtube_active',
    });

    chrome.runtime.onMessage.addListener((request) => {
        if (request.message === 'youtube_start') {
            console.log('YouTube Discord VOD initialized.');

            videoElement.addEventListener('timeupdate', handleTimeUpdate);
        }

        if (request.message === 'youtube_cancel') {
            console.log('YouTube Discord VOD stopped.');

            videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        }
    });
}

run();

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
