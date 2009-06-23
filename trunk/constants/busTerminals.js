/*
 * busTerminals.js
 * Copyright (c) 2008-2009 Tommi Rautava
 * Copyright (c) 2009 Marko Megla 
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


/*
 * @param city
 */
function pm_BusTerminalData(city) {
	this.city = city;
};


var pm_BusTerminals = {
	
	BUS_TERMINALS_BY_CITIES: null,

	BUS_TERMINALS_BY_LOCALE_ID: {
		35461:   new pm_BusTerminalData( 1),	// Stockholm
		35462:   new pm_BusTerminalData( 5),	// London
		35463:   new pm_BusTerminalData( 6),	// New York
		35464:   new pm_BusTerminalData( 7),	// Berlin
		35465:   new pm_BusTerminalData( 8),	// Amsterdam
		35466:   new pm_BusTerminalData( 9),	// Barcelona
		35467:   new pm_BusTerminalData(10),	// Melbourne
		35468:   new pm_BusTerminalData(11),	// Nashville
		35469:   new pm_BusTerminalData(14),	// Los Angeles
		35471:   new pm_BusTerminalData(16),	// Toronto
		35472:   new pm_BusTerminalData(17),	// Buenos Aires
		35473:   new pm_BusTerminalData(18),	// Moscow
		35474:   new pm_BusTerminalData(19),	// Helsinki
		35475:   new pm_BusTerminalData(20),	// Paris
		53595:   new pm_BusTerminalData(21),	// S�o Paulo
		72403:   new pm_BusTerminalData(23),	// Rome 
		81722:   new pm_BusTerminalData(10),	// Melbourne 
		88604:   new pm_BusTerminalData(22),	// Copenhagen
		103127:  new pm_BusTerminalData(24),	// Madrid
		104741:  new pm_BusTerminalData(25),	// Rio de Janeiro 
		106201:  new pm_BusTerminalData(26),	// Troms�
		111706:  new pm_BusTerminalData(27),	// Glasgow
		122918:  new pm_BusTerminalData(28),	// Vilnius
		131990:  new pm_BusTerminalData(29),	// Dubrovnik
		137941:  new pm_BusTerminalData(30),	// Istanbul
		140963:  new pm_BusTerminalData(31),	// Porto
		170267:  new pm_BusTerminalData(32),	// Mexico City
		188642:  new pm_BusTerminalData(33),	// Brussels
		195083:  new pm_BusTerminalData(34),	// Tallinn
		249589:  new pm_BusTerminalData(35),	// Ankara
		282984:  new pm_BusTerminalData(36),	// Belgrade 
		358358:  new pm_BusTerminalData(38),	// Montreal
		473017:  new pm_BusTerminalData(39),	// Singapore
		653962:  new pm_BusTerminalData(42),	// Budapest
		670042:  new pm_BusTerminalData(45),	// Shanghai
		773545:  new pm_BusTerminalData(46),	// Bucharest 
		782566:  new pm_BusTerminalData(47),	// Izmir
		847918:  new pm_BusTerminalData(48),	// Warsaw
		1174001: new pm_BusTerminalData(49),	// Sarajevo
		1349117: new pm_BusTerminalData(50),	// Seattle
		1845323: new pm_BusTerminalData(51), 	// Johannesburg
		1886304: new pm_BusTerminalData(52),	// Milano
		1958366: new pm_BusTerminalData(53)		// Sofia
	},
	
	
	getCityByBusTerminal: function getCityByBusTerminal(localeId) {
		var data = this.BUS_TERMINALS_BY_LOCALE_ID[localeId];

		return (data ? data.city : undefined); 
	}
}
