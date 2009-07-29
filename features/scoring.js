/**
 * scoring.js
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
	
	MAX_SCORED_ID: 26,
	
	_insertBefore: [" ", ".", ",", "!", "?", ":"],
	
	_selectUpperNodeFor: { 
		"A": true,
		"B": true,
		"BR": false,
		"I": true
	},
	
	SCORE_ON_CITY_PAGE_XPATH: '/html/body/table[3]/tbody/tr/td[1]/table/tbody/tr/td/a[1]',
	
	SCORE_NUMBER_REGEXP: /\&word=(.*)/i,
	
	RULES_PAGE: 'rules.asp',
	
	SCORING_ACTION: 'action=scoring&',
	
	colorNumber: false,
	scoreBase: 0,
	disableLink: false,

	
	handleEvent: function handleEvent(e) {
		try {
			var target = e.target;
			
			if (!(target instanceof HTMLAnchorElement)) {
				target = target.parentNode;
				
				if (!(target instanceof HTMLAnchorElement)) {
					return true;
				}
			}
			
			switch (e.type) {
			case "click":
				var pathname = target.pathname.toLowerCase();

				if (pathname.indexOf(this.RULES_PAGE) > -1) {
					var search = target.search.toLowerCase();
					
					if (search.indexOf(this.SCORING_ACTION) > -1) {
						pm_Logger.debug("Click event blocked");
						e.stopPropagation();
						e.preventDefault();
						return false;
					}
				}
				break;
				
			default:
				pm_Logger.logError("Unexpected event: "+ e.type);
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}
		
		return true;
	},


	getScoreInsertionPosition: function getScoreInsertionPosition(nodeValue) {
		var insertPos = -1;

		try {
			var charPos; 
			
			for (var i = this._insertBefore.length - 1; i > -1; i--) {
				charPos = nodeValue.indexOf(this._insertBefore[i]);
				
				if (charPos >= 0) {
					if (insertPos == -1) {
						insertPos = charPos;
					} else {
						insertPos = Math.min(insertPos, charPos);
					}
				}
			}

			if (insertPos == -1) {
				insertPos = 0;
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}

		return insertPos;
	},
	
	
	insertScoreNode: 
	function insertScoreNode(aScoreNode, aParentNode, aNextSibling) 
	{		
		/*
		 * On character page (in Swedish):
		 * Hank Hill  ?r en <b>fl?rtig</b> person med <b>\
		 * <a href="Rules.asp?action=Scoring&Word=18" title="ypperlig 17/26">\
		 * ypperlig</a> utstr?lning</b> och <b>\
		 * <a href="Rules.asp?action=Scoring&Word=20" title="himmelsk 19/26">\
		 * himmelsk</a>t utseende</b>. Den totala kapaciteten av Hanks \
		 * hj?rnceller ger en <b><a href="Rules.asp?action=Scoring&Word=22" \
		 * title="makal?s 21/26">makal?s</a> IQ</b>. Hank har en <b>\
		 * <a href="Rules.asp?action=Scoring&Word=17" title="underbar 16/26">\
		 * underbar</a> s?ngr?st</b> och uppvisar <b>\
		 * <a href="Rules.asp?action=Scoring&Word=22" title="makal?s 21/26">\
		 * makal?s</a> musikalisk talang</b>.
		 * 
		 * A diary entry (in Swedish):
		 * <a href="CharacterDetails.asp?action=view&CharacterID=123">\
		 * <b>Hank Hill </b></a> ringde mig f?r att ha ett <b>\
		 * <a href="Rules.asp?action=Scoring&Word=22" title="makal?s 21/26">\
		 * makal?s</a></b>t "privat" samtal.
		 * 
		 * A diary entry (in German):
		 * <div style="Padding-bottom:5px;">\
		 * Ersch?pft, aber voller Gl?ck erreichten \
		 * <a href="CharacterDetails.asp?action=view&CharacterID=98578">\
		 * <b>Mikhailov Jerayesh</b></a> und ich endlich den H?hepunkt, \
		 * zufrieden nach unserer <b>\
		 * <a href="Rules.asp?action=Scoring&Word=20" title="wundervoll 19/26">\
		 * wundervoll</a></b>en tantrischen Nacht miteinander. </div>
		 * 
		 * A locale page (in German):
		 * Qualit?t:  <b><a href="Rules.asp?action=Scoring&Word=20" \
		 * title="wundervoll 19/26">wundervoll</a></b><br />
		 */
		try {
			var nextSibling = aNextSibling;
			var parentNode = aParentNode;
			
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

			parentNode.insertBefore(aScoreNode, nextSibling);
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	},
	
	
	_getPrefs: function _getPrefs() {
		this.colorNumber = pm_Prefs.isEnabled(pm_PrefKeys.SCORING_COLOR_NUMBERS);
		this.scoreBase = pm_Prefs.getPref(pm_PrefKeys.SCORING_BASE, 1);
		this.disableLink = pm_Prefs.isEnabled(pm_PrefKeys.SCORING_DISABLE_LINK);
		var colorType = pm_Prefs.getPref(pm_PrefKeys.SCORING_NUMBER_COLOR_TYPE, 0);
		
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
	},
	
		
	addNumericScores: function addNumericScores(aDocument) {
		try {
			var addNumber = pm_Prefs.isEnabled(pm_PrefKeys.SCORING_ADD_NUMBERS);
			// Continue if at least one of the features is enabled.
			if (!addNumber) {
				return;	
			}
			
			// Loop through all anchor nodes.
			var nodes = aDocument.getElementsByTagName('a');

			this._addNumericScoresOnLinkNodes(aDocument, nodes);
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	},

	
	addNumericScoresOnCityPage: function addNumericScoresOnCityPage(aDocument) {
		try {
			var addNumber = pm_Prefs.isEnabled(pm_PrefKeys.SCORING_ADD_NUMBERS);
			
			// Continue if at least one of the features is enabled.
			if (!addNumber) {
				return;	
			}

			var node = pm_XPathFirstNode(this.SCORE_ON_CITY_PAGE_XPATH, aDocument);
			var nodes = [node];

			this._addNumericScoresOnLinkNodes(aDocument, nodes);
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	},

	
	_addNumericScoresOnLinkNodes: function _addNumericScoresOnLinkNodes(aDocument, aNodes) {
		try {
			var addNumber = pm_Prefs.isEnabled(pm_PrefKeys.SCORING_ADD_NUMBERS);
	
			// Continue if at least one of the features is enabled.
			if (!addNumber) {
				return;	
			}
			
			// Initialize rest of the variables.
			this._getPrefs();
			
			// Disable link.
			if (this.disableLink) {
				pm_Logger.debug("install click event handler");
				aDocument.body.addEventListener('click', this, true);
			}

			var processedLinks = 0;
		
			pm_Logger.debug('nodes='+ aNodes.length);

			for (var i = aNodes.length - 1; i > -1; i--) {
				var node = aNodes[i];
				if (this._addScoreNumberOnLink(aDocument, node))
					++processedLinks;
			}

			pm_Logger.debug('processed='+ processedLinks);
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	},
	

	_addScoreNumberOnLink: function _addScoreNumberOnLink(aDocument, aNode) {
		try {
			var pathname = aNode.pathname.toLowerCase();

			if (pathname.indexOf(this.RULES_PAGE) > -1) {
				var search = aNode.search.toLowerCase();

				if (search.indexOf(this.SCORING_ACTION) > -1) {
					// Match to score link pattern.
					var matchList = search.match(this.SCORE_NUMBER_REGEXP);
			
					// Is a match?
					if (matchList) {
						var scoreId = parseInt(matchList[1]) - 1;
						//pm_Logger.debug("scoreId="+ scoreId);
						
						// Map the id to numeric score.
						var score = scoreId + parseInt(this.scoreBase);
						
						var scoreNode = aDocument.createElement('span');
						scoreNode.className = 'popomungo_score';
						
						// In color?
						if (this.colorNumber) {
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
						this.insertScoreNode(scoreNode, aNode.parentNode, aNode.nextSibling);
						
						return true;
					}
				}
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}
		
		return false;
	},
	
	
	/**
	 * This is just a pointer that is assigned by addNumericScores function.
	 */
	getScoreColor: function getScoreColor(scoreId) {
		// no code here
	},
	

	getRainbowColor: function getRainbowColor(scoreId)  {
		try {
			var bgColor;
			var textColor;
			
			// Return previously calculated color.
			if (this._rainbowBgColors[scoreId]) {
				bgColor = this._rainbowBgColors[scoreId];
				textColor = this._textColors[bgColor];
	
				return new pm_TextColor(textColor, bgColor);
			} 
	
			// Calculate background color.
			var hue = 360 - 330 * (scoreId / this.MAX_SCORED_ID);
	
			var rgbObj = pm_Color.convertHsvToRgb(hue, 1, 1);
			bgColor = rgbObj.toHex();
			
			// Calculate foreground color.
			textColor = pm_Color.idealTextColor(
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
			var bgColor;
			var textColor;
			
			// Return previously calculated color.
			if (this._gradientBgColors[scoreId]) {
				bgColor = this._gradientBgColors[scoreId];
				textColor = this._textColors[bgColor];
	
				return new pm_TextColor(textColor, bgColor);
			}
			
			// Calculate background color.
			var ratio = scoreId / this.MAX_SCORED_ID;
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
			bgColor = rgbObj.toHex();
			
			// Calculate foreground color.
			textColor = pm_Color.idealTextColor(
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
	
	/**
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
