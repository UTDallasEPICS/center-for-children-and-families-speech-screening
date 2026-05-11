import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from './prisma'
import { emailOTP } from 'better-auth/plugins/email-otp'
import nodemailer from 'nodemailer'
import { UserRole } from '@prisma/client'
import { toDisplayString } from 'vue'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 587,
  secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'sqlite',
  }),
  rateLimit: {
    window: 60,
    max: 100,
    customRules: {
      '/email-otp/send-verification-otp': {
        window: 60,
        max: 3,
      },
      '/email-otp/verify-email': {
        window: 60,
        max: 5,
      },
      '/sign-in/email-otp': {
        window: 60,
        max: 5,
      },
    },
  },
  hooks: {
    before: async (requestCtx) => {
      if (requestCtx.path.endsWith('/email-otp/send-verification-otp')) {
        const { email } = requestCtx.body
        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (!existingUser) {
          throw new Error('Could not sign in, please try again')
        }
      }
      return requestCtx
    },
  },
  // 1. Lowercase 'user'
  // 2. Sitting OUTSIDE the database block
  user: {
    additionalFields: {
      role: {
        type: 'string', // 3. This must literally just say "string"
        required: false,
        defaultValue: 'STUDENT',
      },
    },
  },

  plugins: [
    emailOTP({
      disableSignUp: true,
      expiresIn: 300,
      allowedAttempts: 3,
      async sendVerificationOTP({ email, otp, type }) {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: email,
          subject: 'CCF OTP Verification Code',
          headers: { 'X-Priority': '1 (Highest)', 'X-MSMail-Priority': 'High', Importance: 'High' },
          html: `
            <div style="font-family: Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e1e1e1; border-radius: 8px;">
              <div style="background-color: #0077C0; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Security Verification</h1>
              </div>
              <div style="padding: 30px; text-align: center;">
                <p style="font-size: 16px; color: #374151;">Use the following code to sign in to your account:</p>
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0077C0; margin: 20px 0; padding: 10px; background: #f3f4f6; border-radius: 4px;">
                  ${otp}
                </div>
                <p style="font-size: 14px; color: #6b7280;">This code will expire shortly. If you did not request this, please ignore this email.</p>
              </div>
            </div>
          `,
        })
      },
    }),
  ],
})
