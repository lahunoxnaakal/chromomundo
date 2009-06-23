/*
 * styles.js
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

var pm_Styles = {
	THEME_REGEXP: /css\/themes\/(.*?)\/.*?\.css$/i,


	/*
	 * Append CSS to the document head.
	 * 
	 * @param aDocument
	 */
	appendCSS: function appendCSS(aDocument) {
		try {
			var link = aDocument.createElement('link');
			link.rel = "stylesheet";
			link.type = "text/css";
            // chrome has a different way
			// link.href = "chrome://popomungo/content/popomungo.css";
            link.href = chrome.extension.getURL("popomungo.css");

			var head = aDocument.getElementsByTagName('head')[0]
			head.appendChild(link);

		}
		catch(err) {
			pm_Logger.logError(err);
		}
	},

	
	/*
	 * Get the current theme.
	 * 
	 * Known themes: 
	 * Default
	 * Retro
	 * Pumpkin (Halloween)
	 * Champagne (New Year's Eve)
	 */
	getTheme: function getTheme(aDocument) {
		// <link rel="stylesheet" type="text/css" href="css/Themes/Default/Default.css">
		// /Common/css/Themes/Champagne/Champagne.css
		
		try {
			var links = aDocument.getElementsByTagName('link');
			
			for (var i = links.length - 1; i >= 0; i--) {
				if (links[i].rel == 'stylesheet') {
					var result = links[i].href.match(this.THEME_REGEXP);
					
					if (result) {
						pm_Logger.debug('theme='+ result[1]);
						
						return result[1];
					}
				}
			}
		}
		catch (err)	 {
			pm_Logger.logError(err);
		}
		
		pm_Logger.logError('Could not detect the current theme.');
			
		return null;
	}
};
