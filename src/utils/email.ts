import nodemailer from 'nodemailer';
import pug from "pug";
import path from "path";


export class Email {
  private to: string;
  private firstName: string | any;
  private from: string;

  constructor(user: { email: string; name: string }) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.from = `Field Booking <${process.env.EMAIL_USER}>`;
  }

  private newTransport() {
    return nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async send(subject: string, text: string, templateData: any,template:string) {
    const templatePath = path.join(__dirname, `../templates/${template}.pug`);

    const html = pug.renderFile(templatePath, {
      firstName: this.firstName,
      subject,
      ...templateData
    })

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text,
      html,
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendBookingSuccess(bookingData: any) {
    await this.send('bookingConfirm', 'Reservation Confirmed ✅',bookingData,"bookingConfirm");
  }
}