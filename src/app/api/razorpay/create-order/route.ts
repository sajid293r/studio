
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { randomUUID } from "crypto";

const GST_RATE = 0.18;

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
    const { plan, userDetails, existingPropertyId } = await req.json();

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.error("Razorpay keys are not defined in environment variables.");
        return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
    }
    
    if (!plan || !userDetails) {
        return NextResponse.json({ error: "Missing required session data." }, { status: 400 });
    }

    const totalAmount = Math.round(plan.price * (1 + GST_RATE));
    const amountInPaise = totalAmount * 100;

    // Generate a shorter receipt ID (max 40 characters)
    const receiptId = `RCP_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    
    const options = {
        amount: amountInPaise,
        currency: "INR",
        receipt: receiptId,
        notes: {
            planName: plan.name,
            planDuration: plan.duration_in_days,
            basePrice: plan.price,
            customerName: userDetails.name,
            customerEmail: userDetails.email,
            propertyName: userDetails.propertyName,
            propertyAddress: userDetails.propertyAddress,
            propertyContact: userDetails.propertyContact,
            // Include existing property ID if activating existing property
            ...(existingPropertyId && { existingPropertyId: existingPropertyId }),
        }
    };

    try {
        const order = await razorpay.orders.create(options);
        return NextResponse.json(order);
    } catch (error) {
        console.error("Razorpay order creation failed:", error);
        return NextResponse.json({ error: "Failed to create Razorpay order" }, { status: 500 });
    }
}
