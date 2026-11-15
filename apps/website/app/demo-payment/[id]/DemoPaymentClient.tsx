
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Payment = {
  id: string;
  amount: number;
  paymentMethod: string;
  status: "pending" | "paid" | "failed";
};

export default function DemoPaymentClient({ id }: { id: string }) {
  const router = useRouter();

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPayment() {
      try {
        const response = await fetch(
          `/api/demo-payment?id=${encodeURIComponent(id)}`,
          { cache: "no-store" }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Payment not found");
        }

        if (active) setPayment(data.payment);
      } catch (error) {
        if (active) {
          setMessage(
            error instanceof Error ? error.message : "Payment not found"
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadPayment();

    return () => {
      active = false;
    };
  }, [id]);

  async function updatePayment(status: "paid" | "failed") {
    if (processing || payment?.status !== "pending") return;

    setProcessing(true);
    setMessage("");

    try {
      const response = await fetch("/api/demo-payment", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Payment update failed");
      }

      setPayment(data.payment);
      setMessage(
        status === "paid"
          ? "Demo payment approved successfully!"
          : "Demo payment rejected."
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setProcessing(false);
    }
  }

  return (
    <main className="demo-page">
      <section className="demo-card">
        <div className="logo">FastKart</div>
        <div className="rupee">₹</div>

        <h1>Demo Payment</h1>
        <p className="subtitle">FastKart Demo Payment Gateway</p>

        {loading ? (
          <p>Loading payment...</p>
        ) : !payment ? (
          <p className="error">{message || "Payment not found or expired."}</p>
        ) : (
          <>
            <div className="amount-box">
              <span>Amount to approve</span>
              <strong>
                ₹{Number(payment.amount).toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="payment-id">
              Payment ID: {payment.id}
            </div>

            {payment.status === "paid" ? (
              <div className="success">Demo Payment Approved</div>
            ) : payment.status === "failed" ? (
              <div className="error">Demo Payment Rejected</div>
            ) : (
              <>
                <p className="warning">
                  Demo only. No real money will be transferred.
                  Never enter a UPI PIN or bank details here.
                </p>

                <button
                  className="approve"
                  disabled={processing}
                  onClick={() => updatePayment("paid")}
                >
                  {processing ? "Processing..." : "Approve Demo Payment"}
                </button>

                <button
                  className="reject"
                  disabled={processing}
                  onClick={() => updatePayment("failed")}
                >
                  Reject Payment
                </button>
              </>
            )}
          </>
        )}

        {message && payment && (
          <p className="message">{message}</p>
        )}

        <button className="back" onClick={() => router.push("/")}>
          Back to FastKart
        </button>

        <p className="footer">FastKart Demo Experience</p>
      </section>

      <style jsx>{`
        .demo-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: #f1f5f9;
          font-family: Arial, sans-serif;
        }
        .demo-card {
          width: 100%;
          max-width: 430px;
          padding: 32px 26px;
          border-radius: 20px;
          background: white;
          text-align: center;
          box-shadow: 0 12px 45px #00000012;
        }
        .logo {
          color: #2563eb;
          font-size: 28px;
          font-weight: 900;
        }
        .rupee {
          width: 65px;
          height: 65px;
          margin: 24px auto 12px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #dbeafe;
          color: #2563eb;
          font-size: 32px;
          font-weight: bold;
        }
        h1 { color: #172033; }
        .subtitle { color: #64748b; font-size: 14px; }
        .amount-box {
          margin: 25px 0 18px;
          padding: 22px;
          border-radius: 14px;
          background: #f8fafc;
        }
        .amount-box span {
          display: block;
          color: #64748b;
          font-size: 13px;
        }
        .amount-box strong {
          display: block;
          margin-top: 8px;
          color: #172033;
          font-size: 34px;
        }
        .payment-id {
          margin-bottom: 20px;
          color: #64748b;
          font-size: 11px;
          overflow-wrap: anywhere;
        }
        .warning {
          padding: 13px;
          border-radius: 10px;
          background: #fff7ed;
          color: #9a3412;
          font-size: 12px;
          line-height: 1.6;
        }
        button {
          width: 100%;
          padding: 15px;
          margin-top: 12px;
          border: 0;
          border-radius: 10px;
          font-weight: bold;
          cursor: pointer;
        }
        button:disabled { opacity: .6; cursor: not-allowed; }
        .approve { background: #2563eb; color: white; }
        .reject { background: #fee2e2; color: #b91c1c; }
        .back { background: #f1f5f9; color: #334155; }
        .success {
          padding: 15px;
          border-radius: 10px;
          background: #dcfce7;
          color: #166534;
          font-weight: bold;
        }
        .error {
          padding: 15px;
          border-radius: 10px;
          background: #fee2e2;
          color: #991b1b;
        }
        .message { color: #334155; font-size: 13px; }
        .footer { margin-top: 24px; color: #94a3b8; font-size: 11px; }
      `}</style>
    </main>
  );
}
