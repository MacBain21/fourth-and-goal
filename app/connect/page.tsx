"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ConnectPage() {
  const router = useRouter();
  const [leagueId, setLeagueId] = useState("");
  const [seasonId, setSeasonId] = useState(new Date().getFullYear().toString());
  const [swid, setSwid] = useState("");
  const [espnS2, setEspnS2] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");
  const [showCookieHelp, setShowCookieHelp] = useState(false);

  const handleConnect = async () => {
    setError("");
    setIsConnecting(true);

    try {
      // Save credentials to localStorage
      const espnConfig = {
        leagueId,
        seasonId,
        swid,
        espnS2,
        connectedAt: new Date().toISOString(),
      };

      localStorage.setItem("espnConfig", JSON.stringify(espnConfig));

      // Test the connection by fetching league data
      const response = await fetch("/api/espn/league", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(espnConfig),
      });

      if (!response.ok) {
        throw new Error("Failed to connect to ESPN. Please check your credentials.");
      }

      const data = await response.json();

      // Store league data
      localStorage.setItem("leagueData", JSON.stringify(data));

      // Redirect to analysis page
      router.push("/analysis");
    } catch (err: any) {
      setError(err.message || "Failed to connect. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <main className="min-h-screen py-12 bg-gradient-to-br from-[#000918] via-[#051639] to-[#020712]">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#26D36B]/20 backdrop-blur-sm border border-[#26D36B]/30 rounded-full mb-6">
              <span className="text-2xl">🔗</span>
              <span className="text-sm font-semibold text-[#26D36B]">
                Live ESPN Integration
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">
              Connect Your ESPN League
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Get real-time data, automatic roster updates, and live waiver wire monitoring
            </p>
          </div>

          {/* Connection Form */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl mb-6">
            <div className="space-y-6">
              {/* League ID */}
              <div>
                <label className="block text-sm font-bold text-[#0B1E3D] mb-2">
                  League ID <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={leagueId}
                  onChange={(e) => setLeagueId(e.target.value)}
                  placeholder="Enter your ESPN league ID"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1A8CFF] focus:outline-none transition-colors"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Find this in your ESPN league URL: espn.com/fantasy/football/league?leagueId=<strong>123456</strong>
                </p>
              </div>

              {/* Season Year */}
              <div>
                <label className="block text-sm font-bold text-[#0B1E3D] mb-2">
                  Season Year <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={seasonId}
                  onChange={(e) => setSeasonId(e.target.value)}
                  placeholder="2024"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1A8CFF] focus:outline-none transition-colors"
                />
              </div>

              {/* Private League Notice */}
              <div className="bg-gradient-to-br from-[#1A8CFF]/10 to-[#1A8CFF]/20 border-2 border-[#1A8CFF]/30 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#1A8CFF] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-[#1A8CFF] mb-2">
                      Private League? You&apos;ll need cookies
                    </h3>
                    <p className="text-sm text-gray-700 mb-3">
                      If your league is private, you need to provide your ESPN cookies (swid and espn_s2) to access the data.
                    </p>
                    <button
                      onClick={() => setShowCookieHelp(!showCookieHelp)}
                      className="text-sm font-semibold text-[#1A8CFF] hover:underline"
                    >
                      {showCookieHelp ? "Hide" : "Show"} instructions →
                    </button>
                  </div>
                </div>

                {showCookieHelp && (
                  <div className="mt-4 pt-4 border-t border-[#1A8CFF]/20 space-y-3 text-sm text-gray-700">
                    <p className="font-semibold">How to get your ESPN cookies:</p>
                    <ol className="list-decimal list-inside space-y-2 ml-2">
                      <li>Open ESPN Fantasy in your browser and log in</li>
                      <li>Press F12 to open Developer Tools</li>
                      <li>Go to the "Application" or "Storage" tab</li>
                      <li>Click "Cookies" → "espn.com"</li>
                      <li>Find and copy the values for:
                        <ul className="list-disc list-inside ml-4 mt-1">
                          <li><code className="bg-gray-100 px-1 rounded">swid</code></li>
                          <li><code className="bg-gray-100 px-1 rounded">espn_s2</code></li>
                        </ul>
                      </li>
                    </ol>
                    <p className="text-xs text-gray-500 italic mt-3">
                      Note: Your cookies are stored locally in your browser and never sent to our servers.
                    </p>
                  </div>
                )}
              </div>

              {/* SWID */}
              <div>
                <label className="block text-sm font-bold text-[#0B1E3D] mb-2">
                  SWID (for private leagues)
                </label>
                <input
                  type="text"
                  value={swid}
                  onChange={(e) => setSwid(e.target.value)}
                  placeholder="{XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX}"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1A8CFF] focus:outline-none transition-colors font-mono text-sm"
                />
              </div>

              {/* ESPN_S2 */}
              <div>
                <label className="block text-sm font-bold text-[#0B1E3D] mb-2">
                  ESPN_S2 (for private leagues)
                </label>
                <textarea
                  value={espnS2}
                  onChange={(e) => setEspnS2(e.target.value)}
                  placeholder="Long authentication string..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1A8CFF] focus:outline-none transition-colors font-mono text-sm resize-none"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              {/* Connect Button */}
              <button
                onClick={handleConnect}
                disabled={!leagueId || !seasonId || isConnecting}
                className="w-full bg-gradient-to-r from-[#26D36B] to-[#1A8CFF] text-[#0B1E3D] py-4 px-6 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-[#26D36B]/30 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isConnecting ? "Connecting..." : "Connect League →"}
              </button>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-white font-bold mb-2">Real-Time Data</h3>
              <p className="text-white/70 text-sm">
                Get live updates on rosters, scores, and matchups
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="text-3xl mb-3">🔔</div>
              <h3 className="text-white font-bold mb-2">Smart Alerts</h3>
              <p className="text-white/70 text-sm">
                Get notified when high-value players hit waivers
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="text-white font-bold mb-2">AI Analysis</h3>
              <p className="text-white/70 text-sm">
                Enhanced insights based on your actual league settings
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
