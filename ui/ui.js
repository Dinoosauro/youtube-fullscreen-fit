let check = { // Key: checkbox ID, Value: the property to change in the storage
    "autoCover": "AutoApply",
    "stretch": "IsStretched"
}
for (let item in check) {
    document.getElementById(item).onchange = () => { // If checked, write 1 to the storage. Otherwise, write 0.
        (chrome ?? "") !== "" ? chrome.storage.sync.set({ [check[item]]: document.getElementById(item).checked ? "1" : "0" }) : browser.storage.sync.set({ [check[item]]: document.getElementById(item).checked ? "1" : "0" });
    }
    (chrome ?? "") !== "" ? chrome.storage.sync.get([check[item]], (res) => { document.getElementById(item).checked = res[check[item]] !== "0" }) : chrome.storage.sync.get([check[item]]).then((res) => { document.getElementById(item).checked = res[check[item]] !== "0" }); // Get the value of that item and update the DOM
}
document.getElementById("grantAccess").onclick = () => { // Request the access to the YouTube webpage
    (chrome ?? "") !== "" ? chrome.permissions.request({origins: ["https://*.youtube.com/*"]}, (() => checkPermission())) : browser.permissions.request({origins: ["https://*.youtube.com/*"]}).then(() => checkPermission());
}
function checkPermission() { // Check if the user has granted permission to the extension to access the YouTube webpage, so that, if false, a warning on the extension UI will be shown.
    (chrome ?? "") !== "" ? chrome.permissions.contains({origins: ["https://*.youtube.com/*"]}, ((permission) => permissionStep2(permission))) : browser.permissions.contains({origins: ["https://*.youtube.com/*"]}).then((permission) => permissionStep2(permission));
    function permissionStep2(permission) {
        document.getElementById("requireAccess").style.display = permission ? "none" : "block";
    }
}
checkPermission();