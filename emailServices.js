import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendContactNotification = async (contactData) => {
  const msg = {
    to: 'dyloncaissie97@gmail.com', // Your actual Gmail address
    from: 'dyloncaissie97@gmail.com', // Use the same email for now
    subject: 'New Contact Form Submission - CaseC Website',
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${contactData.name}</p>
      <p><strong>Email:</strong> ${contactData.email}</p>
      <p><strong>Message:</strong> ${contactData.message}</p>
      <p><strong>Received:</strong> ${new Date().toLocaleString()}</p>
      <hr>
      <p><em>From your CaseC Website Contact Form</em></p>
    `
  };

  try {
    await sgMail.send(msg);
    console.log('✅ Email notification sent successfully');
    return true;
  } catch (error) {
    console.error('❌ Email error:', error.response?.body || error.message);
    return false;
  }
};

export default sendContactNotification;
