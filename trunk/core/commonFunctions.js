/*
 * commonFunctions.js 
 * Copyright © 2007 Tommi Rautava
 * 
 * This file is part of Popomungo.
 *
 * Popomungo is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 * 
 * Popomungo is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

///////////////////////////////////////////////////////////////////////
// Popomungo common functions
///////////////////////////////////////////////////////////////////////

function pm_InsertRowAfter(key, value, hover, afterRow) {
	var doc = afterRow.ownerDocument;
	var newRow = doc.createElement('tr');
	var newData1 = doc.createElement('td');
	var newData2 = doc.createElement('td');

	// FIXME Replace innerHTML manipulation.
	newData1.innerHTML = '<b class="popomungo_added">'+ key +':</b>';
	if (hover) {
		newData2.innerHTML = '<span class="popomungo_added" title="'+ 
			hover +'">'+ value +'</span>';
	} else {
		newData2.innerHTML = '<span class="popomungo_added">'+ 
			value +'</span>';
	}

	newRow.appendChild(newData1);
	newRow.appendChild(newData2);

	afterRow.parentNode.insertBefore(newRow, afterRow.nextSibling);

	return newRow;
};

///////////////////////////////////////////////////////////////////////
function pm_CreateTableRow(doc, arg) {
	var tr = doc.createElement('tr');
	
	pm_Logger.debug('arg='+ arg);
	
	if (arg.length) {
		for (var i=0; i<arg.length; i++) {
			var td = doc.createElement('td');
			td.appendChild(arg[i]);
			tr.appendChild(td);
		}
	} else {
		var td = doc.createElement('td');
		td.appendChild(arg);
		tr.appendChild(td);
	}	

	return tr;
};

///////////////////////////////////////////////////////////////////////
function pm_CreateAnchor(doc, href, arg) {
	var anchor = doc.createElement('a');
	anchor.href = href;

	if (arg.length) {
		for (var i=0; i<arg.length; i++) {
			anchor.appendChild(arg[i]);
		}
	} else {
		anchor.appendChild(arg);
	}

	return anchor;
};

///////////////////////////////////////////////////////////////////////
function pm_Trim(s) {
	return s.replace(/^\s+|\s+$/g, '');
}

///////////////////////////////////////////////////////////////////////
function pm_XPathFirstNode(aXPath, aDocument) {
	return aDocument.evaluate(aXPath, aDocument, null, 
		XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

///////////////////////////////////////////////////////////////////////
function pm_XPathOrderedSnapshot(aXPath, aDocument) {
	return aDocument.evaluate(aXPath, aDocument, null, 
		XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
}

///////////////////////////////////////////////////////////////////////
function pm_NextSibling(node, tagName) {
	tagName = tagName.toUpperCase();
	node = node.nextSibling;
	
	while (node) {
		if (node.tagName == tagName) {
			return node;
		}
		
		node = node.nextSibling;
	}
	
	return node;
}

///////////////////////////////////////////////////////////////////////
// EOF
///////////////////////////////////////////////////////////////////////
