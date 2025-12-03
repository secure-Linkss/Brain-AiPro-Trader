import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Linkedin, Youtube, Mail } from "lucide-react"

export function Footer() {
    return (
        <footer className="border-t border-slate-800 bg-slate-950">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-bold text-xl">B</span>
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Brain AiPro Trader
                            </span>
                        </Link>
                        <p className="text-slate-400 text-sm mb-4 max-w-sm">
                            Master the markets with AI-powered intelligence. Advanced trading signals powered by 19 guru-level strategies and 5 specialized AI agents.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                                className="h-9 w-9 rounded-lg bg-slate-900 hover:bg-slate-800 flex items-center justify-center transition-colors">
                                <Twitter className="h-4 w-4 text-slate-400" />
                            </a>
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                                className="h-9 w-9 rounded-lg bg-slate-900 hover:bg-slate-800 flex items-center justify-center transition-colors">
                                <Facebook className="h-4 w-4 text-slate-400" />
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                                className="h-9 w-9 rounded-lg bg-slate-900 hover:bg-slate-800 flex items-center justify-center transition-colors">
                                <Linkedin className="h-4 w-4 text-slate-400" />
                            </a>
                            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                                className="h-9 w-9 rounded-lg bg-slate-900 hover:bg-slate-800 flex items-center justify-center transition-colors">
                                <Youtube className="h-4 w-4 text-slate-400" />
                            </a>
                        </div>
                    </div>

                    {/* Platform Links */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">Platform</h3>
                        <ul className="space-y-3">
                            <li><Link href="/features" className="text-slate-400 hover:text-white text-sm transition-colors">Features</Link></li>
                            <li><Link href="/pricing" className="text-slate-400 hover:text-white text-sm transition-colors">Pricing</Link></li>
                            <li><Link href="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors">Dashboard</Link></li>
                            <li><Link href="/signals" className="text-slate-400 hover:text-white text-sm transition-colors">Live Signals</Link></li>
                            <li><Link href="/analysis" className="text-slate-400 hover:text-white text-sm transition-colors">Market Analysis</Link></li>
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">Company</h3>
                        <ul className="space-y-3">
                            <li><Link href="/about" className="text-slate-400 hover:text-white text-sm transition-colors">About Us</Link></li>
                            <li><Link href="/contact" className="text-slate-400 hover:text-white text-sm transition-colors">Contact</Link></li>
                            <li><Link href="/faq" className="text-slate-400 hover:text-white text-sm transition-colors">FAQ</Link></li>
                            <li><Link href="/blog" className="text-slate-400 hover:text-white text-sm transition-colors">Blog</Link></li>
                            <li><Link href="/careers" className="text-slate-400 hover:text-white text-sm transition-colors">Careers</Link></li>
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">Legal</h3>
                        <ul className="space-y-3">
                            <li><Link href="/legal/privacy" className="text-slate-400 hover:text-white text-sm transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/legal/terms" className="text-slate-400 hover:text-white text-sm transition-colors">Terms of Service</Link></li>
                            <li><Link href="/legal/disclaimer" className="text-slate-400 hover:text-white text-sm transition-colors">Risk Disclaimer</Link></li>
                            <li><Link href="/legal/cookies" className="text-slate-400 hover:text-white text-sm transition-colors">Cookie Policy</Link></li>
                            <li><Link href="/legal/acceptable-use" className="text-slate-400 hover:text-white text-sm transition-colors">Acceptable Use</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-sm">
                        © {new Date().getFullYear()} Brain AiPro Trader. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-sm text-slate-500">
                        <span>Made with ❤️ for traders worldwide</span>
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <a href="mailto:support@brainai.com" className="hover:text-white transition-colors">
                                support@brainai.com
                            </a>
                        </div>
                    </div>
                </div>

                {/* Risk Disclaimer */}
                <div className="mt-8 p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
                    <p className="text-xs text-slate-500 leading-relaxed">
                        <strong className="text-slate-400">Risk Warning:</strong> Trading financial instruments carries a high level of risk to your capital with the possibility of losing more than your initial investment. Trading may not be suitable for all investors. Before trading, you should carefully consider your investment objectives, level of experience, and risk appetite. You should only invest money that you can afford to lose. Brain AiPro Trader does not provide investment advice. Past performance is not indicative of future results.
                    </p>
                </div>
            </div>
        </footer>
    )
}
