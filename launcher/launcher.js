(function(){
    var launcher = {
        slideDeckType: ""
    },
    controller = {};

    launcher.keyDown = function(event){
        switch(event.keyCode){
            case 67: //Key "C"
                launcher.launchControl();
            break;
            default:
        }
    };

    launcher.formatHash = function(){
        var hash = window.location.hash;
        return {"slide": hash.substring(2,hash.length)};
    };

    launcher.hashChange = function(event){
        controller.display.postMessage(JSON.stringify(launcher.formatHash()), window.location.origin + '/dependencies/plugins/launcher/control.html');
    };

    document.addEventListener("keydown", launcher.keyDown, false);
    window.addEventListener( 'hashchange', launcher.hashChange, false );


    //Messaging
    launcher.receive = function(event){
        var data = JSON.parse(event.data);

        if(launcher.slideDeckType === "reveal"){
            if(data.direction){
                console.log("action event sent");
                switch(data.direction){
                    case "right":
                        Reveal.right();
                        break;
                    case "left":
                        Reveal.left();
                        break;
                    case "up":
                        Reveal.up();
                        break;
                    case "down":
                        Reveal.down();
                        break;
                }
            }
        }

        //Slide Change Event
        if(data.slide){
            window.location.hash = data.slide;
        }
    };

    launcher.parseStructure = function(){
        // Test for ID indicator of slide framework
        var slideDeckType = document.getElementById("impress") ? "impress" : slideDeckType;
        slideDeckType = document.getElementById("reveal") ? "reveal" : slideDeckType;

        switch(slideDeckType){
            //Parse ImpressJS
            case "impress":
                launcher.slideDeckType = "impress";
                return launcher.parseImpressJS();
            break;
            //Parse RevealJS
            case "reveal":
                launcher.slideDeckType = "reveal";
                return launcher.parseRevealJS();        
            break;
            default:
                return false;
        }
    };

    launcher.parseImpressJS = function(){
        var slides = document.getElementsByClassName("slide"),
            chaptersJSON = {chapters:[]},
            chapterTitle = "";

        for(var i=0;i<slides.length;i++){
            var slideChildren = slides[i].childNodes;
            chapterTitle = "Slide " + i;

            for(var m=0;m<slideChildren.length;m++){
                var chapterTag = slideChildren[m];
                if(chapterTag.tagName){
                    if(chapterTag.tagName.match('^(H[1-3])')){
                        chapterTitle = (i) + ": " + slideChildren[m].outerText;
                    }
                }
            }

            chaptersJSON.chapters.push({
                "index": "/" + slides[i].id,
                "title": chapterTitle,
                "slides": []
            });
        }
        return chaptersJSON;
    };

    launcher.parseRevealJS = function(){
        var chaptersRaw = document.getElementsByTagName("section"),
            chapterCount = 0,
            chaptersJSON = {chapters:[]},
            s = 0,
            chapterIndex = 0,
            slideIndex = 0;

        chaptersLoop:
        for(chapterIndex=0;chapterIndex<chaptersRaw.length;chapterIndex++){
            if(chaptersRaw[chapterIndex].className && chaptersRaw[chapterIndex].className.indexOf("stack") != -1){
                var chapterChildren = chaptersRaw[chapterIndex+1].childNodes,
                    chapterTitle = (chapterCount+1) + ": " + "Chapter",
                    chapterNotes = "";

                // //Spin through and look for first heading of slide
                for(var m=0;m<chapterChildren.length;m++){
                    var chapterTag = chapterChildren[m];
                    if(chapterTag.tagName){
                        if(chapterTag.tagName.match('^(H[1-3])')){
                            chapterTitle = (chapterCount+1) + ": " + chapterChildren[m].outerText;
                        }
                        // Pending Controller object-buildout resolution
                        // if(chapterTag.tagName.match('^(ASIDE)') && chapterTag.className.match('^(notes)')){
                        //  chapterNotes = chapterChildren[m].innerHTML;
                        // }
                    }
                }

                chaptersJSON.chapters.push({
                    "index": "/"+chapterCount,
                    "title": chapterTitle,
                    "slides": [],
                    "notes": chapterNotes
                });

                for(slideIndex=chapterIndex+1; slideIndex<chaptersRaw.length; slideIndex++){

                    var slideChildren = chaptersRaw[slideIndex].childNodes,
                        slideTitle = "No Title",
                        slideNotes = "";

                    //Interate over slides, checking for first heading of slide
                    for(var h=0;h<slideChildren.length;h++){
                        var curTag = slideChildren[h];

                        if(curTag.tagName){
                            if(curTag.tagName.match('^(H[1-3])')){
                                slideTitle = slideChildren[h].outerText;
                            }
                            if(curTag.tagName.match('^(ASIDE)') && curTag.className.match('^(notes)')){
                                slideNotes = slideChildren[h].innerHTML;
                            }
                        }
                    }

                    if(!chaptersRaw[slideIndex].className || chaptersRaw[slideIndex].className.indexOf("stack") == -1){
                        chaptersJSON.chapters[chapterCount].slides.push(
                            {
                                "title": slideTitle,
                                "index": "/"+chapterCount+"/"+s,
                                "notes": slideNotes
                            }
                        );
                        s++;
                    } else {
                        s = 0;
                        chapterIndex = slideIndex-1;
                        break;
                    }

                    if((chapterIndex+1)+chaptersJSON.chapters[chapterCount].slides.length == chaptersRaw.length){
                        break chaptersLoop;
                    }
                }
                chapterCount++;
            } else {
                var soloNodes = chaptersRaw[chapterIndex].childNodes;
                var soloSlideTitle = "Chapter " + (chapterCount+1);
                // Iterate, checking for header element content
                for(var l=0;l<soloNodes.length;l++){
                    if(soloNodes[l].tagName == "H1"){
                        soloSlideTitle = soloNodes[l].outerText;
                        break;
                    }
                }

                chaptersJSON.chapters.push({
                    "index": "/"+chapterCount,
                    "title": soloSlideTitle
                });
                chapterCount++;
            }
        }

        return chaptersJSON;
    };

    launcher.popControl = function(){
        var host = window.location.origin;
        controller.display.postMessage(JSON.stringify(launcher.parseStructure()), host+'/dependencies/plugins/launcher/control.html');
        controller.display.postMessage(JSON.stringify(launcher.formatHash()), host+'/dependencies/plugins/launcher/control.html');
    };

    launcher.parseStructure();

    launcher.launchControl = function(){
        //Warning! IE-unfriendly event binding
        window.addEventListener(
            "message",
            launcher.receive
        );

        if(controller.display){
            launcher.popControl();
        }
        else{
            controller.display = window.open('dependencies/plugins/launcher/control.html', 'slidedeck', 'width=500,height=400');
        }
        controller.display.onload = launcher.popControl;
    };
})();