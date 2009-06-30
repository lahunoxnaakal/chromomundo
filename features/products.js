/*
 * products.js
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

var pm_Products = {
	
	LOW_STOCK_ALERT_CLASS: "popomungo_lowStockAlert",
	LOW_STOCK_ALERT_ICON_CLASS: "popomungo_lowStockAlertIcon",
	
	LOW_STOCK_WARNING_CLASS: "popomungo_lowStockWarning",
	LOW_STOCK_WARNING_ICON_CLASS: "popomungo_lowStockWarningIcon",
	
	
	highlightEmptyStock:
	function highlightEmptyStock(aDocument, aXpath) {
		try {
			if (!pm_Prefs.isEnabled(pm_PrefKeys.HIGHLIGHTING_FEATURES_ENABLED)) {
				return;
			}
	
			if (!pm_Prefs.isEnabled(pm_PrefKeys.HIGHLIGHTING_LOW_STOCK_ENABLED)) {
				return;
			}
	
			var alertLevel = pm_Prefs.getSetting(pm_PrefKeys.PRODUCTS_LOW_STOCK_ALERT_LEVEL, 0);
			var warningLevel = pm_Prefs.getSetting(pm_PrefKeys.PRODUCTS_LOW_STOCK_WARNING_LEVEL, 9);
	
			var elems = pm_XPathOrderedSnapshot(aXpath, aDocument);
			
			pm_Logger.debug('elements='+ elems.snapshotLength);
		
			var i;
			// Loop through all items, but skip header.
			for (i = elems.snapshotLength - 1; i > 0; i--) {
				var elem = elems.snapshotItem(i);
				var stock = parseInt(elem.textContent);
	
				pm_Logger.debug('stock='+ stock +' (textContent='+ elem.textContent +', text='+ elem.text +')');
				
				var iconUrl;
				
				// Alert
				if (stock <= alertLevel) {
					iconUrl = aDocument.createElement('img');
					iconUrl.src = pm_CommonConstants.ALARM_ICON_URL;
					iconUrl.className = this.LOW_STOCK_ALERT_ICON_CLASS;
					//TODO iconUrl.title = pm_Strings.getString(pm_StringKeys.XYZ, null);
					elem.className = elem.className ? ' '+ this.LOW_STOCK_ALERT_CLASS : this.LOW_STOCK_ALERT_CLASS;
					elem.insertBefore(iconUrl, elem.firstChild);
				}
				// Warning
				else if (stock <= warningLevel) {
					iconUrl = aDocument.createElement('img');
					iconUrl.src = pm_CommonConstants.WARNING_ICON_URL;
					iconUrl.className = this.LOW_STOCK_WARNING_ICON_CLASS;
					//TODO iconUrl.title = pm_Strings.getString(pm_StringKeys.XYZ, null);
					elem.className = elem.className ? ' '+ this.LOW_STOCK_WARNING_CLASS : this.LOW_STOCK_WARNING_CLASS;
					elem.insertBefore(iconUrl, elem.firstChild);
				}
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	},


	highlightEmptyStockOnRestock: 
	function highlightEmptyStockOnRestock(aDocument) {
		var xpath1 = "/html/body/table[last()]/tbody/tr/td[1]/table[2]/tbody/tr/td/form/table/tbody/tr/td[2]";

		return this.highlightEmptyStock(aDocument, xpath1)
	},
	
	
	highlightEmptyStockOnManageProducts: 
	function highlightEmptyStockOnManageProducts(aDocument) {
		var xpath1 = "/html/body/table[last()]/tbody/tr/td[1]/table[2]/tbody/tr/td/form/table/tbody/tr/td[3]";

		return this.highlightEmptyStock(aDocument, xpath1)
	},
	
	
	highlightEmptyStockIfFormPage:
	function highlightEmptyStockIfFormPage(aDocument) {
		try {
			var form3 = aDocument.getElementsByName('form3').item(0);
			
			if (form3) {
				var action = form3.elements.namedItem('action').value.toLowerCase();
				pm_Logger.debug('action='+ action);
				
				if (action == 'updatestock') {
					this.highlightEmptyStockOnRestock(aDocument);
				}
				else if (action == 'updateprice') {
					this.highlightEmptyStockOnManageProducts(aDocument);
				}
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	}
};
