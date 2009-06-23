/*
 * timeZones.js
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
 * @param tz
 */
function pm_TimeZoneData(city, tz) {
	this.city = city;
	this.tz = tz;
};


var pm_TimeZones = {
	TIME_ZONES_BY_CITY: {
		 1:  1, // Stockholm
		 5:  0, // London
		 6: -5, // New York
		 7:  1, // Berlin
		 8:  1, // Amsterdam
		 9:  1, // Barcelona
		10: 11, // Melbourne
		11: -6, // Nashville
		14: -8, // Los Angeles
		16: -5, // Toronto
		17: -4, // Buenos Aires
		18:  3, // Moscow
		19:  2, // Helsinki
		20:  1, // Paris
		21: -4, // Sao Paulo
		22:  1, // Copenhagen
		23:  1, // Rome
		24:  1, // Madrid
		25: -4, // Rio de Janeiro
		26:  1, // Tromso
		27:  0, // Glasgow
		28:  2, // Vilnius
		29:  1, // Dubrovnik
		30:  2, // Istanbul
		31:  0, // Porto
		32: -6, // Mexico City
		33:  1, // Brussels
		34:  2, // Tallinn
		35:  2, // Ankara
		36:  1, // Belgrade
		38: -5, // Montreal
		39:  7, // Singapore
		42:  1, // Budapest
		45:  8, // Shanghai
		46:  2, // Bucharest
		47:  2, // Izmir
		48:  1, // Warsaw
		49:  1, // Sarajevo
		50: -8,	// Seattle
		51:  1,	// Johannesburg
		52:  1,	// Milano
		53:  2	// Sofia
	},
	
	
	getTimeZoneByCity: function getTimeZoneByCity(cityId) {
		return this.TIME_ZONES_BY_CITY[cityId];	
	}
};
