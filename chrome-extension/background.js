const API_BASE = 'https://simply-kwrn.onrender.com';

const ingestedVideoIds = new Set();

chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {
    if (data.type === 'LOGIN') {
        chrome.storage.local.set({
            user_id: data.user_id,
            email: data.email,
            access_token: data.access_token,
            login_timestamp: Date.now().toString()
        });
        sendResponse({ ok: true });
        return false;
    }

    if (data.type === 'LOGOUT') {
        chrome.storage.local.remove(['user_id', 'email', 'access_token', 'login_timestamp']);
        sendResponse({ ok: true });
        return false;
    }

    if (data.type === 'CHECK_AUTH') {
        chrome.storage.local.get(['user_id', 'email', 'access_token'], (result) => {
            sendResponse(result);
        });
        return true;
    }

    if (data.videourl && data.rawtext) {
        const vidMatch = data.videourl.match(/[?&]v=([^&]+)/);
        const videoId = vidMatch ? vidMatch[1] : null;

        if (videoId && ingestedVideoIds.has(videoId)) {
            return false;
        }

        if (videoId) ingestedVideoIds.add(videoId);

        handleCaptionPipeline(data).catch(() => {});
        return false;
    }

    return false;
});

async function handleCaptionPipeline(data) {
    let captionsResult;
    try {
        const captionsRes = await fetch(`${API_BASE}/api/captions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                videourl: data.videourl,
                trackurl: data.trackurl || '',
                rawtext: data.rawtext
            })
        });

        if (!captionsRes.ok) {
            console.warn('[SimplyBG] /api/captions returned', captionsRes.status);
            return;
        }
        captionsResult = await captionsRes.json();
    } catch (err) {
        console.warn('[SimplyBG] /api/captions fetch failed:', err);
        return;
    }

    if (!captionsResult || captionsResult.status !== 'success' || !captionsResult.video_id) {
        console.warn('[SimplyBG] /api/captions unexpected response:', captionsResult);
        return;
    }

    const videoId = captionsResult.video_id;
    const videoUrl = captionsResult.video_url;

    await chrome.storage.local.set({
        current_video_id: videoId,
        current_video_url: videoUrl
    });

    try {
        await fetch(`${API_BASE}/api/ingest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ video_url: videoUrl, file_id: videoId })
        });
    } catch (err) {
        console.warn('[SimplyBG] /api/ingest fetch failed:', err);
    }

    try {
        const auth = await chrome.storage.local.get(['user_id', 'access_token']);
        if (auth.user_id) {
            const histRes = await fetch(`${API_BASE}/api/chat-history`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.access_token || auth.user_id}`
                },
                body: JSON.stringify({ user_id: auth.user_id, video_url: videoUrl })
            });
            const histData = await histRes.json();
            const messages = histData.messages || [];
            await chrome.storage.local.set({ current_chat_history: messages });
        }
    } catch (err) {
        console.warn('[SimplyBG] /api/chat-history fetch failed:', err);
    }
}