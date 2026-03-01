import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from './prisma'
import { emailOTP } from 'better-auth/plugins/email-otp'
import nodemailer from 'nodemailer'
import { prismaVersion } from '~~/prisma/generated/internal/prismaNamespace'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'sqlite',
  }),

  user: {
    additionalFields: {
      role: {
        type: 'string',
      },
    },
  },

  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'OTP',
          html: `${otp}`,
        })
      },
    }),
  ],
})
