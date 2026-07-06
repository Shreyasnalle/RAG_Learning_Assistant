chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {
    fetch("http://localhost:8000/api/captions", {
        method : "POST",
        headers : {"content-type" : "application/json"},
        body : JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => console.log("send to backend", result))
    .catch(err => console.err("failed to send to backend", err)) ;
    return true ;
})