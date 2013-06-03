(function(){
    var headTag = document.getElementsByTagName("head")[0];
        bodyTag = document.getElementsByTagName("body")[0];
        cssTag = document.createElement("link");
        helpContainer = document.createElement("div");
        helpContent = document.createElement("div");
        execScript = document.getElementsByTagName("script");
        execPath = "";

    //Setup key event handling and listener
    var services = {};
    services.showHide = function(event){
        var helpTarget = document.getElementById("help");
        if(event.shiftKey && event.keyCode === 191){
            if(helpTarget.getAttribute("class").match("hidden")){
                helpTarget.setAttribute("class");
            }
            else{
                helpTarget.setAttribute("class", "help-hidden");
            }
        }
    };
    document.addEventListener("keydown", services.showHide, false);

    //Determine path of Help execution path
    for(var i=0;i<execScript.length;i++){
        if(execScript[i].src.match("help.js")){
            execPath = execScript[i].src.substring(0, execScript[i].src.match("[a-z]*.js").index);
        }
    }

    //Build the Stylesheet Link
    cssTag.setAttribute("rel", "stylesheet");
    cssTag.setAttribute("href", execPath + "help.css");
    cssTag.setAttribute("type", "text/css");
    cssTag.setAttribute("media", "screen");
    headTag.appendChild(cssTag);

    //Build & Insert Help Tag
    helpContainer.setAttribute("id", "help");
    helpContainer.setAttribute("class", "help-hidden");
    helpContent.setAttribute("id", "help-content");
    helpContainer.appendChild(helpContent);
    bodyTag.appendChild(helpContainer);

    //Inline HTML to keep things simple
    helpContent.innerHTML =
        "<ul>" +
            "<h1>Keyboard Shortcuts</h1>" +
            "<hr>" +
            "<li><code>Esc</code> Big-Picture Slides View</li>" +
            "<li><code>C</code> Table of Contents Browser</li>" +
            "<li><code>S</code> What's Next Split View</li>" +
            "<li><code>&#x2191;</code> Previous slide, previous build step</li>" +
            "<li><code>&#x2192;</code> Next chapter, next build step</li>" +
            "<li><code>&#x2193;</code> Next slide, next build step</li>" +
            "<li><code>&#x2190;</code> Previous chapter, previous build step</li>" +
            "<li><code>?</code> Hide/Show Help</li>" +
        "</ul>";    
})();