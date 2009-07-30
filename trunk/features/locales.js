/**
 * locales.js
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

/**
 *  1 Club
 *  2 Airport
 *  3 Park
 *  5 Hospital
 *  6 Record Studio
 *  8 Jam place
 * 10 City Hall
 * 11 Gym
 * 20 Generic Shop
 * 22 Grave Yard
 * 23 Prison
 * 25 School
 * 26 Bank
 * 27 Construction Company
 * 29 Factory
 * 30 Artist Agency
 * 31 Law firm
 * 32 Hotel
 * 34 Pet Shop
 * 36 Security firm
 * 37 Police Station
 * 38 Bus Terminal
 * 39 Car Dealer
 * 41 Stage Equipment Shop
 * 42 Travel Route
 * 45 Music Instrument Shop
 * 46 Second Hand Store
 * 47 Plastic Surgery Center
 * 49 Countryside
 * 50 Restaurant
 * 52 Tattoo Parlor
 * 53 TV Station
 * 58 Water Reservoire
 * 59 Day nursery
 * 60 Temple
 * 63 Fire Station
 * 65 Court House
 * 66 Head Office
 */
var pm_Locales = {

	LOCALE_MENUS_XPATH: '/html/body/table[last()]/tbody/tr/td[1]/table/tbody',
	
	LOCALE_TYPE_AND_QUALITY_REGEXP: /^(.*?): (.*)/i,
	
	MENU_NAME_REGEXP: /meny\(['"](.*)['"]\)/,
	
	localeTypeIdToImage: new Array(),
	
	LOCALE_ICON_ADDED_ATTRIBUTE: '_popomungoLocaleIconAdded',


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
				if (target.hasAttribute("onclick") &&
					!target.hasAttribute(this.LOCALE_ICON_ADDED_ATTRIBUTE))
				{
					target.setAttribute(this.LOCALE_ICON_ADDED_ATTRIBUTE, true);
					return this.addLocaleIconsOnMenuClickEvent(target);
				}
				else {
					return true;
				}

			default:
				pm_Logger.logError("Unexpected event: "+ e.type);
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}
		
		return true;
	},
	

	addLocaleIcons: function addLocaleIcons(aDocument) {
		try {
			if (!pm_Prefs.isEnabled(pm_PrefKeys.LOCALES_IMAGES_ENABLED)) {
                pm_Logger.debug("Locale Icons are DISABLED. " + pm_PrefKeys.LOCALES_IMAGES_ENABLED);
				return;
			}
			
			if (!pm_Charts.PrepareLocales()) {
                pm_Logger.debug("PrepareLocales FAILED.");
				return;				
			}

			pm_Logger.debug("install click event handler");
			var node = pm_XPathFirstNode(this.LOCALE_MENUS_XPATH, aDocument);
			node.addEventListener("click", this, true);
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	},
	

	addLocaleIconsOnMenuClickEvent: function addLocaleIconsOnMenuClickEvent(aTarget)
	{
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
					pm_Logger.debug("Adding locale icons to menu="+ menuName);
					
					var anchorNodes = aDocument.getAnchorNodesOnMenu(menuName, menuNode);
					var ignoreMissing = {};
					
					for (var j = anchorNodes.length - 1; j > -1; j--) {
						var anchorNode = anchorNodes[j];
						
						if (!anchorNode.hasAttribute('onclick')) {						
							var localeInfo = pm_Locales.parseLocaleInfoFromLink(anchorNode);
			
							if (localeInfo) {
								if (localeInfo.localeTypeId) {
									var imgUrl = pm_Locales.getLocaleIcon(localeInfo.localeTypeId);
									
									if (imgUrl) {
										var img1 = aDocument.createElement('img');
										img1.src = imgUrl;
										img1.className = 'popomungo_locale_icon';
										
										anchorNode.insertBefore(img1, anchorNode.firstChild);
									}
								}
								else {
									// Log an error, if the type ID is not available. 
									if (!ignoreMissing[localeInfo.localeType]) {
										ignoreMissing[localeInfo.localeType] = true;
										
										pm_Logger.logError(
											"menu("+ menuName +").link("+ j +
											"): n="+ localeInfo.localeType +
											": q="+ localeInfo.localeQuality +
											", a="+ anchorNode);
									}
								}
							}
						}
						else {
							anchorNode.setAttribute(this.LOCALE_ICON_ADDED_ATTRIBUTE, true);
						}
					}
				}
				
				pm_Logger.debug("completed: "+ timer1.elapsedTimeStr());
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}
		
		return true;
	},
	

	parseLocaleInfoFromLink: function parseLocaleInfoFromLink(anchorNode) {
		try {
			if (anchorNode.title) {
				var res = anchorNode.title.match(this.LOCALE_TYPE_AND_QUALITY_REGEXP);
				
				if (res) {
					var data = {
						localeType: res[1],
						localeQuality: res[2]
					};
					
					data.localeTypeId = pm_Charts.GetLocaleTypeIdByLocaleTypeName(data.localeType);

					return data;
				}				
			}			
		}
		catch (err) {
			pm_Logger.debug(err);
		}
		
		return null;
	},
	

	getLocaleIcon: function getLocaleIcon(localeTypeId) {
		try {
			var imgUrl = this.localeTypeIdToImage[localeTypeId];
			
			if (imgUrl == undefined) {
				var pref = pm_PrefKeys.GetLocaleIconUrlPrefKey(localeTypeId);
				
				imgUrl = pm_Prefs.getPref(pref, "");
				
				this.localeTypeIdToImage[localeTypeId] = imgUrl;
			}

			return imgUrl;
		}
		catch (err) {
			pm_Logger.logError(err);
		}
		
		return "";
	}
};
