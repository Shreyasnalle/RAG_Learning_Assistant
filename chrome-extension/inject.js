(function () {
    function isWatchPage() {
        return window.location.pathname === "/watch" && window.location.search.includes("v=");
    }
    const originalFetch = window.fetch;
    const originalXHR = window.XMLHttpRequest.prototype.open;
    window.fetch = async function (...args) {
        const response = await originalFetch(...args);
        if (!isWatchPage()) return response;
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
                const trackUrlStr = args[0] ? args[0].toString() : "";
                const videoIdMatch = trackUrlStr.match(/[?&]v=([^&]+)/);
                const videoUrl = videoIdMatch
                    ? `https://www.youtube.com/watch?v=${videoIdMatch[1]}`
                    : window.location.href;
                const currentVideoId = new URLSearchParams(window.location.search).get("v");
                const captionVideoId = videoIdMatch ? videoIdMatch[1] : null;
                if (captionVideoId && currentVideoId && captionVideoId !== currentVideoId) {
                    return response;
                }
                window.dispatchEvent(
                    new CustomEvent(
                        "captions intercepted",
                        {
                            detail: {
                                sourceurl: videoUrl,
                                trackurl: args[0],
                                body: rawText
                            }
                        }
                    )
                );
            }
            catch (err) {
                
            }
        }
        return response;
    };
    window.XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        this.addEventListener("load", function () {
            if (!isWatchPage()) return;
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
                    const trackUrlStr = url ? url.toString() : "";
                    const videoIdMatch = trackUrlStr.match(/[?&]v=([^&]+)/);
                    const videoUrl = videoIdMatch
                        ? `https://www.youtube.com/watch?v=${videoIdMatch[1]}`
                        : window.location.href;

                    const currentVideoId = new URLSearchParams(window.location.search).get("v");
                    const captionVideoId = videoIdMatch ? videoIdMatch[1] : null;
                    if (captionVideoId && currentVideoId && captionVideoId !== currentVideoId) {
                        return;
                    }
                    window.dispatchEvent(
                        new CustomEvent(
                            "captions intercepted",
                            {
                                detail: {
                                    sourceurl: videoUrl,
                                    trackurl: url,
                                    body: rawText
                                }
                            }
                        )
                    );
                }
                catch (err) {
                    
                }
            }
        });
        return originalXHR.apply(this, [method, url, ...rest]);
    };

    // ---- SPA Navigation: Active caption fetching on video change ----
    // YouTube is a SPA. When navigating between videos, the page doesn't reload,
    // so the fetch interceptor above may miss the caption request (it fires too early).
    // We hook yt-navigate-finish and actively fetch captions after the page settles.

    let spaLastFetchedVideoId = null;

    async function spaFetchCaptionsForVideo() {
        if (!isWatchPage()) return;
        const videoId = new URLSearchParams(window.location.search).get("v");
        if (!videoId) return;
        if (videoId === spaLastFetchedVideoId) return;

        // Wait for player to init with new video's data
        await new Promise(r => setTimeout(r, 2000));

        // Verify we're still on the same video
        if (!isWatchPage()) return;
        const currentId = new URLSearchParams(window.location.search).get("v");
        if (currentId !== videoId) return;

        let captionTrackUrl = null;

        // Read ytInitialPlayerResponse (available in MAIN world via inject.js)
        try {
            const playerResp = window.ytInitialPlayerResponse || {};
            const tracks = playerResp?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
            let track = tracks.find(t => t.languageCode === "en" || t.languageCode === "en-US");
            if (!track) track = tracks[0];
            if (track && track.baseUrl) {
                captionTrackUrl = track.baseUrl + "&fmt=json3";
            }
        } catch (e) {}

        // Fallback to direct timedtext API
        if (!captionTrackUrl) {
            captionTrackUrl = `https://www.youtube.com/api/timedtext?lang=en&v=${videoId}&fmt=json3`;
        }

        try {
            const res = await originalFetch(captionTrackUrl);
            if (!res.ok) return;
            const rawText = await res.text();
            if (!rawText || rawText.length < 30) return;

            spaLastFetchedVideoId = videoId;

            window.dispatchEvent(
                new CustomEvent("captions intercepted", {
                    detail: {
                        sourceurl: `https://www.youtube.com/watch?v=${videoId}`,
                        trackurl: captionTrackUrl,
                        body: rawText
                    }
                })
            );
        } catch (err) {
            // No captions available or network issue — silently ignore
        }
    }

    window.addEventListener("yt-navigate-finish", spaFetchCaptionsForVideo);
    window.addEventListener("yt-page-data-updated", spaFetchCaptionsForVideo);
})();