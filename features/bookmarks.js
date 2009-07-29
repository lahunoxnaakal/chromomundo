/**
 * scoring.js
 * Copyright (C) 2009  Tommi Rautava
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

function pm_BookmarksClass() {
	// void
}

pm_BookmarksClass.prototype = {
		
	//LAST_MENU_XPATH: '//div[@class="menu"][last()]/table[@class="menu"][last()]',
	LAST_MENU_XPATH: '//div[@class="menu"][last()]',
	
	MENU_DIV_ID: 'pmMenu1',

	MENU_TABLE_ID: 'popomungo_bookmarks',
	
	MENU_ICON_URL: 'graphics/%1/Icons/Icon_Character.gif',
	
	BOOKMARK_CLASSNAME: 'popomungo_bookmark',
	
	BOOKMARK_EDIT_CLASSNAME: 'popomungo_bookmark_edit',
	
	ID_PREFIX: 'pmBookmark',
	

	_getRelativePath: function _getRelativePath(aLocationNode) {
		try {
			var fullPath = aLocationNode.pathname + aLocationNode.hash + aLocationNode.search;
			var relativePath = fullPath.replace(/^\/Common\//i, '');
			
			pm_Logger.debug("\nfull="+ fullPath +"\nrel="+ relativePath);
			
			return relativePath;
		}
		catch (err) {
			pm_Logger.logError(err);
		}
		
		return '';
	},

	
	_getBookmarksData: function _getBookmarksData() {
		try {
			var prefData = pm_Prefs.getPref("extensions.popomungo.bookmarks.data");
			var dataHash = eval(prefData);
			return dataHash ? dataHash : {};
		}
		catch (err) {
			pm_Logger.logError(err);
		}
		
		return {};
	},
	

	_setBookmarksData: function _setBookmarksData(aDataHash) {
		try {
			//pm_Logger.debugObject(aDataHash, "dataHash");
			pm_Prefs.setPref("extensions.popomungo.bookmarks.data", aDataHash.toSource());
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	},
	

	saveBookmark: function saveBookmark(aDocument, aLocationNode, aName) {
		try {
			var relativePath = this._getRelativePath(aLocationNode);

			var dataHash = this._getBookmarksData();
			dataHash[relativePath] = aName;
			this._setBookmarksData(dataHash);
	
			var lastMenu = pm_XPathFirstNode(this.LAST_MENU_XPATH, aDocument);
			
			if (!lastMenu)
				return; // Ok, do not display bookmarks menu on this page.

			var isMinimized = this.isMinimized(lastMenu);
			
			var menuTable = aDocument.getElementById(this.MENU_TABLE_ID);
			
			if (!menuTable)
			{
				var menuTitle = pm_Strings.getString(pm_StringKeys.BOOKMARKS_MENU_TITLE, null);
				var menuHeader = this.createMenuHeader(aDocument, menuTitle, lastMenu);

				menuTable = this.createMenuTable(aDocument);

				if (this.createMenuLink(aDocument, menuTable, relativePath, aName))
					isMinimized = false;

				var menuDiv = this.createMenuDiv(aDocument, menuTable, isMinimized);
				
				this.addMenuToDocument(aDocument, menuHeader, menuDiv, lastMenu);
			}
			else {
				if (this.createMenuLink(aDocument, menuTable, relativePath, aName))
				{
					var menuDiv2 = aDocument.getElementById(this.MENU_DIV_ID);
						
					if (this.isMinimized(menuDiv2))
						menuDiv2.style.display = 'block';
				}
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	},		

	
	deleteBookmark: function deleteBookmark(aDocument, aLocationNode) {
		try {
			var relativePath = this._getRelativePath(aLocationNode);

			var dataHash = this._getBookmarksData();
			delete dataHash[relativePath];
			this._setBookmarksData(dataHash);

			var id = aLocationNode.id;
			var tr1 = aDocument.getElementById(id + 'tr');
			
			tr1.parentNode.removeChild(tr1);
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	},
	
	
	renameBookmark: function renameBookmark(aDocument, aLocationNode) {
		try {
			var relativePath = this._getRelativePath(aLocationNode);

			var id = aLocationNode.id;
			var tr1 = aDocument.getElementById(id + 'tr');
			td1 = tr1.cells.item(0);
			
			var tdWidth = td1.offsetWidth;
			td1.style.height = td1.offsetHeight;
			
			aLocationNode.style.display = 'none';

			var form1 = aDocument.createElement('form');
			// Post the form to a safe place, if the event listener fails.
			form1.action = 'http://popomungo.mozdev.org';
			form1.className = this.BOOKMARK_EDIT_CLASSNAME;
			td1.appendChild(form1);

			var input1 = aDocument.createElement('input');
			input1.name = 'name';
			input1.type = 'text';
			input1.id = id;
			input1.value = aLocationNode.textContent;
			input1.className = this.BOOKMARK_EDIT_CLASSNAME;
			input1.style.width = (tdWidth - 16) +"px";
			form1.appendChild(input1);

			var input2 = aDocument.createElement('input');
			input2.name = 'url';
			input2.type = 'hidden';
			input2.value = relativePath;
			form1.appendChild(input2);

			var input3 = aDocument.createElement('input');
			input3.name = 'id';
			input3.type = 'hidden';
			input3.value = id;
			form1.appendChild(input3);

			form1.addEventListener('submit', this, true);
			input1.focus();
			input1.select();
			
			input1.addEventListener('keypress', this, false);
			input1.addEventListener('blur', this, false);
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	},
	
	
	saveRenamedBookmark: function saveRenamedBookmark(aEvent) {
		try {
			var form1 = aEvent.currentTarget;
			var doc = form1.ownerDocument;
			
			var name = form1.elements.namedItem('name').value;
			var url = form1.elements.namedItem('url').value;
			var id = form1.elements.namedItem('id').value;
			
			var dataHash = this._getBookmarksData();
			dataHash[url] = name;
			this._setBookmarksData(dataHash);
			
			form1.parentNode.removeChild(form1);
			
			var a1 = doc.getElementById(id);
			a1.removeAttribute('style');
			a1.innerHTML = '';
			a1.appendChild(doc.createTextNode(name));
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	},
	
	
	cancelRenameBookmark: function cancelRenameBookmark(aEvent) {
		try {
			var nameElem = aEvent.currentTarget;
			var doc = nameElem.ownerDocument;
			var form1 = nameElem.form;
			
			var id = form1.elements.namedItem('id').value;

			form1.parentNode.removeChild(form1);
			
			var a1 = doc.getElementById(id);
			a1.removeAttribute('style');
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	},

	
	showBookmarks: function showBookmarks(aDocument) {
		try {
			var lastMenu = pm_XPathFirstNode(this.LAST_MENU_XPATH, aDocument);
			
			if (lastMenu) {
				var prefData = pm_Prefs.getPref("extensions.popomungo.bookmarks.data");
				var dataHash = eval(prefData);

				var dataArr = new Array();
				var i = 0;
				
				for (var n in dataHash) {
					dataArr[i++] = {
						u: n,
						n: dataHash[n]
					};
				}
				
				pm_Logger.debug("bookmarks="+ dataArr.length);
				
				// Skip the rest, if there are no bookmarks.
				if (dataArr.length == 0) return true;

				var menuTable = this.createMenuTable(aDocument);
				
				dataArr.sort(function(a, b) {
				    var n1 = a.n;
				    var n2 = b.n;
				    
				    if (n1 < n2) return -1;
				    if (n1 > n2) return 1;
				    return 0;
				});
				
				var isMinimized = this.isMinimized(lastMenu);
				var idSerial = 1;
				
				for (var j = 0, data; data = dataArr[j]; j++) {
					if (this.createMenuLink(aDocument, menuTable, data.u, data.n, idSerial++))
						isMinimized = false;
				}	

				var menuTitle = pm_Strings.getString(pm_StringKeys.BOOKMARKS_MENU_TITLE, null);
				var menuHeader = this.createMenuHeader(aDocument, menuTitle, lastMenu);

				var menuDiv = this.createMenuDiv(aDocument, menuTable, isMinimized);

				this.addMenuToDocument(aDocument, menuHeader, menuDiv, lastMenu);
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}
		
		return true;
	},
	
	
	 createMenuLink: function createMenuLink(aDocument, aMenu, aLinkUrl, aLinkText, aIdSerial) {
		try {
			var id = this.ID_PREFIX + aIdSerial;
			
			var a1 = aDocument.createElement('a');
			a1.href = aLinkUrl;
			a1.className = this.BOOKMARK_CLASSNAME;
			a1.id = id;
			a1.appendChild(aDocument.createTextNode(aLinkText));
			
			var td1 = aDocument.createElement('td');
			td1.appendChild(a1);
			
			var tr1 = aDocument.createElement('tr');
			tr1.id = id + 'tr';
			tr1.appendChild(td1);
			
			var matched = false;
			
			if (aDocument.location.href == a1.href) {
				matched = true;
				tr1.className = 'PageSelected';
			}
	
			aMenu.appendChild(tr1);
			
			return matched;
		}
		catch (err) {
			pm_Logger.logError(err);
		}
		
		return false;
	},


	createMenuHeader: function createMenuHeader(aDocument, aMenuTitle, aMenu) {
		try {
			var iconWidth = 32;
			var iconHeight = 34;
			
			var headerIconImg = aDocument.createElement('img');
			headerIconImg.width = iconWidth;
			headerIconImg.height = iconHeight;
			headerIconImg.src = this.MENU_ICON_URL.replace('%1', pm_Styles.getTheme(aDocument));
			
			var headerIconTd = aDocument.createElement('td');
			headerIconTd.setAttribute('width', iconWidth);
			headerIconTd.setAttribute('height', iconHeight);
			headerIconTd.appendChild(headerIconImg);
			
			var headerTextDiv = aDocument.createElement('div');
			headerTextDiv.className = 'DarkColumnHeader';
			
			var isMinimized = this.isMinimized(aMenu); 

			if (isMinimized) {
				var headerToggleLink = aDocument.createElement('a');
				headerToggleLink.href = "#"+ this.MENU_DIV_ID;
				headerToggleLink.addEventListener('click', this._toggleMenu, true);
				headerToggleLink.appendChild(aDocument.createTextNode(aMenuTitle +" \u00BB"));
				headerTextDiv.appendChild(headerToggleLink);
			}
			else {
				headerTextDiv.appendChild(aDocument.createTextNode(aMenuTitle));
			}
			
			var headerTextTd = aDocument.createElement('td');
			//headerTextTd.setAttribute('width', tableWidth - iconWidth);
			headerTextTd.setAttribute('valign', 'top');
			headerTextTd.setAttribute('height', iconHeight);
			headerTextTd.appendChild(headerTextDiv);
			
			var headerTr = aDocument.createElement('tr');
			headerTr.appendChild(headerIconTd);
			headerTr.appendChild(headerTextTd);
			
			var menuHeader = aDocument.createElement('table');
			menuHeader.setAttribute('width', '100%');
			menuHeader.setAttribute('cellspacing', 0);
			menuHeader.setAttribute('cellpadding', 0);
			menuHeader.setAttribute('border', 0);
			menuHeader.appendChild(headerTr);
			
			return menuHeader;
		}
		catch (err) {
			pm_Logger.logError(err);
		}

		return null;
	},
	
	
	createMenuTable: function createMenuTable(aDocument) {
		try {
			var menuContent = aDocument.createElement('table');
			menuContent.className = 'menu';
			menuContent.id = this.MENU_TABLE_ID;
			menuContent.setAttribute('width', '100%');
			menuContent.setAttribute('cellspacing', 0);
			menuContent.setAttribute('cellpadding', 0);
			menuContent.setAttribute('border', 0);
			
			return menuContent;
		}
		catch (err) {
			pm_Logger.logError(err);
		}

		return null;
	},
	

	createMenuDiv: function createMenuDiv(aDocument, aMenuTable, aIsMinimized)
	{
		try {
			var menuDiv = aDocument.createElement('div');
			menuDiv.className = 'menu';
			menuDiv.id = this.MENU_DIV_ID;
			menuDiv.appendChild(aMenuTable);
	
			if (aIsMinimized)
				menuDiv.style.display = 'none';
			
			return menuDiv;
		}
		catch (err) {
			pm_Logger.logError(err);
		}

		return null;
	},

	
	isMinimized: function isMinimized(aNode) {
		return (aNode.style && aNode.style.display == 'none'); 
	},
	
	
	addMenuToDocument: function addMenuToDocument(aDocument, aMenuHeader, aMenuDiv, aMenu) {
		try {
			var followingNode = aMenu.nextSibling;
			
			if (!followingNode || followingNode.tagName != 'BR') {
				aMenu.parentNode.insertBefore(aDocument.createElement('br'), followingNode);
			}
			
			aMenu.parentNode.insertBefore(aMenuHeader, followingNode);
			aMenu.parentNode.insertBefore(aMenuDiv, followingNode);
			aMenu.parentNode.insertBefore(aDocument.createElement('br'), followingNode);
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	},
	
	
	handleEvent: function handleEvent(aEvent) {
		try {
			switch (aEvent.type) {
			case "submit": 
				aEvent.preventDefault();
				aEvent.stopPropagation();
				this.saveRenamedBookmark(aEvent);
				break;
				
			case "keypress":
			case "blur":
				this._handleKeypressEvent(aEvent);
				break;
				
			default: 
				pm_Logger.logError("Unexpected event: "+ aEvent.type);
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}

		return false;
	},
	
	
	_handleKeypressEvent: function _handleKeypressEvent(aEvent) {
		try {
			if (aEvent.DOM_VK_ESCAPE == aEvent.keyCode) {
				this.cancelRenameBookmark(aEvent);
			}
			else {
				pm_Logger.debug("ignored keyCode="+ aEvent.keyCode);
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	},
	
	
	_toggleMenu: function _toggleMenu(aEvent) {
		try {
			aEvent.preventDefault();
			aEvent.stopPropagation();
			var node = aEvent.currentTarget;
			var menuId = node.hash.replace('#', '');
			var menuDiv = node.ownerDocument.getElementById(menuId);
			menuDiv.style.display = (menuDiv.style.display == 'none') ? 'block' : 'none';
		}
		catch (err) {
			pm_Logger.logError(err);
		}
		
		return false;
	}
};

var pm_Bookmarks = new pm_BookmarksClass();

// EOF