require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 30000
});

async function test() {
  console.log('Testing SMTP connection with credentials:');
  console.log('USER:', process.env.EMAIL_USER);
  console.log('PASS:', process.env.EMAIL_PASS ? '***' + process.env.EMAIL_PASS.slice(-4) : 'undefined');

  try {
    await transporter.verify();
    console.log('✅ SMTP Connection successful!');
    
    // Optional: actually send a test email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // send to self
      subject: 'Test Email from NAAC Portal',
      text: 'If you are reading this, the email configuration is working perfectly.'
    });
    console.log('✅ Test email sent! Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ SMTP Error:', error);
  }
}

test();
