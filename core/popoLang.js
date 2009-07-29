/**
 * popoLang.js
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

/** 
 * See also: http://wiki.mozilla.org/L10n:Simple_locale_names
 */
var pm_LanguageIdMap = {
	0: 'en', // default language
	1: 'sv', // Svenska
	2: 'en-US', // US English
	3: 'de', // Deutsch
	4: 'it', // Italiano
	5: 'fr', // Français
	6: 'es', // Español
	7: 'nb', // Norwegian (bokmål)
	8: 'dk', // Dansk
	9: 'fi', // Suomi
	10: 'nl', // Nederlands
	11: 'pt', // Português
	12: 'ja', // Japanese
	13: 'pl', // Polski
	14: 'ru', // Russian
	15: 'zh-SG', // Chinese, Singapore
	16: 'hi', // Hindi
	17: 'ko', // Korean
	18: 'th', // Thai
	19: 'tr', // Türkçe
	20: 'en-GB-scottish', // Scottish English (sco/en-GB-scottish)
	21: 'ga', // Irish
	22: 'ar', // Arabic
	23: 'ro', // Romanian
	24: 'en-GB', // UK English
	25: 'is', // Icelandic
	26: 'de-AT', // Austrian German
	27: 'nl-BE', // Belgian (Belgium has 3 official languages: nl, fr, de)
	28: 'ms', // Malay
	29: 'de-CH', // Swiss (Switzerland has 4 official languages: de, fr, it, rm)
	30: 'en-AU', // Aussie English
	32: 'sr', // Serbian
	33: 'hu', // Magyar
	34: 'el', // Ellinika
	35: 'cs', // Cesky
	36: 'et', // Estonian
	37: 'lv', // Latviesu
	38: 'in', // Indonesian
	39: 'hr', // Hrvatski
	40: 'iw', // Hebrew
	41: 'zh', // Chinese, traditional
	42: 'fr-CA', // French-Quebec
	43: 'bg', // Bulgarian
	44: 'cy', // Welsh
	45: 'sl', // Slovenian
	49: 'es-CL', // Español, Chile
	50: 'pt-BR', // Português, Brasil
	51: 'es-AR', // Español, Argentina (was: es-419 Español, Latinoamericano)
	53: 'sk', // Slovak
	54: 'ur', // Pakistani
	55: 'vi', // Vietnamese
	56: 'lt', // Lietuviu
	57: 'uk', // Ukrainian
	58: 'bs', // Bosnian
	59: 'es-CO', // Español, Colombia
	60: 'es-UY', // Español, Uruguay
	61: 'es-PE', // Español, Peru
	62: 'es-VE', // Español, Venezuela
	63: 'af', // South African Tribal (Afrikaans?)
	65: 'vls', // Vlaams
	66: 'ca', // Català
	67: 'es-MX', // Español, Mexico
	68: 'fil', // Filipino
	69: 'en-NE', // Nigerian
	70: 'fo', // Faroese
	72: 'ms-ID', // Bahasa, Indonesia
	73: 'ms-SG', // Singapore (Malay or English?)
	74: 'gl', // Galego
	75: 'fa', // Persian
	76: 'ku', // Kurdish
	77: 'lb', // Luxembourgian
	80: 'ar-TN', // N.Africa, Tunisiyah
	81: 'fr-SN', // Senegal
	82: 'sw', // Swahili
	83: 'mk', // Macedonian
	84: 'be', // Belarusian
	85: 'sq', // Albanian
	86: 'ky', // Kyrgyz
	87: 'mt', // Maltese
	88: 'es-CR', // Español, Costa Rica
	89: 'es-BO', // Español, Bolivia
	90: 'ka', // Georgian
	91: 'ar-JO', // Arabic, Jordan
	92: 'hy', // Armenia
	93: 'kk', // Kazakki
	94: 'nl-SR', // Surinam
	//96: '', // -
	//99: '', // -
	//100: '', // -
	105: 'tl', // Tagalog
	106: 'zh-CN' // Chinese, Mainland
};

