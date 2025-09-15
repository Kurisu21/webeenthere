'use client';

import Background from '@/app/_components/Background';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header/Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50">
        <div className="flex justify-center items-center px-6 py-4 relative">
          {/* Centered Nav */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-full px-6 py-3 flex space-x-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#how-to-use" className="text-gray-300 hover:text-white transition-colors">How to Use</a>
            <a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
        </div>
          {/* Social Icons - right, absolute */}
          <div className="absolute right-6 flex space-x-4">
          <a href="#" className="text-white hover:text-gray-300 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
          <a href="#" className="text-white hover:text-gray-300 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
            </svg>
          </a>
          <a href="#" className="text-white hover:text-gray-300 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          </div>
        </div>
      </header>

      {/* Hero Section - Full Screen */}
      <Background>
        <section className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden bg-gray-900">
          {/* Moving Templates Background */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Template 1 - Moving from left to right */}
            <div className="absolute top-20 left-[-200px] w-64 h-80 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg border border-blue-500/30 backdrop-blur-sm animate-slideRight">
              <div className="p-4">
                <div className="w-full h-4 bg-gray-300/30 rounded mb-3"></div>
                <div className="w-3/4 h-3 bg-gray-300/30 rounded mb-2"></div>
                <div className="w-1/2 h-3 bg-gray-300/30 rounded mb-4"></div>
                <div className="w-full h-20 bg-gray-300/30 rounded mb-3"></div>
                <div className="w-2/3 h-3 bg-gray-300/30 rounded"></div>
              </div>
            </div>

            {/* Template 2 - Moving from right to left */}
            <div className="absolute top-40 right-[-200px] w-64 h-80 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg border border-purple-500/30 backdrop-blur-sm animate-slideLeft">
              <div className="p-4">
                <div className="w-full h-4 bg-gray-300/30 rounded mb-3"></div>
                <div className="w-1/2 h-3 bg-gray-300/30 rounded mb-2"></div>
                <div className="w-3/4 h-3 bg-gray-300/30 rounded mb-4"></div>
                <div className="w-full h-16 bg-gray-300/30 rounded mb-3"></div>
                <div className="w-1/2 h-3 bg-gray-300/30 rounded"></div>
              </div>
            </div>

            {/* Template 3 - Floating up and down */}
            <div className="absolute bottom-20 left-1/4 w-56 h-72 bg-gradient-to-br from-green-600/20 to-blue-600/20 rounded-lg border border-green-500/30 backdrop-blur-sm animate-float">
              <div className="p-4">
                <div className="w-full h-3 bg-gray-300/30 rounded mb-3"></div>
                <div className="w-2/3 h-3 bg-gray-300/30 rounded mb-2"></div>
                <div className="w-full h-3 bg-gray-300/30 rounded mb-4"></div>
                <div className="w-full h-12 bg-gray-300/30 rounded mb-3"></div>
                <div className="w-1/2 h-3 bg-gray-300/30 rounded"></div>
              </div>
            </div>

            {/* Template 4 - Rotating slowly */}
            <div className="absolute top-1/2 right-1/4 w-48 h-64 bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-lg border border-yellow-500/30 backdrop-blur-sm animate-rotateSlow">
              <div className="p-4">
                <div className="w-full h-4 bg-gray-300/30 rounded mb-3"></div>
                <div className="w-1/2 h-3 bg-gray-300/30 rounded mb-2"></div>
                <div className="w-3/4 h-3 bg-gray-300/30 rounded mb-4"></div>
                <div className="w-full h-14 bg-gray-300/30 rounded mb-3"></div>
                <div className="w-2/3 h-3 bg-gray-300/30 rounded"></div>
              </div>
            </div>

            {/* Template 5 - Bouncing */}
            <div className="absolute bottom-1/3 left-1/3 w-52 h-76 bg-gradient-to-br from-red-600/20 to-pink-600/20 rounded-lg border border-red-500/30 backdrop-blur-sm animate-bounce">
              <div className="p-4">
                <div className="w-full h-3 bg-gray-300/30 rounded mb-3"></div>
                <div className="w-3/4 h-3 bg-gray-300/30 rounded mb-2"></div>
                <div className="w-1/2 h-3 bg-gray-300/30 rounded mb-4"></div>
                <div className="w-full h-16 bg-gray-300/30 rounded mb-3"></div>
                <div className="w-1/2 h-3 bg-gray-300/30 rounded"></div>
              </div>
            </div>
          </div>

          <div className="text-center max-w-4xl relative z-10">
            <h1 className="text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-purple-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">WEBeenThere</span>
          </h1>
            <p className="text-2xl text-gray-300 mb-4">
              Build beautiful websites in minutes, not hours
            </p>
            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
              The easiest website builder for freelancers, artists, and small businesses. 
              Create stunning one-page websites with our drag-and-drop interface.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link href="/register" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg flex items-center gap-3 transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-lg font-medium">
                Start Building Free
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
              <Link href="#how-to-use" className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-8 py-4 rounded-lg flex items-center gap-3 transition-all duration-300 border border-gray-600 text-lg">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Watch Demo
              </Link>
            </div>
            {/* Scroll indicator - closer to bottom */}
            <div className="absolute left-1/2 transform -translate-x-1/2" style={{ bottom: '32px' }}>
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </section>
      </Background>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose <span className="bg-gradient-to-r from-purple-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">WEBeenThere</span>?
            </h2>
            <p className="text-xl text-gray-300">Everything you need to create stunning websites</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-700 p-8 rounded-lg hover:bg-gray-600 transition-all duration-300 transform hover:scale-105">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Drag & Drop Builder</h3>
              <p className="text-gray-300">Intuitive drag-and-drop interface that makes website building effortless and fun.</p>
            </div>
            
            <div className="bg-gray-700 p-8 rounded-lg hover:bg-gray-600 transition-all duration-300 transform hover:scale-105">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Beautiful Templates</h3>
              <p className="text-gray-300">Choose from dozens of professionally designed templates to get started quickly.</p>
            </div>
            
            <div className="bg-gray-700 p-8 rounded-lg hover:bg-gray-600 transition-all duration-300 transform hover:scale-105">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Lightning Fast</h3>
              <p className="text-gray-300">Optimized for speed with instant preview and fast publishing to the web.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section id="how-to-use" className="py-20 px-6 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How to Use <span className="bg-gradient-to-r from-purple-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">WEBeenThere</span></h2>
            <p className="text-xl text-gray-300">Get your website up and running in 3 simple steps</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">1</div>
              <h3 className="text-xl font-semibold text-white mb-4">Sign Up & Choose Template</h3>
              <p className="text-gray-300">Create your account and select from our beautiful template library or start from scratch.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">2</div>
              <h3 className="text-xl font-semibold text-white mb-4">Customize Your Design</h3>
              <p className="text-gray-300">Use our drag-and-drop builder to customize colors, fonts, content, and layout to match your brand.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">3</div>
              <h3 className="text-xl font-semibold text-white mb-4">Publish & Share</h3>
              <p className="text-gray-300">Publish your website instantly and share it with the world. Get your custom URL in seconds.</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/register" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-lg font-medium">
              Start Building Now
            </Link>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 px-6 bg-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            About <span className="bg-gradient-to-r from-purple-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">WEBeenThere</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            We believe that everyone deserves to have a beautiful online presence. Whether you're a freelancer, 
            artist, small business owner, or digital creator, our platform empowers you to create stunning 
            websites without the need for coding knowledge or expensive designers.
          </p>
          <p className="text-lg text-gray-400 mb-8 leading-relaxed">
            Our mission is to democratize web design by providing an intuitive, powerful, and affordable 
            website builder that puts the power of professional web design in your hands.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">10K+</div>
              <div className="text-gray-300">Websites Created</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">50+</div>
              <div className="text-gray-300">Templates Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">99.9%</div>
              <div className="text-gray-300">Uptime Guarantee</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-300">Choose the plan that's right for you</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-700 p-8 rounded-lg border border-gray-600">
              <h3 className="text-2xl font-bold text-white mb-4">Free</h3>
              <div className="text-4xl font-bold text-white mb-6">$0<span className="text-lg text-gray-400">/month</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  1 Website
                </li>
                <li className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Basic Templates
                </li>
                <li className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Community Support
                </li>
              </ul>
              <Link href="/register" className="w-full bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg transition-colors block text-center">
                Get Started Free
              </Link>
            </div>
            
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-8 rounded-lg transform scale-105">
              <h3 className="text-2xl font-bold text-white mb-4">Pro</h3>
              <div className="text-4xl font-bold text-white mb-6">$9<span className="text-lg text-blue-200">/month</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-white">
                  <svg className="w-5 h-5 text-blue-200 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Unlimited Websites
                </li>
                <li className="flex items-center text-white">
                  <svg className="w-5 h-5 text-blue-200 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Premium Templates
                </li>
                <li className="flex items-center text-white">
                  <svg className="w-5 h-5 text-blue-200 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Priority Support
                </li>
                <li className="flex items-center text-white">
                  <svg className="w-5 h-5 text-blue-200 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Custom Domain
                </li>
              </ul>
              <Link href="/register" className="w-full bg-white hover:bg-gray-100 text-blue-600 py-3 rounded-lg transition-colors block text-center font-medium">
                Start Pro Trial
              </Link>
            </div>
            
            <div className="bg-gray-700 p-8 rounded-lg border border-gray-600">
              <h3 className="text-2xl font-bold text-white mb-4">Enterprise</h3>
              <div className="text-4xl font-bold text-white mb-6">$29<span className="text-lg text-gray-400">/month</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Everything in Pro
                </li>
                <li className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Team Collaboration
                </li>
                <li className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Advanced Analytics
                </li>
                <li className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Dedicated Support
                </li>
              </ul>
              <Link href="/register" className="w-full bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg transition-colors block text-center">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 py-12 px-6 border-t border-gray-700">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">WEBeenThere</h3>
              <p className="text-gray-300">Building the future of web design, one website at a time.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Templates</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 WEBeenThere. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slideRight {
          0% {
            transform: translateX(-200px) rotate(0deg);
          }
          100% {
            transform: translateX(calc(100vw + 200px)) rotate(360deg);
          }
        }
        
        @keyframes slideLeft {
          0% {
            transform: translateX(200px) rotate(0deg);
          }
          100% {
            transform: translateX(calc(-100vw - 200px)) rotate(-360deg);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes rotateSlow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        
        .animate-slideRight {
          animation: slideRight 20s linear infinite;
        }
        
        .animate-slideLeft {
          animation: slideLeft 25s linear infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-rotateSlow {
          animation: rotateSlow 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
