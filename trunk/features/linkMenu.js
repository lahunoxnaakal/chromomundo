/*
 * linkMenu.js
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

var pm_LinkMenu = {
	
	LINK_MENU: 0,
	
	CHARACTER_LINK: 1,
	
	LOCALE_LINK: 2,

	menuId: 'popomungo_menubox',

	linkActive: false,

	menuActive: false,
	
	menuTarget: undefined,	
	
	activationDelay: 50,
	
	deactivationDelay: 1000,
	
	appendPopupMenu: function appendPopupMenu(aDocument) {
		var container = aDocument.createElement('div');
		container.id = pm_LinkMenu.menuId;
		container.className = 'popomungo_menubox';
		container.setAttribute('style', 'display: none;');
		container.appendChild(aDocument.createTextNode('\u00a0Popomungo\u00a0'));

		container.addEventListener('mouseover', pm_LinkMenu.mouseOverLinkMenu, true);
		container.addEventListener('mouseout', pm_LinkMenu.mouseOutLinkMenu, true);		
		
		aDocument.body.appendChild(container);
	},
	
	
	checkMenu: function checkMenu(aEventID, aIsOver, aTarget, aClientX, aClientY) {
		try {
			var doc = aTarget.ownerDocument;
			var menu = doc.getElementById(pm_LinkMenu.menuId);
			
			/*
			pm_Logger.debug('\neventID='+ aEventID +
				', isOver='+ aIsOver +
				'\ntarget='+ aTarget +
				'\nclientX='+ aClientX +
				', clientY='+ aClientY +
				', display='+ menu.style.display);
			*/
			
			if (aIsOver) {
				if (aEventID == pm_LinkMenu.LINK_MENU) {
					//pm_Logger.debug('menuActive='+ pm_LinkMenu.menuActive +', linkActive='+ pm_LinkMenu.linkActive);
				} else {
					//pm_Logger.debug('menuActive='+ pm_LinkMenu.menuActive +', linkActive='+ pm_LinkMenu.linkActive);

					// Change the menu content, if needed.
					if (aTarget != pm_LinkMenu.menuTarget)
					{
						pm_LinkMenu.menuTarget = aTarget;
						
						// FIXME Is there any other (simple) way to remove the child objects?
						menu.innerHTML = '';
						var content;

						switch (aEventID) {
							case pm_LinkMenu.CHARACTER_LINK:
								content = pm_LinkMenu.getCharacterLinkMenuContent(aTarget);
								break;
							case pm_LinkMenu.LOCALE_LINK:
								content = pm_LinkMenu.getLocaleLinkMenuContent(aTarget);
								break;
							default:
								pm_Logger.logError('Invalid eventID: '+ aEventID);
								menu.style.display = 'none';
								return false;
						}

						if (content) {
							menu.appendChild(content);
						} else {
							// No content, hide menu.
							menu.style.display = 'none';
							return true;
						}
					}

					// Set menu position.
					menu.style.left = (aClientX + 6) +'px';
					menu.style.bottom = (doc.body.clientHeight - aClientY - 
						doc.body.scrollTop + 4) +'px';

					// Show the menu, if it is hidden.						
					if (menu.style.display == 'none') {
						menu.style.display = 'block';
					}
				}
			} else {
				//pm_Logger.debug('menuActive='+ pm_LinkMenu.menuActive +', linkActive='+ pm_LinkMenu.linkActive);
				
				if (!pm_LinkMenu.menuActive && 
					!pm_LinkMenu.linkActive)
				{
					menu.style.display = 'none';

					//pm_Logger.debug('Menu hidden');
				}
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}
		
		return true;
	},
	
	
	hideLinkMenu: function hideLinkMenu(aEvent) {
		//pm_Logger.debug('Hide menu');

		var doc = aEvent.currentTarget.ownerDocument;
		var menu = doc.getElementById(pm_LinkMenu.menuId);
		menu.style.display = 'none';
		
		return true;
	},
	
	
	getLocaleLinkMenuContent: function getLocaleLinkMenuContent(node) {
		var table1;
		
		try {
			var moveHereLinkEnabled = pm_Prefs.isEnabled(pm_PrefKeys.LINKS_LOCALE_POPUP_GOTO_LINK_ENABLED);
			var viewCharactersLinkEnabled = pm_Prefs.isEnabled(pm_PrefKeys.LINKS_LOCALE_POPUP_VIEW_CHARACTERS_ENABLED);
			
			if (moveHereLinkEnabled || viewCharactersLinkEnabled) {
				var doc = node.ownerDocument;
			
				var td1 = doc.createElement('th');
				td1.appendChild(doc.createTextNode(node.textContent));
				
				var tr1 = doc.createElement('tr');
				tr1.appendChild(td1);
				
				table1 = doc.createElement('table');
				table1.appendChild(tr1);

				var idMatch = node.href.match(pm_Links.localeIdRegExp);
				
				// Move Here
				if (moveHereLinkEnabled) {
					var img1 = doc.createElement('img');
					img1.src = pm_Links.MOVE_HERE_ICON_URL;
		
					var text1 = doc.createTextNode(' '+ 
						pm_Strings.getString(
							pm_StringKeys.LINKS_LOCALES_MOVE_HERE,
							null));
			
					var anchor1 = pm_CreateAnchor(doc, node.href, [img1, text1]);
					anchor1.search = '?action=MoveHere&LocaleID='+ idMatch[1];
						
					var tr2 = pm_CreateTableRow(doc, anchor1);
		
					table1.appendChild(tr2);
				}
								
				// View Characters
				if (viewCharactersLinkEnabled) {
					var img2 = doc.createElement('img');
					img2.src = pm_Links.VIEW_CHARACTERS_ICON_URL;
		
					var text2 = doc.createTextNode(' '+ 
						pm_Strings.getString(
							pm_StringKeys.LINKS_LOCALES_VIEW_CHARACTERS,
							null));
			
					var anchor2 = pm_CreateAnchor(doc, node.href, [img2, text2]);
					anchor2.search = '?action=ViewCharacters&LocaleID='+ idMatch[1];
						
					var tr3 = pm_CreateTableRow(doc, anchor2);
		
					table1.appendChild(tr3);
				}
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}
		
		return table1;
	},
	
	
	getCharacterLinkMenuContent: function getCharacterLinkMenuContent(node) {
		var table1;
		
		try {
			var callLinkEnabled = pm_Prefs.isEnabled(pm_PrefKeys.LINKS_CHARACTER_POPUP_CALL_LINK_ENABLED);
			var messageLinkEnabled = pm_Prefs.isEnabled(pm_PrefKeys.LINKS_CHARACTER_POPUP_MESSAGE_LINK_ENABLED);
			
			if (callLinkEnabled || 
				messageLinkEnabled) 
			{
				var doc = node.ownerDocument;

				var td1 = doc.createElement('th');
				td1.appendChild(doc.createTextNode(node.textContent));
				
				var tr1 = doc.createElement('tr');
				tr1.appendChild(td1);

				var table1 = doc.createElement('table');
				table1.appendChild(tr1);
				
				// Send Message
				if (messageLinkEnabled) {
					var img2 = doc.createElement('img');
					img2.src = pm_Links.SEND_MESSAGE_ICON_URL;
		
					var href2 = node.href.replace(pm_Links.characterViewRegExp, '$1SendMessage&');
					
					var text2 = doc.createTextNode(' '+ 
						pm_Strings.getString(
							pm_StringKeys.LINKS_CHARACTERS_SEND_MESSAGE,
							null));
			
					var anchor2 = pm_CreateAnchor(doc, href2, [img2, text2]);
		
					var tr2 = pm_CreateTableRow(doc, anchor2);

					table1.appendChild(tr2);
				}

				// Call
				if (callLinkEnabled) {
					var img1 = doc.createElement('img');
					img1.src = pm_Links.CALL_CHARACTER_ICON_URL;
		
					var href1 = node.href.replace(pm_Links.characterPageRegExp, '/Interact.asp');
					href1 = href1.replace(pm_Links.characterViewRegExp, '$1PhoneInteract&');
		
					var text1 = doc.createTextNode(' '+ 
						pm_Strings.getString(
							pm_StringKeys.LINKS_CHARACTERS_CALL,
							null));
		
					var anchor1 = pm_CreateAnchor(doc, href1, [img1, text1]);
			
					var tr3 = pm_CreateTableRow(doc, anchor1);

					table1.appendChild(tr3);
				}
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}
		
		return table1;
	},
	
	
	mouseOverLinkMenu: function mouseOverLinkMenu(aEvent) {
		pm_LinkMenu.menuActive = true;

		//pm_Logger.debug('target: '+ aEvent.target);

		window.setTimeout(pm_LinkMenu.checkMenu, pm_LinkMenu.activationDelay, 
			pm_LinkMenu.LINK_MENU, true, aEvent.currentTarget, aEvent.clientX, aEvent.clientY);
			
		return true;
	},
	
	
	mouseOutLinkMenu: function mouseOutLinkMenu(aEvent) {
		pm_LinkMenu.menuActive = false;

		//pm_Logger.debug('target: '+ aEvent.target);

		window.setTimeout(pm_LinkMenu.checkMenu, pm_LinkMenu.deactivationDelay, 
			pm_LinkMenu.LINK_MENU, false, aEvent.currentTarget, 0, 0);
				
		return true;
	},
	
	
	mouseOverCharacterLink: function mouseOverCharacterLink(aEvent) {
		pm_LinkMenu.linkActive = true;

		//pm_Logger.debug('target: '+ aEvent.target);

		window.setTimeout(pm_LinkMenu.checkMenu, pm_LinkMenu.activationDelay, 
			pm_LinkMenu.CHARACTER_LINK, true, aEvent.currentTarget, aEvent.clientX, aEvent.clientY);

		return true;
	},
	
	
	mouseOutCharacterLink: function mouseOutCharacterLink(aEvent) {
		pm_LinkMenu.linkActive = false;

		//pm_Logger.debug('target: '+ aEvent.target);

		window.setTimeout(pm_LinkMenu.checkMenu, pm_LinkMenu.deactivationDelay, 
			pm_LinkMenu.CHARACTER_LINK, false, aEvent.currentTarget, 0, 0);

		return true;
	},
	
	
	mouseOverLocaleLink: function mouseOverLocaleLink(aEvent) {
		pm_LinkMenu.linkActive = true;

		//pm_Logger.debug('target: '+ aEvent.target);

		window.setTimeout(pm_LinkMenu.checkMenu, pm_LinkMenu.activationDelay, 
			pm_LinkMenu.LOCALE_LINK, true, aEvent.currentTarget, aEvent.clientX, aEvent.clientY);

		return true;
	},
	
	
	mouseOutLocaleLink: function mouseOutLocaleLink(aEvent) {
		pm_LinkMenu.linkActive = false;

		//pm_Logger.debug('target: '+ aEvent.target);

		window.setTimeout(pm_LinkMenu.checkMenu, pm_LinkMenu.deactivationDelay,
			pm_LinkMenu.LOCALE_LINK, false, aEvent.currentTarget, 0, 0);

		return true;
	}
};
