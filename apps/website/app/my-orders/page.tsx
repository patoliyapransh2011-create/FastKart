
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type OrderItem = {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

type Order = {
  orderId: string;
  orderDate: string;
  customer: {
    name: string;
    city: string;
    address?: string;
  };
  items: OrderItem[];
  subtotal: number;
  delivery: number;
  total: number;
  orderStatus: string;
  deliveryStatus: string;
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem("fastkart-orders");

      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders);
        setOrders(Array.isArray(parsedOrders) ? parsedOrders : []);
      }
    } catch {
      setOrders([]);
    } finally {
      setLoaded(true);
    }
  }, []);

  const formatPrice = (price: number) =>
    `₹${Number(price || 0).toLocaleString("en-IN")}`;

  const cancelOrder = (orderId: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel order ${orderId}?`
    );

    if (!confirmed) return;

    const updatedOrders = orders.map((order) => {
      if (order.orderId !== orderId) return order;

      return {
        ...order,
        orderStatus: "Cancelled",
        deliveryStatus: "Cancelled",
      };
    });

    setOrders(updatedOrders);
    localStorage.setItem("fastkart-orders", JSON.stringify(updatedOrders));

    const lastOrder = localStorage.getItem("fastkart-last-order");

    if (lastOrder) {
      try {
        const parsedLastOrder = JSON.parse(lastOrder);

        if (parsedLastOrder.orderId === orderId) {
          localStorage.setItem(
            "fastkart-last-order",
            JSON.stringify({
              ...parsedLastOrder,
              orderStatus: "Cancelled",
              deliveryStatus: "Cancelled",
            })
          );
        }
      } catch {
        // Ignore invalid last-order data.
      }
    }

    alert("Your order has been cancelled successfully.");
  };

  if (!loaded) {
    return (
      <main className="min-h-screen bg-gray-50 p-8 text-center">
        Loading your orders...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              My Orders
            </h1>
            <p className="mt-2 text-gray-500">
              View and manage your FastKart orders.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <div className="mb-4 text-5xl">📦</div>

            <h2 className="text-xl font-bold text-gray-900">
              No Orders Yet
            </h2>

            <p className="mt-2 text-gray-500">
              Your orders will appear here after checkout.
            </p>

            <Link
              href="/"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <section
                key={order.orderId}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>

                    <h2 className="font-bold text-blue-700">
                      {order.orderId}
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                      {order.orderDate}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-sm text-gray-500">
                      Total Amount
                    </p>

                    <p className="text-xl font-bold text-gray-900">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                </div>

                <div className="my-5 grid grid-cols-1 gap-3 border-y border-gray-100 py-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-gray-500">
                      Order Status
                    </p>

                    <p
                      className={`mt-1 font-semibold ${
                        order.orderStatus === "Cancelled"
                          ? "text-red-600"
                          : "text-green-700"
                      }`}
                    >
                      {order.orderStatus}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Delivery Status
                    </p>

                    <p
                      className={`mt-1 font-semibold ${
                        order.deliveryStatus === "Cancelled"
                          ? "text-red-600"
                          : "text-blue-700"
                      }`}
                    >
                      {order.deliveryStatus}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Customer</p>

                    <p className="mt-1 font-semibold text-gray-800">
                      {order.customer?.name || "Customer"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedOrder(
                        selectedOrder === order.orderId
                          ? null
                          : order.orderId
                      )
                    }
                    className="rounded-lg border border-blue-600 px-4 py-2 font-semibold text-blue-600 hover:bg-blue-50"
                  >
                    {selectedOrder === order.orderId
                      ? "Hide Details"
                      : "Order Details"}
                  </button>

                  {order.orderStatus !== "Cancelled" &&
                    order.deliveryStatus !== "Delivered" && (
                      <button
                        type="button"
                        onClick={() => cancelOrder(order.orderId)}
                        className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
                      >
                        Cancel Order
                      </button>
                    )}
                </div>

                {selectedOrder === order.orderId && (
                  <div className="mt-5 rounded-xl bg-gray-50 p-4">
                    <h3 className="mb-3 font-bold text-gray-900">
                      Ordered Products
                    </h3>

                    <div className="space-y-3">
                      {order.items?.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 border-b border-gray-200 pb-3"
                        >
                          <div className="flex items-center gap-3">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-14 w-14 rounded-lg object-cover"
                              />
                            )}

                            <div>
                              <p className="font-semibold text-gray-800">
                                {item.name}
                              </p>

                              <p className="text-sm text-gray-500">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                          </div>

                          <p className="font-semibold text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatPrice(order.subtotal)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span>Delivery</span>
                        <span>{formatPrice(order.delivery)}</span>
                      </div>

                      <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-bold">
                        <span>Total</span>
                        <span>{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
