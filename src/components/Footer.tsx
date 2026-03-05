'use client';

import React, { useState } from 'react';
import { Users, Facebook, Twitter, Instagram, Mail, Phone, MapPin, ExternalLink, Send } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from './LanguageContext';
import { useFirestore } from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export function Footer() {
  const { t, dir } = useLanguage();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const subId = doc(collection(db, 'newsletter_subscribers')).id;
      await setDoc(doc(db, 'newsletter_subscribers', subId), {
        id: subId,
        email: email.toLowerCase(),
        subscribedAt: new Date().toISOString()
      });
      toast({ title: "Subscription Active", description: "You've been added to our registry." });
      setEmail('');
    } catch (e) {
      toast({ variant: 'destructive', title: "Subscription Failed" });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <footer className="bg-slate-900 dark:bg-slate-800 text-white pt-24 pb-12 transition-colors">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
                <Users size={24} />
              </div>
              <h2 className="font-headline font-bold text-xl">{t.common.appName}</h2>
            </div>
            <p className="text-slate-400 dark:text-slate-300 text-sm leading-relaxed">
              {t.footer.about}
            </p>
            <div className="flex gap-3 pt-2">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-primary flex items-center justify-center transition-all hover:-translate-y-1 shadow-sm">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className={`font-bold text-base mb-8 relative after:content-[''] after:absolute after:bottom-[-0.6rem] ${dir === 'rtl' ? 'after:right-0' : 'after:left-0'} after:w-10 after:h-1 after:bg-primary`}>
              {t.footer.links}
            </h4>
            <ul className="space-y-4">
              {[t.nav.about, t.nav.projects, t.nav.financial, t.nav.events, t.nav.directory].map((link, i) => (
                <li key={i}>
                  <Link href="#" className="text-slate-400 dark:text-slate-300 hover:text-white flex items-center gap-3 transition-colors text-sm font-bold uppercase tracking-widest group">
                    <ExternalLink size={14} className="text-primary group-hover:scale-110 transition-transform" /> {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className={`font-bold text-base mb-8 relative after:content-[''] after:absolute after:bottom-[-0.6rem] ${dir === 'rtl' ? 'after:right-0' : 'after:left-0'} after:w-10 after:h-1 after:bg-primary`}>
              {t.footer.contact}
            </h4>
            <ul className="space-y-5">
              <li className="flex items-start gap-4">
                <MapPin className="text-primary shrink-0" size={20} />
                <span className="text-slate-400 dark:text-slate-300 text-sm leading-snug">{t.footer.address}</span>
              </li>
              <li className="flex items-center gap-4">
                <Phone className="text-primary shrink-0" size={20} />
                <span className="text-slate-400 dark:text-slate-300 text-sm font-bold tracking-wider" dir="ltr">+123 456 7890</span>
              </li>
              <li className="flex items-center gap-4">
                <Mail className="text-primary shrink-0" size={20} />
                <span className="text-slate-400 dark:text-slate-300 text-sm font-bold">contact@al-melha.org</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className={`font-bold text-base mb-8 relative after:content-[''] after:absolute after:bottom-[-0.6rem] ${dir === 'rtl' ? 'after:right-0' : 'after:left-0'} after:w-10 after:h-1 after:bg-primary`}>
              {t.footer.newsletter}
            </h4>
            <p className="text-slate-400 dark:text-slate-300 text-sm mb-6 leading-relaxed">{t.footer.newsletterDesc}</p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.common.email} 
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm focus:outline-none focus:border-primary transition-all shadow-inner text-white placeholder:text-slate-500"
              />
              <button disabled={loading} className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl transition-all shadow-xl shadow-primary/10 flex items-center justify-center gap-2">
                {loading ? '...' : <><Send size={14} /> {t.footer.subscribe}</>}
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">
          <p>{t.footer.rights}</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">{t.footer.privacy}</a>
            <a href="#" className="hover:text-white transition-colors">{t.footer.terms}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}