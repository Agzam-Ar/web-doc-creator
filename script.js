const PAPER_A4_K = 210/297;

let rectSize = .5;
let eCm;

let paperScale = 1.5;

let eDocName;
let isDocSaved = false;
let documentName = 'Безымянный';

let eBody;
let eContent;

let eDragEnd;

let eMenuItems;
let eMenuContent;
let eMenuContents;

let eBoldButton;

let isBold;
let isItalic;
let isUnderlined;

window.onload = function() {
	eDocName = document.getElementById('doc-name');
	eCm = document.getElementById('cm');
	eBody = document.getElementById('body');
	eContent = document.getElementById('content');
	eContentContextMenu = document.getElementById('content-context-menu');

	eDragEnd = document.getElementById('drag-end');
	
	eMenuItems = document.getElementById('menu-select').getElementsByClassName('menu-select-item');
	eMenuContent = document.getElementById('menu-content');
	eMenuContents = document.getElementById('menu-contents');

	eBoldButton = document.getElementsByClassName('bold-button');
	selectMenuItem(eMenuItems[0]);

	resizePaper();

	for (var i = 0; i < 99999999; i++) {
	}

	eContent.oncontextmenu = function(e) {
		if(e.target == eContent) {
			eContentContextMenu.setAttribute("isvisible", 1);
			eContentContextMenu.style.top = e.offsetY + 'px';
			eContentContextMenu.style.left = e.offsetX + 'px';
			e.preventDefault();
		}

		if(e.target.getAttribute('contenteditable') == null) {
			e.preventDefault();
		} else {
		}
		// eContentContextMenu.style.top = '';
	}

	_load();

	document.getElementById('loading-sreen').classList = 'loading-sreen-loaded';
	document.body.overflowY = 'auto';
}

window.onbeforeprint = function(e) {
	// console.log(e);

	// e.target(eContent);

	// return false;
	// let pageHTML = document.documentElement.innerHTML;
	// var print_div = document.getElementById("print");
	// var print_area = window.open();
	// print_area.document.write(eContent.innerHTML);
	// print_area.document.close();
	// print_area.focus();
	// print_area.print();
	// print_area.close();
	// e.preventDefault();
}

window.onkeydown = function(e) {

	if(e.code == 'Space' && e.target == document.body) {
	  	e.preventDefault();
	  	return;
	}

	if(e.code == 'KeyO' && e.ctrlKey) {
		_open();
		e.preventDefault();	
	} else if(e.code == 'KeyS' && e.ctrlKey) {
		if(e.shiftKey) {
			_saveAs();
		}
		_save();
		e.preventDefault();	
	} else if(e.code == 'KeyP' && e.ctrlKey) {
		e.preventDefault();	
		_print();
	}
}


window.onclose = function(e) {
	alert("Hi");
	e.preventDefault();
}

window.onclick = function(e) {
	if(e.target != eContentContextMenu && e.target.parentElement != eContentContextMenu) eContentContextMenu.setAttribute("isvisible", 0);
}

window.onresize = function(e) {
	// console.log(e);
	// e.stopPropagation();
	// e.cancelBubble = true;
	// e.preventDefault();
	// resizePaper();
}

function contentContextMenu(element) {
	var name = element.getAttribute('name');
	var pxX = eContentContextMenu.style.left.replace('px', "");
	var pxY = eContentContextMenu.style.top.replace('px', "");

	var cmX = pxX / eCm.offsetWidth;
	var cmY = pxY / eCm.offsetHeight;

	cmX = Math.floor(cmX/rectSize)*rectSize;
	cmY = Math.floor(cmY/rectSize)*rectSize;

	if(name.startsWith('insert')) {
		var eInsert = document.createElement('div');
		eInsert.setAttribute('contenteditable', ['insert-text'].indexOf(name) != -1);

		if(name == 'insert-text') eInsert.setAttribute('placeholder', 'Введите текст');
		if(name == 'insert-structure-formula') eInsert.setAttribute('placeholder', 'С');
		
		if(name == 'insert-text') eInsert.classList = "textarea drag";
		if(name == 'insert-molecular-formula') eInsert.classList = "molecular formula drag";
		if(name == 'insert-structure-formula') eInsert.classList = "structure formula drag";

		eInsert.oninput = function(e) {
			updateTitle(false);
		}

		if(name == 'insert-molecular-formula') {

			var eContenteditable = document.createElement('div');
			eContenteditable.setAttribute('contenteditable', true);
			eInsert.append(eContenteditable);

			eContenteditable.innerText = "C";
			eContenteditable.classList = "molecular-formula-content";

			molecularFormulaInputTo(eContenteditable);
		}

		eInsert.style.left = cmX + 'cm';
		eInsert.style.top  = cmY + 'cm';

		eContent.append(eInsert);

		eInsert.classList.add('content-element');

		// new ResizeObserver(function() {
		// 	console.log({style: eInsert.style.width});
		// 	var value = parseFloat(eInsert.style.width);
		// 	var units = eInsert.style.width.replace(value, "");

		// 	if(isNaN(value+1)) {
		// 		value = eInsert.offsetWidth;
		// 		units = 'px';
		// 	}

		// 	console.log({value: value, units: units});

		// 	if(units == 'cm') {
		// 		value = Math.floor(value);
		// 	}
		// 	if(units == 'px') {
		// 		value = calcCmX(value);
		// 		units = 'cm';
		// 	}
		// 	console.log({value: value, units: units});
		// 	eInsert.style.width = value + units;
		// }).observe(eInsert)

	}

	eContentContextMenu.setAttribute("isvisible", 0);
}

