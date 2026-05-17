'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, AlertTriangle, CloudRain, Car, Zap, Clock } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

const MOCK_CONFIG = {
  basePrices: {
    acting_driver: 300,
    mechanic: 250,
    rental: 500,
    emergency: 700,
  },
  surges: {
    rain: 1.2,
    storm: 1.5,
    high_traffic: 1.3,
    high_demand: 1.5,
    emergency_fee: 1.5,
  }
};

export default function AdminPricingPanel() {
  const [config, setConfig] = useState(MOCK_CONFIG);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // In real app, push config to Firestore 'settings/pricing' doc
    await new Promise(r => setTimeout(r, 800));
    toast.success('Pricing configuration updated successfully.');
    setIsSaving(false);
  };

  const handleBaseChange = (service: keyof typeof config.basePrices, val: string) => {
    setConfig({
      ...config,
      basePrices: { ...config.basePrices, [service]: Number(val) }
    });
  };

  const handleSurgeChange = (type: keyof typeof config.surges, val: string) => {
    setConfig({
      ...config,
      surges: { ...config.surges, [type]: Number(val) }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dynamic Pricing Engine</h1>
        <p className="text-sm text-muted mt-1">Configure base fares and real-time surge multipliers</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Base Prices */}
        <Card variant="elevated" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Settings size={18} />
            </div>
            <h2 className="text-xl font-bold text-foreground">Base Prices (₹)</h2>
          </div>
          
          <div className="space-y-4">
            {Object.entries(config.basePrices).map(([service, price]) => (
              <div key={service} className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground capitalize">
                  {service.replace('_', ' ')}
                </label>
                <div className="relative w-32">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">₹</span>
                  <input 
                    type="number" 
                    value={price}
                    onChange={(e) => handleBaseChange(service as any, e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-surface border border-border rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Surge Multipliers */}
        <Card variant="elevated" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Zap size={18} />
            </div>
            <h2 className="text-xl font-bold text-foreground">Surge Multipliers</h2>
          </div>
          
          <div className="space-y-4">
            {[
              { key: 'rain', label: 'Rain Weather Surge', icon: CloudRain },
              { key: 'storm', label: 'Storm/Severe Weather', icon: AlertTriangle },
              { key: 'high_traffic', label: 'High Traffic Surge', icon: Car },
              { key: 'high_demand', label: 'High Demand (Ratio > 2)', icon: Clock },
              { key: 'emergency_fee', label: 'Emergency Priority Fee', icon: AlertTriangle },
            ].map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon size={14} className="text-muted" />
                  <label className="text-sm font-medium text-foreground">{label}</label>
                </div>
                <div className="relative w-32 flex items-center gap-2">
                  <input 
                    type="number" 
                    step="0.1"
                    value={config.surges[key as keyof typeof config.surges]}
                    onChange={(e) => handleSurgeChange(key as any, e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none"
                  />
                  <span className="text-sm text-muted font-mono">x</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button size="lg" onClick={handleSave} isLoading={isSaving} className="w-full md:w-auto">
          <Save size={18} className="mr-2" />
          Save Pricing Configuration
        </Button>
      </div>

    </div>
  );
}
