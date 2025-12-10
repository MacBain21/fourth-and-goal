"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

interface ParsedData {
  scoringFormat?: string;
  leagueSize?: number;
  maxRosterSize?: number;
  roster: Array<{
    id?: number;
    name: string;
    position: string;
    team?: string;
    projectedPoints?: number;
    photoUrl?: string;
    ownership?: number;
    injuryStatus?: string;
    seasonStats?: {
      totalPoints?: number;
      averagePoints?: number;
    };
    stats?: any[];
    eligibleSlots?: number[];
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
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [positionRecommendation, setPositionRecommendation] = useState<string>("");
  const [loadingPositionRec, setLoadingPositionRec] = useState<boolean>(false);
  const [autoLineupReasoning, setAutoLineupReasoning] = useState<string>("");
  const [loadingAutoLineup, setLoadingAutoLineup] = useState<boolean>(false);
  const [showAutoLineupModal, setShowAutoLineupModal] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<{
    overview?: string;
    lineup?: string;
    waiver?: string;
  }>({});
  const [loadingAnalysis, setLoadingAnalysis] = useState<{
    overview: boolean;
    lineup: boolean;
    waiver: boolean;
  }>({ overview: false, lineup: false, waiver: false });

  // Roster lineup state - organize players into starters and bench
  const [lineup, setLineup] = useState<{
    QB?: any;
    RB1?: any;
    RB2?: any;
    WR1?: any;
    WR2?: any;
    TE?: any;
    FLEX?: any;
    DST?: any;
    K?: any;
    BE: any[];
  }>({ BE: [] });

  useEffect(() => {
    // Load data from localStorage
    const storedData = localStorage.getItem("leagueData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setData(parsedData);

      // Auto-organize roster into lineup
      if (parsedData.roster) {
        organizeLineup(parsedData.roster);
      }
    }
  }, []);

  const organizeLineup = (roster: any[]) => {
    const newLineup: any = { BE: [] };
    const remaining = [...roster];

    // Sort by projected points to put best players in starting slots
    remaining.sort((a, b) => (b.projectedPoints || 0) - (a.projectedPoints || 0));

    // Fill QB
    const qbIndex = remaining.findIndex(p => p.position === 'QB');
    if (qbIndex >= 0) {
      newLineup.QB = remaining.splice(qbIndex, 1)[0];
    }

    // Fill RB1, RB2
    const rb1Index = remaining.findIndex(p => p.position === 'RB');
    if (rb1Index >= 0) {
      newLineup.RB1 = remaining.splice(rb1Index, 1)[0];
    }
    const rb2Index = remaining.findIndex(p => p.position === 'RB');
    if (rb2Index >= 0) {
      newLineup.RB2 = remaining.splice(rb2Index, 1)[0];
    }

    // Fill WR1, WR2
    const wr1Index = remaining.findIndex(p => p.position === 'WR');
    if (wr1Index >= 0) {
      newLineup.WR1 = remaining.splice(wr1Index, 1)[0];
    }
    const wr2Index = remaining.findIndex(p => p.position === 'WR');
    if (wr2Index >= 0) {
      newLineup.WR2 = remaining.splice(wr2Index, 1)[0];
    }

    // Fill TE
    const teIndex = remaining.findIndex(p => p.position === 'TE');
    if (teIndex >= 0) {
      newLineup.TE = remaining.splice(teIndex, 1)[0];
    }

    // Fill FLEX (best remaining RB/WR/TE)
    const flexIndex = remaining.findIndex(p => ['RB', 'WR', 'TE'].includes(p.position));
    if (flexIndex >= 0) {
      newLineup.FLEX = remaining.splice(flexIndex, 1)[0];
    }

    // Fill K
    const kIndex = remaining.findIndex(p => p.position === 'K');
    if (kIndex >= 0) {
      newLineup.K = remaining.splice(kIndex, 1)[0];
    }

    // Fill D/ST
    const dstIndex = remaining.findIndex(p => p.position === 'DEF');
    if (dstIndex >= 0) {
      newLineup.DST = remaining.splice(dstIndex, 1)[0];
    }

    // Rest go to bench
    newLineup.BE = remaining;

    setLineup(newLineup);
  };

  const swapPlayerToBench = (slot: string, player: any) => {
    const newLineup = { ...lineup };
    // @ts-ignore
    newLineup[slot] = undefined;
    newLineup.BE = [...newLineup.BE, player];
    setLineup(newLineup);
  };

  const swapPlayerToStarter = (benchPlayer: any, targetSlot: string) => {
    const newLineup = { ...lineup };
    // @ts-ignore
    const currentStarter = newLineup[targetSlot];
    // @ts-ignore
    newLineup[targetSlot] = benchPlayer;
    newLineup.BE = newLineup.BE.filter(p => p.name !== benchPlayer.name);
    if (currentStarter) {
      newLineup.BE = [...newLineup.BE, currentStarter];
    }
    setLineup(newLineup);
  };

  const generateAIAnalysis = async (type: "overview" | "lineup" | "waiver") => {
    if (!data) return;

    setLoadingAnalysis((prev) => ({ ...prev, [type]: true }));

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          data: {
            scoringFormat: data.scoringFormat,
            leagueSize: data.leagueSize,
            roster: data.roster,
            availablePlayers: data.availablePlayers,
            maxRosterSize: data.maxRosterSize,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate analysis");
      }

      const result = await response.json();
      setAiAnalysis((prev) => ({ ...prev, [type]: result.analysis }));
    } catch (error) {
      console.error("AI Analysis Error:", error);
      setAiAnalysis((prev) => ({
        ...prev,
        [type]: "Failed to generate analysis. Please try again.",
      }));
    } finally {
      setLoadingAnalysis((prev) => ({ ...prev, [type]: false }));
    }
  };

