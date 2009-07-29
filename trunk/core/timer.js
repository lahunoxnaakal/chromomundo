/**
 * timer.js
 * Copyright (C) 2009  Tommi Rautava
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


/**
 * @constructor
 * @param {String} id
 */
function pm_TimerClass(id) {
	var startTime = new Date();
	this._startTimeMs = startTime.getTime();
	this._intTimeMs = this._startTimeMs;
	this._id = id ? id + ' ' : '';
}

pm_TimerClass.prototype = {
	/**
	 * @private
	 * @type Number
	 */ 
	_startTimeMs: 0,

	/** 
	 * @private
	 * @type Number
	 */ 
	_intTimeMs: 0,

	/** 
	 * @private
	 * @type String
	 */ 
	_id: '',
		
	/**
	 * @return Elapsed time
	 * @type String
	 */
	elapsedTimeStr: function elapsedTimeStr() {
		var intTime = new Date();
		var intTimeMs = intTime.getTime();
		var totalTimeMs = intTimeMs - this._startTimeMs;
		var diffTimeMs = intTimeMs - this._intTimeMs;
		this._intTimeMs = intTimeMs;
		
		return this._id + 'time: total='+ totalTimeMs +'ms, diff=+'+ diffTimeMs +'ms';
	}
};

// EOF