async function run() {
    chrome.runtime.sendMessage({
        message: 'discord_active',
    });

    chrome.runtime.onMessage.addListener((request) => {
        if (request.message === 'discord_start') {
            console.log('YouTube Discord VOD initialized.');
        }

        if (request.message === 'discord_cancel') {
            console.log('YouTube Discord VOD stopped.');
        }

        if (request.message === 'discord_timeupdate') {
            const scroller = document.querySelector(
                "main div[class*='scroller']"
            );

            if (!scroller) {
                console.warn('Chat scroller not found');
            }

            const chatElements = Array.from(
                document.querySelectorAll(
                    `main div[class*='scroller'] time[datetime]`
                )
            ).filter((chatElement) => {
                return (
                    new Date(chatElement.getAttribute('datetime')) <
                    new Date(request.timestamp)
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
    });
}

run();
