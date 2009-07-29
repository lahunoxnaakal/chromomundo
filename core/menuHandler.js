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

function pm_MenuHandlerClass() {
	// void
}

pm_MenuHandlerClass.prototype = {
	
	handleEvent: function handleEvent(aEvent) {
		pm_Logger.debug("Event="+ aEvent.type);
		
		switch (aEvent.type) {
			case "popupshowing": 
				this.contextMenuPopupShowing(aEvent);
				break;

			default: 
				pm_Logger.logError("Unexpected event: "+ aEvent.type);
		}
	},
	
	
	contextMenuPopupShowing: function contextMenuPopupShowing(aEvent) {
		try {
			var menuSep    = window.document.getElementById('popomungoMenuSeparator_ContentAreaContextMenu');
			var menu       = window.document.getElementById('popomungoMenu_ContentAreaContextMenu');
			var linkNode   = this._findParentLink(document.popupNode);
			var isBookmark = (linkNode.className == pm_Bookmarks.BOOKMARK_CLASSNAME);
			
			var menuVisible = false;
			menuVisible = this._enableAddLinkBookmark(!isBookmark, linkNode) || menuVisible;
			menuVisible = this._enableAddPageBookmark(!isBookmark) || menuVisible;
			menuVisible = this._enableDeleteBookmark(isBookmark) || menuVisible;
			menuVisible = this._enableRenameBookmark(isBookmark) || menuVisible;
			
			menuSep.hidden = !menuVisible;
			menu.hidden = !menuVisible;
		}
		catch (err) {
			pm_Logger.logError(err);
		}
		
		return true;
	},
	

	_enableAddLinkBookmark: function _enableAddLinkBookmark(aEnabled, aLinkNode) {
		try {
			//pm_Logger.debug("tagName="+ aLinkNode.tagName);
			var menuItem = window.document.getElementById('popomungoMenuItem_AddLinkToBookmarks');
			
			if (aEnabled &&
				aLinkNode.tagName == 'A')
			{
				var hostname = aLinkNode.hostname;
		
				//pm_Logger.debug("link hostname="+ hostname);
				
				if (hostname.match(pm_CommonConstants.POPMUNDO_DOMAIN_REGEXP)) {
					menuItem.hidden = false;
					return true;
				}
			}

			//pm_Logger.debug("popupNode ignored");
			menuItem.hidden = true;
		}
		catch (err) {
			pm_Logger.logError(err);
		}
		
		return false;
	},

	
	_enableAddPageBookmark: function _enableAddPageBookmark(aEnabled) {
		try {
			var menuItem = window.document.getElementById('popomungoMenuItem_AddPageToBookmarks');
			
			if (aEnabled) {
				var doc = document.popupNode.ownerDocument;
				
				if (doc) {
					var hostname = doc.location.hostname;
					//pm_Logger.debug("document hostname="+ hostname);
					
					if (hostname.match(pm_CommonConstants.POPMUNDO_DOMAIN_REGEXP)) {
						menuItem.hidden = false;
						return true;
					}
				}
			}

			menuItem.hidden = true;
		}
		catch (err) {
			pm_Logger.logError(err);
		}
		
		return false;
	},
	
	
	_enableDeleteBookmark: function _enableDeleteBookmark(aEnable) {
		try {
			var menuItem = window.document.getElementById('popomungoMenuItem_DeleteBookmark');
			menuItem.hidden = !aEnable;
			return aEnable;
		}
		catch (err) {
			pm_Logger.logError(err);
		}
		
		return false;
	},
	

	_enableRenameBookmark: function _enableRenameBookmark(aEnable) {
		try {
			var menuItem = window.document.getElementById('popomungoMenuItem_RenameBookmark');
			menuItem.hidden = !aEnable;
			return aEnable;
		}
		catch (err) {
			pm_Logger.logError(err);
		}
		
		return false;
	},
	

	_findParentLink: function _findParentLink(aNode) {
		try {
			var node = aNode;
			
			try {
				while (node.tagName != 'A') {
					node = node.parentNode;
				}
				
				return node;
			}
			catch (err) {
				// ignore
			}
			
			return aNode;
		}
		catch (err) {
			pm_Logger.logError(err);
		}
		
		return null;
	},
	
	
	onCommand_AddPageToBookmarks: function onCommand_AddPageToBookmarks(aDocument) {
		try {
			pm_Logger.debug("Add page to bookmarks");
			var ownerDoc = aDocument.popupNode.ownerDocument;
			
			var title = pm_Trim(ownerDoc.title);
			
			if (title.indexOf(' - ') > -1) {
				title = title.replace('Popmundo - ', '');
			}
			
			pm_Bookmarks.saveBookmark(ownerDoc, ownerDoc.location, title);
			//pm_Logger.debug("doc="+ aDocument +", ownerDoc="+ ownerDoc);
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	},
	

	onCommand_AddLinkToBookmarks: function onCommand_AddLinkToBookmarks(aDocument) {
		try {
			pm_Logger.debug("Add link to bookmarks");
			var ownerDoc = aDocument.popupNode.ownerDocument;
			var node = this._findParentLink(aDocument.popupNode);
			
			var name = pm_Trim(aDocument.popupNode.textContent);
			
			if (name.length == 0) {
				if (node.title) {
					name = pm_Trim(node.title);
				}
				else if (node.alt) {
					name = pm_Trim(node.alt);
				}
				else {
					name = node.href;
				}
			}
			
			pm_Bookmarks.saveBookmark(ownerDoc, node, name);
			//pm_Logger.debug("doc="+ aDocument +", ownerDoc="+ ownerDoc);
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	},

	
	onCommand_DeleteBookmark: function onCommand_DeleteBookmark(aDocument) {
		try {
			pm_Logger.debug("Delete bookmark");
			var ownerDoc = aDocument.popupNode.ownerDocument;
			var node = this._findParentLink(aDocument.popupNode);
			pm_Bookmarks.deleteBookmark(ownerDoc, node);
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	},

	
	onCommand_RenameBookmark: function onCommand_RenameBookmark(aDocument) {
		try {
			pm_Logger.debug("Rename bookmark");
			var ownerDoc = aDocument.popupNode.ownerDocument;
			var node = this._findParentLink(aDocument.popupNode);
			pm_Bookmarks.renameBookmark(ownerDoc, node);
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	},

	
	setContextMenuListener: function setContextMenuListener(aEnabled) {
		try {
			var menu = window.document.getElementById("contentAreaContextMenu");
			
			if (aEnabled && !this.contextMenuListenerEnabled) {
				this.contextMenuListenerEnabled = true;
				pm_Logger.debug("Add popupshowing listener");
				menu.addEventListener("popupshowing", this, false);
			}
			else if (!aEnabled && this.contextMenuListenerEnabled){
				this.contextMenuListenerEnabled = false;
				pm_Logger.debug("Remove popupshowing listener");
				menu.removeEventListener("popupshowing", this, false);
			}
			else {
				pm_Logger.debug('popupshowing listener enabled='+ this.contextMenuListenerEnabled);
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	}

};

var pm_MenuHandler = new pm_MenuHandlerClass();

// EOF