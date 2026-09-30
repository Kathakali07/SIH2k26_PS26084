import React, { useState } from 'react';
import { Activity, Satellite, Zap, Cloud, Map as MapIcon, Database, CheckCircle, AlertTriangle, AlertOctagon, RotateCcw, Cpu, UploadCloud, Terminal, FileCode, CheckCircle2, ArrowRight } from 'lucide-react';

export default function DataSensors({ setActiveTab }) {
  const [activeTab, setActiveTabFilter] = useState('Sensor Status');
  const [radarOffline, setRadarOffline] = useState(false);
  const [satelliteOffline, setSatelliteOffline] = useState(false);
  const [lightningOffline, setLightningOffline] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [ingestionLog, setIngestionLog] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE || 'https://sih2k26-ps26084.onrender.com';

  const handleIngestPreset = async (presetName, sourceName) => {
    setIngesting(true);
    try {
      const res = await fetch(`${API_BASE}/api/ingest/radar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset: presetName, source_name: sourceName }),
      });
      const data = await res.json();
      setIngestionLog(data);
    } catch (e) {
      setIngestionLog({
        status: 'error',
        message: `Ingestion request failed: ${e.message}`,
      });
    } finally {
      setIngesting(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIngesting(true);
    try {
      const res = await fetch(`${API_BASE}/api/ingest/radar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_name: `Custom Upload (${file.name})`,
          format: file.name.split('.').pop().toUpperCase(),
          preset: 'custom_file_upload',
        }),
      });
      const data = await res.json();
      setIngestionLog({
        ...data,
        filename: file.name,
        filesize_kb: Math.round(file.size / 1024),
      });
    } catch (e) {
      setIngestionLog({
        status: 'error',
        message: `File upload parsing failed: ${e.message}`,
      });
    } finally {
      setIngesting(false);
    }
  };

  const handleToggleRadar = async () => {
    const nextState = !radarOffline;
    setRadarOffline(nextState);
    try {
      await fetch(`${API_BASE}/api/kill-radar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !nextState }),
      });
    } catch (e) {
      console.error('Failed to toggle radar state:', e);
    }
  };

  const handleReset = async () => {
    setRadarOffline(false);
    setSatelliteOffline(false);
    setLightningOffline(false);
    try {
      await fetch(`${API_BASE}/api/reset-demo`, { method: 'POST' });
    } catch (e) {
      console.error('Failed to reset demo state:', e);
    }
  };

  const initialSensors = [
    { name: 'MeteoSwiss Doppler Radar Network', icon: <Activity size={16} />, type: 'radar', offline: radarOffline, latency: '2-5 min', resolution: '1.0 km / 5 min' },
    { name: 'EUMETSAT Meteosat SEVIRI Satellite', icon: <Satellite size={16} />, type: 'satellite', offline: satelliteOffline, latency: '15 min', resolution: '3.0 km IR' },
    { name: 'EUCLID European Lightning Network', icon: <Zap size={16} />, type: 'lightning', offline: lightningOffline, latency: '< 5 sec', resolution: '100 m flash' },
    { name: 'MeteoSwiss COSMO-1E / ICON-CH NWP', icon: <Cloud size={16} />, type: 'model', offline: false, latency: 'Hourly', resolution: '1.1 km grid' },
    { name: 'SwissMetNet Surface Automated AWS', icon: <MapIcon size={16} />, type: 'surface', offline: false, latency: '10 min', resolution: '160 stations' },
    { name: 'DeepMind DGMR Neural AI Inference', icon: <Cpu size={16} />, type: 'fusion', offline: false, latency: '2.3 sec', resolution: '500x500 km' },
  ];

  return (
    <div className="flex-1 flex flex-col gap-4 h-full min-h-0">
      {/* Top Filter Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-800 pb-2 shrink-0">
        {['Sensor Status', 'Data Sources', 'Manual Ingestion & Upload', 'Model Settings', 'Alert Settings'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTabFilter(tab)}
            className={`text-xs font-bold pb-2 border-b-2 -mb-[9px] transition-colors ${
              activeTab === tab ? 'text-blue-400 border-blue-500' : 'text-gray-400 border-transparent hover:text-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-4 bg-[#111622] rounded-xl border border-gray-800/60 p-5 overflow-y-auto custom-scrollbar shadow-lg">
        {activeTab === 'Sensor Status' && (
          <div className="flex flex-col gap-4">
            {/* Live Table */}
            <div className="border border-gray-800/80 rounded-xl overflow-hidden bg-[#0a0d14]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#111622] text-gray-400 border-b border-gray-800 text-[10px] uppercase font-semibold">
                    <th className="p-3">Sensor Stream</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Latency</th>
                    <th className="p-3">Resolution / Coverage</th>
                    <th className="p-3 text-right">Data Quality</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 text-gray-300">
                  {initialSensors.map((s, idx) => (
                    <tr key={idx} className="hover:bg-[#151c2c]/60 transition-colors">
                      <td className="p-3 flex items-center gap-2.5 font-medium text-white">
                        <div className={`p-1.5 rounded ${s.offline ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          {s.icon}
                        </div>
                        {s.name}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.offline ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}>
                          {s.offline ? 'OFFLINE' : 'ONLINE'}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-gray-400">{s.latency}</td>
                      <td className="p-3 text-gray-300">{s.resolution}</td>
                      <td className="p-3 text-right">
                        <span className={`font-semibold ${s.offline ? 'text-red-400' : 'text-emerald-400'}`}>
                          {s.offline ? 'Unavailable' : '100% Nominal'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Interactive Sensor Failure Simulation Console */}
            <div className="p-4 rounded-xl bg-[#0a0d14] border border-gray-800/80">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Demonstration: Sensor Failure & Fallback Resilience
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Toggle sensor outages to test how the ClimaX DGMR pipeline dynamically adapts uncertainty bounds and invokes synthetic nowcast fallback.
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200 flex items-center gap-1.5 border border-gray-700 transition-colors"
                >
                  <RotateCcw size={12} /> Reset System
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleToggleRadar}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                    radarOffline
                      ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/40'
                      : 'bg-[#182030] text-gray-300 border-gray-700 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  {radarOffline ? 'Restore Swiss Doppler Radar' : 'Simulate Radar Failure'}
                </button>

                <button
                  onClick={() => setSatelliteOffline(!satelliteOffline)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                    satelliteOffline
                      ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/40'
                      : 'bg-[#182030] text-gray-300 border-gray-700 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  {satelliteOffline ? 'Restore Satellite' : 'Simulate Satellite Outage'}
                </button>

                <button
                  onClick={() => setLightningOffline(!lightningOffline)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                    lightningOffline
                      ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/40'
                      : 'bg-[#182030] text-gray-300 border-gray-700 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  {lightningOffline ? 'Restore Lightning' : 'Simulate EUCLID Outage'}
                </button>
              </div>

              {radarOffline && (
                <div className="mt-3 p-3 rounded-lg bg-red-950/30 border border-red-800/60 text-xs text-red-300 flex items-center gap-2">
                  <AlertOctagon size={16} className="text-red-400 shrink-0" />
                  <span>
                    <strong>RADAR SENSOR FAILURE TRIGGERED:</strong> The system has switched to <strong>DGMR Neural Fallback Mode</strong>. Forecast uncertainty cones have expanded by 2.5x to account for missing ground observation reflectivity.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'Data Sources' && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Active Meteorological Data Ingestion Feeds</h3>
              <p className="text-xs text-gray-400">Real-time Swiss & European telemetry ingested by the ClimaX processing daemon.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  title: 'MeteoSwiss Rad4Alps Polarimetric Composite',
                  type: 'Doppler C-Band Radar (5 Mountain Stations)',
                  freq: 'Every 5 min',
                  bandwidth: '18.4 MB/frame',
                  endpoint: 'wss://api.meteoswiss.ch/v1/radar/swiss-composite',
                  status: 'Active (38 Frames Cached)'
                },
                {
                  title: 'EUMETSAT MTG-FCI Rapid Scan',
                  type: 'Geostationary Satellite Imagery (IR 10.8 µm & HRV)',
                  freq: 'Every 15 min',
                  bandwidth: '42.1 MB/scan',
                  endpoint: 'https://eumetsat.int/data/mtg-fci/central-europe',
                  status: 'Nominal'
                },
                {
                  title: 'EUCLID European Lightning Detection',
                  type: 'Time-of-Arrival (TOA) & Magnetic Direction Finding',
                  freq: 'Sub-second real-time stream',
                  bandwidth: '120 KB/sec',
                  endpoint: 'mqtt://feed.euclid.org/stream/ch',
                  status: 'Connected (42 fl/min)'
                },
                {
                  title: 'SwissMetNet High-Density Surface AWS',
                  type: '160 Automated Alpine Weather Stations',
                  freq: 'Every 10 min',
                  bandwidth: '2.4 MB/min',
                  endpoint: 'https://data.geo.admin.ch/ch.meteoswiss.swissmetnet',
                  status: 'Online (160/160)'
                }
              ].map((feed, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-[#0a0d14] border border-gray-800/80 flex flex-col justify-between hover:border-gray-700 transition-colors">
                  <div>
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="text-xs font-bold text-gray-100">{feed.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {feed.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400 mb-2">{feed.type}</div>
                    <div className="text-[10px] text-gray-500 font-mono bg-[#111622] p-1.5 rounded border border-gray-800/60 truncate">
                      {feed.endpoint}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-gray-400 mt-3 pt-2 border-t border-gray-800/60">
                    <span>Frequency: <strong className="text-gray-300">{feed.freq}</strong></span>
                    <span>Throughput: <strong className="text-gray-300">{feed.bandwidth}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Manual Ingestion & Upload' && (
          <div className="flex flex-col gap-6 max-w-4xl animate-in fade-in duration-200">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Radar Scan & Grid Ingestion Engine</h3>
              <p className="text-xs text-gray-400">
                Feed real-time polarimetric radar sweeps, NetCDF/HDF5 grids, or satellite imagery into the DGMR neural nowcasting pipeline.
              </p>
            </div>

            {/* Ingestion Channels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* File Upload Dropzone */}
              <div className="flex flex-col justify-between p-5 rounded-xl border border-dashed border-gray-700 bg-[#0a0d14]/70 hover:border-blue-500/60 transition-colors">
                <div className="flex flex-col items-center text-center py-4">
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-full mb-3">
                    <UploadCloud size={28} />
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1">Upload Radar Volume or Raster</h4>
                  <p className="text-[11px] text-gray-400 mb-3 max-w-xs">
                    Supports <span className="font-mono text-gray-300">.nc, .h5, .npy, .tif, .png</span> radar reflectivity grids (500x500 or 256x256 dBZ matrices).
                  </p>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all">
                    <FileCode size={14} />
                    <span>Choose Radar File</span>
                    <input
                      type="file"
                      accept=".nc,.h5,.npy,.tif,.tiff,.png,.gif"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="text-[10px] text-gray-500 border-t border-gray-800/80 pt-2 flex items-center justify-between">
                  <span>Auto-normalizes dBZ to [-10, 75]</span>
                  <span>DGMR Tensor Ready</span>
                </div>
              </div>

              {/* 1-Click Meteorological Radar Presets */}
              <div className="flex flex-col gap-3 p-5 rounded-xl border border-gray-800 bg-[#0a0d14]">
                <h4 className="text-xs font-bold text-gray-200 flex items-center gap-2">
                  <Database size={14} className="text-purple-400" />
                  Meteorological Network Presets (1-Click Ingest)
                </h4>
                <p className="text-[11px] text-gray-400">
                  Simulate direct pipeline ingestion from operational national meteorological radars:
                </p>

                <div className="flex flex-col gap-2 mt-1">
                  <button
                    disabled={ingesting}
                    onClick={() => handleIngestPreset('meteoswiss_rad4alps', 'MeteoSwiss Rad4Alps Composite (Alps Region)')}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#111622] hover:bg-[#182032] border border-gray-800 hover:border-gray-700 text-left transition-colors group"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">
                        MeteoSwiss Rad4Alps Composite
                      </div>
                      <div className="text-[10px] text-gray-500">5 C-Band Polarimetric Radars • 1.0 km • 5-min update</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Ingest
                    </span>
                  </button>

                  <button
                    disabled={ingesting}
                    onClick={() => handleIngestPreset('imd_kolkata_doppler', 'IMD Kolkata S-Band Dual-Pol Doppler (DWR)')}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#111622] hover:bg-[#182032] border border-gray-800 hover:border-gray-700 text-left transition-colors group"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">
                        IMD Kolkata S-Band Doppler Radar
                      </div>
                      <div className="text-[10px] text-gray-500">India Met Dept DWR • 250 km radius • Severe Nor'wester scan</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Ingest
                    </span>
                  </button>

                  <button
                    disabled={ingesting}
                    onClick={() => handleIngestPreset('noaa_nexrad_volume', 'NOAA NEXRAD WSR-88D Level-II Super-Res')}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#111622] hover:bg-[#182032] border border-gray-800 hover:border-gray-700 text-left transition-colors group"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">
                        NOAA NEXRAD WSR-88D Volume
                      </div>
                      <div className="text-[10px] text-gray-500">Super-Resolution Polarimetric Base Reflectivity • Level-II</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Ingest
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Ingestion Telemetry & DGMR Pipeline Status */}
            <div className="p-4 rounded-xl border border-gray-800 bg-[#0a0d14] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal size={15} className="text-emerald-400" />
                  <h4 className="text-xs font-bold text-gray-200">DGMR Ingestion Pipeline & Telemetry Log</h4>
                </div>
                {ingesting && (
                  <span className="text-[10px] font-mono text-blue-400 animate-pulse">
                    Processing 4D Tensor & Generating Nowcast...
                  </span>
                )}
              </div>

              {ingestionLog ? (
                <div className="flex flex-col gap-3">
                  <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      <div>
                        <div className="text-xs font-bold text-emerald-300">
                          {ingestionLog.message || 'Radar scan ingested and processed successfully'}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono">
                          Source: {ingestionLog.source} | Horizon: {ingestionLog.nowcast_lead_time_min || 90}m ({ingestionLog.frames_generated || 18} frames)
                        </div>
                      </div>
                    </div>
                    {setActiveTab && (
                      <button
                        onClick={() => setActiveTab('Nowcast')}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors"
                      >
                        <span>Open Nowcast Map</span>
                        <ArrowRight size={13} />
                      </button>
                    )}
                  </div>

                  <div className="p-3 rounded bg-[#06080d] border border-gray-800/80 font-mono text-[11px] text-gray-300 overflow-x-auto max-h-48 custom-scrollbar">
                    <pre>{JSON.stringify(ingestionLog, null, 2)}</pre>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded border border-gray-800/60 bg-[#070a10] text-[11px] text-gray-500 flex items-center gap-2">
                  <Activity size={14} className="text-gray-600" />
                  <span>
                    Select a meteorological preset above or upload a radar grid file to trigger the ingestion pipeline and view tensor telemetry.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'Model Settings' && (
          <div className="flex flex-col gap-5 max-w-3xl animate-in fade-in duration-200">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Nowcast AI Engine & Physics Blend</h3>
              <p className="text-xs text-gray-400">Configure DeepMind DGMR neural generative nowcasting and Eulerian/Lagrangian optical flow weighting.</p>
            </div>

            <div className="flex flex-col gap-4 bg-[#0a0d14] p-4 rounded-xl border border-gray-800/80">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-gray-200">Model Fusion Architecture</h4>
                  <p className="text-[11px] text-gray-500">DGMR Generative Neural Network vs PySTEPS Lagrangian Advection</p>
                </div>
                <div className="text-xs font-mono font-bold text-purple-400 bg-purple-950/40 border border-purple-800/40 px-2.5 py-1 rounded">
                  75% DGMR / 25% PySTEPS
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                defaultValue="75"
                className="w-full accent-purple-500 h-1.5 bg-gray-800 rounded-lg cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                <span>0% (Pure Physical Advection)</span>
                <span>50% (Balanced Hybrid)</span>
                <span>100% (Pure Neural DGMR)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-[#0a0d14] border border-gray-800/80">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold block mb-1">Ensemble Realizations</span>
                <div className="text-base font-bold text-white mb-1">16 Stochastic Members</div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Generates 16 latent space trajectories with spatio-temporal GAN discriminators.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0a0d14] border border-gray-800/80">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold block mb-1">Forecast Lead Horizon</span>
                <div className="text-base font-bold text-white mb-1">+90 Minutes (18 Steps)</div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  5-minute resolution nowcasting with auto-updating uncertainty envelopes.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Alert Settings' && (
          <div className="flex flex-col gap-4 max-w-3xl animate-in fade-in duration-200">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Automated CAP Alert & Siren Thresholds</h3>
              <p className="text-xs text-gray-400">Configure Common Alerting Protocol v1.2 dissemination triggers for Swiss cantons.</p>
            </div>

            <div className="flex flex-col gap-3 bg-[#0a0d14] p-4 rounded-xl border border-gray-800/80">
              <div className="flex justify-between items-center py-2 border-b border-gray-800/60">
                <div>
                  <span className="text-xs font-semibold text-gray-200 block">Severe Reflectivity Trigger (dBZ)</span>
                  <span className="text-[11px] text-gray-500">Threshold for automatic Level 3 severe thunderstorm advisory</span>
                </div>
                <input type="number" defaultValue="55" className="w-16 bg-[#111622] border border-gray-700 rounded px-2 py-1 text-xs text-right font-mono text-white" />
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-800/60">
                <div>
                  <span className="text-xs font-semibold text-gray-200 block">Extreme Cloudburst Rain Rate (mm/h)</span>
                  <span className="text-[11px] text-gray-500">Threshold for Alpine flash flood emergency warnings</span>
                </div>
                <input type="number" defaultValue="60" className="w-16 bg-[#111622] border border-gray-700 rounded px-2 py-1 text-xs text-right font-mono text-white" />
              </div>

              <div className="flex justify-between items-center py-2">
                <div>
                  <span className="text-xs font-semibold text-gray-200 block">Civil Protection Siren Activation</span>
                  <span className="text-[11px] text-gray-500">Automatic relay to Swiss federal Polyalert siren network</span>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40">ENABLED</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
