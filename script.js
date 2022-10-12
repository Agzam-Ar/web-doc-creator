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

let eInfo;

window.onload = function() {
	eInfo = document.getElementById('info');
	eDocName = document.getElementById('doc-name');
	eDocName.innerText = documentName;
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

	eDocName.addEventListener('paste', function (e) {
		e.preventDefault();
		var text = e.clipboardData.getData('text/plain');
		document.execCommand('insertText', false, text);
	});

	eDocName.oninput = function(e) {
		documentName = eDocName.innerText;
		updateTitle(false);
	}
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

	var target = e.target;

	eInfo.innerHTML = "";
	if(target.classList.contains('drag') 
		|| target.parentElement.classList.contains('drag') 
		|| target.parentElement.parentElement.classList.contains('drag')
		|| target.parentElement.parentElement.parentElement.classList.contains('drag')
		|| target.parentElement.parentElement.parentElement.parentElement.classList.contains('drag')
		) {
		eInfo.innerHTML += "<key>CTRL + ДВИЖЕНИЕ МЫШКОЙ</key> - двигать элемент";
	}

	if(target.classList.contains('textarea') || target.classList.contains('molecular-formula-content')) {
		eInfo.innerHTML += " | <key>CTRL + BACKSPACE</key> - удалить элемент";
	}
	if(target.classList.contains('structure-formula-cell')) {
		eInfo.innerHTML += " | <key>CTRL + BACKSPACE</key> - удалить колонку";
		eInfo.innerHTML += " | <key>ALT + BACKSPACE</key> - удалить строку";
		eInfo.innerHTML += " | <key>ALT + СРЕЛКА</key> - добавить строку/колонку";
		eInfo.innerHTML += " | <key>-, |, /, \\</key><key>--, ||, //, \\\\</key><key>---, |||, ///, \\\\\\</key> - молекулярные связи";
	}
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

		if(name == 'insert-structure-formula') {
			var eTable = document.createElement('table');

			for (let r = 0; r < 1; r++) {
				const row = eTable.insertRow();
				createCells(eTable, row, 1);
			}

			eInsert.append(eTable);
			// eTable.innerText = "C";
			eTable.classList = "structure-formula-content";

			structureFormulaInputTo(eTable);
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
		eDragEnd.style.fontFamily = target.classList.contains('formula') ? 'monospace' : "";
		// eDragEnd.style.fontWeight = target.style.fontWeight;
		// eDragEnd.style.fontSize = target.style.fontSize;

		console.log(target);

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

function createCells(eTable, row, count) {
	console.log(count);
	// if(isNaN(Math.round(count))) count = eTable.rows[0].cells.length;
	for (let c = 0; c < count; c++) {
		const cell = row.insertCell();
		initCell(eTable, row, cell);
	}
}

function initCell(eTable, row, cell) {
	cell.appendChild(document.createTextNode(``));
	cell.classList = 'structure-formula-cell';
	cell.setAttribute('contenteditable', true);
	cell.setAttribute('value', cell.innerText);
	cell.setAttribute('spellcheck', false);

	cell.oninput = function(e) {
		var text = cell.innerText;
		cell.setAttribute('value', text);

		// if([
		// 	'-','--','---',
		// 	'|','||','|||',
		// 	'/','//','///',
		// 	
		// 	].indexOf(text) != -1) {
		// 	var hypot = Math.hypot(text.length, 1);
		// 	cell.parentElement.style.height = hypot + 'px';
		// 	console.log(text, hypot);
		// } else {
		// 	cell.style.maxWidth = 'unset';
		// }
		_resize();
	}

	function _resize() {
		var text = cell.innerText;
		console.log("RESIZE");
		var w = cell.offsetWidth;
		var h = cell.offsetHeight;
		var deg = Math.atan2(h,w)*180/Math.PI;

		if(['/','//','///'].indexOf(text) != -1) {
			var hypot = Math.hypot(text.length, 1);
			cell.style.setProperty("--rotate", (-deg) + 'deg');
		} else if(['\\','\\\\','\\\\\\'].indexOf(text) != -1) {
			cell.style.setProperty("--rotate", deg + 'deg');
		} else {
			cell.style.setProperty("--rotate", 0 + 'deg');
			cell.style.maxWidth = 'unset';
		}
	}
	_resize();
	new ResizeObserver(_resize).observe(cell);

	cell.onkeydown = function(e) {
		var rowIndex = cell.parentElement.rowIndex;
		var cellIndex = cell.cellIndex;

		var selection = getSelectionCharacterOffsetWithin(e.target);

		if(e.altKey) {
			if(e.code == 'ArrowUp') {
				var count = eTable.rows[0].cells.length;
				const row = eTable.insertRow(rowIndex);
				createCells(eTable, row, count);
			}
			if(e.code == 'ArrowDown') {
				var count = eTable.rows[0].cells.length;
				const row = eTable.insertRow(rowIndex+1);
				createCells(eTable, row, count);
			}

			if(e.code == 'ArrowRight') {
				for (var rr = 0; rr < eTable.rows.length; rr++) {
					const cell = eTable.rows[rr].insertCell(cellIndex+1);
					initCell(eTable, row, cell);
				}
			}
			if(e.code == 'ArrowLeft') {
				for (var rr = 0; rr < eTable.rows.length; rr++) {
					const cell = eTable.rows[rr].insertCell(cellIndex);
					initCell(eTable, row, cell);
				}
			}
		} else if(selection.start == selection.end) {
			var s = selection.start;
			var text = e.target.innerText;
			if(e.code == 'ArrowUp') {
				if(rowIndex > 0) eTable.rows[rowIndex-1].cells[cellIndex].focus();
				e.preventDefault();
			}
			if(e.code == 'ArrowDown') {
				if(rowIndex + 1 < eTable.rows.length) eTable.rows[rowIndex+1].cells[cellIndex].focus();
				e.preventDefault();
			}

			if(e.code == 'ArrowRight' && s == e.target.innerText.length) {
				if(cellIndex + 1 < eTable.rows[0].cells.length) eTable.rows[rowIndex].cells[cellIndex+1].focus();
				e.preventDefault();
			}
			if(e.code == 'ArrowLeft' && s == 0) {
				if(cellIndex > 0) eTable.rows[rowIndex].cells[cellIndex-1].focus();
				e.preventDefault();
			}
		}
	}
}

function getSelectionCharacterOffsetWithin(element) {
    var start = 0;
    var end = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    if (typeof win.getSelection != "undefined") {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            var range = win.getSelection().getRangeAt(0);
            var preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.startContainer, range.startOffset);
            start = preCaretRange.toString().length;
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            end = preCaretRange.toString().length;
        }
    } else if ( (sel = doc.selection) && sel.type != "Control") {
        var textRange = sel.createRange();
        var preCaretTextRange = doc.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToStart", textRange);
        start = preCaretTextRange.text.length;
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        end = preCaretTextRange.text.length;
    }
    return { start: start, end: end };
}

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

