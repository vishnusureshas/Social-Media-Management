import { useState } from 'react';
import LandingNavbar from '../components/landing/LandingNavbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import WhyLove from '../components/landing/WhyLove';
import Community from '../components/landing/Community';
import FinalCta from '../components/landing/FinalCta';
import LandingFooter from '../components/landing/LandingFooter';

const Landing = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem('vibely_theme') || 'aurora');

  const toggleTheme = () => {
    const next = theme === 'aurora' ? 'neon' : 'aurora';
    setTheme(next);
    localStorage.setItem('vibely_theme', next);
  };

  return (
    <div className="landing relative min-h-screen overflow-x-clip" data-theme={theme}>
      <LandingNavbar onToggleTheme={toggleTheme} />
      <main>
        <Hero />
        <Features />
        <WhyLove />
        <Community />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
};

export default Landing;