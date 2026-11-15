import { Suspense } from "react";
import DemoPaymentClient from "./DemoPaymentClient";

export const dynamic = "force-dynamic";

export default async function DemoPaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<p>Loading demo payment...</p>}>
      <DemoPaymentClient id={id} />
    </Suspense>
  );
}