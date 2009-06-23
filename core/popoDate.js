/*
 * popoDate.js
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

var pm_PopoDate = {
	DATE_MATCH_REGEXP: /(\d+[\.\/\-]\d+[\.\/\-]\d+)/,
	
	DATE_AND_TIME_SPLIT_REGEXP: /[ \-\:]/,
	

	convertToDateObject: 
	function convertToDateObject(dateString, splitRegExp, 
		yearIndex, monthIndex, dayIndex) 
	{
		var date1 = null;
		
		try {
			var dateArr = dateString.split(splitRegExp);
		
			if (dateArr && dateArr.length == 3) {
				date1 = new Date(dateArr[yearIndex], dateArr[monthIndex]-1, dateArr[dayIndex], 12);
				date1.setUTCHours(12,0,0,0);
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}
		
		return date1;
	},
	
	
	/*
	 * 1: YYYY-MM-DD
	 * 2: DD/MM/YYYY
	 * 3: DD.MM.YYYY
	 * 4: M/D/YYYY
	 * 5: D/M-YYYY
	 * 6: D.M.YYYY
	 */
	doConversionByFormat: 
	function doConversionByFormat(dateString, dateFormatTypeId) {
		var dateObj = null;
		
		try {
			switch (dateFormatTypeId) {
				case 1: dateObj = this.convertToDateObject(dateString, /\-/, 0, 1, 2); break;
				case 2: dateObj = this.convertToDateObject(dateString, /\//, 2, 1, 0); break;
				case 3: dateObj = this.convertToDateObject(dateString, /\./, 2, 1, 0); break;
				case 4: dateObj = this.convertToDateObject(dateString, /\//, 2, 0, 1); break;
				case 5: dateObj = this.convertToDateObject(dateString, /[\-\/]/, 2, 1, 0); break;
				case 6: dateObj = this.convertToDateObject(dateString, /\./, 2, 1, 0); break;
				default:
					var error_msg = pm_Strings.getString(
						pm_StringKeys.MESSAGE_UNSUPPORTED_DATE_FORMAT, [pm_UserSettings.getDateFormatTypeId()]);
					pm_Logger.logError(error_msg);
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}
		
		return dateObj;
	},
	
	
	toDate: function toDate(dateString, isRetry) {
		var dateObj = null;
		
		try {
			var dateFormatTypeId = pm_UserSettings.getDateFormatTypeId();
			pm_Logger.debug('dateFormatTypeId='+ dateFormatTypeId);
			
			dateObj = this.doConversionByFormat(dateString, dateFormatTypeId);
			
			if (!dateObj && !isRetry) {
				dateFormatTypeId = this.autoDetectDateFormat(dateString);
				pm_Logger.debug('Auto-detected dateFormatTypeId='+ dateFormatTypeId);

				if (dateFormatTypeId) {
					dateObj = this.doConversionByFormat(dateString, dateFormatTypeId);

					if (dateObj) {
						// The new format ID is correct.
						pm_Overlay.dateFormatSettingIsOutOfDate(dateFormatTypeId);
					}
				}
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}
		
		return dateObj;
	},	
	
	
	/*
	 * 1: YYYY-MM-DD
	 * 2: DD/MM/YYYY
	 * 3: DD.MM.YYYY
	 * 4: M/D/YYYY
	 * 5: D/M-YYYY
	 * 6: D.M.YYYY
	 */
	autoDetectDateFormat: function autoDetectDateFormat(dateString) {
		try {
			if (dateString.match(/\d\d\d\d-\d\d-\d\d/)) {
				return 1;
			}
			else if (dateString.match(/\d\d\/\d\d\/\d\d\d\d/)) {
				var dateFormatTypeId = pm_UserSettings.getDateFormatTypeId();
				return (dateFormatTypeId == 2) ? 4 : 2;
			}
			else if (dateString.match(/\d\d\.\d\d\.\d\d\d\d/)) {
				return 3;
			}
			else if (dateString.match(/\d+\/\d+\/\d\d\d\d/)) {
				return 4;
			}
			else if (dateString.match(/\d+\/\d+\.\d\d\d\d/)) {
				return 5;
			}
			else if (dateString.match(/\d+\.\d+\.\d\d\d\d/)) {
				return 6;				
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}
			
		return 0;
	},
	

	showDateOnClubPageToDate:
	function showDateOnClubPageToDate(dateAndTimeString) {
		try {
			var values = dateAndTimeString.split(this.DATE_AND_TIME_SPLIT_REGEXP);

			var date1 = new Date(values[0], values[1]-1, values[2], 12);
			date1.setUTCHours(12, 0, 0, 0);
			//date1.setUTCHours(values[3], values[4], 0, 0);
		
			return date1;
		}
		catch (err) {
			pm_Logger.logError(err);
		}
		
		return null;
	}
};
