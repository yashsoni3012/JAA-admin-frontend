'use client';

import { useState } from 'react';
import PageHeader from '@/components/common/PageHeader';
import Button from '@/components/common/Button';

const INITIAL = {
  emailAlerts: true,
  newMemberAlerts: true,
  weeklyReport: false,
  compactTables: false,
};

const TOGGLES = [
  { key: 'emailAlerts', label: 'Email alerts', description: 'Get an email when a member needs review.' },
  { key: 'newMemberAlerts', label: 'New member alerts', description: 'Notify me when someone signs up.' },
  { key: 'weeklyReport', label: 'Weekly summary', description: 'Receive a summary every Monday.' },
  { key: 'compactTables', label: 'Compact tables', description: 'Show more rows with less spacing.' },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState(INITIAL);
  const [notice, setNotice] = useState('');

  const toggle = (key) => setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  // Demo only: nothing is sent to a server.
  const handleSave = (event) => {
    event.preventDefault();
    setNotice('Demo mode: preferences are not saved to a server.');
  };

  const handleCancel = () => {
    setSettings(INITIAL);
    setNotice('');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Manage notifications and display preferences." />

      <form onSubmit={handleSave} className="rounded-3xl border border-white bg-white shadow-card">
        <ul className="divide-y divide-slate-100">
          {TOGGLES.map((item) => (
            <li key={item.key} className="flex items-center justify-between gap-6 px-6 py-5">
              <div>
                <p className="text-sm font-semibold text-ink">{item.label}</p>
                <p className="text-xs text-slate-500">{item.description}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings[item.key]}
                aria-label={item.label}
                onClick={() => toggle(item.key)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${settings[item.key] ? 'bg-brand-500' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${settings[item.key] ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </li>
          ))}
        </ul>

        {notice && (
          <p role="status" className="mx-6 mb-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">{notice}</p>
        )}

        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-5">
          <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
          <Button variant="primary" type="submit">Save changes</Button>
        </div>
      </form>
    </div>
  );
}
