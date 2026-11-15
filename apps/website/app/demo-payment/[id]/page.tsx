
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Payment = {
  id: string;
  amount: number;
  status: string;
};

export default function DemoPaymentPage() {
  const params = useParams();
  const router = useRouter();

  const id = String(params.id);

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadPayment() {
      try {
        const response = await fetch(
          `/api/demo-payment?id=${encodeURIComponent(id)}`,
          { cache: "no-store" }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Payment not found");
        }

        setPayment(data.payment || data);
      } catch {
        setMessage("Payment not found or expired.");
      } finally {
        setLoading(false);
      }
    }

    loadPayment();
  }, [id]);

  async function updatePayment(status: "paid" | "failed") {
    if (processing) return;

    setProcessing(true);
    setMessage("");

    try {
      const response = await fetch("/api/demo-payment", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Payment update failed");
      }

      setPayment((previous) =>
        previous ? { ...previous, status } : previous
      );

      setMessage(
        status === "paid"
          ? "Demo payment approved successfully!"
          : "Demo payment rejected."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <main className="demo-payment-page">
        <div className="demo-payment-card">
          <h2>Loading Payment...</h2>
        </div>
      </main>
    );
  }

  if (!payment) {
    return (
      <main className="demo-payment-page">
        <div className="demo-payment-card">
          <h2>Payment Not Found</h2>
          <p>{message}</p>
        </div>
      </main>
    );
  }

  const status = payment.status?.toLowerCase();

  return (
    <main className="demo-payment-page">
      <div className="demo-payment-card">
        <div className="demo-payment-logo">FastKart</div>

        <div className="demo-payment-icon">₹</div>

        <h1>Demo Payment</h1>

        <p className="demo-payment-subtitle">
          FastKart Demo Payment Gateway
        </p>

        <div className="demo-payment-amount">
          <span>Amount to approve</span>
          <strong>
            ₹{Number(payment.amount || 0).toLocaleString("en-IN")}
          </strong>
        </div>

        <div className="demo-payment-info">
          <span>Payment ID</span>
          <small>{payment.id || id}</small>
        </div>

        {status === "paid" ? (
          <div className="demo-payment-success">
            Demo Payment Approved
          </div>
        ) : status === "failed" ? (
          <div className="demo-payment-failed">
            Demo Payment Rejected
          </div>
        ) : (
          <>
            <p className="demo-payment-warning">
              This is only a demo. No real money will be transferred.
              Do not enter any UPI PIN or bank details.
            </p>

            <button
              className="demo-approve-btn"
              onClick={() => updatePayment("paid")}
              disabled={processing}
            >
              {processing ? "Processing..." : "Approve Demo Payment"}
            </button>

            <button
              className="demo-reject-btn"
              onClick={() => updatePayment("failed")}
              disabled={processing}
            >
              Reject Payment
            </button>
          </>
        )}

        {message && (
          <p className="demo-payment-message">{message}</p>
        )}

        <button
          className="demo-back-btn"
          onClick={() => router.push("/")}
        >
          Back to FastKart
        </button>

        <p className="demo-payment-footer">
          Secure Demo Experience · FastKart
        </p>
      </div>

      <style jsx>{`
        .demo-payment-page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 25px;
          background: #f1f5f9;
          font-family: Arial, sans-serif;
        }

        .demo-payment-card {
          width: 100%;
          max-width: 430px;
          padding: 35px 28px;
          border-radius: 22px;
          background: white;
          text-align: center;
          box-shadow: 0 15px 50px rgba(0, 0, 0, 0.09);
        }

        .demo-payment-logo {
          color: #2563eb;
          font-size: 27px;
          font-weight: 900;
        }

        .demo-payment-icon {
          width: 65px;
          height: 65px;
          margin: 25px auto 15px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #dbeafe;
          color: #2563eb;
          font-size: 32px;
          font-weight: bold;
        }

        h1 {
          margin: 10px 0;
          color: #172033;
          font-size: 26px;
        }

        .demo-payment-subtitle {
          color: #64748b;
          font-size: 14px;
        }

        .demo-payment-amount {
          margin: 28px 0 18px;
          padding: 22px;
          border-radius: 15px;
          background: #f8fafc;
        }

        .demo-payment-amount span,
        .demo-payment-info span {
          display: block;
          color: #64748b;
          font-size: 13px;
        }

        .demo-payment-amount strong {
          display: block;
          margin-top: 9px;
          color: #172033;
          font-size: 34px;
        }

        .demo-payment-info {
          margin-bottom: 22px;
          overflow-wrap: anywhere;
        }

        .demo-payment-info small {
          display: block;
          margin-top: 7px;
          color: #475569;
          font-size: 11px;
        }

        .demo-payment-warning {
          padding: 13px;
          border-radius: 10px;
          background: #fff7ed;
          color: #9a3412;
          font-size: 12px;
          line-height: 1.6;
        }

        .demo-approve-btn,
        .demo-reject-btn,
        .demo-back-btn {
          width: 100%;
          padding: 15px;
          margin-top: 12px;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
        }

        .demo-approve-btn {
          background: #2563eb;
          color: white;
        }

        .demo-reject-btn {
          background: #fee2e2;
          color: #b91c1c;
        }

        .demo-back-btn {
          background: #f1f5f9;
          color: #334155;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .demo-payment-success {
          padding: 16px;
          border-radius: 10px;
          background: #dcfce7;
          color: #166534;
          font-weight: bold;
        }

        .demo-payment-failed {
          padding: 16px;
          border-radius: 10px;
          background: #fee2e2;
          color: #991b1b;
          font-weight: bold;
        }

        .demo-payment-message {
          color: #334155;
          font-size: 13px;
        }

        .demo-payment-footer {
          margin-top: 25px;
          color: #94a3b8;
          font-size: 11px;
        }
      `}</style>
    </main>
  );
}
