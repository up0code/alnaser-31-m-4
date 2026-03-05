
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useDoc, useFirestore, useAuth } from '@/firebase';
import { doc, updateDoc, collection, query, orderBy, limit } from 'firebase/firestore';
import { updatePassword } from 'firebase/auth';
import { useMemoFirebase } from '@/firebase/provider';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  HeartPulse, 
  IdCard,
  Printer,
  Fingerprint,
  Pencil,
  Save,
  Camera,
  Upload,
  Lock,
  ShieldAlert,
  Key,
  CreditCard,
  History,
  FileDown
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useLanguage } from '@/components/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCollection } from '@/firebase/firestore/use-collection';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const { t, language, dir } = useLanguage();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    address: '',
    profileImageUrl: ''
  });

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const profileRef = useMemoFirebase(() => user ? doc(db, 'userProfiles', user.uid) : null, [db, user]);
  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  const paymentsRef = useMemoFirebase(() => 
    user ? query(collection(db, 'userProfiles', user.uid, 'membershipPayments'), orderBy('date', 'desc'), limit(5)) : null, 
    [db, user]
  );
  const { data: payments } = useCollection(paymentsRef);

  useEffect(() => {
    if (profile) {
      setEditForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        address: profile.address || '',
        profileImageUrl: profile.profileImageUrl || ''
      });
    }
  }, [profile]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 512) {
        toast({ 
          variant: 'destructive', 
          title: language === 'ar' ? "حجم الصورة كبير جداً" : "Image too large",
          description: language === 'ar' ? "الحد الأقصى هو 512 كيلوبايت" : "Max size is 512KB"
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, profileImageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, 'userProfiles', user.uid), editForm);
      toast({ title: language === 'ar' ? "تم تحديث الملف" : "Profile Updated" });
      setEditModalOpen(false);
    } catch (e) {
      toast({ variant: 'destructive', title: "Update Failed" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user || !newPassword) return;
    if (newPassword.length < 6) {
      toast({ variant: 'destructive', title: "Password too short", description: "Minimum 6 characters required." });
      return;
    }
    setIsUpdating(true);
    try {
      await updatePassword(user, newPassword);
      toast({ title: "Password Updated", description: "Your security credentials have been changed." });
      setPasswordModalOpen(false);
      setNewPassword('');
    } catch (e: any) {
      if (e.code === 'auth/requires-recent-login') {
        toast({ 
          variant: 'destructive', 
          title: "Security Timeout", 
          description: "Please logout and log back in to verify your identity before changing your password." 
        });
      } else {
        toast({ variant: 'destructive', title: "Update Failed", description: e.message });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black text-[10px] uppercase tracking-widest text-primary">Accessing Digital Identity...</p>
      </div>
    );
  }

  if (!profile) return null;

  const infoItems = [
    { icon: IdCard, label: t.qr.memberId, value: profile.memberNumber || profile.id },
    { icon: Mail, label: t.common.email, value: profile.email },
    { icon: HeartPulse, label: t.qr.bloodType, value: profile.bloodType || 'N/A' },
    { icon: Calendar, label: t.qr.birthDate, value: profile.birthDate || 'N/A' },
  ];

  return (
    <main className="min-h-screen bg-background pb-20">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-32 max-w-4xl">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Identity Card */}
          <Card className="w-full md:w-80 rounded-[2.5rem] border-none shadow-2xl bg-primary text-white overflow-hidden shrink-0">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
              <div className="relative group">
                <Avatar className="w-32 h-32 rounded-3xl border-4 border-white/20 shadow-2xl">
                  <AvatarImage src={profile.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`} />
                  <AvatarFallback className="bg-white/10 text-white font-black text-3xl">{profile.firstName?.[0]}</AvatarFallback>
                </Avatar>
                <Button 
                  size="icon" 
                  onClick={() => setEditModalOpen(true)}
                  className="absolute -bottom-2 -right-2 bg-accent text-white p-2 rounded-xl shadow-lg border-2 border-primary hover:scale-110 transition-transform"
                >
                  <Camera size={18} />
                </Button>
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">{profile.firstName} {profile.lastName}</h2>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                  <Badge variant="secondary" className="bg-white/20 text-white border-none font-bold text-[10px] uppercase tracking-widest px-4">
                    {profile.role}
                  </Badge>
                  <span className="text-xs font-black font-mono">#{profile.memberNumber}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-3xl shadow-xl">
                <QRCodeSVG value={JSON.stringify({ id: profile.id, num: profile.memberNumber })} size={140} level="H" />
              </div>

              <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Verified Identity Node</p>
            </CardContent>
          </Card>

          {/* Profile Details */}
          <div className="flex-grow space-y-8 w-full">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground flex items-center gap-4">
                  <Fingerprint className="text-primary" size={40} /> {language === 'ar' ? 'الملف الرقمي' : 'Digital Profile'}
                </h1>
                <p className="text-muted-foreground font-bold">{language === 'ar' ? 'هوية مجتمعية موحدة وآمنة' : 'Secure unified community identity'}</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setEditModalOpen(true)}
                className="rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 border-2"
              >
                <Pencil size={14} /> {language === 'ar' ? 'تعديل' : 'Edit'}
              </Button>
            </div>

            <Card className="rounded-[2rem] border-none shadow-xl bg-card overflow-hidden">
              <CardHeader className="p-8 border-b bg-secondary/5">
                <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-3">
                  <User size={20} className="text-primary" /> {t.qr.profileTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 grid sm:grid-cols-2 gap-6">
                {infoItems.map((item, i) => (
                  <div key={i} className="p-4 bg-secondary/10 rounded-2xl space-y-1.5 hover:bg-secondary/20 transition-colors">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <item.icon size={14} className="text-primary/60" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                    </div>
                    <p className="text-sm font-bold text-foreground">{item.value}</p>
                  </div>
                ))}
                <div className="p-4 bg-secondary/10 rounded-2xl space-y-1.5 col-span-full">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin size={14} className="text-primary/60" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{language === 'ar' ? 'العنوان' : 'ADDRESS'}</span>
                  </div>
                  <p className="text-sm font-bold text-foreground">{profile.address || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Financial History Section */}
            <Card className="rounded-[2rem] border-none shadow-xl bg-card overflow-hidden">
              <CardHeader className="p-8 border-b bg-emerald-500/5">
                <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-3 text-emerald-600">
                  <History size={20} /> {language === 'ar' ? 'سجل المساهمات' : 'Contribution History'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                {(!payments || payments.length === 0) ? (
                  <div className="text-center py-8 bg-secondary/5 rounded-3xl border-2 border-dashed">
                    <p className="text-xs font-bold text-muted-foreground opacity-60 italic">No financial records detected.</p>
                  </div>
                ) : (
                  payments.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between p-4 bg-secondary/10 rounded-2xl border border-primary/5 hover:bg-secondary/20 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm"><CreditCard size={20} /></div>
                        <div>
                          <p className="text-[10px] font-black uppercase opacity-60">{p.date}</p>
                          <p className="text-sm font-bold">{p.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-emerald-600">{p.currency} {p.amount}</p>
                        <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-widest border-emerald-500/20 text-emerald-600">VERIFIED</Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Security Section */}
            <Card className="rounded-[2rem] border-none shadow-xl bg-card overflow-hidden">
              <CardHeader className="p-8 border-b bg-destructive/5">
                <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-3 text-destructive">
                  <Lock size={20} /> {language === 'ar' ? 'الأمن والوصول' : 'Security & Access'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-secondary/10 p-6 rounded-3xl border border-primary/5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm">
                      <Key size={24} />
                    </div>
                    <div>
                      <p className="font-black uppercase text-[10px] opacity-60">{language === 'ar' ? 'كلمة المرور' : 'PASSWORD'}</p>
                      <p className="text-sm font-bold">••••••••••••</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="rounded-xl font-black uppercase tracking-widest text-[10px] h-10 border-2"
                    onClick={() => setPasswordModalOpen(true)}
                  >
                    {language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest shadow-xl gap-2" onClick={() => window.print()}>
                <Printer size={18} /> {t.qr.printCard}
              </Button>
              <Button variant="outline" className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest border-2 gap-2" onClick={() => router.push('/admin')}>
                <ShieldCheck size={18} /> Hub Control
              </Button>
            </div>

            <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Membership Status</p>
              <p className="text-xs font-bold text-foreground">Member Since {new Date(profile.memberSince).toLocaleDateString()}</p>
            </div>
          </div>

        </div>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="rounded-[2rem] p-6 md:p-8 sm:max-w-[500px] max-h-[85vh] overflow-y-auto scrollbar-hide border-none shadow-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">Edit Profile Node</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase opacity-60">First Name</Label>
                <Input value={editForm.firstName} onChange={e => setEditForm({...editForm, firstName: e.target.value})} className="rounded-xl h-12 font-bold" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase opacity-60">Last Name</Label>
                <Input value={editForm.lastName} onChange={e => setEditForm({...editForm, lastName: e.target.value})} className="rounded-xl h-12 font-bold" />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase opacity-60">Profile Picture</Label>
              <div className="flex items-center gap-4 p-4 bg-secondary/10 rounded-2xl border-2 border-dashed border-primary/20">
                <Avatar className="w-16 h-16 rounded-2xl border-2 border-white shadow-md">
                  <AvatarImage src={editForm.profileImageUrl} />
                  <AvatarFallback className="text-xs">IMG</AvatarFallback>
                </Avatar>
                <div className="flex-grow space-y-2">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="w-full rounded-xl gap-2 font-bold uppercase text-[10px]"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={14} /> {language === 'ar' ? 'رفع صورة' : 'Upload Image'}
                  </Button>
                  <p className="text-[8px] text-muted-foreground uppercase font-bold text-center">Max 512KB</p>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase opacity-60">Home Address</Label>
              <Input value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} className="rounded-xl h-12 font-bold" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setEditModalOpen(false)} className="rounded-xl font-bold">Cancel</Button>
            <Button onClick={handleUpdateProfile} disabled={isUpdating} className="rounded-xl h-12 font-black uppercase tracking-widest gap-2 shadow-xl">
              <Save size={16} /> {isUpdating ? 'Updating...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPasswordModalOpen} onOpenChange={setPasswordModalOpen}>
        <DialogContent className="rounded-[2rem] p-6 md:p-8 sm:max-w-[400px] border-none shadow-3xl overflow-x-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Lock className="text-primary" /> Security Update
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-3">
              <ShieldAlert size={20} className="text-primary shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-muted-foreground leading-relaxed uppercase">
                {language === 'ar' 
                  ? 'لأسباب أمنية، يتطلب تغيير كلمة المرور جلسة نشطة. إذا فشل التحديث، يرجى تسجيل الخروج والعودة مجدداً.' 
                  : 'FOR SECURITY, UPDATING YOUR PASSWORD REQUIRES A RECENT LOGIN SESSION. IF THIS FAILS, PLEASE LOG OUT AND BACK IN TO VERIFY YOUR IDENTITY.'}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase opacity-60">New Secure Password</Label>
              <Input 
                type="password" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                className="rounded-xl h-12 font-bold text-lg tracking-widest"
                placeholder="••••••••"
              />
            </div>
          </div>
          <DialogFooter className="flex-col gap-2">
            <Button onClick={handleChangePassword} disabled={isUpdating || !newPassword} className="w-full h-12 rounded-xl font-black uppercase tracking-widest shadow-xl">
              {isUpdating ? 'Processing...' : 'Confirm Update'}
            </Button>
            <Button variant="ghost" onClick={() => setPasswordModalOpen(false)} className="rounded-xl font-bold">Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @media print {
          nav, aside, button, footer, .print\:hidden { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; background: white !important; }
          .container { max-width: none !important; width: 100% !important; padding: 0 !important; margin: 0 !important; }
          body { background: white !important; color: black !important; }
        }
      `}</style>
    </main>
  );
}
