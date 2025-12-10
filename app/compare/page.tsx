"use client";

import { useState, useEffect } from "react";

interface Player {
  name: string;
  position: string;
  team?: string;
  projectedPoints?: number;
}

interface Team {
  id: number;
  name: string;
  wins: number;
  losses: number;
  roster: Player[];
}

export default function TradeAnalyzerPage() {
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [myTeamId, setMyTeamId] = useState<number | null>(null);
  const [myRoster, setMyRoster] = useState<Player[]>([]);
  const [scoringFormat, setScoringFormat] = useState<string>("Standard");

  // Team A (Your Team)
  const [teamAPlayers, setTeamAPlayers] = useState<Player[]>([]);
  const [teamASearch, setTeamASearch] = useState("");

  // Team B (Trade Partner)
  const [selectedTradePartner, setSelectedTradePartner] = useState<Team | null>(null);
  const [teamBPlayers, setTeamBPlayers] = useState<Player[]>([]);
  const [teamBSearch, setTeamBSearch] = useState("");

  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string>("");

  useEffect(() => {
    // Load league data from localStorage
    const leagueData = localStorage.getItem("leagueData");
    const selectedTeamId = localStorage.getItem("selectedTeamId");

    if (leagueData) {
      const data = JSON.parse(leagueData);
      setMyRoster(data.roster || []);
      setScoringFormat(data.scoringFormat || "Standard");

      if (data.espnData?.teams) {
        setAllTeams(data.espnData.teams);
        setMyTeamId(data.espnData.selectedTeamId || Number(selectedTeamId));
      }
    }
  }, []);

  const availableTeamAPlayers = myRoster.filter(
    (p) => !teamAPlayers.find((tp) => tp.name === p.name) &&
           p.name.toLowerCase().includes(teamASearch.toLowerCase())
  );

  const availableTeamBPlayers = selectedTradePartner
    ? selectedTradePartner.roster.filter(
        (p) => !teamBPlayers.find((tp) => tp.name === p.name) &&
               p.name.toLowerCase().includes(teamBSearch.toLowerCase())
      )
    : [];

  const handleAnalyzeTrade = async () => {
    if (teamAPlayers.length === 0 || teamBPlayers.length === 0 || !selectedTradePartner) {
      return;
    }

    setAnalyzing(true);
    setAnalysis("");

    try {
      const response = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          myTeam: {
            giving: teamAPlayers,
            roster: myRoster,
          },
          theirTeam: {
            giving: teamBPlayers,
            roster: selectedTradePartner.roster,
            name: selectedTradePartner.name,
          },
          scoringFormat,
        }),
      });

      const data = await response.json();
      setAnalysis(data.analysis || data.comparison);
    } catch (error) {
      setAnalysis("Failed to generate trade analysis. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <main className="min-h-screen py-8 sm:py-12 bg-gradient-to-br from-[#000918] via-[#051639] to-[#020712]">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full mb-4 sm:mb-6">
              <span className="text-xl sm:text-2xl">🔄</span>
              <span className="text-xs sm:text-sm font-semibold text-purple-400">
                AI-Powered Trade Analysis
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-3 sm:mb-4 px-4">
              Trade Analyzer
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto px-4">
              Evaluate multi-player trades based on team needs and roster composition
            </p>
          </div>

          {/* Trade Partner Selection */}
          {!selectedTradePartner && (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-[#0B1E3D] mb-4 sm:mb-6">
                Select Trade Partner
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {allTeams
                  .filter((team) => team.id !== myTeamId)
                  .map((team) => (
                    <button
                      key={team.id}
                      onClick={() => setSelectedTradePartner(team)}
                      className="text-left p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-purple-50 hover:to-purple-100 border-2 border-gray-200 hover:border-purple-400 rounded-xl sm:rounded-2xl transition-all duration-200"
                    >
                      <h3 className="text-base sm:text-lg font-bold text-[#0B1E3D] mb-2">
                        {team.name}
                      </h3>
                      <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                        <span>{team.wins}-{team.losses}</span>
                        <span>•</span>
                        <span>{team.roster?.length || 0} players</span>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Trade Builder */}
          {selectedTradePartner && (
            <>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Your Team (Giving) */}
                <div className="bg-white rounded-3xl p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-[#0B1E3D]">
                      You Give
                    </h2>
                    <span className="px-3 py-1 bg-[#1A8CFF]/20 text-[#1A8CFF] text-sm font-semibold rounded-full">
                      Your Team
                    </span>
                  </div>

                  {/* Selected Players */}
                  {teamAPlayers.length > 0 && (
                    <div className="mb-4 space-y-2">
                      {teamAPlayers.map((player, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 bg-gradient-to-br from-[#1A8CFF]/10 to-[#1A8CFF]/20 border border-[#1A8CFF]/30 rounded-xl"
                        >
                          <div>
                            <div className="font-semibold text-[#0B1E3D]">
                              {player.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {player.position} • {player.team || "FA"}
                              {player.projectedPoints && ` • ${player.projectedPoints.toFixed(2)} pts`}
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              setTeamAPlayers(teamAPlayers.filter((p) => p.name !== player.name))
                            }
                            className="text-gray-400 hover:text-red-600"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Player */}
                  <input
                    type="text"
                    value={teamASearch}
                    onChange={(e) => setTeamASearch(e.target.value)}
                    placeholder="Search your roster to add..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1A8CFF] focus:outline-none transition-colors mb-4 text-gray-900"
                  />
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {availableTeamAPlayers.slice(0, 10).map((p, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setTeamAPlayers([...teamAPlayers, p]);
                          setTeamASearch("");
                        }}
                        className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-[#1A8CFF]/10 rounded-xl transition-colors"
                      >
                        <div className="font-semibold text-[#0B1E3D]">{p.name}</div>
                        <div className="text-sm text-gray-600">
                          {p.position} • {p.team || "FA"}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trade Partner (Receiving) */}
                <div className="bg-white rounded-3xl p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-[#0B1E3D]">
                      You Receive
                    </h2>
                    <button
                      onClick={() => {
                        setSelectedTradePartner(null);
                        setTeamBPlayers([]);
                        setTeamBSearch("");
                      }}
                      className="px-3 py-1 bg-[#26D36B]/20 text-[#26D36B] text-sm font-semibold rounded-full hover:bg-[#26D36B]/30"
                    >
                      {selectedTradePartner.name} ✕
                    </button>
                  </div>

                  {/* Selected Players */}
                  {teamBPlayers.length > 0 && (
                    <div className="mb-4 space-y-2">
                      {teamBPlayers.map((player, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 bg-gradient-to-br from-[#26D36B]/10 to-[#26D36B]/20 border border-[#26D36B]/30 rounded-xl"
                        >
                          <div>
                            <div className="font-semibold text-[#0B1E3D]">
                              {player.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {player.position} • {player.team || "FA"}
                              {player.projectedPoints && ` • ${player.projectedPoints.toFixed(2)} pts`}
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              setTeamBPlayers(teamBPlayers.filter((p) => p.name !== player.name))
                            }
                            className="text-gray-400 hover:text-red-600"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Player */}
                  <input
                    type="text"
                    value={teamBSearch}
                    onChange={(e) => setTeamBSearch(e.target.value)}
                    placeholder="Search their roster to add..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#26D36B] focus:outline-none transition-colors mb-4 text-gray-900"
                  />
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {availableTeamBPlayers.slice(0, 10).map((p, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setTeamBPlayers([...teamBPlayers, p]);
                          setTeamBSearch("");
                        }}
                        className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-[#26D36B]/10 rounded-xl transition-colors"
                      >
                        <div className="font-semibold text-[#0B1E3D]">{p.name}</div>
                        <div className="text-sm text-gray-600">
                          {p.position} • {p.team || "FA"}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Analyze Button */}
              {teamAPlayers.length > 0 && teamBPlayers.length > 0 && (
                <div className="text-center mb-8">
                  <button
                    onClick={handleAnalyzeTrade}
                    disabled={analyzing}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#26D36B] to-[#1A8CFF] text-[#0B1E3D] rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-[#26D36B]/30 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {analyzing ? "Analyzing Trade..." : "Analyze Trade"}
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Trade Analysis Result */}
              {analysis && (
                <div className="bg-white rounded-3xl p-8 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#26D36B] to-[#1A8CFF] rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-[#0B1E3D]">Trade Analysis</h2>
                  </div>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                      {analysis}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-6 italic">
                    🤖 Powered by GPT-4o
                  </p>
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!selectedTradePartner && allTeams.length === 0 && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12 text-center">
              <div className="text-6xl mb-4">🔄</div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Connect to ESPN League First
              </h3>
              <p className="text-white/70">
                You need to connect to your ESPN league to use the trade analyzer
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
