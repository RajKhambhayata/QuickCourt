import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handlePaymentWebhook } from '@/lib/payment';

export const dynamic = 'force-dynamic';

/**
 * POST /api/payments/webhook
 * Handle payment provider webhooks
 * This endpoint receives notifications from payment providers about payment status changes
 */
export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') || 
                     request.headers.get('x-razorpay-signature') || '';

    if (!signature) {
      console.error('Webhook received without signature');
      return NextResponse.json(
        { error: 'Invalid webhook request' },
        { status: 400 }
      );
    }

    // Parse webhook data
    let webhookData;
    try {
      webhookData = JSON.parse(body);
    } catch (parseError) {
      console.error('Failed to parse webhook body:', parseError);
      return NextResponse.json(
        { error: 'Invalid webhook data' },
        { status: 400 }
      );
    }

    // Handle the webhook
    await handlePaymentWebhook(webhookData, signature);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handling error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}