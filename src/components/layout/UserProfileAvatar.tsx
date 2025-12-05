"use client"

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Settings, CreditCard, Shield, LogOut, ChevronDown } from 'lucide-react'

interface UserProfileAvatarProps {
    user?: {
        name: string
        email: string
        plan: string
        avatar?: string
    }
}

export default function UserProfileAvatar({ user }: UserProfileAvatarProps) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogout = async () => {
        // Call logout API
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
            router.push('/login')
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    const menuItems = [
        { icon: User, label: 'Profile', href: '/settings' },
        { icon: CreditCard, label: 'Subscription', href: '/settings?tab=subscription' },
        { icon: Shield, label: 'Security & 2FA', href: '/settings?tab=security' },
        { icon: Settings, label: 'Settings', href: '/settings' }
    ]

    // Default user if not provided
    const currentUser = user || {
        name: 'John Doe',
        email: 'john@example.com',
        plan: 'Pro'
    }

    // Get initials for avatar
    const initials = currentUser.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {currentUser.avatar ? (
                        <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        initials
                    )}
                </div>

                {/* User Info (hidden on mobile) */}
                <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-white">{currentUser.name}</p>
                    <p className="text-xs text-gray-400">{currentUser.plan} Plan</p>
                </div>

                {/* Chevron */}
                <ChevronDown className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} size={16} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-primary-800 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-fadeIn">
                    {/* User Info Header */}
                    <div className="p-4 border-b border-white/10">
                        <p className="text-white font-medium">{currentUser.name}</p>
                        <p className="text-sm text-gray-400">{currentUser.email}</p>
                        <div className="mt-2">
                            <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                                {currentUser.plan} Plan
                            </span>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                        {menuItems.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                            >
                                <item.icon size={18} />
                                <span className="text-sm">{item.label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Logout */}
                    <div className="border-t border-white/10">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                            <LogOut size={18} />
                            <span className="text-sm font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
