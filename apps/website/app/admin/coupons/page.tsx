
"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";


type Coupon = {
  id: string;
  code: string;
  discountType: "Percentage" | "Fixed";
  discountValue: number;
  minOrder: number;
  expiryDate: string;
  active: boolean;
};

const STORAGE_KEY = "fastkart-admin-coupons";

const money = (amount: number) =>
  "₹" + amount.toLocaleString("en-IN");

const emptyForm = {
  code: "",
  discountType: "Percentage" as "Percentage" | "Fixed",
  discountValue: "",
  minOrder: "",
  expiryDate: "",
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );
      setCoupons(Array.isArray(saved) ? saved : []);
    } catch {
      setCoupons([]);
    }
  }, []);

  const saveCoupons = (updated: Coupon[]) => {
    setCoupons(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const code = form.code.trim().toUpperCase();
    const discountValue = Number(form.discountValue);
    const minOrder = Number(form.minOrder);

    if (!code) {
      alert("Please enter a coupon code.");
      return;
    }

    if (
      coupons.some(
        (coupon) =>
          coupon.code === code && coupon.id !== editingId
      )
    ) {
      alert("This coupon code already exists.");
      return;
    }

    if (
      !Number.isFinite(discountValue) ||
      discountValue <= 0 ||
      (form.discountType === "Percentage" && discountValue > 100)
    ) {
      alert("Please enter a valid discount value.");
      return;
    }

    if (!Number.isFinite(minOrder) || minOrder < 0) {
      alert("Please enter a valid minimum order amount.");
      return;
    }

    if (!form.expiryDate) {
      alert("Please select an expiry date.");
      return;
    }

    const coupon: Coupon = {
      id: editingId || `CP-${Date.now()}`,
      code,
      discountType: form.discountType,
      discountValue,
      minOrder,
      expiryDate: form.expiryDate,
      active: editingId
        ? coupons.find((item) => item.id === editingId)?.active ?? true
        : true,
    };

    const updated = editingId
      ? coupons.map((item) =>
          item.id === editingId ? coupon : item
        )
      : [coupon, ...coupons];

    saveCoupons(updated);
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const editCoupon = (coupon: Coupon) => {
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      minOrder: String(coupon.minOrder),
      expiryDate: coupon.expiryDate,
    });

    setEditingId(coupon.id);
    setShowForm(true);
  };

  const deleteCoupon = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) {
      return;
    }

    saveCoupons(coupons.filter((coupon) => coupon.id !== id));
  };

  const toggleCoupon = (id: string) => {
    saveCoupons(
      coupons.map((coupon) =>
        coupon.id === id
          ? { ...coupon, active: !coupon.active }
          : coupon
      )
    );
  };

  const [today, setToday] = useState("");

useEffect(() => {
  setToday(new Date().toISOString().slice(0, 10));
}, []);

  const activeCount = coupons.filter(
    (coupon) => coupon.active && coupon.expiryDate >= today
  ).length;

  const expiredCount = coupons.filter(
    (coupon) => coupon.expiryDate < today
  ).length;

  const filteredCoupons = coupons.filter((coupon) =>
    coupon.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="coupons-page">
      <div className="coupons-heading">
        <div>
          <p className="coupons-eyebrow">MARKETING MANAGEMENT</p>
          <h1>Coupons</h1>
          <p>Create and manage discount coupons for your customers.</p>
        </div>

        <button
          className="coupons-add-btn"
          onClick={() => {
            setForm(emptyForm);
            setEditingId(null);
            setShowForm(!showForm);
          }}
        >
          + Create Coupon
        </button>
      </div>

      <section className="coupons-stats">
        <div className="coupons-stat-card">
          <span>Total Coupons</span>
          <strong>{coupons.length}</strong>
        </div>

        <div className="coupons-stat-card">
          <span>Active Coupons</span>
          <strong className="coupon-green">{activeCount}</strong>
        </div>

        <div className="coupons-stat-card">
          <span>Expired Coupons</span>
          <strong className="coupon-red">{expiredCount}</strong>
        </div>
      </section>

      {showForm && (
        <section className="coupons-form-card">
          <div className="coupons-form-heading">
            <h2>{editingId ? "Edit Coupon" : "Create New Coupon"}</h2>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="coupons-form-grid">
              <div className="coupons-field">
                <label>Coupon Code</label>
                <input
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g. SAVE20"
                  required
                />
              </div>

              <div className="coupons-field">
                <label>Discount Type</label>
                <select
                  value={form.discountType}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      discountType: e.target.value as
                        | "Percentage"
                        | "Fixed",
                    })
                  }
                >
                  <option value="Percentage">Percentage (%)</option>
                  <option value="Fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              <div className="coupons-field">
                <label>Discount Value</label>
                <input
                  type="number"
                  min="1"
                  max={form.discountType === "Percentage" ? 100 : undefined}
                  value={form.discountValue}
                  onChange={(e) =>
                    setForm({ ...form, discountValue: e.target.value })
                  }
                  placeholder={
                    form.discountType === "Percentage"
                      ? "e.g. 20"
                      : "e.g. 200"
                  }
                  required
                />
              </div>

              <div className="coupons-field">
                <label>Minimum Order Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={form.minOrder}
                  onChange={(e) =>
                    setForm({ ...form, minOrder: e.target.value })
                  }
                  placeholder="e.g. 999"
                  required
                />
              </div>

              <div className="coupons-field">
                <label>Expiry Date</label>
                <input
                  type="date"
                  min={today}
                  value={form.expiryDate}
                  onChange={(e) =>
                    setForm({ ...form, expiryDate: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="coupons-form-actions">
              <button type="button" className="coupons-cancel-btn"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                Cancel
              </button>
              <button type="submit" className="coupons-save-btn">
                {editingId ? "Update Coupon" : "Save Coupon"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="coupons-table-card">
        <div className="coupons-table-heading">
          <div>
            <h2>All Coupons</h2>
            <p>View, edit and manage your discount offers.</p>
          </div>

          <input
            type="search"
            placeholder="Search coupon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="coupons-search"
          />
        </div>

        <div className="coupons-table-wrap">
          <table className="coupons-table">
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>Discount</th>
                <th>Minimum Order</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredCoupons.map((coupon) => {
                const expired = coupon.expiryDate < today;

                return (
                  <tr key={coupon.id}>
                    <td><strong>{coupon.code}</strong></td>
                    <td>
                      {coupon.discountType === "Percentage"
                        ? `${coupon.discountValue}%`
                        : money(coupon.discountValue)}
                    </td>
                    <td>{money(coupon.minOrder)}</td>
                    <td>{coupon.expiryDate}</td>
                    <td>
                      <span
                        className={`coupon-status ${
                          expired
                            ? "coupon-expired"
                            : coupon.active
                            ? "coupon-active"
                            : "coupon-inactive"
                        }`}
                      >
                        {expired
                          ? "Expired"
                          : coupon.active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="coupons-actions">
                        <button onClick={() => editCoupon(coupon)}>
                          Edit
                        </button>
                        <button onClick={() => toggleCoupon(coupon.id)}>
                          {coupon.active ? "Disable" : "Enable"}
                        </button>
                        <button
                          className="coupon-delete-btn"
                          onClick={() => deleteCoupon(coupon.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredCoupons.length === 0 && (
                <tr>
                  <td colSpan={6} className="coupons-empty">
                    No coupons found. Create your first coupon.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