function isNumeric(value) {
    return /^-?\d+$/.test(value);
}

function calcCmX(px) {
	var cmX = px / eCm.offsetWidth;
	return Math.round(cmX/rectSize)*rectSize;
}

function calcCmY(px) {
	var cmY = px / eCm.offsetHeight;
	return Math.round(cmY/rectSize)*rectSize;
}

var dragElement = undefined;
var draggStartX = 0;
var draggStartY = 0;

document.onmousedown = function(e) {
	if(e.target.classList.contains('drag') && e.shiftKey) {
		var target = e.target;
		dragElement = e.target;

		eDragEnd.style.minWidth = target.style.minWidth;
		eDragEnd.style.minHeight = target.style.minHeight;

		eDragEnd.style.borderWidth = target.style.borderWidth;

		// eDragEnd.style.minHeight = target.offsetHeight + 'px';
		eDragEnd.innerHTML = target.innerHTML;
		eDragEnd.style.opacity = '1';


		var isContenteditable = target.getAttribute('contenteditable');
		target.setAttribute('contenteditable', false);
		target.setAttribute('isDrag', 1);

		// let shiftX = e.offsetX - target.parentElement.getBoundingClientRect().x; // (e.pageX - e.layerX);
		// let shiftY = e.offsetY - target.parentElement.getBoundingClientRect().y; // (e.pageY - e.layerY);

		// S = M - P;
		let shiftX =/* e.clientX - */target.parentElement.getBoundingClientRect().left + e.offsetX;
		let shiftY =/* e.clientY - */target.parentElement.getBoundingClientRect().top + e.offsetY;

		moveAt(e);//e.clientX, e.clientY);

		var endx;
		var endy;

		function moveAt(e) {
			if(target == undefined) return;
			// P = M - S
			x = e.clientX;// - target.getBoundingClientRect().left;
			y = e.clientY;// - target.getBoundingClientRect().top;
			target.style.left = (x - shiftX) + 'px';
			target.style.top =  (y - shiftY) + 'px';

			eDragEnd.style.left = calcCmX(x - shiftX) + 'cm';
			eDragEnd.style.top =  calcCmY(y - shiftY) + 'cm';
			// FIXME
			target.style.left = /*calcCmX*/(x - shiftX) + 'px';
			target.style.top =  /*calcCmY*/(y - shiftY) + 'px';
			target.style.opacity = 1;
			// eDragEnd

			endx = calcCmX(x - shiftX);
			endy = calcCmY(y - shiftY);

			updateTitle(false);
		}

		function onMouseMove(e) {
			moveAt(e);//e.clientX, e.clientY);
		}

		document.addEventListener('mousemove', onMouseMove);

		document.onmouseup = function(e) {
			moveAt(e);
			target.style.left = eDragEnd.style.left;//endx + 'cm';
			target.style.top =  eDragEnd.style.top;//endy + 'cm';

			document.removeEventListener('mousemove', onMouseMove);
			if(target == undefined) return;
			target.onmouseup = null;
			target.setAttribute('isDrag', 0);
			target.setAttribute('contenteditable', isContenteditable);

			target = undefined;
			eDragEnd.style.opacity = '0';

			document.onmouseup = undefined;
		};
	}
};

