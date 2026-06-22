import React from "react";
import { apiUrl } from "@/lib/apiBase";

type MaintenanceSettings = {
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  contactEmail?: string;
  contactPhone?: string;
};

function MaintenanceScreen({ settings }: { settings: MaintenanceSettings }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0057FF] via-[#174bff] to-[#003ACC] px-5 py-12 text-white">
      <div className="mx-auto flex min-h-[75vh] max-w-2xl flex-col items-center justify-center text-center">
        <div className="mb-6 rounded-full bg-white/15 px-5 py-2 text-sm font-bold uppercase tracking-wider">
          Maintenance Mode
        </div>
        <h1 className="mb-5 text-4xl font-black leading-tight sm:text-5xl">
          Athoo is currently under maintenance
        </h1>
        <p className="mb-8 text-lg leading-8 text-white/85">
          {settings.maintenanceMessage || "Athoo website is under maintenance. Please check back soon."}
        </p>
        <div className="rounded-3xl bg-white/10 p-5 text-sm text-white/90 backdrop-blur">
          <p className="font-bold">Need urgent help?</p>
          <p>Email: {settings.contactEmail || "official@athoo.pk"}</p>
          <p>WhatsApp: {settings.contactPhone || "+92 339 0051068"}</p>
        </div>
      </div>
    </div>
  );
}

export default function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<MaintenanceSettings | null>(null);
  const [checked, setChecked] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 5000);

    fetch(apiUrl(`/api/public/settings?ts=${Date.now()}`), {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        setSettings(data || {});
      })
      .catch(() => {
        if (!active) return;
        setSettings({ maintenanceMode: false });
      })
      .finally(() => {
        if (!active) return;
        window.clearTimeout(timer);
        setChecked(true);
      });

    return () => {
      active = false;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, []);

  if (!checked) return <>{children}</>;
  if (settings?.maintenanceMode) return <MaintenanceScreen settings={settings} />;
  return <>{children}</>;
}
