'use client';

import React, { useState } from 'react';
import { ShieldCheck, LogIn, Send, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from './LanguageContext';
import { useUser, useFirestore } from '@/firebase';
import { AuthModal } from './AuthModal';
import { collection, doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export function Membership() {
  const { t, language } = useLanguage();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    nationalId: '',
    bloodType: '',
    address: '',
    statement: ''
  });

  if (user) return null;

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const appId = doc(collection(db, 'applications')).id;
      await setDoc(doc(db, 'applications', appId), {
        ...formData,
        id: appId,
        email: formData.email.toLowerCase(),
        status: 'Pending',
        createdAt: new Date().toISOString()
      });
      setIsSubmitted(true);
      toast({ title: t.membership.formSent });
    } catch (e) {
      toast({ variant: 'destructive', title: "Application Failed to Send" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="membership" className="py-24 bg-secondary/5 transition-colors">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-8">
            <div>
              <h2 className="font-headline font-bold text-3xl md:text-4xl mb-4 relative section-title inline-block text-foreground">
                {t.nav.membership}
              </h2>
              <p className="text-base text-muted-foreground mt-4 leading-relaxed">
                {t.membership.subtitle}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {t.membership.benefits.map((b: any, i: number) => (
                <div key={i} className="p-4 bg-card rounded-2xl shadow-sm border border-primary/5">
                  <h4 className="font-bold text-sm mb-1 text-primary">{b.title}</h4>
                  <p className="text-xs text-muted-foreground leading-snug">{b.desc}</p>
                </div>
              ))}
            </div>

            <div className="p-6 bg-primary/10 rounded-[2rem] flex items-center justify-between gap-6">
              <div>
                <p className="text-xs font-bold text-foreground mb-1">{language === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?'}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">SECURE LOGIN ACCESS</p>
              </div>
              <AuthModal trigger={
                <Button variant="default" className="rounded-xl h-10 px-6 font-black uppercase tracking-widest text-[10px]">
                  <LogIn className="mr-2" size={16} /> {t.common.login}
                </Button>
              } />
            </div>
          </div>

          <Card className="rounded-[3rem] border-none shadow-3xl bg-card overflow-hidden">
            <CardContent className="p-8 md:p-10">
              {isSubmitted ? (
                <div className="text-center py-12 space-y-6">
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                    <CheckCircle2 size={48} />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tighter">Application Received</h3>
                  <p className="text-sm text-muted-foreground">{t.membership.formSent}</p>
                  <Button variant="outline" className="rounded-xl" onClick={() => setIsSubmitted(false)}>Send Another</Button>
                </div>
              ) : (
                <form onSubmit={handleApply} className="space-y-4">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                      <ShieldCheck size={32} />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tighter">{t.membership.title}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase opacity-60">First Name</Label>
                      <Input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="rounded-xl h-10 text-xs" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase opacity-60">Last Name</Label>
                      <Input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="rounded-xl h-10 text-xs" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase opacity-60">{t.common.email}</Label>
                    <Input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="rounded-xl h-10 text-xs" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase opacity-60">National ID</Label>
                      <Input required value={formData.nationalId} onChange={e => setFormData({...formData, nationalId: e.target.value})} className="rounded-xl h-10 text-xs" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase opacity-60">Blood Type</Label>
                      <Input value={formData.bloodType} onChange={e => setFormData({...formData, bloodType: e.target.value})} className="rounded-xl h-10 text-xs" placeholder="e.g. A+" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase opacity-60">Home Address</Label>
                    <Input required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="rounded-xl h-10 text-xs" />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase opacity-60">{t.membership.statement}</Label>
                    <Textarea required value={formData.statement} onChange={e => setFormData({...formData, statement: e.target.value})} className="rounded-xl min-h-[80px] text-xs" />
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl mt-4">
                    {isLoading ? t.common.loading : <><Send size={16} className="mr-2" /> {t.membership.applyNow}</>}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
