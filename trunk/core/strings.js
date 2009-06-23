/*
 * strings.js
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

var pm_Strings = {
	// _bundle: null,  // nsIStringBundle
	
	// _stringBundleId: "popomungo.locale.stringbundle",
	
	// Chrome does not need that
    //LOCALE_CHROME_URL_BASE: "chrome://popomungo/locale/",
	
    // Chrome has not properties system
	//BASIC_STRINGS_PROPS_FILE: "popomungo.properties",
	

	getBundleByLanguage: 
	function getBundleByLanguage(langId, propsFile)
	{
		return "TODO";
	},


	InitStringBundle: function InitStringBundle(langId) 
	{
        return true;
	},
	

	getString: function getString(aStringName, aFormatArgs) 
	{
        return "TODO";
	},
	
	
	getLocalesString: function getLocalesString() {
        s = "TODO";
	}
};
