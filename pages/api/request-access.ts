import type { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from 'nodemailer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const { name, email, company } = req.body
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' })
  }
  try {
    // Configure your SMTP or use a service like SendGrid/Mailgun
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
    await transporter.sendMail({
      from: `Inventory Master <no-reply@pokemonloot.com>`,
      to: 'owner@pokemonloot.com',
      subject: 'New Access Request - Inventory Master',
      text: `Name: ${name}\nEmail: ${email}\nCompany/User: ${company || ''}`,
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Company/User:</strong> ${company || ''}</p>`
    })
    return res.status(200).json({ success: true })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}
