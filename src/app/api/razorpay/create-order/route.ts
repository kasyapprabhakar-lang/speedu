import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(req: NextRequest) {
  try {
    const { amount, trackingId } = await req.json()
    const order = await razorpay.orders.create({
      amount,          // in paise, already multiplied by 100
      currency: 'INR',
      receipt: trackingId,
    })
    return NextResponse.json({ orderId: order.id })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create order'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
