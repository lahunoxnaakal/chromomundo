/**
 * commonFunctions.js 
 * Copyright (C) 2007-2009  Tommi Rautava
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

	var b1 = doc.createElement('b');
	b1.className = 'popomungo_added';
	b1.appendChild(doc.createTextNode(key));

	var td1 = doc.createElement('td');
	td1.appendChild(b1);

	var span2 = doc.createElement('span');
	span2.className = 'popomungo_added';
	span2.appendChild(doc.createTextNode(value));
	
	if (hover) {
		span2.setAttribute('title', hover);
	}

	var td2 = doc.createElement('td');
	td2.appendChild(span2);

	var tr1 = doc.createElement('tr');
	tr1.appendChild(td1);
	tr1.appendChild(td2);

	afterRow.parentNode.insertBefore(tr1, afterRow.nextSibling);

	return tr1;
};


/**
 * This function is based on the HTML parser example that was published on 
 * the Greasemonkey blog 4th December 2005 by boogs 
 * (Aaron Boodman <boogs@youngpup.net>).
 * 
 * The blog article:
 * http://www.greasespot.net/2005/12/workarounds-for-missing-xmlhttprequest.html
 * 
 * The example script:
 * http://youngpup.net/userscripts/htmlparserexample.user.js
 */ 
function pm_ConvertResponseTextIntoIFrame(doc, responseText, callback) 
{
	try {
		// create an IFRAME to write the document into. the iframe must be added
		// to the document and rendered (eg display != none) to be property 
		// initialized.
		var iframe = doc.createElement('iframe');
		iframe.style.visibility = 'hidden';
		iframe.style.position = 'absolute';
		iframe.id = 'popomungo_iframe';
		doc.body.appendChild(iframe);
		
		// give it a URL so that it will create a .contentDocument property. Make
		// the URL be the current page's URL so that we can communicate with it.
		// Otherwise, same-origin policy would prevent us.
		iframe.contentWindow.location.href = doc.location.href;
		
		// write the received content into the document
		iframe.contentDocument.open('text/html');
		iframe.contentDocument.write(responseText);
		
		iframe.contentDocument.addEventListener(
			'DOMContentLoaded', 
			function() {
				callback(iframe.contentDocument);
				iframe.parentNode.removeChild(iframe);
			},
			false
		);
		
		iframe.contentDocument.close();
	}
	catch (err) {
		pm_Logger.logError(err);
	}
	
	return true;
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