function molecularFormulaInputTo(element) {
	element.oninput = function(e) {
		updateTitle(false);

		var selection = saveSelection(e.target);

		var ss = e.target.selectionStart;
		var se = e.target.selectionEnd;

		if(e.data != null) {
			ss += e.data.length;
			se += e.data.length;
		}

		var text = e.target.innerText.replaceAll(' ', '').replaceAll('\n', '');
		var newHTML = "";
		var isLastNumber = false;
		for (var i = 0; i < text.length; i++) {
			var char = text.charAt(i);
			if(!isLastNumber && isNumeric(char)) {
				newHTML += '<sub>';
			} else if(isLastNumber && !isNumeric(char)) {
				newHTML += '</sub>';
			}
			newHTML += char;
			isLastNumber = isNumeric(char);
		}
		if(isLastNumber) {
			newHTML += '</sub>';
		}
		e.target.innerHTML = newHTML;

		setTimeout(() => {
			var containerEl = e.target;
			var savedSel = selection;

			restoreSelection(e.target, selection);
		});
	}
}

function resizePaper() {
	// 210 x 297
	// 214 х 301 
	// 588 x 830 
  
	// 588 x 830
	// 210 x 296 (2.8)

	var w = 21.0;
	var h = 29.6; // 29.7
	var sw = w*paperScale;
	var sh = h*paperScale;
	eBody.style.width = w + 'cm';
	eBody.style.height = h + 'cm';

	eContent.style.width = w + 'cm';
	eContent.style.height = h + 'cm';
	// eContent.style.transform = "scale(" + paperScale + ")";
	// eContent.style.height = eContent.offsetWidth/PAPER_A4_K + 'px';
}

function printPage() {
	// var print_div = document.getElementById("print");
	// var print_area = window.open();
	// print_area.document.write(print_div.innerHTML);
	// print_area.document.close();
	// print_area.focus();
	// print_area.print();
	// print_area.close();

	window.print();
}

function selectMenuItem(element) {
	for (var i = 0; i < eMenuItems.length; i++) {
		var mi = eMenuItems[i];
		var isSelected = mi == element;
		mi.setAttribute('isSelected', isSelected);
		if(isSelected) {
			eMenuContent.innerHTML = "";
			eMenuContent.append(document.getElementById('menu-content-' + mi.getAttribute('name')).cloneNode(true));
		}
	}
	eBoldButton = document.getElementsByClassName('bold-button');
	// body...
}

function changeBold() {
	isBold = !isBold;
	for (var i = eBoldButton.length - 1; i >= 0; i--) {
		eBoldButton[i].setAttribute('isToggled', isBold);
	}
}

function insertMolecularFormula() {
	var eMolecularFormula = document.createElement('div');
	eMolecularFormula.classList = 'molecular formula';
	eMolecularFormula.setAttribute('spellcheck', false);
	// eMolecularFormula.setAttribute('readonly', '1');
	eMolecularFormula.setAttribute("contenteditable", false);

	var eMolecularFormulaEditable = document.createElement('div');
	eMolecularFormulaEditable.innerHTML = "C<sub>n1</sub>H<sub>n2</sub>";
	eMolecularFormulaEditable.setAttribute("contenteditable", true);
	eMolecularFormula.append(eMolecularFormulaEditable);

	eMolecularFormula.onkeydown = function(e) {
		if((e.code == 'Delete' || e.code == 'Backspace') && (eMolecularFormulaEditable.innerText == "" || eMolecularFormulaEditable.innerText == " ")) {
			eMolecularFormula.parentElement.removeChild(eMolecularFormula);
		}
	};

	eMolecularFormula.readOnly = true;
	eMolecularFormula.contenteditable = false;
	eTextarea.append(eMolecularFormula);
	updateTextArea();
}

function insertStructureFormula() {
	var eStructureFormula = document.createElement('div');
	eStructureFormula.classList = 'structure formula';
	eStructureFormula.setAttribute('spellcheck', false);
	eStructureFormula.setAttribute("contenteditable", false);

	var eStructureFormulaEditable = document.createElement('div');
	// eStructureFormulaEditable.innerHTML = "C<sub>n1</sub>H<sub>n2</sub>";
	eStructureFormulaEditable.setAttribute("contenteditable", true);
	eStructureFormula.append(eStructureFormulaEditable);

	eStructureFormula.onkeydown = function(e) {
		if((e.code == 'Delete' || e.code == 'Backspace') && (eStructureFormulaEditable.innerText == "" || eStructureFormulaEditable.innerText == " ")) {
			eStructureFormula.parentElement.removeChild(eStructureFormula);
		}
	};

	eStructureFormula.readOnly = true;
	eStructureFormula.contenteditable = false;
	eTextarea.append(eStructureFormula);
	updateTextArea();
}

