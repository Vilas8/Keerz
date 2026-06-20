import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import WhoIsItFor from './components/WhoIsItFor';
import SkillsTrained from './components/SkillsTrained';
import SurveyForm from './components/SurveyForm';
import SuccessPopup from './components/SuccessPopup';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';

function App() {
  const [currentTab, setCurrentTab] = useState('landing'); // 'landing' or 'dashboard'
  const [submittedLead, setSubmittedLead] = useState(null); // stores submitted form data for popup

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCtaClick = () => {
    scrollToSection('survey');
  };

  const handleFormSubmitSuccess = (leadData) => {
    setSubmittedLead(leadData);
  };

  return (
    <div className="min-h-screen bg-navy-dark text-slate-100 flex flex-col font-sans selection:bg-gold-main selection:text-navy-dark">
      {/* Sticky Premium Header */}
      <Header 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        scrollToSection={scrollToSection} 
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        {currentTab === 'landing' ? (
          <div className="relative">
            {/* Ambient background decor items */}
            <div className="absolute top-[10%] left-[5%] w-[35rem] h-[35rem] bg-sky-main/5 rounded-full blur-[120px] pointer-events-none z-0" />
            <div className="absolute bottom-[20%] right-[5%] w-[40rem] h-[40rem] bg-gold-main/5 rounded-full blur-[150px] pointer-events-none z-0" />

            {/* Sections */}
            <Hero onCtaClick={handleCtaClick} />
            <About />
            <WhoIsItFor />
            <SkillsTrained />
            <SurveyForm onSubmitSuccess={handleFormSubmitSuccess} />
          </div>
        ) : (
          <div className="animate-fade-in">
            <Dashboard />
          </div>
        )}
      </main>

      {/* Modern Trust Footer */}
      <Footer 
        setCurrentTab={setCurrentTab} 
        scrollToSection={scrollToSection} 
      />

      {/* Success Boarding Pass Dialog Overlay */}
      {submittedLead && (
        <SuccessPopup 
          leadData={submittedLead} 
          onClose={() => setSubmittedLead(null)} 
        />
      )}
    </div>
  );
}

export default App;
