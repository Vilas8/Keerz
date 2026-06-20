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
import AdminLoginModal from './components/AdminLoginModal';

function App() {
  const [currentTab, setCurrentTab] = useState(() => {
    try {
      return sessionStorage.getItem('keerz_current_tab') || 'landing';
    } catch {
      return 'landing';
    }
  });
  const [submittedLead, setSubmittedLead] = useState(null); // stores submitted form data for popup
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('keerz_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [showLoginModal, setShowLoginModal] = useState(false);

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

  const handleSetTab = (tab) => {
    if (tab === 'dashboard' && !isAdminAuthenticated) {
      setShowLoginModal(true);
    } else {
      setCurrentTab(tab);
      try {
        sessionStorage.setItem('keerz_current_tab', tab);
      } catch (e) {
        console.error('Session write error:', e);
      }
    }
  };

  return (
    <div className="min-h-screen bg-navy-dark text-slate-100 flex flex-col font-sans selection:bg-gold-main selection:text-navy-dark">
      {/* Sticky Premium Header */}
      <Header 
        currentTab={currentTab} 
        setCurrentTab={handleSetTab} 
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
        setCurrentTab={handleSetTab} 
        scrollToSection={scrollToSection} 
      />

      {/* Success Boarding Pass Dialog Overlay */}
      {submittedLead && (
        <SuccessPopup 
          leadData={submittedLead} 
          onClose={() => setSubmittedLead(null)} 
        />
      )}

      {/* Admin Login Dialog */}
      <AdminLoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => {
          setIsAdminAuthenticated(true);
          setCurrentTab('dashboard');
          try {
            sessionStorage.setItem('keerz_admin_auth', 'true');
            sessionStorage.setItem('keerz_current_tab', 'dashboard');
          } catch (e) {
            console.error('Session write error:', e);
          }
        }}
      />
    </div>
  );
}

export default App;

