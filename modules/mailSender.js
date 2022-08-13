const nodemailer = require("nodemailer");

// 메일발송 객체
const mailSender = {
  // 메일발송 함수
  sendGmail: function (param) {
    var transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "kchaf819@gmail.com",
        pass: "mubtltmimygwccuz",
      },
    });
    // 메일 옵션
    var mailOptions = {
      from: "kchaf819@gmail.com", // 보내는 메일의 주소
      to: param.toEmail, // 수신할 이메일
      subject: param.subject, // 메일 제목
      text: param.text, // 메일 내용
    };

    // 메일 발송
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  },
};

module.exports = mailSender;
