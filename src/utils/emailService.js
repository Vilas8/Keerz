export const sendEmails = async (leadData, ticketImageBase64 = null) => {
  try {
    // 1. Fetch credentials dynamically from the server
    const configRes = await fetch('/api/email-config');
    if (!configRes.ok) {
      throw new Error('Failed to load email configuration from server.');
    }
    const { user, pass } = await configRes.json();

    // 2. Prepare attachments
    const attachments = [];
    if (ticketImageBase64) {
      attachments.push({
        name: `Keerz_Boarding_Pass_${leadData.full_name.replace(/\s+/g, '_')}.png`,
        data: ticketImageBase64
      });
    }

    // Helper function to send email via SMTPJS HTTP endpoint directly via fetch
    const postEmail = async (to, subject, htmlBody) => {
      const payload = {
        Host: "smtp.gmail.com",
        Username: user,
        Password: pass,
        To: to,
        From: user,
        Subject: subject,
        Body: htmlBody,
        Attachments: attachments,
        Action: "Send",
        nocache: Math.floor(1e6 * Math.random() + 1)
      };

      const response = await fetch("https://smtpjs.com/v3/smtpjs.aspx?", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status} from SMTP relay.`);
      }

      const text = await response.text();
      return text;
    };

    // 3. Send Email to Candidate (with Ticket Attachment)
    const candidateBodyHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; color: #0f172a; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #079992; margin: 0; font-size: 24px; letter-spacing: 1px;">KEERZ AVIATION ACADEMY</h2>
          <span style="font-size: 10px; color: #AA7C11; letter-spacing: 2px; font-weight: bold; text-transform: uppercase;">Interest List Confirmed</span>
        </div>
        
        <p>Dear <strong>${leadData.full_name}</strong>,</p>
        
        <p>Thank you for your valuable support in completing our aviation training survey! We are thrilled to connect with aspiring professionals like you.</p>
        
        <p>We have successfully registered your interest in the future <strong>Keerz Cabin Crew Academy</strong>. Your official <strong>Boarding Survey Pass</strong> is attached to this email for your reference.</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 25px 0;">
          <h4 style="margin-top: 0; color: #079992; margin-bottom: 15px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">Registration Details</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 6px 0; color: #64748b; width: 40%;">Passenger Name:</td><td style="padding: 6px 0; font-weight: bold;">${leadData.full_name}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b; width: 40%;">Training City:</td><td style="padding: 6px 0; font-weight: bold; color: #079992;">Nagamangala, Karnataka</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b; width: 40%;">Age Group:</td><td style="padding: 6px 0; font-weight: bold;">${leadData.age_group} Yrs</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b; width: 40%;">Training Mode:</td><td style="padding: 6px 0; font-weight: bold;">${leadData.training_mode}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b; width: 40%;">Seat Assignment:</td><td style="padding: 6px 0; font-weight: bold; color: #059669;">#${leadData.seriousness_score || 5}A-LEAD</td></tr>
          </table>
        </div>

        <p>Our training city is centered in <strong>Nagamangala, Karnataka</strong>, and we are planning curriculum launches designed to jumpstart your career. We will notify you via email and phone as soon as cohort schedules and admission processes launch!</p>
        
        <p>Thank you again for your time and feedback.</p>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #cbd5e1; font-size: 12px; color: #64748b; text-align: center;">
          <strong>Keerz Aviation Academy</strong><br/>
          Contact: keerthanatm2465@gmail.com
        </div>
      </div>
    `;

    // 4. Send Email to Admin (with Details)
    const adminBodyHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; color: #0f172a; background-color: #ffffff;">
        <h2 style="color: #079992; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-top: 0;">New Response Received</h2>
        <p>A new boarding pass survey has been submitted. Here are the details:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
          <tr style="background-color: #f8fafc;"><td style="padding: 10px; font-weight: bold; width: 40%; border-bottom: 1px solid #e2e8f0;">Name:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${leadData.full_name}</td></tr>
          <tr><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Mobile:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${leadData.mobile}</td></tr>
          <tr style="background-color: #f8fafc;"><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">WhatsApp:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${leadData.whatsapp || 'Same / None'}</td></tr>
          <tr><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Email:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${leadData.email}</td></tr>
          <tr style="background-color: #f8fafc;"><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Age Group:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${leadData.age_group} Yrs</td></tr>
          <tr><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Qualification:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${leadData.qualification}</td></tr>
          <tr style="background-color: #f8fafc;"><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">State:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${leadData.state}</td></tr>
          <tr><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">City:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${leadData.city}</td></tr>
          <tr style="background-color: #f8fafc;"><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Training Mode:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${leadData.training_mode}</td></tr>
          <tr><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Timeline:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${leadData.joining_timeline}</td></tr>
          <tr style="background-color: #f8fafc;"><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Seriousness Score:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #079992;">${leadData.seriousness_score} / 5</td></tr>
          <tr><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Career Interests:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${Array.isArray(leadData.selected_careers) ? leadData.selected_careers.join(', ') : leadData.selected_careers}</td></tr>
          <tr style="background-color: #f8fafc;"><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Topics of Interest:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${Array.isArray(leadData.selected_training_topics) ? leadData.selected_training_topics.join(', ') : leadData.selected_training_topics}</td></tr>
          <tr><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Biggest Challenge:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${leadData.biggest_challenge || 'None Shared'}</td></tr>
        </table>

        <p style="margin-top: 25px; font-size: 12px; color: #64748b;">The official boarding survey pass has been attached as an image file for your logs.</p>
      </div>
    `;

    const [candidateRes, adminRes] = await Promise.all([
      postEmail(leadData.email, 'Welcome Aboard! - Keerz Aviation Academy', candidateBodyHtml),
      postEmail('keerthanatm2465@gmail.com', `[Survey Response Alert] - ${leadData.full_name}`, adminBodyHtml)
    ]);

    if (candidateRes !== 'OK') {
      throw new Error(`Candidate Email: ${candidateRes}`);
    }
    if (adminRes !== 'OK') {
      throw new Error(`Admin Email: ${adminRes}`);
    }

    return { success: true, data: 'Emails sent successfully.' };
  } catch (err) {
    console.error('Error sending emails via SMTP.js:', err);
    return { success: false, error: err.message || err };
  }
};
