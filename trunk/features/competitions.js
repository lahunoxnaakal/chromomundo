/*
 * competitions.js
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

var pm_Competitions = {
	COMPETITION_LINK_ON_INVITATION_XPATH: "/html/body/table[3]/tbody/tr/td[1]/div[3]/form/table/tbody/tr/td/div/a[starts-with(@href, 'Competition.asp')]",

	/**
	 * Open show:
	 * /common/Competition.asp?action=InviteArtist&CompetitionID=<x>&T=<y>
	 * /common/Competition.asp?action=AddOpenInvite&CompetitionID=<x>&T=<y>
	 * 
	 * Open booking:
	 * /common/Performances.asp?action=Accept&PerformanceID=<x>&ArtistID=<y>
	 * /common/Competition.asp?action=DeleteInvite&CompetitionID=<x>&PerformanceID=<y>
	 * 
	 * Invited:
	 * /common/Competition.asp?action=DeleteInvite&CompetitionID=<x>&PerformanceID=<y>
	 * 
	 * Booked:
	 * <no link>
	 * 
	 * Band link:
	 * /common/Artist.asp?action=view&ArtistID=<x>
	 */
	colorizeCompetitionEntries: function colorizeCompetitionEntries(doc)
	{
		try
		{
			if (!pm_Prefs.isEnabled(pm_PrefKeys.COMPETITIONS_COLOR_ENTRIES))
			{
				return;
			}
			
			var regexp1 = /Competition\.asp\?action\=AddOpenInvite/i;
			var regexp2 = /Performances\.asp\?action\=Accept/i;
			var regexp3 = /Competition\.asp\?action\=DeleteInvite/i;
			//var regexp4 = /Artist\.asp\?action\=view/i;
	
			var xpath1 = "/html/body/table[last()]/tbody/tr/td[1]/table[2]/tbody";
			var table = pm_XPathFirstNode(xpath1, doc);
			
			var rows = table.getElementsByTagName('tr');
		
			for (var i = 0, row; row = rows[i]; i++)
			{
				var tableCells = row.cells;
				var td3 = tableCells.item(2);
		
				if (td3.innerHTML.match(regexp1))
				{
					pm_Logger.debug('Open show');
					
					if (row.bgColor)
					{
						row.bgColor = '#ffc0c0';
					}
					else
					{
						row.bgColor = '#ffd0d0';
					}
				}
				else if (td3.innerHTML.match(regexp2)) 
				{
					pm_Logger.debug('Open booking');
					
					if (row.bgColor)
					{
						row.bgColor = '#f7f7f7'; //'#ffd0b0';
					}
					else
					{
						row.bgColor = '#ffffff'; //'#ffe0c0';
					}
				}
				else if (td3.innerHTML.match(regexp3))
				{
					pm_Logger.debug('Invited');
					
					if (row.bgColor)
					{
						row.bgColor = '#ffffc0';
					}
					else
					{
						row.bgColor = '#ffffd0';
					}
				}
				else 
				{
					pm_Logger.debug('Booked');
					
					if (row.bgColor)
					{
						row.bgColor = '#c0ffc0';
					}
					else
					{
						row.bgColor = '#d0ffd0';
					}
				}
			}
		}
		catch (err) 
		{
			pm_Logger.logError(err);
		}
	},
	
	MakeCompetitionsInvitesVisible:
	function MakeCompetitionsInvitesVisible(doc)
	{
		try
		{
			var nodes = pm_XPathOrderedSnapshot(this.COMPETITION_LINK_ON_INVITATION_XPATH, doc);
		}
		catch (err)
		{
			pm_Logger.logError(err);
		}
	}
};
