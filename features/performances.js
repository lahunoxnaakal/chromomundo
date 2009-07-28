/**
 * performances.js
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

var pm_Performances = {
	
	SHOW_CANCELLABLE_LIMIT: 7,
	
	DAYS_TO_SELL_MAX: 56,
	
	MILLISECONDS_PER_DAY: 86400000,
	
	CLUB_MAX_TICKET_LIMIT: 10000,
	
	_arrangementsXpathBase: 
		'/html/body/table[last()]/tbody/tr/td[1]/div[3]/table/tbody',
	
	performancesPageRegExp: 
		/\/performances\.asp\?action=arrangements&/i,
		
	ticketSalesStatisticsXpath:
		'/html/body/table[last()]/tbody/tr/td[1]/div[3]/table[1]/tbody',
		
	totalTicketSalesOnShowsPageXpath:
		'/html/body/table[last()]/tbody/tr/td[1]/div[3]',

	dataRowsOnShowsPageXpath:
		'/html/body/table[last()]/tbody/tr/td[1]/div[3]/table[1]/tbody/tr',	

	totalTicketSalesOnSchedulePageXpath:
		'/html/body/table[last()]/tbody/tr/td[1]',
	
	ticketSalesOnSchedulePageXpath:
		'/html/body/table[last()]/tbody/tr/td[1]/table[2]/tbody/tr/td[3]/a[2]',
		
	totalTicketSalesOnCitiesPageXpath:
		'/html/body/table[last()]/tbody/tr/td[1]/div[3]',

	ticketSalesOnCitiesPageXpath:
		'/html/body/table[last()]/tbody/tr/td[1]/div[3]/table/tbody/tr/td[4]',

	totalIncomeTargetXpath: 
		'/html/body/table[last()]/tbody/tr/td[1]/table[2]/tbody/tr/td',
	
	dataRowsOnClubShowsPageXpath: 
		'/html/body/table[last()]/tbody/tr/td[1]/table[2]/tbody/tr/td/table/tbody/tr',
//		'/html/body/table[last()]/tbody/tr/td[1]/table[2]/tbody/tr/td/table/tbody/tr[position() mod 2 = 0]',
		
	/** Ticket limit regular expression.
	 * Option: 1000 (Additional cost: 200 US$)
	 */
	ticketLimitRegExp: 
		/^(\d+) \(.*[:\uFF1A] *(\d+\s?\d*) (.+)\)/,
	
	/** Ticket price regular expression.
	 * 20 US$
	 */
	ticketPriceRegExp: 
		/^([0-9\.]+)( .+)/,

	/** 349 / 500 reserved */
	soldTicketsRegExp: 
		/^(\d+) \/ (\d+)/,
		
	NUM_REGEXP: /(\d+)/,
		
	TICKET_SALES_INFO_CLASS: 'popomungo_ticketSalesInfoIcon',

	TICKET_LIMIT_ALERT_CLASS: 'popomungo_ticketLimitAlert',
	TICKET_LIMIT_ALERT_ICON_CLASS: 'popomungo_ticketLimitAlertIcon',

	TICKET_LIMIT_WARNING_CLASS: 'popomungo_ticketLimitWarning',
	TICKET_LIMIT_WARNING_ICON_CLASS: 'popomungo_ticketLimitWarningIcon',

	TICKET_PRICE_HIGH_ALERT_CLASS: 'popomungo_highTicketPriceAlert',
	TICKET_PRICE_HIGH_ALERT_ICON_CLASS: 'popomungo_highTicketPriceAlertIcon',

	TICKET_PRICE_HIGH_WARNING_CLASS: 'popomungo_highTicketPriceWarning',
	TICKET_PRICE_HIGH_WARNING_ICON_CLASS: 'popomungo_highTicketPriceWarningIcon',
	

	processArrangements: 
	function processArrangements(aDocument) {
		try {
			var salesEstimates = pm_Prefs.isEnabled(pm_PrefKeys.PERFORMANCES_SALES_ESTIMATES);
			var reverseLimits = pm_Prefs.isEnabled(pm_PrefKeys.PERFORMANCES_REVERSE_LIMITS);
			var addProgressBar = pm_Prefs.isEnabled(pm_PrefKeys.PROGRESSBARS_ADD_SOLD_TICKETS_PROGRESSBAR);
	
			if (!(salesEstimates || reverseLimits)) {
				return;
			}
	
			var dataNodesXpath = this._arrangementsXpathBase + '/tr/td[2]';
			var dataNodes = pm_XPathOrderedSnapshot(dataNodesXpath, aDocument); 
				
			pm_Logger.debug('nodes='+ dataNodes.snapshotLength);

			if (dataNodes.snapshotLength == 0) {
				pm_Logger.debug('No nodes, ignore the page');
				return;
			}

			var offsetA = this.getLastVisitOffset(dataNodes.snapshotItem(7));
			var offsetB = offsetA + this.getCompetitionOffset(dataNodes.snapshotItem(7 + offsetA));
			var offsetC = offsetB + this.getVipOffset(dataNodes.snapshotItem(9 + offsetB));
			
			pm_Logger.debug('last visit='+ offsetA +', competition='+ 
				(offsetB-offsetA) +', VIP='+ (offsetC-offsetB));

			var nodeData = {
				// << | >>
				// Artist
				showDateNode:     dataNodes.snapshotItem(2),
				// Venue
				// Venue type
				// Artist fame
				// Artist genre
				// Last city visit (optional)
				// Competition (optional)
				// (An empty row, excluded)
				// Status
				ticketsNode:      dataNodes.snapshotItem(8 + offsetB),
				// Potential sales (VIP only)
				// (Potential sales description row, excluded)
				profitNode:       dataNodes.snapshotItem(9 + offsetC),
				ticketPriceNode:  dataNodes.snapshotItem(10 + offsetC),
				ticketLimitNode:  dataNodes.snapshotItem(11 + offsetC),
				artistShare:      dataNodes.snapshotItem(12 + offsetC),
				riderLimit:       dataNodes.snapshotItem(13 + offsetC),
				reservedDateNode: dataNodes.snapshotItem(14 + offsetC)
				// Club option
			};

			var parsedData = this.parseArrangementsData(aDocument, nodeData);

			if (!parsedData.showDate || !parsedData.reservedDate) {
				return;
			}

			if (addProgressBar) {
				var progressBar = pm_ProgressBars.getProgressBar(
					aDocument, parsedData.tickets, parsedData.ticketLimit);
					
				nodeData.ticketsNode.insertBefore(
					progressBar, nodeData.ticketsNode.firstChild);
			}
	
			if (salesEstimates) {
				this.addSalesEstimates(aDocument, parsedData, nodeData);
				
				if (parsedData.isCEOView) {
					this.checkTicketLimits(aDocument, parsedData);
				}
			}

			// Reverse ticket limits
			if (reverseLimits && parsedData.isCEOView) {
				var select_limit = parsedData.ticketLimitSelectElement;
				
				for (var i=select_limit.options.length - 1; i > -1; i--) {
					var elem = select_limit.options.item(i);
					select_limit.removeChild(elem);
					select_limit.appendChild(elem);
				}
			}
		}
		catch (err)	 {
			pm_Logger.logError(err);
		}
	},


	parseArrangementsData: function parseArrangementsData(aDocument, nodeData) {
		var parsedData = {
		};
		
		try {
			parsedData.isCEOView = this.isCEOView(aDocument);
					
			if (parsedData.isCEOView) {
				// Parse float value from the ticket price.
				var input_ticketPrice = this.getTicketPriceInputElement(aDocument);
				parsedData.ticketPrice = parseFloat(input_ticketPrice.value);
				parsedData.ticketPriceInputElement = input_ticketPrice;
	
				// Parse currency unit from a ticket limit.
				select_limit = this.getTicketLimitSelectElement(aDocument);
				var ticketLimitMatch = select_limit
					.item(select_limit.selectedIndex)
					.text.match(this.ticketLimitRegExp);
				parsedData.ticketLimit = parseInt(ticketLimitMatch[1]);
				parsedData.currency = ticketLimitMatch[3];
				parsedData.ticketLimitSelectElement = select_limit;
				
				// Parse artist share.
				var input_artistShare = this.getArtisShareInputElement(aDocument);
				parsedData.artistShare = parseFloat(input_artistShare.value);
				parsedData.artistShareInputElement = input_artistShare;
			} else {
				parsedData.ticketPrice = parseFloat(nodeData.ticketPriceNode.textContent);
				parsedData.ticketLimit = parseInt(nodeData.ticketLimitNode.textContent);
				parsedData.artistShare = parseFloat(nodeData.artistShare.textContent);
				parsedData.currency = nodeData.profitNode.textContent.match(/\s(\S+)\s*$/)[1];
			}
	
			pm_Logger.debug('ticket price='+parsedData.ticketPrice +
				', ticket limit='+ parsedData.ticketLimit +
				', artist share='+ parsedData.artistShare +
				', currency='+ parsedData.currency);				

			parsedData.tickets = parseInt(nodeData.ticketsNode.innerHTML.match(/[0-9]+/));
			
			var showDateStr = nodeData.showDateNode.innerHTML.split(' ', 1) + "";
			pm_Logger.debug('show='+ showDateStr +', reserved='+ nodeData.reservedDateNode.textContent);
				
			parsedData.nowDate = this.getDateNow();
			parsedData.showDate = pm_PopoDate.toDate(showDateStr, false);
			parsedData.reservedDate = pm_PopoDate.toDate(nodeData.reservedDateNode.textContent, false);
	
			pm_Logger.debug("now/showDate/reservedDate\n"+ 
				parsedData.nowDate +"\n"+ 
				parsedData.showDate +"\n"+ 
				parsedData.reservedDate);
			pm_Logger.debug("now/showDate/reservedDate (UTC)\n"+ 
				parsedData.nowDate.toUTCString() +"\n"+ 
				parsedData.showDate.toUTCString() +"\n"+ 
				parsedData.reservedDate.toUTCString());
		}
		catch (err)	 {
			pm_Logger.logError(err);
		}

		return parsedData;
	},

	/**
	 * Calculate sales estimates.
	 * 
	 * input:
	 *   parsedData
	 *     .nowDate
	 * 	   .reservedDate
	 *     .showDate
	 *     .tickets
	 * 
	 * output:
	 *   parsedData
	 *     .daysSold
	 *     .daysToSell
	 *     .ticketsSoldPerDay
	 *     .ticketsEstimate
	 *     (.unlimitedTicketsEstimate)
	 */
	calculateSalesEstimates:
	function calculateSalesEstimates(parsedData) {
		try {
			var sellStartDate = parsedData.showDate - 
				this.DAYS_TO_SELL_MAX * this.MILLISECONDS_PER_DAY;

			if (parsedData.reservedDate > sellStartDate) {
				sellStartDate = parsedData.reservedDate;
			}
			
			parsedData.daysToSell = (parsedData.showDate - sellStartDate) /
				this.MILLISECONDS_PER_DAY;

			parsedData.daysSold = (parsedData.nowDate - sellStartDate) / 
				this.MILLISECONDS_PER_DAY;
			
			if (parsedData.daysSold > 0) { 

 				parsedData.ticketsSoldPerDay = 
 					parsedData.tickets / 
 					parsedData.daysSold;
 					
 				pm_Logger.debug("tickets="+ parsedData.tickets);
 				pm_Logger.debug("showDate="+ parsedData.showDate);
 				pm_Logger.debug("sellStartDate="+ sellStartDate);
 					
				pm_Logger.debug("daysSold="+ parsedData.daysSold);
				pm_Logger.debug("daysToSell="+ parsedData.daysToSell);
				pm_Logger.debug("ticketsSoldPerDay="+ parsedData.ticketsSoldPerDay);
			 
				parsedData.ticketsEstimate = Math.floor(
					parsedData.daysToSell * 
					parsedData.ticketsSoldPerDay);
					
				if (parsedData.ticketsEstimate > this.CLUB_MAX_TICKET_LIMIT) {
					parsedData.unlimitedTicketsEstimate = parsedData.ticketsEstimate;
					parsedData.ticketsEstimate = this.CLUB_MAX_TICKET_LIMIT;
				}
			}
			else {
				parsedData.ticketsSoldPerDay = 0;
				parsedData.ticketsEstimate = 0;
			}
		}
		catch (err)	 {
			pm_Logger.logError(err);
		}
	},
	

	addSalesEstimates: function addSalesEstimates(aDocument, parsedData, nodeData) {
		try {
			this.calculateSalesEstimates(parsedData);
			
			if (parsedData.daysSold > 0) { 
				// non ci sta piu' a fare un cazzo
				// this.addDaysToSell(aDocument, parsedData, nodeData);
				this.addSalesEstimatesAfterStart(aDocument, parsedData, nodeData);
			}
			// non so se è una feature VIP, ma io gia li vedo i giorni che restano
/*			else {
				
				this.addDaysToSell(aDocument, parsedData, nodeData);
			}*/
		}
		catch (err)	 {
			pm_Logger.logError(err);
		}
	},
	
	
	addDaysToSell:
	function addDaysToSell(aDocument, parsedData, nodeData) {
		try {
			var daysToSellTitle = pm_Strings.getString(
					pm_StringKeys.PERFORMANCES_DAYS_TO_SELL_TITLE,
					null);			
			
			var daysToSellData;

			if (parsedData.daysSold >= 0) {
				daysToSellData = pm_Strings.getString(
				pm_StringKeys.PERFORMANCES_DAYS_TO_SELL_AFTER_START_DATA,
				[parsedData.daysToSell, 
				parsedData.daysSold]);
			} else {
				daysToSellData = pm_Strings.getString(
				pm_StringKeys.PERFORMANCES_DAYS_TO_SELL_BEFORE_START_DATA,
				[parsedData.daysToSell, 
				-parsedData.daysSold]);
			}				

			pm_InsertRowAfter(
				daysToSellTitle,
				daysToSellData, 
				null, 
				nodeData.reservedDateNode.parentNode);
		}
		catch (err)	 {
			pm_Logger.logError(err);
		}
	},
	
	
	addSalesEstimatesAfterStart: 
	function addSalesEstimatesAfterStart(aDocument, parsedData, nodeData) {
		try {
			var currency = ' '+ parsedData.currency;
			
			var estimatedSalesTitle = pm_Strings.getString(
					pm_StringKeys.PERFORMANCES_ESTIMATED_SALES_TITLE,
					null);

			var estimatedSalesData = pm_Strings.getString(
				pm_StringKeys.PERFORMANCES_ESTIMATED_SALES_DATA, 
				[Math.floor(parsedData.ticketsEstimate), 
				Math.floor(parsedData.ticketsSoldPerDay*10)/10]);
				
			var estimatedSalesHover = null;

			var estimatedSalesForArtistTitle = pm_Strings.getString(
					pm_StringKeys.PERFORMANCES_ESTIMATED_INCOME_FOR_ARTIST_TITLE,
					null);

			var estimatedIncomeForClubTitle = pm_Strings.getString(
					pm_StringKeys.PERFORMANCES_ESTIMATED_INCOME_FOR_CLUB_TITLE,
					null);

			// Calculate the artist & club share of the ticket price.
			var artistSharePerTicket = parsedData.ticketPrice * 
				parsedData.artistShare / 100;
			var clubSharePerTicket = parsedData.ticketPrice * 
				(100 - parsedData.artistShare) / 100;
			
			var estimatedIncomeForArtist = parsedData.ticketsEstimate * artistSharePerTicket;
			var estimatedIncomeForClub = parsedData.ticketsEstimate * clubSharePerTicket;
								
			var estimatedIncomeForClubData = pm_Strings.getString(
				pm_StringKeys.PERFORMANCES_ESTIMATED_INCOME_FOR_CLUB_DATA,
				[Math.floor(estimatedIncomeForClub * 10)/10 + currency,
				parsedData.ticketsEstimate,
				Math.floor(clubSharePerTicket * 10)/10 + currency]);

			var estimatedIncomeForClubHover = null;

			if (parsedData.unlimitedTicketsEstimate) {
				estimatedSalesHover = pm_Strings.getString(
					pm_StringKeys.PERFORMANCES_ESTIMATED_SALES_DATA, 
					[Math.floor(parsedData.unlimitedTicketsEstimate), 
					Math.floor(parsedData.ticketsSoldPerDay * 10)/10]);

				estimatedIncomeForClubHover = pm_Strings.getString(
					pm_StringKeys.PERFORMANCES_ESTIMATED_INCOME_FOR_CLUB_DATA,
					[Math.floor(parsedData.unlimitedTicketsEstimate * 
						clubSharePerTicket * 10)/10 + currency,
					parsedData.unlimitedTicketsEstimate,
					Math.floor(clubSharePerTicket * 10)/10 + currency]);
			}

			var estimatedIncomeForArtistData = pm_Strings.getString(
				pm_StringKeys.PERFORMANCES_ESTIMATED_INCOME_FOR_ARTIST_DATA,
				[Math.floor(estimatedIncomeForArtist * 10)/10 + currency,
				parsedData.ticketsEstimate,
				Math.floor(artistSharePerTicket * 10)/10 + currency]);

			// Add ticket sales estimate
			pm_InsertRowAfter(
				estimatedSalesTitle,
				estimatedSalesData, 
				estimatedSalesHover, 
				nodeData.ticketsNode.parentNode);

			// Add artist income estimate
			var newRow = pm_InsertRowAfter(
				estimatedSalesForArtistTitle,
				estimatedIncomeForArtistData,
				null,
				nodeData.profitNode.parentNode);
			
			// Add club income estimate
			pm_InsertRowAfter(
				estimatedIncomeForClubTitle,
				estimatedIncomeForClubData, 
				estimatedIncomeForClubHover, 
				newRow);
				
		}
		catch (err)	 {
			pm_Logger.logError(err);
		}
	},


	/**
	 * Check if ticket limit should be raised.
	 */
	checkTicketLimits: function checkTicketLimits(aDocument, parsedData) {
		try {
			var select_limit = parsedData.ticketLimitSelectElement;
			var ticketsEstimate = parsedData.ticketsEstimate;
			
			if (select_limit.length >= 1) {
				var text0 = select_limit.item(select_limit.length - 1).text;
				var currentTicketLimit = parseInt(text0.match(this.ticketLimitRegExp)[1]);
	
				var baseIncome = Math.floor(currentTicketLimit * parsedData.ticketPrice / 2);
				var nextTicketLimit = currentTicketLimit;
				var matchArray;
				
				var newRow = select_limit.parentNode.parentNode;
	
				for (var limitIndex = select_limit.length - 1; limitIndex > -1; limitIndex--) {
					if (ticketsEstimate < nextTicketLimit) {
						break;
					}
	
					var text1 = select_limit.item(limitIndex).text;
					
					// Option: 1000 (Additional cost: 200 US$)
					matchArray = text1.match(this.ticketLimitRegExp);
					nextTicketLimit = parseInt(matchArray[1]);
				
					var extraCost = parseInt(matchArray[2].replace(/\s/g, ''));
					//var currency = ' '+ matchArray[3];
	
					var limitedTickets;
					if (ticketsEstimate > nextTicketLimit) {
						limitedTickets = nextTicketLimit;
					} else {
						limitedTickets = ticketsEstimate;
					}
					var income = Math.floor(limitedTickets * parsedData.ticketPrice / 2) - extraCost;
					
					var diff = income - baseIncome;
					if (diff >= 0) { diff = '+'+ diff; }
					
					var limitEstimateKeyStr = pm_Strings.getString(
						pm_StringKeys.PERFORMANCES_TICKET_LIMIT_ESTIMATE_TITLE, 
						[nextTicketLimit]);
						
					var currency = ' '+ parsedData.currency;
					
					var limitEstimateValueStr = pm_Strings.getString(
						pm_StringKeys.PERFORMANCES_TICKET_LIMIT_ESTIMATE_DATA,
						[income + currency, 
						diff + currency]);
						
					var limitEstimateHoverStr = pm_Strings.getString(
						pm_StringKeys.PERFORMANCES_TICKET_LIMIT_ESTIMATE_HOVER,
						[limitedTickets,
						Math.floor(parsedData.ticketPrice*5)/10 + currency,
						extraCost + currency]);
	
					newRow = pm_InsertRowAfter(
						limitEstimateKeyStr, 
						limitEstimateValueStr, 
						limitEstimateHoverStr, 
						newRow);
				}
			}
		}
		catch (err)	 {
			pm_Logger.logError(err);
		}
	},
		
	
	addTicketSalesStatistics: function addTicketSalesStatistics(aDocument) {
		try {
			if (!pm_Prefs.isEnabled(pm_PrefKeys.PERFORMANCES_SALES_STATISTICS)) {
				return;
			}
			
			var xpath_base = this.ticketSalesStatisticsXpath;
			var timeXpath   = xpath_base + '/tr[4]/td[2]';
			var peopleXpath = xpath_base + '/tr[5]/td[2]';
			var bookedXpath = xpath_base + '/tr[10]/td[2]';
			var adjustment = '\u00a0 ';
	
			var timeElem = pm_XPathFirstNode(timeXpath, aDocument);
			var peopleElem = pm_XPathFirstNode(peopleXpath, aDocument);
			var bookedElem = pm_XPathFirstNode(bookedXpath, aDocument);

			var showDateStr = timeElem.textContent.split(' ', 1) +'';

			pm_Logger.debug('show='+ showDateStr +', reserved='+ bookedElem.textContent);

			var showDate = pm_PopoDate.toDate(showDateStr, false);
			var reservedDate = pm_PopoDate.toDate(bookedElem.textContent, false);
			
			if (!showDate || !reservedDate) {
				return;
			}

			pm_Logger.debug("show/reserved (UTC)\n"+ 
				showDate.toUTCString() +"\n"+ 
				reservedDate.toUTCString());

			var daysSold = (showDate - reservedDate)/86400000 + 1;

			if (daysSold > this.DAYS_TO_SELL_MAX) {
				daysSold = this.DAYS_TO_SELL_MAX;
			}
			
			var people = parseInt(peopleElem.textContent);
			var ticketsPerDay = (people / daysSold).toFixed(1);
			
			var title1 = pm_Strings.getString(
				pm_StringKeys.PERFORMANCES_DAYS_SOLD_TITLE, 
				null);
				
			var data1 = pm_Strings.getString(
				pm_StringKeys.PERFORMANCES_DAYS_SOLD_DATA, 
				[daysSold]);
				
			var hover1 = pm_Strings.getString(
				pm_StringKeys.PERFORMANCES_DAYS_SOLD_HOVER, 
				null);
			
			var title2 = pm_Strings.getString(
				pm_StringKeys.PERFORMANCES_TICKETS_PER_DAY_TITLE, 
				null);
				
			var data2 = pm_Strings.getString(
				pm_StringKeys.PERFORMANCES_TICKETS_PER_DAY_DATA, 
				[ticketsPerDay]);
				
			var hover2 = pm_Strings.getString(
				pm_StringKeys.PERFORMANCES_TICKETS_PER_DAY_HOVER, 
				null);
			
			var newRow;
			newRow = pm_InsertRowAfter(
				adjustment + title2, 
				data2, 
				hover2, 
				bookedElem.parentNode.previousSibling);

			newRow = pm_InsertRowAfter(
				adjustment + title1, 
				data1, 
				hover1, 
				newRow);
		}
		catch (err)	 {
			pm_Logger.logError(err);
		}
	},
	
	
	addSoldTicketsOnShowsPage: 
	function addSoldTicketsOnShowsPage(aDocument, hasEstimates) {
		try {
			var ticketsPerShowVisible = pm_Prefs.isEnabled(pm_PrefKeys.PERFORMANCES_SHOW_NUMBER_OF_SOLD_TICKETS_PER_UPCOMING_SHOW);
			var totalTicketsVisible = pm_Prefs.isEnabled(pm_PrefKeys.PERFORMANCES_SHOW_TOTAL_NUMBER_OF_SOLD_TICKETS); 
			var totalShowsVisible = pm_Prefs.isEnabled(pm_PrefKeys.PERFORMANCES_SHOW_TOTAL_NUMBER_OF_SHOWS); 
			var salesEstimates = pm_Prefs.isEnabled(pm_PrefKeys.PERFORMANCES_SALES_ESTIMATES) && hasEstimates;
			var useColors = pm_Prefs.isEnabled(pm_PrefKeys.PERFORMANCES_USE_COLORS_ON_UPCOMING_SHOWS) && hasEstimates;
			var highlightLowTicketLimits = pm_Prefs.isEnabled(pm_PrefKeys.HIGHLIGHTING_LOW_TICKET_LIMIT_ENABLED);

			if (!(ticketsPerShowVisible || 
				totalTicketsVisible || 
				totalShowsVisible ||
				useColors ||
				highlightLowTicketLimits)) 
			{
				return;
			}
			
			var compactTicketsPerShowMode = pm_Prefs.isEnabled(pm_PrefKeys.PERFORMANCES_SHOW_SOLD_TICKETS_IN_COMPACT_FORMAT);
			
			var nodes = pm_XPathOrderedSnapshot(this.dataRowsOnShowsPageXpath, aDocument); 
			
			pm_Logger.debug('nodes='+ nodes.snapshotLength);

			var nowDate = this.getDateNow();
			var cancelShowLimit = nowDate.getTime() + 
				(this.SHOW_CANCELLABLE_LIMIT - 1) * this.MILLISECONDS_PER_DAY;
			var salesStartLimit = nowDate.getTime() + 
				(this.DAYS_TO_SELL_MAX - 1) * this.MILLISECONDS_PER_DAY;
			
			var totalTickets = 0;
			var totalShows = 0;
			var totalEstimatedTickets = 0;

			// Loop through all items.
			for (var i = nodes.snapshotLength - 1; i > -1; i--) {
				var row = nodes.snapshotItem(i);
				var cells = row.cells;

				if (cells.length < 2) {
					pm_Logger.debug("Row skipped: "+ i);
					continue;
				}
				
				var link1 = cells.item(1).getElementsByTagName('a')[0];
				
				if (link1) {
					//pm_Logger.debug(i +': '+ link1.innerHTML);
					var parentNode = link1.parentNode;
					
					var ticketsSold = 0;
					var matchResult = link1.title.match(this.NUM_REGEXP);
					if (matchResult) {
						ticketsSold = parseInt(matchResult[1]);
						
						totalTickets = totalTickets + ticketsSold;
						totalShows++;
		
						//pm_Logger.debug(i +': '+ matchResult[0]);
					}
	
					var dateMatch;
					if (hasEstimates) {
						dateMatch = cells.item(2).textContent.match(pm_PopoDate.DATE_MATCH_REGEXP);
					}
					else {
						dateMatch = cells.item(0).textContent.match(pm_PopoDate.DATE_MATCH_REGEXP);
					}
					
					if (!dateMatch) {
						pm_Logger.debug(i +': no date');
						continue;
					}

					var showDateStr = dateMatch[1];
					var showDate = pm_PopoDate.toDate(showDateStr, false);

					var parsedData;
					
					if (salesEstimates) {
						var reservedDate = 0; // use the default
	
						parsedData = {
		 					nowDate: nowDate,
							reservedDate: reservedDate,
		 					showDate: showDate,
							tickets: ticketsSold
						};					
						
						this.calculateSalesEstimates(parsedData);
	
						totalEstimatedTickets = totalEstimatedTickets + parsedData.ticketsEstimate;
					}
					else {
						parsedData = null;
					}
											
					if (useColors) {
						if (showDate.getTime() <= cancelShowLimit) {
							row.className = row.className ? row.className +' popomungo_showLessThan7DaysHL' : 'popomungo_showLessThan7Days';
						}
						else if (showDate.getTime() <= salesStartLimit) {
							row.className = row.className ? row.className +' popomungo_showLessThan56DaysHL' : 'popomungo_showLessThan56Days';
						}
						else {
							row.className = row.className ? row.className +' popomungo_showMoreThan56DaysHL' : 'popomungo_showMoreThan56Days';
						}				
	
						row.className = row.className +' popomungo_topShowRow';			
					}
	
					if (ticketsPerShowVisible) {				
						this.addVisibleTicketNumbers(
							compactTicketsPerShowMode,
							aDocument,
							link1,
							parentNode,
							salesEstimates,
							parsedData);
					}
				}
			}
	
			if (totalShows && 
				(totalShowsVisible || totalTicketsVisible)) 
			{
				var targetNode = pm_XPathFirstNode(this.totalTicketSalesOnShowsPageXpath, aDocument);
					
				if (totalShowsVisible) {
					this.addTotalShows(targetNode, totalShows);
				}
	
				if (totalTicketsVisible) {
					this.addTotalTickets(targetNode, totalTickets);
				}

				if (salesEstimates) {
					if (totalTicketsVisible) {
						this.addTotalEstimatedTickets(
							targetNode, totalEstimatedTickets);
					}
				}
			}
		}
		catch (err)	 {
			pm_Logger.logError(err);
		}
			
	},


	addSoldTicketsOnSchedulePage: function addSoldTicketsOnSchedulePage(aDocument) {
		try {
			var ticketsPerShowVisible = pm_Prefs.isEnabled(pm_PrefKeys.PERFORMANCES_SHOW_NUMBER_OF_SOLD_TICKETS_PER_UPCOMING_SHOW);
			var totalTicketsVisible = pm_Prefs.isEnabled(pm_PrefKeys.PERFORMANCES_SHOW_TOTAL_NUMBER_OF_SOLD_TICKETS); 
			var totalShowsVisible = pm_Prefs.isEnabled(pm_PrefKeys.PERFORMANCES_SHOW_TOTAL_NUMBER_OF_SHOWS); 

			if (!(ticketsPerShowVisible || totalTicketsVisible || totalShowsVisible)) {
				return;
			}

			var compactTicketsPerShowMode = pm_Prefs.isEnabled(pm_PrefKeys.PERFORMANCES_SHOW_SOLD_TICKETS_IN_COMPACT_FORMAT);
			
			var nodes = pm_XPathOrderedSnapshot(this.ticketSalesOnSchedulePageXpath, aDocument);
			
			pm_Logger.debug('nodes='+ nodes.snapshotLength);

			var totalTickets = 0;
			var totalShows = 0;
			
			// Loop through all items.
			for (i = nodes.snapshotLength - 1; i > -1; i--) {
				var node = nodes.snapshotItem(i);
				
				if (!node.href.match(this.performancesPageRegExp)) {
					continue;
				}
				
				//pm_Logger.debug(i +': '+ node.innerHTML);
				var parentNode = node.parentNode;
				
				var title = node.title;
				var matchResult = title.match(this.NUM_REGEXP);
				if (matchResult) {
					totalTickets = totalTickets + parseInt(matchResult[1]);
					totalShows++;
					
					//pm_Logger.debug(i +': '+ matchResult[0]);
				}

				if (ticketsPerShowVisible) {
					this.addVisibleTicketNumbers(
						compactTicketsPerShowMode,
						aDocument,
						node,
						parentNode,
						false, //salesEstimates
						null); //parsedData
				}
			}
	
			if (totalShows && 
				(totalShowsVisible || totalTicketsVisible)) 
			{
				var targetNode = pm_XPathFirstNode(this.totalTicketSalesOnSchedulePageXpath, aDocument);

				var div1 = aDocument.createElement('div');
				div1.style.padding = '10px';
				
				if (totalShowsVisible) {
					this.addTotalShows(div1, totalShows);
				}
	
				if (totalTicketsVisible) {
					this.addTotalTickets(div1, totalTickets);
				}
				
				targetNode.appendChild(div1);
			}
		}
		catch (err)	 {
			pm_Logger.logError(err);
		}
			
	},
	
	
	addSoldTicketsOnCitiesPage:
	function addSoldTicketsOnCitiesPage(aDocument) {
		try {
			var totalTicketsVisible = pm_Prefs.isEnabled(pm_PrefKeys.PERFORMANCES_SHOW_TOTAL_NUMBER_OF_SOLD_TICKETS); 
			var totalShowsVisible = pm_Prefs.isEnabled(pm_PrefKeys.PERFORMANCES_SHOW_TOTAL_NUMBER_OF_SHOWS); 

			if (!(totalTicketsVisible || totalShowsVisible)) {
				return;
			}
			
			var nodes = pm_XPathOrderedSnapshot(this.ticketSalesOnCitiesPageXpath, aDocument);
			
			pm_Logger.debug('nodes='+ nodes.snapshotLength);

			var totalTickets = 0;
			var totalShows = 0;
			var ticketSalesAvailable = false; 
			
			// Loop through all items, but skip the header.
			for (var i = nodes.snapshotLength - 1; i >= 1; i--) {
				var ticketsNode = nodes.snapshotItem(i);
				var parentNode = ticketsNode.parentNode;
				
				var count = parseInt(ticketsNode.textContent);
				if (!isNaN(count)) {
					totalTickets = totalTickets + count;
					ticketSalesAvailable = true;
				}

				var shows = parseInt(parentNode.cells.item(2).textContent);
				if (!isNaN(shows)) {
					totalShows = totalShows + shows;
				}
			}
	
			if (totalShows && 
				(totalShowsVisible || totalTicketsVisible)) 
			{
				var targetNode = pm_XPathFirstNode(this.totalTicketSalesOnCitiesPageXpath, aDocument);

				if (totalShowsVisible) {
					this.addTotalShows(targetNode, totalShows);
				}
	
				if (totalTicketsVisible && ticketSalesAvailable) {
					this.addTotalTickets(targetNode, totalTickets);
				}
			}
		}
		catch (err)	 {
			pm_Logger.logError(err);
		}
	},
	
	
	addTicketSalesTotalOnClubShowsPage: 
	function addTicketSalesTotalOnClubShowsPage(aDocument) {
		try {	
			var incomePerShowVisible = pm_Prefs.isEnabled(pm_PrefKeys.PERFORMANCES_SHOW_INCOME_PER_SHOW);
			var totalShowsVisible = pm_Prefs.isEnabled(pm_PrefKeys.PERFORMANCES_SHOW_TOTAL_NUMBER_OF_SHOWS); 
			var totalTicketsVisible = pm_Prefs.isEnabled(pm_PrefKeys.PERFORMANCES_SHOW_TOTAL_NUMBER_OF_SOLD_TICKETS); 
			var totalIncomeVisible = pm_Prefs.isEnabled(pm_PrefKeys.PERFORMANCES_SHOW_TOTAL_INCOME);
			var salesEstimates = pm_Prefs.isEnabled(pm_PrefKeys.PERFORMANCES_SALES_ESTIMATES);
			var useColors = pm_Prefs.isEnabled(pm_PrefKeys.PERFORMANCES_USE_COLORS_ON_UPCOMING_SHOWS);
			var highlightHighTicketPrices = pm_Prefs.isEnabled(pm_PrefKeys.HIGHLIGHTING_HIGH_TICKET_PRICE_ENABLED);
			var highlightLowTicketLimits = pm_Prefs.isEnabled(pm_PrefKeys.HIGHLIGHTING_LOW_TICKET_LIMIT_ENABLED);

			if (!(
				incomePerShowVisible || 
				totalShowsVisible || 
				totalTicketsVisible || 
				totalIncomeVisible ||
				highlightHighTicketPrices ||
				highlightLowTicketLimits)) 
			{
				return;
			}
			
			var highTicketPriceAlertLimit = parseInt(pm_Prefs.getPref(pm_PrefKeys.TICKETS_HIGH_PRICE_ALERT_LEVEL, 99));
			var highTicketPriceWarningLimit = parseInt(pm_Prefs.getPref(pm_PrefKeys.TICKETS_HIGH_PRICE_WARNING_LEVEL, 59));
			var lowTicketLimitDaysLeftAlertLimit = pm_Prefs.isEnabled(pm_PrefKeys.TICKET_LIMITS_DAYS_LEFT_ALERT_LEVEL);
			var lowTicketLimitDaysLeftWarningLimit = pm_Prefs.isEnabled(pm_PrefKeys.TICKET_LIMITS_DAYS_LEFT_WARNING_LEVEL);
			var lowTicketLimitPercentageAlertLimit = parseInt(pm_Prefs.getPref(pm_PrefKeys.TICKET_LIMITS_PERCENTAGE_ALERT_LEVEL, 90));
			var lowTicketLimitPercentageWarningLimit = parseInt(pm_Prefs.getPref(pm_PrefKeys.TICKET_LIMITS_PERCENTAGE_WARNING_LEVEL, 70));
			
			var nodes = pm_XPathOrderedSnapshot(this.dataRowsOnClubShowsPageXpath, aDocument);

			pm_Logger.debug('nodes='+ nodes.snapshotLength);

			var ticketsSold;
			var ticketsLimit;
			var totalShows = 0;
			var totalTickets = 0;
			var totalTicketLimit = 0;
			var totalEstimatedTickets = 0;
			var totalIncome = 0;
			var totalEstimatedIncome = 0;
			var parsedData;

			var nowDate = this.getDateNow();
			var cancelShowLimit = nowDate.getTime() + 
				(this.SHOW_CANCELLABLE_LIMIT - 1) * this.MILLISECONDS_PER_DAY;
			var salesStartLimit = nowDate.getTime() + 
				(this.DAYS_TO_SELL_MAX - 1) * this.MILLISECONDS_PER_DAY;

			// Skip the summary row.
			var lastIndex = nodes.snapshotLength % 2 == 0 ? 
				nodes.snapshotLength - 1 : nodes.snapshotLength - 2;
			 
			// Loop through all items.
			for (var i = lastIndex; i > -1; i = i - 2) {
				var row = nodes.snapshotItem(i);

				var rowCells = row.cells;
				
				var td1 = rowCells.item(0); // date and time
				var td2 = rowCells.item(1); // progress bar
				var td3 = rowCells.item(2); // ticket price
				
				var showDate = pm_PopoDate.showDateOnClubPageToDate(pm_Trim(td1.textContent));
				var imgNodes = td2.getElementsByTagName('img');
				var img2 = imgNodes.item(1);
				
				var ticketPrice = 0;
				var currency = '';
				var matchResult2 = td3.textContent.match(this.ticketPriceRegExp);
				
				if (matchResult2) {
					 ticketPrice = parseFloat(matchResult2[1]);
					 currency = matchResult2[2];
				}

				if (useColors) {
					if (showDate.getTime() <= cancelShowLimit) {
						row.className = row.className ? row.className +' popomungo_showLessThan7DaysHL' : 'popomungo_showLessThan7Days';
					}
					else if (showDate.getTime() <= salesStartLimit) {
						row.className = row.className ? row.className +' popomungo_showLessThan56DaysHL' : 'popomungo_showLessThan56Days';
					}
					else {
						row.className = row.className ? row.className +' popomungo_showMoreThan56DaysHL' : 'popomungo_showMoreThan56Days';
					}				

					upperRow = nodes.snapshotItem(i - 1);						
					upperRow.className = row.className +' popomungo_topShowRow';
					row.className = row.className +' popomungo_bottomShowRow';			
				}
				
				if (highlightHighTicketPrices) {
					if (ticketPrice >= highTicketPriceAlertLimit) {
						this.addTicketPriceAlert(aDocument, td3, true);
					}
					else if (ticketPrice >= highTicketPriceWarningLimit) {
						this.addTicketPriceAlert(aDocument, td3, false);
					}
				}
				
				//pm_Logger.debug(i +': td2='+ img2.title +', td3='+ td3.textContent);

				var matchResult1 = img2.title.match(this.soldTicketsRegExp);
				if (matchResult1) {
					ticketsSold = parseInt(matchResult1[1]);
					ticketsLimit = parseInt(matchResult1[2]);

					totalShows = totalShows + 1;
					totalTickets = totalTickets + ticketsSold;
					totalTicketLimit = totalTicketLimit + ticketsLimit;

					if (salesEstimates) {
						var reservedDate = 0; // use the default

						parsedData = {
		 					nowDate: nowDate,
							reservedDate: reservedDate,
		 					showDate: showDate,
							tickets: ticketsSold
						};					
						
						this.calculateSalesEstimates(parsedData);

						totalEstimatedTickets = totalEstimatedTickets + parsedData.ticketsEstimate;
						
						if (highlightLowTicketLimits &&
							ticketsLimit != this.CLUB_MAX_TICKET_LIMIT) 
						{
							if (ticketsSold >= ticketsLimit) {
								this.addTicketLimitAlert(aDocument, td2, true, true);
							}
							else {
								var daysLeft = ((ticketsLimit - ticketsSold) / parsedData.ticketsSoldPerDay).toFixed(1);
								var percentage = (ticketsSold / ticketsLimit * 100).toFixed(1);
								
								//pm_Logger.debug('daysLeft='+ daysLeft +', percentage='+ percentage);
								
								if (daysLeft <= lowTicketLimitDaysLeftAlertLimit ||
									percentage >= lowTicketLimitPercentageAlertLimit) 
								{
									this.addTicketLimitAlert(aDocument, td2, false, true);
								}
								else if (daysLeft <= lowTicketLimitDaysLeftWarningLimit ||
									percentage >= lowTicketLimitPercentageWarningLimit)
								{
									this.addTicketLimitAlert(aDocument, td2, false, false);
								}
							}
						}
					}

					if (incomePerShowVisible) {
						if (ticketPrice) {										
							var income = ticketsSold * ticketPrice / 2;
							totalIncome = totalIncome + income;
	
							var img1 = aDocument.createElement('img');
							img1.className = this.TICKET_SALES_INFO_CLASS;
							img1.src = pm_CommonConstants.INFO_ICON_URL;
	
							if (salesEstimates) {
								var estimatedIncomeForClub = parsedData.ticketsEstimate * ticketPrice / 2;
								totalEstimatedIncome = totalEstimatedIncome + estimatedIncomeForClub;
		
								//TODO use a property string here?
								img1.title = income + currency +
									' ('+ estimatedIncomeForClub + currency +')';
							}
							else {
								//TODO use a property string here?
								img1.title = income + currency;
							}
							
							td3.appendChild(img1);
						}
					}
				}
			}

			if (totalShowsVisible || totalTicketsVisible || totalIncomeVisible) 
			{
				var targetNode = pm_XPathFirstNode(this.totalIncomeTargetXpath, aDocument);
				
				if (totalShowsVisible) {
					this.addTotalShows(targetNode, totalShows);
				}
	
				if (totalTicketsVisible) {
					this.addTotalTicketsWithRatio(
						targetNode, totalTickets, totalTicketLimit);
				}
				
				if (totalIncomeVisible) {
					this.addTotalIncome(
						targetNode, totalIncome, totalShows, currency);
				}

				if (salesEstimates) {
					if (totalTicketsVisible) {
						this.addTotalEstimatedTickets(
							targetNode, totalEstimatedTickets);
					}
					
					if (totalIncomeVisible) {
						this.addTotalEstimatedIncome(
							targetNode, totalEstimatedIncome, totalShows, currency);
					}
				}
				
				targetNode.appendChild(aDocument.createElement('br'));
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	},
	
	
	identifyUndefinedPerformancesPage:
	function identifyUndefinedPerformancesPage(aDocument) {
		try {
			var forms = aDocument.getElementsByTagName('form');
			
			pm_Logger.debug('forms='+ forms.length);
			
			if (forms.length > 0) {
				var action = forms[0].elements.namedItem('action').value.toLowerCase();
				pm_Logger.debug('action='+ action);
				
				if (action == 'setticketpriceconfirm') {
					return 'arrangements';
				}
				else {
					return undefined;	
				}
			}
		}
		catch (err) {
			pm_Logger.logError(err);
		}

		return undefined;	
	},
	
	
	addVisibleTicketNumbers:
	function addVisibleTicketNumbers(
		compactTicketsPerShowMode,
		aDocument,
		link1,
		parentNode,
		salesEstimates,
		parsedData)
	{
		try {
			var span1 = aDocument.createElement('span');
			span1.className = 'popomungo_tickets';

			if (compactTicketsPerShowMode) {
				var matchResult = link1.title.match(this.NUM_REGEXP);
				if (matchResult) {
					span1.appendChild(aDocument.createTextNode('['+ matchResult[1] +']'));
					parentNode.appendChild(aDocument.createTextNode(' '));
				}
				else {
					span1.appendChild(aDocument.createTextNode(link1.title));
					parentNode.appendChild(aDocument.createElement('br'));
				}
			}
			else {
				span1.appendChild(aDocument.createTextNode(link1.title));
				parentNode.appendChild(aDocument.createElement('br'));
			}

			// parsedData is null for a schedule page.
			if (parsedData) { 
				pm_Logger.debug("ticketsEstimate="+ parsedData.ticketsEstimate);
				pm_Logger.debug("ticketsSoldPerDay="+ parsedData.ticketsSoldPerDay);
			}
			else {
				//pm_Logger.debug("no parsed data");
			}
			
			if (salesEstimates && parsedData) {
				span1.title = pm_Strings.getString(
					pm_StringKeys.PERFORMANCES_ESTIMATED_SALES_DATA,
					[Math.floor(parsedData.ticketsEstimate), 
					Math.floor(parsedData.ticketsSoldPerDay*10)/10]
				);
			}
			else {
				span1.title = link1.title;
			}
			
			parentNode.appendChild(span1);
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	},
	
	
	addTicketLimitAlert:
	function addTicketLimitAlert(aDocument, tableCell, isLimitReached, isAlert) {
		try {
			var iconUrl = aDocument.createElement('img');
			
			if (isLimitReached) {
				iconUrl.src = pm_CommonConstants.ALARM_ICON_URL;
				iconUrl.className = this.TICKET_LIMIT_ALERT_ICON_CLASS;
				iconUrl.title = pm_Strings.getString(pm_StringKeys.PERFORMANCES_TICKET_LIMIT_REACHED, null);
				tableCell.className = tableCell.className ? ' '+ this.TICKET_LIMIT_ALERT_CLASS : this.TICKET_LIMIT_ALERT_CLASS;
			}
			else {
				if (isAlert) {
					iconUrl.src = pm_CommonConstants.ALARM_ICON_URL;
					iconUrl.className = this.TICKET_LIMIT_ALERT_ICON_CLASS;
					tableCell.className = tableCell.className ? ' '+ this.TICKET_LIMIT_ALERT_CLASS : this.TICKET_LIMIT_ALERT_CLASS;
				}
				else {
					iconUrl.src = pm_CommonConstants.WARNING_ICON_URL;
					iconUrl.className = this.TICKET_LIMIT_WARNING_ICON_CLASS;
					tableCell.className = tableCell.className ? ' '+ this.TICKET_LIMIT_WARNING_CLASS : this.TICKET_LIMIT_WARNING_CLASS;
				}
				
				iconUrl.title = pm_Strings.getString(pm_StringKeys.PERFORMANCES_TICKET_LIMIT_NEAR, null);
			}
			
			tableCell.appendChild(iconUrl);
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	},
	
	
	addTicketPriceAlert:
	function addTicketPriceAlert(aDocument, tableCell, isAlert) {
		try {
			var iconUrl = aDocument.createElement('img');
			
			if (isAlert) {
				iconUrl.src = pm_CommonConstants.ALARM_ICON_URL;
				iconUrl.className = this.TICKET_PRICE_HIGH_ALERT_ICON_CLASS;
				iconUrl.title = pm_Strings.getString(pm_StringKeys.PERFORMANCES_TICKET_PRICE_HIGH, null);
				tableCell.className = tableCell.className ? ' '+ this.TICKET_PRICE_HIGH_ALERT_CLASS : this.TICKET_PRICE_HIGH_ALERT_CLASS;
			}
			else {
				iconUrl.src = pm_CommonConstants.WARNING_ICON_URL;
				iconUrl.className = this.TICKET_PRICE_HIGH_WARNING_ICON_CLASS;
				iconUrl.title = pm_Strings.getString(pm_StringKeys.PERFORMANCES_TICKET_PRICE_HIGH, null);
				tableCell.className = tableCell.className ? ' '+ this.TICKET_PRICE_HIGH_WARNING_CLASS : this.TICKET_PRICE_HIGH_WARNING_CLASS;
			}
			
			tableCell.appendChild(iconUrl);
		}
		catch (err) {
			pm_Logger.logError(err);
		}
	},
	
	
	addTotalShows:
	function addTotalShows(targetNode, totalShows)
	{
		var aDocument = targetNode.ownerDocument;

		var text3 = pm_Strings.getString(
			pm_StringKeys.PERFORMANCES_SHOWS_COUNT, 
			[totalShows]);
		
		this.appendTotalText(targetNode, text3, null);
		targetNode.appendChild(aDocument.createElement('br'));
	},
	
	
	addTotalTickets: function addTotalTickets(targetNode, totalTickets) 
	{
		var aDocument = targetNode.ownerDocument;

		var text1 = pm_Strings.getString(
			pm_StringKeys.PERFORMANCES_TICKETS_COUNT,
			[totalTickets]);

		this.appendTotalText(targetNode, text1, null);
		targetNode.appendChild(aDocument.createElement('br'));
	},


	addTotalTicketsWithRatio:
	function addTotalTicketsWithRatio(
		targetNode, totalTickets, totalTicketLimit) 
	{
		var aDocument = targetNode.ownerDocument;

		var text1 = pm_Strings.getString(
			pm_StringKeys.PERFORMANCES_TICKETS_RATIO,
			[totalTickets, 
			totalTicketLimit]);
			
		var hover1 = pm_Strings.getString(
			pm_StringKeys.PERFORMANCES_TICKETS_PERCENT,
			[Math.floor(totalTickets / totalTicketLimit * 1000) / 10]);

		this.appendTotalText(targetNode, text1, hover1);
		targetNode.appendChild(aDocument.createElement('br'));
	},


	addTotalEstimatedTickets: 
	function addTotalEstimatedTickets(targetNode, totalTickets) 
	{
		var aDocument = targetNode.ownerDocument;

		var text1 = pm_Strings.getString(
			pm_StringKeys.PERFORMANCES_TICKETS_ESTIMATED_TOTAL_COUNT,
			[totalTickets]);

		this.appendTotalText(targetNode, text1, null);
		targetNode.appendChild(aDocument.createElement('br'));
	},


	addTotalIncome:
	function addTotalIncome(targetNode, totalIncome, totalShows, currency)
	{
		var aDocument = targetNode.ownerDocument;
		
		var text2 = pm_Strings.getString(
			pm_StringKeys.PERFORMANCES_INCOME_TOTAL_VALUE,
			[Math.round(totalIncome) + currency]);
			
		var hover2 = pm_Strings.getString(
			pm_StringKeys.PERFORMANCES_INCOME_AVERAGE_PER_SHOW,
			[Math.round(totalIncome / totalShows) + currency]);

		this.appendTotalText(targetNode, text2, hover2);
		targetNode.appendChild(aDocument.createElement('br'));
	},
	

	addTotalEstimatedIncome:
	function addTotalEstimatedIncome(targetNode, totalIncome, totalShows, currency)
	{
		var aDocument = targetNode.ownerDocument;
		
		var text2 = pm_Strings.getString(
			pm_StringKeys.PERFORMANCES_INCOME_ESTIMATED_TOTAL_VALUE,
			[Math.round(totalIncome) + currency]);
			
		var hover2 = pm_Strings.getString(
			pm_StringKeys.PERFORMANCES_INCOME_AVERAGE_PER_SHOW,
			[Math.round(totalIncome / totalShows) + currency]);

		this.appendTotalText(targetNode, text2, hover2);
		targetNode.appendChild(aDocument.createElement('br'));
	},
	

	appendTotalText: function appendTotalText(targetNode, text, hover) {
		pm_Logger.debug('text='+ text +', hover='+ hover);
		
		var aDocument = targetNode.ownerDocument;

		var node1 = aDocument.createElement('span');
		node1.className = 'popomungo_added';
		node1.setAttribute('style', 'font-weight: bold;');

		if (hover) {
			node1.setAttribute('title', hover);
		}

		node1.appendChild(aDocument.createTextNode(text));

		targetNode.appendChild(node1);
	},

	
	/** If the band has visited in the town earlier,
	 * there is a link to the previous show.
	 */
	getLastVisitOffset: function getLastVisitOffset(aNode) {
		// Has visited before?
		// <a href="Performances.asp?action=ReadPerformance&PerformanceID=123">62 days ago</a>
		if (aNode.innerHTML.match(/Performances\.asp./i) == null) {
			// No, this is the first show in the town.
			return 0;
		} else {
			// Yes, has visited the town earlier.
			return 1;
		}
	},


	/** If the show is part of a competition,
	 * there is an extra cell on the table.
	 */
	getCompetitionOffset: function getCompetitionOffset(aNode) {
		// Is a competition?
		if (aNode.innerHTML.match(/Competition\.asp/i) == null) {
			// No, a normal show.
			return 0;
		} else {
			// Yes, a competition.
			return 1;
		}
	},


	/** If the owner is a VIP, there is an extra cell on the table.
	 */
	getVipOffset: function getVipOffset(aNode) {
		var nextRow = pm_NextSibling(aNode.parentNode, "TR");
		
		// If VIP, the next row contains only a description.
		if (nextRow && nextRow.cells.length == 1) {
			// Yes, VIP.
			return 1;
		} else {
			// No, non-VIP.
			return 0;
		}
	},


	isCEOView: function isCEOView(aDocument) {
		var nodes = aDocument.getElementsByTagName('select');
		
		var result = (nodes.length > 0);
		
		pm_Logger.debug('CEO view='+ result);
			
		return result;
	},
	

	getTicketLimitSelectElement: function getTicketLimitSelectElement(aDocument) {
		var ticketLimitXpath  = "//select[@name='TicketLimit']";

		var select_limit = pm_XPathFirstNode(ticketLimitXpath, aDocument);
			
		pm_Logger.debug('ticket limit select='+ select_limit);
			
		return select_limit;
	},


	getTicketPriceInputElement: function getTicketPriceInputElement(aDocument) {
		var ticketPriceXpath  = "//input[@name='TicketPrice']";

		var input_ticketPrice = pm_XPathFirstNode(ticketPriceXpath, aDocument);

		pm_Logger.debug('ticket price input='+ input_ticketPrice);
			
		return input_ticketPrice;
	},


	getArtisShareInputElement: function getArtisShareInputElement(aDocument) {
		var artistShareXpath  = "//input[@name='ArtistShare']";

		var input_artistShare = pm_XPathFirstNode(artistShareXpath, aDocument);

		pm_Logger.debug('Artist share input='+ input_artistShare);
			
		return input_artistShare;
	},

	
	getDateNow: function getDateNow() {
		var now = new Date();
		now = new Date(1900+now.getYear(), now.getMonth(), now.getDate(), 12);
		now.setUTCHours(12,0,0,0);
		return now;
	}
};
