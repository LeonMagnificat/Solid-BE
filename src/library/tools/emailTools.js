import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = (to, link, name) => {
  const msg = {
    to: to,
    from: "solidgroups00@gmail.com",
    subject: "Group invitation",
    text: `Your id is ${link}`,
    html: `
    <!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="utf-8">
                    <title>Simple Email Design</title>
                  </head>
                  <body>
                    <table style="max-width: 600px; margin: auto; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 20px; text-align: center; background-color: #f2f2f2;">
                          <h1 style="font-size: 24px;">SOLID</h1>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 20px; font-size: 16px;">
                          <p>Hello,</p>
                          <p> You're invited to join our group <b>${name}</b>.</p>
                          
                          <p> Use the button below to Login or Register to get access.</p>
                          
                          <p>Looking forward to having you as a member!</p>
                          <p>Best regards,</p>
                          <a href=${link}>
                           <button style="border:none; width: 200px; height: 50px; background-color:#E09B2D; color: white; border-radius: 15px ; cursor:pointer" >Join Group</button>
                           <a/>
                        </td>
                      </tr>
                    </table>
                  </body>
            </html>`,
  };
  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
      console.log(process.env.SENDGRID_API_KEY);
    })
    .catch((error) => {
      console.error(error);
      console.log(process.env.SENDGRID_API_KEY);
    });
};
