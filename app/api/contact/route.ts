import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import 'dotenv/config';

const resendApiKey = process.env.RESEND_API_KEY || 're_MNZjXBgV_2PpD49VkW5FiyrCFfhsYUoZw';
const resend = new Resend(resendApiKey);

const fromEmail = process.env.RESEND_FROM_EMAIL || 'Organishi Store <onboarding@resend.dev>';
const targetEmail = process.env.STORE_EMAIL || 'sales.organishi@gmail.com';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, countryCode, phoneNumber, email, message } = body;

    if (!firstName || !phoneNumber || !message) {
      return NextResponse.json(
        { success: false, message: 'First name, phone number, and message are required.' },
        { status: 400 }
      );
    }

    const fullName = `${firstName} ${lastName || ''}`.trim();
    const phone = `${countryCode || ''} ${phoneNumber}`.trim();
    const senderEmail = email ? email.trim() : 'N/A';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Contact Us Inquiry</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
          <div style="background-color: #4a9e2f; color: #ffffff; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 22px;">Organishi Store</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">📩 New Contact Us Message Received</p>
          </div>

          <div style="padding: 24px;">
            <div style="background: #f4f7ee; border-left: 4px solid #4a9e2f; padding: 16px; margin-bottom: 20px; border-radius: 4px;">
              <h2 style="margin: 0 0 10px 0; font-size: 16px; color: #1f2a17;">Sender Details</h2>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Name:</strong> ${fullName}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Phone:</strong> ${phone}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Email:</strong> ${senderEmail}</p>
            </div>

            <h3 style="margin: 0 0 10px 0; font-size: 15px; color: #1f2a17;">Message Content:</h3>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; padding: 16px; border-radius: 6px; white-space: pre-wrap; font-size: 14px; color: #334155;">
              ${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
            </div>
          </div>

          <div style="background-color: #f1f5f9; padding: 12px; text-align: center; font-size: 12px; color: #64748b;">
            Organishi E-Commerce Contact Notification System
          </div>
        </div>
      </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [targetEmail],
      subject: `[Website Contact] Message from ${fullName} (${phone})`,
      html,
    });

    if (error) {
      console.error('Resend API Error (Contact Form):', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, message: 'Thank you for contacting Organishi! Your message has been sent.', id: data?.id },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Contact Form Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
