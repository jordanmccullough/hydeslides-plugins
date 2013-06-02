(function(){
    var headTag = document.getElementsByTagName("head")[0];
        bodyTag = document.getElementsByTagName("body")[0];
        cssTag = document.createElement("link");
        helpContainer = document.createElement("div");
        helpContent = document.createElement("div");
        execScript = document.getElementsByTagName("script");
        execPath = "";

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
    helpContent.setAttribute("id", "help-content");
    helpContainer.appendChild(helpContent);
    helpContent.innerHTML = "Hello world";
    bodyTag.appendChild(helpContainer);


    
})();