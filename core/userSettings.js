/*
 * userSettings.js
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

var pm_UserSettings = {
	
	characterIdUrlRegExp: /[&?]CharacterID=([0-9]+)/i,
	
	companyIdUrlRegExp: /[&?]LocaleID=([0-9]+)/i,
	
	locationUrlRegExp: /\/Locale\.asp/i,
	
	charId: undefined,	
	langId: undefined,	
	companyId: undefined,	
	dateFormatTypeId: undefined,
	timeFormatTypeId: undefined,
	
	CHARACTER_ID_XPATH: "//tr[@class='MainMenu']/td[1]/a[2]",

	COMPANY_ID_XPATH: "//tr[@class='MainMenu']/td[1]/a[5]",

	CITY_NAME_ON_CHARACTER_PAGE_XPATH: 
		"/html/body/table[last()]/tbody/tr/td[1]/table[1]/tbody/tr/td[2]/table/tbody/tr[2]/td/a[contains(@href, 'CityID')]/b",

	CHARACTER_NAME_ON_CHARACTER_PAGE_XPATH:
		'/html/body/table[last()]/tbody/tr/td[1]/table[1]/tbody/tr/td[2]/table/tbody/tr[1]/td[1]/b',
		
	CHARACTER_PORTRAIT_ON_CHARACTER_PAGE_XPATH:
		"//div[@id='pic']//img",
		

	_readCharacterId: function _readCharacterId(doc) 
	{
		try {
			var link1 = pm_XPathFirstNode(this.CHARACTER_ID_XPATH, doc);

			if (link1) {
				var matchArray = link1.search.match(this.characterIdUrlRegExp);
					
				if (matchArray) {
					this.charId = parseInt(matchArray[1]);
				} else {
					pm_Logger.debug("No character ID:\npage="+ doc.location +"\nlink="+ link1.href);
				}
			} else {
				pm_Logger.debug("No character ID:\npage="+ doc.location);
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}

		pm_Logger.debug('charId='+ this.charId);

		return this.charId;
	},
	
	
	_readCEOCompanyId: function _readCEOCompanyId(doc) 
	{
		try {
			var link1 = pm_XPathFirstNode(this.COMPANY_ID_XPATH, doc);

			if (link1) {
				var matchArray = link1.search.match(this.companyIdUrlRegExp);
					
				if (matchArray) {
					this.companyId = parseInt(matchArray[1]);
					pm_Logger.debug('companyId='+ this.companyId);
				}
				else if (link1.search.match(this.locationUrlRegExp)) {
					this.companyId = 0;
					pm_Logger.debug('Not CEO');
				}
				else {
					pm_Logger.debug("No company ID:\npage="+ doc.location +"\nlink="+ link1.href);
				}
			} else {
				pm_Logger.debug("No company ID:\npage="+ doc.location);
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}

		return this.companyId;
	},
	
	
	getCharacterId: function getCharacterId(aDocument) {
		return this._readCharacterId(aDocument);
	},
	
	
	getCEOCompanyId: function (aDocument) {
		return this._readCEOCompanyId(aDocument);
	},
	
	
	getLanguageId: function getLanguageId() 
	{
		try {
			if (this.langId) {
				return this.langId;
			}
			
			this.langId = parseInt(pm_Prefs.getCharacterPref(
				this.charId, 
				pm_PrefKeys.LANGUAGE_ID, 
				pm_DefaultPrefs.LANGUAGE_ID));
		}
		catch (err) {
			pm_Logger.logError(err);
		}
		
		return this.langId;
	},
	

	getDateFormatTypeId: function getDateFormatTypeId() 
	{
		try {
			if (this.dateFormatTypeId) {
				return this.dateFormatTypeId;
			}

			this.dateFormatTypeId = parseInt(pm_Prefs.getCharacterPref(
				this.charId, 
				pm_PrefKeys.DATE_FORMAT_TYPE_ID, 
				pm_DefaultPrefs.DATE_FORMAT_TYPE_ID));
		}
		catch (err) {
			pm_Logger.logError(err);
		}
		
		return this.dateFormatTypeId;
	},
	

	updateSettings: function updateSettings(doc, formElements) 
	{
		try {
			if (pm_Prefs.isEnabled(pm_PrefKeys.AUTO_DETECT_LANGUAGE)) {
				this.langId = parseInt(formElements.namedItem("LanguageID").value);
				
				pm_Prefs.setCharacterPref(this.charId, 
					pm_PrefKeys.LANGUAGE_ID, this.langId);
			}
			
			if (pm_Prefs.isEnabled(pm_PrefKeys.AUTO_DETECT_DATE_AND_TIME_FORMAT)) {
				this.dateFormatTypeId = parseInt(formElements.namedItem("DateFormatTypeID").value);
			
				pm_Prefs.setCharacterPref(this.charId, 
					pm_PrefKeys.DATE_FORMAT_TYPE_ID, this.dateFormatTypeId);

				this.timeFormatTypeId = parseInt(formElements.namedItem("TimeFormatTypeID").value);
			
				pm_Prefs.setCharacterPref(this.charId, 
					pm_PrefKeys.TIME_FORMAT_TYPE_ID, this.timeFormatTypeId);					
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	},
	

	updateSettingsOnLoad: function updateSettingsOnLoad(doc) 
	{
		try {
			pm_Logger.debug("Updating configuration data from the user settings");
		
			// capture the onsubmit event on the form
			doc.forms[0].addEventListener('submit', pm_UserSettings, true);
		
			this.updateSettings(doc, doc.forms[0].elements);
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	},
	
	
	handleEvent: function handleEvent(event) {
		try {
			pm_Logger.debug("Updating configuration data from the user settings");
			var doc = event.originalTarget.ownerDocument;
			pm_Logger.debug('doc='+ doc);
			pm_UserSettings.updateSettings(doc, doc.forms[0].elements);
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	},
	

	autoDetectLanguageFromPage:
	function autoDetectLanguageFromPage(doc) {
		try {
			this.getLanguageId();

			if (pm_Prefs.isEnabled(pm_PrefKeys.AUTO_DETECT_LANGUAGE)) {
				
				var detectedLangId = pm_PopoLang.detectLanguage(doc, this.langId);
				
				if (detectedLangId && 
					(this.langId != detectedLangId)) 
				{
					this.langId = detectedLangId;
					
					pm_Prefs.setCharacterPref(
						this.getCharacterId(doc), 
						pm_PrefKeys.LANGUAGE_ID,
						detectedLangId);
				}
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}
		
		return this.langId;
	},
	

	updateSettingsFromCharacterPage:
	function updateSettingsFromCharacterPage(doc) {
		try {
			var charIdMatch = doc.location.search.match(this.characterIdUrlRegExp);				
			
			if (charIdMatch) {
				var pageCharId = parseInt(charIdMatch[1]);
				var charId = this.getCharacterId(doc); 
				
				if (charId != pageCharId) {
					return;
				}
			}
			else {
				// OK, assume that the current page is the
				// character details page of the own character.
				pm_Logger.debug("No character ID on the URL");
			}

			// Parse city name.
			if (pm_Prefs.isEnabled(pm_PrefKeys.AUTO_DETECT_CITY_NAME)) {
				var cityNameNode = pm_XPathFirstNode(
					this.CITY_NAME_ON_CHARACTER_PAGE_XPATH, doc);
	
				if (cityNameNode) {
					pm_Prefs.setCharacterPref(this.charId, 
						pm_PrefKeys.CITY_NAME, 
						cityNameNode.textContent);
				}
			}
			
			// Parse character name.
			var characterNameNode = pm_XPathFirstNode(
				this.CHARACTER_NAME_ON_CHARACTER_PAGE_XPATH, doc);
			
			if (characterNameNode) {
				pm_Prefs.setCharacterPref(this.charId, 
					pm_PrefKeys.CHARACTER_NAME, 
					characterNameNode.textContent);
			}
			
			// Parse character portrait.
			var characterPortraitNode = pm_XPathFirstNode(
				this.CHARACTER_PORTRAIT_ON_CHARACTER_PAGE_XPATH, doc);
				
			if (characterPortraitNode) {
				pm_Prefs.setCharacterPref(this.charId, 
					pm_PrefKeys.CHARACTER_PORTRAIT, 
					characterPortraitNode.src);
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	},
	
	
	updateSettingsFromCityPage: 
	function updateSettingsFromCityPage(doc) 
	{
		try {
			/*
			var cityNameNode = pm_XPathFirstNode(this.CITY_NAME_ON_CITY_PAGE_XPATH, doc);
				
			pm_Prefs.setCharacterPref(this.charId, 
				pm_PrefKeys.CITY_NAME, cityNameNode.textContent);
			*/
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	},
	
	
	LoggedOut:
	function LoggedOut(doc) {
		this.charId = undefined;
		this.langId = undefined;
		this.companyId = undefined;
		this.dateFormatTypeId = undefined;
		this.timeFormatTypeId = undefined;
	},
	
	
	IsOnline:
	function IsOnline() {
		return (this.charId != undefined);
	},
	
	
	GetCharacterIdList: function GetCharacterIdList() {
		var res = new Array();
		
		try {
			var children = pm_Prefs.getChildList(pm_PrefKeys.CHARACTERS_BASE);
			var idList = {};

			var len = 0;
			var tmp = {};
			
			// Gather unique values.
			for (var i = 0; i < children.length; i++) {
				var id = children[i].split(".")[0];
				
				tmp[id] = true;
			}

			var j = 0;
			
			// Collect the results.
			for (var t in tmp) {
				res[j++] = t;
			}
			
			res.sort(function (a, b) { return (parseInt(a) - parseInt(b)); });
		}
		catch (err) {
			pm_Logger.logError(err);
		}
		
		return res;
	},
	
	
	observe: function observe(aSubject, aTopic, aData)
	{
		pm_Logger.debug('topic='+ aTopic +', data='+ aData);
		
		if (aTopic == 'nsPref:changed') {
			var charId = pm_UserSettings.charId;
			
			if (!charId) {
				pm_Logger.debug("Character ID not defined");
				return;	
			}
			
			pm_Logger.debug("Character ID="+ charId);
			
			if (aData == pm_PrefKeys.CITY_NAME.replace("<n>", charId)) {
				pm_Logger.debug("City name updated");
			}
			else if (aData == pm_PrefKeys.CHARACTER_PORTRAIT.replace("<n>", charId)) {
				pm_Logger.debug("Character portrait URL updated");
			}
			else if (aData == pm_PrefKeys.LANGUAGE_ID.replace("<n>", charId)) {
				pm_Logger.debug("Language ID reset");
				pm_UserSettings.langId = pm_Prefs.getPref(aData, pm_DefaultPrefs.LANGUAGE_ID);
			}
			else if (aData == pm_PrefKeys.CHARACTER_NAME.replace("<n>", charId)) {
				pm_Logger.debug("Character name updated");
			}
			else if (aData == pm_PrefKeys.DATE_FORMAT_TYPE_ID.replace("<n>", charId)) {
				pm_Logger.debug("Date format type ID reset");
				pm_UserSettings.dateFormatTypeId = pm_Prefs.getPref(aData, pm_DefaultPrefs.DATE_FORMAT_TYPE_ID);
			}
			else if (aData == pm_PrefKeys.TIME_FORMAT_TYPE_ID.replace("<n>", charId)) {
				pm_Logger.debug("Time format type ID reset");
				pm_UserSettings.timeFormatTypeId = pm_Prefs.getPref(aData, pm_DefaultPrefs.TIME_FORMAT_TYPE_ID);
			}
			else {
				pm_Logger.debug("No match found: "+ aData);
			}
		}
	}
};
