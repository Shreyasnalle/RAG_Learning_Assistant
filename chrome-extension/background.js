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

    fetch("http://localhost:8000/api/captions", {
        method : "POST",
        headers : {"content-type" : "application/json"},
        body : JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => {
        chrome.storage.local.set({
            current_video_id: result.video_id,
            current_video_url: result.video_url
        });
    })
    .catch(err => console.error("failed to send to backend", err));
    return true;
})