import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000918] via-[#051639] to-[#020712]">
      {/* Main Card Container */}
      <div className="max-w-[1200px] mx-auto">
        <div className="bg-white rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.35)] overflow-hidden">

          {/* Hero Section with Stadium Background */}
          <div className="relative h-[70vh] bg-gradient-to-br from-[#0B1E3D] to-[#051639] overflow-hidden">
            {/* Stadium Background Overlay */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&q=80')] bg-cover bg-center opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-br from-black/65 to-black/45" />

            {/* Hero Content */}
            <div className="relative h-full flex items-center px-12 md:px-16">
              <div className="grid md:grid-cols-2 gap-12 w-full items-center">

                {/* Left Column */}
                <div className="z-10">
                  {/* Eyebrow */}
                  <div className="text-white/65 text-[14px] tracking-[0.18em] uppercase mb-4">
                    Fantasy Football • Fourth & Goal
                  </div>

                  {/* Headline */}
                  <h1 className="text-white text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.05] mb-6 max-w-[520px]">
                    UNLEASH THE FIRE OF FANTASY FOOTBALL
                  </h1>

                  {/* Subheadline */}
                  <p className="text-white/78 text-base md:text-lg max-w-[480px] mb-8">
                    Every lineup, every waiver claim, every matchup can change your season. Turn your league into a primetime showdown.
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex flex-wrap gap-4 mb-10">
                    <Link
                      href="/upload"
                      className="inline-flex items-center justify-center px-7 py-3.5 bg-[#26D36B] text-[#001021] rounded-full font-bold text-sm hover:bg-[#22C05F] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Upload League Data
                    </Link>
                    <Link
                      href="/analysis"
                      className="inline-flex items-center justify-center px-7 py-3.5 bg-white text-[#0B1E3D] rounded-full font-semibold text-sm hover:bg-gray-100 transition-all duration-200"
                    >
                      View Demo
                    </Link>
                  </div>

                  {/* Coach Badge */}
                  <div className="flex items-start gap-4">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-white flex items-center justify-center text-white font-bold text-xs"
                        >
                          {i === 3 ? '12+' : ''}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="text-white/90 font-semibold text-xs mb-1">League Veterans</div>
                      <p className="text-white/78 text-[13px] max-w-[360px]">
                        Built by obsessed fantasy players. Optimized for smack talk, rivalries, and championship banners.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column - Player Visual */}
                <div className="relative hidden md:block">
                  <div className="relative h-[500px] flex items-end justify-center">
                    {/* Grass Strip */}
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#1A7C3B] to-transparent" />

                    {/* Player Silhouette */}
                    <div className="relative z-10 text-9xl filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.6)]">
                      🏈
                    </div>

                    {/* Play Button */}
                    <button className="absolute left-1/4 top-1/2 transform -translate-y-1/2 flex items-center gap-3 group">
                      <div className="w-14 h-14 rounded-full bg-[#26D36B] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-[#001021] ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                      <span className="text-white/88 text-sm font-medium max-w-[140px]">
                        Watch How Fourth & Goal Works
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Next Match Section */}
          <div className="bg-white py-14 px-12 md:px-16">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left Side */}
              <div>
                <div className="text-[#0B1E3D] text-sm tracking-[0.16em] uppercase mb-3 font-semibold">
                  Next Matchup
                </div>
                <h2 className="text-[#0B1E3D] text-3xl md:text-4xl font-extrabold mb-4">
                  YOUR BIGGEST CLASH OF THE WEEK
                </h2>
                <p className="text-[#4B5673] text-sm max-w-[420px]">
                  See live odds, projected points, and who&apos;s favored. One glance, and you know whether you&apos;re the underdog or the juggernaut.
                </p>
              </div>

              {/* Right Side - Matchup Card */}
              <div>
                <div className="bg-[#0B1E3D] rounded-[20px] p-6 text-white">
                  <div className="text-xs text-white/60 uppercase tracking-wider mb-4">Week 7</div>

                  <div className="grid grid-cols-3 gap-4 items-center mb-4">
                    {/* Team 1 */}
                    <div className="text-center">
                      <div className="text-4xl mb-2">👤</div>
                      <div className="text-xs text-white/70 mb-1">Your Squad</div>
                      <div className="text-2xl font-bold">112.4</div>
                      <div className="text-xs text-white/50">projected</div>
                    </div>

                    {/* VS */}
                    <div className="text-center">
                      <div className="text-white/40 font-bold text-sm">VS</div>
                    </div>

                    {/* Team 2 */}
                    <div className="text-center">
                      <div className="text-4xl mb-2">👤</div>
                      <div className="text-xs text-white/70 mb-1">Rival Team</div>
                      <div className="text-2xl font-bold">107.9</div>
                      <div className="text-xs text-white/50">projected</div>
                    </div>
                  </div>

                  {/* Win Probability Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-2">
                      <span>Win Probability</span>
                      <span className="text-[#26D36B]">58%</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-[#26D36B] rounded-full" style={{ width: '58%' }} />
                    </div>
                  </div>

                  <div className="text-xs text-white/60 text-center pt-3 border-t border-white/10">
                    Lineups lock Sunday 1:00 PM ET
                  </div>
                </div>

                <div className="text-right mt-4">
                  <Link
                    href="/analysis"
                    className="inline-flex items-center px-6 py-2.5 border border-[#E2E5F0] text-[#0B1E3D] rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    See All Matchups
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Cards Row */}
          <div className="bg-white py-12 px-12 md:px-16">
            <h3 className="text-[#0B1E3D] text-2xl font-bold mb-8">Why Fourth & Goal?</h3>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="bg-[#F8FAFF] rounded-[18px] p-6 shadow-[0_12px_24px_rgba(15,33,70,0.08)] hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(15,33,70,0.16)] transition-all duration-200">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <h4 className="text-[#0B1E3D] font-bold text-lg mb-2">Smart Projections</h4>
                <p className="text-[#4B5673] text-sm">
                  Clear, weekly matchup projections with confidence ranges you can actually understand.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-[#F8FAFF] rounded-[18px] p-6 shadow-[0_12px_24px_rgba(15,33,70,0.08)] hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(15,33,70,0.16)] transition-all duration-200">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="text-[#0B1E3D] font-bold text-lg mb-2">League Storylines</h4>
                <p className="text-[#4B5673] text-sm">
                  Power rankings, rivalry history, and records that fuel the trash talk.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-[#F8FAFF] rounded-[18px] p-6 shadow-[0_12px_24px_rgba(15,33,70,0.08)] hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(15,33,70,0.16)] transition-all duration-200">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h4 className="text-[#0B1E3D] font-bold text-lg mb-2">Trade Analyzer</h4>
                <p className="text-[#4B5673] text-sm">
                  Instant feedback on whether a deal makes your team better or worse.
                </p>
              </div>
            </div>
          </div>

          {/* Footer CTA Strip */}
          <div className="bg-[#0B1E3D] py-12 px-12 md:px-16 text-center">
            <h3 className="text-white text-2xl font-bold mb-3">
              Ready to turn your league into primetime?
            </h3>
            <p className="text-white/75 text-sm mb-6 max-w-[500px] mx-auto">
              Spin up your league, invite your friends, and let Fourth & Goal handle the drama.
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-[#26D36B] text-[#001021] rounded-full font-bold text-sm hover:bg-[#22C05F] transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Create Your League
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
