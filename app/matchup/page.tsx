"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Team {
  id: number;
  name: string;
  wins: number;
  losses: number;
  pointsFor: number;
  roster: any[];
}

interface Matchup {
  homeTeam: Team;
  awayTeam: Team;
  homeProjected: number;
  awayProjected: number;
  winProbability: number;
  isMyMatchup: boolean;
}

export default function MatchupPage() {
  const [matchups, setMatchups] = useState<Matchup[]>([]);
  const [currentWeek, setCurrentWeek] = useState<number>(0);
  const [leagueName, setLeagueName] = useState<string>("");
  const [myTeamId, setMyTeamId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Load matchup data from localStorage
    const leagueData = localStorage.getItem("leagueData");
    const selectedTeamId = localStorage.getItem("selectedTeamId");

    if (leagueData) {
      const data = JSON.parse(leagueData);
      const espn = data.espnData;

      if (espn?.teams) {
        setLeagueName(espn.leagueName || "Your League");
        setCurrentWeek(espn.currentMatchupPeriod || 1);
        setMyTeamId(espn.selectedTeamId || Number(selectedTeamId));

        // Generate matchups from teams
        const generatedMatchups = generateMatchups(
          espn.teams,
          espn.selectedTeamId || Number(selectedTeamId),
          espn.matchups || []
        );
        setMatchups(generatedMatchups);
      }
    }
    setLoading(false);
  }, []);

  const refreshLeagueData = async () => {
    setRefreshing(true);
    try {
      const espnConfig = localStorage.getItem("espnConfig");
      if (!espnConfig) {
        alert("No ESPN connection found. Please connect your league first.");
        return;
      }

      const config = JSON.parse(espnConfig);
      const response = await fetch("/api/espn/league", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh league data");
      }

      const data = await response.json();
      const espnData = {
        scoringFormat: data.scoringFormat,
        leagueSize: data.leagueSize,
        roster: data.teams.find((t: any) => t.id === myTeamId)?.roster || [],
        availablePlayers: data.availablePlayers,
        rawText: `ESPN League ${data.leagueName}`,
        espnData: {
          leagueName: data.leagueName,
          currentMatchupPeriod: data.currentMatchupPeriod,
          teams: data.teams,
          selectedTeamId: myTeamId,
          matchups: data.matchups,
        },
      };

      localStorage.setItem("leagueData", JSON.stringify(espnData));

      // Reload the page data
      setLeagueName(data.leagueName || "Your League");
      setCurrentWeek(data.currentMatchupPeriod || 1);
      const generatedMatchups = generateMatchups(
        data.teams,
        myTeamId!,
        data.matchups || []
      );
      setMatchups(generatedMatchups);
    } catch (error) {
      console.error("Refresh error:", error);
      alert("Failed to refresh league data. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  const generateMatchups = (teams: Team[], myId: number, matchupData: any[]): Matchup[] => {
    // Use real matchup data from ESPN
    if (matchupData && matchupData.length > 0) {
      return matchupData.map((matchup: any) => {
        const homeTeam = teams.find((t: any) => t.id === matchup.homeTeamId);
        const awayTeam = teams.find((t: any) => t.id === matchup.awayTeamId);

        const homeProjected = matchup.homeProjected;
        const awayProjected = matchup.awayProjected;

        // Calculate win probability based on projected points
        const totalProjected = homeProjected + awayProjected;
        const winProbability =
          totalProjected > 0 ? (homeProjected / totalProjected) * 100 : 50;

        return {
          homeTeam: homeTeam!,
          awayTeam: awayTeam!,
          homeProjected,
          awayProjected,
          winProbability,
          isMyMatchup: homeTeam?.id === myId || awayTeam?.id === myId,
        };
      }).filter((m: any) => m.homeTeam && m.awayTeam);
    }

    // Fallback: pair teams sequentially if no matchup data
    const matchupList: Matchup[] = [];
    const sortedTeams = [...teams].sort((a, b) => a.id - b.id);

    for (let i = 0; i < sortedTeams.length; i += 2) {
      if (i + 1 < sortedTeams.length) {
        const team1 = sortedTeams[i];
        const team2 = sortedTeams[i + 1];

        const team1Projected = team1.roster?.reduce(
          (sum, p) => sum + (p.projectedPoints || 0),
          0
        ) || 0;
        const team2Projected = team2.roster?.reduce(
          (sum, p) => sum + (p.projectedPoints || 0),
          0
        ) || 0;

        const totalProjected = team1Projected + team2Projected;
        const winProbability =
          totalProjected > 0 ? (team1Projected / totalProjected) * 100 : 50;

        matchupList.push({
          homeTeam: team1,
          awayTeam: team2,
          homeProjected: team1Projected,
          awayProjected: team2Projected,
          winProbability,
          isMyMatchup: team1.id === myId || team2.id === myId,
        });
      }
    }

    return matchupList;
  };

  if (loading) {
    return (
      <main className="min-h-screen py-12 bg-gradient-to-br from-[#000918] via-[#051639] to-[#020712]">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/70">Loading matchups...</p>
          </div>
        </div>
      </main>
    );
  }

  if (matchups.length === 0) {
    return (
      <main className="min-h-screen py-12 bg-gradient-to-br from-[#000918] via-[#051639] to-[#020712]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-3xl p-12 shadow-2xl">
              <div className="text-6xl mb-4">⚔️</div>
              <h2 className="text-2xl font-bold text-[#0B1E3D] mb-2">
                No Matchup Data Available
              </h2>
              <p className="text-gray-600 mb-6">
                Connect to your ESPN league to see this week&apos;s matchups.
              </p>
              <Link
                href="/connect"
                className="inline-block bg-gradient-to-r from-[#26D36B] to-[#1A8CFF] text-[#0B1E3D] py-3 px-6 rounded-xl font-bold hover:shadow-2xl hover:shadow-[#26D36B]/30 transform hover:scale-105 transition-all duration-200"
              >
                Connect League
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-12 bg-gradient-to-br from-[#000918] via-[#051639] to-[#020712]">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#26D36B]/20 backdrop-blur-sm border border-[#26D36B]/30 rounded-full mb-6">
              <span className="text-2xl">⚔️</span>
              <span className="text-sm font-semibold text-[#26D36B]">
                Week {currentWeek} Matchups
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">
              {leagueName}
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-6">
              See how every team stacks up this week
            </p>
            <button
              onClick={refreshLeagueData}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/50 rounded-full text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {refreshing ? "Refreshing..." : "Refresh League Data"}
            </button>
          </div>

          {/* Matchups Grid */}
          <div className="space-y-6">
            {matchups.map((matchup, index) => (
              <div
                key={index}
                className={`bg-white rounded-3xl p-8 shadow-2xl ${
                  matchup.isMyMatchup
                    ? "ring-4 ring-[#26D36B] ring-opacity-50"
                    : ""
                }`}
              >
                {matchup.isMyMatchup && (
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <div className="px-4 py-2 bg-[#26D36B] text-white rounded-full text-sm font-bold">
                      YOUR MATCHUP
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-3 gap-6 items-center">
                  {/* Home Team */}
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl shadow-xl">
                      {matchup.homeTeam.id === myTeamId ? "👑" : "👤"}
                    </div>
                    <h3 className="text-xl font-bold text-[#0B1E3D] mb-2">
                      {matchup.homeTeam.name}
                    </h3>
                    <div className="flex items-center justify-center gap-3 text-sm text-gray-600 mb-4">
                      <span className="font-semibold">
                        {matchup.homeTeam.wins}-{matchup.homeTeam.losses}
                      </span>
                      <span>•</span>
                      <span>{matchup.homeTeam.pointsFor.toFixed(1)} PF</span>
                    </div>
                    <div className="bg-gradient-to-br from-[#1A8CFF]/10 to-[#1A8CFF]/20 border border-[#1A8CFF]/30 rounded-2xl p-4">
                      <div className="text-sm text-gray-600 mb-1">
                        Projected
                      </div>
                      <div className="text-3xl font-bold text-[#1A8CFF]">
                        {matchup.homeProjected.toFixed(1)}
                      </div>
                      {matchup.winProbability >= 50 && (
                        <div className="text-xs text-[#26D36B] font-semibold mt-2">
                          ↑ Favored
                        </div>
                      )}
                    </div>
                  </div>

                  {/* VS & Win Probability */}
                  <div className="text-center">
                    <div className="text-gray-300 font-extrabold text-2xl mb-6">
                      VS
                    </div>

                    {/* Win Probability Bar */}
                    <div className="bg-gray-100 rounded-xl p-4">
                      <div className="flex justify-between text-xs mb-3 text-gray-600">
                        <span>Win Probability</span>
                        <span className="text-[#1A8CFF] font-bold">
                          {matchup.winProbability.toFixed(0)}% /{" "}
                          {(100 - matchup.winProbability).toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#1A8CFF] to-[#26D36B] rounded-full transition-all duration-500"
                          style={{ width: `${matchup.winProbability}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 mt-4">
                      Based on projected points
                    </div>
                  </div>

                  {/* Away Team */}
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl shadow-xl">
                      {matchup.awayTeam.id === myTeamId ? "👑" : "👤"}
                    </div>
                    <h3 className="text-xl font-bold text-[#0B1E3D] mb-2">
                      {matchup.awayTeam.name}
                    </h3>
                    <div className="flex items-center justify-center gap-3 text-sm text-gray-600 mb-4">
                      <span className="font-semibold">
                        {matchup.awayTeam.wins}-{matchup.awayTeam.losses}
                      </span>
                      <span>•</span>
                      <span>{matchup.awayTeam.pointsFor.toFixed(1)} PF</span>
                    </div>
                    <div className="bg-gradient-to-br from-[#26D36B]/10 to-[#26D36B]/20 border border-[#26D36B]/30 rounded-2xl p-4">
                      <div className="text-sm text-gray-600 mb-1">
                        Projected
                      </div>
                      <div className="text-3xl font-bold text-[#26D36B]">
                        {matchup.awayProjected.toFixed(1)}
                      </div>
                      {matchup.winProbability < 50 && (
                        <div className="text-xs text-[#26D36B] font-semibold mt-2">
                          ↑ Favored
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info Banner */}
          <div className="mt-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
            <p className="text-white/70 text-sm">
              💡 Tip: Projected points are calculated from your ESPN roster data. Win probabilities are estimates based on current projections.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
