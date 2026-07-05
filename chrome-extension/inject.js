(function () {
    console.log("Caption interceptor loaded") ;
    window.addEventListener("captions intercepted", (event) => {
        console.log("captions intercepted") ;
        const data = {
            videourl : event.detail.sourceurl,
            trackurl : event.detail.trackurl,
            rawtext : event.detail.body,
        }
        fetch("http://localhost:8000/api/cations", {
            method : "POST",
            headers : {"content type" : "application/json"}, 
            body : JSON.stringify(data)
        })
        .then(res => res.json())
        .then(result => console.log("send to backend", result))
        .catch(err => console.error("failed to send to backend", err))
    })
    const originalFetch = window.fetch;
    const originalXHR = window.XMLHttpRequest.prototype.open;
    window.fetch = async function (...args) {
        const response = await originalFetch(...args);
        const url = args[0] ? args[0].toString().toLowerCase() : "";
        if (
            url.includes("timedtext") ||
            url.includes(".vtt") ||
            url.includes(".srt") ||
            url.includes("subtitle") ||
            url.includes("caption") ||
            url.includes("/tracks")
        ) {
            try {
                const clonedResponse = response.clone();
                const rawText = await clonedResponse.text();
                window.dispatchEvent(
                    new CustomEvent(
                        "captions intercepted",
                        {
                            detail: {
                                sourceurl: window.location.href,
                                trackurl: args[0],
                                body: rawText
                            }
                        }
                    )
                )
            }
            catch (err) {

            }
        }
        return response;
    }
    window.XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        this.addEventListener("load", function () {
            const lowerUrl = url ? url.toString().toLowerCase() : "";
            if (
                lowerUrl.includes("timedtext") ||
                lowerUrl.includes(".vtt") ||
                lowerUrl.includes(".srt") ||
                lowerUrl.includes("subtitle") ||
                lowerUrl.includes("caption") ||
                lowerUrl.includes("/tracks")
            ) {
                try {
                    const rawText = this.responseText;
                    window.dispatchEvent(
                        new CustomEvent(
                            "captions intercepted",
                            {
                                detail: {
                                    sourceurl: window.location.href,
                                    trackurl: url,
                                    body: rawText
                                }
                            }
                        )
                    )
                }
                catch (err) {

                }
            }
        })
        return originalXHR.apply(this, [method, url, ...rest]);
    }
})();