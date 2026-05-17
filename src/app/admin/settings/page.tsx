'use client';

import { useState } from 'react';
import { Save, IndianRupee, Car, Shield, Wrench, Phone } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

const serviceConfigs = [
  { id: 'acting_driver', label: 'Acting Driver', icon: Car, baseFare: 99, perKm: 12, minFare: 99 },
  { id: 'rental', label: 'Rental Vehicle', icon: Shield, baseFare: 299, perKm: 15, minFare: 299 },
  { id: 'mechanic', label: 'Mechanic', icon: Wrench, baseFare: 149, perKm: 10, minFare: 149 },
  { id: 'emergency', label: 'Emergency', icon: Phone, baseFare: 199, perKm: 18, minFare: 199 },
];

export default function AdminSettingsPage() {
  const [configs, setConfigs] = useState(serviceConfigs);
  const [sosPhone, setSosPhone] = useState('+911234567890');

  const updateConfig = (id: string, field: string, value: number) => {
    setConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleSave = () => {
    toast.success('Settings saved!');
  };

  const handleEditTemplate = (event: string) => {
    toast(`Editing template for: ${event}`, { icon: '📝' });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted mt-1">Platform configuration</p>
        </div>
        <Button onClick={handleSave}>
          <Save size={14} /> Save Changes
        </Button>
      </div>

      {/* Pricing */}
      <Card variant="elevated">
        <h3 className="font-semibold text-foreground mb-4">Pricing Configuration</h3>
        <div className="space-y-4">
          {configs.map((c) => (
            <div key={c.id} className="flex items-center gap-4 p-3 rounded-xl bg-border/20">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <c.icon className="text-primary" size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground mb-2">{c.label}</p>
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    id={`${c.id}-base`}
                    label="Base Fare (₹)"
                    type="number"
                    value={c.baseFare}
                    onChange={(e) => updateConfig(c.id, 'baseFare', Number(e.target.value))}
                    icon={<IndianRupee size={14} />}
                  />
                  <Input
                    id={`${c.id}-perkm`}
                    label="Per KM (₹)"
                    type="number"
                    value={c.perKm}
                    onChange={(e) => updateConfig(c.id, 'perKm', Number(e.target.value))}
                  />
                  <Input
                    id={`${c.id}-min`}
                    label="Min Fare (₹)"
                    type="number"
                    value={c.minFare}
                    onChange={(e) => updateConfig(c.id, 'minFare', Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* SOS Config */}
      <Card variant="elevated">
        <h3 className="font-semibold text-foreground mb-4">SOS Configuration</h3>
        <Input
          id="sos-phone"
          label="SOS Phone Number"
          value={sosPhone}
          onChange={(e) => setSosPhone(e.target.value)}
          icon={<Phone size={16} />}
        />
        <p className="text-xs text-muted mt-2">
          This number is shown to users in offline SOS mode
        </p>
      </Card>

      {/* Notifications */}
      <Card variant="elevated">
        <h3 className="font-semibold text-foreground mb-4">Notification Templates</h3>
        <div className="space-y-3">
          {[
            { event: 'Booking Confirmed', template: 'Your {service} booking #{id} is confirmed! A provider will be assigned shortly.' },
            { event: 'Driver Assigned', template: '{driver} has been assigned to your booking. They will arrive in approximately {eta} minutes.' },
            { event: 'Job Completed', template: 'Your trip has been completed. Total fare: ₹{amount}. Thank you for using RideRelief!' },
          ].map((t) => (
            <div key={t.event} className="p-3 rounded-xl border border-border">
              <p className="text-sm font-medium text-foreground mb-1">{t.event}</p>
              <p className="text-xs text-muted">{t.template}</p>
              <button onClick={() => handleEditTemplate(t.event)} className="mt-2 text-xs text-primary font-medium">Edit Template</button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
