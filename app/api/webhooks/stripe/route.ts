import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_dummy_123", {
  apiVersion: "2026-05-27.dahlia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`[WEBHOOK_ERROR] Signature verification failed: ${err.message}`);
      return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const userId = session.metadata?.userId;

        if (userId && customerId && subscriptionId) {
          // Update user to PRO
          await db.user.update({
            where: { id: userId },
            data: {
              stripeSubscriptionId: subscriptionId,
              plan: "PRO",
              credits: 10,
            },
          });
          console.log(`[STRIPE] Upgraded user ${userId} to PRO`);
        }
        break;
      }
      
      case "customer.subscription.deleted":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const status = subscription.status;
        const subscriptionId = subscription.id;
        
        // Find user by subscriptionId
        const user = await db.user.findUnique({
          where: { stripeSubscriptionId: subscriptionId }
        });

        if (user) {
          if (status === "canceled" || status === "unpaid") {
            await db.user.update({
              where: { id: user.id },
              data: {
                plan: "FREE",
                credits: 1, // Reset credits
              }
            });
            console.log(`[STRIPE] Downgraded user ${user.id} to FREE`);
          } else if (status === "active") {
             await db.user.update({
              where: { id: user.id },
              data: { plan: "PRO", credits: 10 }
            });
          }
        }
        break;
      }
      
      default:
        console.log(`[STRIPE] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("[STRIPE_WEBHOOK_INTERNAL_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
