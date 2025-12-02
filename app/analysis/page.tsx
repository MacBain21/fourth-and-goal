"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ParsedData {
  scoringFormat?: string;
  leagueSize?: number;
  roster: Array<{
    name: string;
    position: string;
    team?: string;
    projectedPoints?: number;
  }>;
  availablePlayers: Array<{
    name: string;
    position: string;
    team?: string;
    projectedPoints?: number;
  }>;
  rawText: string;
}

export default function AnalysisPage() {
  const router = useRouter();
  const [data, setData] = useState<ParsedData | null>(null);

  useEffect(() => {
    // Load data from localStorage
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
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

  // Calculate roster composition
  const rosterByPosition = data.roster.reduce((acc, player) => {
    acc[player.position] = (acc[player.position] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <main className="min-h-screen py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              League Analysis
            </h1>
            <p className="text-lg text-gray-600">
              AI-powered insights for your fantasy football team
            </p>
          </div>

          {/* League Settings Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              League Settings
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Scoring Format</p>
                <p className="text-lg font-semibold text-gray-900">
                  {data.scoringFormat || "Unknown"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">League Size</p>
                <p className="text-lg font-semibold text-gray-900">
                  {data.leagueSize ? `${data.leagueSize} Teams` : "Unknown"}
                </p>
              </div>
            </div>
          </div>

          {/* Current Roster Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Roster</h2>

            {/* Position Breakdown */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Position Breakdown
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.entries(rosterByPosition).map(([position, count]) => (
                  <div key={position} className="bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-blue-600">{count}</p>
                    <p className="text-xs font-medium text-gray-600">{position}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Player List */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                All Players ({data.roster.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider rounded-tl-xl">
                        Player
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider rounded-tr-xl">
                        Team
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.roster.map((player, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {player.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {player.position}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {player.team || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* AI Insights Section - Placeholder */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {/* Roster Strengths & Weaknesses */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
                  <svg
                    className="w-5 h-5 text-green-600"
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
                <h3 className="text-lg font-bold text-gray-900">
                  Roster Analysis
                </h3>
              </div>
              <div className="space-y-3">
                <div className="bg-green-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-green-700 mb-1">
                    STRENGTHS
                  </p>
                  <p className="text-sm text-gray-700">
                    {rosterByPosition.RB >= 3
                      ? "Strong RB depth"
                      : rosterByPosition.WR >= 4
                      ? "Deep WR corps"
                      : "Balanced roster composition"}
                  </p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-amber-700 mb-1">
                    NEEDS ATTENTION
                  </p>
                  <p className="text-sm text-gray-700">
                    {rosterByPosition.RB < 2
                      ? "Consider adding RB depth"
                      : rosterByPosition.WR < 3
                      ? "WR depth could be improved"
                      : "Monitor injury reports"}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4 italic">
                🤖 AI-powered insights coming soon
              </p>
            </div>

            {/* Start/Sit Recommendations */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Start/Sit
                </h3>
              </div>
              <div className="space-y-3">
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-blue-700 mb-1">
                    RECOMMENDED STARTS
                  </p>
                  <p className="text-sm text-gray-700">
                    {data.roster.slice(0, 2).map((p) => p.name).join(", ") ||
                      "Players TBD"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-700 mb-1">
                    CONSIDER BENCHING
                  </p>
                  <p className="text-sm text-gray-700">
                    Matchup-based recommendations will appear here
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4 italic">
                🤖 AI-powered insights coming soon
              </p>
            </div>

            {/* Waiver Targets */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-3">
                  <svg
                    className="w-5 h-5 text-purple-600"
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
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Waiver Targets
                </h3>
              </div>
              <div className="space-y-3">
                {data.availablePlayers.slice(0, 3).map((player, i) => (
                  <div key={i} className="bg-purple-50 rounded-xl p-3">
                    <p className="text-sm font-semibold text-gray-900">
                      {player.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {player.position} • {player.team || "Unknown"}
                    </p>
                  </div>
                ))}
                {data.availablePlayers.length === 0 && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-sm text-gray-600">
                      Upload screenshots with available players to see recommendations
                    </p>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-4 italic">
                🤖 AI-powered insights coming soon
              </p>
            </div>
          </div>

          {/* TODO: Wire to API Route */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-start">
              <svg
                className="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-blue-900 mb-1">
                  Development Note
                </h3>
                <p className="text-sm text-blue-800">
                  The current insights are placeholder data based on your parsed roster.
                  In the next phase, this page will call an API route that sends your
                  league data to an AI service (like OpenAI or Anthropic) to generate
                  real, personalized recommendations. The code is structured to make this
                  integration straightforward.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <Link
              href="/upload"
              className="flex-1 border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:border-gray-400 transition-colors duration-200 text-center"
            >
              Upload New Data
            </Link>
            <button
              onClick={() => {
                // TODO: Trigger AI analysis
                alert("AI analysis API integration coming soon!");
              }}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200"
            >
              Refresh AI Analysis
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
