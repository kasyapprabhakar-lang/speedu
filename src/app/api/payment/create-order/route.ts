import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(request: Request) {
  try {
    const { amount } = await request.json()

    if (!amount || amount < 1) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // Amount including GST, converted to paise
    const amountWithGst = Math.round(amount * 1.18)
    const amountInPaise = amountWithGst * 100

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Razorpay order creation failed:', error)
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 })
  }
}
