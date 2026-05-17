'use client';

import { useState } from 'react';
import { User, Mail, Phone, Star, Car, LogOut, Moon, Sun, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function DriverProfilePage() {
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

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
      {/* Profile Card */}
      <Card variant="gradient" className="text-center">
        <Avatar name={profile?.name || 'Driver'} size="lg" className="mx-auto mb-3" />
        <h2 className="text-xl font-bold text-foreground">{profile?.name}</h2>
        <p className="text-sm text-muted">{profile?.email}</p>
        <div className="flex items-center justify-center gap-1 mt-2">
          <Star className="text-amber-400 fill-amber-400" size={14} />
          <span className="text-sm font-medium text-foreground">4.8</span>
          <span className="text-xs text-muted">· 245 trips</span>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <Car className="mx-auto text-primary mb-1" size={18} />
          <p className="text-lg font-bold text-foreground">245</p>
          <p className="text-[10px] text-muted">Trips</p>
        </Card>
        <Card className="text-center">
          <Star className="mx-auto text-amber-500 mb-1" size={18} />
          <p className="text-lg font-bold text-foreground">4.8</p>
          <p className="text-[10px] text-muted">Rating</p>
        </Card>
        <Card className="text-center">
          <span className="text-lg">🏆</span>
          <p className="text-lg font-bold text-foreground">Gold</p>
          <p className="text-[10px] text-muted">Tier</p>
        </Card>
      </div>

      {/* Personal Info */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Personal Info</h3>
          <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className="text-sm text-primary font-medium">
            {isEditing ? 'Save' : 'Edit'}
          </button>
        </div>
        {isEditing ? (
          <div className="space-y-3">
            <Input id="driver-name" label="Name" value={name} onChange={(e) => setName(e.target.value)} icon={<User size={16} />} />
            <Input id="driver-phone" label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} icon={<Phone size={16} />} />
          </div>
        ) : (
          <div className="space-y-3">
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
          </div>
        )}
      </Card>

      {/* Settings */}
      <Card>
        <button onClick={toggle} className="flex items-center gap-3 w-full py-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
            {isDark ? <Sun className="text-amber-500" size={16} /> : <Moon className="text-amber-500" size={16} />}
          </div>
          <span className="text-sm font-medium text-foreground flex-1 text-left">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          <div className={`w-11 h-6 rounded-full transition-colors ${isDark ? 'bg-primary' : 'bg-border'} relative`}>
            <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
        </button>

        <button onClick={handleLogout} className="flex items-center gap-3 w-full py-3 border-t border-border">
          <div className="w-9 h-9 rounded-xl bg-danger/10 flex items-center justify-center">
            <LogOut className="text-danger" size={16} />
          </div>
          <span className="text-sm font-medium text-danger">Logout</span>
        </button>
      </Card>
    </div>
  );
}
