
"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth, useFirestore } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { useLanguage } from './LanguageContext';
import { Eye, EyeOff, ShieldCheck, ArrowLeft, LogIn, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface AuthModalProps {
  trigger?: React.ReactNode;
}

export function AuthModal({ trigger }: AuthModalProps) {
  const { t, language } = useLanguage();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'forgot'>('login');

  // Load remembered email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // CRITICAL: Clear sensitive state when modal closes
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        // If not remembering, clear email. Always clear password.
        if (!rememberMe) {
          setEmail('');
        }
        setPassword('');
        setMode('login');
        setLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open, rememberMe]);

  const generateMemberNumber = () => Math.floor(100000 + Math.random() * 900000).toString();

  const handleAuthError = (error: any) => {
    let message = error.message;
    
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      message = language === 'ar' 
        ? "بيانات الاعتماد غير صالحة. يرجى التأكد من البريد وكلمة المرور." 
        : "Invalid credentials. Please verify your email and password.";
    } else if (error.code === 'auth/popup-closed-by-user') {
      message = language === 'ar' ? "تم إغلاق نافذة تسجيل الدخول." : "Login window closed.";
    }
    
    toast({
      variant: "destructive",
      title: language === 'ar' ? "خطأ في التحقق" : "Auth Error",
      description: message,
    });
  };

  const checkRoleAndRedirect = async (userId: string, userEmail: string | null, photoURL: string | null = null) => {
    if (!userEmail) return;
    const cleanEmail = userEmail.toLowerCase().trim();

    // Handle Remember Me storage
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', cleanEmail);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    let profileSnap = await getDoc(doc(db, 'userProfiles', userId));
    let profileData = profileSnap.exists() ? profileSnap.data() : null;

    if (!profileData) {
      const q = query(collection(db, 'userProfiles'), where('email', '==', cleanEmail));
      const querySnap = await getDocs(q);
      
      if (!querySnap.empty) {
        const existingDoc = querySnap.docs[0];
        const existingData = existingDoc.data();
        profileData = { 
          ...existingData, 
          id: userId, 
          memberNumber: existingData.memberNumber || generateMemberNumber(),
          updatedAt: new Date().toISOString(),
          profileImageUrl: existingData.profileImageUrl || photoURL || ''
        };
        await setDoc(doc(db, 'userProfiles', userId), profileData);
        if (existingDoc.id !== userId) { 
          await deleteDoc(doc(db, 'userProfiles', existingDoc.id)); 
        }
      }
    }

    if (profileData) {
      const userRole = (profileData.role || '').toLowerCase();
      const managementRoles = ['admin', 'president', 'secretary', 'treasurer', 'executive'];
      if (managementRoles.includes(userRole) || cleanEmail === 'up0code@gmail.com') {
        router.push('/admin');
      } else {
        router.push('/profile');
      }
    } else {
      const isSuperAdmin = cleanEmail === 'up0code@gmail.com';
      await setDoc(doc(db, 'userProfiles', userId), {
        id: userId, 
        memberNumber: generateMemberNumber(),
        email: cleanEmail, 
        role: isSuperAdmin ? 'admin' : 'user',
        memberSince: new Date().toISOString(), 
        status: 'Active',
        firstName: userEmail.split('@')[0], 
        lastName: '',
        profileImageUrl: photoURL || ''
      });
      router.push('/profile');
    }
  };

  const handleSocialSignIn = async (providerName: 'google' | 'facebook') => {
    setLoading(true);
    try {
      const provider = providerName === 'google' ? new GoogleAuthProvider() : new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await checkRoleAndRedirect(result.user.uid, result.user.email, result.user.photoURL);
      setOpen(false);
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const cleanEmail = email.toLowerCase().trim();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      await checkRoleAndRedirect(userCredential.user.uid, userCredential.user.email, userCredential.user.photoURL);
      setOpen(false);
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.toLowerCase());
      toast({ title: language === 'ar' ? "تم إرسال الرابط" : "Reset Link Sent" });
      setMode('login');
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button size="sm" className="h-9 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px]">{t.common.login}</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[380px] w-[92vw] max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-[2.5rem] p-0 shadow-3xl border-none bg-card scrollbar-hide">
        <DialogHeader className="p-6 md:p-8 pb-4 text-center bg-secondary/5 shrink-0 border-b">
          <div className="mx-auto w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg mb-4"><ShieldCheck size={28} /></div>
          <DialogTitle className="text-xl font-black uppercase tracking-tighter text-foreground">{t.common.appName}</DialogTitle>
        </DialogHeader>
        
        <div className="p-6 md:p-8 pt-4 overflow-x-hidden">
          {mode === 'login' ? (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-black uppercase tracking-tight">{t.common.welcomeBack}</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Secure Access Protocol</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4" autoComplete="on">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">{t.common.email}</Label>
                  <Input 
                    type="email" 
                    placeholder="email@gmail.com" 
                    className="h-11 rounded-xl bg-secondary/20 border-none px-4 font-bold" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    autoComplete="username"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">{t.common.password}</Label>
                    <button type="button" onClick={() => setMode('forgot')} className="text-[9px] font-bold text-primary uppercase">Forgot?</button>
                  </div>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      className="h-11 rounded-xl bg-secondary/20 border-none px-4 font-bold" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                      autoComplete="current-password"
                    />
                    <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2 px-1">
                  <Checkbox 
                    id="remember" 
                    checked={rememberMe} 
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)} 
                    className="rounded-md border-2"
                  />
                  <Label htmlFor="remember" className="text-[10px] font-black uppercase text-muted-foreground cursor-pointer tracking-wider">
                    Remember my identity node
                  </Label>
                </div>

                <Button type="submit" disabled={loading} className="w-full h-12 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl bg-primary text-white active:scale-95 transition-all">
                  {loading ? t.common.loading : t.common.login}
                </Button>
                
                <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                  <AlertCircle size={18} className="text-primary shrink-0" />
                  <p className="text-[9px] text-muted-foreground font-black uppercase tracking-wider leading-relaxed">
                    {language === 'ar' ? 'الدخول مقتصر على الأعضاء المسجلين من قبل الإدارة' : 'ACCESS RESTRICTED TO MEMBERS ENROLLED BY MANAGEMENT'}
                  </p>
                </div>
              </form>

              <div className="relative py-2"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-muted/30"></span></div><div className="relative flex justify-center text-[9px] uppercase font-black"><span className="bg-card px-4 text-muted-foreground">Or connect with</span></div></div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-11 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 hover:bg-secondary/10" onClick={() => handleSocialSignIn('google')}>Google</Button>
                <Button variant="outline" className="h-11 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 hover:bg-secondary/10" onClick={() => handleSocialSignIn('facebook')}>Facebook</Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-6" autoComplete="off">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-black uppercase tracking-tight">Recovery</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Reset your secure key</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase ml-1">{t.common.email}</Label>
                <Input 
                  type="email" 
                  className="h-11 rounded-xl bg-secondary/20 border-none" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  autoComplete="email"
                />
              </div>
              <div className="space-y-3">
                <Button type="submit" disabled={loading} className="w-full h-12 text-[10px] font-black uppercase tracking-widest rounded-xl bg-primary text-white shadow-lg">{loading ? t.common.loading : 'SEND RESET LINK'}</Button>
                <Button type="button" variant="ghost" className="w-full h-11 text-[10px] font-bold rounded-xl" onClick={() => setMode('login')}><ArrowLeft size={14} className="mr-2" /> BACK</Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
