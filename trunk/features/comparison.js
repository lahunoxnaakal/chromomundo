/**
 * comparison.js
 * Copyright (C) 2007-2009  Tommi Rautava
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

var pm_Comparison = {

	xpathBase: '/html/body/table[last()]/tbody/tr/td[1]/div[2]/table/tbody/tr/td[1]/b',

	_scoreBgColors: new Array(),
	
	_textColors: new Array(),
	

	textNodesXpath: function textNodesXpath() {
		return this.xpathBase +'/text()/.';
	},


	attributeAnchorElementsXpath: function attributeAnchorElementsXpath() {
		return this.xpathBase +'/a';
	},


	processCharacterSheet: function processCharacterSheet(aDocument) {
		try {
			if (!pm_Prefs.isEnabled("extensions.popomungo.options.scoring.compareAttributes.enabled")) {
				return;
			}
		
			var ownCharId = pm_UserSettings.getCharacterId(aDocument);
			var queryMatch = aDocument.location.search.match(pm_UserSettings.characterIdUrlRegExp);
	
			if (queryMatch) {
				var charId = parseInt(queryMatch[1]);
				
				if (charId == ownCharId) {
					this.storeAttributeValues(aDocument, ownCharId);
				} else {
					this.addAttributeDifferences(aDocument, ownCharId);
				}
			}
			else {
				pm_Logger.debug("No character ID on the URL");
				this.storeAttributeValues(aDocument, ownCharId);
			}
		} catch (err) {
			pm_Logger.logError(err);
		}
	},
	

	getTextNodes: function getTextNodes(aDocument) {
		var xpResult = pm_XPathOrderedSnapshot(this.textNodesXpath(), aDocument);
			
		if (xpResult) {
			pm_Logger.debug('nodes='+ xpResult.snapshotLength);
		} else {
			pm_Logger.logError('Could not get text nodes.');
		}
			
		return xpResult;
	},

	
	getAttributes: function getAttributes(aDocument) {
		var xpResult = pm_XPathOrderedSnapshot(this.attributeAnchorElementsXpath(), aDocument);
			
		if (xpResult) {
			pm_Logger.debug('nodes='+ xpResult.snapshotLength);
		} else {
			pm_Logger.logError('Could not get attribute anchors.');
		}
			
		return xpResult;
	},

	
	addAttributeDifferences: function addAttributeDifferences(aDocument, ownCharId) {
		try {
			// 8 nodes: attitude + 5 attributes + 2 priorities
			var textNodes = this.getTextNodes(aDocument);
	
			var ownAttributes = this.recallOwnAttributes(ownCharId);
			
			// 5 nodes: 5 attribute values
			var attributeNodes = this.getAttributes(aDocument); // 5
	
			var colorNumber = pm_Prefs.isEnabled("extensions.popomungo.options.scoring.colorNumber.enabled");
			var position = pm_Prefs.getPref("extensions.popomungo.options.scoring.compareAttributes.numberPosition");
	
			for (var i = attributeNodes.snapshotLength - 1; i > -1; i--) {
				var attrNode = attributeNodes.snapshotItem(i);
				var textNode = textNodes.snapshotItem(i+1);
				
				var parentNode;
				var nextSibling;
				var spaceNode;
				
				switch (position) {
					case 0: // Before attribute
						parentNode = textNode.parentNode;
						if (attrNode.nextSibling == textNode) {
							nextSibling = textNode;
						}
						else {
							spaceNode = aDocument.createTextNode(" ");
							parentNode.insertBefore(spaceNode, textNode);
							nextSibling = spaceNode;
						}
						break;
						
					case 1: // After attribute
						parentNode = textNode.parentNode;
						if (textNode.nextSibling == attrNode) {
							spaceNode = aDocument.createTextNode(" ");
							parentNode.insertBefore(spaceNode, attrNode);
							nextSibling = spaceNode;
						}
						else {
							nextSibling = textNode.nextSibling;
						}
						break;
						
					case 2: // After score
						parentNode = attrNode.parentNode;
						nextSibling = attrNode.nextSibling; 
						break;
						
					default: 
						parentNode = attrNode.parentNode;
						nextSibling = attrNode.nextSibling;
				}
	
				var matchResult = attrNode.href.match(pm_Scoring.SCORE_NUMBER_REGEXP);
				
				if (matchResult) {
					var value = parseInt(matchResult[1]) - 1;
					
					var difference = value - ownAttributes[i];
					
					var sign;
					if (difference > 0) {
						sign = '+';
					} else if (difference < 0) {
						sign = '';
					} else {
						sign = '\u00b1';
					}
	
					var scoreNode = aDocument.createElement('span');
					scoreNode.className = 'popomungo_score';

					if (colorNumber) {					
						var colorObj = this.getScoreColor(difference);
						var bgColor = colorObj.bgColor;
						var textColor = colorObj.textColor;

						scoreNode.setAttribute('style', 'background: '+ bgColor +'; color: '+ textColor +';');
						scoreNode.appendChild(aDocument.createTextNode('\u00a0'+ sign + difference +'\u00a0'));
					} else {
						// No color.
						scoreNode = aDocument.createTextNode('('+ sign + difference +')');
					}
					
					pm_Scoring.insertScoreNode(scoreNode, parentNode, nextSibling);
					
				} else {
					pm_Logger.logError('Node href('+ attrNode.href +') did not match '+ pm_Scoring.SCORE_NUMBER_REGEXP);
				}
				
				pm_Logger.debug(i +': difference='+ difference);
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}		
	},


	storeAttributeValues: function storeAttributeValues(aDocument, ownCharId) {
		var attributes = new Array();
		var xpResult = this.getAttributes(aDocument);

		for (var i = xpResult.snapshotLength - 1; i > -1; i--) {
			var node = xpResult.snapshotItem(i);
			
			var matchResult = node.href.match(pm_Scoring.SCORE_NUMBER_REGEXP);
			
			if (matchResult) {
				attributes[i] = parseInt(matchResult[1]) - 1;
			}
		}
		
		this.storeOwnAttributes(ownCharId, attributes);
	},
	
	
	storeOwnAttributes: function storeOwnAttributes(charId, attributes) {
		if (attributes.length == 5) {
			var prefValue = attributes.join(',');
			
			pm_Prefs.setCharacterPref(charId, "extensions.popomungo.characters.<n>.attributes", prefValue);
		}
		else {
			pm_Logger.debug("Incorrect number of attribute values: "+ attributes.length);
		}
	},
	
	
	recallOwnAttributes: function recallOwnAttributes(charId) {
		var prefValue = pm_Prefs.getCharacterPref(charId, 
			"extensions.popomungo.characters.<n>.attributes");
		
		return prefValue.split(',');
	},
	
	
	getScoreColor: function getScoreColor(difference)  {
		// difference range = -26 .. +26
		// id range = 0 .. +52
		var id = difference + pm_Scoring.MAX_SCORED_ID;
		var bgColor;
		var textColor;
		
		// Return previously calculated color.
		if (this._scoreBgColors[id]) {
			bgColor = this._scoreBgColors[id];
			textColor = this._textColors[bgColor];

			return new pm_TextColor(textColor, bgColor);
		}

		// Calculate background color.
		// Red = 0/360, Green = 120
		var hue = 60 + 120 * (difference / pm_Scoring.MAX_SCORED_ID);
		if (hue > 120) { hue = 120; }
		else if (hue < 0) { hue= 0; }
		
		var rgbObj = pm_Color.convertHsvToRgb(hue, 1, 1);
		bgColor = rgbObj.toHex();

		// Calculate foreground color.
		textColor = pm_Color.idealTextColor(
			rgbObj.R, rgbObj.G, rgbObj.B);
		
		// Store colors.
		this._scoreBgColors[id] = bgColor;
		this._textColors[bgColor] = textColor;
		
		pm_Logger.debug("id="+ id +
			", textColor="+ textColor +
			", bgColor="+ bgColor);

		return new pm_TextColor(textColor, bgColor);
	}
};
