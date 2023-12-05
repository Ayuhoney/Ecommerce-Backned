
const nodemailer = require("nodemailer");


const sendResetPasswordMail = async(email,token)=>{
    try {
      const transporter = nodemailer.createTransport({
        host:'smtp.gmail.com',
        port:587,
        secure:false,
        requireTLS:true,
        auth:{
          user:process.env.USER_EMAIL,
          pass:process.env.EMAIL_PASS
        }
      });
      const mailOptions = {
        from: process.env.USER_EMAIL,
        to: email,
        subject: "for reset password",

        html: `<h2>Hlo  </h2>
                      <h3>Click this link to update your password</h3>
                      <br/>
                      <h3>Link :  ${process.env.HOST_URL}/resetPassword/${token}</h3>`,
      };
      transporter.sendMail(mailOptions,function(error,info){
        if(error){
          console.log(error)
        }
        else {
          console.log(mailOptions);
          console.log("mail has been sent:- ",info.response);
        }
      })
    
    } catch (error) {
     return error
    }
    }


module.exports = { sendResetPasswordMail }
    













