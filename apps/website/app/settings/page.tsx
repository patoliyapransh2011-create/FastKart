
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "../settings/settings.css";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("English");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const settings = localStorage.getItem("fastkart-settings");

    if (settings) {
      try {
        const data = JSON.parse(settings);
        setNotifications(data.notifications ?? true);
        setDarkMode(data.darkMode ?? false);
        setLanguage(data.language ?? "English");
      } catch {
        // Keep default settings.
      }
    }
  }, []);

  function saveSettings() {
    localStorage.setItem(
      "fastkart-settings",
      JSON.stringify({ notifications, darkMode, language })
    );
    setSaved(true);
  }

  return (
    <main className="settings-page">
      <div className="settings-container">
        <Link href="/" className="settings-back">
          ← Back to Home
        </Link>

        <div className="settings-card">
          <h1 className="settings-title">Settings</h1>
          <p className="settings-description">
            Manage your FastKart preferences.
          </p>

          <div className="settings-options">
            <label className="settings-option">
              <span>
                <span className="settings-option-title">
                  Notifications
                </span>
                <span className="settings-option-description">
                  Notification preference
                </span>
              </span>

              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => {
                  setNotifications(e.target.checked);
                  setSaved(false);
                }}
                className="settings-checkbox"
              />
            </label>

            <hr className="settings-divider" />

            <label className="settings-option">
              <span>
                <span className="settings-option-title">
                  Dark Mode
                </span>
                <span className="settings-option-description">
                  Save your display preference
                </span>
              </span>

              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => {
                  setDarkMode(e.target.checked);
                  setSaved(false);
                }}
                className="settings-checkbox"
              />
            </label>

            <hr className="settings-divider" />

            <div>
              <label className="settings-language-label">
                Language
              </label>

              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  setSaved(false);
                }}
                className="settings-select"
              >
                <option>English</option>
                <option>Hindi</option>
                <option>Gujarati</option>
              </select>
            </div>

            <button
              onClick={saveSettings}
              className="settings-save-btn"
            >
              Save Settings
            </button>

            {saved && (
              <p className="settings-success">
                Settings saved successfully!
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
