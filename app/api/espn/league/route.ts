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

    // Build the ESPN API URL
    const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${seasonId}/segments/0/leagues/${leagueId}?view=mTeam&view=mRoster&view=mMatchup&view=mSettings`;

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

    // Transform ESPN data to our format
    const transformedData = transformESPNData(espnData);

    return NextResponse.json(transformedData);
  } catch (error: any) {
    console.error("ESPN API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch league data" },
      { status: 500 }
    );
  }
}

function transformESPNData(espnData: any) {
  // Get the user's team (first team for now - in production, you'd identify the user's team)
  const myTeam = espnData.teams?.[0];

  if (!myTeam) {
    throw new Error("No team data found");
  }

  // Extract roster
  const roster = myTeam.roster?.entries?.map((entry: any) => ({
    name: entry.playerPoolEntry?.player?.fullName || "Unknown Player",
    position: getPositionName(entry.playerPoolEntry?.player?.defaultPositionId),
    team: entry.playerPoolEntry?.player?.proTeamId
      ? getTeamAbbreviation(entry.playerPoolEntry.player.proTeamId)
      : "FA",
    projectedPoints: entry.playerPoolEntry?.player?.stats?.find((s: any) => s.statSourceId === 1)?.appliedTotal || 0,
  })) || [];

  // Get available players (free agents) - this would need a separate API call in production
  const availablePlayers: any[] = [];

  return {
    scoringFormat: espnData.settings?.scoringSettings?.scoringType === 0 ? "Standard" : "PPR",
    leagueSize: espnData.settings?.size || espnData.teams?.length || 10,
    roster,
    availablePlayers,
    rawText: `ESPN League ${espnData.settings?.name || ""}`,
    espnData: {
      leagueName: espnData.settings?.name,
      currentMatchupPeriod: espnData.scoringPeriodId,
      teams: espnData.teams?.map((t: any) => ({
        id: t.id,
        name: `${t.location} ${t.nickname}`,
        wins: t.record?.overall?.wins || 0,
        losses: t.record?.overall?.losses || 0,
        pointsFor: t.record?.overall?.pointsFor || 0,
      })),
    },
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
