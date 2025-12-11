"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown } from 'lucide-react'
import Logo from '@/components/Logo'

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
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${(isScrolled || isMobileMenuOpen)
                ? 'bg-slate-950/95 backdrop-blur-md shadow-lg border-b border-white/10'
                : 'bg-transparent'
                }`}
        >
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <Logo iconSize={40} fontSize="1.125rem" className="text-white" />
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

                {isMobileMenuOpen && (
                    <div className="md:hidden fixed inset-x-0 top-20 bottom-0 bg-slate-950 border-t border-white/10 z-40 overflow-y-auto">
                        <div className="flex flex-col p-6 space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`text-base font-medium px-4 py-3 rounded-lg transition-colors ${isActive(link.href)
                                        ? 'text-blue-400 bg-blue-500/10'
                                        : 'text-gray-100 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="flex flex-col space-y-3 pt-6 mt-6 border-t border-white/10">
                                <Link
                                    href="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-base font-medium text-center py-3 text-gray-100 hover:text-white border border-white/20 rounded-lg transition-colors hover:bg-white/5"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/register"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-base font-semibold text-center py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
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
