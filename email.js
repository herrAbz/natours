const nodeMailer = require('nodemailer');
const sendEmail = async option => {
    //1 creat transporter
    const transporter = nodeMailer.createtransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    //2define the email options
    const mailOptions = {
        from: 'mahdi abz <mahdiabbaszadeh1999@gmail.com',
        to: option.email,
        subject: option.subject,
        text: option.message
    }

    ///3 actuly send email
    await transporter.sendMail(mailOptions);
};
module.exports = sendEmail;