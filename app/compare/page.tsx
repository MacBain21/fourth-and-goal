"use client";

import { useState, useEffect } from "react";

interface Player {
  name: string;
  position: string;
  team?: string;
  projectedPoints?: number;
}

export default function ComparePage() {
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [player1, setPlayer1] = useState<Player | null>(null);
  const [player2, setPlayer2] = useState<Player | null>(null);
  const [player1Search, setPlayer1Search] = useState("");
  const [player2Search, setPlayer2Search] = useState("");
  const [comparing, setComparing] = useState(false);
  const [comparison, setComparison] = useState<string>("");

  useEffect(() => {
    // Load players from localStorage
    const leagueData = localStorage.getItem("leagueData");
    if (leagueData) {
      const data = JSON.parse(leagueData);
      const players = [
        ...(data.roster || []),
        ...(data.availablePlayers || []),
      ];
      setAllPlayers(players);
    }
  }, []);

  const filteredPlayers1 = allPlayers.filter((p) =>
    p.name.toLowerCase().includes(player1Search.toLowerCase())
  );

  const filteredPlayers2 = allPlayers.filter((p) =>
    p.name.toLowerCase().includes(player2Search.toLowerCase())
  );

  const handleCompare = async () => {
    if (!player1 || !player2) return;

    setComparing(true);
    setComparison("");

    try {
      const response = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player1, player2 }),
      });

      const data = await response.json();
      setComparison(data.comparison);
    } catch (error) {
      setComparison("Failed to generate comparison. Please try again.");
    } finally {
      setComparing(false);
    }
  };

  return (
    <main className="min-h-screen py-12 bg-gradient-to-br from-[#000918] via-[#051639] to-[#020712]">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full mb-6">
              <span className="text-2xl">⚖️</span>
              <span className="text-sm font-semibold text-purple-400">
                AI-Powered Analysis
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">
              Player Comparison
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Compare two players side-by-side with AI-powered insights
            </p>
          </div>

          {/* Comparison Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Player 1 */}
            <div className="bg-white rounded-3xl p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-[#0B1E3D] mb-4">
                Player 1
              </h2>

              {!player1 ? (
                <>
                  <input
                    type="text"
                    value={player1Search}
                    onChange={(e) => setPlayer1Search(e.target.value)}
                    placeholder="Search for a player..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1A8CFF] focus:outline-none transition-colors mb-4"
                  />
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {filteredPlayers1.slice(0, 10).map((p, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setPlayer1(p);
                          setPlayer1Search("");
                        }}
                        className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-[#1A8CFF]/10 rounded-xl transition-colors"
                      >
                        <div className="font-semibold text-[#0B1E3D]">
                          {p.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {p.position} • {p.team || "FA"}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-gradient-to-br from-[#1A8CFF]/10 to-[#1A8CFF]/20 border-2 border-[#1A8CFF]/30 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-[#0B1E3D] mb-2">
                        {player1.name}
                      </h3>
                      <div className="flex items-center gap-3 text-gray-600">
                        <span className="font-semibold">{player1.position}</span>
                        <span>•</span>
                        <span>{player1.team || "Free Agent"}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setPlayer1(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  {player1.projectedPoints && (
                    <div className="bg-white rounded-xl p-4">
                      <div className="text-sm text-gray-600 mb-1">
                        Projected Points
                      </div>
                      <div className="text-3xl font-bold text-[#1A8CFF]">
                        {player1.projectedPoints.toFixed(1)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Player 2 */}
            <div className="bg-white rounded-3xl p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-[#0B1E3D] mb-4">
                Player 2
              </h2>

              {!player2 ? (
                <>
                  <input
                    type="text"
                    value={player2Search}
                    onChange={(e) => setPlayer2Search(e.target.value)}
                    placeholder="Search for a player..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#26D36B] focus:outline-none transition-colors mb-4"
                  />
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {filteredPlayers2.slice(0, 10).map((p, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setPlayer2(p);
                          setPlayer2Search("");
                        }}
                        className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-[#26D36B]/10 rounded-xl transition-colors"
                      >
                        <div className="font-semibold text-[#0B1E3D]">
                          {p.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {p.position} • {p.team || "FA"}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-gradient-to-br from-[#26D36B]/10 to-[#26D36B]/20 border-2 border-[#26D36B]/30 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-[#0B1E3D] mb-2">
                        {player2.name}
                      </h3>
                      <div className="flex items-center gap-3 text-gray-600">
                        <span className="font-semibold">{player2.position}</span>
                        <span>•</span>
                        <span>{player2.team || "Free Agent"}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setPlayer2(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  {player2.projectedPoints && (
                    <div className="bg-white rounded-xl p-4">
                      <div className="text-sm text-gray-600 mb-1">
                        Projected Points
                      </div>
                      <div className="text-3xl font-bold text-[#26D36B]">
                        {player2.projectedPoints.toFixed(1)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Compare Button */}
          {player1 && player2 && (
            <div className="text-center mb-8">
              <button
                onClick={handleCompare}
                disabled={comparing}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#26D36B] to-[#1A8CFF] text-[#0B1E3D] rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-[#26D36B]/30 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {comparing ? "Analyzing..." : "Compare Players"}
                <svg
                  className="w-6 h-6"
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
              </button>
            </div>
          )}

          {/* Comparison Result */}
          {comparison && (
            <div className="bg-white rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#26D36B] to-[#1A8CFF] rounded-xl flex items-center justify-center">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-[#0B1E3D]">
                  AI Analysis
                </h2>
              </div>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {comparison}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-6 italic">
                🤖 Powered by GPT-4o
              </p>
            </div>
          )}

          {/* Empty State */}
          {!player1 && !player2 && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Select two players to compare
              </h3>
              <p className="text-white/70">
                Choose players from your roster or available free agents to see
                a detailed AI-powered comparison
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
