"use client"

import Link from 'next/link'
import { Github, Twitter, Linkedin, Mail, Youtube } from 'lucide-react'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    const footerSections = [
        {
            title: 'Product',
            links: [
                { label: 'Features', href: '/features' },
                { label: 'Pricing', href: '/pricing' },
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'API Documentation', href: '/docs' },
            ],
        },
        {
            title: 'Company',
            links: [
                { label: 'About Us', href: '/about' },
                { label: 'Contact', href: '/contact' },
                { label: 'FAQ', href: '/faq' },
                { label: 'Blog', href: '/blog' },
            ],
        },
        {
            title: 'Legal',
            links: [
                { label: 'Privacy Policy', href: '/legal/privacy' },
                { label: 'Terms of Service', href: '/legal/terms' },
                { label: 'Cookie Policy', href: '/legal/cookies' },
                { label: 'Disclaimer', href: '/legal/disclaimer' },
            ],
        },
        {
            title: 'Resources',
            links: [
                { label: 'Help Center', href: '/help' },
                { label: 'Community', href: '/community' },
                { label: 'Tutorials', href: '/tutorials' },
                { label: 'Status', href: '/status' },
            ],
        },
    ]

    const socialLinks = [
        { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
        { icon: Github, href: 'https://github.com', label: 'GitHub' },
        { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
        { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
    ]

    return (
        <footer className="bg-primary-900 border-t border-white/10">
            <div className="container mx-auto px-4 py-12">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-8">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="flex items-center space-x-3 mb-4 group">
                            <div className="relative w-10 h-10">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg blur-sm group-hover:blur-md transition-all" />
                                <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">🧠</span>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white font-bold text-lg leading-none">
                                    Brain AiPro Trader
                                </span>
                                <span className="text-blue-400 text-xs">AI Trading Intelligence</span>
                            </div>
                        </Link>
                        <p className="text-gray-400 text-sm mb-6 max-w-xs">
                            Advanced AI-powered trading analysis platform. Make smarter trading decisions with institutional-grade intelligence.
                        </p>
                        {/* Social Links */}
                        <div className="flex space-x-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all hover:-translate-y-1"
                                    aria-label={social.label}
                                >
                                    <social.icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Footer Links */}
                    {footerSections.map((section) => (
                        <div key={section.title}>
                            <h3 className="text-white font-semibold text-sm mb-4">
                                {section.title}
                            </h3>
                            <ul className="space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="text-gray-400 hover:text-white text-sm transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Newsletter Section */}
                <div className="border-t border-white/10 pt-8 mb-8">
                    <div className="max-w-md">
                        <h3 className="text-white font-semibold text-sm mb-2">
                            Stay Updated
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Get the latest trading insights and platform updates.
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                            />
                            <button className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all hover:-translate-y-0.5 whitespace-nowrap">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-400 text-sm">
                        © {currentYear} Brain AiPro Trader. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                        <Link href="/legal/privacy" className="hover:text-white transition-colors">
                            Privacy
                        </Link>
                        <Link href="/legal/terms" className="hover:text-white transition-colors">
                            Terms
                        </Link>
                        <Link href="/legal/cookies" className="hover:text-white transition-colors">
                            Cookies
                        </Link>
                    </div>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-primary-800/50 border-t border-white/5">
                <div className="container mx-auto px-4 py-4">
                    <p className="text-gray-500 text-xs text-center">
                        <strong>Risk Disclaimer:</strong> Trading involves substantial risk and is not suitable for every investor. Past performance does not guarantee future results. This platform provides analysis tools only and does not constitute financial advice.
                    </p>
                </div>
            </div>
        </footer>
    )
}
