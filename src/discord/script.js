async function run() {
    let tabsToSync = [];

    function handleMessage(request, sender, sendResponse) {
        if (request.message === 'video_timeupdate') {
            const { timestamp } = request;

            const scroller = document.querySelector(
                "main div[class*='scroller']",
            );

            if (!scroller) {
                console.warn('Chat scroller not found');
            }

            const chatElements = Array.from(
                document.querySelectorAll(
                    `main div[class*='scroller'] time[datetime]`,
                ),
            ).filter((chatElement) => {
                return (
                    new Date(chatElement.getAttribute('datetime')) <
                    new Date(timestamp)
                );
            });

            const closestTimeElement = chatElements[chatElements.length - 1];

            if (!chatElements.length) {
                scroller.scrollBy({
                    behavior: 'instant',
                    top: -scroller.clientHeight,
                });

                return;
            }

            const currentChatElement = closestTimeElement.closest('li');

            const distance =
                48 +
                scroller.clientHeight -
                currentChatElement.getBoundingClientRect().top -
                currentChatElement.clientHeight;
            const y = -distance + 30;

            scroller.scrollBy({ behavior: 'instant', top: y });
        }

        if (request.message === 'sync_start') {
            syncStart(request.tabId);
        }

        if (request.message === 'sync_stop') {
            syncStop(request.tabId);
        }

        if (request.message === 'fetch_info') {
            sendResponse({ activeSyncs: tabsToSync });
        }
    }

    chrome.runtime.onMessage.addListener(handleMessage);

    function syncStart(tabId) {
        tabsToSync.push({ tabId });
    }

    function syncStop(tabId) {
        tabsToSync = tabsToSync.filter((tab) => tab.tabId !== tabId);
    }
}

run();
