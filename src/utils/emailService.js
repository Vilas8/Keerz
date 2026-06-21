export const sendEmails = async (leadData, ticketImageBase64 = null) => {
  try {
    const response = await fetch('/api/send-emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        leadData,
        ticketImageBase64,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'SMTP delivery failed on server.');
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (err) {
    console.error('Error sending emails via backend SMTP:', err);
    return { success: false, error: err.message || err };
  }
};
