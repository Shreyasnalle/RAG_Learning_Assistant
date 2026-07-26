(function () {
    function isWatchPage() {
        return window.location.pathname === "/watch" && window.location.search.includes("v=");
    }

    const originalFetch = window.fetch;
    const originalXHR = window.XMLHttpRequest.prototype.open;
    let spaLastFetchedVideoId = null;

    function dispatchCaptions(videoUrl, trackUrl, rawText) {
        if (!rawText || rawText.length < 30) return;
        const videoIdMatch = videoUrl.match(/[?&]v=([^&]+)/);
        const videoId = videoIdMatch ? videoIdMatch[1] : null;
        if (!videoId) return;

        spaLastFetchedVideoId = videoId;
        window.dispatchEvent(
            new CustomEvent("captions intercepted", {
                detail: {
                    sourceurl: `https://www.youtube.com/watch?v=${videoId}`,
                    trackurl: trackUrl || "",
                    body: rawText
                }
            })
        );
    }


    window.fetch = async function (...args) {
        const response = await originalFetch(...args);
        if (isWatchPage()) {
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
                    const currentVideoId = new URLSearchParams(window.location.search).get("v");
                    const videoUrl = `https://www.youtube.com/watch?v=${currentVideoId}`;
                    dispatchCaptions(videoUrl, trackUrlStr, rawText);
                } catch (err) {}
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
                    const currentVideoId = new URLSearchParams(window.location.search).get("v");
                    const videoUrl = `https://www.youtube.com/watch?v=${currentVideoId}`;
                    dispatchCaptions(videoUrl, trackUrlStr, rawText);
                } catch (err) {}
            }
        });
        return originalXHR.apply(this, [method, url, ...rest]);
    };

    async function extractAndFetchCaptions() {
        if (!isWatchPage()) return;
        const videoId = new URLSearchParams(window.location.search).get("v");
        if (!videoId) return;

        let captionTracks = [];


        try {
            const mp = document.getElementById("movie_player");
            if (mp && typeof mp.getOption === "function") {
                const tracklist = mp.getOption("captions", "tracklist");
                if (Array.isArray(tracklist) && tracklist.length > 0) {
                    captionTracks = tracklist;
                }
            }
        } catch (e) {}


        if (captionTracks.length === 0) {
            try {
                const flexy = document.querySelector("ytd-watch-flexy");
                if (flexy && flexy.playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks) {
                    captionTracks = flexy.playerData.captions.playerCaptionsTracklistRenderer.captionTracks;
                }
            } catch (e) {}
        }


        if (captionTracks.length === 0) {
            try {
                const mp = document.getElementById("movie_player");
                if (mp && typeof mp.getPlayerResponse === "function") {
                    const response = mp.getPlayerResponse();
                    if (response?.captions?.playerCaptionsTracklistRenderer?.captionTracks) {
                        captionTracks = response.captions.playerCaptionsTracklistRenderer.captionTracks;
                    }
                }
            } catch (e) {}
        }


        if (captionTracks.length === 0) {
            try {
                if (window.ytInitialPlayerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks) {
                    captionTracks = window.ytInitialPlayerResponse.captions.playerCaptionsTracklistRenderer.captionTracks;
                }
            } catch (e) {}
        }


        if (captionTracks.length === 0) {
            try {
                const rawResp = window.ytplayer?.config?.args?.raw_player_response;
                const parsed = typeof rawResp === "string" ? JSON.parse(rawResp) : rawResp;
                if (parsed?.captions?.playerCaptionsTracklistRenderer?.captionTracks) {
                    captionTracks = parsed.captions.playerCaptionsTracklistRenderer.captionTracks;
                }
            } catch (e) {}
        }

        let captionTrackUrl = null;
        if (captionTracks.length > 0) {
            let track = captionTracks.find(t => t.languageCode === "en" || t.languageCode === "en-US" || t.languageCode === "en-GB" || (t.vssId && t.vssId.includes(".en")));
            if (!track) track = captionTracks[0];
            if (track) {
                const base = track.baseUrl || track.url || "";
                captionTrackUrl = base + (base && !base.includes("fmt=") ? "&fmt=json3" : "");
            }
        }

        if (!captionTrackUrl) {
            captionTrackUrl = `https://www.youtube.com/api/timedtext?lang=en&v=${videoId}&fmt=json3`;
        }

        try {
            const res = await originalFetch(captionTrackUrl);
            if (!res.ok) return;
            const rawText = await res.text();
            if (!rawText || rawText.length < 30) return;

            dispatchCaptions(`https://www.youtube.com/watch?v=${videoId}`, captionTrackUrl, rawText);
        } catch (err) {}
    }

    function triggerCaptionExtraction() {
        if (!isWatchPage()) return;
        const videoId = new URLSearchParams(window.location.search).get("v");
        if (!videoId) return;

        extractAndFetchCaptions();
        setTimeout(extractAndFetchCaptions, 300);
        setTimeout(extractAndFetchCaptions, 1000);
        setTimeout(extractAndFetchCaptions, 2500);
    }

    window.addEventListener("yt-navigate-finish", () => {
        spaLastFetchedVideoId = null;
        triggerCaptionExtraction();
    });
    window.addEventListener("yt-page-data-updated", triggerCaptionExtraction);
    window.addEventListener("popstate", triggerCaptionExtraction);

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    history.pushState = function (...args) {
        originalPushState.apply(this, args);
        spaLastFetchedVideoId = null;
        triggerCaptionExtraction();
    };
    history.replaceState = function (...args) {
        originalReplaceState.apply(this, args);
        triggerCaptionExtraction();
    };

    document.addEventListener("DOMContentLoaded", triggerCaptionExtraction);
    window.addEventListener("load", triggerCaptionExtraction);

    triggerCaptionExtraction();
})();