//////////////////////////////////////////////////////////////////////
var pm_PopoLang = {
	detectedLangId: 0,
	
	CITY_INFO_XPATH: "//tr[@class='MainMenu']/td[1]/a[1]",

/**
 *   1: På stan    Karaktär          Karriär    Bolag         VD              Plats            Community     VIP   	[Telefonbok]         [Sök]      [Forum]   [Hjälp]                  [Logga ut]
 *   2: City       Character         Career     Company       CEO             Location         Community     VIP   	[Phone book]         [Search]   [Forum]   [Help]                   [Logout]
 *  24: City       Character         Career     Company                       Location         Community     VIP   	[Phone book]         [Search]   [Forum]   [Help]                   [Logout]
 *   3: Stadt      Charakter         Karriere   Unternehmen   GeFü            Standort         Community     VIP   	[Telefonbuch]        [Suchen]   [Forum]   [Hilfe]                  [Ausloggen]	
 *   4: Città      Personaggio       Band       Azienda       CEO             Luogo            Comunità      VIP   	[Rubrica]            [Cerca]    [Forum]   [Guida - Aiuto in linea] [Esci] 
 *   5: Ville      Personnage        Carrière   Entreprise    PDG             Lieu             Communauté    VIP   	[Annuaire]           [Chercher] [Forum]   [Aide]                   [Quitter]
 *   6: Ciudad     Personaje         Carrera    Compañía      CEO             Ubicación        Comunidad     VIP   	[Agenda telefónica]  [Buscar]   [Foro]    [Ayuda]                  [Salir]
 *  51: Ciudad     Personaje         Carrera    Compañía      CEO             Ubicación        Comunidad     VIP   	[Lista Telefónica]   [Buscar]   [Foro]    [Ayuda]                  [Salir]
 *   7: By         Karakter          Karriere   Firma         CEO             Sted             Samfunn       VIP   	[Telefonbok]         [Søk]      [Forum]   [Hjelp]                  [Logg ut]
 *   8: By         Karakter          Karriere   Firma         Direktør        Opholdssted      Samfund       VIP   	[Telefonbog]         [Søg]      [Forum]   [Hjælp]                  [Log ud]
 *   9: Kaupunki   Hahmo             Ura        Yritys        TJ              Sijainti         Yhteisö       VIP   	[Puhelinmuistio]     [Haku]     [Foorumi] [Apua]                   [Poistu] 
 *  10: Stad       Personage         Carrière   Bedrijf       CEO             Locatie          Gemeenschap   VIP   	[Telefoonboek]       [Zoeken]   [Forum]   [Handleiding]            [Log uit] 
 *  11: Cidade     Personagem        Carreira   Empresa       CEO             Local            Comunidade    VIP   	[Lista Telefónica]   [Procura]  [Fórum]   [Ajuda]                  [Sair] 
 *  14:	Город      Персонаж          Карьера    Компания                      Локация          Сообщество    VIP   	[Телефонная Книга]   [Поиск]    [Форум]   [Помощь]                 [Выход] 
 *  50: Cidade     Personagem        Carreira   Cia           CEO             Local            Comunidade    VIP   	[Lista de telefones] [Procurar] [Fórum]   [Ajuda]                  [Sair] 
 *  15: 城市        人物               演艺事业    公司           执行总裁         位置              社区           VIP	[电话号码簿]           [搜索]      [论坛]    [帮助]                    [注销]
 * 106: 城市        人物               演艺事业    公司                           位置              社区          VIP		[电话号码簿]           [搜索]      [论坛]    [帮助]                    [注销] 
 *  19: Şehir      Karakter          Kariyer    Şirket        Yönetici        Yer              Camia         VIP   	[Telefon Defteri]    [Arama]    [Forum]   [Yardım]                 [Çıkış] 
 *  23: Oraş       Personaj          Carieră    Companie                      Locaţie          Comunitate    VIP   	[Cartea de telefon]  [Caută]    [Forum]   [Ajutor]                 [Deconectare]
 *  32: Grad       Osoba             Bend       Kompanija     CEO             Lokacija         Zajednica     VIP   	[Telefonski imenik]  [Traži]    [Forum]   [Pomoć]                  [Izlaz] 
 *  39: Grad       Osobna Stranica   Bend       Tvrtka        CEO             Lokacija         Zajednica     VIP   	[Telefonski imenik]  [Traži]    [Forum]   [Pomoć]                  [Izlaz]
 *  58: Grad       Lična Karta       Bend       Kompanija                     Lokacija         Zajednica     VIP   	[Telefonski imenik]  [Traži]    [Forum]   [Pomoć]                  [Odlogiraj se]
 *  33: Város      Karakter          Karrier    Cég                           Hol vagy most?   Közösség      VIP   	[Telefonkönyv]       [Keresés]  [Fórum]   [Súgó]                   [Kijelentkezés]
 *  36: Linn       Tegelane          Karjäär    Firma         Tegevdirektor   Asukoht          Kogukond      VIP   	[Telefoni raamat]    [Otsing]   [Foorum]  [Abi]                    [Logi Välja] 
 *  56: Miestas    Veikėjas          Karjera    Kompanija     CEO             Vieta            Bendruomenė   VIP   	[Telefonų knyga]     [Paieška]  [Forumas] [Pagalba]                [Atsijungti]
 *  66: Ciutat     Personatge        Carrera    Empresa                       Ubicació         Comunitat     VIP   	[Agenda]             [Cerca]    [Fòrum]   [Ajuda]                  [Desconnecta]
 */ 	
	langDetectionStrings: {
		'P\u00e5 stan': 1,  // sv
		'City': 2,          // en-US, en-GB
		//'City': 2,        // en-US
		'Stadt': 3,         // de
	 	'Citt\u00e0': 4,    // it
		'Ville': 5,         // fr
		'Ciudad': 6,        // es, es-AR
		//'Ciudad': 6,      // es
		'By': 7,            // nb, da
		//'By': 7,          // nb
		//'By': 8->7,       // da
		'Kaupunki': 9,      // fi
		'Stad': 10,         // nl
		'Cidade': 11,       // pt, pt-BR
		//'Cidade': 11,     // pt
		'Miasto': 13,       //pl
		'\u0413\u043e\u0440\u043e\u0434': 14, // ru
		'\u57ce\u5e02': 15, // zh (zh-SG, zh-CN)
		//'\u57ce\u5e02': 15, // zh-SG
		'\u015eehir': 19,   // tr
		'Ora\u015f': 23,    // ro
		//'City': 24->2,    // en-GB
		'Grad': 32,         // sr, hr
		//'Grad': 32,       // sr
		'V\u00e1ros': 33,   // hu
		'Linn': 36,         // et
		//'Grad': 39->32,   // hr
		//'Cidade': 50->11, // pt-BR
		//'Ciudad': 51->6,  // es-AR
		'Miestas': 56,      // lt
		//'Grad': 58->32,	// bs
		'Ciutat': 66        // ca
		//'\u57ce\u5e02': 106->15, // zh-CN
	},
	
	detectLanguage: function detectLanguage(doc, langId) {
		this.detectedLangId = 0;
	
		var cityInfoElem = pm_XPathFirstNode(this.CITY_INFO_XPATH, doc);

		if (cityInfoElem != null) {
			var cityInfoStr = pm_Trim(cityInfoElem.textContent);
			pm_Logger.debug("City Info='"+ cityInfoStr +"'");
			this.detectedLangId = this.langDetectionStrings[cityInfoStr];
			
			switch (this.detectedLangId) {
				case 2: // en-US
					if (langId == 24) { // en-GB
						this.detectedLangId = langId;
					}
					break;
				case 6: // es
					if (langId == 51) { // es-AR
						this.detectedLangId = langId;
					}
					break;
				case 7: // nb
					if (langId == 8) { // da
						this.detectedLangId = langId;
					}
					break;
				case 11: // pt
					if (langId == 50) { // pt-BR
						this.detectedLangId = langId;
					}
					break;
				case 15: // zh-SG
					if (langId == 106) { // zh-CN
						this.detectedLangId = langId;
					}
					break;
				case 32: // sr
					if (langId == 39) { // hr
						this.detectedLangId = langId;
					}
					break;
			}

			pm_Logger.debug('Detected langId='+ this.detectedLangId +' '+ 
				pm_LanguageIdMap[this.detectedLangId]);
		}
		else {
			pm_Logger.logError('City node not available');
		}
	
		return this.detectedLangId;
	}
};
