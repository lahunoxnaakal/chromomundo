/**
 * elementCache.js
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

var pm_ElementCache = {
	_data: {},
	_set: {},
		
	clear: function clear() {
		this._set = {};
	},

	getElementsByTagName: function getElementsByTagName(aTag, aDocument) {
		if (this._set[aTag]) {
			return this._data[aTag];
		}

		this._data[aTag] = aDocument.getElementsByTagName(aTag);
		this._set[aTag] = true;
		return this._data[aTag];
	},

	getAnchorNodesOnMenu: function getAnchorNodesOnMenu(aMenuName, aNode) {
		if (this._set[aMenuName]) {
			return this._data[aMenuName];
		}

		this._data[aMenuName] = aNode.getElementsByTagName('A');
		this._set[aMenuName] = true;
		return this._data[aMenuName];
	}
};

// EOF