"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown } from 'lucide-react'
import Image from 'next/image'

export default function Navigation() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/features', label: 'Features' },
        { href: '/pricing', label: 'Pricing' },
        { href: '/about', label: 'About' },
        { href: '/contact', label: 'Contact' },
    ]

    const isActive = (href: string) => pathname === href

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? 'bg-primary-900/95 backdrop-blur-md shadow-lg border-b border-white/10'
                    : 'bg-transparent'
                }`}
        >
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-3 group">
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

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm font-medium transition-colors relative group ${isActive(link.href)
                                        ? 'text-blue-400'
                                        : 'text-gray-300 hover:text-white'
                                    }`}
                            >
                                {link.label}
                                <span
                                    className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 transition-all group-hover:w-full ${isActive(link.href) ? 'w-full' : ''
                                        }`}
                                />
                            </Link>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link
                            href="/login"
                            className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                        >
                            Log In
                        </Link>
                        <Link
                            href="/register"
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all hover:-translate-y-0.5"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-white/10 animate-fadeIn">
                        <div className="flex flex-col space-y-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${isActive(link.href)
                                            ? 'text-blue-400 bg-blue-500/10'
                                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="flex flex-col space-y-2 px-4 pt-4 border-t border-white/10">
                                <Link
                                    href="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-sm font-medium text-center py-2.5 text-gray-300 hover:text-white border border-white/20 rounded-lg transition-colors"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/register"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-sm font-semibold text-center py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg"
                                >
                                    Get Started
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
