"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Player {
  name: string;
  position: string;
  team?: string;
  projectedPoints?: number;
  ownership?: {
    percentOwned?: number;
    percentStarted?: number;
  };
  seasonStats?: {
    totalPoints?: number;
    averagePoints?: number;
  };
}

interface ParsedData {
  scoringFormat?: string;
  leagueSize?: number;
  roster: Player[];
  availablePlayers: Player[];
  rawText: string;
}

export default function WaiverPage() {
  const [data, setData] = useState<ParsedData | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"priority" | "position">("priority");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [loadingAnalysis, setLoadingAnalysis] = useState<boolean>(false);

  useEffect(() => {
    const storedData = localStorage.getItem("leagueData");
    if (storedData) {
      setData(JSON.parse(storedData));
    }
  }, []);

  const generateWaiverAnalysis = async () => {
    if (!data) return;

    setLoadingAnalysis(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "waiver",
          data: {
            scoringFormat: data.scoringFormat,
            leagueSize: data.leagueSize,
            roster: data.roster,
            availablePlayers: data.availablePlayers,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate waiver analysis");
      }

      const result = await response.json();
      setAiAnalysis(result.analysis);
    } catch (error) {
      console.error("Waiver Analysis Error:", error);
      setAiAnalysis("Failed to generate waiver wire recommendations. Please try again.");
    } finally {
      setLoadingAnalysis(false);
    }
  };

  if (!data) {
    return (
      <main className="min-h-screen py-12 bg-gradient-to-br from-[#000918] via-[#051639] to-[#020712]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-3xl p-12 shadow-2xl">
              <svg
                className="mx-auto h-16 w-16 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <h2 className="text-2xl font-bold text-[#0B1E3D] mb-2">
                No Data Available
              </h2>
              <p className="text-gray-600 mb-6">
                Please upload your league screenshots first.
              </p>
              <Link
                href="/upload"
                className="inline-block bg-gradient-to-r from-[#26D36B] to-[#1A8CFF] text-[#0B1E3D] py-3 px-6 rounded-xl font-bold hover:shadow-2xl hover:shadow-[#26D36B]/30 transform hover:scale-105 transition-all duration-200"
              >
                Upload Screenshots
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Group available players by position
  const playersByPosition = data.availablePlayers.reduce((acc, player) => {
    if (!acc[player.position]) {
      acc[player.position] = [];
    }
    acc[player.position].push(player);
    return acc;
  }, {} as Record<string, Player[]>);

  const positions = ["ALL", ...Object.keys(playersByPosition).sort()];
  const displayPlayers =
    selectedPosition === "ALL"
      ? data.availablePlayers
      : playersByPosition[selectedPosition] || [];

  // Simulate priority rankings (in real app, this would come from AI)
  const getPriority = (index: number): "high" | "medium" | "low" => {
    if (index < 3) return "high";
    if (index < 8) return "medium";
    return "low";
  };

  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "bg-gradient-to-br from-red-50 to-red-100 text-red-700 border-red-300";
      case "medium":
        return "bg-gradient-to-br from-yellow-50 to-yellow-100 text-yellow-700 border-yellow-300";
      case "low":
        return "bg-gradient-to-br from-green-50 to-green-100 text-green-700 border-green-300";
    }
  };

  const getPriorityLabel = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "Must Add";
      case "medium":
        return "High Priority";
      case "low":
        return "Worth Considering";
    }
  };

  return (
    <main className="min-h-screen py-8 sm:py-12 bg-gradient-to-br from-[#000918] via-[#051639] to-[#020712]">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-2">
              Waiver Wire
            </h1>
            <p className="text-base sm:text-lg text-white/80">
              AI-recommended pickups based on your roster needs
            </p>
          </div>

          {/* AI Recommendations Section */}
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">AI Waiver Recommendations</h2>
                <p className="text-white/80 text-xs sm:text-sm">Get personalized add/drop suggestions based on your roster</p>
              </div>
              <button
                onClick={generateWaiverAnalysis}
                disabled={loadingAnalysis}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-purple-600 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold hover:shadow-2xl hover:shadow-white/30 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none w-full sm:w-auto"
              >
                {loadingAnalysis ? "Analyzing..." : "Generate Recommendations"}
              </button>
            </div>

            {aiAnalysis && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-sm sm:text-base text-white/90">{aiAnalysis}</div>
                </div>
              </div>
            )}

            {!aiAnalysis && !loadingAnalysis && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center">
                <p className="text-white/80 text-sm sm:text-base">Click &quot;Generate Recommendations&quot; to get AI-powered add/drop suggestions</p>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-3xl p-6 shadow-2xl mb-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Position Filter */}
              <div>
                <h3 className="text-sm font-semibold text-[#0B1E3D] mb-3">
                  Filter by Position
                </h3>
                <div className="flex flex-wrap gap-2">
                  {positions.map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setSelectedPosition(pos)}
                      className={`px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${
                        selectedPosition === pos
                          ? "bg-gradient-to-r from-[#26D36B] to-[#1A8CFF] text-[#0B1E3D] shadow-lg shadow-[#26D36B]/30 scale-105"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {pos}
                      {pos !== "ALL" &&
                        ` (${playersByPosition[pos]?.length || 0})`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <h3 className="text-sm font-semibold text-[#0B1E3D] mb-3">
                  Sort By
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSortBy("priority")}
                    className={`flex-1 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${
                      sortBy === "priority"
                        ? "bg-gradient-to-r from-[#26D36B] to-[#1A8CFF] text-[#0B1E3D] shadow-lg shadow-[#26D36B]/30"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Priority
                  </button>
                  <button
                    onClick={() => setSortBy("position")}
                    className={`flex-1 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${
                      sortBy === "position"
                        ? "bg-gradient-to-r from-[#26D36B] to-[#1A8CFF] text-[#0B1E3D] shadow-lg shadow-[#26D36B]/30"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Position
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Waiver Targets List */}
          <div className="space-y-4 mb-6">
            {displayPlayers.length > 0 ? (
              displayPlayers.map((player, index) => {
                const priority = getPriority(index);
                return (
                  <div
                    key={index}
                    onClick={() => setSelectedPlayer(player)}
                    className="bg-white rounded-3xl p-6 shadow-2xl hover:shadow-[0_25px_50px_rgba(26,140,255,0.3)] transition-all duration-300 border-2 border-gray-100 hover:border-[#1A8CFF] cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          {/* Rank Badge */}
                          <div className="w-12 h-12 bg-gradient-to-br from-[#1A8CFF] to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                            <span className="text-xl font-bold text-white">
                              #{index + 1}
                            </span>
                          </div>

                          {/* Player Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-[#0B1E3D]">
                                {player.name}
                              </h3>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <span className="font-medium">
                                {player.position}
                              </span>
                              <span>•</span>
                              <span>{player.team || "Unknown Team"}</span>
                              {player.projectedPoints && (
                                <>
                                  <span>•</span>
                                  <span className="font-semibold text-[#1A8CFF]">
                                    {player.projectedPoints.toFixed(2)} proj
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="ml-4">
                        <button className="px-6 py-3 bg-gradient-to-r from-[#26D36B] to-[#1A8CFF] text-[#0B1E3D] rounded-xl font-bold hover:shadow-2xl hover:shadow-[#26D36B]/30 transform hover:scale-105 transition-all duration-200">
                          Add to Watch List
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-3xl p-12 shadow-2xl text-center">
                <p className="text-gray-600">
                  No available players found. Upload screenshots with waiver wire
                  data to see recommendations.
                </p>
              </div>
            )}
          </div>

          {/* Roster Needs Analysis */}
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-start">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-purple-600 mb-2">
                  Roster Needs Analysis
                </h3>
                <p className="text-gray-700 mb-4">
                  Based on your current roster, here&apos;s where you could improve:
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
                    <h4 className="font-semibold text-[#0B1E3D] mb-1">
                      Top Priority
                    </h4>
                    <p className="text-sm text-gray-600">
                      Add RB depth for bye week coverage
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
                    <h4 className="font-semibold text-[#0B1E3D] mb-1">
                      Consider
                    </h4>
                    <p className="text-sm text-gray-600">
                      WR upside for playoff push
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
                    <h4 className="font-semibold text-[#0B1E3D] mb-1">
                      Watch For
                    </h4>
                    <p className="text-sm text-gray-600">
                      Breakout TE targets on waivers
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4 italic">
                  🤖 Personalized recommendations based on your {data.scoringFormat}{" "}
                  league
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Player Detail Modal */}
      {selectedPlayer && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPlayer(null)}
        >
          <div
            className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-[#0B1E3D] mb-2">
                  {selectedPlayer.name}
                </h2>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-[#1A8CFF]/10 text-[#1A8CFF] rounded-lg text-sm font-bold">
                    {selectedPlayer.position}
                  </span>
                  <span className="text-gray-600">{selectedPlayer.team || "Free Agent"}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlayer(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-[#1A8CFF]/10 to-[#1A8CFF]/20 border border-[#1A8CFF]/30 rounded-2xl p-4 text-center">
                <div className="text-sm text-gray-600 mb-1">Projected</div>
                <div className="text-3xl font-bold text-[#1A8CFF]">
                  {selectedPlayer.projectedPoints ? selectedPlayer.projectedPoints.toFixed(2) : "—"}
                </div>
                <div className="text-xs text-gray-500 mt-1">This Week</div>
              </div>
              {selectedPlayer.seasonStats && (
                <div className="bg-gradient-to-br from-[#26D36B]/10 to-[#26D36B]/20 border border-[#26D36B]/30 rounded-2xl p-4 text-center">
                  <div className="text-sm text-gray-600 mb-1">Season Avg</div>
                  <div className="text-3xl font-bold text-[#26D36B]">
                    {selectedPlayer.seasonStats.averagePoints ? selectedPlayer.seasonStats.averagePoints.toFixed(2) : "—"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">PPG</div>
                </div>
              )}
              {selectedPlayer.ownership && (
                <>
                  <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/20 border border-purple-500/30 rounded-2xl p-4 text-center">
                    <div className="text-sm text-gray-600 mb-1">Rostered</div>
                    <div className="text-3xl font-bold text-purple-600">
                      {selectedPlayer.ownership.percentOwned ? `${selectedPlayer.ownership.percentOwned.toFixed(0)}%` : "—"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">% Owned</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/20 border border-orange-500/30 rounded-2xl p-4 text-center">
                    <div className="text-sm text-gray-600 mb-1">Started</div>
                    <div className="text-3xl font-bold text-orange-600">
                      {selectedPlayer.ownership.percentStarted ? `${selectedPlayer.ownership.percentStarted.toFixed(0)}%` : "—"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">% Started</div>
                  </div>
                </>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setSelectedPlayer(null)}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#26D36B] to-[#1A8CFF] text-[#0B1E3D] rounded-xl font-bold hover:shadow-2xl hover:shadow-[#26D36B]/30 transform hover:scale-105 transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
