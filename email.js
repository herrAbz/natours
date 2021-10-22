const nodeMailer = require('nodemailer');
const sendEmail = option => {
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

    ///3 actuly send email
};
