export async function getCurrentTab() {
    return (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
}

export async function getDiscordTabs() {
    return await chrome.tabs.query({
        url: 'https://discord.com/*',
    });
}
