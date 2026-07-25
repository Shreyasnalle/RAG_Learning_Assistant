chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {
    if (data.type === 'LOGIN') {
        chrome.storage.local.set({
            user_id: data.user_id,
            email: data.email,
            access_token: data.access_token,
            login_timestamp: Date.now().toString()
        });
        return true;
    }

    if (data.type === 'LOGOUT') {
        chrome.storage.local.remove(['user_id', 'email', 'access_token', 'login_timestamp']);
        return true;
    }

    if (data.type === 'CHECK_AUTH') {
        chrome.storage.local.get(['user_id', 'email', 'access_token'], (result) => {
            sendResponse(result);
        });
        return true;
    }

    const API_BASE = 'http://localhost:8000';

    fetch(`${API_BASE}/api/captions`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => {
        if (result.status !== 'success' || !result.video_id) {
            return;
        }

        const videoId = result.video_id;
        const videoUrl = result.video_url;

        chrome.storage.local.set({
            current_video_id: videoId,
            current_video_url: videoUrl
        });

        fetch(`${API_BASE}/api/ingest`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                video_url: videoUrl,
                file_id: videoId
            })
        })
        .then(res => res.json())
        .then(ingestResult => {
            chrome.storage.local.get(['user_id', 'access_token'], (auth) => {
                if (auth.user_id) {
                    fetch(`${API_BASE}/api/chat-history`, {
                        method: 'POST',
                        headers: { 
                            'content-type': 'application/json',
                            'Authorization': `Bearer ${auth.access_token || auth.user_id}`
                        },
                        body: JSON.stringify({
                            user_id: auth.user_id,
                            video_url: videoUrl
                        })
                    })
                    .then(res => res.json())
                    .then(historyResult => {
                        const messages = historyResult.messages || [];
                        chrome.storage.local.set({
                            current_chat_history: messages
                        });
                    })
                    .catch(() => {});
                }
            });
        })
        .catch(() => {});
    })
    .catch(() => {});

    return true;
});