/**
 * linkMenu.js
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

function pm_LinkMenuClass() {
	// void
}

pm_LinkMenuClass.prototype = {
	
	LINK_MENU: 0,
	
	CHARACTER_LINK: 1,
	
	LOCALE_LINK: 2,

	MENU_ID: 'popomungo_menubox',

	linkActive: false,

	menuActive: false,
	
	menuTarget: undefined,	
	
	activationDelay: 50,
	
	deactivationDelay: 1000,
	
	currentCharacterId: 0,

	moveHereLinkEnabled: false,
	viewCharactersLinkEnabled: false,
	callLinkEnabled: false,
	messageLinkEnabled: false,

	viewCharacters: '',
	moveHere: '',
	sendMessage: '',
	call: '',

	
	handleEvent: function handleEvent(e) {
		try {
			// First, check for a menu event.           
			if (e.currentTarget.id == this.MENU_ID)
			{
				if (e.type == "mouseover") 
                    return this.mouseOverLinkMenu(e);
                    
				this.mouseOutLinkMenu(e);
				e.stopPropagation();
				//e.preventDefault();
				return true;
			}

			var target = e.target;
			
			if (!(target instanceof HTMLAnchorElement)) {
				target = target.parentNode;
				
				if (!(target instanceof HTMLAnchorElement)) {
					return true;
				}
			}					

			switch (e.type) {
			case "mouseover":
			case "mouseout":
				var pathname = target.pathname.toLowerCase();
				var search = target.search.toLowerCase();
				
				if (pathname.indexOf('/locale.asp') > -1) {
					if (search.indexOf('action=view&') > -1) {
						return this.mouseEventOnLocaleLink(e, target);
					}
					else {
						return true;
					}
				}
				else if (pathname.indexOf('/characterdetails.asp') > -1) {
					if (search.indexOf('action=view&') > -1) {
						return this.mouseEventOnCharacterLink(e, target);
					}
					else {
						return true;
					}
				}

				// Ignore others
				return true;

			case "click":
				return this.hideLinkMenu(e);

			default:
				pm_Logger.logError("Unexpected event: "+ e.type);
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}
		
		return true;
	},
	

	_getPrefs: function _getPrefs() {
		this.moveHereLinkEnabled = pm_Prefs.isEnabled(pm_PrefKeys.LINKS_LOCALE_POPUP_GOTO_LINK_ENABLED);
		this.viewCharactersLinkEnabled = pm_Prefs.isEnabled(pm_PrefKeys.LINKS_LOCALE_POPUP_VIEW_CHARACTERS_ENABLED);
		this.callLinkEnabled = pm_Prefs.isEnabled(pm_PrefKeys.LINKS_CHARACTER_POPUP_CALL_LINK_ENABLED);
		this.messageLinkEnabled = pm_Prefs.isEnabled(pm_PrefKeys.LINKS_CHARACTER_POPUP_MESSAGE_LINK_ENABLED);
	},
	

	_getStrings: function _getStrings() {
		this.viewCharacters = pm_Strings.getString(pm_StringKeys.LINKS_LOCALES_VIEW_CHARACTERS, null);
		this.moveHere = pm_Strings.getString(pm_StringKeys.LINKS_LOCALES_MOVE_HERE,	null);
		this.sendMessage = pm_Strings.getString(pm_StringKeys.LINKS_CHARACTERS_SEND_MESSAGE, null);
		this.call = pm_Strings.getString(pm_StringKeys.LINKS_CHARACTERS_CALL, null);
	},
	
	
	appendPopupMenu: function appendPopupMenu(aDocument) {
		this._getPrefs();
		this._getStrings();
		
		this.currentCharacterId = pm_UserSettings.getCharacterId(aDocument);

		var container = aDocument.createElement('div');
		container.id = this.MENU_ID;
		container.className = 'popomungo_menubox';
		container.setAttribute('style', 'display: none;');
		container.appendChild(aDocument.createTextNode('\u00a0Popomungo\u00a0'));

		//pm_Logger.debug('Add mouse event handler');
		container.addEventListener('mouseover', this, true);
		container.addEventListener('mouseout', this, true);
		//container.addEventListener('blur', this.hideLinkMenu, true);
		
		aDocument.body.appendChild(container);
	},
	
	
	checkMenu: function checkMenu(p, aEventID, aIsOver, aTarget, aClientX, aClientY) {
		try {
			var doc = aTarget.ownerDocument;
			var menu = doc.getElementById(p.MENU_ID);			
			
            /*
			pm_Logger.debug('p='+ p +
				'\neventID='+ aEventID +
				', isOver='+ aIsOver +
				'\ntarget='+ aTarget +
				'\nclientX='+ aClientX +
				', clientY='+ aClientY);
			pm_Logger.debug(
				'display='+ menu.style.display);
			*/
			
			if (aIsOver) {
				if (aEventID == p.LINK_MENU) {
					//pm_Logger.debug("Event: LINK_MENU. " + 'menuActive='+ p.menuActive +', linkActive='+ p.linkActive);
				} else {
					//pm_Logger.debug("Event: " + aEventID + 'menuActive='+ p.menuActive +', linkActive='+ p.linkActive);
                    
					// Change the menu content, if needed.
					if (p.menuActive == false)
					{                    
						p.menuTarget = aTarget;
                        
						menu.innerHTML = ''; // Remove all child objects.
						var content;

						switch (aEventID) {
							case p.CHARACTER_LINK:
								content = p.getCharacterLinkMenuContent(aTarget);
								break;
							case p.LOCALE_LINK:
								content = p.getLocaleLinkMenuContent(aTarget);
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
							p.menuTarget = null;
							p.menuActive = false;
							return true;
						}
                        
                        // Set menu position.                         
                        menu.style.left = (aClientX + 6) +'px';
                        menu.style.bottom = (doc.body.clientHeight - aClientY - 
                            doc.body.scrollTop + 4) +'px'; 

                        //pm_Logger.debug("Menu Set Position. Left: "  + menu.style.left + " Bottom: " + menu.style.bottom);                    
                     
					}            
                    
					// Show the menu, if it is hidden.						
					if (menu.style.display == 'none') {
						menu.style.display = 'block';                                              
					}
				}
			} else {
				//pm_Logger.debug('menuActive='+ p.menuActive +', linkActive='+ p.linkActive);
				
				if (!p.menuActive && 
					!p.linkActive)
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
		var menu = doc.getElementById(this.MENU_ID);
		menu.style.display = 'none';
		
		return true;
	},
	
	
	getLocaleLinkMenuContent: function getLocaleLinkMenuContent(node) {
		try {
			if (this.moveHereLinkEnabled || this.viewCharactersLinkEnabled) {
				var idMatch = node.href.match(pm_Links.localeIdRegExp);
				if (!idMatch) return null;
				var charId = idMatch[1];                
				
				var doc = node.ownerDocument;
			
				var td1 = doc.createElement('th');
				td1.appendChild(doc.createTextNode(node.textContent));
				
				var tr1 = doc.createElement('tr');
				tr1.appendChild(td1);
				
				var table1 = doc.createElement('table');
				table1.appendChild(tr1);

				// Move Here
				if (this.moveHereLinkEnabled) {
					var img1 = doc.createElement('img');
					img1.src = pm_Links.MOVE_HERE_ICON_URL;
		
					var text1 = doc.createTextNode(' '+ this.moveHere);
			
                    var href = node.href.replace('?action=view', '?action=MoveHere');
					var anchor1 = doc.createElement('a');
					anchor1.href = href;                    
					//anchor1.search = '?action=MoveHere&LocaleID='+ charId;
					anchor1.appendChild(img1);
					anchor1.appendChild(text1);
                    					
					var td2 = doc.createElement('td');
					td2.appendChild(anchor1);

					var tr2 = doc.createElement('tr');
					tr2.appendChild(td2);
		
					table1.appendChild(tr2);
				}
								
				// View Characters
				if (this.viewCharactersLinkEnabled) {
					var img2 = doc.createElement('img');
					img2.src = pm_Links.VIEW_CHARACTERS_ICON_URL;
		
					var text2 = doc.createTextNode(' '+	this.viewCharacters);
                    var href = node.href.replace('?action=view', '?action=ViewCharacters');
					var anchor2 = doc.createElement('a');
					anchor2.href = href;
					//anchor2.search = '?action=ViewCharacters&LocaleID='+ charId;
					anchor2.appendChild(img2);
					anchor2.appendChild(text2);
                    
					var td3 = doc.createElement('td');
					td3.appendChild(anchor2);

					var tr3 = doc.createElement('tr');
					tr3.appendChild(td3);
		
					table1.appendChild(tr3);
				}

				return table1;
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}
		
		return null;
	},
	
	
	getCharacterLinkMenuContent: function getCharacterLinkMenuContent(node) {
		try {
			if (this.callLinkEnabled || 
				this.messageLinkEnabled) 
			{
				var idMatch = node.href.match(pm_Links.characterIdRegExp);
				if (!idMatch) return null;
				var charId = idMatch[1];

				if (charId == this.currentCharacterId) return null;

				var doc = node.ownerDocument;

				var td1 = doc.createElement('th');
				td1.appendChild(doc.createTextNode(node.textContent));
				
				var tr1 = doc.createElement('tr');
				tr1.appendChild(td1);

				var table1 = doc.createElement('table');
				table1.appendChild(tr1);
				
				// Send Message
				if (this.messageLinkEnabled) {
					var img2 = doc.createElement('img');
					img2.src = pm_Links.SEND_MESSAGE_ICON_URL;
		
					var text2 = doc.createTextNode(' '+ this.sendMessage);
                    var href = node.href.replace('?action=view', '?action=SendMessage');
					var anchor2 = doc.createElement('a');
					anchor2.href = href;                    
					//anchor2.search = '?action=SendMessage&CharacterID='+ charId;
					anchor2.appendChild(img2);
					anchor2.appendChild(text2);
                    		
					var td2 = doc.createElement('td');
					td2.appendChild(anchor2);

					var tr2 = doc.createElement('tr');
					tr2.appendChild(td2);

					table1.appendChild(tr2);
				}

				// Call
				if (this.callLinkEnabled) {
					var img1 = doc.createElement('img');
					img1.src = pm_Links.CALL_CHARACTER_ICON_URL;
		
					var text1 = doc.createTextNode(' '+ this.call);
                    
                    var href = node.href.replace('CharacterDetails.asp','Interact.asp');
                    href = href.replace('?action=view', '?action=PhoneInteract');
					var anchor1 = doc.createElement('a');                   
					anchor1.href = href;
					//anchor1.pathname = '/Common/Interact.asp';
					//anchor1.search = '?action=PhoneInteract&CharacterID='+ charId;
					anchor1.appendChild(img1);
					anchor1.appendChild(text1);
			
                    pm_Logger.debug("Created anchor. href= " + anchor1.href + " action= " + anchor1.search + " pathname= " + anchor1.pathname); 
            
					var td3 = doc.createElement('td');
					td3.appendChild(anchor1);

					var tr3 = doc.createElement('tr');
					tr3.appendChild(td3);

					table1.appendChild(tr3);
				}
				
				return table1;
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}
		
		return null;
	},
	
	
	mouseOverLinkMenu: function mouseOverLinkMenu(aEvent) {
		this.menuActive = true;

		window.setTimeout(this.checkMenu, this.activationDelay, 
			this, this.LINK_MENU, true, aEvent.currentTarget, aEvent.clientX, aEvent.clientY);
			
		return true;
	},
	
	
	mouseOutLinkMenu: function mouseOutLinkMenu(aEvent) {
		this.menuActive = false;

		window.setTimeout(this.checkMenu, this.deactivationDelay, 
			this, this.LINK_MENU, false, aEvent.currentTarget, 0, 0);
				
		return true;
	},
	
	
	mouseEventOnCharacterLink: function mouseEventOnCharacterLink(aEvent, aTarget) {
		var isOver = ("mouseover" == aEvent.type);
		this.linkActive = isOver;
       
		if (isOver) {
			window.setTimeout(this.checkMenu, this.activationDelay, 
				this, this.CHARACTER_LINK, true, aTarget, aEvent.clientX, aEvent.clientY);
		}
		else {
			window.setTimeout(this.checkMenu, this.deactivationDelay, 
				this, this.CHARACTER_LINK, false, aTarget, 0, 0);
		}
               		
		return true;
	},
	
	
	mouseEventOnLocaleLink: function mouseEventOnLocaleLink(aEvent, aTarget) {
		var isOver = ("mouseover" == aEvent.type);
		this.linkActive = isOver;
        
		if (isOver) {
			window.setTimeout(this.checkMenu, this.activationDelay, 
					this, this.LOCALE_LINK, true, aTarget, aEvent.clientX, aEvent.clientY);
		}
		else {
			window.setTimeout(this.checkMenu, this.deactivationDelay,
					this, this.LOCALE_LINK, false, aTarget, 0, 0);
		}

		return true;
	}
	
};

var pm_LinkMenu = new pm_LinkMenuClass();

// EOF