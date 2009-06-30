/*
 * locales.js
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

	LOCALE_MENUS_XPATH: '/html/body/table[last()]/tbody/tr/td[1]/table/tbody/tr/td/div',
	
	LOCALE_TYPE_AND_QUALITY_REGEXP: /^(.*?): (.*)/i,
	
	localeTypeIdToImage: new Array(),
	
	LOCALE_ICON_ADDED_CLASS_NAME: 'popomungo_localeIconAdded',


	addLocaleIcons:
	function addLocaleIcons(doc) {
		try {
			if (!pm_Prefs.isEnabled(pm_PrefKeys.LOCALES_IMAGES_ENABLED)) {
				return;
			}
			
			if (!pm_Charts.PrepareLocales()) {
				return;				
			}

			menuNodes = pm_XPathOrderedSnapshot(this.LOCALE_MENUS_XPATH, doc); 
				
			pm_Logger.debug('menu nodes='+ menuNodes.snapshotLength);

			var dataOutOfDate = false;
			var ignoreMissing = {};
				
			for (var i = menuNodes.snapshotLength - 1; i >= 0; i--) {
				var menuNode = menuNodes.snapshotItem(i);
				
				var anchorNodes = menuNode.getElementsByTagName('a');

				for (var j = anchorNodes.length - 1; j >= 0; j--) {
					var anchorNode = anchorNodes.item(j);
					
					var localeInfo = this.parseLocaleInfoFromLink(anchorNode);

					if (localeInfo) {
						if (localeInfo.localeTypeId) {								
							var imgUrl = this.getLocaleIcon(localeInfo.localeTypeId);
							
							if (imgUrl) {
								var img1 = doc.createElement('img');
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
									"menu"+ i +".link"+ j +
									": n="+ localeInfo.localeType +
									": q="+ localeInfo.localeQuality +
									", a="+ anchorNode);
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
				
				imgUrl = pm_Prefs.getSetting(pref, "");
				
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
