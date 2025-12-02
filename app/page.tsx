import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -z-10" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl -z-10" />

        <div className="container mx-auto px-6 pt-20 pb-32">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-8">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-semibold text-blue-900">AI-Powered Fantasy Assistant</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-7xl md:text-8xl font-bold text-gray-900 tracking-tight mb-8 leading-none">
              Fourth & Goal
            </h1>

            {/* Gradient Subheading */}
            <p className="text-3xl md:text-4xl font-semibold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Your competitive edge in fantasy football
            </p>

            {/* Description */}
            <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              Upload your ESPN league screenshots and get instant AI-powered insights for lineups, waiver pickups, and winning strategies.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link
                href="/upload"
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Get Started
                  <svg
                    className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
              </Link>

              <Link
                href="/analysis"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-2xl shadow-lg hover:shadow-xl hover:border-gray-400 transition-all duration-300"
              >
                View Demo
              </Link>
            </div>

            {/* Hero Visual - Football Field Graphic */}
            <div className="relative max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-3xl shadow-2xl p-8 relative overflow-hidden">
                {/* Field lines */}
                <div className="absolute inset-0 opacity-30">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="absolute left-0 right-0 border-t-2 border-white" style={{ top: `${(i + 1) * 20}%` }} />
                  ))}
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="absolute top-0 bottom-0 border-l border-white/50" style={{ left: `${(i + 1) * 10}%` }} />
                  ))}
                </div>

                {/* Stats Cards Overlay */}
                <div className="relative grid grid-cols-3 gap-4">
                  <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-xl transform hover:-translate-y-2 transition-transform duration-300">
                    <div className="text-4xl font-bold text-blue-600 mb-2">📊</div>
                    <div className="text-sm font-semibold text-gray-600 mb-1">Smart Analysis</div>
                    <div className="text-xs text-gray-500">AI-powered insights</div>
                  </div>

                  <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-xl transform hover:-translate-y-2 transition-transform duration-300">
                    <div className="text-4xl font-bold text-green-600 mb-2">🎯</div>
                    <div className="text-sm font-semibold text-gray-600 mb-1">Lineup Optimizer</div>
                    <div className="text-xs text-gray-500">Start/sit decisions</div>
                  </div>

                  <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-xl transform hover:-translate-y-2 transition-transform duration-300">
                    <div className="text-4xl font-bold text-purple-600 mb-2">⚡</div>
                    <div className="text-sm font-semibold text-gray-600 mb-1">Waiver Wire</div>
                    <div className="text-xs text-gray-500">Priority targets</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Powerful tools. Simple workflow.
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to dominate your fantasy league, designed with simplicity in mind.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
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
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Smart Screenshot Analysis
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Simply upload screenshots from ESPN. Our AI instantly parses your league settings, roster, and available players.
              </p>
              <div className="flex items-center text-blue-600 font-semibold">
                <span>Learn more</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
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
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Lineup Recommendations
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Get personalized start/sit recommendations based on matchups, trends, and your league&apos;s scoring format.
              </p>
              <div className="flex items-center text-green-600 font-semibold">
                <span>Learn more</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
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
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Waiver Wire Targets
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Discover high-value waiver pickups before your league mates. Priority rankings tailored to your needs.
              </p>
              <div className="flex items-center text-purple-600 font-semibold">
                <span>Learn more</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Three steps to victory
            </h2>
            <p className="text-xl text-gray-600">
              Get started in minutes
            </p>
          </div>

          <div className="max-w-5xl mx-auto space-y-8">
            {/* Step 1 */}
            <div className="flex items-center gap-8 bg-white rounded-3xl p-8 shadow-xl">
              <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Upload Screenshots</h3>
                <p className="text-lg text-gray-600">Take screenshots of your ESPN league and upload them. We handle the rest.</p>
              </div>
              <div className="hidden md:block text-6xl">📱</div>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-8 bg-white rounded-3xl p-8 shadow-xl">
              <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Analysis</h3>
                <p className="text-lg text-gray-600">Our AI extracts and analyzes your data to understand your roster and needs.</p>
              </div>
              <div className="hidden md:block text-6xl">🤖</div>
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-8 bg-white rounded-3xl p-8 shadow-xl">
              <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Win Your League</h3>
                <p className="text-lg text-gray-600">Get personalized recommendations and dominate your competition.</p>
              </div>
              <div className="hidden md:block text-6xl">🏆</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
              <h2 className="text-5xl font-bold text-white mb-6">
                Ready to dominate your league?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join the winning side with AI-powered fantasy football insights.
              </p>
              <Link
                href="/upload"
                className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-blue-600 bg-white rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                Get Started Now
                <svg
                  className="ml-2 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
