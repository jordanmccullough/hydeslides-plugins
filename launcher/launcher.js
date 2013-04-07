(function(){
	var launcher = {},
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
		//Trim off the # from RevealJS hashing pattern
		var slideNum = (window.location.hash).match('/([0-9]).*');
		var data = {"slide": slideNum ? slideNum[0] : "/0/0" };
		return data;
	};

	launcher.hashChange = function(event){
		controller.display.postMessage(JSON.stringify(launcher.formatHash()), window.location.origin + '/dependencies/plugins/launcher/control.html');
	};

	document.addEventListener("keydown", launcher.keyDown, false);
	window.addEventListener( 'hashchange', launcher.hashChange, false );


	//Messaging
	launcher.receive = function(event){
		var data = JSON.parse(event.data);

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

		//Slide Change Event
		if(data.slide){
			window.location.hash = data.slide;
		}

	};

	launcher.parseStructure = function(){
		var chaptersRaw = document.getElementsByTagName("section");
		var chapterCount = 0;
		var chaptersJSON = {chapters:[]};
		var s = 0;
		var chapterIndex = 0;
		var slideIndex = 0;

		//Verify this is a RevealJS slidedeck
		var revealJsDeck = document.getElementsByClassName("reveal");
			impressJsDeck = document.getElementsByClassName("impress-enabled");
		
		console.log("reveal...");
		console.log(revealJsDeck);
		console.log("impress...");
		console.log(impressJsDeck);

		if(revealJsDeck){
			console.log("revealJS slide deck detected");
		}
		if(impressJsDeck){
			console.log("impressJs slide deck detected");
		}




		chaptersLoop:
		for(chapterIndex=0;chapterIndex<chaptersRaw.length;chapterIndex++){
			if(chaptersRaw[chapterIndex].className && chaptersRaw[chapterIndex].className.indexOf("stack") != -1){
				var chapterChildren = chaptersRaw[chapterIndex+1].childNodes;
				//Default title when no H* tags found
				var chapterTitle = (chapterCount+1) + ": " + "Chapter";
				var chapterNotes = "";

				// //Spin through and look for first heading of slide
				for(var m=0;m<chapterChildren.length;m++){
					var chapterTag = chapterChildren[m];
					if(chapterTag.tagName){
						if(chapterTag.tagName.match('^(H[1-3])')){
							chapterTitle = (chapterCount+1) + ": " + chapterChildren[m].outerText;
							// break;
						}
						// Pending Controller object-buildout resolution
						// if(chapterTag.tagName.match('^(ASIDE)') && chapterTag.className.match('^(notes)')){
						// 	chapterNotes = chapterChildren[m].innerHTML;
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

					console.log("loopgin...");

					var slideChildren = chaptersRaw[slideIndex].childNodes;
					var slideTitle = "No Title";
					var slideNotes = "";

					//Spin through and look for first heading of slide
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
				// //Spin through and look for first heading of slide
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