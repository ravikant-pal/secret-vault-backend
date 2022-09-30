const otpGenerator = require("otp-generator");
require("dotenv/config");
module.exports = {
  sendOtp: function (to, name, otp) {
    console.log("sending mail to => ", to);
    const mailjet = require("node-mailjet").connect(
      process.env.MAIL_API_USER,
      process.env.MAIL_API_PASSWORD
    );
    const request = mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: "rogex35278@dufeed.com",
            Name: "Secret Vault",
          },
          To: [
            {
              Email: to,
              Name: name,
            },
          ],
          Subject: "Secret Vault - OTP (One Time Password) for Login",
          HTMLPart: `<div style='font-family: Helvetica,Arial,sans-serif;overflow:auto;line-height:2'><div style='width:100%;padding:20px'><div style='border-bottom:1px solid #eee'><a href='' style='font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600'>Secret Vault</a></div><p style='font-size:1.1em'>Hi ${name},</p><p>Thank you for choosing Secret Vault. Use the following OTP to login. OTP is valid for 5 minutes</p><h2 style='background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;'>${otp}</h2><p style='font-size:0.9em;'>Regards,<br />Verification Team</p><hr style='border:none;border-top:1px solid #eee' /><div style='float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300'><p>Secret Vault </p><p>Earth 101</p><p>Milkyway</p></div></div></div>`,
          CustomID: "SecretVault",
        },
      ],
    });
    request
      .then((result) => {
        console.log(result.body);
      })
      .catch((err) => {
        console.log(err.statusCode);
      });

    return otp;
  },
  getNameFromEmail: function (email) {
    let name = email.split("@")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  },
  generateOtp: function () {
    let otp = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    console.log("OTP => ", otp);
    return otp;
  },
};
