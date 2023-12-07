let needsToBeApplied = {
    default: true, // If the extension should fill the video automatically
    force: false, // If the user has requested to fill the video
    fillStyle: "cover" // The style the video should be filled. Can be "cover" (scale it) or "fill" (stretch it)
};
function readLocalVal(val) { // Read the value of the local storage for extension.
    needsToBeApplied.default = val.AutoApply !== "0";
    needsToBeApplied.fillStyle = val.IsStretched !== "0" ? "cover" : "fill";
}
function reSyncSettings() { // Get settings from the local storage for extension
    (chrome ?? "") !== "" ? chrome.storage.sync.get(["AutoApply", "IsStretched"], (val) => readLocalVal(val)) : browser.storage.sync.get(["AutoApply", "IsStretched"], (val) => readLocalVal(val));
}
reSyncSettings();
let buttons = { // The object that'll contain the buttons to adapt the video to screen size (or go back to normal view)
    resize: (() => { // Fill the video
        let clickImg = btnCreate({ hover: "Fill the video to screen width and height", img: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="-4 -4 32 32"><path fill="#f0f0f0" d="M21.25 13a.75.75 0 0 1 .743.648l.007.102v5a3.25 3.25 0 0 1-3.065 3.245L18.75 22h-4.668c.537-.385.974-.9 1.265-1.499l3.403-.001a1.75 1.75 0 0 0 1.744-1.607l.006-.143v-5a.75.75 0 0 1 .75-.75Zm-9.5-4A3.25 3.25 0 0 1 15 12.25v6.5A3.25 3.25 0 0 1 11.75 22h-6.5A3.25 3.25 0 0 1 2 18.75v-6.5A3.25 3.25 0 0 1 5.25 9h6.5Zm-5.689 4.103a.5.5 0 0 0-.06.24v4.315a.5.5 0 0 0 .739.439l3.955-2.158a.5.5 0 0 0 0-.878L6.74 12.903a.5.5 0 0 0-.679.2ZM18.751 2a3.25 3.25 0 0 1 3.244 3.066L22 5.25v5a.75.75 0 0 1-1.493.102l-.007-.102v-5a1.75 1.75 0 0 0-1.606-1.744L18.75 3.5h-5a.75.75 0 0 1-.102-1.493L13.75 2h5Zm-8.5 0a.75.75 0 0 1 .1 1.493l-.1.007h-5a1.75 1.75 0 0 0-1.745 1.606L3.5 5.25v3.402c-.599.292-1.114.73-1.5 1.266V5.25a3.25 3.25 0 0 1 3.066-3.245L5.25 2h5Z"/></svg>`, attr: "data-ytfullscreenfitresize" });
        clickImg.onclick = () => { // Force to adapt the video
            needsToBeApplied.force = true;
            applyItem();
        }
        return clickImg;
    })(),
    exit: (() => { // Go back to normal view
        let clickImg = btnCreate({ hover: "Make the video go back to previous screen and height", attr: "data-ytfullscreenfitexit", img: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="-4 -4 32 32"><path fill="#f0f0f0" d="M5.25 3A3.25 3.25 0 0 0 2 6.25v11.5A3.25 3.25 0 0 0 5.25 21h13.5A3.25 3.25 0 0 0 22 17.75V6.25A3.25 3.25 0 0 0 18.75 3H5.25ZM9 9.25a1 1 0 0 1 1.482-.876l5 2.75a1 1 0 0 1 0 1.753l-5 2.75A1 1 0 0 1 9 14.75v-5.5Z"/></svg>` });
        clickImg.onclick = () => {
            needsToBeApplied.force = false; // Avoid restoring the video as filled
            needsToBeApplied.default = false; // Avoid restoring the video as filled
            document.querySelector(".html5-video-container").querySelector("video").style.objectFit = "contain"; // Go back to having the video contained entirely in the page (so with borders)
            removeItem("data-ytfullscreenfitexit"); // Remove this button
            if ((document.querySelector("[data-ytfullscreenfitresize]") ?? "") === "") document.querySelector(".ytp-right-controls").prepend(buttons.resize); // And put the resize button
        };
        return clickImg;
    })()
}
let observer = new MutationObserver(() => { // Observe for mutations in the classes of the "movie_player" div. When full screen, this item obtains the "ytp-fullscreen" class.
    if (document.getElementById("movie_player").classList.contains("ytp-fullscreen")) { // Fullscreen
        if (needsToBeApplied.default || needsToBeApplied.force) applyItem(); else if ((document.querySelector("[data-ytfullscreenfitresize]") ?? "") === "") document.querySelector(".ytp-right-controls").prepend(buttons.resize); // If it needs to be applied, do it. Otherwise, show the button to enlarge the video.
    } else { // Probably not fullscreen
        if ((document.fullscreenElement ?? "") === "") { // No fullscreen element found
            needsToBeApplied.force = false; // Avoid filling the video again
            reSyncSettings(); // And get previous settings
        }
        for (let item of ["data-ytfullscreenfitresize", "data-ytfullscreenfitexit"]) removeItem(item); // Remove the buttons
    }
})
function removeItem(selector) { // Checks if the provided selector (and its hover element) exists, and, if true, removes it from the DOM.
    if ((document.querySelector(`[${selector}]`) ?? "") !== "") document.querySelector(`[${selector}]`).remove();
    if ((document.querySelector(`[${selector}hover]`) ?? "") !== "") document.querySelector(`[${selector}hover]`).remove();
}
function btnCreate({ attr, img, hover }) { // Create the button in the YouTube video player.
    // Button image
    let clickImg = document.createElement("img");
    clickImg.classList.add("ytp-button");
    clickImg.setAttribute(attr, "");
    clickImg.src = URL.createObjectURL(new Blob([img], { type: "image/svg+xml" }));
    // First hover container
    let hoverElement = document.createElement("div");
    hoverElement.classList.add("ytp-tooltip", "ytp-rounded-tooltip", "ytp-bottom");
    // Second hover container
    let hoverContainer = document.createElement("div");
    hoverContainer.classList.add("ytp-tooltip-text-wrapper");
    // Hover text
    let hoverText = document.createElement("span");
    hoverText.textContent = hover;
    hoverText.style.fontSize = "1.8rem";
    hoverText.style.color = getComputedStyle(document.querySelector(".ytp-time-duration")).color; // Get the color used in other parts of the player
    hoverText.classList.add("ytp-tooltip-text", "ytp-tooltip-text-no-title");
    hoverContainer.append(hoverText);
    hoverElement.append(hoverContainer);
    hoverElement.setAttribute(`${attr}hover`, "");
    hoverElement.style = "position: absolute; z-index: 999";
    clickImg.onmouseenter = () => { // Show the hover when the mouse is on the button
        hoverElement.style.top = `${clickImg.getBoundingClientRect().top - 30}px`;
        hoverElement.style.left = `${clickImg.getBoundingClientRect().left - 15}px`;
        document.body.append(hoverElement);
    }
    clickImg.onmouseleave = () => { // And remove it when the mouse has left the item
        hoverElement.remove();
    }
    return clickImg;
}
function applyItem() { // Update the YouTube video player
    removeItem("data-ytfullscreenfitresize");
    let element = document.querySelector(".html5-video-container").querySelector("video"); // Get the video element
    element.style.height = `${document.documentElement.clientHeight}px`;  // The player must fill the screen
    element.style.width = `${document.documentElement.clientWidth}px`; // The player must fill the screen
    element.style.objectFit = needsToBeApplied.fillStyle; // Apply the objectFit style, so that the content is filled
    ["top", "left"].forEach(e => { element.style[e] = "0px" }); // Put it on the top of the page
    if ((document.querySelector("[data-ytfullscreenfitexit]") ?? "") === "") document.querySelector(".ytp-right-controls").prepend(buttons.exit); // If no "exit" button is on the DOM, add one, so that the user can return to the classic video view.
}
observer.observe(document.getElementById("movie_player"), { attributes: true }) // Start observing the movie_player