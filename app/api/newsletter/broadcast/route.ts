import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isOwner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { subject, html } = await req.json()
    
    // In the future: npm install resend
    // import { Resend } from 'resend'
    // const resend = new Resend(process.env.RESEND_API_KEY)
    
    // await resend.emails.send({
    //   from: 'you@yourdomain.com',
    //   to: 'subscribers@yourdomain.com', // use bcc for actual lists
    //   subject,
    //   html
    // })

    return NextResponse.json({ 
      ok: true, 
      message: 'Resend email broadcast scaffolded successfully. Install resend SDK to activate.' 
    })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}
