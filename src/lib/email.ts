export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

  // In development, or if no email provider is configured, log it to the console.
  console.log('====================================================================');
  console.log('                 PASSWORD RESET LINK (DEV MODE)                     ');
  console.log('====================================================================');
  console.log(`To: ${email}`);
  console.log(`Link: ${resetLink}`);
  console.log('====================================================================');

  // TODO: Implement actual email sending via SMTP, Resend, or SendGrid
  // Example for Resend:
  // import { Resend } from 'resend';
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: 'onboarding@resend.dev',
  //   to: email,
  //   subject: 'Reset your Micro Q-Bank Password',
  //   html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
  // });
}
