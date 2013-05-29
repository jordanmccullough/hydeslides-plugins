(function(){
	var control = {},
			parentEvent,
			btnRight,
			btnLeft,
			btnUp,
			btnDown;

	control.parseMessage = function(event){
		parentEvent = event;

		var parsedData = JSON.parse(parentEvent.data),
			tocChapter,
			tocItem,
			activeChapter,
			activeItem,
			toc,
			slideSet,
			chapterItem,
			chapterLink,
			chapterHeader,
			chapterTitle,
			chapterCheck,
			chapterNotes;
			
		if(parsedData.chapters){
			toc = document.getElementById("toc");

			//Clear the Table of Contents if window is re-launched/refreshed
			toc.innerHTML = "";

			for(var i=0;i<parsedData.chapters.length;i++){
				slideSet = document.createElement("ul");
				chapterItem = document.createElement("li");
				chapterLink = document.createElement("a");
				chapterHeader = document.createElement("h1");
				chapterTitle = document.createTextNode(parsedData.chapters[i].title);
				chapterNotes = document.createElement("aside");

				chapterHeader.appendChild(chapterTitle);
					chapterLink.setAttribute("href", "#/"+parsedData.chapters[i].index);
					chapterLink.setAttribute("id", parsedData.chapters[i].index);
					chapterLink.setAttribute("rel", parsedData.chapters[i].index);
					chapterLink.setAttribute("class", "toc-slide");
				chapterLink.appendChild(chapterHeader);
				chapterItem.appendChild(chapterLink);

				if(parsedData.chapters[i].notes){
					chapterNotes.innerHTML = parsedData.chapters[i].notes;
					chapterItem.appendChild(chapterNotes);
				}

				toc.appendChild(chapterItem);

				if(parsedData.chapters[i].slides){
					//Collapse Menu Option
					if(parsedData.chapters[i].slides.length > 1){
						chapterCheck = document.createElement("input");
						chapterCheck.setAttribute("type", "checkbox");
						chapterCheck.setAttribute("checked", "checked");
						chapterItem.appendChild(chapterCheck);
					}

					//Starting with first slide _after_ first/cover slide
					for(var u=1;u<parsedData.chapters[i].slides.length;u++){
						var slideNum = document.createTextNode((i+1) + "." + u);
						var slideSmall = document.createElement("small");
						var slideTitle = document.createTextNode(parsedData.chapters[i].slides[u].title);
						var slideLink = document.createElement("a");
						var slideItem = document.createElement("li");
						var slideNotes = document.createElement("aside");

						slideLink.setAttribute("href", "#/"+parsedData.chapters[i].slides[u].index);
						slideLink.setAttribute("id", parsedData.chapters[i].slides[u].index);
						slideLink.setAttribute("rel", parsedData.chapters[i].slides[u].index);
						slideLink.setAttribute("class", "toc-slide");
						
						slideSmall.appendChild(slideNum);
						slideLink.appendChild(slideSmall);
						slideLink.appendChild(slideTitle);
						slideItem.appendChild(slideLink);
						if(parsedData.chapters[i].slides[u].notes){
							slideNotes.innerHTML = parsedData.chapters[i].slides[u].notes;
							slideItem.appendChild(slideNotes);
						}
						slideSet.appendChild(slideItem);
						chapterItem.appendChild(slideSet);
					}
				}
			}

			var a, allToc = document.getElementsByClassName("toc-slide");
			for(a in allToc){
				if(allToc[a].tagName && allToc[a].tagName === "A"){
					allToc[a].addEventListener("click", control.jumpToSlide, false);
				}
			}
		}

		//Update the TOC highlighting
		if(parsedData.slide){
			tocChapter = document.getElementById("/"+parsedData.slide);
			tocItem = document.getElementById("/"+parsedData.slide);

			activeChapter = document.getElementsByClassName("active")[0];
			activeItem = document.getElementsByClassName("active")[1];

			if(activeChapter){
				activeChapter.className = "";
			}
			if(activeItem){
				activeItem.className = "";
			}

			tocChapter.className = "active";
			tocItem.className = "active";

			//Align active element with top of page
			// tocItem.scrollIntoView();
		}
	};

	control.sendMessage = function(data){
		parentEvent.source.postMessage(JSON.stringify(data), parentEvent.origin);
	};

	control.jumpToSlide = function(event){
		control.sendMessage({slide: this.rel});
	};

	control.clickDirection = function(event, direction){
		if(direction){
			control.sendMessage({direction: direction});
		}
		else{
			control.sendMessage({direction: event.target.id});
		}
	};

	control.keyDown = function(event){
		switch( event.keyCode ) {
			//Right
			case 39:
				control.clickDirection(event, "right");
				break;
			//Down
			case 40:
				control.clickDirection(event, "down");
				break;
			//Left
			case 37:
				control.clickDirection(event, "left");
				break;
			//Up
			case 38:
				control.clickDirection(event, "up");
				break;
		}
	};


	//Controls Binding
	btnRight = document.getElementById("right");
	btnLeft = document.getElementById("left");
	btnUp = document.getElementById("up");
	btnDown= document.getElementById("down");

	btnRight.addEventListener("click", control.clickDirection, false);
	btnLeft.addEventListener("click", control.clickDirection, false);
	btnUp.addEventListener("click", control.clickDirection, false);
	btnDown.addEventListener("click", control.clickDirection, false);

	//Warning! IE-unfriendly binding!
	window.addEventListener("message", control.parseMessage);
	document.addEventListener("keydown", control.keyDown, false);
})();