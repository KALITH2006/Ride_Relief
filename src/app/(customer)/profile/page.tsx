'use client';

import { useState } from 'react';
import { User, Mail, Phone, MapPin, Moon, Sun, LogOut, ChevronRight, Shield, CreditCard, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { profile, logout, updateProfile } = useAuthStore();
  const { isDark, toggle } = useThemeStore();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');

  const handleSave = async () => {
    await updateProfile({ name, phone });
    setIsEditing(false);
    toast.success('Profile updated!');
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const menuItems = [
    { icon: CreditCard, label: 'Payment Methods', desc: 'Manage your payment options' },
    { icon: MapPin, label: 'Saved Addresses', desc: 'Home, Work, and more' },
    { icon: Bell, label: 'Notifications', desc: 'Manage notification preferences' },
    { icon: Shield, label: 'Privacy & Security', desc: 'Account security settings' },
  ];

  const handleMenuClick = (label: string) => {
    toast(`Opening ${label}...`, { icon: '⚙️' });
  };

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Card variant="gradient" className="text-center">
          <Avatar name={profile?.name || 'User'} size="lg" className="mx-auto mb-3" />
          <h2 className="text-xl font-bold text-foreground">{profile?.name || 'User'}</h2>
          <p className="text-sm text-muted">{profile?.email}</p>
          <p className="text-xs text-muted mt-0.5 capitalize">{profile?.role} Account</p>
        </Card>
      </motion.div>

      {/* Edit Profile */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Personal Info</h3>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="text-sm text-primary font-medium"
          >
            {isEditing ? 'Save' : 'Edit'}
          </button>
        </div>

        <div className="space-y-3">
          {isEditing ? (
            <>
              <Input id="edit-name" label="Name" value={name} onChange={(e) => setName(e.target.value)} icon={<User size={16} />} />
              <Input id="edit-phone" label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} icon={<Phone size={16} />} />
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 py-2">
                <User className="text-muted" size={16} />
                <div>
                  <p className="text-xs text-muted">Name</p>
                  <p className="text-sm font-medium text-foreground">{profile?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2">
                <Mail className="text-muted" size={16} />
                <div>
                  <p className="text-xs text-muted">Email</p>
                  <p className="text-sm font-medium text-foreground">{profile?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2">
                <Phone className="text-muted" size={16} />
                <div>
                  <p className="text-xs text-muted">Phone</p>
                  <p className="text-sm font-medium text-foreground">{profile?.phone || 'Not set'}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Menu Items */}
      <Card>
        {menuItems.map((item, i) => (
          <button key={item.label} onClick={() => handleMenuClick(item.label)} className={`flex items-center gap-3 w-full py-3 hover:bg-border/30 transition-colors ${i > 0 ? 'border-t border-border' : ''}`}>
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <item.icon className="text-primary" size={16} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted">{item.desc}</p>
            </div>
            <ChevronRight className="text-muted" size={16} />
          </button>
        ))}
      </Card>

      {/* Dark Mode & Logout */}
      <Card>
        <button onClick={toggle} className="flex items-center gap-3 w-full py-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
            {isDark ? <Sun className="text-amber-500" size={16} /> : <Moon className="text-amber-500" size={16} />}
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-foreground">
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </p>
          </div>
          <div className={`w-11 h-6 rounded-full transition-colors ${isDark ? 'bg-primary' : 'bg-border'} relative`}>
            <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
        </button>

        <button onClick={handleLogout} className="flex items-center gap-3 w-full py-3 border-t border-border">
          <div className="w-9 h-9 rounded-xl bg-danger/10 flex items-center justify-center">
            <LogOut className="text-danger" size={16} />
          </div>
          <p className="text-sm font-medium text-danger">Logout</p>
        </button>
      </Card>
    </div>
  );
}
