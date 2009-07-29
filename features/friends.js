/**
 * friends.js
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

var pm_Friends = {
	
	highlightCityOnBuddyList: function highlightCityOnBuddyList(doc) {
		// A[ city name ]
		this.highlightCity(doc, "//a[.='%city%']");
	},
	
	
	highlightCityOnRelationsPage: function highlightCityOnRelationsPage(doc) {
		// TD[ A tag + BR tag + space + city name ( + space + relationship ) + space ]
		this.highlightCity(doc, "//td/child::text()[contains(.,'%city%')]/..");
	},
	
	
	highlightCityOnPhoneBook: function highlightCityOnPhoneBook(doc) {
		// TD[ city name ]
		// TD[ A [ city name ] ]
		this.highlightCity(doc, "//td[2][normalize-space()='%city%']");
	},
	
	
	highlightCityOnTribeMembersList: function highlightCityOnTribeMembersList(doc) {
		// TD[ B [ space + city name + nbsp + space ] ]
		this.highlightCity(doc, "//td[2][contains(., '%city%')]");
	},
	
	
	highlightCityOnPaparazziList: function highlightCityOnPaparazziList(doc) {
		// TD[ city name + space ]
		this.highlightCity(doc, "//td[normalize-space()='%city%']");
	},
	
	
	highlightCity: function highlightCity(doc, xpath1) {
		if (!pm_Prefs.isEnabled("extensions.popomungo.options.highlighting.peopleAtSameTown.enabled")) {
			return;
		}		
		
		var cityName = pm_Prefs.getCharacterPref(
			pm_UserSettings.charId,
			"extensions.popomungo.characters.<n>.cityName",
			"");
	
		pm_Logger.debug("current city="+ cityName);
		
		if (cityName) {
			xpath1 = xpath1.replace('%city%', cityName);
		
			var nodes = pm_XPathOrderedSnapshot(xpath1, doc); 

			pm_Logger.debug(nodes.snapshotLength +" nodes");
			//var cityRegExp = new RegExp(cityName, '');
				
			for (var i = nodes.snapshotLength - 1; i > -1; i--) {
				var node = nodes.snapshotItem(i);

				if (node.innerHTML) {
					pm_Logger.debug(i +"='"+ node.innerHTML +"'");
					
					node.className = 'popomungo_highlight';
				}
			}
		}
	}
};
