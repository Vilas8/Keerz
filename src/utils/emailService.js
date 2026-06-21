export const sendEmails = async (leadData, ticketImageBase64 = null) => {
  try {
    const response = await fetch('/api/send-emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        leadData,
      }),
      keepalive: true,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP Error ${response.status} from email server.`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    console.error('Error sending emails via backend:', err);
    return { success: false, error: err.message || err };
  }
};

