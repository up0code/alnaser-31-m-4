'use client';

import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { MapPin, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export function Contact() {
  const { t } = useLanguage();
  const db = useFirestore();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const msgId = doc(collection(db, 'messages')).id;
      await setDoc(doc(db, 'messages', msgId), {
        ...formData,
        id: msgId,
        timestamp: new Date().toISOString()
      });
      setSubmitted(true);
      toast({ title: "Message Dispatched", description: "Our team will review your inquiry." });
    } catch (e) {
      toast({ variant: 'destructive', title: "Transmission Failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-background transition-colors">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-card rounded-[2rem] shadow-xl overflow-hidden flex flex-col lg:flex-row border border-border/50">
          <div className="p-8 lg:w-1/2">
            <h2 className="font-headline font-bold text-2xl md:text-3xl mb-4 text-foreground">{t.contact.title}</h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{t.contact.subtitle}</p>
            
            {submitted ? (
              <div className="text-center py-12 bg-emerald-500/5 rounded-3xl border-2 border-dashed border-emerald-500/20">
                <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-4" />
                <h3 className="font-black uppercase tracking-tighter">Transmission Received</h3>
                <p className="text-xs font-bold text-muted-foreground mt-2">Protocol secure. We will respond via email.</p>
                <button onClick={() => setSubmitted(false)} className="mt-6 text-[10px] font-black uppercase text-primary">Send New Message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-80 ml-1 text-foreground">{t.contact.name}</label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="w-full p-3 text-sm bg-secondary/30 dark:bg-secondary/10 rounded-xl border-none focus:ring-2 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground/60" placeholder={t.contact.name} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-80 ml-1 text-foreground">{t.contact.email}</label>
                    <input required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} type="email" className="w-full p-3 text-sm bg-secondary/30 dark:bg-secondary/10 rounded-xl border-none focus:ring-2 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground/60" placeholder="example@mail.com" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-80 ml-1 text-foreground">{t.contact.subject}</label>
                  <input required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} type="text" className="w-full p-3 text-sm bg-secondary/30 dark:bg-secondary/10 rounded-xl border-none focus:ring-2 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground/60" placeholder={t.contact.subject} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-80 ml-1 text-foreground">{t.contact.message}</label>
                  <textarea required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} rows={3} className="w-full p-3 text-sm bg-secondary/30 dark:bg-secondary/10 rounded-xl border-none focus:ring-2 focus:ring-primary outline-none resize-none transition-all text-foreground placeholder:text-muted-foreground/60" placeholder={t.contact.message}></textarea>
                </div>
                <button disabled={loading} className="w-full bg-primary text-white text-sm font-black py-3 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all uppercase tracking-widest mt-2 flex items-center justify-center gap-2">
                  {loading ? 'Sending...' : <><Send size={16} /> {t.contact.send}</>}
                </button>
              </form>
            )}
          </div>
          <div className="bg-primary p-8 lg:w-1/2 text-primary-foreground flex flex-col justify-center relative overflow-hidden">
            <div className="relative z-10 space-y-8 text-left">
              <div>
                <h3 className="text-xl font-bold mb-2 font-headline">{t.contact.infoTitle}</h3>
                <p className="text-sm opacity-90 leading-relaxed">{t.contact.infoDesc}</p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shadow-inner">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-80">{t.contact.addressTitle}</h4>
                    <p className="text-sm font-bold">{t.contact.addressDesc}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shadow-inner">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-80">{t.contact.emailTitle}</h4>
                    <p className="text-sm font-bold">support@al-melha.org</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shadow-inner">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-80">{t.contact.hoursTitle}</h4>
                    <p className="text-sm font-bold">{t.contact.hoursDesc}</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Soft decorative blur circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}