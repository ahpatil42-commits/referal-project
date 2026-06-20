import { NextResponse } from "next/server";
import { auth } from "@/auth";
import Stripe from "stripe";
import { db } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_dummy_123", {
  apiVersion: "2026-05-27.dahlia",
});

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true, email: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 1. Create or retrieve Stripe Customer
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: session.user.id,
        },
      });
      customerId = customer.id;

      await db.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: customerId }
      });
    }

    // 2. Create Stripe Checkout Session
    // We assume a hardcoded price ID or we can just use inline price data for a simple subscription
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "ReferralAI Pro",
              description: "10 Referral Requests/mo + Priority Matching + Advanced AI",
            },
            unit_amount: 1900, // $19.00
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?checkout=cancelled`,
      metadata: {
        userId: session.user.id,
      },
    });

    if (!checkoutSession.url) {
      throw new Error("Failed to create checkout session");
    }

    // Redirect to checkout URL
    return NextResponse.redirect(checkoutSession.url, 303);
  } catch (error: any) {
    console.error("[STRIPE_CHECKOUT_ERROR]", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
