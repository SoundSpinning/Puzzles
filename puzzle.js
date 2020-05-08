// 
// GLOBAL variables
// 
var puzzle, puzzleBits, image;
var bodyW, bodyH;
var imgW, imgH, picW, picH;
var imgSpriteSize, spriteSize, nCols, nRows, nTiles;
var rows = [], cols = [], tiles = [];

var progressVal = 0, 
		progressLabel = document.querySelector(".progDiv label"),
		progressElem = document.querySelector(".progDiv progress"),
		progressIcon = document.querySelector(".progDiv i"),
		initTime = 12;
var modal = document.querySelector(".modal");
var level;


// INITIATE app after page load
// ========
window.onload = function init() {
	// check if touch screen
	if (isTouchScreen()) {
		console.log('Device is touch screen');
	};
	// 1st calculate dimensions and number of tiles
	getDims();

	// load & split image, then shuffle tiles before displaying them
	image.onload = spriteImg(image);
	shuffle(tiles);
	matrix(puzzle);
	matrix(puzzleBits);
}


// check if device is touch screen
function isTouchScreen() {
	if (window.matchMedia("(pointer:coarse)").matches) {
		// initTouch();
		return true;
	} else { return false; }
}


function getDims() {
	bodyW = document.querySelector('body').clientWidth;
	bodyH = document.querySelector('body').clientHeight;
	puzzle = document.querySelector('.puzzle');
	puzzleBits = document.querySelector('.puzzle-bits');
	image = document.querySelector('img.raw');
	imgW = image.naturalWidth;
	imgH = image.naturalHeight;
	if (bodyW/bodyH >= 1.33 || bodyW > 500) {
		picW = (bodyW/2)-20;
	} else {
		picW = bodyW - 32;
	};
	picH = imgH * picW / imgW;

	// check if level was set previously in localStore
	level = document.querySelector('#level');
	if (localStorage.levelVal) {
		level.value = localStorage.getItem("levelVal");
	}
	nCols = parseInt(level.value);
	
	// listen/read drop down selection value when changed
	level.oninput = function(e) {
		nCols = parseInt(level.value);
		localStorage.setItem("levelVal", level.value);
		location.reload();
	};

	imgSpriteSize = Math.ceil(imgW/nCols);
	nRows = Math.ceil(imgH / imgSpriteSize);
	nTiles = nRows * nCols;
	spriteSize = picW / nCols;
}


// generate empty tiles and add image tiles to them, when applicable ('.puzzleBits')
// 
function matrix(elem) {
	var nTile = 0;
	for (var i = 0; i < nRows; i++ && nTile < tiles.length) {
		rows[i] = document.createElement("div");
		rows[i].classList.add("flex-row");
		rows[i].style.width = (spriteSize*nCols)+"px";
		rows[i].style.height = spriteSize+"px";
		for(var j = 0; j < nCols; j++){
			cols[j] = document.createElement("li");
			cols[j].style.width = (100/nCols)+"%";
			cols[j].appendChild(tiles[nTile]);
			//  set relevant drag&drop props for tiles & ids
			if (elem == puzzle) {
				cols[j].classList.add("cell"+i+j);
				cols[j].setAttribute('ondragover', 'dragOver(this, event)');
				cols[j].setAttribute('ondrop', 'dropHere(this, event)');
				cols[j].setAttribute("ondragleave", "dragLeave(this, event)");
				cols[j].setAttribute("ondragenter", "dragEnter(this, event)");
				// if (isTouchScreen) {
				// 	cols[j].setAttribute('ondragover', 'touchDragOver(this, event)');
				// 	cols[j].setAttribute('ondrop', 'touchDropHere(this, event)');
				// }
			};
			if (elem == puzzleBits) {
				cols[j].setAttribute("ondragleave", "dragLeave(this, event)");
				cols[j].setAttribute("ondragenter", "dragEnter(this, event)");
			};

			rows[i].appendChild(cols[j]);
			nTile++;
		}
		elem.appendChild(rows[i]);
	}
}


// ------------------------
// Sprite utility function
// ------------------------

// split up the image and generate a tiles array
function spriteImg(image) {
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext("2d");
	canvas.width = spriteSize;
	canvas.height = spriteSize;
	console.log("raw image loaded ...");

	for (var i = 0; i < nRows; i++) {
		for(var j = 0; j < nCols; j++){
			ctx.clearRect(0, 0, spriteSize, spriteSize);
			// note below j = cols (X axis) & i = rows (Y axis)
			ctx.drawImage(image, j*imgSpriteSize, i*imgSpriteSize, imgSpriteSize, imgSpriteSize,
				0, 0, spriteSize, spriteSize);
			var tmpTile = document.createElement('img');
			tmpTile.style.width =100+"%";
			tmpTile.src = canvas.toDataURL();
			tmpTile.id = "cell"+i+j;
			tmpTile.setAttribute('ondragstart', 'dragStart(this, event)');
			tmpTile.setAttribute('ondragend', 'dragEnd(this, event)');
			tmpTile.setAttribute('draggable', 'true');
			// if (isTouchScreen()) {
			// 	tmpTile.setAttribute('ontouchstart', 'touchDragStart(this, event)');
			// 	tmpTile.setAttribute('ontouchend', 'dragEnd(this, event)');
			// 	tmpTile.setAttribute('ondrag', 'touchDragOver(this, event)');
			// };
			tiles.push(tmpTile);
		}
	}
}


// 
// Fisher-Yates shuffle function
// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
// 
function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}


