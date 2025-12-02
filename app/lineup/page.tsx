"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Player {
  name: string;
  position: string;
  team?: string;
  projectedPoints?: number;
}

interface ParsedData {
  scoringFormat?: string;
  leagueSize?: number;
  roster: Player[];
  availablePlayers: Player[];
  rawText: string;
}

export default function LineupPage() {
  const [data, setData] = useState<ParsedData | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<string>("ALL");

  useEffect(() => {
    const storedData = localStorage.getItem("leagueData");
    if (storedData) {
      setData(JSON.parse(storedData));
    }
  }, []);

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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
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

  // Group players by position
  const playersByPosition = data.roster.reduce((acc, player) => {
    if (!acc[player.position]) {
      acc[player.position] = [];
    }
    acc[player.position].push(player);
    return acc;
  }, {} as Record<string, Player[]>);

  const positions = ["ALL", ...Object.keys(playersByPosition).sort()];
  const displayPlayers =
    selectedPosition === "ALL"
      ? data.roster
      : playersByPosition[selectedPosition] || [];

  return (
    <main className="min-h-screen py-12 bg-gradient-to-br from-[#000918] via-[#051639] to-[#020712]">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">
              Lineup Helper
            </h1>
            <p className="text-lg text-white/80">
              Get AI-powered start/sit recommendations for your roster
            </p>
          </div>

          {/* Position Filter */}
          <div className="bg-white rounded-3xl p-6 shadow-2xl mb-6">
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

          {/* Start/Sit Recommendations */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Start Recommendations */}
            <div className="bg-white rounded-3xl p-6 shadow-2xl border-2 border-[#26D36B]">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#26D36B] to-green-600 rounded-xl flex items-center justify-center mr-3">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-[#0B1E3D]">
                  Recommended Starts
                </h2>
              </div>
              <div className="space-y-3">
                {displayPlayers.slice(0, Math.ceil(displayPlayers.length / 2)).map((player, i) => (
                  <div
                    key={i}
                    className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#0B1E3D]">
                          {player.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {player.position} • {player.team || "Unknown"}
                        </p>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="text-xs font-bold text-green-700 bg-green-200 px-2 py-1 rounded-lg">
                          START
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 italic">
                      🤖 AI matchup analysis coming soon
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sit Recommendations */}
            <div className="bg-white rounded-3xl p-6 shadow-2xl border-2 border-amber-400">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center mr-3">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-[#0B1E3D]">
                  Consider Benching
                </h2>
              </div>
              <div className="space-y-3">
                {displayPlayers.slice(Math.ceil(displayPlayers.length / 2)).map((player, i) => (
                  <div
                    key={i}
                    className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#0B1E3D]">
                          {player.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {player.position} • {player.team || "Unknown"}
                        </p>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="text-xs font-bold text-amber-700 bg-amber-200 px-2 py-1 rounded-lg">
                          BENCH
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 italic">
                      🤖 AI matchup analysis coming soon
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Weekly Matchup Analysis (Placeholder) */}
          <div className="bg-gradient-to-br from-[#1A8CFF]/10 to-purple-500/10 border-2 border-[#1A8CFF]/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-start">
              <div className="w-12 h-12 bg-gradient-to-br from-[#1A8CFF] to-purple-600 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
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
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#1A8CFF] mb-2">
                  AI-Powered Lineup Optimization
                </h3>
                <p className="text-gray-700 mb-4">
                  Future features will include:
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 text-[#1A8CFF] mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Real-time injury reports and player news
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 text-[#1A8CFF] mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Matchup difficulty analysis vs opposing defenses
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 text-[#1A8CFF] mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Weather conditions and game script predictions
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 text-[#1A8CFF] mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Personalized insights based on {data.scoringFormat || "your"}{" "}
                    scoring format
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
