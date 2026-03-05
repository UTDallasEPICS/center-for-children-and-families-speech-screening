import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma"
import { emailOTP } from "better-auth/plugins/email-otp"
import nodemailer from "nodemailer"
import { UserRole } from "@prisma/client";

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "sqlite",
    }),

    // 1. Lowercase 'user'
    // 2. Sitting OUTSIDE the database block
    user: { 
        additionalFields: {
            role: {
                type: "string", // 3. This must literally just say "string"
                required: false,
                defaultValue: "STUDENT"
            }
        }
    },
    
    plugins: [
        emailOTP({
			async sendVerificationOTP({ email, otp, type }) {
				await transporter.sendMail({
					from: process.env.EMAIL_USER,
					to: email,
					subject: "OTP",
					html: `${otp}`,
				})
			}
		})
	]
});
