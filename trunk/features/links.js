/*
 * links.js
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

var pm_Links = {
	VISIBLE_TEXT_LINK: 1,
	VISIBLE_ICON_LINK: 2,

	localePageRegExp: /\/locale\.asp/i,
	localeViewRegExp: /([?&]action=)view[&]/i,
	localeIdRegExp: /[?&]localeid=(\d+)/i,

	characterPageRegExp: /\/characterdetails\.asp/i,
	characterViewRegExp: /([?&]action=)view[&]/i,
	characterIdRegExp: /characterid=(\d+)/i,
	
	MOVE_HERE_ICON_URL: chrome.extension.getURL("skin/icons/silk/door_in.png"),
	
	VIEW_CHARACTERS_ICON_URL: chrome.extension.getURL("skin/icons/silk/group.png"),

	CALL_CHARACTER_ICON_URL: chrome.extension.getURL("skin/icons/silk/phone.png"),
	
	SEND_MESSAGE_ICON_URL: chrome.extension.getURL("skin/icons/silk/email_edit.png"),
	
	ARROW_ICON_URL: chrome.extension.getURL("skin/icons/silk/bullet_go.png"),	
       
	processLinks: function processLinks(aDocument) {
		try {
			if (!pm_Prefs.isEnabled(pm_PrefKeys.LINKS_FEATURES_ENABLED)) {
				return;
			}
			
			var popupLinksEnabled = pm_Prefs.isEnabled(pm_PrefKeys.LINKS_POPUP_ENABLED);
			var visibleLinksEnabled = pm_Prefs.isEnabled(pm_PrefKeys.LINKS_VISIBLE_LINKS_ENABLED);
			
			if (popupLinksEnabled) {
				var charPopupLinksEnabled = pm_Prefs.isEnabled(pm_PrefKeys.LINKS_CHARACTER_POPUP_ENABLED); 
				var localePopupLinksEnabled = pm_Prefs.isEnabled(pm_PrefKeys.LINKS_LOCALE_POPUP_ENABLED);
	
				if (charPopupLinksEnabled || localePopupLinksEnabled) 
				{
					this.addPopupLinkMenus(
						aDocument, 
						charPopupLinksEnabled, 
						localePopupLinksEnabled);
				}
			}
			
			if (visibleLinksEnabled) {
				var charVisibleLinksEnabled = pm_Prefs.isEnabled(pm_PrefKeys.LINKS_CHARACTER_VISIBLE_LINKS_ENABLED); 
				var localeVisibleLinksEnabled = pm_Prefs.isEnabled(pm_PrefKeys.LINKS_LOCALE_VISIBLE_LINKS_ENABLED);
	
				if (charVisibleLinksEnabled || localeVisibleLinksEnabled) 
				{
					var visibleLinkType = pm_Prefs.getSetting(pm_PrefKeys.LINKS_VISIBLE_LINK_TYPE, pm_Links.VISIBLE_ICON_LINK);
	
					this.addTextLinks(
						aDocument, 
						charVisibleLinksEnabled, 
						localeVisibleLinksEnabled,
						visibleLinkType);
				}
			}
			
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	},


	addTextLinks: function addTextLinks(
		aDocument, charLinksEnabled, localeLinksEnabled, linkType) 
	{
		try {
			var callLinkEnabled = pm_Prefs.isEnabled(pm_PrefKeys.LINKS_CHARACTER_VISIBLE_CALL_LINK_ENABLED);
			var messageLinkEnabled = pm_Prefs.isEnabled(pm_PrefKeys.LINKS_CHARACTER_VISIBLE_MESSAGE_LINK_ENABLED);
			var moveHereLinkEnabled = pm_Prefs.isEnabled(pm_PrefKeys.LINKS_LOCALE_VISIBLE_GOTO_LINK_ENABLED);
			var viewCharactersLinkEnabled = pm_Prefs.isEnabled(pm_PrefKeys.LINKS_LOCALE_VISIBLE_VIEW_CHARACTERS_ENABLED);

			if (!(callLinkEnabled || messageLinkEnabled || 
				moveHereLinkEnabled || viewCharactersLinkEnabled)) 
			{
				return;
			}

			// Link type.
			var localeIconLinksEnabled = pm_Prefs.isEnabled(pm_PrefKeys.LOCALES_IMAGES_ENABLED);
			var iconLinksEnabled = (linkType == pm_Links.VISIBLE_ICON_LINK);
			var textLinksEnabled = !iconLinksEnabled; // default

			var textStyle;

			if (textLinksEnabled) {
				var textColor = pm_Prefs.getSetting(pm_PrefKeys.LINKS_VISIBLE_LINK_TEXT_COLOR, "#000000");
				var backgroundColor = pm_Prefs.getSetting(pm_PrefKeys.LINKS_VISIBLE_LINK_BG_COLOR, "#CCCCFF");
				textStyle = 'color: '+ textColor +'; background-color: '+ backgroundColor +';';			
			}
			
			if (iconLinksEnabled && 
				localeIconLinksEnabled)
			{
				pm_Charts.PrepareLocales(aDocument);
			}

			// Get the strings.								
			var moveHereAbbrevText = pm_Strings.getString(pm_StringKeys.LINKS_LOCALES_MOVE_HERE_ABBREV, null);
			var viewCharactersAbbrevText = pm_Strings.getString(pm_StringKeys.LINKS_LOCALES_VIEW_CHARACTERS_ABBREV, null);
			var callCharAbbrevText = pm_Strings.getString(pm_StringKeys.LINKS_CHARACTERS_CALL_ABBREV, null);
			var sendMsgAbbrevText = pm_Strings.getString(pm_StringKeys.LINKS_CHARACTERS_SEND_MESSAGE_ABBREV, null);

			var moveHereText = pm_Strings.getString(pm_StringKeys.LINKS_LOCALES_MOVE_HERE, null);
			var viewCharactersText = pm_Strings.getString(pm_StringKeys.LINKS_LOCALES_VIEW_CHARACTERS, null);
			var callCharText = pm_Strings.getString(pm_StringKeys.LINKS_CHARACTERS_CALL, null);
			var sendMsgText = pm_Strings.getString(pm_StringKeys.LINKS_CHARACTERS_SEND_MESSAGE, null);
			
			// Loop through all anchor nodes.
			var anchorNodes = aDocument.getElementsByTagName('a');
			pm_Logger.debug('anchorNodes='+ anchorNodes.length);
		
			var ownCharId = pm_UserSettings.getCharacterId(aDocument);

			for (var i=anchorNodes.length - 1; i >= 0; i--) {
				var anchorNode = anchorNodes.item(i);
				
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

				if (anchorNode.pathname.match(this.localePageRegExp)) {
					if (localeLinksEnabled)
					{
						var idMatch = anchorNode.search.match(this.localeIdRegExp);

						if (idMatch)
						{
							if (moveHereLinkEnabled) {
								var node1;
								
								if (iconLinksEnabled) {
									/* 
									 * If we have an image inside the link
									 * take it out and put the link on it.
									 */									
									node1 = anchorNode.getElementsByTagName("img")[0];
									
									if (node1) {
										anchorNode.removeChild(node1);
									}
									else {
										node1 = this.getIconNode(aDocument, pm_Links.MOVE_HERE_ICON_URL);
									}									
								}
								else {
									node1 = aDocument.createElement('span');
									node1.className = 'popomungo_text_link';
									node1.setAttribute('style', textStyle);
									node1.appendChild(aDocument.createTextNode(moveHereAbbrevText));
								}
					
								anchor1 = pm_CreateAnchor(aDocument, anchorNode.href, node1);
								anchor1.search = '?action=MoveHere&LocaleID='+ idMatch[1];
								anchor1.title = moveHereText;
		
								anchorNode.parentNode.insertBefore(anchor1, anchorNode);
							}

							// View characters
							if (viewCharactersLinkEnabled) {
								var node1;

								if (iconLinksEnabled) {
									/* 
									 * If we have an image inside the link
									 * take it out and put the link on it.
									 */									
									node1 = anchorNode.getElementsByTagName("img")[0];
									
									if (node1) {
										anchorNode.removeChild(node1);
									}
									else {
										node1 = this.getIconNode(aDocument, pm_Links.VIEW_CHARACTERS_ICON_URL);
									}									
								}
								else {
									node1 = aDocument.createElement('span');
									node1.className = 'popomungo_text_link';
									node1.setAttribute('style', textStyle);
									node1.appendChild(aDocument.createTextNode(viewCharactersAbbrevText));
								}
								
								anchor1 = pm_CreateAnchor(aDocument, anchorNode.href, node1);
								anchor1.search = '?action=ViewCharacters&LocaleID='+ idMatch[1];
								anchor1.title = viewCharactersText;
		
								anchorNode.parentNode.insertBefore(anchor1, anchorNode);
							}
						}
					}
				}
				else if (anchorNode.pathname.match(this.characterPageRegExp)) {
					if (charLinksEnabled &&
						anchorNode.search.match(this.characterViewRegExp)) 
					{
						var idMatch = anchorNode.search.match(this.characterIdRegExp);

						if (idMatch) {
							var charId = idMatch[1];
							
							if (charId != ownCharId) {

								// Call
								if (callLinkEnabled) {
									var node1;
						
									if (iconLinksEnabled) {
										node1 = aDocument.createElement('img');
										node1.src = pm_Links.CALL_CHARACTER_ICON_URL;
										node1.className = 'popomungo_icon_link';
									}
									else {
										node1 = aDocument.createElement('span');
										node1.className = 'popomungo_text_link';
										node1.setAttribute('style', textStyle);
										node1.appendChild(aDocument.createTextNode(callCharAbbrevText));
									}
							
									var href1 = anchorNode.href.replace(pm_Links.characterPageRegExp, '/Interact.asp');
									href1 = href1.replace(pm_Links.characterViewRegExp, '$1PhoneInteract&');
									var anchor1 = pm_CreateAnchor(aDocument, href1, node1);
									anchor1.title = callCharText;
						
									anchorNode.parentNode.insertBefore(anchor1, anchorNode);
								}

								// Send Message
								if (messageLinkEnabled) {
									var node1;

									if (iconLinksEnabled) {
										node1 = aDocument.createElement('img');
										node1.src = pm_Links.SEND_MESSAGE_ICON_URL;
										node1.className = 'popomungo_icon_link';
									}
									else {
										node1 = aDocument.createElement('span');
										node1.className = 'popomungo_text_link';
										node1.setAttribute('style', textStyle);
										node1.appendChild(aDocument.createTextNode(sendMsgAbbrevText));
									}
							
									var href1 = anchorNode.href.replace(pm_Links.characterViewRegExp, '$1SendMessage&');
									var anchor1 = pm_CreateAnchor(aDocument, href1, node1);
									anchor1.title = sendMsgText;
						
									anchorNode.parentNode.insertBefore(anchor1, anchorNode);
								}
				
							}
						}
					}
				}
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	},
	

	addPopupLinkMenus: function addPopupLinkMenus(
		aDocument, charLinksEnabled, localeLinksEnabled) 
	{
		try {
			pm_LinkMenu.appendPopupMenu(aDocument);
			//this.appendMenuHandle(aDocument);

			// Loop through all anchor nodes.
			var anchorNodes = aDocument.getElementsByTagName('a');
			pm_Logger.debug('anchorNodes='+ anchorNodes.length);
		
			var ownCharId = pm_UserSettings.getCharacterId(aDocument);

			for (var i=anchorNodes.length - 1; i>=0; i--) {
				var anchorNode = anchorNodes.item(i);
				
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

				if (anchorNode.pathname.match(this.localePageRegExp)) {
					if (localeLinksEnabled)
					{
						var idMatch = anchorNode.search.match(this.localeIdRegExp);
						
						if (idMatch)
						{
							anchorNode.addEventListener('mouseover', pm_LinkMenu.mouseOverLocaleLink, true);
							anchorNode.addEventListener('mouseout', pm_LinkMenu.mouseOutLocaleLink, true);
							anchorNode.addEventListener('click', pm_LinkMenu.hideLinkMenu, true);
						}
					}
				}
				else if (anchorNode.pathname.match(this.characterPageRegExp)) {
					if (charLinksEnabled &&
						anchorNode.search.match(this.characterViewRegExp)) 
					{
						var idMatch = anchorNode.search.match(this.characterIdRegExp);

						if (idMatch) {
							var charId = idMatch[1];
							
							if (charId != ownCharId) {
								anchorNode.addEventListener('mouseover', pm_LinkMenu.mouseOverCharacterLink, true);
								anchorNode.addEventListener('mouseout', pm_LinkMenu.mouseOutCharacterLink, true);
								anchorNode.addEventListener('click', pm_LinkMenu.hideLinkMenu, true);
							}
						}
					}
				}
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}
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
