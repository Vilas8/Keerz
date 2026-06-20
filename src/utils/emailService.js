import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_CANDIDATE = import.meta.env.VITE_EMAILJS_TEMPLATE_CANDIDATE;
const TEMPLATE_ADMIN = import.meta.env.VITE_EMAILJS_TEMPLATE_ADMIN;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const sendEmails = async (leadData) => {
  // If not configured, log a warning and return simulated success
  if (!SERVICE_ID || !TEMPLATE_CANDIDATE || !TEMPLATE_ADMIN || !PUBLIC_KEY) {
    console.warn(
      'EmailJS is not fully configured. To enable live emails, set the following env variables in your .env file:\n' +
      'VITE_EMAILJS_SERVICE_ID\n' +
      'VITE_EMAILJS_TEMPLATE_CANDIDATE\n' +
      'VITE_EMAILJS_TEMPLATE_ADMIN\n' +
      'VITE_EMAILJS_PUBLIC_KEY'
    );
    return { success: true, message: 'Emails simulated in console (development fallback).' };
  }

  try {
    // 1. Send Email to Candidate
    const candidatePromise = emailjs.send(
      SERVICE_ID,
      TEMPLATE_CANDIDATE,
      {
        to_email: leadData.email,
        passenger_name: leadData.full_name,
        training_city: leadData.preferred_training_city,
        state: leadData.state,
        age_group: leadData.age_group,
        mode: leadData.training_mode,
        timeline: leadData.joining_timeline,
        seat_assign: `#${leadData.seriousness_score || 5}A-LEAD`,
        contact_email: 'keerthanatm2465@gmail.com'
      },
      PUBLIC_KEY
    );

    // 2. Send Email to Admin
    const adminPromise = emailjs.send(
      SERVICE_ID,
      TEMPLATE_ADMIN,
      {
        to_email: 'keerthanatm2465@gmail.com',
        passenger_name: leadData.full_name,
        mobile: leadData.mobile,
        whatsapp: leadData.whatsapp || 'N/A',
        email: leadData.email,
        age_group: leadData.age_group,
        qualification: leadData.qualification,
        state: leadData.state,
        city: leadData.city,
        preferred_training_city: leadData.preferred_training_city,
        training_mode: leadData.training_mode,
        joining_timeline: leadData.joining_timeline,
        seriousness_score: leadData.seriousness_score,
        careers: Array.isArray(leadData.selected_careers) ? leadData.selected_careers.join(', ') : leadData.selected_careers,
        topics: Array.isArray(leadData.selected_training_topics) ? leadData.selected_training_topics.join(', ') : leadData.selected_training_topics,
        biggest_challenge: leadData.biggest_challenge || 'None shared'
      },
      PUBLIC_KEY
    );

    await Promise.all([candidatePromise, adminPromise]);
    return { success: true, message: 'Emails sent successfully.' };
  } catch (err) {
    console.error('Error sending emails via EmailJS:', err);
    return { success: false, error: err };
  }
};
