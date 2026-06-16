import React, { useState } from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Globe,
  Bell,
  Shield,
  Save,
  CheckCircle2,
  Palette
} from 'lucide-react';

const SettingItem = ({ icon: Icon, title, description, children }) => (
  <div className="flex items-center justify-between p-4 hover:bg-slate-800/30 transition-colors">
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 mt-0.5">
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-slate-200">{title}</h4>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
    </div>
    {children}
  </div>
);

const Toggle = ({ value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${value ? 'bg-amazon-orange' : 'bg-slate-700'}`}
  >
    <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${value ? 'translate-x-5' : ''}`} />
  </button>
);

const Settings = () => {
  useDocumentTitle('Settings');
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('en');
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-amazon-orange/10 border border-amazon-orange/20 text-amazon-orange">
          <SettingsIcon className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">Settings</h2>
          <p className="text-xs text-slate-400 font-medium">Manage your application preferences and configuration</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Palette className="h-4 w-4 text-amazon-orange" /> Appearance
          </h3>
        </div>
        <div className="divide-y divide-slate-800/60">
          <SettingItem icon={theme === 'dark' ? Moon : Sun} title="Theme" description="Choose between light and dark mode">
            <select value={theme} onChange={(e) => setTheme(e.target.value)} className="bg-slate-900/80 border border-slate-800 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-amazon-orange/50 appearance-none cursor-pointer">
              <option value="dark">Dark Mode</option>
              <option value="light">Light Mode</option>
              <option value="system">System Default</option>
            </select>
          </SettingItem>
          <SettingItem icon={Globe} title="Language" description="Set your preferred display language">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-slate-900/80 border border-slate-800 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-amazon-orange/50 appearance-none cursor-pointer">
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </SettingItem>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Bell className="h-4 w-4 text-amazon-orange" /> Notifications
          </h3>
        </div>
        <div className="divide-y divide-slate-800/60">
          <SettingItem icon={Bell} title="Email Notifications" description="Receive order updates and alerts via email">
            <Toggle value={emailNotif} onChange={setEmailNotif} />
          </SettingItem>
          <SettingItem icon={Bell} title="Push Notifications" description="Receive real-time browser notifications">
            <Toggle value={pushNotif} onChange={setPushNotif} />
          </SettingItem>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Shield className="h-4 w-4 text-amazon-orange" /> Security
          </h3>
        </div>
        <div className="divide-y divide-slate-800/60">
          <SettingItem icon={Shield} title="Two-Factor Authentication" description="Add an extra layer of security to your account">
            <Toggle value={twoFactor} onChange={setTwoFactor} />
          </SettingItem>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amazon-orange hover:bg-amber-500 text-slate-950 text-sm font-bold transition-colors shadow-lg cursor-pointer">
          {saved ? <><CheckCircle2 className="h-4 w-4" /> Saved</> : <><Save className="h-4 w-4" /> Save Changes</>}
        </button>
      </div>
    </div>
  );
};

export default Settings;
