import { auth } from "@/lib/auth";
import { loginWithGoogle, loginAsDemo } from "@/app/actions/auth";
import Link from "next/link";
import { Leaf, Shield, CheckCircle, Award, ArrowRight, Zap, BarChart2, Star, Sparkles, Footprints, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

export default async function LandingPage() {
  const session = await auth();

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 lg:pt-32 lg:pb-24 border-b border-slate-100 dark:border-slate-900">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] aspect-square rounded-full bg-emerald-500/10 blur-[120px]" />
          <div className="absolute top-[-20%] right-[-10%] w-[50%] aspect-square rounded-full bg-emerald-400/5 blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-emerald-250 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Carbon Intelligence
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.15] text-slate-950 dark:text-white">
            Track Your Carbon Footprint. <br />
            <span className="bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">
              Reduce Your Impact.
            </span>
          </h1>

          <p className="text-base md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Understand how your transportation, food choices, and electricity usage affect the environment and receive personalized AI-powered sustainability guidance.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            {session ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition duration-150 cursor-pointer text-sm"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <form action={loginWithGoogle}>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-8 py-3.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90 transition duration-150 cursor-pointer text-sm shadow-md"
                  >
                    Get Started (Google)
                  </button>
                </form>

                <form action={loginAsDemo}>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-8 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition duration-150 cursor-pointer text-sm shadow-sm"
                  >
                    View Demo Mode
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Powerful SaaS Features</h2>
          <p className="text-slate-500 max-w-xl mx-auto text-sm">
            CarbonWise equips you with the metrics, insights, and goal tracking needed to transition to a low-carbon lifestyle.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:border-emerald-100 dark:hover:border-emerald-950">
            <CardContent className="pt-6 space-y-3">
              <div className="p-2.5 w-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <Footprints className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">Activity Tracking</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Log transportation, meals, and home electricity using validated India-specific grid averages.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-emerald-100 dark:hover:border-emerald-950">
            <CardContent className="pt-6 space-y-3">
              <div className="p-2.5 w-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">Interactive Recharts</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Analyze emissions share with category breakdown pie charts and trace historical weekly trends.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-emerald-100 dark:hover:border-emerald-950">
            <CardContent className="pt-6 space-y-3">
              <div className="p-2.5 w-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">AI Coach Card</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Request custom reduction advice from Google Gemini, highlighting quick wins and long-term habits.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-emerald-100 dark:hover:border-emerald-950">
            <CardContent className="pt-6 space-y-3">
              <div className="p-2.5 w-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">Achievements & Badges</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Earn Eco Starter, Low Carbon Week, and Eco Champion badges as you hit sustainability metrics.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-100/50 dark:bg-slate-900/30 border-y border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-slate-950 dark:text-white">How It Works</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm">
              Making a global impact starts with understanding your daily local habits.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-3 relative">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-sm">
                1
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white">Log Activities</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Log car, bus, or train distances, meal preferences, and monthly electricity billing.
              </p>
            </div>

            <div className="space-y-3 relative">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-sm">
                2
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white">Emission Calculations</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Our formulas evaluate your activities against carbon factors optimized for the Indian grid.
              </p>
            </div>

            <div className="space-y-3 relative">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-sm">
                3
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white">Review Trends</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Audit weekly performance audits, check achievements, and compare week-over-week trends.
              </p>
            </div>

            <div className="space-y-3 relative">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-sm">
                4
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white">AI-Coach Optimizations</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Action tailored guidance and hit your monthly carbon target to unlock rare eco badges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 space-y-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-slate-950 dark:text-white">Why Track with CarbonWise?</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Small adjustments in daily commutes and household utilities aggregate to produce large environmental reductions.
              </p>
            </div>

            <ul className="space-y-3.5">
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>Save money on household electricity bills.</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>Build sustainable daily travel and dietary habits.</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>Contribute actively to local emissions reduction.</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>Share certified achievements with peers.</span>
              </li>
            </ul>
          </div>

          <div className="p-8 bg-emerald-600 text-white rounded-3xl relative overflow-hidden shadow-xl shadow-emerald-600/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-8 -mt-8" />
            <div className="space-y-4 relative z-10">
              <Leaf className="w-10 h-10 text-emerald-250 animate-bounce" />
              <h3 className="text-xl font-bold">Start Your Eco Journey</h3>
              <p className="text-xs text-emerald-100 leading-relaxed">
                "We don't need a handful of people doing zero waste perfectly. We need millions of people doing it imperfectly."
              </p>
              <div className="pt-2 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span className="text-xs font-semibold">Join thousands of eco active users today.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-20 bg-slate-900 text-white text-center relative overflow-hidden border-t border-slate-800">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[30%] aspect-square rounded-full bg-emerald-500/20 blur-[80px]" />
          <div className="absolute bottom-[20%] right-[10%] w-[30%] aspect-square rounded-full bg-emerald-400/10 blur-[80px]" />
        </div>

        <div className="max-w-4xl mx-auto px-4 space-y-6 relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold">Ready to Understand Your Carbon Footprint?</h2>
          <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto">
            Create an account in 30 seconds. Start tracking transportation distances, diet, and power usage.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            {session ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-8 py-3.5 rounded-xl bg-emerald-650 hover:bg-emerald-600 text-white font-bold transition shadow-lg"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <form action={loginWithGoogle}>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-8 py-3.5 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100 transition duration-150 cursor-pointer text-sm"
                  >
                    Sign In with Google
                  </button>
                </form>

                <form action={loginAsDemo}>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-8 py-3.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-300 font-bold hover:bg-slate-900 transition duration-150 cursor-pointer text-sm"
                  >
                    Access Demo Sandbox
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-950 text-slate-500 text-center text-xs border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-bold text-slate-400">CarbonWise &copy; {new Date().getFullYear()}</p>
          <p>Calculations based on verified carbon factors for India. Empowered by Google Gemini API.</p>
        </div>
      </footer>
    </div>
  );
}
