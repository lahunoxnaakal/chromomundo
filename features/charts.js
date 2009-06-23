/*
 * charts.js
 * Copyright © 2007, 2008 Tommi Rautava
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

var pm_Charts = {

	LOCALES_STRINGS_PROPS_FILE: "locales.properties",
	CITIES_STRINGS_PROPS_FILE: "cities.properties",
	
	localeTypeIdToTypeName: {},
	localeTypeNameToTypeId: {},
	
	cityIdToName: {},
	cityNameToId: {},
	
	localesLangId: undefined,
	citiesLangId: undefined,


	PrepareLocales:
	function PrepareLocales(doc) {
		try {
			var langId = pm_UserSettings.getLanguageId(); 
			
			if (this.localesLangId == langId) {
				return true;
			}

			this.localesLangId = langId;
			this.localeTypeIdToTypeName = {};
			this.localeTypeNameToTypeId = {};
			
			var bundle = pm_Strings.getBundleByLanguage(langId, this.LOCALES_STRINGS_PROPS_FILE);
			
			if (bundle) {
				var iter = bundle.getSimpleEnumeration();
				
				// Create a table for reverse mapping
				while (iter.hasMoreElements()) {
					var prop = iter.getNext().QueryInterface(Components.interfaces.nsIPropertyElement);
					
					// key = locale.<n>
					var typeId = parseInt(prop.key.substring(7));
					var typeName = prop.value;
					
					this.localeTypeIdToTypeName[typeId] = typeName; 
					this.localeTypeNameToTypeId[typeName] = typeId;
					
					pm_Logger.debug(typeId +"="+ typeName);
				}
				
				return true;
			}
			else {
				pm_Logger.logError("String bundle not available");
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}
		
		return false;
	},

	
	PrepareCities:
	function PrepareCities() {
		try {
			var langId = pm_UserSettings.getLanguageId(); 
			
			if (this.citiesLangId == langId) {
				return true;
			}

			this.citiesLangId = langId;
			this.cityIdToName = {};
			this.cityNameToId = {};
			
			var bundle = pm_Strings.getBundleByLanguage(langId, this.CITIES_STRINGS_PROPS_FILE);
			
			if (bundle) {
				var iter = bundle.getSimpleEnumeration();
				
				// Create a table for reverse mapping
				while (iter.hasMoreElements()) {
					var prop = iter.getNext().QueryInterface(Components.interfaces.nsIPropertyElement);
					
					// key = city.<n>
					var cityId = parseInt(prop.key.substring(5));
					var cityName = prop.value;
					
					this.cityIdToName[cityId] = cityName; 
					this.cityNameToId[cityName] = cityId;
					
					pm_Logger.debug(cityId +"="+ cityName);
				}
				
				return true;
			}
			else {
				pm_Logger.logError("String bundle not available");
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}
		
		return false;
	},

	
	GetLocaleTypeNameByLocaleTypeId:
	function GetLocaleTypeNameByLocaleTypeId(localeTypeId) {
		var localeTypeName = this.localeTypeIdToTypeName[localeTypeId];
		
		if (localeTypeName == undefined) {
			this.localeTypeIdToTypeName[localeTypeId] = "";
			localeTypeName = "";
		}
		
		pm_Logger.debug(localeTypeId +"="+ localeTypeName);
		
		return localeTypeName;
	},
	
	
	GetLocaleTypeIdByLocaleTypeName:
	function GetLocaleTypeIdByLocaleTypeName(localeTypeName) {
		var localeTypeId = this.localeTypeNameToTypeId[localeTypeName];
		
		if (localeTypeId == undefined) {
			this.localeTypeNameToTypeId[localeTypeName] = 0;
			return undefined;		
		}
		
		return localeTypeId;
	},
	
	
	GetCityNameById:
	function GetCityNameById(cityId) {
		return this.cityIdToName[cityId];
	},
	
	
	GetCityIdByName:
	function GetCityIdByName(cityName) {
		return this.cityNameToId[cityName];
	}
};