function updateTextArea() {
	if(eTextarea.innerHTML.endsWith('>')) {
		eTextarea.append('\u200A');
		// eTextarea.innerHTML += "";
	}
	if(eTextarea.innerHTML.startsWith('<')) {
		eTextarea.prepend('\u200A');
	}
}

function createInvisibleSeparator() {
	// body...
}

var saveSelection, restoreSelection;

if (window.getSelection && document.createRange) {
    saveSelection = function(containerEl) {
        var range = window.getSelection().getRangeAt(0);
        var preSelectionRange = range.cloneRange();
        preSelectionRange.selectNodeContents(containerEl);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        var start = preSelectionRange.toString().length;

        return {
            start: start,
            end: start + range.toString().length
        };
    };

    restoreSelection = function(containerEl, savedSel) {
        var charIndex = 0, range = document.createRange();
        range.setStart(containerEl, 0);
        range.collapse(true);
        var nodeStack = [containerEl], node, foundStart = false, stop = false;

        while (!stop && (node = nodeStack.pop())) {
            if (node.nodeType == 3) {
                var nextCharIndex = charIndex + node.length;
                if (!foundStart && savedSel.start >= charIndex && savedSel.start <= nextCharIndex) {
                    range.setStart(node, savedSel.start - charIndex);
                    foundStart = true;
                }
                if (foundStart && savedSel.end >= charIndex && savedSel.end <= nextCharIndex) {
                    range.setEnd(node, savedSel.end - charIndex);
                    stop = true;
                }
                charIndex = nextCharIndex;
            } else {
                var i = node.childNodes.length;
                while (i--) {
                    nodeStack.push(node.childNodes[i]);
                }
            }
        }

        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }
} else if (document.selection) {
    saveSelection = function(containerEl) {
        var selectedTextRange = document.selection.createRange();
        var preSelectionTextRange = document.body.createTextRange();
        preSelectionTextRange.moveToElementText(containerEl);
        preSelectionTextRange.setEndPoint("EndToStart", selectedTextRange);
        var start = preSelectionTextRange.text.length;

        return {
            start: start,
            end: start + selectedTextRange.text.length
        }
    };

    restoreSelection = function(containerEl, savedSel) {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(containerEl);
        textRange.collapse(true);
        textRange.moveEnd("character", savedSel.end);
        textRange.moveStart("character", savedSel.start);
        textRange.select();
    };
}

function _download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

function _save() {
	localStorage.saved_doc = JSON.stringify(_toSave());
	updateTitle(true);
}

function _saveAs(type) {
	var saveData = undefined;
	var fileExtension = undefined;
	if(type == 'html') {
		var saHtml = document.createElement('html');
		var saStyle = document.createElement('style');

		var saHead = document.createElement('head');
		saHead.innerHTML = `<style>` + doc_style + "</style>";
		saHtml.append(saHead);

		var saBody = document.createElement('body');
		var eClone = eContent.cloneNode(true);
		var noDoc = eClone.getElementsByClassName('no-doc');
		for (var i = 0; i < noDoc.length; i++) {
			eClone.removeChild(noDoc[i]);
		}

		var allEls = eClone.getElementsByTagName('*');
		for (var i = 0; i < allEls.length; i++) {
			allEls[i].removeAttribute('contenteditable');
		}
		saBody.innerHTML = eClone.innerHTML;
		saBody.style.background = "#FFF";
		saBody.style.width = eContent.style.width;
		saBody.style.height = eContent.style.height
    	saBody.style.position = 'relative';
		// saBody.append(eClone);
		saHtml.append(saBody);

		saveData = 
		`
		<!DOCTYPE html>
		<html style="background:#EEE; display:flex; align-items: center; justify-content: center">
			${saHtml.innerHTML}
		</html>
		`;
		fileExtension = 'html';
	}

	if(saveData == undefined) saveData = JSON.stringify(_toSave());
	if(fileExtension == undefined) fileExtension = 'aawd';

    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([saveData]));
    a.download = documentName + '.' + fileExtension;
    a.click();
}

