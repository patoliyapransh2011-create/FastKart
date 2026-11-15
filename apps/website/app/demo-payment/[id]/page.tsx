
import DemoPaymentClient from "../DemoPaymentClient";

export default async function DemoPaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <DemoPaymentClient id={id} />;
}
