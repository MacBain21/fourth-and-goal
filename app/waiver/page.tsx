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

export default function WaiverPage() {
  const [data, setData] = useState<ParsedData | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"priority" | "position">("priority");

  useEffect(() => {
    const storedData = localStorage.getItem("leagueData");
    if (storedData) {
      setData(JSON.parse(storedData));
    }
  }, []);

  if (!data) {
    return (
      <main className="min-h-screen py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-2xl p-12 shadow-sm">
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                No Data Available
              </h2>
              <p className="text-gray-600 mb-6">
                Please upload your league screenshots first.
              </p>
              <Link
                href="/upload"
                className="inline-block bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200"
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
        return "bg-red-100 text-red-700 border-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "low":
        return "bg-green-100 text-green-700 border-green-300";
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
    <main className="min-h-screen py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              Waiver Wire
            </h1>
            <p className="text-lg text-gray-600">
              AI-recommended pickups based on your roster needs
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Position Filter */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Filter by Position
                </h3>
                <div className="flex flex-wrap gap-2">
                  {positions.map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setSelectedPosition(pos)}
                      className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                        selectedPosition === pos
                          ? "bg-blue-600 text-white shadow-md"
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
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Sort By
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSortBy("priority")}
                    className={`flex-1 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                      sortBy === "priority"
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Priority
                  </button>
                  <button
                    onClick={() => setSortBy("position")}
                    className={`flex-1 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                      sortBy === "position"
                        ? "bg-blue-600 text-white shadow-md"
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
                    className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border-2 border-gray-100 hover:border-blue-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          {/* Rank Badge */}
                          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="text-xl font-bold text-gray-700">
                              #{index + 1}
                            </span>
                          </div>

                          {/* Player Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-gray-900">
                                {player.name}
                              </h3>
                              <span
                                className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getPriorityColor(
                                  priority
                                )}`}
                              >
                                {getPriorityLabel(priority)}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <span className="font-medium">
                                {player.position}
                              </span>
                              <span>•</span>
                              <span>{player.team || "Unknown Team"}</span>
                            </div>

                            {/* AI Insight Placeholder */}
                            <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                              <p className="text-sm text-gray-700">
                                <span className="font-semibold text-blue-900">
                                  Why add this player:
                                </span>{" "}
                                {priority === "high" &&
                                  "Trending up with favorable upcoming matchups. Strong recent performance suggests breakout potential."}
                                {priority === "medium" &&
                                  "Solid floor player who could fill roster gaps. Consistent opportunity in high-powered offense."}
                                {priority === "low" &&
                                  "Depth option with upside. Worth monitoring for future weeks based on role expansion."}
                              </p>
                              <p className="text-xs text-gray-500 mt-2 italic">
                                🤖 AI-powered analysis coming soon
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="ml-4">
                        <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg">
                          Add to Watch List
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
                <p className="text-gray-600">
                  No available players found. Upload screenshots with waiver wire
                  data to see recommendations.
                </p>
              </div>
            )}
          </div>

          {/* Roster Needs Analysis */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 shadow-sm border border-purple-200">
            <div className="flex items-start">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
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
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Roster Needs Analysis
                </h3>
                <p className="text-gray-700 mb-4">
                  Based on your current roster, here&apos;s where you could improve:
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Top Priority
                    </h4>
                    <p className="text-sm text-gray-600">
                      Add RB depth for bye week coverage
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Consider
                    </h4>
                    <p className="text-sm text-gray-600">
                      WR upside for playoff push
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-1">
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
    </main>
  );
}
