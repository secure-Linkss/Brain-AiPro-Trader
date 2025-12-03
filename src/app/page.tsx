"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart2, Shield, Zap, TrendingUp, Globe, Cpu } from "lucide-react"
import { motion } from "framer-motion"
import { Footer } from "@/components/footer"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">

            {/* Text Content */}
            <div className="flex-1 text-center lg:text-left z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
                  Master the Markets with <br />
                  <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    AI-Powered Intelligence
                  </span>
                </h1>
                <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto lg:mx-0">
                  Experience the world's most advanced trading platform.
                  Leverage 19 guru-level strategies, 5 specialized AI agents,
                  and real-time institutional analysis to trade with 90%+ accuracy.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link href="/register">
                    <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-lg px-8">
                      Start Trading Now <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/features">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 border-slate-700 hover:bg-slate-800">
                      View Features
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Animated Chart Visual */}
            <div className="flex-1 w-full max-w-lg lg:max-w-none relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="relative z-10"
              >
                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl">
                  {/* Chart Header */}
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-bold text-xl">BTC/USD</h3>
                      <p className="text-sm text-green-500 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" /> +2.45%
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400">1H</span>
                      <span className="px-2 py-1 bg-blue-600 rounded text-xs text-white">4H</span>
                      <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400">1D</span>
                    </div>
                  </div>

                  {/* Animated Candlesticks */}
                  <div className="h-64 flex items-end justify-between gap-1 px-2">
                    {[...Array(20)].map((_, i) => {
                      const height = Math.random() * 60 + 20
                      const isGreen = Math.random() > 0.4
                      return (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{
                            duration: 1,
                            delay: i * 0.05,
                            repeat: Infinity,
                            repeatType: "reverse",
                            repeatDelay: 2
                          }}
                          className={`w-full rounded-sm relative group ${isGreen ? 'bg-green-500' : 'bg-red-500'
                            }`}
                        >
                          {/* Wick */}
                          <div className={`absolute left-1/2 -translate-x-1/2 w-[1px] h-[120%] -top-[10%] ${isGreen ? 'bg-green-500/50' : 'bg-red-500/50'
                            }`} />
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* AI Signal Overlay */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-950/90 border border-blue-500/30 p-4 rounded-xl shadow-xl backdrop-blur-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">AI Signal Detected</div>
                        <div className="font-bold text-lg text-white">STRONG BUY</div>
                      </div>
                      <div className="ml-2 text-right">
                        <div className="text-xs text-slate-400">Confidence</div>
                        <div className="font-bold text-green-500">94%</div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Background Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/20 blur-[100px] -z-10 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-900/50">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose Brain AiPro?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              We combine institutional-grade data with advanced AI to give you an unfair advantage.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Cpu className="h-8 w-8 text-blue-500" />}
              title="5 Specialized AI Agents"
              description="Dedicated agents for Forex, Crypto, Stocks, Commodities, and Indices working in harmony."
            />
            <FeatureCard
              icon={<BarChart2 className="h-8 w-8 text-purple-500" />}
              title="19 Advanced Strategies"
              description="From Elliott Wave to Order Flow, we use every tool in the book to find winning trades."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8 text-green-500" />}
              title="90%+ Accuracy"
              description="Our multi-layer validation system ensures only the highest probability setups are signaled."
            />
            <FeatureCard
              icon={<Globe className="h-8 w-8 text-cyan-500" />}
              title="Real-Time Data"
              description="Live feeds from Alpha Vantage, Binance, and Finnhub for split-second decisions."
            />
            <FeatureCard
              icon={<Zap className="h-8 w-8 text-yellow-500" />}
              title="Instant Notifications"
              description="Get alerts via Telegram, SMS, Email, and In-App the moment a setup is confirmed."
            />
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8 text-red-500" />}
              title="Automated Backtesting"
              description="Every strategy is continuously tested against historical data to ensure performance."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container px-4 mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-slate-800 rounded-3xl p-12 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">Ready to Transform Your Trading?</h2>
              <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                Join thousands of traders who are already using Brain AiPro to beat the market.
              </p>
              <Link href="/register">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 text-lg px-8">
                  Get Started for Free
                </Button>
              </Link>
            </div>

            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-20" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-blue-500/50 transition-colors group">
      <div className="mb-4 p-3 bg-slate-800 rounded-lg w-fit group-hover:bg-slate-800/80 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-slate-400 leading-relaxed">
        {description}
      </p>
    </div>
  )
}