const nodemailer = require('nodemailer');

const sendEmail = async options => {
    console.log("call to send email")
    // 1) create a transporter
    const transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,

        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // 2) Define the email options
    const mailOptions = {
        from: '"My-App" <security@gmail.myApp.com>',
        to: options.email,
        subject: options.subject,
        // text: options.message,
        html: options.html

    };

    // 3) Actually send the email
    const info = await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return;
        }
    });
};


module.exports = { sendEmail };
