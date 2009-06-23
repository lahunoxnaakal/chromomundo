/*
 * prefKeys.js
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

var pm_PrefKeys = {
	// Global settings
	ALERT_ON_ERROR: 'alertOnError',
	ENABLED: 'enabled',
	TRACE_LEVEL: 'traceLevel',
	CURRENT_CHARACTER: 'currentCharacter',

	// Features
	AUTO_DETECT_CITY_NAME: 'settings.autoDetectCityName.enabled',
	AUTO_DETECT_DATE_AND_TIME_FORMAT: 'settings.autoDetectDateAndTimeFormat.enabled',
	AUTO_DETECT_LANGUAGE: 'settings.autoDetectLanguage.enabled',

	// Interaction features
	INTERACTION_FEATURES_ENABLED: 'settings.interaction.features.enabled',
	INTERACTION_OPTION_COMMAND: 'settings.interaction.option.<n>.command',
	INTERACTION_OPTION_HIGHLIGHT: 'settings.interaction.option.<n>.highlight.enabled',
	
	// Performance features
	PERFORMANCES_FEATURES_ENABLED: 'settings.performances.features.enabled',
	PERFORMANCES_REVERSE_LIMITS: 'settings.performances.reverseTicketLimits.enabled',
	PERFORMANCES_SALES_ESTIMATES: 'settings.performances.ticketSalesEstimates.enabled',
	PERFORMANCES_SALES_STATISTICS: 'settings.performances.ticketSalesStatistics.enabled',
	PERFORMANCES_SHOW_INCOME_PER_SHOW: 'settings.performances.showIncomePerShow.enabled',
	PERFORMANCES_SHOW_NUMBER_OF_SOLD_TICKETS_PER_UPCOMING_SHOW: 'settings.performances.showNumberOfSoldTicketsPerShow.enabled',
	PERFORMANCES_SHOW_SOLD_TICKETS_IN_COMPACT_FORMAT: 'settings.performances.showSoldTicketsInCompactFormat.enabled',
	PERFORMANCES_SHOW_TOTAL_INCOME: 'settings.performances.showTotalIncome.enabled',
	PERFORMANCES_SHOW_TOTAL_NUMBER_OF_SHOWS: 'settings.performances.showTotalNumberOfShows.enabled',
	PERFORMANCES_SHOW_TOTAL_NUMBER_OF_SOLD_TICKETS: 'settings.performances.showTotalNumberOfSoldTickets.enabled',
	PERFORMANCES_USE_COLORS_ON_UPCOMING_SHOWS: 'settings.performances.useColorsOnUpcomingShows.enabled',
	
	// Scoring features
	SCORING_ADD_NUMBERS: 'settings.scoring.addScoreNumber.enabled',
	SCORING_BASE: 'settings.scoring.scoreBase',
	SCORING_COLOR_NUMBERS: 'settings.scoring.colorNumber.enabled',
	SCORING_COMPARE_ATTRIBUTES_ENABLED: 'settings.scoring.compareAttributes.enabled',
	SCORING_COMPARE_ATTRIBUTES_NUMBER_POSITION: 'settings.scoring.compareAttributes.numberPosition',
	SCORING_DISABLE_LINK: 'settings.scoring.disableLink.enabled',
	SCORING_FEATURES_ENABLED: 'settings.scoring.features.enabled',
	SCORING_NUMBER_COLOR_TYPE: 'settings.scoring.colorNumber.colorType',
	SCORING_NUMBER_GRADIENT_COLOR_FROM: 'settings.scoring.colorNumber.gradientColor.from',
	SCORING_NUMBER_GRADIENT_COLOR_TO: 'settings.scoring.colorNumber.gradientColor.to',
	
	// Progress bar features
	PROGRESSBARS_ADD_SOLD_TICKETS_COUNT: 'settings.progressBars.shows.addSoldTicketsCount',
	PROGRESSBARS_ADD_SOLD_TICKETS_PERCENTAGE: 'settings.progressBars.shows.addSoldTicketsPercentage',
	PROGRESSBARS_ADD_SOLD_TICKETS_PROGRESSBAR: 'settings.progressBars.shows.addSoldTicketsProgressBar',
	PROGRESSBARS_FEATURES_ENABLED: 'settings.progressBars.features.enabled',
	PROGRESSBARS_FONT_SIZE: 'settings.progressBars.font.size',
	PROGRESSBARS_FONT_WEIGHT: 'settings.progressBars.font.weight',
	PROGRESSBARS_SHOW_PROGRESSBAR_VALUES: 'settings.progressBars.showProgressBarValues',
	
	// Highlighting features
	COMPETITIONS_COLOR_ENTRIES: 'settings.competitions.colorizeCompetitionEntries.enabled',
	HIGHLIGHTING_CEO_LOCALE_ENABLED: 'settings.highlighting.highlightCeoLocale.enabled',
	HIGHLIGHTING_FEATURES_ENABLED: 'settings.highlighting.features.enabled',
	HIGHLIGHTING_HIGH_TICKET_PRICE_ENABLED: 'settings.highlighting.highlightHighTicketPrice.enabled',
	HIGHLIGHTING_LOW_STOCK_ENABLED: 'settings.highlighting.highlightLowStock.enabled',
	HIGHLIGHTING_LOW_TICKET_LIMIT_ENABLED: 'settings.highlighting.highlightLowTicketLimit.enabled',
	HIGHLIGHTING_PEOPLE_AT_SAME_TOWN_ENABLED: 'settings.highlighting.peopleAtSameTown.enabled',
	PRODUCTS_LOW_STOCK_ALERT_LEVEL: 'settings.products.lowStock.alertLevel',
	PRODUCTS_LOW_STOCK_WARNING_LEVEL: 'settings.products.lowStock.warningLevel',
	TICKETS_HIGH_PRICE_ALERT_LEVEL: 'settings.tickets.highPrice.alertLevel',
	TICKETS_HIGH_PRICE_WARNING_LEVEL: 'settings.tickets.highPrice.warningLevel',
	TICKET_LIMITS_DAYS_LEFT_ALERT_LEVEL: 'settings.ticketLimits.lowTicketLimit.soldOutInDays.alertLevel',
	TICKET_LIMITS_DAYS_LEFT_WARNING_LEVEL: 'settings.ticketLimits.lowTicketLimit.soldOutInDays.warningLevel',
	TICKET_LIMITS_PERCENTAGE_ALERT_LEVEL: 'settings.ticketLimits.lowTicketLimit.percentage.alertLevel',
	TICKET_LIMITS_PERCENTAGE_WARNING_LEVEL: 'settings.ticketLimits.lowTicketLimit.percentage.warningLevel',
	
	// Links features
	LINKS_CHARACTER_POPUP_CALL_LINK_ENABLED: 'settings.links.popup.character.call.enabled',
	LINKS_CHARACTER_POPUP_ENABLED: 'settings.links.popup.character.enabled',
	LINKS_CHARACTER_POPUP_MESSAGE_LINK_ENABLED: 'settings.links.popup.character.sendMessage.enabled',
	LINKS_CHARACTER_VISIBLE_CALL_LINK_ENABLED: 'settings.links.visible.character.call.enabled',
	LINKS_CHARACTER_VISIBLE_LINKS_ENABLED: 'settings.links.visible.character.enabled',
	LINKS_CHARACTER_VISIBLE_MESSAGE_LINK_ENABLED: 'settings.links.visible.character.sendMessage.enabled',
	LINKS_FEATURES_ENABLED: 'settings.links.features.enabled',
	LINKS_LOCALE_POPUP_ENABLED: 'settings.links.popup.locale.enabled',
	LINKS_LOCALE_POPUP_GOTO_LINK_ENABLED: 'settings.links.popup.locale.moveHere.enabled',
	LINKS_LOCALE_POPUP_VIEW_CHARACTERS_ENABLED: 'settings.links.popup.locale.viewCharacters.enabled',
	LINKS_LOCALE_VISIBLE_GOTO_LINK_ENABLED: 'settings.links.visible.locale.moveHere.enabled',
	LINKS_LOCALE_VISIBLE_VIEW_CHARACTERS_ENABLED: 'settings.links.visible.locale.viewCharacters.enabled',
	LINKS_LOCALE_VISIBLE_LINKS_ENABLED: 'settings.links.visible.locale.enabled',
	LINKS_POPUP_ENABLED: 'settings.links.popup.enabled',
	LINKS_VISIBLE_LINKS_ENABLED: 'settings.links.visible.enabled',
	LINKS_VISIBLE_LINK_BG_COLOR: 'settings.links.visible.type.backgroundColor',
	LINKS_VISIBLE_LINK_TEXT_COLOR: 'settings.links.visible.type.textColor',
	LINKS_VISIBLE_LINK_TYPE: 'settings.links.visible.type',
	
	LOCALES_IMAGES_ENABLED: 'settings.locales.icons.enabled',
	LOCALES_IMAGE_URL: 'settings.locales.icon.<n>.url',
	LOCALES_IMAGE_BASE: 'settings.locales.icon.',
	
	// Traveling
	TRAVELING_FEATURES_ENABLED: 'settings.traveling.features.enabled',
	TRAVELING_ADD_CITY_FOR_BUS_TERMINAL: 'settings.traveling.addCityForBusTerminal',
	TRAVELING_ADD_LOCALIZED_ROUTE_NAME: 'settings.traveling.addLocalizedRouteName',
	TRAVELING_ADD_TRAVEL_TIMES: 'settings.traveling.addTravelTimes',
	TRAVELING_AUTO_SELECT_TRANSPORT_START_CITY: 'settings.traveling.autoSelectTransportStartCity',
	TRAVELING_AUTO_SELECT_TRANSPORT_START_TIME: 'settings.traveling.autoSelectTransportStartTime',

	// Character specific settings and data
	CHARACTERS_BASE: 'characters.',
	ATTRIBUTES: 'characters.<n>.attributes',
	CHARACTER_NAME: 'characters.<n>.name',
	CHARACTER_PORTRAIT: 'characters.<n>.portraitUrl',
	CITY_NAME: 'characters.<n>.cityName',
	DATE_FORMAT_TYPE_ID: 'characters.<n>.dateFormatTypeId',
	LANGUAGE_ID: 'characters.<n>.languageId',
	TIME_FORMAT_TYPE_ID: 'characters.<n>.timeFormatTypeId',
	
	// Language specific settings and data
	CITIES: 'languages.<n>.cities',
	LOCALES_TYPES: 'languages.<n>.localeTypes',
	
	
	GetLocaleIconUrlPrefKey: function GetLocaleIconUrlPrefKey(n) {
		return this.LOCALES_IMAGE_URL.replace('<n>', n);		
	}
};
