import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000918] via-[#051639] to-[#020712]">
      {/* Hero Section with Stadium Background */}
      <div className="relative min-h-screen bg-gradient-to-br from-[#0B1E3D] to-[#051639] overflow-hidden">
        {/* Stadium Background Overlay */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&q=80')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 to-black/50" />

        {/* Hero Content */}
        <div className="relative min-h-screen flex items-center px-4 sm:px-6 md:px-12 py-12 sm:py-20">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">

              {/* Left Column */}
              <div className="z-10">
                {/* Eyebrow */}
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-sm rounded-full mb-4 sm:mb-6 border border-white/20">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-[#26D36B]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-xs sm:text-sm font-semibold text-white">AI-Powered Fantasy Assistant</span>
                </div>

                {/* Headline */}
                <h1 className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight sm:leading-[1.05] mb-4 sm:mb-6">
                  UNLEASH THE FIRE OF{" "}
                  <span className="bg-gradient-to-r from-[#26D36B] to-[#1A8CFF] bg-clip-text text-transparent">
                    FANTASY FOOTBALL
                  </span>
                </h1>

                {/* Subheadline */}
                <p className="text-white/80 text-base sm:text-lg md:text-xl max-w-[540px] mb-8 sm:mb-10 leading-relaxed">
                  Every lineup, every waiver claim, every matchup can change your season. Turn your league into a primetime showdown.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-8 sm:mb-12">
                  <Link
                    href="/upload"
                    className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-[#26D36B] text-[#001021] rounded-full font-bold text-sm sm:text-base hover:bg-[#22C05F] transition-all duration-200 shadow-2xl hover:shadow-[#26D36B]/50 hover:scale-105"
                  >
                    Upload League Data
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link
                    href="/analysis"
                    className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-full font-semibold text-sm sm:text-base hover:bg-white/20 transition-all duration-200"
                  >
                    View Demo
                  </Link>
                </div>

                {/* Social Proof */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-3 border-[#0B1E3D] flex items-center justify-center text-white font-bold shadow-xl"
                      >
                        {i === 4 ? <span className="text-xs">12+</span> : ''}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="text-white font-bold text-xs sm:text-sm mb-1">Join 1,000+ League Managers</div>
                    <p className="text-white/70 text-xs sm:text-sm">
                      Making smarter decisions every week
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Visual */}
              <div className="relative hidden md:block">
                <div className="relative">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#26D36B]/20 to-[#1A8CFF]/20 blur-3xl rounded-full" />

                  {/* Main Visual */}
                  <div className="relative text-center">
                    <div className="text-[180px] leading-none filter drop-shadow-[0_35px_55px_rgba(38,211,107,0.4)]">
                      🏈
                    </div>

                    {/* Floating Stats Cards */}
                    <div className="absolute top-20 -left-10 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-2xl transform -rotate-6 hover:rotate-0 transition-transform">
                      <div className="text-[#26D36B] text-3xl font-bold">+42%</div>
                      <div className="text-gray-600 text-xs font-medium">Win Rate</div>
                    </div>

                    <div className="absolute bottom-20 -right-10 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-2xl transform rotate-6 hover:rotate-0 transition-transform">
                      <div className="text-[#1A8CFF] text-3xl font-bold">127</div>
                      <div className="text-gray-600 text-xs font-medium">Avg Points</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Next Matchup Section */}
      <div className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
              {/* Left Side */}
              <div>
                <div className="text-[#1A8CFF] text-xs sm:text-sm tracking-[0.16em] uppercase mb-2 sm:mb-3 font-bold">
                  Next Matchup
                </div>
                <h2 className="text-[#0B1E3D] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 sm:mb-4 leading-tight">
                  YOUR BIGGEST CLASH OF THE WEEK
                </h2>
                <p className="text-[#4B5673] text-sm sm:text-base leading-relaxed">
                  See live odds, projected points, and who&apos;s favored. One glance, and you know whether you&apos;re the underdog or the juggernaut.
                </p>
              </div>

              {/* Right Side - Matchup Card */}
              <div>
                <div className="bg-gradient-to-br from-[#0B1E3D] to-[#051639] rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-xl">
                  <div className="text-xs text-white/60 uppercase tracking-wider mb-6 flex items-center justify-between">
                    <span>Week 7</span>
                    <span className="bg-[#26D36B] text-[#001021] px-3 py-1 rounded-full font-bold text-xs">LIVE</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 items-center mb-6">
                    {/* Team 1 */}
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl">
                        👤
                      </div>
                      <div className="text-xs text-white/70 mb-2">Your Squad</div>
                      <div className="text-3xl font-bold">112.4</div>
                      <div className="text-xs text-[#26D36B]">↑ Favored</div>
                    </div>

                    {/* VS */}
                    <div className="text-center">
                      <div className="text-white/30 font-extrabold text-lg">VS</div>
                    </div>

                    {/* Team 2 */}
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl">
                        👤
                      </div>
                      <div className="text-xs text-white/70 mb-2">Rival Team</div>
                      <div className="text-3xl font-bold">107.9</div>
                      <div className="text-xs text-white/50">Underdog</div>
                    </div>
                  </div>

                  {/* Win Probability Bar */}
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="flex justify-between text-xs mb-3">
                      <span>Win Probability</span>
                      <span className="text-[#26D36B] font-bold">58%</span>
                    </div>
                    <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#26D36B] to-[#1A8CFF] rounded-full" style={{ width: '58%' }} />
                    </div>
                  </div>

                  <div className="text-xs text-white/60 text-center mt-6 pt-4 border-t border-white/10">
                    ⏰ Lineups lock Sunday 1:00 PM ET
                  </div>
                </div>

                <div className="text-right mt-6">
                  <Link
                    href="/matchup"
                    className="inline-flex items-center px-6 py-3 bg-[#0B1E3D] text-white rounded-full text-sm font-semibold hover:bg-[#051639] transition-colors shadow-lg"
                  >
                    See All Matchups
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards Row */}
      <div className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-12 text-center">
            Why Fourth & Goal?
          </h3>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl hover:-translate-y-2 hover:shadow-[0_25px_50px_rgba(26,140,255,0.3)] transition-all duration-300">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-xl">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="text-[#0B1E3D] font-bold text-lg sm:text-xl mb-2 sm:mb-3">Smart Projections</h4>
              <p className="text-[#4B5673] text-sm sm:text-base leading-relaxed">
                Clear, weekly matchup projections with confidence ranges you can actually understand.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl hover:-translate-y-2 hover:shadow-[0_25px_50px_rgba(38,211,107,0.3)] transition-all duration-300">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#26D36B] to-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-xl">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="text-[#0B1E3D] font-bold text-lg sm:text-xl mb-2 sm:mb-3">League Storylines</h4>
              <p className="text-[#4B5673] text-sm sm:text-base leading-relaxed">
                Power rankings, rivalry history, and records that fuel the trash talk.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl hover:-translate-y-2 hover:shadow-[0_25px_50px_rgba(147,51,234,0.3)] transition-all duration-300">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-xl">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h4 className="text-[#0B1E3D] font-bold text-lg sm:text-xl mb-2 sm:mb-3">Trade Analyzer</h4>
              <p className="text-[#4B5673] text-sm sm:text-base leading-relaxed">
                Instant feedback on whether a deal makes your team better or worse.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-[#26D36B] to-[#1A8CFF] rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 text-center shadow-2xl relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
              <h3 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 sm:mb-6">
                Ready to Dominate Your League?
              </h3>
              <p className="text-white/90 text-base sm:text-lg mb-8 sm:mb-10 max-w-2xl mx-auto">
                Join thousands of managers using AI to make smarter fantasy football decisions every week.
              </p>
              <Link
                href="/connect"
                className="inline-flex items-center justify-center px-8 sm:px-10 py-4 sm:py-5 bg-white text-[#0B1E3D] rounded-full font-bold text-base sm:text-lg shadow-2xl hover:shadow-white/50 hover:scale-105 transition-all duration-200"
              >
                Get Started Free
                <svg className="w-5 h-5 sm:w-6 sm:h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
