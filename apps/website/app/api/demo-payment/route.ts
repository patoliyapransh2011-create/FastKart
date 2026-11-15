
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";


type DemoPayment = {
  id: string;
  amount: number;
  paymentMethod: string;
  status: "pending" | "paid" | "failed";
  createdAt: string;
};

const storage = globalThis as typeof globalThis & {
  demoPayments?: Map<string, DemoPayment>;
};

if (!storage.demoPayments) {
  storage.demoPayments = new Map<string, DemoPayment>();
}

const payments = storage.demoPayments;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const amount = Number(body.amount);
    const paymentMethod = String(body.paymentMethod || "UPI");

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid payment amount" },
        { status: 400 }
      );
    }

    const id = randomUUID();

    const payment: DemoPayment = {
      id,
      amount,
      paymentMethod,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    payments.set(id, payment);

    return NextResponse.json({ payment });
  } catch {
    return NextResponse.json(
      { error: "Unable to create demo payment" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Payment ID is required" },
      { status: 400 }
    );
  }

  const payment = payments.get(id);

  if (!payment) {
    return NextResponse.json(
      { error: "Payment not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ payment });
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, status } = await request.json();

    if (!id || !["paid", "failed"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid payment update" },
        { status: 400 }
      );
    }

    const payment = payments.get(id);

    if (!payment || payment.status !== "pending") {
      return NextResponse.json(
        { error: "Payment not available" },
        { status: 404 }
      );
    }

    payment.status = status;
    payments.set(id, payment);

    return NextResponse.json({ payment });
  } catch {
    return NextResponse.json(
      { error: "Unable to update payment" },
      { status: 500 }
    );
  }
}
