/*
 * logger.js
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

var pm_Logger = {

	// Debug mode: 0=off, 1=on
	traceLevel: 1,
		
	/*
	 * Send message to console.
	 * 
	 * @param message
	 */
	log: function log(message) {	
		console.log(
			'Chromomungo: ' + message);
	},

	/*
	 * Send error message to console.
	 * 
	 * @param message
	 */
	logError: function logError(message) {
	
		var myCaller = this.logError.caller.name;
		var msg = 'Chromomungo: (' +myCaller + ') '+ message;

		// Is exception?				
		if (message.stack) {
 			msg = msg +':\n'+ message.stack;
		}
		
		console.log(msg);
	},	
	
	/*
	 * Send info message to console.
	 * 
	 * @param message
	 * @see traceLevel
	 */
	debug: function debug(message) {
		if (pm_Logger.traceLevel > 0) {

            console.log(
				'Chromomungo: ' + message);
		}
	},
    
	debugObject: function debugObject(obj, objName) {
		if (pm_Logger.traceLevel > 0) {
			var myCaller = this.debugObject.caller.name;

			var message = '';
			if (obj) {
				for (var i in obj) {
					message = message + i +'='+ obj[i] +'\n';
				}
				
				message = '\n'+ message;
			} else {
				message = obj;
			}
				
			console.log(
				'Chromomungo:'+ myCaller +': '+ (objName ? objName +'=' : '') + message);
		}
	},    
	
	getTraceLevel:
	function getTraceLevel() {
		return this.traceLevel;
	},
	
	
	setTraceLevelFromPref:
	function setTraceLevelFromPref() {
        // TODO: need a preference system
        this.traceLevel = 4;
	}
};

pm_Logger.setTraceLevelFromPref();
