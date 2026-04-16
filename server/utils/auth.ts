import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from './prisma'
import { emailOTP } from 'better-auth/plugins/email-otp'
import nodemailer from 'nodemailer'
import { UserRole } from '@prisma/client'
import { toDisplayString } from 'vue'

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
      async sendVerificationOTP({ email, otp, type }) {
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