  const getPositionRecommendation = async (position: string) => {
    if (!data) return;

    setLoadingPositionRec(true);
    setPositionRecommendation("");

    try {
      const currentStarter = lineup[position as keyof typeof lineup];
      const eligiblePlayers = lineup.BE.filter((p: any) => {
        if (position === 'QB') return p.position === 'QB';
        if (position === 'RB1' || position === 'RB2') return p.position === 'RB';
        if (position === 'WR1' || position === 'WR2') return p.position === 'WR';
        if (position === 'TE') return p.position === 'TE';
        if (position === 'FLEX') return ['RB', 'WR', 'TE'].includes(p.position);
        if (position === 'DST') return p.position === 'DEF';
        if (position === 'K') return p.position === 'K';
        return false;
      });

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "position",
          data: {
            position,
            currentStarter,
            eligiblePlayers,
            scoringFormat: data.scoringFormat,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get recommendation");
      }

      const result = await response.json();
      setPositionRecommendation(result.analysis);
    } catch (error) {
      console.error("Position Recommendation Error:", error);
      setPositionRecommendation("Failed to generate recommendation. Please try again.");
    } finally {
      setLoadingPositionRec(false);
    }
  };

  const handleAutoLineup = async () => {
    if (!data) return;

    setLoadingAutoLineup(true);
    setAutoLineupReasoning("");
    setShowAutoLineupModal(true);

    try {
      // First, organize the lineup automatically by projected points
      organizeLineup(data.roster);

      // Then get AI reasoning for the decisions
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "autolineup",
          data: {
            roster: data.roster,
            scoringFormat: data.scoringFormat,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate auto lineup reasoning");
      }

      const result = await response.json();
      setAutoLineupReasoning(result.analysis);
    } catch (error) {
      console.error("Auto Lineup Error:", error);
      setAutoLineupReasoning("Failed to generate reasoning. Your lineup has been optimized based on projected points.");
    } finally {
      setLoadingAutoLineup(false);
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

  // Calculate roster composition
  const rosterByPosition = data.roster.reduce((acc, player) => {
    acc[player.position] = (acc[player.position] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <main className="min-h-screen py-8 sm:py-12 bg-gradient-to-br from-[#000918] via-[#051639] to-[#020712]">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-2">
              League Analysis
            </h1>
            <p className="text-base sm:text-lg text-white/80">
              AI-powered insights for your fantasy football team
            </p>
          </div>

          {/* ESPN-Style Roster Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-[#0B1E3D]">Your Roster</h2>
              <button
                onClick={handleAutoLineup}
                disabled={loadingAutoLineup}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:shadow-lg hover:shadow-purple-500/30 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="hidden sm:inline">{loadingAutoLineup ? "Optimizing..." : "Auto Lineup"}</span>
                <span className="sm:hidden">{loadingAutoLineup ? "..." : "Auto"}</span>
              </button>
            </div>

            {/* Starters Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-gray-200">
                <h3 className="text-sm font-bold text-[#0B1E3D] uppercase tracking-wide">
                  Starters
                </h3>
                <span className="text-sm font-bold text-gray-600">SCORE</span>
              </div>
              <div className="space-y-2">
                {/* QB */}
                <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <button
                    onClick={() => {
                      setEditingSlot('QB');
                      getPositionRecommendation('QB');
                    }}
                    className="w-16 flex-shrink-0"
                  >
                    <span className="px-3 py-1.5 bg-[#1A8CFF]/10 text-[#1A8CFF] hover:bg-[#1A8CFF]/20 rounded-full text-xs font-bold inline-block text-center min-w-[3rem] cursor-pointer transition-colors">
                      QB
                    </span>
                  </button>
                  {lineup.QB ? (
                    <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => setSelectedPlayer(lineup.QB)}>
                      {lineup.QB.photoUrl && (
                        <img
                          src={lineup.QB.photoUrl}
                          alt={lineup.QB.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-gray-900 truncate">{lineup.QB.name}</div>
                          {lineup.QB.injuryStatus && lineup.QB.injuryStatus !== "ACTIVE" && (
                            <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                              lineup.QB.injuryStatus === "OUT" || lineup.QB.injuryStatus === "INJURY_RESERVE" ? "bg-red-100 text-red-700" :
                              lineup.QB.injuryStatus === "DOUBTFUL" ? "bg-orange-100 text-orange-700" :
                              lineup.QB.injuryStatus === "QUESTIONABLE" ? "bg-yellow-100 text-yellow-700" :
                              "bg-gray-100 text-gray-700"
                            }`}>
                              {lineup.QB.injuryStatus === "INJURY_RESERVE" ? "IR" : lineup.QB.injuryStatus.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{lineup.QB.team}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{lineup.QB.projectedPoints?.toFixed(2) || "—"}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 italic flex-1">Empty</div>
                  )}
                </div>

                {/* RB1 */}
                <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <button
                    onClick={() => {
                      setEditingSlot('RB1');
                      getPositionRecommendation('RB1');
                    }}
                    className="w-16 flex-shrink-0"
                  >
                    <span className="px-3 py-1.5 bg-[#1A8CFF]/10 text-[#1A8CFF] hover:bg-[#1A8CFF]/20 rounded-full text-xs font-bold inline-block text-center min-w-[3rem] cursor-pointer transition-colors">
                      RB
                    </span>
                  </button>
                  {lineup.RB1 ? (
                    <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => setSelectedPlayer(lineup.RB1)}>
                      {lineup.RB1.photoUrl && (
                        <img src={lineup.RB1.photoUrl} alt={lineup.RB1.name} className="w-12 h-12 rounded-full object-cover border-2 border-gray-200" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-gray-900 truncate">{lineup.RB1.name}</div>
                          {lineup.RB1.injuryStatus && lineup.RB1.injuryStatus !== "ACTIVE" && (
                            <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                              lineup.RB1.injuryStatus === "OUT" || lineup.RB1.injuryStatus === "INJURY_RESERVE" ? "bg-red-100 text-red-700" :
                              lineup.RB1.injuryStatus === "DOUBTFUL" ? "bg-orange-100 text-orange-700" :
                              lineup.RB1.injuryStatus === "QUESTIONABLE" ? "bg-yellow-100 text-yellow-700" :
                              "bg-gray-100 text-gray-700"
                            }`}>
                              {lineup.RB1.injuryStatus === "INJURY_RESERVE" ? "IR" : lineup.RB1.injuryStatus.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{lineup.RB1.team}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{lineup.RB1.projectedPoints?.toFixed(2) || "—"}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 italic flex-1">Empty</div>
                  )}
                </div>

                {/* RB2 */}
                <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <button
                    onClick={() => {
                      setEditingSlot('RB2');
                      getPositionRecommendation('RB2');
                    }}
                    className="w-16 flex-shrink-0"
                  >
                    <span className="px-3 py-1.5 bg-[#1A8CFF]/10 text-[#1A8CFF] hover:bg-[#1A8CFF]/20 rounded-full text-xs font-bold inline-block text-center min-w-[3rem] cursor-pointer transition-colors">
                      RB
                    </span>
                  </button>
                  {lineup.RB2 ? (
                    <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => setSelectedPlayer(lineup.RB2)}>
                      {lineup.RB2.photoUrl && (
                        <img src={lineup.RB2.photoUrl} alt={lineup.RB2.name} className="w-12 h-12 rounded-full object-cover border-2 border-gray-200" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-gray-900 truncate">{lineup.RB2.name}</div>
                          {lineup.RB2.injuryStatus && lineup.RB2.injuryStatus !== "ACTIVE" && (
                            <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                              lineup.RB2.injuryStatus === "OUT" || lineup.RB2.injuryStatus === "INJURY_RESERVE" ? "bg-red-100 text-red-700" :
                              lineup.RB2.injuryStatus === "DOUBTFUL" ? "bg-orange-100 text-orange-700" :
                              lineup.RB2.injuryStatus === "QUESTIONABLE" ? "bg-yellow-100 text-yellow-700" :
                              "bg-gray-100 text-gray-700"
                            }`}>
                              {lineup.RB2.injuryStatus === "INJURY_RESERVE" ? "IR" : lineup.RB2.injuryStatus.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{lineup.RB2.team}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{lineup.RB2.projectedPoints?.toFixed(2) || "—"}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 italic flex-1">Empty</div>
                  )}
                </div>

                {/* WR1 */}
                <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <button
                    onClick={() => {
                      setEditingSlot('WR1');
                      getPositionRecommendation('WR1');
                    }}
                    className="w-16 flex-shrink-0"
                  >
                    <span className="px-3 py-1.5 bg-[#1A8CFF]/10 text-[#1A8CFF] hover:bg-[#1A8CFF]/20 rounded-full text-xs font-bold inline-block text-center min-w-[3rem] cursor-pointer transition-colors">
                      WR
                    </span>
                  </button>
                  {lineup.WR1 ? (
                    <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => setSelectedPlayer(lineup.WR1)}>
                      {lineup.WR1.photoUrl && (
                        <img src={lineup.WR1.photoUrl} alt={lineup.WR1.name} className="w-12 h-12 rounded-full object-cover border-2 border-gray-200" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-gray-900 truncate">{lineup.WR1.name}</div>
                          {lineup.WR1.injuryStatus && lineup.WR1.injuryStatus !== "ACTIVE" && (
                            <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                              lineup.WR1.injuryStatus === "OUT" || lineup.WR1.injuryStatus === "INJURY_RESERVE" ? "bg-red-100 text-red-700" :
                              lineup.WR1.injuryStatus === "DOUBTFUL" ? "bg-orange-100 text-orange-700" :
                              lineup.WR1.injuryStatus === "QUESTIONABLE" ? "bg-yellow-100 text-yellow-700" :
                              "bg-gray-100 text-gray-700"
                            }`}>
                              {lineup.WR1.injuryStatus === "INJURY_RESERVE" ? "IR" : lineup.WR1.injuryStatus.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{lineup.WR1.team}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{lineup.WR1.projectedPoints?.toFixed(2) || "—"}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 italic flex-1">Empty</div>
                  )}
                </div>

                {/* WR2 */}
                <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <button
                    onClick={() => {
                      setEditingSlot('WR2');
                      getPositionRecommendation('WR2');
                    }}
                    className="w-16 flex-shrink-0"
                  >
                    <span className="px-3 py-1.5 bg-[#1A8CFF]/10 text-[#1A8CFF] hover:bg-[#1A8CFF]/20 rounded-full text-xs font-bold inline-block text-center min-w-[3rem] cursor-pointer transition-colors">
                      WR
                    </span>
                  </button>
                  {lineup.WR2 ? (
                    <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => setSelectedPlayer(lineup.WR2)}>
                      {lineup.WR2.photoUrl && (
                        <img src={lineup.WR2.photoUrl} alt={lineup.WR2.name} className="w-12 h-12 rounded-full object-cover border-2 border-gray-200" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-gray-900 truncate">{lineup.WR2.name}</div>
                          {lineup.WR2.injuryStatus && lineup.WR2.injuryStatus !== "ACTIVE" && (
                            <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                              lineup.WR2.injuryStatus === "OUT" || lineup.WR2.injuryStatus === "INJURY_RESERVE" ? "bg-red-100 text-red-700" :
                              lineup.WR2.injuryStatus === "DOUBTFUL" ? "bg-orange-100 text-orange-700" :
                              lineup.WR2.injuryStatus === "QUESTIONABLE" ? "bg-yellow-100 text-yellow-700" :
                              "bg-gray-100 text-gray-700"
                            }`}>
                              {lineup.WR2.injuryStatus === "INJURY_RESERVE" ? "IR" : lineup.WR2.injuryStatus.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{lineup.WR2.team}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{lineup.WR2.projectedPoints?.toFixed(2) || "—"}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 italic flex-1">Empty</div>
                  )}
                </div>

                {/* TE */}
                <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <button
                    onClick={() => {
                      setEditingSlot('TE');
                      getPositionRecommendation('TE');
                    }}
                    className="w-16 flex-shrink-0"
                  >
                    <span className="px-3 py-1.5 bg-[#1A8CFF]/10 text-[#1A8CFF] hover:bg-[#1A8CFF]/20 rounded-full text-xs font-bold inline-block text-center min-w-[3rem] cursor-pointer transition-colors">
                      TE
                    </span>
                  </button>
                  {lineup.TE ? (
                    <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => setSelectedPlayer(lineup.TE)}>
                      {lineup.TE.photoUrl && (
                        <img src={lineup.TE.photoUrl} alt={lineup.TE.name} className="w-12 h-12 rounded-full object-cover border-2 border-gray-200" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-gray-900 truncate">{lineup.TE.name}</div>
                          {lineup.TE.injuryStatus && lineup.TE.injuryStatus !== "ACTIVE" && (
                            <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                              lineup.TE.injuryStatus === "OUT" || lineup.TE.injuryStatus === "INJURY_RESERVE" ? "bg-red-100 text-red-700" :
                              lineup.TE.injuryStatus === "DOUBTFUL" ? "bg-orange-100 text-orange-700" :
                              lineup.TE.injuryStatus === "QUESTIONABLE" ? "bg-yellow-100 text-yellow-700" :
                              "bg-gray-100 text-gray-700"
                            }`}>
                              {lineup.TE.injuryStatus === "INJURY_RESERVE" ? "IR" : lineup.TE.injuryStatus.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{lineup.TE.team}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{lineup.TE.projectedPoints?.toFixed(2) || "—"}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 italic flex-1">Empty</div>
                  )}
                </div>

                {/* FLEX */}
                <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <button
                    onClick={() => {
                      setEditingSlot('FLEX');
                      getPositionRecommendation('FLEX');
                    }}
                    className="w-16 flex-shrink-0"
                  >
                    <span className="px-3 py-1.5 bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 rounded-full text-xs font-bold inline-block text-center min-w-[3rem] cursor-pointer transition-colors">
                      FLEX
                    </span>
                  </button>
                  {lineup.FLEX ? (
                    <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => setSelectedPlayer(lineup.FLEX)}>
                      {lineup.FLEX.photoUrl && (
                        <img src={lineup.FLEX.photoUrl} alt={lineup.FLEX.name} className="w-12 h-12 rounded-full object-cover border-2 border-gray-200" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-gray-900 truncate">{lineup.FLEX.name}</div>
                          {lineup.FLEX.injuryStatus && lineup.FLEX.injuryStatus !== "ACTIVE" && (
                            <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                              lineup.FLEX.injuryStatus === "OUT" || lineup.FLEX.injuryStatus === "INJURY_RESERVE" ? "bg-red-100 text-red-700" :
                              lineup.FLEX.injuryStatus === "DOUBTFUL" ? "bg-orange-100 text-orange-700" :
                              lineup.FLEX.injuryStatus === "QUESTIONABLE" ? "bg-yellow-100 text-yellow-700" :
                              "bg-gray-100 text-gray-700"
                            }`}>
                              {lineup.FLEX.injuryStatus === "INJURY_RESERVE" ? "IR" : lineup.FLEX.injuryStatus.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{lineup.FLEX.position} • {lineup.FLEX.team}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{lineup.FLEX.projectedPoints?.toFixed(2) || "—"}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 italic flex-1">Empty</div>
                  )}
                </div>

                {/* D/ST */}
                <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <button
                    onClick={() => {
                      setEditingSlot('DST');
                      getPositionRecommendation('DST');
                    }}
                    className="w-16 flex-shrink-0"
                  >
                    <span className="px-3 py-1.5 bg-[#1A8CFF]/10 text-[#1A8CFF] hover:bg-[#1A8CFF]/20 rounded-full text-xs font-bold inline-block text-center min-w-[3rem] cursor-pointer transition-colors">
                      D/ST
                    </span>
                  </button>
                  {lineup.DST ? (
                    <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => setSelectedPlayer(lineup.DST)}>
                      {lineup.DST.photoUrl && (
                        <img src={lineup.DST.photoUrl} alt={lineup.DST.name} className="w-12 h-12 rounded-full object-cover border-2 border-gray-200" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-gray-900 truncate">{lineup.DST.name}</div>
                          {lineup.DST.injuryStatus && lineup.DST.injuryStatus !== "ACTIVE" && (
                            <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                              lineup.DST.injuryStatus === "OUT" || lineup.DST.injuryStatus === "INJURY_RESERVE" ? "bg-red-100 text-red-700" :
                              lineup.DST.injuryStatus === "DOUBTFUL" ? "bg-orange-100 text-orange-700" :
                              lineup.DST.injuryStatus === "QUESTIONABLE" ? "bg-yellow-100 text-yellow-700" :
                              "bg-gray-100 text-gray-700"
                            }`}>
                              {lineup.DST.injuryStatus === "INJURY_RESERVE" ? "IR" : lineup.DST.injuryStatus.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{lineup.DST.team}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{lineup.DST.projectedPoints?.toFixed(2) || "—"}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 italic flex-1">Empty</div>
                  )}
                </div>

                {/* K */}
                <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <button
                    onClick={() => {
                      setEditingSlot('K');
                      getPositionRecommendation('K');
                    }}
                    className="w-16 flex-shrink-0"
                  >
                    <span className="px-3 py-1.5 bg-[#1A8CFF]/10 text-[#1A8CFF] hover:bg-[#1A8CFF]/20 rounded-full text-xs font-bold inline-block text-center min-w-[3rem] cursor-pointer transition-colors">
                      K
                    </span>
                  </button>
                  {lineup.K ? (
                    <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => setSelectedPlayer(lineup.K)}>
                      {lineup.K.photoUrl && (
                        <img src={lineup.K.photoUrl} alt={lineup.K.name} className="w-12 h-12 rounded-full object-cover border-2 border-gray-200" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-gray-900 truncate">{lineup.K.name}</div>
                          {lineup.K.injuryStatus && lineup.K.injuryStatus !== "ACTIVE" && (
                            <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                              lineup.K.injuryStatus === "OUT" || lineup.K.injuryStatus === "INJURY_RESERVE" ? "bg-red-100 text-red-700" :
                              lineup.K.injuryStatus === "DOUBTFUL" ? "bg-orange-100 text-orange-700" :
                              lineup.K.injuryStatus === "QUESTIONABLE" ? "bg-yellow-100 text-yellow-700" :
                              "bg-gray-100 text-gray-700"
                            }`}>
                              {lineup.K.injuryStatus === "INJURY_RESERVE" ? "IR" : lineup.K.injuryStatus.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{lineup.K.team}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{lineup.K.projectedPoints?.toFixed(2) || "—"}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 italic flex-1">Empty</div>
                  )}
                </div>
              </div>
            </div>

            {/* Bench Section */}
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-gray-200">
                <h3 className="text-sm font-bold text-[#0B1E3D] uppercase tracking-wide">
                  Bench
                </h3>
                <span className="text-sm font-bold text-gray-600">SCORE</span>
              </div>
              <div className="space-y-2">
                {lineup.BE.filter(p => p.injuryStatus !== "INJURY_RESERVE").length > 0 ? lineup.BE.filter(p => p.injuryStatus !== "INJURY_RESERVE").map((player, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors" onClick={() => setSelectedPlayer(player)}>
                    <div className="w-16 flex-shrink-0">
                      <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-bold inline-block text-center min-w-[3rem]">
                        BE
                      </span>
                    </div>
                    {player.photoUrl && (
                      <img src={player.photoUrl} alt={player.name} className="w-12 h-12 rounded-full object-cover border-2 border-gray-200" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-gray-900 truncate">{player.name}</div>
                        {player.injuryStatus && player.injuryStatus !== "ACTIVE" && (
                          <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                            player.injuryStatus === "OUT" || player.injuryStatus === "INJURY_RESERVE" ? "bg-red-100 text-red-700" :
                            player.injuryStatus === "DOUBTFUL" ? "bg-orange-100 text-orange-700" :
                            player.injuryStatus === "QUESTIONABLE" ? "bg-yellow-100 text-yellow-700" :
                            "bg-gray-100 text-gray-700"
                          }`}>
                            {player.injuryStatus === "INJURY_RESERVE" ? "IR" : player.injuryStatus.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{player.position} • {player.team}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{player.projectedPoints?.toFixed(2) || "—"}</div>
                    </div>
                  </div>
                )) : (
                  <div className="text-sm text-gray-400 italic text-center py-4">No bench players</div>
                )}
              </div>
            </div>

            {/* IR Section - Only 1 spot */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-red-200">
                <h3 className="text-sm font-bold text-red-700 uppercase tracking-wide">
                  Injured Reserve
                </h3>
                <span className="text-sm font-bold text-gray-600">SCORE</span>
              </div>
              <div className="space-y-2">
                {lineup.BE.filter(p => p.injuryStatus === "INJURY_RESERVE").slice(0, 1).length > 0 ? (
                  lineup.BE.filter(p => p.injuryStatus === "INJURY_RESERVE").slice(0, 1).map((player, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-red-50 rounded-xl cursor-pointer transition-colors hover:bg-red-100" onClick={() => setSelectedPlayer(player)}>
                      <div className="w-16 flex-shrink-0">
                        <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-bold inline-block text-center min-w-[3rem]">
                          IR
                        </span>
                      </div>
                      {player.photoUrl && (
                        <img src={player.photoUrl} alt={player.name} className="w-12 h-12 rounded-full object-cover border-2 border-red-200" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-gray-900 truncate">{player.name}</div>
                          <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">
                            IR
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">{player.position} • {player.team}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-400">{player.projectedPoints?.toFixed(2) || "—"}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-red-50/50 rounded-xl">
                    <div className="w-16 flex-shrink-0">
                      <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-bold inline-block text-center min-w-[3rem]">
                        IR
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 italic flex-1">Empty</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Waiver Wire Section */}
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Waiver Wire</h2>
                  <p className="text-white/80 text-xs sm:text-sm">Top available players to strengthen your roster</p>
                </div>
              </div>
              <Link
                href="/waiver"
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-purple-600 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold hover:shadow-2xl hover:shadow-white/30 transform hover:scale-105 transition-all duration-200"
              >
                View All →
              </Link>
            </div>

            {data.availablePlayers && data.availablePlayers.length > 0 ? (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {data.availablePlayers.slice(0, 6).map((player, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:bg-white/20 transition-all duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-1 bg-white/20 text-white rounded-lg text-xs font-bold">
                        #{i + 1}
                      </span>
                      <span className="px-2 py-1 bg-purple-500 text-white rounded-lg text-xs font-bold">
                        {player.position}
                      </span>
                    </div>
                    <h4 className="text-white font-bold text-lg mb-1">{player.name}</h4>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">{player.team}</span>
                      {player.projectedPoints && (
                        <span className="text-white font-bold">{player.projectedPoints.toFixed(2)} proj</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center">
                <p className="text-white/80">Connect your ESPN league to see available players</p>
                <Link
                  href="/connect"
                  className="inline-block mt-4 px-6 py-3 bg-white text-purple-600 rounded-xl font-bold hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Connect League
                </Link>
              </div>
            )}
          </div>

          {/* AI Insights Section - Placeholder */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {/* Roster Strengths & Weaknesses */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl">
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
                <h3 className="text-lg font-bold text-[#0B1E3D]">
                  Roster Analysis
                </h3>
              </div>
              {loadingAnalysis.overview ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A8CFF]"></div>
                  <span className="ml-3 text-sm text-gray-600">Analyzing roster...</span>
                </div>
              ) : aiAnalysis.overview ? (
                <div className="prose prose-sm max-w-none">
                  <div className="text-sm text-gray-700 leading-relaxed markdown-content">
                    <ReactMarkdown>{aiAnalysis.overview}</ReactMarkdown>
                  </div>
                  <p className="text-xs text-gray-500 mt-4 italic">
                    🤖 Powered by GPT-4o
                  </p>
                </div>
              ) : (
                <div>
                  <div className="space-y-3">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-3">
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
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-3">
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
                    Click Generate AI Analysis below for detailed insights
                  </p>
                </div>
              )}
            </div>

            {/* Start/Sit Recommendations */}
            <div className="bg-white rounded-3xl p-6 shadow-2xl">
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
                <h3 className="text-lg font-bold text-[#0B1E3D]">
                  Start/Sit
                </h3>
              </div>
              {loadingAnalysis.lineup ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A8CFF]"></div>
                  <span className="ml-3 text-sm text-gray-600">Analyzing lineup...</span>
                </div>
              ) : aiAnalysis.lineup ? (
                <div className="prose prose-sm max-w-none">
                  <div className="text-sm text-gray-700 leading-relaxed markdown-content">
                    <ReactMarkdown>{aiAnalysis.lineup}</ReactMarkdown>
                  </div>
                  <p className="text-xs text-gray-500 mt-4 italic">
                    🤖 Powered by GPT-4o
                  </p>
                </div>
              ) : (
                <div>
                  <div className="space-y-3">
                    <div className="bg-gradient-to-br from-[#1A8CFF]/10 to-[#1A8CFF]/20 border border-[#1A8CFF]/30 rounded-xl p-3">
                      <p className="text-xs font-semibold text-[#1A8CFF] mb-1">
                        RECOMMENDED STARTS
                      </p>
                      <p className="text-sm text-gray-700">
                        {data.roster.slice(0, 2).map((p) => p.name).join(", ") ||
                          "Players TBD"}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-3">
                      <p className="text-xs font-semibold text-gray-700 mb-1">
                        CONSIDER BENCHING
                      </p>
                      <p className="text-sm text-gray-700">
                        Matchup-based recommendations will appear here
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-4 italic">
                    Click Generate AI Analysis below for detailed insights
                  </p>
                </div>
              )}
            </div>

            {/* Waiver Targets */}
            <div className="bg-white rounded-3xl p-6 shadow-2xl">
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
                <h3 className="text-lg font-bold text-[#0B1E3D]">
                  Waiver Targets
                </h3>
              </div>
              {loadingAnalysis.waiver ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A8CFF]"></div>
                  <span className="ml-3 text-sm text-gray-600">Analyzing waiver wire...</span>
                </div>
              ) : aiAnalysis.waiver ? (
                <div className="prose prose-sm max-w-none">
                  <div className="text-sm text-gray-700 leading-relaxed markdown-content">
                    <ReactMarkdown>{aiAnalysis.waiver}</ReactMarkdown>
                  </div>
                  <p className="text-xs text-gray-500 mt-4 italic">
                    🤖 Powered by GPT-4o
                  </p>
                </div>
              ) : (
                <div>
                  <div className="space-y-3">
                    {data.availablePlayers.slice(0, 3).map((player, i) => (
                      <div key={i} className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-3">
                        <p className="text-sm font-semibold text-[#0B1E3D]">
                          {player.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {player.position} • {player.team || "Unknown"}
                        </p>
                      </div>
                    ))}
                    {data.availablePlayers.length === 0 && (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-3">
                        <p className="text-sm text-gray-600">
                          Upload screenshots with available players to see recommendations
                        </p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-4 italic">
                    Click Generate AI Analysis below for detailed insights
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* AI Info */}
          <div className="bg-gradient-to-br from-[#26D36B]/10 to-[#26D36B]/20 border-2 border-[#26D36B]/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-[#26D36B] mt-0.5 mr-2 sm:mr-3 flex-shrink-0"
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
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-[#26D36B] mb-1">
                  AI-Powered Analysis
                </h3>
                <p className="text-xs sm:text-sm text-gray-700">
                  Click Generate AI Analysis below to get personalized insights from GPT-4o.
                  The AI will analyze your roster composition, suggest optimal lineups based on
                  matchups, and recommend top waiver wire targets tailored to your team&apos;s needs.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
            <Link
              href="/upload"
              className="flex-1 border-2 border-white/30 text-white py-3 px-4 sm:px-6 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold hover:bg-white/10 hover:border-white/50 transition-all duration-200 text-center"
            >
              Upload New Data
            </Link>
            <button
              onClick={() => {
                generateAIAnalysis("overview");
                generateAIAnalysis("lineup");
                generateAIAnalysis("waiver");
              }}
              disabled={loadingAnalysis.overview || loadingAnalysis.lineup || loadingAnalysis.waiver}
              className="flex-1 bg-gradient-to-r from-[#26D36B] to-[#1A8CFF] text-[#0B1E3D] py-3 px-4 sm:px-6 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold hover:shadow-2xl hover:shadow-[#26D36B]/30 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loadingAnalysis.overview || loadingAnalysis.lineup || loadingAnalysis.waiver
                ? "Generating..."
                : "Generate AI Analysis"}
            </button>
          </div>
        </div>
      </div>

      {/* Player Detail Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-6" onClick={() => setSelectedPlayer(null)}>
          <div className="bg-white rounded-none sm:rounded-3xl p-6 sm:p-8 shadow-2xl w-full sm:max-w-2xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                {selectedPlayer.photoUrl && (
                  <img
                    src={selectedPlayer.photoUrl}
                    alt={selectedPlayer.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-[#1A8CFF]"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/96?text=NFL';
                    }}
                  />
                )}
                <div>
                  <h2 className="text-3xl font-bold text-[#0B1E3D]">{selectedPlayer.name}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="px-3 py-1 bg-[#1A8CFF]/20 text-[#1A8CFF] rounded-full font-semibold text-sm">
                      {selectedPlayer.position}
                    </span>
                    <span className="text-gray-600">{selectedPlayer.team}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlayer(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-[#1A8CFF]/10 to-[#1A8CFF]/20 border border-[#1A8CFF]/30 rounded-2xl p-4 text-center">
                <div className="text-sm text-gray-600 mb-1">This Week</div>
                <div className="text-3xl font-bold text-[#1A8CFF]">
                  {selectedPlayer.projectedPoints ? selectedPlayer.projectedPoints.toFixed(2) : "—"}
                </div>
                <div className="text-xs text-gray-500 mt-1">Projected</div>
              </div>
              <div className="bg-gradient-to-br from-[#26D36B]/10 to-[#26D36B]/20 border border-[#26D36B]/30 rounded-2xl p-4 text-center">
                <div className="text-sm text-gray-600 mb-1">Season Avg</div>
                <div className="text-3xl font-bold text-[#26D36B]">
                  {selectedPlayer.seasonStats?.averagePoints ? selectedPlayer.seasonStats.averagePoints.toFixed(2) : "—"}
                </div>
                <div className="text-xs text-gray-500 mt-1">PPG</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/20 border border-purple-500/30 rounded-2xl p-4 text-center">
                <div className="text-sm text-gray-600 mb-1">Rostered</div>
                <div className="text-3xl font-bold text-purple-600">
                  {selectedPlayer.ownership?.percentOwned ? `${selectedPlayer.ownership.percentOwned.toFixed(0)}%` : "—"}
                </div>
                <div className="text-xs text-gray-500 mt-1">% Owned</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/20 border border-orange-500/30 rounded-2xl p-4 text-center">
                <div className="text-sm text-gray-600 mb-1">Started</div>
                <div className="text-3xl font-bold text-orange-600">
                  {selectedPlayer.ownership?.percentStarted ? `${selectedPlayer.ownership.percentStarted.toFixed(0)}%` : "—"}
                </div>
                <div className="text-xs text-gray-500 mt-1">% Started</div>
              </div>
            </div>

            {/* Injury Status */}
            {selectedPlayer.injuryStatus && selectedPlayer.injuryStatus !== "ACTIVE" && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-bold text-red-700">Injury Status: {selectedPlayer.injuryStatus}</span>
                </div>
              </div>
            )}

            {/* Week-by-Week Point History */}
            {selectedPlayer.stats && selectedPlayer.stats.filter((s: any) => s.statSourceId === 0 && s.scoringPeriodId > 0).length > 0 && (
              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <h3 className="text-lg font-bold text-[#0B1E3D] mb-4">Week-by-Week Performance</h3>
                <div className="space-y-2">
                  {selectedPlayer.stats
                    .filter((s: any) => s.statSourceId === 0 && s.scoringPeriodId > 0)
                    .sort((a: any, b: any) => b.scoringPeriodId - a.scoringPeriodId)
                    .slice(0, 10)
                    .map((stat: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                        <span className="text-sm font-semibold text-gray-700">Week {stat.scoringPeriodId}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-[#1A8CFF] to-[#26D36B] h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min((stat.appliedTotal / 30) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-lg font-bold text-[#1A8CFF] min-w-[60px] text-right">
                            {stat.appliedTotal ? stat.appliedTotal.toFixed(2) : "0.00"} pts
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Season Total */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-bold text-[#0B1E3D] mb-3">Season Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Total Points</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedPlayer.seasonStats?.totalPoints ? selectedPlayer.seasonStats.totalPoints.toFixed(2) : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Average Points</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedPlayer.seasonStats?.averagePoints ? selectedPlayer.seasonStats.averagePoints.toFixed(2) : "—"}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setSelectedPlayer(null)}
                className="px-6 py-3 bg-gradient-to-r from-[#26D36B] to-[#1A8CFF] text-white rounded-xl font-bold hover:shadow-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Swap Player Modal */}
      {editingSlot && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-6" onClick={() => setEditingSlot(null)}>
          <div className="bg-white rounded-none sm:rounded-3xl p-6 sm:p-8 shadow-2xl w-full sm:max-w-2xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#0B1E3D]">{editingSlot} Position</h2>
              <button
                onClick={() => setEditingSlot(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* AI Recommendation */}
            {loadingPositionRec ? (
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                  <span className="text-sm text-gray-600">AI analyzing your options...</span>
                </div>
              </div>
            ) : positionRecommendation && (
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <h3 className="text-sm font-bold text-purple-700 uppercase">AI Recommendation</h3>
                </div>
                <div className="text-sm text-gray-700 leading-relaxed markdown-content">
                  <ReactMarkdown>{positionRecommendation}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Current Starter */}
            {editingSlot && lineup[editingSlot as keyof typeof lineup] && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-600 uppercase mb-3">Current Starter</h3>
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#26D36B]/10 to-[#26D36B]/20 border border-[#26D36B]/30 rounded-xl">
                  {(lineup[editingSlot as keyof typeof lineup] as any)?.photoUrl && (
                    <img
                      src={(lineup[editingSlot as keyof typeof lineup] as any).photoUrl}
                      alt={(lineup[editingSlot as keyof typeof lineup] as any).name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-[#26D36B]"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 text-lg">{(lineup[editingSlot as keyof typeof lineup] as any)?.name}</div>
                    <div className="text-sm text-gray-500">{(lineup[editingSlot as keyof typeof lineup] as any)?.position} • {(lineup[editingSlot as keyof typeof lineup] as any)?.team}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#26D36B] text-xl">{(lineup[editingSlot as keyof typeof lineup] as any)?.projectedPoints?.toFixed(2) || "—"}</div>
                    <div className="text-xs text-gray-500">Projected</div>
                  </div>
                </div>
              </div>
            )}

            {/* Available Bench Players */}
            <h3 className="text-sm font-bold text-gray-600 uppercase mb-3">Available Bench Players</h3>
            <div className="space-y-2">
              {lineup.BE.filter(p => {
                // Filter bench players that can fill this position
                if (editingSlot === 'QB') return p.position === 'QB';
                if (editingSlot === 'RB1' || editingSlot === 'RB2') return p.position === 'RB';
                if (editingSlot === 'WR1' || editingSlot === 'WR2') return p.position === 'WR';
                if (editingSlot === 'TE') return p.position === 'TE';
                if (editingSlot === 'FLEX') return ['RB', 'WR', 'TE'].includes(p.position);
                if (editingSlot === 'DST') return p.position === 'DEF';
                if (editingSlot === 'K') return p.position === 'K';
                return false;
              }).map((player, i) => (
                <button
                  key={i}
                  onClick={() => {
                    swapPlayerToStarter(player, editingSlot);
                    setEditingSlot(null);
                  }}
                  className="w-full flex items-center gap-3 p-4 hover:bg-[#1A8CFF]/10 rounded-xl transition-colors text-left"
                >
                  {player.photoUrl && (
                    <img
                      src={player.photoUrl}
                      alt={player.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{player.name}</div>
                    <div className="text-sm text-gray-500">{player.position} • {player.team}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#1A8CFF]">{player.projectedPoints?.toFixed(2) || "—"}</div>
                    <div className="text-xs text-gray-500">Proj</div>
                  </div>
                </button>
              ))}
              {lineup.BE.filter(p => {
                if (editingSlot === 'QB') return p.position === 'QB';
                if (editingSlot === 'RB1' || editingSlot === 'RB2') return p.position === 'RB';
                if (editingSlot === 'WR1' || editingSlot === 'WR2') return p.position === 'WR';
                if (editingSlot === 'TE') return p.position === 'TE';
                if (editingSlot === 'FLEX') return ['RB', 'WR', 'TE'].includes(p.position);
                if (editingSlot === 'DST') return p.position === 'DEF';
                if (editingSlot === 'K') return p.position === 'K';
                return false;
              }).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No eligible bench players for this position
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auto Lineup Modal */}
      {showAutoLineupModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-none sm:rounded-3xl w-full sm:max-w-2xl h-full sm:h-auto sm:max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#0B1E3D]">Auto Lineup</h3>
                    <p className="text-sm text-gray-600">Optimized by projected points</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAutoLineupModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Success Message */}
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-green-900">Lineup Optimized!</h4>
                    <p className="text-sm text-green-700">Your starters have been set based on projected points.</p>
                  </div>
                </div>
              </div>

              {/* AI Reasoning */}
              {loadingAutoLineup ? (
                <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    <span className="text-sm text-gray-600">AI analyzing your lineup decisions...</span>
                  </div>
                </div>
              ) : autoLineupReasoning && (
                <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <h4 className="text-sm font-bold text-purple-700 uppercase">AI Reasoning</h4>
                  </div>
                  <div className="text-sm text-gray-700 leading-relaxed markdown-content prose prose-sm max-w-none">
                    <ReactMarkdown>{autoLineupReasoning}</ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowAutoLineupModal(false)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 transform hover:scale-105 transition-all duration-200"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
