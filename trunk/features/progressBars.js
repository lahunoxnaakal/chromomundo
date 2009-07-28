/**
 * progressBars.js
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

var pm_ProgressBars = {
	
	barImagesXpath: '//img',
	
	barImgRegexp: /graphics\/(.*?)\/progressbar\/stapel_(gron|bla|rosa|guld|blixt).gif/i,
	
	imagePaths: {
		'vit': 'graphics/Default/progressbar/stapel_vit.gif',
		'ljusbla': 'graphics/Default/progressbar/stapel_ljusbla.gif', 
		'rosa': 'graphics/Default/progressbar/stapel_rosa.gif',
		'bla': 'graphics/Default/progressbar/stapel_bla.gif',
		'gron': 'graphics/Default/progressbar/stapel_gron.gif',
		'guld':	'graphics/Default/progressbar/stapel_guld.gif',
		'blixt': 'graphics/Default/progressbar/stapel_blixt.gif',
		'theme': 'Default'
	},
	
	fontSize: '10',
	
	fontWeight: 'normal',

	PROGRESSBAR_WIDTH: 50,
	
	PROGRESSBAR_HEIGHT: 10,
	
	DEFAULT_REGEXP: /(\d+%?)/,

	PERCENTAGE_REGEXP: /(\d+%)/,

	WITH_MINUS_SIGN_REGEXP: /(\-?\d+%?)/,
	
	WITH_DECIMALS_REGEXP: /(\d+[.,]?\d*%?)/,
	
		
	/**
	 * Add the image value as text overlay on the images.
	 * 
	 * @param {Document} aDocument 
	 * @param {RegExp} aTitleRegexp 
	 */
	addTextOverStats: function addTextOverStats(aDocument, aTitleRegexp) {
		try {
			if (!pm_Prefs.isEnabled(pm_PrefKeys.PROGRESSBARS_SHOW_PROGRESSBAR_VALUES)) {
				return;
			}

			this.setFontStyle();

			var xpResult = pm_XPathOrderedSnapshot(this.barImagesXpath, aDocument);
	
			pm_Logger.debug('images='+ xpResult.snapshotLength);

			for (var i = xpResult.snapshotLength - 1; i > -1; i--) {
				var img1 = xpResult.snapshotItem(i);
				
				if (!img1.src.match(this.barImgRegexp)) {
					continue;
				}
				
				var parentNode1 = img1.parentNode;

				var title;
				var matchResult;
				
				if (aTitleRegexp) {
					matchResult = img1.title.match(aTitleRegexp);
				} else {
					matchResult = img1.title.match(this.DEFAULT_REGEXP);
				}					
					
				if (matchResult && matchResult.length > 1) {
					title = matchResult[1];
				} else {
					title = img1.title;
				}

				var span1 = this.getTextOverlay(
					aDocument, img1, title, (2 + (i % 2)));
	
				parentNode1.insertBefore(span1, img1.previousSibling);
			}	
		} catch (err) {
			pm_Logger.logError(err);
		}
	},


	addTextOverTicketSalesBars: function addTextOverTicketSalesBars(aDocument) {
		try {
			var addSoldTickets = pm_Prefs.isEnabled(pm_PrefKeys.PROGRESSBARS_ADD_SOLD_TICKETS_COUNT);
			var addSoldTicketsPercent = pm_Prefs.isEnabled(pm_PrefKeys.PROGRESSBARS_ADD_SOLD_TICKETS_PERCENTAGE);

			if (!(addSoldTickets || addSoldTicketsPercent)) {
				return;
			}
	
			var xpResult = pm_XPathOrderedSnapshot(this.barImagesXpath, aDocument);
			var numRegExp = /(\d+)\s+\/\s+(\d+)/;
	
			pm_Logger.debug('images='+ xpResult.snapshotLength);
	
			for (var i=xpResult.snapshotLength - 1; i > -1; i--) {
				var img1 = xpResult.snapshotItem(i);

				if (!img1.src.match(this.barImgRegexp)) {
					continue;
				}
				
				var parentNode1 = img1.parentNode;

				var span1 = aDocument.createElement('span');
				span1.className = 'popomungo_bar_overlay_for_shows';
				span1.setAttribute('style', 'top: -'+ (img1.height + 2) +'px');
	
				var matchResult = img1.title.match(numRegExp);

				if (matchResult && matchResult.length == 3) 
				{
					if (addSoldTickets && addSoldTicketsPercent) {
						span1.appendChild(aDocument.createTextNode(
							matchResult[1] +'\u00a0('+ (matchResult[1]*100/matchResult[2]).toFixed(0) + '%)'));
					} 
					else if (addSoldTickets) 
					{
						span1.appendChild(aDocument.createTextNode(
							matchResult[1]));
					} 
					else 
					{
						span1.appendChild(aDocument.createTextNode(
							(matchResult[1]*100/matchResult[2]).toFixed(0) + '%'));
					}
				} 
				else 
				{
					// Fallback to the image title, if match failed.
					span1.appendChild(aDocument.createTextNode(img1.title));
				}				
				
				var div1 = aDocument.createElement('div');
				div1.className = 'popomungo_overlay_container';
				div1.appendChild(span1);

				parentNode1.insertBefore(div1, parentNode1.firstChild);

				pm_Logger.debug(i + ': '+ img1.title);
			}	
		} catch (err) {
			pm_Logger.logError(err);
		}
	},
	
	/**
	 * Create a text overlay.
	 * 
	 * @param {Document} aDocument
	 * @param {HTMLImageElement} img1
	 * @param {String} title
	 * @param {Number} zIndex Layer index
	 * @return text overlay
	 * @type Node
	 */
	getTextOverlay: function getTextOverlay(aDocument, img1, title, zIndex) {
		try {
			//var leftPos = img1.x;
			//var topPos = img1.y;
			var height = img1.height - 1;
			var width = img1.width;
			
			var spanStyle = 

				//'left: '+ leftPos +
				//'px; top: '+ topPos +'px; ' +

				'width: '+ width +
				'px; line-height: '+ height +
				'px; font-size: '+ this.fontSize +
				'px; font-weight: '+ this.fontWeight + 
				'; z-index: '+ zIndex;

			pm_Logger.debug('style='+ spanStyle +', title='+ title);

			var span1 = aDocument.createElement('span');
			span1.className = 'popomungo_bar_overlay';
			span1.setAttribute('style', spanStyle);
			span1.setAttribute('title', img1.title || title);
			span1.appendChild(aDocument.createTextNode(title));

/*
			var div1 = aDocument.createElement('div');
			div1.setAttribute('class', 'popomungo_overlay_container');
			//div1.setAttribute('style', spanStyle);
			div1.appendChild(span1);
*/

			return span1;
		} catch (err) {
			pm_Logger.logError(err);
		}
		
		return null;
	},

	
	setProgressBarImagePaths: function setProgressBarImagePaths(aDocument) {
		var theme = pm_Styles.getTheme(aDocument);
		
		if (theme && 
			theme != this.imagePaths['theme'])
		{
			var oldTheme = '/'+ this.imagePaths['theme'] + '/';

			this.imagePaths['theme'] = theme;

			theme = '/'+ theme + '/';
			
			for (var i in this.imagePaths) {
				this.imagePaths[i] = this.imagePaths[i].replace(oldTheme, theme);
				
				pm_Logger.debug(i +'='+ this.imagePaths[i]);
			}
		}	
	},


	getProgressBar: function getProgressBar(aDocument, value, max) {
		try {
			this.setProgressBarImagePaths(aDocument);
			this.setFontStyle();
			
			var container = aDocument.createElement('span');
			container.className = 'popomungo_progressbar';

			var img1 = aDocument.createElement('img');
			img1.src = this.imagePaths['vit'];
			img1.width = 1;
			img1.height = this.PROGRESSBAR_HEIGHT;
			container.appendChild(img1);
			
			var img2 = null;
			var text2 = '';
			
			if (value == 0) {
				img2 = aDocument.createElement('img');
				img2.src = this.imagePaths['ljusbla'];
				img2.width = this.PROGRESSBAR_WIDTH;
				img2.height = this.PROGRESSBAR_HEIGHT;
				
				text2 = this.getTextOverlay(aDocument, img2, '0%', 2);
				text2.style.textAlign = 'left';
				
				container.appendChild(text2);
				container.appendChild(img2);
			}
			else if (value == max) {
				img2 = aDocument.createElement('img');				img2.src = this.imagePaths['guld'];
				img2.width = this.PROGRESSBAR_WIDTH;
				img2.height = this.PROGRESSBAR_HEIGHT;
				
				text2 = this.getTextOverlay(aDocument, img2, '100%', 2);
				
				container.appendChild(text2);
				container.appendChild(img2);
			}
			else {
				var ratio = value / max * 100;
				var img2Width = Math.ceil(value / max * this.PROGRESSBAR_WIDTH);
				var img3Width = this.PROGRESSBAR_WIDTH - img2Width;
				var imgColor;
				
				if (ratio < 30) {
					imgColor = 'rosa';
				}
				else if (ratio < 70) {
					imgColor = 'bla';
				}
				else {
					imgColor = 'gron';
				}

				img2 = aDocument.createElement('img');
				img2.src = this.imagePaths[imgColor];
				img2.width = img2Width;
				img2.height = this.PROGRESSBAR_HEIGHT;

				var img3 = aDocument.createElement('img');
				img3.src = this.imagePaths['ljusbla'];
				img3.width = img3Width;
				img3.height = this.PROGRESSBAR_HEIGHT;

				text2 = this.getTextOverlay(aDocument, img2, ratio.toFixed(0) +'%', 2);
				
				container.appendChild(text2);
				container.appendChild(img2);
				container.appendChild(img3);
			}

			var img4 = aDocument.createElement('img');
			img4.src = this.imagePaths['vit'];
			img4.width = 1;
			img4.height = this.PROGRESSBAR_HEIGHT;

			container.appendChild(img4);
			container.appendChild(aDocument.createTextNode('\u00a0'));
			
			return container;
		}
		catch (err)	 {
			pm_Logger.logError(err);
		}
		
		return null;
	},
	

	setFontStyle: function setFontStyle() {
		this.fontSize = pm_Prefs.getSetting(pm_PrefKeys.PROGRESSBARS_FONT_SIZE, '10');
		this.fontWeight = pm_Prefs.getSetting(pm_PrefKeys.PROGRESSBARS_FONT_WEIGHT, 'normal');
	},
	
	
	identifyUndefinedCharacterDetailsPage:
	function identifyUndefinedCharacterDetailsPage(doc) {
		try {
			var forms = doc.getElementsByTagName("form");
			
			if (forms && forms.length > 0) {
				var action = forms[0].elements.namedItem('action').value.toLowerCase();
				pm_Logger.debug('action='+ action);
					
				/* form name=folderForm
				 *   Relations          - Relationships
				 *   Family             - Family
				 *   Apprentices        - Apprentices
				 *   RelationShipTrivia - (VIP) Trivia
				 *   CharacterWill      - (VIP) Character Will
				 */
				return action;
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}
		
		return undefined;
	}
};
