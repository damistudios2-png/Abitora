import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  CheckCircle2, 
  TrendingUp, 
  Calendar, 
  Award, 
  Shield, 
  Zap,
  Menu,
  X,
  Moon,
  Sun,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  toggleTheme: () => void;
  theme: 'light' | 'dark';
}

export default function LandingPage({ toggleTheme, theme }: LandingPageProps) {
  const { signInWithGoogle } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const features = [
    {
      icon: <CheckCircle2 className="w-5 h-5" />,
      title: "Daily Habit Tracking",
      description: "Simple, intuitive interface to log your daily progress and stay accountable."
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Streak Tracking",
      description: "Visualize your consistency with streak counters that motivate you to keep going."
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: "Consistency Calendar",
      description: "A bird's eye view of your long-term performance and habit history."
    },
    {
      icon: <Award className="w-5 h-5" />,
      title: "Motivational Achievements",
      description: "Earn tasteful badges and celebrate milestones as you build better routines."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Jenkins",
      role: "Product Designer",
      content: "Abitora transformed my morning routine. The minimalist design helps me focus on what matters most—consistency.",
      avatar: "/src/assets/images/user_avatar_1_1794047912962.jpg"
    },
    {
      name: "Marcus Chen",
      role: "Software Engineer",
      content: "The analytics are exactly what I needed. Seeing my progress visually makes building habits feel like a game I'm winning.",
      avatar: "/src/assets/images/user_avatar_2_1794047913389.jpg"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <img 
              src="/src/assets/images/abitora_abstract_logo_1794047912747.jpg" 
              alt="Abitora Logo" 
              className="w-8 h-8 rounded-lg shadow-sm"
            />
            <span className="text-xl font-bold tracking-tight whitespace-nowrap">Abitora</span>
          </div>

          {/* Zone 2: Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
            <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">Features</a>
            <a href="#how-it-works" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">How it Works</a>
            <a href="#pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">Pricing</a>
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </nav>

          {/* Zone 3: Action */}
          <div className="flex items-center gap-4 shrink-0">
            <button 
              onClick={() => window.location.href = '/auth'}
              className="hidden sm:block text-sm font-medium hover:text-slate-600 dark:hover:text-slate-300 transition-colors whitespace-nowrap shrink-0"
            >
              Sign In
            </button>
            <button 
              onClick={() => window.location.href = '/auth'}
              className="px-5 py-2.5 text-sm font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-lg shadow-slate-200 dark:shadow-none whitespace-nowrap shrink-0"
            >
              Get Started
            </button>
            <button 
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-white dark:bg-slate-950 pt-20 px-6">
          <nav className="flex flex-col gap-6 text-lg font-medium">
            <a href="#features" onClick={() => setIsMenuOpen(false)}>Features</a>
            <a href="#how-it-works" onClick={() => setIsMenuOpen(false)}>How it Works</a>
            <a href="#pricing" onClick={() => setIsMenuOpen(false)}>Pricing</a>
            <button 
              onClick={() => { toggleTheme(); setIsMenuOpen(false); }}
              className="flex items-center gap-2"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </button>
            <button 
              onClick={() => window.location.href = '/auth'}
              className="w-full py-4 text-center border-t border-slate-100 dark:border-slate-800"
            >
              Sign In
            </button>
          </nav>
        </div>
      )}

      {/* Hero Section */}
      <section className="pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-6">
              <Zap className="w-3 h-3 fill-current" />
              Build Better Habits
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-wrap-balance">
              Build better habits. <br />
              <span className="text-slate-400">Become your best self.</span>
            </h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10">
              Small daily actions create meaningful change. Track your habits, celebrate your progress, and build a routine that lasts.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => window.location.href = '/auth'}
                className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-xl hover:scale-105 transition-transform shadow-xl shadow-slate-200 dark:shadow-none"
              >
                Get Started for Free
              </button>
              <button 
                onClick={() => window.location.href = '/auth'}
                className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-all"
              >
                Sign In
              </button>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 relative max-w-5xl mx-auto"
          >
            <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 blur-3xl opacity-50 -z-10"></div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden bg-white dark:bg-slate-900">
              <img 
                src="/src/assets/images/abitora_dashboard_preview_1794047912895.jpg" 
                alt="Abitora Dashboard" 
                className="w-full h-auto"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-white dark:bg-slate-950 border-y border-slate-100 dark:border-slate-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to thrive</h2>
            <p className="text-slate-500 dark:text-slate-400">Designed to be simple yet powerful enough for your ambitious goals.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div key={i} className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center mb-6 text-emerald-600 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-32">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="lg:w-1/2">
              <h2 className="text-4xl font-bold mb-8">How Abitora works</h2>
              <div className="space-y-12">
                {[
                  { step: "01", title: "Create your habits", desc: "Define what you want to achieve, set your schedule, and pick a category." },
                  { step: "02", title: "Track your daily progress", desc: "Check off your habits as you complete them throughout the day." },
                  { step: "03", title: "Celebrate your consistency", desc: "Watch your streaks grow and earn achievements for your discipline." }
                ].map((s, i) => (
                  <div key={i} className="flex gap-6">
                    <span className="text-4xl font-black text-slate-200 dark:text-slate-800">{s.step}</span>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                      <p className="text-slate-500 dark:text-slate-400">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 relative">
               <div className="absolute -inset-4 bg-emerald-500/10 blur-2xl rounded-full"></div>
               <div className="relative rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl">
                 <div className="space-y-4">
                   <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse"></div>
                   <div className="grid grid-cols-7 gap-2">
                     {Array.from({length: 28}).map((_, i) => (
                       <div key={i} className={`aspect-square rounded-md ${i % 3 === 0 ? 'bg-emerald-500' : 'bg-slate-100 dark:bg-slate-800'}`}></div>
                     ))}
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-slate-900 text-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-20">Loved by high achievers</h2>
          <div className="grid md:grid-cols-2 gap-12">
            {testimonials.map((t, i) => (
              <div key={i} className="p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <p className="text-xl mb-8 text-slate-300 italic">"{t.content}"</p>
                <div className="flex items-center gap-4">
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full border-2 border-emerald-500" />
                  <div>
                    <h4 className="font-bold">{t.name}</h4>
                    <p className="text-sm text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4">Simple, honest pricing</h2>
            <p className="text-slate-500 dark:text-slate-400">Start for free, upgrade when you're ready to go further.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="p-10 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-bold mb-2">Free</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-slate-500 text-sm">/ forever</span>
              </div>
              <ul className="space-y-4 mb-10 text-slate-600 dark:text-slate-400 text-sm">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Up to 5 habits</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Daily tracking</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Basic streaks and analytics</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Calendar history</li>
              </ul>
              <button 
                onClick={() => signInWithGoogle()}
                className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Get Started
              </button>
            </div>

            {/* Pro Plan */}
            <div className="p-10 rounded-3xl border-2 border-slate-900 dark:border-white bg-white dark:bg-slate-900 hover:shadow-xl transition-shadow relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-full">
                RECOMMENDED
              </div>
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold">$5</span>
                <span className="text-slate-500 text-sm">/ month</span>
              </div>
              <ul className="space-y-4 mb-10 text-slate-600 dark:text-slate-400 text-sm">
                <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-emerald-500" /> Unlimited habits</li>
                <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-emerald-500" /> Advanced analytics</li>
                <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-emerald-500" /> Data export</li>
                <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-emerald-500" /> Custom categories</li>
                <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-emerald-500" /> Priority support</li>
              </ul>
              <button 
                onClick={() => signInWithGoogle()}
                className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold hover:opacity-90 transition-opacity"
              >
                Go Pro
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between gap-12 mb-20">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-6">
                <img src="/src/assets/images/abitora_abstract_logo_1794047912747.jpg" alt="Logo" className="w-6 h-6 rounded" />
                <span className="text-lg font-bold">Abitora</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Build better habits. Become your best self. Small daily actions create meaningful change.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
              <div>
                <h4 className="font-bold text-sm mb-6 uppercase tracking-wider">Product</h4>
                <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
                  <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Features</a></li>
                  <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Pricing</a></li>
                  <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">API</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-sm mb-6 uppercase tracking-wider">Company</h4>
                <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
                  <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">About</a></li>
                  <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Blog</a></li>
                  <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Careers</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-sm mb-6 uppercase tracking-wider">Legal</h4>
                <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
                  <li><button onClick={() => window.location.href = '/privacy'} className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</button></li>
                  <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Cookie Policy</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
            <p>© 2026 Abitora. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">GitHub</a>
              <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
