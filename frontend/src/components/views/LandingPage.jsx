import React, { useEffect } from 'react';
import { Play, ArrowRight, Mail, CloudLightning, Activity, ShieldAlert, AlertTriangle, Smartphone, Download } from 'lucide-react';
import EarthGlobe from './EarthGlobe';

const NAV_ITEMS = [
  { label: 'Home', page: 'Landing Page' },
  { label: 'Live Map', page: 'Live Nowcast' },
  { label: 'DGMR Ensemble', page: 'Multiple Futures' },
  { label: 'Impact Risk', page: 'Impact Risk' },
  { label: 'About', page: 'About' },
  { label: 'Contact', page: 'Contact' },
];

const TEAM_MEMBERS = [
  {
    name: 'Satyam Puitandy',
    email: 'puitandys05@gmail.com',
    linkedin: 'https://in.linkedin.com/in/satyampuitandy',
    github: 'https://github.com/puitandysatyam',
  },
  {
    name: 'Kathakali Das',
    email: '2004kathakali@gmail.com',
    linkedin: 'https://www.linkedin.com/in/kathakali-kd-46a93623b/',
    github: 'https://github.com/Kathakali07',
  },
  {
    name: 'Rabishankar Roy',
    email: 'rabishankarroy04@gmail.com',
    linkedin: 'https://www.linkedin.com/in/rabishankar-roy-055a52343/',
    github: 'https://github.com/rabishankarroy04-svg',
  },
  {
    name: 'Subhankar Nath',
    email: 'nathsubhankar57@gmail.com',
    linkedin: 'https://www.linkedin.com/in/subhankar-nath-674998325/',
    github: 'https://github.com/subhankar235',
  },
  {
    name: 'Anamika Pathak',
    email: 'anamikapathak587@gmail.com',
    linkedin: 'https://www.linkedin.com/in/anamika-pathak-bb60a2325/',
    github: 'https://github.com/Anamika902',
  },
  {
    name: 'Anindito Patra',
    email: 'patraanindito@gmail.com',
    linkedin: 'https://www.linkedin.com/in/anindito-patra-260701323/',
    github: 'https://github.com/Anindito05'
  },
];

