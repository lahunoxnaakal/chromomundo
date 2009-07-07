/*
 * scoring.js
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

var pm_Scoring = {
	RAINBOW_COLOR: 0,
	
	GRADIENT_COLOR: 1,
	
	_textColors: new Array(),
	
	_rainbowBgColors: new Array(),

	_gradientBgColors: new Array(),	
	
	_rgbBgColorFrom: undefined,
	_rgbBgColorTo: undefined,
	
	_rDiff: undefined,
	_gDiff: undefined,
	_bDiff: undefined,
	
	_maxScoreId: 26,
	
	_insertBefore: [" ", ".", ",", "!", "?", ":"],
	
	_selectUpperNodeFor: { 
		"A": true,
		"B": true,
		"BR": false,
		"I": true
	},
	
	// FIXME this won't work if the order of the parameters changes
	scoreUrlRegExp: /\/Rules\.asp\?action\=Scoring\&Word=(.*)/i,
	
	
	disableClickHandler: function disableClickHandler(evt) {
		pm_Logger.debug("Link click is disabled");
		evt.stopPropagation();
		evt.preventDefault();
		return false;
	},


	getScoreInsertionPosition: function getScoreInsertionPosition(nodeValue) {
		try {
			var insertPos;
			var charPos; 
			
			for (var i = this._insertBefore.length - 1; i >= 0; i--) {
				charPos = nodeValue.indexOf(this._insertBefore[i]);
				
				if (charPos >= 0) {
					if (insertPos == undefined) {
						insertPos = charPos;
					} else {
						insertPos = Math.min(insertPos, charPos);
					}
				}
			}

			if (insertPos == undefined) {
				insertPos = 0;
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}
		finally {
			return insertPos;
		}
	},
	
	
	insertScoreNode: 
	function insertScoreNode(scoreNode, parentNode, nextSibling) 
	{
		/*
		 * On character page (in Swedish):
		 * Hank Hill  är en <b>flörtig</b> person med <b>\
		 * <a href="Rules.asp?action=Scoring&Word=18" title="ypperlig 17/26">\
		 * ypperlig</a> utstrålning</b> och <b>\
		 * <a href="Rules.asp?action=Scoring&Word=20" title="himmelsk 19/26">\
		 * himmelsk</a>t utseende</b>. Den totala kapaciteten av Hanks \
		 * hjärnceller ger en <b><a href="Rules.asp?action=Scoring&Word=22" \
		 * title="makalös 21/26">makalös</a> IQ</b>. Hank har en <b>\
		 * <a href="Rules.asp?action=Scoring&Word=17" title="underbar 16/26">\
		 * underbar</a> sångröst</b> och uppvisar <b>\
		 * <a href="Rules.asp?action=Scoring&Word=22" title="makalös 21/26">\
		 * makalös</a> musikalisk talang</b>.
		 * 
		 * A diary entry (in Swedish):
		 * <a href="CharacterDetails.asp?action=view&CharacterID=123">\
		 * <b>Hank Hill </b></a> ringde mig för att ha ett <b>\
		 * <a href="Rules.asp?action=Scoring&Word=22" title="makalös 21/26">\
		 * makalös</a></b>t "privat" samtal.
		 * 
		 * A diary entry (in German):
		 * <div style="Padding-bottom:5px;">\
		 * Erschöpft, aber voller Glück erreichten \
		 * <a href="CharacterDetails.asp?action=view&CharacterID=98578">\
		 * <b>Mikhailov Jerayesh</b></a> und ich endlich den Höhepunkt, \
		 * zufrieden nach unserer <b>\
		 * <a href="Rules.asp?action=Scoring&Word=20" title="wundervoll 19/26">\
		 * wundervoll</a></b>en tantrischen Nacht miteinander. </div>
		 * 
		 * A locale page (in German):
		 * Qualität:  <b><a href="Rules.asp?action=Scoring&Word=20" \
		 * title="wundervoll 19/26">wundervoll</a></b><br />
		 */
		try {
			// Up one level (e.g. when parent node is "a")
			while (nextSibling == null &&
				this._selectUpperNodeFor[parentNode.tagName])
			{
				nextSibling = parentNode.nextSibling;
				parentNode = parentNode.parentNode;
			}
			
			var insertionPosition = 0;
								
			// Change position only if some text follows.
			if (nextSibling && 
				nextSibling.nodeType == Node.TEXT_NODE) 
			{
				insertionPosition = this.getScoreInsertionPosition(nextSibling.nodeValue);

				pm_Logger.debug("node value="+ nextSibling.nodeValue +", pos="+ insertionPosition);
			}

			if (insertionPosition > 0) {
				// Split the string.
				var leftStr = nextSibling.nodeValue.slice(0, insertionPosition);
				var rightStr = nextSibling.nodeValue.slice(insertionPosition);
				nextSibling.nodeValue = rightStr;
				parentNode.insertBefore(parentNode.ownerDocument.createTextNode(leftStr + " "), nextSibling);
			}
			else {
				parentNode.insertBefore(parentNode.ownerDocument.createTextNode(" "), nextSibling);
			}

			parentNode.insertBefore(scoreNode, nextSibling);
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	},
	
		
	addNumericScores: function addNumericScores(aDocument) {
		try {
			if (!pm_Prefs.isEnabled(pm_PrefKeys.SCORING_FEATURES_ENABLED)) {
				return;
			}
			
			var addNumber = pm_Prefs.isEnabled(pm_PrefKeys.SCORING_ADD_NUMBERS);
	
			// Continue if at least one of the features is enabled.
			if (!addNumber) {
				return;	
			}
			
			// Initialize rest of the variables.
			var colorNumber = pm_Prefs.isEnabled(pm_PrefKeys.SCORING_COLOR_NUMBERS);
			var scoreBase = pm_Prefs.getSetting(pm_PrefKeys.SCORING_BASE, 1);
			var colorType = pm_Prefs.getSetting(pm_PrefKeys.SCORING_NUMBER_COLOR_TYPE, 0);
			var disableLink = pm_Prefs.isEnabled(pm_PrefKeys.SCORING_DISABLE_LINK);
			
			if (colorType == pm_Scoring.RAINBOW_COLOR) {
				this.getScoreColor = this.getRainbowColor;
			}
			else if (colorType == pm_Scoring.GRADIENT_COLOR) {
				this.setGradientColors();
				this.getScoreColor = this.getGradientColor;
			}
			else {
				pm_Logger.logError('Unsupported color type: '+ colorType);
				this.getScoreColor = this.getRainbowColor;
			}
					
			// Loop through all anchor nodes.
			var nodes = aDocument.getElementsByTagName('a');
			pm_Logger.debug('nodes='+ nodes.length);

			var ignoredLinks = 0;
		
			for (var i=nodes.length - 1; i>=0; i--) {
				var node = nodes.item(i);
				var href1 = node.href;
			
				// Match to score link pattern.
				var matchList = href1.match(this.scoreUrlRegExp);
		
				// Is a match?
				if (matchList && matchList.length >= 2) {
					var scoreId = parseInt(matchList[1]) - 1;
					pm_Logger.debug("scoreId="+ scoreId);
					
					// Map the id to numeric score.
					var score = scoreId + parseInt(scoreBase);
					pm_Logger.debug('var score = '+ scoreId + " + " + scoreBase + " = " + score);
                    
					var scoreNode = aDocument.createElement('span');
					scoreNode.className = 'popomungo_score';
					
					// In color?
					if (colorNumber) {
						var colorObj = this.getScoreColor(scoreId);
						var bgColor = colorObj.bgColor;
						var textColor = colorObj.textColor;
						
						// Create colored, numeric score element.
						scoreNode.setAttribute('style', 'background: '+ bgColor +'; color: '+ textColor +';');
						scoreNode.appendChild(aDocument.createTextNode('\u00a0'+ score + '\u00a0'));
					} else {
						scoreNode.appendChild(aDocument.createTextNode('('+ score +')'));
					}

					// Insert element.
					this.insertScoreNode(scoreNode, node.parentNode, node.nextSibling);
					
					if (disableLink) {
						pm_Logger.debug("Disabling click");
						node.addEventListener('click', pm_Scoring.disableClickHandler, true);
						node.className = 'popomungo_disabled';
					}
				}
				else {
					ignoredLinks++;
				}
			}

			if (ignoredLinks) {
				pm_Logger.debug('ignored='+ ignoredLinks);
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	},
	
	
	/*
	 * This is just a pointer that is assigned by addNumericScores function.
	 */
	getScoreColor: function getScoreColor(scoreId) {
	},
	

	getRainbowColor: function getRainbowColor(scoreId)  {
		try {
			// Return previously calculated color.
			if (this._rainbowBgColors[scoreId]) {
				var bgColor = this._rainbowBgColors[scoreId];
				var textColor = this._textColors[bgColor];
	
				return new pm_TextColor(textColor, bgColor);
			} 
	
			// Calculate background color.
			var hue = 360 - 330 * (scoreId / this._maxScoreId);
	
			var rgbObj = pm_Color.convertHsvToRgb(hue, 1, 1);
			var bgColor = rgbObj.toHex();
			
			// Calculate foreground color.
			var textColor = pm_Color.idealTextColor(
				rgbObj.R, rgbObj.G, rgbObj.B);
			
			// Store colors.
			this._rainbowBgColors[scoreId] = bgColor;
			this._textColors[bgColor] = textColor;
			
			pm_Logger.debug("scoreId="+ scoreId +
				", textColor="+ textColor +
				", bgColor="+ bgColor);
	
			return new pm_TextColor(textColor, bgColor);
		}
		catch (err) {
			pm_Logger.logError(err);
		}
		
		return null;
	},
	
 	
	getGradientColor: function getGradientColor(scoreId)  {
		try {
			// Return previously calculated color.
			if (this._gradientBgColors[scoreId]) {
				var bgColor = this._gradientBgColors[scoreId];
				var textColor = this._textColors[bgColor];
	
				return new pm_TextColor(textColor, bgColor);
			}
			
			// Calculate background color.
			var ratio = scoreId / this._maxScoreId;
			var c = ratio; // alternative value: this.transform(ratio);
			
			pm_Logger.debug(
				'from='+ this._rgbBgColorFrom +
				', to='+ this._rgbBgColorTo +
				', ratio='+ ratio +
				', c='+ c);
	
			var r = this._rgbBgColorFrom.R + this._rDiff * c;
			var g = this._rgbBgColorFrom.G + this._gDiff * c;
			var b = this._rgbBgColorFrom.B + this._bDiff * c;
	
			var rgbObj = new pm_RGB(r.toFixed(0), g.toFixed(0), b.toFixed(0));
			var bgColor = rgbObj.toHex();
			
			// Calculate foreground color.
			var textColor = pm_Color.idealTextColor(
				rgbObj.R, rgbObj.G, rgbObj.B);
			
			// Store colors.
			this._gradientBgColors[scoreId] = bgColor;
			this._textColors[bgColor] = textColor;
			
			pm_Logger.debug("scoreId="+ scoreId +
				", textColor="+ textColor +
				", bgColor="+ bgColor);
	
			return new pm_TextColor(textColor, bgColor);
		}
		catch (err) {
			pm_Logger.logError(err);
		}
		
		return null;
	},
	
	
	setGradientColors: function setGradientColors() {
		try {
			var rgbFrom = pm_Prefs.getSetting(pm_PrefKeys.SCORING_NUMBER_GRADIENT_COLOR_FROM, "#000000");
			var rgbTo = pm_Prefs.getSetting(pm_PrefKeys.SCORING_NUMBER_GRADIENT_COLOR_TO, "#FFFFFF");
			
			this._rgbBgColorFrom = pm_RGB.parseHex(rgbFrom);
			this._rgbBgColorTo = pm_RGB.parseHex(rgbTo);
	
			this._rDiff = this._rgbBgColorTo.R - this._rgbBgColorFrom.R;
			this._gDiff = this._rgbBgColorTo.G - this._rgbBgColorFrom.G;
			this._bDiff = this._rgbBgColorTo.B - this._rgbBgColorFrom.B;
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	},
	
	/*
	 * S curve function for reducing the mid-colors.
	 * 
	 * x = [0,1]
	 * y = [0,1]
	 */
	transform: function transform(x) {
		return (1/(1+Math.exp(20*(-2*x+1)))+4*x)/5;
	},
 	
	toString: function toString() {
		return "[object pm_Scoring]";
	}	
};
