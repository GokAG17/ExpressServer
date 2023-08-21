const nodemailer = require('nodemailer');

// Create a transporter using Outlook's SMTP settings
const transporter = nodemailer.createTransport({
    service: "hotmail",
    auth: {
        user: 'nodeAOPE10110@outlook.com', // Your Outlook email
        pass: '123456AOPE',         // Your Outlook password or app-specific password
    },
});

const sendEmail = (name, email, message) => {
    const mailOptions = {
        from: 'nodeAOPE10110@outlook.com', // Sender's email (your Outlook email)
        to: email,                               // Recipient's email
        subject: 'Subject of your email',
        text: `Hello ${name},\n\n${message}`,
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                reject(error);
            } else {
                console.log('Email sent: ' + info.response);
                resolve(info.response);
            }
        });
    });
};

module.exports = sendEmail;