function _toSave() {
	var eContentElements = document.getElementsByClassName('content-element');

	var saveElemetsData = [];
	for (var i = 0; i < eContentElements.length; i++) {
		var eContentElement = eContentElements[i];

		var elemetData = {
			contenteditable: eContentElement.getAttribute('contenteditable'),
			placeholder: eContentElement.getAttribute('placeholder'),
			class: eContentElement.classList.value,
			html: eContentElement.innerHTML,
			top: eContentElement.style.top,
			left: eContentElement.style.left
		};

		saveElemetsData.push(elemetData);
	}

	return {
		elements: saveElemetsData
	};
}

function _open() {
	// body...
	updateTitle();
}

function _load() {
	var loaded = localStorage.saved_doc;
	if(loaded == undefined) return;
	loaded = JSON.parse(loaded);

	for (var i = 0; i < loaded.elements.length; i++) {
		var elemetData = loaded.elements[i];

		var eLoaded = document.createElement('div');
		eLoaded.setAttribute('contenteditable', elemetData.contenteditable);
		eLoaded.setAttribute('placeholder', elemetData.placeholder);
		eLoaded.classList = elemetData.class;
		eLoaded.innerHTML = elemetData.html;
		eLoaded.style.top = elemetData.top;
		eLoaded.style.left = elemetData.left;

		defaultEventsToContenteditableElement(eLoaded);

		eContent.append(eLoaded);
	}

	var eMolecularFormulaContents = document.getElementsByClassName('molecular-formula-content');
	for (var i = 0; i < eMolecularFormulaContents.length; i++) {
		molecularFormulaInputTo(eMolecularFormulaContents[i]);
	}

	updateTitle(true);
}

const doc_style = `
	<style>
		@media print {
			@page {
				margin: 0;
				padding: 0;
				margin-right: -1cm;
				margin-bottom: -1cm;
			}

			body  {
				display: flex;
				align-content: center;
				justify-content: center;
				align-items: center;
				overflow: hidden;
				margin: 0;
				padding: 0;
			}
		}

		#content-context-menu {
			display: none;
		}

		#content {
			display: block;
			position: absolute;
			margin: 0;
			padding: 0;
			background: #FFF;
			box-shadow: .25cm .5cm .1cm #00000033;
		}

		.textarea, .formula {
			display: flex;
			position: absolute;
			outline: none;

			min-width: .5cm;
			min-height: .5cm;

			width: fit-content;
			top: 0;
			left: 0;

			margin: -.5cm;
			border: .5cm transparent solid;
		}

		.textarea {
			display: flex;
			position: absolute;
			outline: none;

			min-width: .5cm;
			min-height: .5cm;

			width: fit-content;
			top: 0;
			left: 0;

			margin: -.5cm;
			border: .5cm transparent solid;
		}

		.formula.molecular > div {
			pointer-events: auto !important;
			user-select: auto;
			display: inline-flex;
			padding: .05cm .2cm;
			background: #DDD;
		
		    align-items: center;
		    justify-content: center;
		    align-content: center;
		    flex-wrap: nowrap;
		    text-align: center;
		    border-radius: .1cm;
		    z-index: 15;
		}

		.formula.molecular > div > sub {
			transform: translateY(25%);
		}
	</style>
`;

function _print() {
		var print_area = window.open("", "Печать");

		print_area.document.write(doc_style);
		print_area.document.write(eContent.innerHTML);
		print_area.document.close();
		
		print_area.focus();
		print_area.print();
		print_area.close();
}

function defaultEventsToContenteditableElement(element) {
	element.oninput = function(e) {
		updateTitle(false);
	}

	element.onkeydown = function(e) {
		if ((e.code == "Backspace" || e.code == 'Delete') && e.target.innerText == '' && e.ctrlKey) {
			if(e.target.classList.contains('molecular-formula-content')) {
				e.target.parentElement.parentElement.removeChild(e.target.parentElement);
			} else {
				e.target.parentElement.removeChild(e.target);
			}
			updateTitle(false);
		}
	}
}

function updateTitle(isSaved, newDocumentName) {
	if(newDocumentName != undefined) documentName = newDocumentName;
	if(isSaved != undefined) isDocSaved = isSaved;

	eDocName.innerText = documentName;
	eDocName.setAttribute('isSaved', isDocSaved);
	document.title = (isSaved ? '' : '*') + documentName;
}