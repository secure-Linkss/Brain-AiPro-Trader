"use client"

import { Save } from 'lucide-react'
import { useState } from 'react'

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState({
        siteName: 'Brain AiPro Trader',
        maintenanceMode: false,
        signupsEnabled: true,
        maxSignalsPerDay: 100
    })

    return (
        <div className="min-h-screen bg-primary-900 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">Admin Settings</h1>

                <div className="bg-primary-800/60 border border-white/10 rounded-xl p-6 space-y-6">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Site Name</label>
                        <input
                            type="text"
                            value={settings.siteName}
                            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                            className="w-full px-4 py-3 bg-primary-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-primary-900/50 rounded-lg">
                        <span className="text-white">Maintenance Mode</span>
                        <input
                            type="checkbox"
                            checked={settings.maintenanceMode}
                            onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                            className="w-5 h-5 rounded"
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-primary-900/50 rounded-lg">
                        <span className="text-white">Signups Enabled</span>
                        <input
                            type="checkbox"
                            checked={settings.signupsEnabled}
                            onChange={(e) => setSettings({ ...settings, signupsEnabled: e.target.checked })}
                            className="w-5 h-5 rounded"
                        />
                    </div>

                    <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2">
                        <Save size={20} />
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    )
}
