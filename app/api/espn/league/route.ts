import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { leagueId, seasonId, swid, espnS2 } = await request.json();

    if (!leagueId || !seasonId) {
      return NextResponse.json(
        { error: "League ID and Season ID are required" },
        { status: 400 }
      );
    }

    // Build the ESPN API URL - add kona_player_info to get free agents
    const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${seasonId}/segments/0/leagues/${leagueId}?view=mTeam&view=mRoster&view=mMatchup&view=mSettings&view=kona_player_info`;

    // Prepare headers
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Add cookies for private leagues
    if (swid && espnS2) {
      headers.Cookie = `swid=${swid}; espn_s2=${espnS2}`;
    }

    // Fetch from ESPN API
    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`ESPN API returned ${response.status}`);
    }

    const espnData = await response.json();

    // Also fetch free agents (top available players)
    const freeAgentsUrl = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${seasonId}/segments/0/leagues/${leagueId}?view=kona_player_info&scoringPeriodId=${espnData.scoringPeriodId || seasonId}`;

    let freeAgentsData = null;
    try {
      const freeAgentsResponse = await fetch(freeAgentsUrl, { headers });
      if (freeAgentsResponse.ok) {
        freeAgentsData = await freeAgentsResponse.json();
      }
    } catch (error) {
      console.warn("Failed to fetch free agents, continuing without them:", error);
    }

    // Transform ESPN data to our format
    // Return all teams data so user can select their team
    const allTeamsData = transformESPNDataWithAllTeams(espnData, freeAgentsData);

    return NextResponse.json(allTeamsData);
  } catch (error: any) {
    console.error("ESPN API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch league data" },
      { status: 500 }
    );
  }
}

function transformESPNDataWithAllTeams(espnData: any, freeAgentsData: any = null) {
  const currentScoringPeriod = espnData.scoringPeriodId;

  const teams = espnData.teams?.map((team: any) => {
    const roster = team.roster?.entries?.map((entry: any) => {
      const player = entry.playerPoolEntry?.player;

      // Get current week projection
      const currentWeekStats = player?.stats?.find((s: any) =>
        s.scoringPeriodId === currentScoringPeriod && s.statSourceId === 1
      );

      // Get season stats
      const seasonStats = player?.stats?.find((s: any) =>
        s.statSourceId === 0 && s.scoringPeriodId === 0
      );

      return {
        id: player?.id,
        name: player?.fullName || "Unknown Player",
        position: getPositionName(player?.defaultPositionId),
        team: player?.proTeamId
          ? getTeamAbbreviation(player.proTeamId)
          : "FA",
        projectedPoints: currentWeekStats?.appliedTotal || 0,
        seasonStats: {
          totalPoints: seasonStats?.appliedTotal || 0,
          averagePoints: seasonStats?.appliedAverage || 0,
        },
        ownership: player?.ownership?.percentOwned || 0,
        injuryStatus: player?.injuryStatus || "ACTIVE",
        photoUrl: player?.id ? `https://a.espncdn.com/i/headshots/nfl/players/full/${player.id}.png` : null,
        stats: player?.stats || [],
        eligibleSlots: player?.eligibleSlots || [],
      };
    }) || [];

    return {
      id: team.id,
      name: team.name || team.teamName || `${team.location || ''} ${team.nickname || ''}`.trim() || `Team ${team.id}`,
      wins: team.record?.overall?.wins || 0,
      losses: team.record?.overall?.losses || 0,
      pointsFor: team.record?.overall?.pointsFor || 0,
      roster,
    };
  }) || [];

  // Extract free agents from player pool
  let availablePlayers: any[] = [];
  if (freeAgentsData?.players) {
    // Get all rostered player IDs to filter them out
    const rosteredPlayerIds = new Set(
      teams.flatMap((team: any) =>
        team.roster.map((p: any) => p.name)
      )
    );

    availablePlayers = freeAgentsData.players
      .filter((playerEntry: any) => {
        const player = playerEntry.player;
        const playerName = player?.fullName;

        // Only include players who are not on any roster and have a valid position
        return playerName &&
               !rosteredPlayerIds.has(playerName) &&
               player.defaultPositionId !== 0; // 0 is usually invalid
      })
      .slice(0, 50) // Get top 50 available players
      .map((playerEntry: any) => {
        const player = playerEntry.player;
        return {
          name: player.fullName || "Unknown Player",
          position: getPositionName(player.defaultPositionId),
          team: player.proTeamId
            ? getTeamAbbreviation(player.proTeamId)
            : "FA",
          projectedPoints: player.stats?.find((s: any) => s.statSourceId === 1)?.appliedTotal || 0,
        };
      })
      .sort((a: any, b: any) => (b.projectedPoints || 0) - (a.projectedPoints || 0)); // Sort by projected points
  }

  // Extract matchups from schedule
  const matchups: any[] = [];
  if (espnData.schedule) {
    const currentWeekMatchups = espnData.schedule.filter(
      (game: any) => game.matchupPeriodId === espnData.scoringPeriodId
    );

    console.log('Current scoring period:', espnData.scoringPeriodId);
    console.log('Found matchups for current week:', currentWeekMatchups.length);

    currentWeekMatchups.forEach((game: any) => {
      const homeTeam = teams.find((t: any) => t.id === game.home?.teamId);
      const awayTeam = teams.find((t: any) => t.id === game.away?.teamId);

      if (homeTeam && awayTeam) {
        const matchup = {
          homeTeamId: game.home.teamId,
          awayTeamId: game.away.teamId,
          homeProjected: game.home.totalProjectedPointsLive || game.home.totalPoints || 0,
          awayProjected: game.away.totalProjectedPointsLive || game.away.totalPoints || 0,
        };
        console.log('Matchup:', homeTeam.name, 'vs', awayTeam.name, '|', matchup.homeProjected, '-', matchup.awayProjected);
        matchups.push(matchup);
      }
    });
  }

  return {
    leagueName: espnData.settings?.name,
    scoringFormat: espnData.settings?.scoringSettings?.scoringType === 0 ? "Standard" : "PPR",
    leagueSize: espnData.settings?.size || teams.length || 10,
    currentMatchupPeriod: espnData.scoringPeriodId,
    teams, // All teams with their rosters
    availablePlayers,
    matchups, // Current week matchups
  };
}

function getPositionName(positionId: number): string {
  const positions: Record<number, string> = {
    1: "QB",
    2: "RB",
    3: "WR",
    4: "TE",
    5: "K",
    16: "DEF",
  };
  return positions[positionId] || "FLEX";
}

function getTeamAbbreviation(teamId: number): string {
  const teams: Record<number, string> = {
    1: "ATL", 2: "BUF", 3: "CHI", 4: "CIN", 5: "CLE", 6: "DAL", 7: "DEN", 8: "DET",
    9: "GB", 10: "TEN", 11: "IND", 12: "KC", 13: "LV", 14: "LAR", 15: "MIA",
    16: "MIN", 17: "NE", 18: "NO", 19: "NYG", 20: "NYJ", 21: "PHI", 22: "ARI",
    23: "PIT", 24: "LAC", 25: "SF", 26: "SEA", 27: "TB", 28: "WSH", 29: "CAR",
    30: "JAX", 33: "BAL", 34: "HOU",
  };
  return teams[teamId] || "FA";
}
