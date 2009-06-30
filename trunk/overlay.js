/*
 * overlay.js
 * Copyright (c) 2007 Tommi Rautava
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

function PopomungoOverlay() {
	this.localeStrings = undefined;
	
	this.requestCount = 0;
	
	this.listenerEnabled = false;
	
	this.ignoredPages = {
		'cn': true,
		'defaultconf': true,
		'defaultconfv2': true,
		'forumtop': true,
		'gazette': true,
		'menuforum': true,
		'performancelive': true,
		'wallpaper': true
	}
	

	this.handleContent = function handleContent(aDocument) {
		try {
			var date1 = new Date();
			var path1 = aDocument.location.pathname;
			var query1 = aDocument.location.search;

			this.requestCount++;
			
			pm_Logger.debug("Request #"+ this.requestCount
				+"\nhref="+ aDocument.location.href +
				"\npath="+ path1 +
				"\nquery="+ query1);

			// Remove frames
			if (path1 == '/common/index.html' && 
				pm_Logger.getTraceLevel()) 
			{
				var frame1 = aDocument.getElementsByTagName('frame')[0];
				if (frame1.src) {
					pm_Logger.debug('Redirecting to '+ frame1.src);
					aDocument.location.replace(frame1.src);
				}
				return;
			}

			var page, action, action2, result;

			var result = path1.match(/\/([a-z0-9]+)\.asp/i);
			if (result) {
				page = result[1].toLowerCase();
			}
			
			result = query1.match(/[?&]action=([a-z0-9]+)/i);
			if (result) {
				action = result[1].toLowerCase();
			}

			result = query1.match(/[?&]action2=([a-z0-9]+)/i);
			if (result) {
				action2 = result[1].toLowerCase();
			}

			pm_Logger.debug("Request #"+ this.requestCount +
				"\npage="+ page +
				"\naction="+ action +
				"\naction2="+ action2);

			var processLinksEnabled = true;
	
			if (page == undefined) {
				pm_Logger.debug('Page undefined.');
				return;
			}
			else if (page == 'entry') {
				if (action == 'logout' ||
					action == 'sessiontimeout') 
				{
					pm_UserSettings.LoggedOut(aDocument);
					pm_Logger.debug('Logged out.');
					return;
				}
				else if (action == undefined) {
					pm_Logger.debug('Not logged in.');
					return;
				}
			}
			else if (page == 'credits') {
				pm_UserSettings.LoggedOut(aDocument);
				pm_Logger.debug('Logged out.');
				return;
			}
			else if (this.ignoredPages[page]) {
				pm_Logger.debug('Page ignored.');
				return;				
			}
			else if (page == 'choosecharacter') {
				if (pm_UserSettings.charId) {
					pm_UserSettings.LoggedOut(aDocument);
				}
				
				pm_Styles.appendCSS(aDocument);
				pm_ProgressBars.addTextOverStats(aDocument);
				return;
			}

			var charId = pm_UserSettings.getCharacterId(aDocument);
		
			if (charId) {
				// Save the current character. 
				pm_Prefs.setPref(pm_PrefKeys.CURRENT_CHARACTER, charId);
				
				var langId = pm_UserSettings.autoDetectLanguageFromPage(aDocument);
				
				pm_Strings.InitStringBundle(langId);
				
				pm_Logger.debug("Pre-tasks");

				pm_Styles.appendCSS(aDocument);
		
				pm_Logger.debug("Main-tasks");

				if (page == 'city') {
					if (action == 'online') {
					}
					else {
						pm_UserSettings.updateSettingsFromCityPage(aDocument);
						//pm_Traveling.addRouteInfoOnCityPage(aDocument);
						pm_Locales.addLocaleIcons(aDocument);
					}
				}
				else if (page == 'user') {
					if (action == 'update') {
						pm_UserSettings.updateSettingsOnLoad(aDocument);
					}
				}
				else if (page == 'performances') {
					if (action == undefined) {
						action = pm_Performances.identifyUndefinedPerformancesPage(aDocument);
					}
					
					if (action == 'arrangements') {
						pm_Performances.processArrangements(aDocument);
					} else if (action == 'readperformance') {
						pm_Performances.addTicketSalesStatistics(aDocument);
					} else if (action == 'citiesplayed') {
						pm_Performances.addSoldTicketsOnCitiesPage(aDocument);
					} else if (action == 'viewperformances') {
						pm_Performances.addSoldTicketsOnShowsPage(aDocument, false);
					} else if (action == 'clubcancelshow') {
						pm_Performances.processArrangements(aDocument);
					} else {
						// comingperformances clearallsetlists
						// accept confirmdiscardp setcancelperformance 
						pm_Performances.addSoldTicketsOnShowsPage(aDocument, true);
						pm_Company.highlightCeoLocale(aDocument);
					}
				}
				else if (page == 'performancedetails') {
					// nextshow defaultsetlist viewperformance addsong
					// addaction removeaction
					pm_ProgressBars.addTextOverStats(aDocument, pm_ProgressBars.WITH_MINUS_SIGN_REGEXP);
				}
				else if (page == 'company') {
					if (action == 'shows' && 
						!action2) 
					{
						pm_ProgressBars.addTextOverTicketSalesBars(aDocument);
						pm_Performances.addTicketSalesTotalOnClubShowsPage(aDocument);
					} else if (action == 'restock') {
						pm_Products.highlightEmptyStockOnRestock(aDocument);
					} else if (action == 'manageproducts' ||
						action == 'deleteproductconfirm') 
					{
						pm_Products.highlightEmptyStockOnManageProducts(aDocument);
					} else if (action == undefined) {
						pm_Products.highlightEmptyStockIfFormPage(aDocument);
					}
					// SetBidLocale
				}
				else if (page == 'characterdetails') {
					if (action == undefined) {
						action = pm_ProgressBars.identifyUndefinedCharacterDetailsPage(aDocument);
					}

					pm_UserSettings.updateSettingsFromCharacterPage(aDocument);
					//pm_Traveling.replaceWithLocalizedRouteNameOnPage(aDocument);

                    /*
					if (action == 'view' || 
						action == undefined) 
					{
						pm_Comparison.processCharacterSheet(aDocument);
					}
					else if (action == 'buddylist' ||
						action == 'deletefriend') 
					{
						pm_Friends.highlightCityOnBuddyList(aDocument);
					}
					else if (action == 'relations' ||
						action == "abandonattachment") 
					{
						pm_Friends.highlightCityOnRelationsPage(aDocument);
					}
					*/
					if (action == 'myskills' ||
						action == 'selectskill') {
						pm_ProgressBars.addTextOverStats(aDocument, pm_ProgressBars.PERCENTAGE_REGEXP);
					}
					else if (action == "apprentices" ||
						action == "removemaster" ||
						action == "removeapprentice") {
						pm_ProgressBars.addTextOverStats(aDocument, pm_ProgressBars.WITH_DECIMALS_REGEXP);
					}
					else {
						pm_ProgressBars.addTextOverStats(aDocument);
					}

					// viewitems wear takeoff drop undress distributeexp
					// setpanda +myskills Influences ViewAssets Miscellaneous 
					// Photos Achievements CharacterPic Messages Calendar 
					// CurrencyConverter WorldClock readmessage AnswerMessage
					// +SelectSkill
				}
				else if (page == 'telephone') {
					pm_ProgressBars.addTextOverStats(aDocument);
					//pm_Friends.highlightCityOnPhoneBook(aDocument);

					// undefined phonebook SendMessage OnlineShopping BookMarks 
					// NotePad Instructions FillCash Dial DeleteBM
				}
                /*
				else if (page == 'tribes') {
					if (action == 'members') {
						pm_Friends.highlightCityOnTribeMembersList(aDocument);
					}
					
					// undefined TribeInfo Competitions Charts
				}
                                           */
				else if (page == 'interact') {
					//pm_Interaction.sortInteractionChoises(aDocument);
					pm_ProgressBars.addTextOverStats(aDocument);
				}
				else if (page == 'relationshipdetails') {
					pm_ProgressBars.addTextOverStats(aDocument);
				}                
				else if (page == 'artist') {
					/*if (action == undefined ||
						action == 'view')
					{
						pm_Traveling.replaceWithLocalizedRouteNameOnPage(aDocument);
					}*/

					// viewrepertoire popularity stagenames
					// setrepertoirepractise viewartistsong confirmdiscardas
					pm_ProgressBars.addTextOverStats(aDocument, pm_ProgressBars.WITH_MINUS_SIGN_REGEXP);
 				}
				else if (page == 'bookings') {
					if (action == undefined ||
						action == 'setdelete')
					{
						pm_Performances.addSoldTicketsOnSchedulePage(aDocument);
					}
					// QuickBook, SearchBookings, SearchJams, SearchStudio, Delete
				}
				else if (page == 'song') {
					// viewunfinished view viewsong deletesongconfirmed
					// setworkonsong undefined
					pm_ProgressBars.addTextOverStats(aDocument);
				}
				else if (page == 'track') {
					// undefined viewtrack
					pm_ProgressBars.addTextOverStats(aDocument);
				}
				else if (page == 'toursettings') {
					pm_ProgressBars.addTextOverStats(aDocument);
					
                    /*
					if (action == 'transport' ||
						action == 'addtransport' ||
						action == 'canceltransport') 
					{
						pm_Traveling.addTravelTimesOnTransportPage(aDocument);
						pm_Traveling.replaceWithLocalizedRouteNameOnPage(aDocument);
					}
					else if (action == 'equipment') {
						processLinksEnabled = false;
					}*/
				}
				else if (page == 'artistranking') {
					// undefined
					pm_ProgressBars.addTextOverStats(aDocument);
				}
				else if (page == 'movies') {
					// viewmovie
					pm_ProgressBars.addTextOverStats(aDocument);
				}
				else if (page == 'locale') {
					// cmd=confirmexchange (tour bus exchange)
					// viewshop useskills viewcharacters viewworkers
					pm_ProgressBars.addTextOverStats(aDocument);
					/*if (action == 'view' || 
						action == undefined) 
					{
						pm_Traveling.addRouteInfoOnHighwayLocalePage(aDocument);
					}*/					
				}
				else if (page == 'competition') {
					if (action == 'schedule' ||
						action == 'deleteinvite' ||
						action == 'addopeninvite' ||
						action == 'setinviteartist')
					{
						pm_Competitions.colorizeCompetitionEntries(aDocument);
					}
				}
				else if (page == 'distributeexp') {
					pm_ProgressBars.addTextOverStats(aDocument);
				}
				else if (page == 'charts') {
					if (action == 'paparazzilist') {
						//pm_Friends.highlightCityOnPaparazziList(aDocument);
					}
					else if (action == 'topstarquality' ||
						action == 'artistrankings' ||
						action == 'topgenres') 
					{
						pm_ProgressBars.addTextOverStats(aDocument);
					}
				}
				else if (page == 'charactervehicles')
				{
					if (action == 'viewvehicle' ||
						action == 'transferitem' ||
						action == 'pickupitem')
					{
						pm_ProgressBars.addTextOverStats(aDocument);
					}
				}
				else {
					pm_Logger.debug("No actions");
				}
				// CharacterDiary/view
				// CharacterBlog/ReadBlog CreateBlogEntry

				pm_Logger.debug("Post-tasks");

				pm_Scoring.addNumericScores(aDocument);
				
				if (processLinksEnabled) {
					pm_Links.processLinks(aDocument);
				}
			}
			else {
				pm_Logger.debug("Character ID is not available.");
			}

			var date2 = new Date();
			var ms = date2.getTime() - date1.getTime();
			pm_Logger.debug('Request #'+ this.requestCount +
				' rendering took '+ ms +' milliseconds');
		}
		catch (err)
		{
			pm_Logger.logError(err);
		}
	};
	

	this.isPopmundoDomain = function isPopmundoDomain(aDocument) {
		if (aDocument.location ) {
			return (null != aDocument.location.href.match(/^.*\.(popmundo|popomundo)\.com/i));
		}
		
		return false;
	};
	

	this.isPageLoadError = function (aDocument) {
		return (aDocument.documentURI.substr(0,14) == "about:neterror"); 		
	},


	this.onPageLoad = function onPageLoad(event) {
		if (event.originalTarget.nodeName == '#document') {
			var vDocument = event.originalTarget;
			
			if (this.isPopmundoDomain(vDocument) &&
				!this.isPageLoadError(vDocument))
			{
				this.handleContent(vDocument);
	      	}
	    }	    
	};

	
	this.handleEvent = function handleEvent(event) {
		switch (event.type) {
			case "DOMContentLoaded": 
				this.onPageLoad(event);
				break;
			case "load":
				this.init();
				break;
			case "unload":
				this.deinit();
				break;
			default: 
				pm_Logger.logError("Unexpected event: "+ event.type);
		}		
	};


	this.init = function init() {
		this.logExtensionInfo();
		
		this.refreshUI();
	};
	
	
	this.deinit = function deinit() {

	};
	
	
	this.dateFormatSettingIsOutOfDate = function dateFormatSettingIsOutOfDate(dateFormatTypeId) {
		if (dateFormatTypeId) {
			pm_Prefs.setPref(pm_PrefKeys.DATE_FORMAT_TYPE_ID, dateFormatTypeId);
		}
	};
	
	this.logExtensionInfo = function logExtensionInfo() {
	}
	
	this.refreshUI = function refreshUI() {
		pm_Logger.setTraceLevelFromPref();
		var enabled = pm_Prefs.getPref(pm_PrefKeys.ENABLED, true);

		return enabled;		
	};

	
	this.toggleEnabled = function toggleEnabled() {
		// Toggle state.
		var enabled = !pm_Prefs.getPref(pm_PrefKeys.ENABLED, true);
		
		// This triggers observe function.
		pm_Prefs.setPref(pm_PrefKeys.ENABLED, enabled);
		
		return enabled;
	};
	

	this.setListener = function setListener(aEnabled) {
		var appcontent = document.getElementById("appcontent");
		
		if (appcontent) {
			this.localeStrings = document.getElementById("popomungo.locale.stringbundle");
			
			if (aEnabled && !this.listenerEnabled) {
				this.listenerEnabled = true;
				pm_Logger.debug("Add DOMContentLoaded listener");
				appcontent.addEventListener("DOMContentLoaded", this, true);
			} else if (!aEnabled && this.listenerEnabled) {
				this.listenerEnabled = false;
				pm_Logger.debug("Remove DOMContentLoaded listener");
				appcontent.removeEventListener("DOMContentLoaded", this, true);				
			} else {
				pm_Logger.debug('DOMContentLoaded listener enabled='+ this.listenerEnabled);
			}			
		}
	};

	/**
	 * Observe preferences.
	 */
	this.observe = function observe(aSubject, aTopic, aData)
	{
		pm_Logger.debug('topic='+ aTopic +', data='+ aData);
		
		if (aTopic == 'nsPref:changed') {
			this.refreshUI();
		}
	};

	this.toString = function toString() {
		return "[object PopomungoOverlay]";
	};
};

console.log("Popomungo: page loaded!");
var pm_Overlay = new PopomungoOverlay();
pm_Overlay.handleContent(document);
//window.addEventListener("unload", pm_Overlay, false);
//window.addEventListener("load", pm_Overlay, false);

///////////////////////////////////////////////////////////////////////
// EOF
///////////////////////////////////////////////////////////////////////
