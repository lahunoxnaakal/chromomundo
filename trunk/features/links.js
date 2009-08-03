/**
 * links.js
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

function pm_LinksClass() {
	// void
}

pm_LinksClass.prototype = {
	VISIBLE_TEXT_LINK: 1,
	VISIBLE_ICON_LINK: 2,

	localeIdRegExp: /[?&]localeid=(\d+)/i,

	characterIdRegExp: /characterid=(\d+)/i,
	
	MOVE_HERE_ICON_URL: chrome.extension.getURL("skin/icons/silk/door_in.png"),
	
	VIEW_CHARACTERS_ICON_URL: chrome.extension.getURL("skin/icons/silk/group.png"),

	CALL_CHARACTER_ICON_URL: chrome.extension.getURL("skin/icons/silk/phone.png"),
	
	SEND_MESSAGE_ICON_URL: chrome.extension.getURL("skin/icons/silk/email_edit.png"),
	
	ARROW_ICON_URL: chrome.extension.getURL("skin/icons/silk/bullet_go.png"),	
       
	LOCALE_MENUS_XPATH: '/html/body/table[last()]/tbody/tr/td[1]/table/tbody',
	
	LINKS_ADDED_ATTRIBUTE: '_popomungoLinksAdded',

	moveHereAbbrevText: null,
	viewCharactersAbbrevText: null,
	callCharAbbrevText: null,
	sendMsgAbbrevText: null,

	moveHereText: null,
	viewCharactersText: null,
	callCharText: null,
	sendMsgText: null,

	callLinkEnabled: false,
	messageLinkEnabled: false,
	moveHereLinkEnabled: false,
	viewCharactersLinkEnabled: false,
	localeIconLinksEnabled: false,
	iconLinksEnabled: false,
	textLinksEnabled: false,
	textStyle: '',
	

	handleEvent: function handleEvent(e) {
		try {
			var target = e.target;

			if (!(target instanceof HTMLAnchorElement)) {
				target = target.parentNode;
				
				if (!(target instanceof HTMLAnchorElement)) {
					return true;
				}
			}
			
			//pm_Logger.debugObject(e, 'e');

			switch (e.type) {
			case "click":
				if (target.hasAttribute("onclick"))
				{
					if (!target.hasAttribute(this.LINKS_ADDED_ATTRIBUTE)) {
						target.setAttribute(this.LINKS_ADDED_ATTRIBUTE, true);
						return this.addVisibleLinksOnMenuClickEvent(target);
					}
				}
				break;

			default:
				pm_Logger.logError("Unexpected event: "+ e.type);
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}
		
		return true;
	},
	

	addEventHandlerOnCityPage: function addEventHandlerOnCityPage(aDocument) {
		try {
			this._processLinks_popupLinks(aDocument);

			var localeVisibleLinksEnabled = pm_Prefs.isEnabled(pm_PrefKeys.LINKS_LOCALE_VISIBLE_LINKS_ENABLED);

			if (localeVisibleLinksEnabled) {
				this._prepareVisibleLinks(aDocument);
				
				pm_Logger.debug("install click event handler");
				var node = pm_XPathFirstNode(this.LOCALE_MENUS_XPATH, aDocument);
				node.addEventListener("click", this, true);
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	},
	
	
	processLinks: function processLinks(aDocument) {
		try {
			this._processLinks_popupLinks(aDocument);
			this._processLinks_visibleLinks(aDocument);
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	},


	_processLinks_popupLinks: function _processLinks_popupLinks(aDocument) {
		try {
			var charPopupLinksEnabled = pm_Prefs.isEnabled(pm_PrefKeys.LINKS_CHARACTER_POPUP_ENABLED); 
			var localePopupLinksEnabled = pm_Prefs.isEnabled(pm_PrefKeys.LINKS_LOCALE_POPUP_ENABLED);
		
			if (charPopupLinksEnabled || localePopupLinksEnabled) 
			{
				pm_LinkMenu.appendPopupMenu(aDocument);
		
				pm_Logger.debug("install mouseover, mouseout & click event handler");
				var elem = aDocument.body;
				elem.addEventListener('mouseover', pm_LinkMenu, true);
				elem.addEventListener('mouseout', pm_LinkMenu, true);
				elem.addEventListener('click', pm_LinkMenu, true);
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	},	


	_processLinks_visibleLinks: function _processLinks_visibleLinks(aDocument) {
		try {
			var charVisibleLinksEnabled = pm_Prefs.isEnabled(pm_PrefKeys.LINKS_CHARACTER_VISIBLE_LINKS_ENABLED); 
			var localeVisibleLinksEnabled = pm_Prefs.isEnabled(pm_PrefKeys.LINKS_LOCALE_VISIBLE_LINKS_ENABLED);
		
			if (charVisibleLinksEnabled || localeVisibleLinksEnabled) 
			{
				this.addVisibleLinks(
					aDocument, 
					charVisibleLinksEnabled, 
					localeVisibleLinksEnabled);
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	},	

	
	addVisibleLinks: function addVisibleLinks(aDocument, charLinksEnabled, localeLinksEnabled) 
	{
		try {
			if (!this._prepareVisibleLinks(aDocument))
				return;
			
			// Loop through all anchor nodes.
			var anchorNodes = aDocument.getElementsByTagName('a');
			pm_Logger.debug('anchorNodes='+ anchorNodes.length);
		
			var ownCharId = pm_UserSettings.getCharacterId(aDocument);

			for (var i = anchorNodes.length - 1; i > -1; i--) {
				var anchorNode = anchorNodes[i];
				
				//pm_Logger.debug(i +': path='+ anchorNode.pathname + ', search='+ anchorNode.search);

				try {
					if (!anchorNode.href || 
						!anchorNode.pathname) {
						//pm_Logger.debug(i +': No href/path, link skipped.');
						continue;
					}
				}
				catch (err) {
					// Invalid or missing href...
					continue;
				}

				var pathname = anchorNode.pathname.toLowerCase();
				var search = anchorNode.search.toLowerCase();
				
				if (localeLinksEnabled && 
					this._addVisibleLinks_localeLinks(
						aDocument, anchorNode, pathname, search)) 
				{ //void	
				}
				else if (charLinksEnabled &&
					this._addVisibleLinks_characterLinks(
						aDocument, anchorNode, pathname, search, ownCharId))
				{ // void
				}
				
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	},
	

	_prepareVisibleLinks: function _prepareVisibleLinks(aDocument) {
		this._getVisibleLinksPrefs();
		
		if (!(this.callLinkEnabled || 
			this.messageLinkEnabled || 
			this.moveHereLinkEnabled || 
			this.viewCharactersLinkEnabled)) 
		{
			return false;
		}

		this._getVisibleLinksStrings();
		
		if (this.iconLinksEnabled && 
			this.localeIconLinksEnabled)
		{
			pm_Charts.PrepareLocales(aDocument);
		}

		return true;
	},
	
	
	_getVisibleLinksPrefs: function _getVisibleLinksPrefs() {
		this.callLinkEnabled = pm_Prefs.isEnabled(pm_PrefKeys.LINKS_CHARACTER_VISIBLE_CALL_LINK_ENABLED);
		this.messageLinkEnabled = pm_Prefs.isEnabled(pm_PrefKeys.LINKS_CHARACTER_VISIBLE_MESSAGE_LINK_ENABLED);
		this.moveHereLinkEnabled = pm_Prefs.isEnabled(pm_PrefKeys.LINKS_LOCALE_VISIBLE_GOTO_LINK_ENABLED);
		this.viewCharactersLinkEnabled = pm_Prefs.isEnabled(pm_PrefKeys.LINKS_LOCALE_VISIBLE_VIEW_CHARACTERS_ENABLED);

		// Link type.
		this.localeIconLinksEnabled = pm_Prefs.isEnabled(pm_PrefKeys.LOCALES_IMAGES_ENABLED);
		var visibleLinkType = pm_Prefs.getPref(pm_PrefKeys.LINKS_VISIBLE_LINK_TYPE, this.VISIBLE_TEXT_LINK);
		this.iconLinksEnabled = (visibleLinkType == this.VISIBLE_ICON_LINK);
		this.textLinksEnabled = !this.iconLinksEnabled; // default

		if (this.textLinksEnabled) {
			var textColor = pm_Prefs.getPref(pm_PrefKeys.LINKS_VISIBLE_LINK_TEXT_COLOR, "#000000");
			var backgroundColor = pm_Prefs.getPref(pm_PrefKeys.LINKS_VISIBLE_LINK_BG_COLOR, "#CCCCFF");
			this.textStyle = 'color: '+ textColor +'; background-color: '+ backgroundColor +';';			
		}
	},

	
	_getVisibleLinksStrings: function _getVisibleLinksStrings() {
		// Get the strings.								
		this.moveHereAbbrevText = pm_Strings.getString(pm_StringKeys.LINKS_LOCALES_MOVE_HERE_ABBREV, null);
		this.viewCharactersAbbrevText = pm_Strings.getString(pm_StringKeys.LINKS_LOCALES_VIEW_CHARACTERS_ABBREV, null);
		this.callCharAbbrevText = pm_Strings.getString(pm_StringKeys.LINKS_CHARACTERS_CALL_ABBREV, null);
		this.sendMsgAbbrevText = pm_Strings.getString(pm_StringKeys.LINKS_CHARACTERS_SEND_MESSAGE_ABBREV, null);

		this.moveHereText = pm_Strings.getString(pm_StringKeys.LINKS_LOCALES_MOVE_HERE, null);
		this.viewCharactersText = pm_Strings.getString(pm_StringKeys.LINKS_LOCALES_VIEW_CHARACTERS, null);
		this.callCharText = pm_Strings.getString(pm_StringKeys.LINKS_CHARACTERS_CALL, null);
		this.sendMsgText = pm_Strings.getString(pm_StringKeys.LINKS_CHARACTERS_SEND_MESSAGE, null);
	},
	
	
	_addVisibleLinks_localeLinks: function _addVisibleLinks_localeLinks(
			aDocument, anchorNode, pathname, search)
	{
		if (pathname.indexOf('/locale.asp') > -1 &&
			search.indexOf('action=view&') > -1)
		{
			idMatch = search.match(this.localeIdRegExp);

			if (idMatch)
			{
				if (this.moveHereLinkEnabled) {
					if (this.iconLinksEnabled) {
						/* 
						 * If we have an image inside the link
						 * take it out and put the link on it.
						 */									
						node1 = anchorNode.getElementsByTagName('img')[0];
						
						if (node1) {
							anchorNode.removeChild(node1);
						}
						else {
							node1 = this.getIconNode(aDocument, this.MOVE_HERE_ICON_URL);
						}									
					}
					else {
						node1 = aDocument.createElement('span');
						node1.className = 'popomungo_text_link';
						node1.setAttribute('style', this.textStyle);
						node1.appendChild(aDocument.createTextNode(this.moveHereAbbrevText));
					}
		
					anchor1 = aDocument.createElement('a');
					anchor1.href = anchorNode.href;
					anchor1.search = '?action=MoveHere&LocaleID='+ idMatch[1];
					anchor1.title = this.moveHereText;
					anchor1.appendChild(node1);

					anchorNode.parentNode.insertBefore(anchor1, anchorNode);
				}

				// View characters
				if (this.viewCharactersLinkEnabled) {
					if (this.iconLinksEnabled) {
						/* 
						 * If we have an image inside the link
						 * take it out and put the link on it.
						 */									
						node1 = anchorNode.getElementsByTagName('img')[0];
						
						if (node1) {
							anchorNode.removeChild(node1);
						}
						else {
							node1 = this.getIconNode(aDocument, this.VIEW_CHARACTERS_ICON_URL);
						}									
					}
					else {
						node1 = aDocument.createElement('span');
						node1.className = 'popomungo_text_link';
						node1.setAttribute('style', this.textStyle);
						node1.appendChild(aDocument.createTextNode(this.viewCharactersAbbrevText));
					}
					
					anchor1 = aDocument.createElement('a');
					anchor1.href = anchorNode.href;
					anchor1.search = '?action=ViewCharacters&LocaleID='+ idMatch[1];
					anchor1.title = this.viewCharactersText;
					anchor1.appendChild(node1);

					anchorNode.parentNode.insertBefore(anchor1, anchorNode);
				}
			}
			
			return true;
		}

		return false;
	},


	_addVisibleLinks_characterLinks: function _addVisibleLinks_characterLinks(
			aDocument, anchorNode, pathname, search, ownCharId) 
	{
		if (pathname.indexOf('/characterdetails.asp') > -1 &&
			search.indexOf('action=view&') > -1)
		{
			idMatch = search.match(this.characterIdRegExp);

			if (idMatch) {
				var charId = idMatch[1];
				
				if (charId != ownCharId) {

					// Call
					if (this.callLinkEnabled) {
						if (this.iconLinksEnabled) {
							node1 = aDocument.createElement('img');
							node1.src = this.CALL_CHARACTER_ICON_URL;
							node1.className = 'popomungo_icon_link';
						}
						else {
							node1 = aDocument.createElement('span');
							node1.className = 'popomungo_text_link';
							node1.setAttribute('style', this.textStyle);
							node1.appendChild(aDocument.createTextNode(this.callCharAbbrevText));
						}
				
						anchor1 = aDocument.createElement('a');
						anchor1.href = anchorNode.href;
						anchor1.pathname = '/Common/Interact.asp';
						anchor1.search = '?action=PhoneInteract&CharacterID='+ charId;
						anchor1.title = this.callCharText;
						anchor1.appendChild(node1);
			
						anchorNode.parentNode.insertBefore(anchor1, anchorNode);
					}

					// Send Message
					if (this.messageLinkEnabled) {
						if (this.iconLinksEnabled) {
							node1 = aDocument.createElement('img');
							node1.src = this.SEND_MESSAGE_ICON_URL;
							node1.className = 'popomungo_icon_link';
						}
						else {
							node1 = aDocument.createElement('span');
							node1.className = 'popomungo_text_link';
							node1.setAttribute('style', this.textStyle);
							node1.appendChild(aDocument.createTextNode(this.sendMsgAbbrevText));
						}
				
						anchor1 = aDocument.createElement('a');
						anchor1.href = anchorNode.href;
						anchor1.search = '?action=SendMessage&CharacterID='+ charId;
						anchor1.title = this.sendMsgText;
						anchor1.appendChild(node1);
			
						anchorNode.parentNode.insertBefore(anchor1, anchorNode);
					}
	
				}
			}
			
			return true;
		}

		return false;
	},
	
	
	addVisibleLinksOnMenuClickEvent: function addVisibleLinksOnMenuClickEvent(aTarget) {
		try {
			var timer1 = new pm_TimerClass();
			
			var aDocument = aTarget.ownerDocument; 

			var onClick = aTarget.getAttribute('onclick');
			var match = onClick.match(pm_Locales.MENU_NAME_REGEXP);
			
			if (match && match.length == 2) {
				var menuName = match[1];
				var menuNode = aDocument.getElementById(menuName);
				
				if (menuNode)
				{
					pm_Logger.debug('Adding visible links to menu='+ menuName);
					
					var anchorNodes = pm_ElementCache.getAnchorNodesOnMenu(menuName, menuNode);

					for (var j = anchorNodes.length - 1; j > -1; j--)
					{
						var anchorNode = anchorNodes[j];
						
						if (!anchorNode.hasAttribute('onclick')) {
							var pathname = anchorNode.pathname.toLowerCase();
							var search = anchorNode.search.toLowerCase();
	
							this._addVisibleLinks_localeLinks(aDocument, anchorNode, pathname, search);
						}
						else {
							anchorNode.setAttribute(this.LINKS_ADDED_ATTRIBUTE, true);
						}
					}
				}
			}

			pm_Logger.debug("completed: "+ timer1.elapsedTimeStr());
		}
		catch (err) {
			pm_Logger.logError(err);
		}

		return true;
	},
	

	getIconNode: function getIconNode(aDocument, aIconSrc) {
		try {
			imgNode = aDocument.createElement('img');
			imgNode.src = aIconSrc;
			imgNode.className = 'popomungo_icon_link';
			
			return imgNode;
		}
		catch (err) {
			pm_Logger.logError(err);
		}
		
		return null;
	}
};

var pm_Links = new pm_LinksClass();

// EOF
