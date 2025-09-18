// =============================================================================
// LANDING PAGE
// =============================================================================

// src/app/page.tsx
/**
 * Landing page for StemBot
 * Public homepage with marketing content, features, and sign-up CTA
 */

import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'StemBot - Privacy-First AI STEM Tutoring',
  description: 'Master mathematics, science, and programming with AI tutoring that keeps your data private. Built for Dutch STEM education.',
};

export default function HomePage() {
  return (
    <main id="main-content" className="min-h-screen bg-white">
      {/* Navigation Header */}
      <header className="border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">StemBot</h1>
              <span className="ml-2 text-sm text-gray-500">🇳🇱</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
              <a href="#privacy" className="text-gray-600 hover:text-gray-900">Privacy</a>
              <a href="/about" className="text-gray-600 hover:text-gray-900">About</a>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/auth/login"
                className="text-gray-600 hover:text-gray-900"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              AI STEM Tutoring That
              <span className="block text-blue-600">Respects Your Privacy</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Master mathematics, science, and programming with personalized AI tutoring. 
              All processing happens locally—your learning conversations never leave your device.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link 
                href="/auth/register"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
              >
                Start Learning Free
              </Link>
              <Link 
                href="#demo"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors font-semibold text-lg"
              >
                Watch Demo
              </Link>
            </div>
            
            {/* Privacy Badge */}
            <div className="inline-flex items-center px-6 py-3 bg-violet-50 rounded-full border border-violet-200">
              <span className="text-violet-600 mr-2">🔒</span>
              <span className="text-violet-800 font-semibold">100% Private • Local AI Processing • GDPR Compliant</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose StemBot?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Unlike other AI tutoring platforms, we put your privacy first while delivering 
              personalized STEM education tailored for Dutch students.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Privacy First */}
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Privacy First</h3>
              <p className="text-gray-600 mb-4">
                All AI processing happens locally on your device. No conversations sent to external servers.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Local Ollama AI processing</li>
                <li>• GDPR compliant</li>
                <li>• No data mining</li>
              </ul>
            </div>
            
            {/* Adaptive Learning */}
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Adaptive Learning</h3>
              <p className="text-gray-600 mb-4">
                Step-by-step guidance that adapts to your learning style and pace.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Socratic questioning method</li>
                <li>• Personalized difficulty</li>
                <li>• Context-aware hints</li>
              </ul>
            </div>
            
            {/* Dutch Education */}
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="text-3xl mb-4">🇳🇱</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Dutch Education</h3>
              <p className="text-gray-600 mb-4">
                Aligned with Dutch national curriculum standards and teaching methods.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Dutch/English support</li>
                <li>• VWO/HAVO alignment</li>
                <li>• Cultural context</li>
              </ul>
            </div>
            
            {/* Collaborative */}
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="text-3xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Collaborative</h3>
              <p className="text-gray-600 mb-4">
                Share projects and learn together while maintaining individual privacy.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Project sharing</li>
                <li>• Group study sessions</li>
                <li>• Teacher dashboards</li>
              </ul>
            </div>
            
            {/* Gamified */}
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="text-3xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Gamified</h3>
              <p className="text-gray-600 mb-4">
                Earn badges, track progress, and stay motivated with achievement systems.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Progress tracking</li>
                <li>• Achievement badges</li>
                <li>• Learning streaks</li>
              </ul>
            </div>
            
            {/* Offline Ready */}
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="text-3xl mb-4">📱</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Offline Ready</h3>
              <p className="text-gray-600 mb-4">
                Core tutoring works offline. Study anywhere, anytime without internet.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Local AI models</li>
                <li>• Sync when online</li>
                <li>• Mobile responsive</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Master Every STEM Subject
            </h2>
            <p className="text-xl text-gray-600">
              From basic algebra to advanced programming, get personalized tutoring across all STEM fields.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-blue-50 rounded-xl">
              <div className="text-6xl mb-4">📐</div>
              <h3 className="text-2xl font-bold text-blue-900 mb-3">Mathematics</h3>
              <p className="text-blue-700 mb-4">
                Algebra, geometry, calculus, statistics, and more with step-by-step solutions.
              </p>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>Quadratic equations</li>
                <li>Trigonometry</li>
                <li>Differential calculus</li>
                <li>Linear algebra</li>
              </ul>
            </div>
            
            <div className="text-center p-8 bg-green-50 rounded-xl">
              <div className="text-6xl mb-4">⚗️</div>
              <h3 className="text-2xl font-bold text-green-900 mb-3">Science</h3>
              <p className="text-green-700 mb-4">
                Physics, chemistry, and biology with interactive explanations and lab support.
              </p>
              <ul className="text-sm text-green-600 space-y-1">
                <li>Chemical reactions</li>
                <li>Physics problems</li>
                <li>Biology concepts</li>
                <li>Lab procedures</li>
              </ul>
            </div>
            
            <div className="text-center p-8 bg-purple-50 rounded-xl">
              <div className="text-6xl mb-4">💻</div>
              <h3 className="text-2xl font-bold text-purple-900 mb-3">Programming</h3>
              <p className="text-purple-700 mb-4">
                Python, JavaScript, Java, and more with code debugging and project guidance.
              </p>
              <ul className="text-sm text-purple-600 space-y-1">
                <li>Algorithm design</li>
                <li>Code debugging</li>
                <li>Data structures</li>
                <li>Web development</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Start Free, Upgrade When Ready
            </h2>
            <p className="text-xl text-gray-600">
              Try StemBot with our generous free tier, then upgrade for advanced features.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Free</h3>
              <div className="text-3xl font-bold text-gray-900 mb-4">€0</div>
              <p className="text-gray-600 mb-6">Perfect for getting started</p>
              <ul className="text-left space-y-2 mb-8">
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> 100 AI queries/month</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Local AI processing</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Basic progress tracking</li>
              </ul>
              <Link href="/auth/register" className="block w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700">
                Get Started
              </Link>
            </div>
            
            <div className="bg-blue-600 text-white p-8 rounded-xl shadow-lg text-center relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-blue-900 px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Hobby</h3>
              <div className="text-3xl font-bold mb-4">€15<span className="text-lg">/mo</span></div>
              <p className="text-blue-100 mb-6">For serious learners</p>
              <ul className="text-left space-y-2 mb-8">
                <li className="flex items-center"><span className="text-blue-200 mr-2">✓</span> 1,000 AI queries/month</li>
                <li className="flex items-center"><span className="text-blue-200 mr-2">✓</span> Advanced AI models</li>
                <li className="flex items-center"><span className="text-blue-200 mr-2">✓</span> Unlimited projects</li>
                <li className="flex items-center"><span className="text-blue-200 mr-2">✓</span> Collaboration features</li>
              </ul>
              <Link href="/billing/checkout" className="block w-full bg-white text-blue-600 py-2 rounded-lg hover:bg-gray-100">
                Start Free Trial
              </Link>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Pro</h3>
              <div className="text-3xl font-bold text-gray-900 mb-4">€75<span className="text-lg">/mo</span></div>
              <p className="text-gray-600 mb-6">For educators & schools</p>
              <ul className="text-left space-y-2 mb-8">
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> 10,000 AI queries/month</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Class management</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Advanced analytics</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Priority support</li>
              </ul>
              <Link href="/billing/pricing" className="block w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">
                Contact Sales
              </Link>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <Link href="/billing/pricing" className="text-blue-600 hover:underline">
              View detailed pricing and features →
            </Link>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section id="privacy" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-violet-50 rounded-2xl p-12 border border-violet-200">
            <div className="text-center">
              <div className="text-6xl mb-6">🔒</div>
              <h2 className="text-3xl font-bold text-violet-900 mb-4">
                Your Privacy is Our Priority
              </h2>
              <p className="text-xl text-violet-700 mb-8 max-w-3xl mx-auto">
                Unlike other AI platforms, we never send your learning data to external servers. 
                Everything happens locally on your device.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="text-left">
                  <h3 className="font-semibold text-violet-900 mb-3">What Stays Private:</h3>
                  <ul className="space-y-2 text-violet-800">
                    <li>• All your conversations with AI</li>
                    <li>• Your learning progress and mistakes</li>
                    <li>• Uploaded study materials</li>
                    <li>• Personal learning patterns</li>
                  </ul>
                </div>
                
                <div className="text-left">
                  <h3 className="font-semibold text-violet-900 mb-3">How We Protect You:</h3>
                  <ul className="space-y-2 text-violet-800">
                    <li>• Local AI processing with Ollama</li>
                    <li>• GDPR compliant data handling</li>
                    <li>• No tracking or analytics cookies</li>
                    <li>• Open source transparency</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8">
                <Link 
                  href="/privacy" 
                  className="bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 inline-block"
                >
                  Read Our Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your STEM Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of Dutch students already using StemBot for personalized, private AI tutoring.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg"
            >
              Start Learning Free
            </Link>
            <Link 
              href="/billing/pricing"
              className="bg-blue-700 text-white px-8 py-4 rounded-lg hover:bg-blue-800 transition-colors font-semibold text-lg"
            >
              View Pricing
            </Link>
          </div>
          
          <p className="text-blue-200 mt-4 text-sm">
            No credit card required • 100% private • Start in 30 seconds
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">StemBot</h3>
              <p className="text-gray-400 mb-4">
                Privacy-first AI tutoring for Dutch STEM education.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-white">GitHub</a>
                <a href="#" className="text-gray-400 hover:text-white">LinkedIn</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="/features" className="text-gray-400 hover:text-white">Features</a></li>
                <li><a href="/billing/pricing" className="text-gray-400 hover:text-white">Pricing</a></li>
                <li><a href="/demo" className="text-gray-400 hover:text-white">Demo</a></li>
                <li><a href="/changelog" className="text-gray-400 hover:text-white">Updates</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="/about" className="text-gray-400 hover:text-white">About</a></li>
                <li><a href="/careers" className="text-gray-400 hover:text-white">Careers</a></li>
                <li><a href="/contact" className="text-gray-400 hover:text-white">Contact</a></li>
                <li><a href="/blog" className="text-gray-400 hover:text-white">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                <li><a href="/terms" className="text-gray-400 hover:text-white">Terms of Service</a></li>
                <li><a href="/security" className="text-gray-400 hover:text-white">Security</a></li>
                <li><a href="/gdpr" className="text-gray-400 hover:text-white">GDPR</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 StemBot. Made with ❤️ in the Netherlands for STEM education.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}