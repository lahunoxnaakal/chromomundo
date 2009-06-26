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
		this.dict[pm_StringKeys.PERFORMANCES_DAYS_SOLD_HOVER] = "Numero di giorni tra la prenotazione e lo spettacolo.";
		this.dict[pm_StringKeys.PERFORMANCES_DAYS_SOLD_TITLE] = "Giorni venduti";
		this.dict[pm_StringKeys.PERFORMANCES_DAYS_TO_SELL_TITLE] = "Giorni rimanenti";
		this.dict[pm_StringKeys.PERFORMANCES_DAYS_TO_SELL_AFTER_START_DATA] = "%s giorni (%s giorni venduti)";
		this.dict[pm_StringKeys.PERFORMANCES_DAYS_TO_SELL_BEFORE_START_DATA] = "%s giorni (inizia tra %s giorni)";		
		this.dict[pm_StringKeys.PERFORMANCES_ESTIMATED_INCOME_FOR_ARTIST_DATA] = "%s = %s biglietti * %s";
		this.dict[pm_StringKeys.PERFORMANCES_ESTIMATED_INCOME_FOR_ARTIST_TITLE] = "Ricavo Stimato (Artista)";
		this.dict[pm_StringKeys.PERFORMANCES_ESTIMATED_INCOME_FOR_CLUB_DATA] = "%s = %s biglietti * %s";
		this.dict[pm_StringKeys.PERFORMANCES_ESTIMATED_INCOME_FOR_CLUB_TITLE] = "Ricavo Stimato (Club)";
		this.dict[pm_StringKeys.PERFORMANCES_ESTIMATED_SALES_DATA] = "%s biglietti (%s biglietti al giorno)";
		this.dict[pm_StringKeys.PERFORMANCES_ESTIMATED_SALES_TITLE] = "Vendite stimate";
		this.dict[pm_StringKeys.PERFORMANCES_INCOME_AVERAGE_PER_SHOW] = "Guadagno medio per spettacolo: %s";
		this.dict[pm_StringKeys.PERFORMANCES_INCOME_ESTIMATED_TOTAL_VALUE] = "Totale stimato: %s";
		this.dict[pm_StringKeys.PERFORMANCES_INCOME_TOTAL_VALUE] = "Guadagno totale: %s";
		this.dict[pm_StringKeys.PERFORMANCES_SHOWS_COUNT] = "Numero di concerti: %s";
		this.dict[pm_StringKeys.PERFORMANCES_TICKETS_COUNT] = "Biglietti venduti: %s";
		this.dict[pm_StringKeys.PERFORMANCES_TICKETS_ESTIMATED_TOTAL_COUNT] = "Stima dei biglietti venduti: %s";
		this.dict[pm_StringKeys.PERFORMANCES_TICKETS_PERCENT] = "Biglietti riservati: %s%%";
		this.dict[pm_StringKeys.PERFORMANCES_TICKETS_PER_DAY_DATA] = "%s biglietti";
		this.dict[pm_StringKeys.PERFORMANCES_TICKETS_PER_DAY_HOVER] = "Numero medio di biglietti venduti al giorno.";		
		this.dict[pm_StringKeys.PERFORMANCES_TICKETS_PER_DAY_TITLE] = "Biglietti al giorno";		
		this.dict[pm_StringKeys.PERFORMANCES_TICKETS_RATIO] = "Biglietti riservati: %s / %s";		
		this.dict[pm_StringKeys.PERFORMANCES_TICKET_LIMIT_ESTIMATE_DATA] = "Guadagni stimati = %s (%s)";				
		this.dict[pm_StringKeys.PERFORMANCES_TICKET_LIMIT_ESTIMATE_HOVER] = "%s biglietti * %s - %s";				
		this.dict[pm_StringKeys.PERFORMANCES_TICKET_LIMIT_ESTIMATE_TITLE] = "Limite ai biglietti %s";
		this.dict[pm_StringKeys.PERFORMANCES_TICKET_LIMIT_NEAR] = "Si avvicina il limite di biglietti.";
		this.dict[pm_StringKeys.PERFORMANCES_TICKET_LIMIT_REACHED] = "Il limite di biglietti \u00e8 stato raggiunto.";
		this.dict[pm_StringKeys.PERFORMANCES_TICKET_PRICE_HIGH] = "Il prezzo dei biglietti \u00e8 alto.";				
						
        pm_Logger.debug("InitStringBundle finished."); 
        
        return true;
	},	
    
	getString: function getString(aStringName, aFormatArgs) 
	{
		var s;

		try {
			if (aFormatArgs) {
				pm_Logger.debug(aStringName +" with format string: " + aFormatArgs.join("; "));
				pm_Logger.debug(aStringName +" = " + this.dict[aStringName]);
				pm_Logger.debug("args count = " + aFormatArgs.length);
								
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
