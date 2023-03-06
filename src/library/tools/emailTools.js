import sgMail from "@sendgrid/mail";

sgMail.setApiKey("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");

export const sendEmail = (to) => {
  const msg = {
    to: to,
    from: "kakaali55@gmail.com",
    subject: "Test --------- email",
    text: "This is a test email",
    html: "<button>click me noc<button/>",
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
};
