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
	
    dict: [
            "TODO"
            ],

	getBundleByLanguage: 
	function getBundleByLanguage(langId, propsFile)
	{
		return null;
	},


	InitStringBundle: function InitStringBundle(langId) 
	{
        this.dict[pm_StringKeys.LINKS_CHARACTERS_CALL] = "Chiama";
        this.dict[pm_StringKeys.LINKS_CHARACTERS_CALL_ABBREV] = "C";
        this.dict[pm_StringKeys.LINKS_CHARACTERS_SEND_MESSAGE] = "Invia messaggio";
        this.dict[pm_StringKeys.LINKS_CHARACTERS_SEND_MESSAGE_ABBREV] = "M";
        this.dict[pm_StringKeys.LINKS_LOCALES_MOVE_HERE] = "Sposta qui";
        this.dict[pm_StringKeys.LINKS_LOCALES_MOVE_HERE_ABBREV] = "G";
        this.dict[pm_StringKeys.LINKS_LOCALES_VIEW_CHARACTERS] = "Mostra Personaggi Presenti";
        this.dict[pm_StringKeys.LINKS_LOCALES_VIEW_CHARACTERS_ABBREV] = "V";
        this.dict[pm_StringKeys.PERFORMANCES_DAYS_SOLD_DATA] = "%s giorni";
        pm_Logger.debug("InitStringBundle finished."); 
        
        return true;
	},
	

	getString: function getString(aStringName, aFormatArgs) 
	{    
        pm_Logger.debug("Requesting String: " + aStringName + " Result = " + this.dict[aStringName]); 
        
        if ( this.dict[aStringName] != "" )
            return this.dict[aStringName];
        else
            return "MISS";
	},
    
	getString: function getString(aStringName, aFormatArgs) 
	{
		var s;

		try {
			if (aFormatArgs) {
				pm_Logger.debug(aStringName +" with format string: " + aFormatArgs.join("; "));
								
                if ( aFormatArgs.length == 1 ) {
                    s = sprintf(this.dict[aStringName], aFormatArgs[0]);
                }
                else if ( aFormatArgs.length == 2 ) {
                    s = sprintf(this.dict[aStringName], aFormatArgs[0], aFormatArgs[1]);
                }
                else if ( aFormatArgs.length == 3 ) {
                    s = sprintf(this.dict[aStringName], aFormatArgs[0], aFormatArgs[1], aFormatArgs[2]);
                }
                else if ( aFormatArgs.length == 4 ) {
                    s = sprintf(this.dict[aStringName], aFormatArgs[0], aFormatArgs[1], aFormatArgs[2], aFormatArgs[3]);
                }
                else {  
                    s = this.dict[aStringName];                
                }
			} else {
				s = this.dict[aStringName];
			}
		}
		catch(err) {
			pm_Logger.logError(err);
		};

		pm_Logger.debug(aStringName +"='"+ s + "'");
		
		return s;
	},
};
