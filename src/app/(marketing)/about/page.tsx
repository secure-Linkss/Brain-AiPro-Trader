import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, Award, TrendingUp } from "lucide-react"

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen bg-slate-950 text-white">
            <header className="px-4 lg:px-6 h-16 flex items-center border-b border-slate-800">
                <Link className="font-bold text-xl" href="/">Brain AiPro Trader</Link>
                <nav className="ml-auto flex gap-4 sm:gap-6">
                    <Link className="text-sm font-medium hover:text-blue-400" href="/">Home</Link>
                    <Link className="text-sm font-medium hover:text-blue-400" href="/contact">Contact</Link>
                </nav>
            </header>

            <main className="flex-1 py-12 md:py-24">
                <div className="container px-4 md:px-6">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
                            Democratizing Institutional Trading Intelligence
                        </h1>
                        <p className="text-slate-400 text-lg">
                            We believe that retail traders deserve the same powerful tools and insights used by Wall Street hedge funds.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-24">
                        <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 text-center">
                            <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">Our Mission</h3>
                            <p className="text-slate-400">
                                To empower traders worldwide with AI-driven insights that level the playing field against institutional algorithms.
                            </p>
                        </div>
                        <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 text-center">
                            <Award className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">Our Quality</h3>
                            <p className="text-slate-400">
                                We don't just generate signals. We validate them with multi-factor analysis to ensure only the highest probability setups reach you.
                            </p>
                        </div>
                        <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 text-center">
                            <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">Our Vision</h3>
                            <p className="text-slate-400">
                                A world where AI handles the complex analysis, allowing traders to focus on strategy and execution.
                            </p>
                        </div>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold mb-8 text-center">The Story Behind Brain AiPro</h2>
                        <div className="prose prose-invert max-w-none">
                            <p className="text-slate-300 text-lg leading-relaxed mb-6">
                                Brain AiPro Trader started with a simple question: "Why do retail traders lose money while institutions profit?" The answer wasn't just capital—it was information and processing power.
                            </p>
                            <p className="text-slate-300 text-lg leading-relaxed mb-6">
                                Institutions use supercomputers to analyze news, sentiment, and price action in milliseconds. Retail traders use manual charts and gut feeling. We set out to bridge this gap.
                            </p>
                            <p className="text-slate-300 text-lg leading-relaxed mb-6">
                                By leveraging the latest advancements in Large Language Models (LLMs) and machine learning, we've built a system that reads the market like a seasoned veteran but processes data like a supercomputer. Our agents don't sleep, don't get emotional, and don't miss opportunities.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
