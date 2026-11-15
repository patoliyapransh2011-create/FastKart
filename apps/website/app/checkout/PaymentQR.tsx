
"use client";

import { QRCodeSVG } from "qrcode.react";

type PaymentQRProps = {
  paymentId: string;
  amount: number;
};

export default function PaymentQR({
  paymentId,
  amount,
}: PaymentQRProps) {
  const paymentUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/demo-payment/${paymentId}`
      : "";

  return (
    <div className="payment-qr">
      <h2>Scan Demo Payment QR</h2>

      <p>બીજા device થી આ QR scan કરો.</p>

      <div className="payment-qr-code">
        {paymentUrl && (
          <QRCodeSVG
            value={paymentUrl}
            size={230}
            level="H"
            includeMargin
          />
        )}
      </div>

      <h3>Amount to Approve</h3>

      <div className="payment-qr-amount">
        ₹{amount.toLocaleString("en-IN")}
      </div>

      <p className="payment-qr-warning">
        Demo only — કોઈ વાસ્તવિક UPI payment નહીં થાય.
      </p>
    </div>
  );
}

