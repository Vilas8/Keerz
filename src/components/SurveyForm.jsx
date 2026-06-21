import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { 
  Plane, User, Phone, Mail, MapPin, 
  GraduationCap, Calendar, Compass, Clock, 
  HelpCircle, ShieldCheck, AlertCircle, Loader2, Check 
} from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry', 'Andaman & Nicobar Islands', 
  'Chandigarh', 'Dadra & Nagar Haveli and Daman & Diu', 'Lakshadweep'
].sort();

export default function SurveyForm({ onSubmitSuccess }) {
  // Form values state
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    whatsapp: '',
    email: '',
    ageGroup: '',
    qualification: '',
    state: '',
    city: '',
    careerInterest: '',
    selectedCareers: [],
    joiningTimeline: '',
    trainingMode: '',
    preferredTrainingCity: 'Nagamangala, Karnataka',
    seriousnessScore: 3,
    selectedTrainingTopics: [],
    biggestChallenge: '',
    consent: false
  });

  // UI state
  const [stateSearch, setStateSearch] = useState('');
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowStateDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter states based on search query
  const filteredStates = INDIAN_STATES.filter(st => 
    st.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const handleStateSelect = (stateName) => {
    setFormData(prev => ({ ...prev, state: stateName }));
    setStateSearch(stateName);
    setShowStateDropdown(false);
    if (errors.state) {
      setErrors(prev => ({ ...prev, state: '' }));
    }
  };

  const handleCheckboxChange = (field, value) => {
    setFormData(prev => {
      const current = prev[field] || [];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const handleTextChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear validation error when typing/selecting
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    
    // Mobile Validation (10 digits)
    const mobileClean = formData.mobile.replace(/\D/g, '');
    if (!formData.mobile) {
      newErrors.mobile = 'Mobile Number is required';
    } else if (mobileClean.length !== 10) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number';
    }

    // WhatsApp Validation (if entered, should be 10 digits)
    if (formData.whatsapp) {
      const waClean = formData.whatsapp.replace(/\D/g, '');
      if (waClean.length !== 10) {
        newErrors.whatsapp = 'Enter a valid 10-digit number or leave blank';
      }
    }

    // Email Validation
    if (!formData.email) {
      newErrors.email = 'Email Address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.ageGroup) newErrors.ageGroup = 'Please select your age group';
    if (!formData.qualification) newErrors.qualification = 'Please select your highest qualification';
    if (!formData.state) newErrors.state = 'Please select your state';
    if (!formData.city.trim()) newErrors.city = 'Please enter your city';
    if (!formData.careerInterest) newErrors.careerInterest = 'Please select your cabin crew interest level';
    if (formData.selectedCareers.length === 0) newErrors.selectedCareers = 'Please select at least one option';
    if (!formData.joiningTimeline) newErrors.joiningTimeline = 'Please select when you would like to join';
    if (!formData.trainingMode) newErrors.trainingMode = 'Please select your preferred training mode';
    if (!formData.preferredTrainingCity.trim()) newErrors.preferredTrainingCity = 'Please enter preferred training city';
    if (!formData.consent) newErrors.consent = 'You must agree to the research consent checkbox';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      // Scroll to first error
      const firstErrorKey = Object.keys(errors)[0];
      const element = document.getElementsByName(firstErrorKey)[0];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setLoading(true);

    try {
      const payload = {
        full_name: formData.fullName,
        mobile: formData.mobile,
        whatsapp: formData.whatsapp || null,
        email: formData.email,
        age_group: formData.ageGroup,
        qualification: formData.qualification,
        state: formData.state,
        city: formData.city,
        career_interest: formData.careerInterest,
        selected_careers: formData.selectedCareers,
        joining_timeline: formData.joiningTimeline,
        training_mode: formData.trainingMode,
        preferred_training_city: formData.preferredTrainingCity,
        seriousness_score: parseInt(formData.seriousnessScore, 10),
        selected_training_topics: formData.selectedTrainingTopics,
        biggest_challenge: formData.biggestChallenge || null,
        consent: formData.consent
      };

      const { data, error } = await supabase.from('aviation_leads').insert([payload]);

      if (error) throw error;

      // Celebrate & trigger success view
      if (typeof window !== 'undefined') {
        import('canvas-confetti').then((confetti) => {
          confetti.default({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#D4AF37', '#0EA5E9', '#079992', '#ffffff']
          });
        });
      }

      onSubmitSuccess(payload);
    } catch (error) {
      console.error('Error inserting survey response:', error);
      setSubmitError('Failed to submit response. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="survey" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      
      <div className="text-center mb-12">
        <span className="text-xs font-semibold tracking-widest text-gold-main uppercase block mb-2">
          Validation Form
        </span>
        <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          Cabin Crew Career Interest Survey
        </h2>
        <p className="text-slate-300 font-light max-w-2xl mx-auto text-sm sm:text-base">
          This is research to validate launch interest. Completing this survey helps us plan program offerings in your area. This is not an admission or enrollment form.
        </p>
      </div>

      {/* Boarding Pass Styled Container */}
      <form 
        onSubmit={handleSubmit}
        className="relative bg-slate-900 border-2 border-gold-main/30 rounded-3xl shadow-2xl overflow-hidden ticket-left-cutout ticket-right-cutout"
      >
        {/* Ticket Header (Branding block) */}
        <div className="bg-gradient-to-r from-navy-dark via-navy-medium to-sky-main p-6 sm:p-8 text-white border-b border-gold-main/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <Plane className="w-5 h-5 text-gold-main transform -rotate-45" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-gold-light font-bold">Boarding Pass Survey</span>
              <h3 className="font-display font-bold text-lg sm:text-xl tracking-wider -mt-1">KEERZ TRAINING ACADEMY</h3>
            </div>
          </div>
          <div className="text-right sm:text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto text-xs font-mono text-slate-300 bg-black/25 px-4 py-2 rounded-xl border border-white/5">
            <div>FLIGHT: <span className="text-gold-main font-bold">AA-INDIA-2026</span></div>
            <div className="hidden sm:block">GATE: <span className="text-sky-light font-bold">RESEARCH</span></div>
            <div className="hidden sm:block">SEAT: <span className="text-white font-bold">ANY</span></div>
          </div>
        </div>

        {/* Boarding Pass Body */}
        <div className="p-6 sm:p-10 md:p-12 space-y-10 bg-slate-900/90">
          
          {/* STEP 1: Personal Details */}
          <div>
            <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-2">
              <User className="w-5 h-5 text-gold-main" />
              <h4 className="font-display font-bold text-lg text-white">01. Personal Details</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Full Name <span className="text-gold-main">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleTextChange}
                    placeholder="Enter your full name"
                    className={`w-full pl-10 pr-4 py-3 bg-navy-dark/40 border ${errors.fullName ? 'border-red-500' : 'border-white/10'} rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-gold-main transition-colors text-sm`}
                  />
                </div>
                {errors.fullName && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.fullName}</p>}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Email Address <span className="text-gold-main">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleTextChange}
                    placeholder="Enter your email address"
                    className={`w-full pl-10 pr-4 py-3 bg-navy-dark/40 border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-gold-main transition-colors text-sm`}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.email}</p>}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Mobile Number <span className="text-gold-main">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleTextChange}
                    placeholder="10-digit mobile number"
                    className={`w-full pl-10 pr-4 py-3 bg-navy-dark/40 border ${errors.mobile ? 'border-red-500' : 'border-white/10'} rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-gold-main transition-colors text-sm`}
                  />
                </div>
                {errors.mobile && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.mobile}</p>}
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  WhatsApp Number <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Phone className="w-4 h-4 text-emerald-500/80" />
                  </span>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleTextChange}
                    placeholder="Same as mobile or different"
                    className={`w-full pl-10 pr-4 py-3 bg-navy-dark/40 border ${errors.whatsapp ? 'border-red-500' : 'border-white/10'} rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-gold-main transition-colors text-sm`}
                  />
                </div>
                {errors.whatsapp && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.whatsapp}</p>}
              </div>

            </div>
          </div>

          {/* STEP 2: Basic Eligibility */}
          <div>
            <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-2">
              <GraduationCap className="w-5 h-5 text-gold-main" />
              <h4 className="font-display font-bold text-lg text-white">02. Basic Eligibility</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Age Group */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Age Group <span className="text-gold-main">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <select
                    name="ageGroup"
                    value={formData.ageGroup}
                    onChange={handleTextChange}
                    className={`w-full pl-10 pr-8 py-3 bg-navy-dark/40 border ${errors.ageGroup ? 'border-red-500' : 'border-white/10'} rounded-xl text-white appearance-none focus:outline-none focus:border-gold-main transition-colors text-sm`}
                  >
                    <option value="" disabled className="bg-slate-900 text-slate-400">Select Age Group</option>
                    <option value="18-20" className="bg-slate-900">18 - 20 Years</option>
                    <option value="21-23" className="bg-slate-900">21 - 23 Years</option>
                    <option value="24-27" className="bg-slate-900">24 - 27 Years</option>
                  </select>
                </div>
                {errors.ageGroup && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.ageGroup}</p>}
              </div>

              {/* Highest Qualification */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Highest Qualification <span className="text-gold-main">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <GraduationCap className="w-4 h-4" />
                  </span>
                  <select
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleTextChange}
                    className={`w-full pl-10 pr-8 py-3 bg-navy-dark/40 border ${errors.qualification ? 'border-red-500' : 'border-white/10'} rounded-xl text-white appearance-none focus:outline-none focus:border-gold-main transition-colors text-sm`}
                  >
                    <option value="" disabled className="bg-slate-900 text-slate-400">Select Qualification</option>
                    <option value="12th Pass" className="bg-slate-900">12th Pass</option>
                    <option value="Diploma" className="bg-slate-900">Diploma</option>
                    <option value="Graduate" className="bg-slate-900">Graduate</option>
                    <option value="Post Graduate" className="bg-slate-900">Post Graduate</option>
                  </select>
                </div>
                {errors.qualification && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.qualification}</p>}
              </div>

            </div>
          </div>

          {/* STEP 3: Location Insights */}
          <div>
            <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-2">
              <MapPin className="w-5 h-5 text-gold-main" />
              <h4 className="font-display font-bold text-lg text-white">03. Location Insights</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* State (Searchable Dropdown) */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  State <span className="text-gold-main">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <MapPin className="w-4 h-4 text-sky-light/80" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search/Select State"
                    value={stateSearch}
                    onChange={(e) => {
                      setStateSearch(e.target.value);
                      setShowStateDropdown(true);
                      if (formData.state) {
                        setFormData(prev => ({ ...prev, state: '' }));
                      }
                    }}
                    onFocus={() => setShowStateDropdown(true)}
                    className={`w-full pl-10 pr-4 py-3 bg-navy-dark/40 border ${errors.state ? 'border-red-500' : 'border-white/10'} rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-gold-main transition-colors text-sm`}
                  />
                </div>

                {/* Dropdown Box */}
                {showStateDropdown && (
                  <div className="absolute z-20 w-full mt-1.5 max-h-48 overflow-y-auto bg-slate-950 border border-white/10 rounded-xl shadow-xl scrollbar-thin">
                    {filteredStates.length > 0 ? (
                      filteredStates.map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleStateSelect(st)}
                          className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-gold-main hover:text-navy-dark transition-colors flex items-center justify-between"
                        >
                          <span>{st}</span>
                          {formData.state === st && <Check className="w-4 h-4" />}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-2.5 text-xs text-slate-500 italic">No states found</div>
                    )}
                  </div>
                )}
                {errors.state && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.state}</p>}
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  City <span className="text-gold-main">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <MapPin className="w-4 h-4 text-sky-light/80" />
                  </span>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleTextChange}
                    placeholder="Enter your current city"
                    className={`w-full pl-10 pr-4 py-3 bg-navy-dark/40 border ${errors.city ? 'border-red-500' : 'border-white/10'} rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-gold-main transition-colors text-sm`}
                  />
                </div>
                {errors.city && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.city}</p>}
              </div>

            </div>
          </div>

          {/* STEP 4: Career Interest */}
          <div>
            <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-2">
              <Compass className="w-5 h-5 text-gold-main" />
              <h4 className="font-display font-bold text-lg text-white">04. Career Interest</h4>
            </div>

            <div className="space-y-6">
              {/* Active interest radio buttons */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  Are you interested in becoming a Cabin Crew / Air Hostess? <span className="text-gold-main">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {['Yes', 'Maybe', 'Exploring Options'].map(option => (
                    <label 
                      key={option}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200 text-sm ${formData.careerInterest === option ? 'border-gold-main bg-gold-main/10 text-white font-bold' : 'border-white/5 bg-navy-dark/20 text-slate-400 hover:border-white/10'}`}
                    >
                      <input
                        type="radio"
                        name="careerInterest"
                        value={option}
                        checked={formData.careerInterest === option}
                        onChange={handleTextChange}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.careerInterest === option ? 'border-gold-main' : 'border-slate-500'}`}>
                        {formData.careerInterest === option && <div className="w-2.5 h-2.5 rounded-full bg-gold-main" />}
                      </div>
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
                {errors.careerInterest && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.careerInterest}</p>}
              </div>

              {/* Career types checkboxes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  Which aviation careers interest you most? <span className="text-gold-main">*</span> <span className="text-[10px] text-slate-400 font-normal lowercase">(select all that apply)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    'Air Hostess', 'Ground Staff', 
                    'Airport Operations', 'Customer Service Executive', 'Not Sure Yet'
                  ].map(career => {
                    const isChecked = formData.selectedCareers.includes(career);
                    return (
                      <label 
                        key={career}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200 text-sm ${isChecked ? 'border-sky-light bg-sky-main/10 text-white font-bold' : 'border-white/5 bg-navy-dark/20 text-slate-400 hover:border-white/10'}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCheckboxChange('selectedCareers', career)}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${isChecked ? 'border-sky-light bg-sky-light' : 'border-slate-500'}`}>
                          {isChecked && <Check className="w-3 h-3 text-navy-dark font-extrabold" />}
                        </div>
                        <span>{career}</span>
                      </label>
                    );
                  })}
                </div>
                {errors.selectedCareers && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.selectedCareers}</p>}
              </div>
            </div>
          </div>

          {/* STEP 5: Training Demand Research */}
          <div>
            <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-2">
              <Clock className="w-5 h-5 text-gold-main" />
              <h4 className="font-display font-bold text-lg text-white">05. Training Demand Research</h4>
            </div>

            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Timeline Option */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                    If training becomes available, when would you like to join? <span className="text-gold-main">*</span>
                  </label>
                  <div className="space-y-2.5">
                    {[
                      'Immediately (0-1 Month)', 
                      'Within 3 Months', 
                      'Within 6 Months', 
                      'Just Exploring'
                    ].map(timeline => (
                      <label 
                        key={timeline}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border cursor-pointer transition-all duration-200 text-xs sm:text-sm ${formData.joiningTimeline === timeline ? 'border-gold-main bg-gold-main/15 text-white font-bold' : 'border-white/5 bg-navy-dark/20 text-slate-400 hover:border-white/10'}`}
                      >
                        <input
                          type="radio"
                          name="joiningTimeline"
                          value={timeline}
                          checked={formData.joiningTimeline === timeline}
                          onChange={handleTextChange}
                          className="sr-only"
                        />
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${formData.joiningTimeline === timeline ? 'border-gold-main' : 'border-slate-500'}`}>
                          {formData.joiningTimeline === timeline && <div className="w-2 h-2 rounded-full bg-gold-main" />}
                        </div>
                        <span>{timeline}</span>
                      </label>
                    ))}
                  </div>
                  {errors.joiningTimeline && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.joiningTimeline}</p>}
                </div>

                {/* Training Mode */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                    Preferred Training Mode <span className="text-gold-main">*</span>
                  </label>
                  <div className="space-y-2.5">
                    {['Offline', 'Online', 'Hybrid', 'No Preference'].map(mode => (
                      <label 
                        key={mode}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border cursor-pointer transition-all duration-200 text-xs sm:text-sm ${formData.trainingMode === mode ? 'border-sky-light bg-sky-main/15 text-white font-bold' : 'border-white/5 bg-navy-dark/20 text-slate-400 hover:border-white/10'}`}
                      >
                        <input
                          type="radio"
                          name="trainingMode"
                          value={mode}
                          checked={formData.trainingMode === mode}
                          onChange={handleTextChange}
                          className="sr-only"
                        />
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${formData.trainingMode === mode ? 'border-sky-light' : 'border-slate-500'}`}>
                          {formData.trainingMode === mode && <div className="w-2 h-2 rounded-full bg-sky-light" />}
                        </div>
                        <span>{mode} Mode</span>
                      </label>
                    ))}
                  </div>
                  {errors.trainingMode && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.trainingMode}</p>}
                </div>

              </div>

              {/* Preferred training city */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Training Location <span className="text-gold-main">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <MapPin className="w-4 h-4 text-gold-main/80" />
                  </span>
                  <input
                    type="text"
                    name="preferredTrainingCity"
                    value={formData.preferredTrainingCity}
                    readOnly
                    className="w-full pl-10 pr-4 py-3 bg-navy-dark/60 border border-gold-main/30 rounded-xl text-slate-300 font-semibold cursor-not-allowed text-sm"
                  />
                </div>
                <p className="text-slate-400 text-[10px] mt-1.5 leading-relaxed">
                  Note: Keerz Academy training is hosted exclusively at our Nagamangala campus in Karnataka.
                </p>
              </div>

            </div>
          </div>

          {/* STEP 6: Seriousness Score & Topics */}
          <div>
            <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-2">
              <HelpCircle className="w-5 h-5 text-gold-main" />
              <h4 className="font-display font-bold text-lg text-white">06. Career Seriousness & Topic Focus</h4>
            </div>

            <div className="space-y-8">
              
              {/* Seriousness Slider */}
              <div className="glass-panel p-6 rounded-2xl border border-white/5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4 text-center sm:text-left">
                  How serious are you about pursuing a Cabin Crew career? <span className="text-gold-main">*</span>
                </label>
                
                <div className="px-2 sm:px-6 py-2">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    name="seriousnessScore"
                    value={formData.seriousnessScore}
                    onChange={handleTextChange}
                    className="w-full h-2 bg-navy-dark rounded-lg appearance-none cursor-pointer accent-gold-main focus:outline-none"
                  />
                  
                  <div className="flex justify-between mt-3 text-xs font-semibold text-slate-400 px-1">
                    <span className={formData.seriousnessScore == 1 ? 'text-gold-main font-bold scale-105' : ''}>1 (Just Curious)</span>
                    <span className={formData.seriousnessScore == 2 ? 'text-gold-main font-bold scale-105' : ''}>2</span>
                    <span className={formData.seriousnessScore == 3 ? 'text-gold-main font-bold scale-105' : ''}>3 (Interested)</span>
                    <span className={formData.seriousnessScore == 4 ? 'text-gold-main font-bold scale-105' : ''}>4</span>
                    <span className={formData.seriousnessScore == 5 ? 'text-gold-main font-bold scale-105' : ''}>5 (Fully Committed)</span>
                  </div>
                </div>
              </div>

              {/* Topics Checkbox Grid */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  Which areas would you like training in? <span className="text-[10px] text-slate-400 font-normal lowercase">(select all that apply)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    'Grooming & Presentation', 'Communication Skills', 'Public Speaking', 
                    'Personality Development', 'Interview Preparation', 'Aviation Industry Knowledge', 
                    'English Speaking Skills', 'Confidence Building'
                  ].map(topic => {
                    const isChecked = formData.selectedTrainingTopics.includes(topic);
                    return (
                      <label 
                        key={topic}
                        className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border cursor-pointer transition-all duration-200 text-xs sm:text-sm ${isChecked ? 'border-gold-main bg-gold-main/10 text-white font-bold' : 'border-white/5 bg-navy-dark/20 text-slate-400 hover:border-white/10'}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCheckboxChange('selectedTrainingTopics', topic)}
                          className="sr-only"
                        />
                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${isChecked ? 'border-gold-main bg-gold-main' : 'border-slate-500'}`}>
                          {isChecked && <Check className="w-2.5 h-2.5 text-navy-dark font-black" />}
                        </div>
                        <span>{topic}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* STEP 7: Challenges Textarea */}
          <div>
            <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-2">
              <HelpCircle className="w-5 h-5 text-gold-main" />
              <h4 className="font-display font-bold text-lg text-white">07. Challenges & Feedback</h4>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                What is the biggest challenge stopping you from pursuing a Cabin Crew career? <span className="text-slate-400 font-normal lowercase">(Optional)</span>
              </label>
              <textarea
                name="biggestChallenge"
                value={formData.biggestChallenge}
                onChange={handleTextChange}
                rows="4"
                placeholder="Examples: Lack of confidence, Communication skills, Financial concerns, Lack of guidance, Family support, Interview preparation..."
                className="w-full px-4 py-3 bg-navy-dark/40 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-gold-main transition-colors text-sm resize-y"
              />
            </div>
          </div>

          {/* STEP 8: Consent & Submission */}
          <div className="pt-6 border-t border-white/5 space-y-6">
            
            {/* Consent checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group select-none">
              <input
                type="checkbox"
                name="consent"
                checked={formData.consent}
                onChange={handleTextChange}
                className="sr-only"
              />
              <div className={`w-5 h-5 mt-0.5 rounded border flex items-center justify-center shrink-0 transition-colors ${formData.consent ? 'border-gold-main bg-gold-main' : 'border-slate-500 group-hover:border-slate-400'}`}>
                {formData.consent && <Check className="w-3.5 h-3.5 text-navy-dark font-black" />}
              </div>
              <span className="text-xs text-slate-300 leading-relaxed font-medium">
                I agree to be contacted regarding future aviation training programs, surveys, updates, and career guidance opportunities. *
              </span>
            </label>
            {errors.consent && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.consent}</p>}

            {/* Error alerts */}
            {submitError && (
              <div className="flex items-center gap-2.5 p-4 rounded-xl bg-red-950/60 border border-red-500/30 text-red-200 text-sm">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Submit button */}
            <div className="pt-4 flex flex-col items-center">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-4 rounded-xl bg-gradient-to-r from-gold-main to-gold-light text-navy-dark font-bold text-lg shadow-xl shadow-gold-main/20 hover:from-gold-light hover:to-white hover:shadow-gold-main/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-navy-dark" />
                    <span>Processing Boarding Pass...</span>
                  </>
                ) : (
                  <>
                    <Plane className="w-5 h-5 text-navy-dark transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    <span>Join the Aviation Interest List</span>
                  </>
                )}
              </button>
              
              <div className="flex items-center gap-2.5 mt-4 text-[10px] text-slate-500 font-mono tracking-widest uppercase">
                <ShieldCheck className="w-4 h-4 text-sky-light/60" />
                <span>Secure Data Verification - Privacy Secured</span>
              </div>
            </div>

          </div>

        </div>

        {/* Boarding Pass Ticket Footer Graphic (Barcode) */}
        <div className="bg-slate-950 p-6 flex flex-col sm:flex-row items-center justify-between border-t border-white/5 opacity-80 gap-4">
          <div className="flex flex-col items-center sm:items-start text-[10px] font-mono text-slate-500 tracking-wider">
            <span>RESEARCH REFERENCE ID: #{Math.floor(100000 + Math.random() * 900000)}</span>
            <span>SYSTEM GATEWAY: ASIA/KOLKATA</span>
          </div>
          
          {/* Simulated Barcode */}
          <div className="flex items-center gap-0.5 bg-white p-2.5 rounded-md shadow-inner h-11 shrink-0 overflow-hidden">
            {[1,3,2,1,4,1,2,3,1,2,1,4,2,1,3,1,1,2,4,1,2,1,3,1,1,2,3,1].map((width, idx) => (
              <div 
                key={idx} 
                className="bg-black h-full shrink-0" 
                style={{ width: `${width}px`, opacity: idx % 6 === 0 ? 0.3 : 0.9 }} 
              />
            ))}
          </div>
        </div>

      </form>
    </section>
  );
}
