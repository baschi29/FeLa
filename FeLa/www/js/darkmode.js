// needs to be called at index 1 as the css-components are the second link loaded
function changeCSS(cssFile, cssLinkIndex) {
    // get old link
    let oldlink = document.getElementsByTagName("link")[cssLinkIndex];

    // Get HTML head element
    let head = document.getElementsByTagName('head')[0];

    // Create new link and set attributes
    let newlink = document.createElement("link");
    newlink.rel = "stylesheet";
    newlink.href = cssFile;

    // replace old link with new link
    head.replaceChild(newlink, oldlink);
}

function updateMode(isDark) {
    console.log("Updating to dark mode: " + isDark);
    if (isDark) {
        changeCSS("css/dark-onsen-css-components.min.css", 1);
    }
    else {
        changeCSS("css/onsen-css-components.min.css", 1);
    }
}

function setCSS(cssFile) {
    // Get HTML head element
    let head = document.getElementsByTagName('head')[0];
 
    // Create new link and set attributes
    let link = document.createElement('link');
    link.rel = "stylesheet";
    link.href = cssFile;

    // Append link element to HTML head
    head.appendChild(link);
}

function setMode(isDark) {
    console.log("Setting dark mode: " + isDark);
    if (isDark) {
        setCSS("css/dark-onsen-css-components.min.css");
    }
    else {
        setCSS("css/onsen-css-components.min.css");
    }
}

let isDark = window.matchMedia('(prefers-color-scheme:dark)').matches;
setMode(isDark);

window.matchMedia('(prefers-color-scheme:dark)').addEventListener("change", function(event) {
    let isDark = window.matchMedia('(prefers-color-scheme:dark)').matches;
    updateMode(isDark);
});