export default function LandingPage({ page = 'Landing Page', onNavigate, onEnterApp }) {
  const navigate = (nextPage) => {
    if (nextPage === 'Contact') {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#contact-section`);
      if (page !== 'Landing Page') onNavigate?.('Landing Page');
      else document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    if (nextPage === 'Landing Page' && page === 'Landing Page') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onNavigate?.(nextPage);
    }
  };

  useEffect(() => {
    if (page === 'Landing Page' && window.location.hash === '#contact-section') {
      requestAnimationFrame(() => document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' }));
    }
  }, [page]);

  return (
    <div className="min-h-screen w-full bg-[#02050a] text-white flex flex-col font-sans overflow-x-hidden relative">
      {/* Background Image / Gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#02050a] via-transparent to-[#02050a] z-10"></div>
        {/* Placeholder for Earth background */}
        <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-40 animate-float"></div>
        <div className="absolute inset-0 bg-blue-900/20 mix-blend-overlay"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-20 flex flex-wrap items-center justify-between gap-x-5 gap-y-4 px-6 py-6 sm:px-8">
        <button type="button" className="flex items-center gap-3 group cursor-pointer text-left" onClick={() => navigate('Landing Page')} aria-label="ClimaX home">
          <div className="w-8 h-8 text-blue-500 group-hover:scale-110 group-hover:rotate-90 transition-all duration-500 animate-pulse-glow">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              <path d="M12 0l2.5 8.5L23 12l-8.5 2.5L12 24l-2.5-8.5L1 12l8.5-2.5z" />
            </svg>
          </div>
          <div>
            <span className="text-xl font-bold tracking-wide group-hover:text-blue-400 transition-colors duration-300">ClimaX</span>
            <span className="text-[10px] text-blue-400 font-mono block -mt-1">ClimaX DGMR</span>
          </div>
        </button>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-gray-300">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => navigate(item.page)}
              aria-current={page === item.page ? 'page' : undefined}
              className={`${page === item.page ? 'text-white' : 'hover:text-blue-400'} hover:-translate-y-0.5 transition-all duration-300`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/Kathakali07/SIH2k26_PS26084/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-400/60 shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 transition-all duration-300 group"
          >
            <Smartphone size={14} className="group-hover:scale-110 transition-transform" />
            <span>Android APK</span>
            <Download size={13} className="opacity-80 group-hover:translate-y-0.5 transition-transform" />
          </a>
          <button
            type="button"
            onClick={onEnterApp}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full text-sm font-medium hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:scale-105 transition-all duration-300"
          >
            Get Started
          </button>
        </div>
      </nav>

      {page === 'About' ? (
        <main className="relative z-20 flex-1 flex items-center px-6 sm:px-16 animate-fade-up">
          <section className="w-full max-w-4xl rounded-3xl border border-blue-400/20 bg-[#080e1a]/85 p-7 sm:p-12 shadow-2xl backdrop-blur-md hover:-translate-y-2 hover:border-blue-500/40 hover:shadow-[0_15px_40px_rgba(37,99,235,0.15)] transition-all duration-500 group">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-blue-300 animate-fade-up delay-100">About ClimaX</p>
            <h1 className="mb-5 text-4xl font-extrabold leading-tight sm:text-5xl animate-fade-up delay-200">
              Understand storms.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 group-hover:from-blue-300 group-hover:to-purple-300 transition-colors duration-500">Prepare with clarity.</span>
            </h1>
            <p className="max-w-3xl text-base leading-relaxed text-gray-300 sm:text-lg animate-fade-up delay-300">
              ClimaX is a storm-monitoring and nowcasting prototype that brings storm tracks, hazard views, scenario ensembles, and impact-risk tools together in one interface.
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-400 animate-fade-up delay-400">
              This project is a demonstration. Its scenario and forecast values are simulated and should not be used as official weather warnings.
            </p>
            <div className="animate-fade-up delay-500">
              <button 
                type="button" 
                onClick={onEnterApp} 
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-blue-500 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] group/btn"
              >
                Explore the demo <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </section>
        </main>
      ) : (
      <>
      {/* Hero Section */}
      <main className="relative z-20 flex-1 flex flex-col md:flex-row items-center justify-between px-6 pt-4 pb-12 sm:px-16 sm:pt-4 sm:pb-16 w-full max-w-[1440px] mx-auto gap-10">
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <h1 className="text-4xl font-extrabold leading-tight mb-5 tracking-tight sm:text-5xl lg:text-6xl animate-fade-up delay-100">
            From Storms <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
              to Safer Tomorrows
            </span>
          </h1>
          <p className="text-gray-300 text-base mb-8 max-w-xl leading-relaxed sm:text-lg animate-fade-up delay-200">
            Operational deep generative AI nowcasting for severe thunderstorms, large hail, destructive downbursts, and flash cloudbursts with spatio-temporal uncertainty quantification.
          </p>
          <div className="flex flex-wrap items-center gap-4 animate-fade-up delay-300">
            <button 
              onClick={onEnterApp}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-full font-bold flex items-center gap-2 hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] hover:-translate-y-1 transition-all duration-300 group text-sm"
            >
              Launch Live Nowcast <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={onEnterApp}
              className="bg-[#111622]/80 backdrop-blur border border-gray-700 hover:bg-[#1e293b]/90 text-white px-7 py-3.5 rounded-full font-semibold flex items-center gap-2 hover:border-gray-500 hover:-translate-y-1 transition-all duration-300 group text-sm"
            >
              <Play fill="currentColor" size={14} className="text-blue-400 group-hover:text-blue-300 transition-colors" /> Interactive Demo
            </button>
            <a
              href="https://github.com/Kathakali07/SIH2k26_PS26084/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-emerald-600/90 via-teal-600/90 to-emerald-500/90 hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/40 shadow-[0_0_22px_rgba(16,185,129,0.3)] hover:shadow-[0_0_32px_rgba(16,185,129,0.5)] hover:-translate-y-1 transition-all duration-300 group"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <Smartphone size={16} className="text-emerald-100 group-hover:scale-110 transition-transform" />
              <span>Download Android APK</span>
              <Download size={14} className="text-emerald-200 group-hover:translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>
        <div className="w-full md:w-1/2 flex justify-center md:justify-end items-center relative animate-fade-up delay-400">
          <EarthGlobe />
        </div>
      </main>

      {/* Bottom Features */}
      <div className="relative z-20 px-6 pb-10 flex flex-col gap-6 sm:flex-row sm:px-16">
        {[
          { icon: <CloudLightning className="text-blue-400" size={28} />, title: 'Storm-as-an-Object\nTracking', desc: 'Objectified cell kinematics & lifecycle stages', page: 'Storm Objects' },
          { icon: <Activity className="text-purple-400" size={28} />, title: 'Multiple Possible\nFutures', desc: '16 DGMR Monte Carlo generative ensemble tracks', page: 'Multiple Futures' },
          { icon: <ShieldAlert className="text-amber-400" size={28} />, title: 'Hazard-Specific\nForecasting', desc: 'Discrete probabilities for Hail, Rain, Shear & Lightning', page: 'Hazard Forecast' },
          { icon: <AlertTriangle className="text-red-400" size={28} />, title: 'Impact Risk &\nCritical Assets', desc: 'Vulnerability mapping for airports, highways & dams', page: 'Impact Risk' }
        ].map((feat, i) => (
          <button
            type="button"
            key={feat.page}
            onClick={() => navigate(feat.page)}
            className="flex-1 bg-[#111622]/60 backdrop-blur-md border border-gray-800/60 p-5 rounded-2xl hover:bg-[#161e30]/90 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgba(37,99,235,0.15)] hover:border-blue-500/30 transition-all duration-300 group shadow-lg text-left animate-fade-up"
            style={{ animationDelay: `${300 + i * 100}ms` }}
          >
            <div className="text-3xl mb-4 group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300 origin-bottom-left">{feat.icon}</div>
            <h3 className="text-sm font-bold text-gray-200 group-hover:text-blue-400 transition-colors whitespace-pre-line leading-tight">
              {feat.title}
            </h3>
            <p className="text-[11px] text-gray-400 mt-1.5 leading-snug">{feat.desc}</p>
          </button>
        ))}
      </div>

      <section id="contact-section" className="relative z-20 scroll-mt-8 border-t border-gray-800/80 bg-[#060a12]/95 px-6 py-14 sm:px-16 sm:py-16 animate-fade-up">
        <div className="mx-auto max-w-[1440px]">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-blue-300">The people behind ClimaX</p>
          <h2 className="text-3xl font-extrabold sm:text-4xl">Meet our team</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-400">
            ClimaX brings storm tracking, hazard forecasting, and impact-risk insights into one experience. Connect with our team through the profiles below.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TEAM_MEMBERS.map((member) => (
              <article key={member.name} className="rounded-2xl border border-gray-800 bg-[#111622]/80 p-5 shadow-lg hover:-translate-y-1 hover:border-blue-500/30 transition-all duration-300 group">
                <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">{member.name}</h3>
                <p className="mt-1 break-all text-xs text-gray-400">{member.email || 'Email not provided'}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {member.email && (
                    <a href={`mailto:${member.email}`} className="inline-flex items-center gap-2 rounded-lg border border-gray-700 px-3 py-2 text-xs text-gray-300 transition-colors hover:border-blue-400 hover:text-white">
                      <Mail size={14} /> Email
                    </a>
                  )}
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-gray-700 px-3 py-2 text-xs text-gray-300 transition-colors hover:border-blue-400 hover:text-white">
                      <span aria-hidden="true" className="font-bold text-blue-300">in</span> LinkedIn
                    </a>
                  )}
                  {member.github && (
                    <a href={member.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-gray-700 px-3 py-2 text-xs text-gray-300 transition-colors hover:border-blue-400 hover:text-white">
                      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current text-gray-200 group-hover:text-white transition-colors">
                        <path d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 .1.75 2.2 2.66 1.24.1-.73.4-1.23.72-1.51-2.5-.29-5.13-1.25-5.13-5.57 0-1.23.44-2.23 1.16-3.02-.12-.29-.5-1.43.11-2.99 0 0 .95-.3 3.08 1.15a10.7 10.7 0 0 1 5.6 0c2.14-1.45 3.08-1.15 3.08-1.15.61 1.56.23 2.7.12 2.99.72.79 1.15 1.79 1.15 3.02 0 4.33-2.63 5.28-5.14 5.56.4.35.76 1.02.76 2.06v3.05c0 .3.2.65.77.54A11.2 11.2 0 0 0 12 .8Z" />
                      </svg>
                      GitHub
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      </>
      )}
    </div>
  );
}
