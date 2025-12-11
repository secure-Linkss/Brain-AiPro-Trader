"use client"

import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import { useState } from 'react'

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    })
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('sending')

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))

        setStatus('success')
        setFormData({ name: '', email: '', subject: '', message: '' })

        setTimeout(() => setStatus('idle'), 3000)
    }

    const contactInfo = [
        {
            icon: Mail,
            title: 'Email',
            value: 'support@brainaipro.com',
            link: 'mailto:support@brainaipro.com'
        },
        {
            icon: Phone,
            title: 'Phone',
            value: '+1 (555) 123-4567',
            link: 'tel:+15551234567'
        },
        {
            icon: MapPin,
            title: 'Office',
            value: 'San Francisco, CA',
            link: null
        }
    ]

    return (
        <div className="min-h-screen bg-slate-950">
            <Navigation />

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4">
                <div className="container mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                        Get in Touch
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </p>
                </div>
            </section>

            {/* Contact Section */}
            <section className="pb-20 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <div className="bg-primary-800/60 border border-white/10 rounded-2xl p-8">
                            <h2 className="text-2xl font-bold text-white mb-6">Send us a message</h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Your Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-primary-900/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 bg-primary-900/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder="john@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full px-4 py-3 bg-primary-900/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder="How can we help?"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Message
                                    </label>
                                    <textarea
                                        required
                                        rows={6}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full px-4 py-3 bg-primary-900/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                                        placeholder="Tell us more about your inquiry..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === 'sending'}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {status === 'sending' ? (
                                        <>Sending...</>
                                    ) : status === 'success' ? (
                                        <>Message Sent!</>
                                    ) : (
                                        <>
                                            Send Message
                                            <Send size={18} />
                                        </>
                                    )}
                                </button>

                                {status === 'success' && (
                                    <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm">
                                        Thank you! We'll get back to you soon.
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-6">Contact Information</h2>
                                <p className="text-gray-400 mb-8">
                                    Reach out to us through any of these channels. Our team is here to help you succeed.
                                </p>
                            </div>

                            <div className="space-y-6">
                                {contactInfo.map((info, index) => (
                                    <div key={index} className="flex items-start gap-4 p-6 bg-primary-800/60 border border-white/10 rounded-xl hover:border-blue-500/50 transition-colors">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <info.icon className="text-white" size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-400 mb-1">{info.title}</h3>
                                            {info.link ? (
                                                <a href={info.link} className="text-lg text-white hover:text-blue-400 transition-colors">
                                                    {info.value}
                                                </a>
                                            ) : (
                                                <p className="text-lg text-white">{info.value}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/50 rounded-xl">
                                <h3 className="text-lg font-semibold text-white mb-2">Business Hours</h3>
                                <p className="text-gray-300">Monday - Friday: 9:00 AM - 6:00 PM PST</p>
                                <p className="text-gray-300">Saturday - Sunday: Closed</p>
                                <p className="text-sm text-gray-400 mt-4">
                                    * Support tickets are answered 24/7
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
