import React from 'react';
import { Settings, User, Bell, Map as MapIcon, Database, Shield, Monitor, Globe, HardDrive, Key, Webhook, Link, Mail, Smartphone } from 'lucide-react';

export default function SettingsView({ activeTab, setActiveTab }) {
  const tabs = [
    { name: 'General', icon: <Monitor size={16} /> },
    { name: 'Account', icon: <User size={16} /> },
    { name: 'Notifications', icon: <Bell size={16} /> },
    { name: 'Map Defaults', icon: <MapIcon size={16} /> },
    { name: 'Data Integrations', icon: <Database size={16} /> },
    { name: 'Security', icon: <Shield size={16} /> },
  ];

  return (
    <div className="flex-1 flex flex-col gap-4 h-full min-h-0">
      
      {/* Top Header */}
      <div className="flex items-center gap-3 bg-[#111622] p-4 rounded-xl border border-gray-800/60 shrink-0">
        <div className="p-2 bg-gray-800 text-gray-300 rounded-lg"><Settings size={20} /></div>
        <div>
          <h2 className="text-lg font-bold text-gray-200">System Settings</h2>
          <p className="text-xs text-gray-500">Configure ClimaX dashboard preferences and integrations</p>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
         {/* Sidebar Navigation */}
         <div className="w-[250px] bg-[#111622] rounded-xl border border-gray-800/60 p-4 shrink-0 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
            {tabs.map((tab, i) => (
              <button 
                key={i} 
                onClick={() => setActiveTab(tab.name)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full text-left ${
                  activeTab === tab.name 
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a2133] border border-transparent'
                }`}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
         </div>

         {/* Main Content Area */}
         <div className="flex-1 bg-[#111622] rounded-xl border border-gray-800/60 p-6 overflow-y-auto custom-scrollbar relative">
            
            {activeTab === 'General' && (
              <div className="max-w-2xl animate-in fade-in duration-300">
                <h3 className="text-lg font-semibold text-gray-200 mb-6 border-b border-gray-800 pb-2">General Preferences</h3>
                
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-300">Theme Preference</h4>
                      <p className="text-xs text-gray-500 mt-1">Select your dashboard color theme.</p>
                    </div>
                    <select className="bg-[#0a0d14] border border-gray-700 text-sm text-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500">
                      <option>Dark Mode (Default)</option>
                      <option>Light Mode</option>
                      <option>System Default</option>
                    </select>
                  </div>

                  <div className="h-[1px] w-full bg-gray-800/50"></div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-300">Timezone</h4>
                      <p className="text-xs text-gray-500 mt-1">Set the primary timezone for all timestamps.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-gray-500" />
                      <select className="bg-[#0a0d14] border border-gray-700 text-sm text-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500">
                        <option>CET / CEST (UTC+1/+2) - Central European Time (Switzerland)</option>
                        <option>UTC - Coordinated Universal Time</option>
                        <option>IST (UTC+5:30) - Indian Standard Time</option>
                        <option>EST (UTC-5:00) - Eastern Standard Time</option>
                      </select>
                    </div>
                  </div>

                  <div className="h-[1px] w-full bg-gray-800/50"></div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-300">Unit System</h4>
                      <p className="text-xs text-gray-500 mt-1">Measurement units for speed, distance, and temperature.</p>
                    </div>
                    <select className="bg-[#0a0d14] border border-gray-700 text-sm text-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500">
                      <option>Metric (km, km/h, °C)</option>
                      <option>Imperial (mi, mph, °F)</option>
                      <option>Aviation (NM, knots, °C)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Map Defaults' && (
              <div className="max-w-2xl animate-in fade-in duration-300">
                <h3 className="text-lg font-semibold text-gray-200 mb-6 border-b border-gray-800 pb-2">Map Defaults</h3>
                
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-300">Default Region</h4>
                      <p className="text-xs text-gray-500 mt-1">The initial map center on app load.</p>
                    </div>
                    <select className="bg-[#0a0d14] border border-gray-700 text-sm text-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500">
                      <option>Switzerland (National / Alpine Radar Grid)</option>
                      <option>Central Switzerland (Gotthard & Lucerne Basin)</option>
                      <option>Zurich & Northern Plateau</option>
                      <option>Global / Dynamic Auto-detect</option>
                    </select>
                  </div>
                  
                  <div className="h-[1px] w-full bg-gray-800/50"></div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-300">Default Map Layers</h4>
                      <p className="text-xs text-gray-500 mt-1">Layers enabled by default on the Live Nowcast.</p>
                    </div>
                    <div className="flex flex-col gap-2">
                       <label className="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" defaultChecked className="accent-blue-500" /> Storm Objects</label>
                       <label className="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" defaultChecked className="accent-blue-500" /> Track & Forecast</label>
                       <label className="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" className="accent-blue-500" /> Radar Overlay</label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Account' && (
              <div className="max-w-2xl animate-in fade-in duration-300">
                <h3 className="text-lg font-semibold text-gray-200 mb-6 border-b border-gray-800 pb-2">Account Profile</h3>
                
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-2xl font-bold border border-blue-500/50">
                      JD
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-200">Jane Doe</h4>
                      <p className="text-sm text-gray-400">jane.doe@meteorology.gov</p>
                      <button className="mt-2 text-xs text-blue-400 hover:text-blue-300 border border-blue-400/50 hover:bg-blue-400/10 px-3 py-1 rounded transition-colors">
                        Change Avatar
                      </button>
                    </div>
                  </div>

                  <div className="h-[1px] w-full bg-gray-800/50"></div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-500">First Name</label>
                      <input type="text" defaultValue="Jane" className="bg-[#0a0d14] border border-gray-700 text-sm text-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-500">Last Name</label>
                      <input type="text" defaultValue="Doe" className="bg-[#0a0d14] border border-gray-700 text-sm text-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" />
                    </div>
                    <div className="flex flex-col gap-1 col-span-2">
                      <label className="text-xs text-gray-500">Email Address</label>
                      <input type="email" defaultValue="jane.doe@meteorology.gov" className="bg-[#0a0d14] border border-gray-700 text-sm text-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Notifications' && (
              <div className="max-w-2xl animate-in fade-in duration-300">
                <h3 className="text-lg font-semibold text-gray-200 mb-6 border-b border-gray-800 pb-2">Notification Channels</h3>
                
                <div className="flex flex-col gap-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Mail size={20} className="text-gray-400" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-300">Email Alerts</h4>
                        <p className="text-xs text-gray-500 mt-1">Receive critical storm warnings via email.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>

                  <div className="h-[1px] w-full bg-gray-800/50"></div>

                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone size={20} className="text-gray-400" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-300">SMS Alerts</h4>
                        <p className="text-xs text-gray-500 mt-1">Get immediate SMS text messages for Extreme risks.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>

                  <div className="h-[1px] w-full bg-gray-800/50"></div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-300">Minimum Severity Threshold</h4>
                      <p className="text-xs text-gray-500 mt-1">Only notify me for alerts above this level.</p>
                    </div>
                    <select className="bg-[#0a0d14] border border-gray-700 text-sm text-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500">
                      <option>Moderate (All)</option>
                      <option>High Risk</option>
                      <option>Critical Only</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Data Integrations' && (
              <div className="max-w-2xl animate-in fade-in duration-300">
                <h3 className="text-lg font-semibold text-gray-200 mb-6 border-b border-gray-800 pb-2">API & Integrations</h3>
                
                <div className="flex flex-col gap-6">
                  <div className="bg-[#1a2133] border border-gray-700/50 p-4 rounded-lg flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 text-blue-400 rounded"><Webhook size={18} /></div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-200">Custom Webhook</h4>
                        <p className="text-xs text-gray-500 mt-0.5">https://api.yourdomain.com/climax/hook</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded">Connected</span>
                      <button className="text-gray-400 hover:text-white px-2">Edit</button>
                    </div>
                  </div>

                  <div className="bg-[#1a2133] border border-gray-700/50 p-4 rounded-lg flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 text-blue-400 rounded"><Database size={18} /></div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-200">MeteoSwiss Doppler Radar API</h4>
                        <p className="text-xs text-gray-500 mt-0.5">Swiss national composite radar grid (500x500 km)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded">Active (38 Frames)</span>
                      <button className="text-gray-400 hover:text-white px-2">Config</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Security' && (
              <div className="max-w-2xl animate-in fade-in duration-300">
                <h3 className="text-lg font-semibold text-gray-200 mb-6 border-b border-gray-800 pb-2">Security & Access</h3>
                
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-300">Change Password</h4>
                      <p className="text-xs text-gray-500 mt-1">Last changed 4 months ago.</p>
                    </div>
                    <button className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm text-gray-300 rounded px-4 py-1.5 transition-colors">
                      Update Password
                    </button>
                  </div>

                  <div className="h-[1px] w-full bg-gray-800/50"></div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Key size={20} className="text-gray-400" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-300">Two-Factor Authentication (2FA)</h4>
                        <p className="text-xs text-gray-500 mt-1">Add an extra layer of security to your account.</p>
                      </div>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-500 text-sm text-white rounded px-4 py-1.5 transition-colors">
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="absolute bottom-6 right-6 flex gap-3">
               <button className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                 Cancel
               </button>
               <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20">
                 Save Changes
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
