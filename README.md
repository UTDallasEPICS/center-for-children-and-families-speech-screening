# Center for Children and Families: Automation and Analysis of Speech Screening Scores

## Project Overview

The Center for Children and Families (CCF) at UT Dallas runs early child development programs including "Grow With Me" and "Play With Me" that tracks and scores vocabulary development in children 8-30 months. Researchers use the MacArthur-Bates Communicative Development Inventories (MCDI), a word checklist that parents fill out and then researchers manaully calculate percentile scores for each child by using the reference tables They then fill out excel spearsheets for research purposes and word documents for families

This application automates the manual workflow for the researchers. Researchers upload an Excel, select the form type corresponding to the Excel, and the app calculates the MCDI percentile scores based on the interpolation of the childs original scores.  Then the user is given a downloable Excel and Word documents for the families

---

## User Roles

**Researcher**
- Uploads Excel files containing child assessment data
- Selects the correct MCDI form type 
- Ensures calculated percentile scores look good
- Downloads the Excel output and Word reports

**Admin**
- Everything researches can do
- Accesses the admin dashboard
- Creates authorized users by NetID
- Manually deletes users

---

## Functional Requirements by Page

**`/auth` — Login Page**
- User enters their email
- System checks if the email exists 
- If valid sends a one time password to the user's email
- User enters OTP
- Invalid or expired OTPs are rejected otherwise accepted

**`/` — Main Application (4-Step Wizard)**
- Upload an Excel file and select the MCDI form type
- Preview the parsed data to ensure it's correct before processing
- Calculate percentile scores
- Download the Excel output file and/or Word report documents

**`/dashboard` — Admin Dashboard**
- View current users with email, role, expiration date, and days remaining
- Add new users by NetID 
- Manually delete users
- Accounts older than one semester are automatically removed

---

## Tech Stack

- **Framework:** [Nuxt 4](https://nuxt.com/) 
- **Auth:** [Better Auth](https://www.better-auth.com/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Database:** [SQLite](https://sqlite.org/)
- **UI Framework:** [Nuxt UI v3](https://ui3.nuxt.com/)
- **Email:** [Nodemailer](https://nodemailer.com/)

---

## Third Party Integrations

| Integration |
|---|
| [Nuxt UI v3](https://ui3.nuxt.com/) |
| [ExcelJS](https://github.com/exceljs/exceljs) |
| [PizZip](https://github.com/open-xml-templating/pizzip) |

---

## Deployment Notes

The application is containerized using Docker. The `dockerfile` and `entrypoint.sh` at the root handle the build and startup. The partner is responsible for hosting 

---

## Development Setup

### Prerequisites
- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/UTDallasEPICS/center-for-children-and-families-speech-screening.git
cd center-for-children-and-families-speech-screening
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in the following:

| Variable | Description |
|---|---|
| `DATABASE_URL` | SQLite connection string (default: `file:./prisma/dev.db`) |
| `BETTER_AUTH_SECRET` | Secure random string — generate with `openssl rand -hex 32` |
| `BETTER_AUTH_URL` | Base URL of the app (default: `http://localhost:3000`) |
| `EMAIL_USER` | Gmail address used for OTP delivery |
| `EMAIL_PASS` | Gmail App Password — [how to generate one](https://support.google.com/accounts/answer/185833) |

### 4. Set up the database

```bash
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

To reset and re-seed:

```bash
pnpm prisma:reset
```

### 5. Start the development server

```bash
pnpm dev
```

App runs at `http://localhost:3000`. Prisma Studio opens automatically for database inspection.

### 6. Log in

Go to `/auth`. Login requires an email that exists in the database.

Edit the seed.ts file to add additional emails

To retrieve your OTP:
- Check your configured Gmail inbox
- Or open the Prisma Studio browser tab and look in the `Verification` table

---

## Project Structure

```
app/          Frontend code 
server/       Backend API routes and utilities
prisma/       Database schema, migrations, and seed scripts
public/       Assets including word and csv templates
```
