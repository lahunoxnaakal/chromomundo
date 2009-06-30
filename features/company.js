/*
 * company.js
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

var pm_Company = {

	// /Common/Locale.asp?action=view&LocaleID=123
	localeIdRegExp: /\/locale\.asp\?.*?\&localeid=(\d+)/i,

	highlightCeoLocale: function highlightCeoLocale(aDocument) {
		try {
			if (!pm_Prefs.isEnabled(pm_PrefKeys.HIGHLIGHTING_FEATURES_ENABLED)) {
				return;
			}
	
			var highlightLocale = pm_Prefs.isEnabled(pm_PrefKeys.HIGHLIGHTING_CEO_LOCALE_ENABLED); 

			if (!(highlightLocale)) {
				return;
			}
			
			var ceoCompanyId= pm_UserSettings.getCEOCompanyId(aDocument);
			var nodes = aDocument.getElementsByTagName('a');
			
			pm_Logger.debug('CEO company='+ ceoCompanyId +
				', nodes='+ nodes.length);

			for (var i = nodes.length - 1; i >= 0; i--) {
				var node = nodes[i];
				
				var res = node.href.match(this.localeIdRegExp);

				//pm_Logger.debug(i +': res='+ res +', href='+ node.href);
				
				if (res) {
					var companyId = res[1];
					
					//pm_Logger.debug(i +': companyId='+ companyId +
					//	', ceoCompanyId='+ ceoCompanyId);
					
					if (companyId == ceoCompanyId) {
						pm_Logger.debug(i +': CEO company');
						node.parentNode.className = 'popomungo_highlight';
					}
				}
			}	
		}
		catch (err)	 {
			pm_Logger.logError(err);
		}
	},
	
	
	updateCompaniesOnLoad:
	function updateCompaniesOnLoad(doc) {
		try {
			
		}
		catch (err)	 {
			pm_Logger.logError(err);
		}
	}
};
