"use client"

import { useState } from 'react'
import { User, Bell, Shield, CreditCard, Mail, Save } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    notifications: {
      email: true,
      sms: false,
      telegram: true,
      push: true
    },
    trading: {
      defaultRisk: 2,
      maxPositions: 5,
      autoTrade: false
    }
  })

  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    // API call to save settings
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="min-h-screen bg-primary-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Profile */}
          <div className="bg-primary-800/60 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="text-blue-500" size={24} />
              <h2 className="text-xl font-semibold text-white">Profile</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Name</label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  className="w-full px-4 py-3 bg-primary-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-4 py-3 bg-primary-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-primary-800/60 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="text-blue-500" size={24} />
              <h2 className="text-xl font-semibold text-white">Notifications</h2>
            </div>
            <div className="space-y-4">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-white capitalize">{key} Notifications</span>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, [key]: e.target.checked }
                    })}
                    className="w-5 h-5 rounded border-white/20 bg-primary-900/50 text-blue-500"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Trading Preferences */}
          <div className="bg-primary-800/60 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="text-blue-500" size={24} />
              <h2 className="text-xl font-semibold text-white">Trading Preferences</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Default Risk per Trade (%)</label>
                <input
                  type="number"
                  value={settings.trading.defaultRisk}
                  onChange={(e) => setSettings({
                    ...settings,
                    trading: { ...settings.trading, defaultRisk: Number(e.target.value) }
                  })}
                  className="w-full px-4 py-3 bg-primary-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Max Concurrent Positions</label>
                <input
                  type="number"
                  value={settings.trading.maxPositions}
                  onChange={(e) => setSettings({
                    ...settings,
                    trading: { ...settings.trading, maxPositions: Number(e.target.value) }
                  })}
                  className="w-full px-4 py-3 bg-primary-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-white">Auto-Trade (Copy signals automatically)</span>
                <input
                  type="checkbox"
                  checked={settings.trading.autoTrade}
                  onChange={(e) => setSettings({
                    ...settings,
                    trading: { ...settings.trading, autoTrade: e.target.checked }
                  })}
                  className="w-5 h-5 rounded border-white/20 bg-primary-900/50 text-blue-500"
                />
              </label>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}