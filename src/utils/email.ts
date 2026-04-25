import nodemailer from "nodemailer";
import pug from "pug";
import path from "path";

export class Email {
  private to: string;
  private firstName: string | any;
  private from: string;

  constructor(user: { email: string; name: string }) {
    this.to = user.email;
    this.firstName = user.name;
    this.from = `Field Booking <${process.env.EMAIL_USER}>`;
  }

  private newTransport() {
    return nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure:true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 10000, 
      greetingTimeout: 5000,
      dns: {
        family: 4 
      }
    } as any);
  }

  async send(
    subject: string,
    text: string,
    templateData: any,
    template: string,
  ) {
    const templatePath = path.join(__dirname, `../templates/${template}.pug`);

    const html = pug.renderFile(templatePath, {
      firstName: this.firstName,
      subject,
      ...templateData,
    });

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
    await this.send(
      "bookingConfirm",
      "Reservation Confirmed ✅",
      bookingData,
      "bookingConfirm",
    );
  }

  async sendEmailUpdateNotification(userData: any) {
    await this.send(
      "Security Alert: Your email address was updated",
      "Email Address Updated ✅",
      userData,
      "emailUpdate",
    );
  }

  async sendPasswordChangedNotification(userData: any) {
    await this.send(
      "Security Alert: Your password was changed 🔐",
      "Password Change Notification",
      userData,
      "passwordChanged",
    );
  }
  
  async sendBookingCancelNotification(bookingData: any) {
    await this.send(
      "Booking Cancellation - Action Required 🏟️",
      `Your booking for ${bookingData.fieldName} has been cancelled. Please contact the owner for your refund.`,
      bookingData,
      "bookingCancelled",
    );
  }
}
