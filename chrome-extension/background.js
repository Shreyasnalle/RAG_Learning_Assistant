chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {
    if (data.type === 'LOGIN') {
        chrome.storage.local.set({
            user_id: data.user_id,
            email: data.email,
            access_token: data.access_token
        });
        return true;
    }

    if (data.type === 'LOGOUT') {
        chrome.storage.local.remove(['user_id', 'email', 'access_token']);
        return true;
    }

    if (data.type === 'CHECK_AUTH') {
        chrome.storage.local.get(['user_id', 'email', 'access_token'], (result) => {
            sendResponse(result);
        });
        return true;
    }

    // Caption data received from content.js — save to backend then immediately ingest
    const API_BASE = 'http://localhost:8000';

    fetch(`${API_BASE}/api/captions`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => {
        if (result.status !== 'success' || !result.video_id) {
            // Captions skipped (too small / invalid) — don't ingest
            return;
        }

        const videoId = result.video_id;
        const videoUrl = result.video_url;

        // Store current video info for popup.js to read
        chrome.storage.local.set({
            current_video_id: videoId,
            current_video_url: videoUrl
        });

        // Immediately trigger ingest in the background so chunks are ready before user asks
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
            if (ingestResult.already_ingested) {
                console.log(`[Simply] Video already ingested: ${videoUrl}`);
            } else if (ingestResult.success) {
                console.log(`[Simply] Ingested ${ingestResult.chunks_stored} chunks for: ${videoUrl}`);
            } else {
                console.warn('[Simply] Ingest failed:', ingestResult.error);
            }
        })
        .catch(err => console.error('[Simply] Ingest error:', err));
    })
    .catch(err => console.error('[Simply] Failed to send captions to backend:', err));

    return true;
});