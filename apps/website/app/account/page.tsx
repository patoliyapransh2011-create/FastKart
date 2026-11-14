
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "../account/account.css";

type Profile = {
  name: string;
  email: string;
  phone: string;
};

const emptyProfile: Profile = {
  name: "",
  email: "",
  phone: "",
};

export default function AccountPage() {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("fastkart-account");

    if (data) {
      try {
        setProfile({ ...emptyProfile, ...JSON.parse(data) });
      } catch {
        setProfile(emptyProfile);
      }
    }
  }, []);

  function handleChange(field: keyof Profile, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    localStorage.setItem("fastkart-account", JSON.stringify(profile));
    setSaved(true);
  }

  return (
    <main className="account-page">
      <div className="account-container">
        <Link href="/" className="account-back">
          ← Back to Home
        </Link>

        <div className="account-card">
          <span className="dashboard-eyebrow">MY FASTKART</span>

          <h1>My Account</h1>

          <p className="account-description">
            Manage your personal information and keep your
            FastKart profile up to date.
          </p>

          <form onSubmit={saveProfile} className="account-form">
            <div className="account-field">
              <label htmlFor="account-name">Full Name</label>
              <input
                id="account-name"
                value={profile.name}
                onChange={(e) =>
                  handleChange("name", e.target.value)
                }
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="account-field">
              <label htmlFor="account-email">Email Address</label>
              <input
                id="account-email"
                type="email"
                value={profile.email}
                onChange={(e) =>
                  handleChange("email", e.target.value)
                }
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="account-field">
              <label htmlFor="account-phone">Phone Number</label>
              <input
                id="account-phone"
                type="tel"
                value={profile.phone}
                onChange={(e) =>
                  handleChange("phone", e.target.value)
                }
                placeholder="Enter your phone number"
              />
            </div>

            <button type="submit" className="account-save-btn">
              Save Profile →
            </button>

            {saved && (
              <p className="account-success">
                ✓ Profile saved successfully!
              </p>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
