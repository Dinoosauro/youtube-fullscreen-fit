let check = { // Key: checkbox ID, Value: the property to change in the storage
    "autoCover": "AutoApply",
    "stretch": "IsStretched",
}
for (let item in check) {
    document.getElementById(item).onchange = () => setItem(check[item], document.getElementById(item).checked ? "1" : "0"); // If checked, write 1 to the storage. Otherwise, write 0.
    (typeof chrome !== "undefined" ? chrome : browser).storage.sync.get([check[item]]).then((res) => { if ((res[check[item]] ?? "") !== "") document.getElementById(item).checked = res[check[item]] === "1" }); // Get the value of that item and update the DOM
}
function setItem(key, value) {
    (typeof chrome !== "undefined" ? chrome : browser).storage.sync.set({ [key]: value })
}
document.getElementById("fillHeight").onchange = () => {
    setItem("HeightFill", document.getElementById("fillHeight").value);
    updateFillHeightDesc();
};
function updateFillHeightDesc() {
    switch (document.getElementById("fillHeight").value) {
        case "0":
            document.getElementById("fillHeightMeaning").textContent = "";
            document.getElementById("fillHeightMeaning").style.display = "none";
            break;
        case "1":
            document.getElementById("fillHeightMeaning").textContent = "The video will be scaled only if there are black bars at the top/bottom of the screen. If the video fills the height of the screen, it won't be scaled. This can be helpful if you listen to music videos, and you want to continue seeing the album art of the music you're listening to.";
            document.getElementById("fillHeightMeaning").style.display = "block";
            break;
        case "2":
            document.getElementById("fillHeightMeaning").textContent = "The video will be scaled only if there are black bars at the left/right of the screen. If the video fills the width of the screen, it won't be scaled.";
            document.getElementById("fillHeightMeaning").style.display = "block";
            break;
    }
}
(typeof chrome !== "undefined" ? chrome : browser).storage.sync.get(["HeightFill"]).then((res) => { document.getElementById("fillHeight").value = res["HeightFill"] ?? "0"; updateFillHeightDesc() });

document.getElementById("grantAccess").onclick = () => { // Request the access to the YouTube webpage
    typeof chrome !== "undefined" ? chrome.permissions.request({ origins: ["https://*.youtube.com/*"] }, (() => checkPermission())) : browser.permissions.request({ origins: ["https://*.youtube.com/*"] }).then(() => checkPermission());
}
function checkPermission() { // Check if the user has granted permission to the extension to access the YouTube webpage, so that, if false, a warning on the extension UI will be shown.
    typeof chrome !== "undefined" ? chrome.permissions.contains({ origins: ["https://*.youtube.com/*"] }, ((permission) => permissionStep2(permission))) : browser.permissions.contains({ origins: ["https://*.youtube.com/*"] }).then((permission) => permissionStep2(permission));
    function permissionStep2(permission) {
        document.getElementById("requireAccess").style.display = permission ? "none" : "block";
    }
}
checkPermission();