function structureFormulaInputTo(element) {
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
		saHead.innerHTML = doc_style;
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
		name: documentName,
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

	if(loaded.name != undefined) documentName = loaded.name;

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

	var eStructureFormulaContents = document.getElementsByClassName('structure-formula-content');
	for (var i = 0; i < eStructureFormulaContents.length; i++) {
		var eTable = eStructureFormulaContents[i];
		console.log(eTable);

		for (var r = 0; r < eTable.rows.length; r++) {
			var row = eTable.rows[r];
			for (var c = 0; c < row.cells.length; c++) {
				// row.cells[c]
				initCell(eTable, row, row.cells[c]);
			}
		}
		structureFormulaInputTo(eStructureFormulaContents[i]);
	}

	updateTitle(true);
}

const doc_style = `<link rel="stylesheet" type="text/css" href="print.css">` /*
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
`;*/

function _print() {
		var print_area = window.open("", "Печать");

		print_area.document.write(doc_style);
		// print_area.document.write(``);
		print_area.document.write(eContent.innerHTML);
		print_area.document.write(`<script>window.onload=function(){print();close()}</script>`);
		print_area.document.close();
		print_area.focus();
}

function defaultEventsToContenteditableElement(element) {
	element.oninput = function(e) {
		updateTitle(false);
	}

	element.onkeydown = function(e) {
		var isEmtpy = e.target.innerText == '';
		if ((e.code == "Backspace" || e.code == 'Delete')) {
				console.log(e.target.parentElement.innerText);
			if(isEmtpy && e.target.classList.contains('molecular-formula-content') && e.ctrlKey) {
				e.target.parentElement.parentElement.removeChild(e.target.parentElement);
			} else if(e.target.classList.contains('structure-formula-cell')) {
				console.log(e.target.parentElement.innerText);
				if(isEmtpy && e.target.parentElement.innerText.trim() == '' && e.ctrlKey) {
					e.target.parentElement.parentElement.removeChild(e.target.parentElement);
				} else if(e.altKey) {
					console.log(e.target.cellIndex);
					var index = e.target.cellIndex;
					var eTable = e.target.parentElement.parentElement.parentElement;
					for (var i = 0; i < eTable.rows.length; i++) {
						eTable.rows[i].removeChild(eTable.rows[i].cells[index]);
					}
				}
			} else if(isEmtpy && e.ctrlKey) {
				e.target.parentElement.removeChild(e.target);
			}
			updateTitle(false);
		}
	}
}

function updateTitle(isSaved, newDocumentName) {
	if(newDocumentName != undefined) documentName = newDocumentName;
	if(isSaved != undefined) isDocSaved = isSaved;

	var selection = document.activeElement == eDocName ? saveSelection(eDocName) : null;
	console.log(selection);
	eDocName.innerText = documentName;
	eDocName.setAttribute('isSaved', isDocSaved);
	document.title = (isSaved ? '' : '*') + documentName;
	if(selection != null) restoreSelection(eDocName, selection);
}