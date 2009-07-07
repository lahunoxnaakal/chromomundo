/*
 * prefs.js
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

var pm_Prefs = {
	
	prefTypeNames: {	
		0: "PREF_INVALID",
		32: "PREF_STRING",
		64: "PREF_INT",
		128: "PREF_BOOL"
	},
	
    dict: {},
	/*
	 * Is preference set?
	 * 
	 * @param aPrefName
	 */
	exists: function exists(aPrefName) 
	{
        console.log("this.dict[" + aPrefName + "] = " + this.dict[aPrefName] );
		return this.dict[aPrefName] != undefined; 
	},

	
	isInvalidPrefType: 
	function isInvalidPrefType(prefTypeString, prefTypeNumber) 
	{
		switch (prefTypeNumber) {
			case this._pref.PREF_STRING:
				return (prefTypeString != "string");
			case this._pref.PREF_BOOL:
				return (prefTypeString != "boolean");
			case this._pref.PREF_INT:
				return (prefTypeString != "number");
			case this._pref.PREF_INVALID: 
				return false;
		}
		
		return false;
	},

	/*
	 * Get preference value.
	 * 
	 * @param aPrefName
	 * @param aDefaultValue
	 */
	getPref: function getPref(aPrefName, aDefaultValue) 
	{
        if ( this.exists(aPrefName) == true )
        {
            return this.dict[aPrefName];
        }
        else
        {
            return aDefaultValue;
        }
	},
	
	/*
	 * Set preference value.
	 * 
	 * @param aPrefName
	 * @param aValue
	 */
	setPref: function setPref(aPrefName, aValue) 
	{
        console.log("Setting preference " + aPrefName + " with value:" +  aValue);
        this.dict[aPrefName] = aValue;
        port.postMessage({message: "SetPref!", values: [aPrefName,aValue]});
		return true;
	},


	/*
	 * Get language related preference.
	 * 
	 * @param langId
	 * @param aPrefName
	 * @param aDefaultValue
	 */
	getLanguagePref: 
	function getLanguagePref(langId, aPrefName, aDefaultValue) 
	{
		if ((langId != undefined) && (aPrefName != undefined)) {
			var prefName = aPrefName.replace('<n>', langId);
			return this.getPref(prefName, aDefaultValue);
		} else {
			pm_Logger.logError('Language ID or pref is undefined');
			return null;
		}
	},
	

	/*
	 * Set language related preference.
	 * 
	 * @param langId
	 * @param aPrefName
	 * @param aValue
	 */
	setLanguagePref: 
	function setLanguagePref(langId, aPrefName, aValue) 
	{			
		if ((langId != undefined) && (aPrefName != undefined)) {
			var prefName = aPrefName.replace('<n>', langId);
			return this.setPref(prefName, aValue);
		} else {
			pm_Logger.logError('Language ID or pref is undefined');
			return false;
		}
	},
	
	/*
	 * Get value of character/user specific preference.
	 * 
	 * @param characterId
	 * @param aPrefName
	 * @param aDefaultValue
	 */
	getCharacterPref: 
	function getCharacterPref(characterId, aPrefName, aDefaultValue) 
	{
		if (characterId && aPrefName) {
			var prefName = aPrefName.replace('<n>', characterId);
			return this.getPref(prefName, aDefaultValue);
		} else {
			pm_Logger.logError('char ID or pref is undefined');
			return null;
		}
	},
	

	/*
	 * Set value of character/user specific preference.
	 * 
	 * @param characterId
	 * @param aPrefName
	 * @param aValue
	 */
	setCharacterPref: 
	function setCharacterPref(characterId, aPrefName, aValue) 
	{			
		if (characterId && aPrefName) {
			var prefName = aPrefName.replace('<n>', characterId);
			return this.setPref(prefName, aValue);
		} else {
			pm_Logger.logError('char ID or pref is undefined');
			return false;
		}
	},
	
	/*
	 * Is setting enabled?
	 * 
	 * @param aPrefName
	 * @param aDefaultValue
	 */
	isEnabled: function isEnabled(aPrefName) {
		return pm_Prefs.getPref(aPrefName, false);
	},
	
	/*
	 * Read setting.
	 * 
	 * @param aPrefName
	 */
	getSetting: function getSetting(aPrefName, aDefaultValue) {
		return pm_Prefs.getPref(aPrefName, aDefaultValue);
	},
	
	/*
	 * Save setting.
	 * 
	 * @param aPrefName
	 * @param aValue
	 */
	setSetting: function setSetting(aPrefName, aValue) {
		return pm_Prefs.setPref(aPrefName, aValue);
	},
	
	
	getTimestamp: function getTimestamp(aPrefName) {
		var ts = pm_Prefs.getPref(aPrefName, 0);
		var d = new Date();
		d.setTime(parseInt(ts));
		return d;
	}, 

	
	setTimestamp: function setTimestamp(aPrefName) {
		var d = new Date();
		return pm_Prefs.setPref(aPrefName, d.getTime() +'');
	},
	
	
	/*
	 * aBranchName The base branch. Must have a trailing '.' (dot).
	 */
	getChildList: function getChildList(aBranchName) {
		var list = {};
		return list;
	},
	
	
	prefHasUserValue: function prefHasUserValue(aPrefName) {
		return false;
	},
	
	
	clearUserPref: function clearUserPref(aPrefName) {
		
	}
};