// 
// drag & drop functions START
// 
function dragStart(target, event) {
  // Change css for visual feedback
  target.style.opacity = '0.5';
  // e.dataTransfer.effectAllowed = 'copyLink';
  event.dataTransfer.setDragImage(target, spriteSize/2, spriteSize/2);
  // Copy the target to the drag'n'drop clipboard
  event.dataTransfer.setData("Text", target.id);

  // allow dropping on parent after dragging item out
  target.parentNode.setAttribute("ondrop", "dropHere(this, event)");
  target.parentNode.setAttribute("ondragover", "dragOver(this, event)");
}

function touchDragStart(target, event) {
  // Change css for visual feedback
  target.style.opacity = '0.5';
  event.preventDefault();

  // allow dropping on parent after dragging item out
  target.parentNode.setAttribute("ondrop", "touchDropHere(this, event)");
  target.parentNode.setAttribute("ondragover", "touchDragOver(this, event)");
}

function dragEnd(target, event) {
  target.style.opacity = '1';
}

function dragEnter(target, event) {
	event.preventDefault();	
	event.stopPropagation(); // stop it here to prevent it bubble up

	target.style.backgroundColor = "whitesmoke";
	if (target.childElementCount > 0) {
		target.setAttribute("ondrop", "");
 		target.setAttribute("ondragover", "");
	};
}

function dragLeave(target, event) {
	event.stopPropagation(); // stop it here to prevent it bubble up
	target.style.backgroundColor = "";
}

function dragOver(target, event) {
	event.preventDefault(); // allows us to drop
  event.stopPropagation(); // stop it here to prevent it bubble up
 	event.dataTransfer.dropEffect = "copy";
}

function touchDragOver(target, event) {
	event.stopPropagation();
	event.preventDefault();
	// show drag image
 	// event.dataTransfer.setDragImage(target, spriteSize/2, spriteSize/2);
 	var touchLocation = event.targetTouches[0];
  // locate dragged object wrt mouse/touch
  target.style.position = 'absolute';
  target.style.left = touchLocation.pageX+"px";
  target.style.top = touchLocation.pageY+"px";
 	// event.dataTransfer.dropEffect = "copy";

}

function dropHere(target, event) {
 	event.stopPropagation();
 	event.preventDefault();

 	// Get the data, which is the id of the drop target
 	var idTile = event.dataTransfer.getData("Text");

 	// add drop properties at empty parent & add border
 	document.getElementById(idTile).parentNode.setAttribute("ondrop", "dropHere(this, event)");
 	document.getElementById(idTile).parentNode.setAttribute("ondragover", "dragOver(this, event)");
 	document.getElementById(idTile).parentNode.style.border = '1px dotted silver';
 	// append tile AFTER prop changes above
 	target.appendChild(document.getElementById(idTile));

 	// remove drop properties once target filled in & set new CSS on cell li elem
 	target.style.backgroundColor = "";
 	target.style.border = '0px';
 	target.setAttribute("ondrop", "");
 	target.setAttribute("ondragover", "");
 	target.setAttribute("ondragenter", "dragEnter(this, event)");

 	// check on puzzle status
 	var tmpTiles = document.querySelectorAll(".puzzle img");
 	checkStatus(tmpTiles);
}

function touchDropHere(target, event) {
 	event.stopPropagation();
 	event.preventDefault();
 	event.dataTransfer.dropEffect = "copy";
  // Copy the target to the drag'n'drop clipboard
  event.dataTransfer.setData("Text", target.id);

 	// Get the data, which is the id of the drop target
 	var idTile = event.dataTransfer.getData("Text");

 	// add drop properties at empty parent & add border
 	document.getElementById(idTile).parentNode.setAttribute("ondrop", "touchDropHere(this, event)");
 	document.getElementById(idTile).parentNode.setAttribute("ondragover", "touchDragOver(this, event)");
 	document.getElementById(idTile).parentNode.style.border = '1px dotted silver';
 	// append tile AFTER prop changes above
 	target.appendChild(document.getElementById(idTile));

 	// remove drop properties once target filled in & set new CSS on cell li elem
 	target.style.backgroundColor = "";
 	target.style.border = '0px';
 	target.setAttribute("ondrop", "");
 	target.setAttribute("ondragover", "");
 	target.setAttribute("ondragenter", "dragEnter(this, event)");

 	// check on puzzle status
 	var tmpTiles = document.querySelectorAll(".puzzle img");
 	checkStatus(tmpTiles);
}
// 
// drag & drop funtions END
// 


// 
// Checking on puzzle progress
// 
function checkStatus (arr1) {
	// set counter
	var nGood = 0;
  // if array is a false value, return
  if (!arr1) {
    return;
  }

  // main loop, assume arr1 contains pics
  for (var i = 0; i < arr1.length; i++) {
  	if ( arr1[i].id == arr1[i].parentNode.classList[0] ) {
  		nGood++;
  	}
  }
  if (nGood < nTiles) {
  	progressVal = nGood * 100 / nTiles;
  	progressHTML = "Progress : "+Math.floor(progressVal)+"%";
  } else {
  	progressVal = nGood * 100 / nTiles;
  	progressHTML = "Progress : 100% | Well done !";
  	// launch modal when puzzle completed
  	showModal();
  }
  progressLabel.innerHTML = progressHTML;
  progressElem.value = progressVal;
  progressIcon.style["-webkit-animation-duration"] = ((1-(progressVal/100)) * initTime)+"s";
  progressIcon.style["animation-duration"] = ((1-(progressVal/100)) * initTime)+"s";
}


// modal
function showModal() {
	modal.classList.remove("no-show");
}

function hideModal() {
	modal.classList.add("no-show");
}

// function to format numbers as ',' (1000's) & '.' (decimal)
function formatNumber(num) {
return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}
