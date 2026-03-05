
"use client";

import React from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Users, HandHeart, Trophy, ShieldCheck, LogIn } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useLanguage } from './LanguageContext';
import { AuthModal } from './AuthModal';
import { useUser, useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';

export function Hero() {
  const { t, language, dir } = useLanguage();
  const { user } = useUser();
  const db = useFirestore();
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-community');

  // Fetch real counts from the database
  const membersRef = useMemoFirebase(() => collection(db, 'userProfiles'), [db]);
  const projectsRef = useMemoFirebase(() => collection(db, 'projects'), [db]);
  
  const { data: members } = useCollection(membersRef);
  const { data: projects } = useCollection(projectsRef);

  const memberCount = members?.length || 0;
  const projectCount = projects?.length || 0;

  return (
    <section id="home" className="relative pt-20 pb-10 overflow-hidden bg-background transition-colors">
      <div className="container mx-auto px-4 relative z-10">
        <div className={`flex flex-col lg:flex-row items-center gap-8 ${dir === 'rtl' ? 'lg:text-right' : 'lg:text-left'}`}>
          <div className="flex-1 text-center lg:text-right animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
              <ShieldCheck size={14} /> {language === 'ar' ? 'منصة آمنة وموثوقة' : 'Secure & Trusted Platform'}
            </div>
            <h1 className="font-headline font-bold text-2xl md:text-4xl text-foreground mb-3 leading-tight">
              {t.hero.title} <span className="text-primary italic">{t.hero.titleHighlight}</span>
            </h1>
            <p className={`text-sm text-muted-foreground mb-6 max-w-2xl mx-auto lg:mx-0 leading-relaxed`}>
              {language === 'ar' 
                ? 'ندير مجتمعنا بذكاء وشفافية، مع ضمان أمان البيانات والخصوصية الكاملة لجميع الأعضاء من خلال تقنيات حديثة.' 
                : 'Managing our community with intelligence and transparency, ensuring data security and complete privacy for all members.'}
            </p>
            <div className={`flex flex-wrap justify-center lg:justify-start gap-3`}>
              {!user ? (
                <AuthModal 
                  trigger={
                    <Button size="sm" className="h-10 px-8 rounded-xl shadow-xl shadow-primary/20 text-[11px] font-black uppercase tracking-[0.15em] gap-2">
                      <LogIn size={16} /> {t.common.login}
                    </Button>
                  } 
                />
              ) : (
                <Button size="sm" className="h-10 px-8 rounded-xl shadow-xl shadow-primary/20 text-[11px] font-black uppercase tracking-[0.15em]" onClick={() => window.location.href = '/admin'}>
                  {t.common.dashboard}
                </Button>
              )}
              <Button size="sm" variant="outline" className="h-10 px-8 rounded-xl border-2 text-[11px] font-black uppercase tracking-[0.15em] text-foreground">
                {t.hero.ctaLearn}
              </Button>
            </div>
            
            <div className={`grid grid-cols-3 gap-3 mt-10 max-w-md mx-auto lg:mx-0`}>
              <div className="flex flex-col items-center lg:items-start">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-1.5">
                  <Users size={16} />
                </div>
                <span className="font-bold text-lg leading-none text-foreground">+{memberCount}</span>
                <span className="text-[9px] text-muted-foreground uppercase mt-1 font-black tracking-widest">{t.hero.activeMembers}</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center text-accent mb-1.5">
                  <HandHeart size={16} />
                </div>
                <span className="font-bold text-lg leading-none text-foreground">+{projectCount}</span>
                <span className="text-[9px] text-muted-foreground uppercase mt-1 font-black tracking-widest">{t.hero.communityProjects}</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <div className="w-8 h-8 bg-secondary dark:bg-slate-800 rounded-lg flex items-center justify-center text-secondary-foreground dark:text-slate-300 mb-1.5">
                  <Trophy size={16} />
                </div>
                <span className="font-bold text-lg leading-none text-foreground">100%</span>
                <span className="text-[9px] text-muted-foreground uppercase mt-1 font-black tracking-widest">{t.hero.financialTransparency}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 relative animate-fade-in w-full max-w-md lg:max-w-lg">
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-slate-800">
              <Image 
                src={heroImage?.imageUrl || "https://picsum.photos/seed/community/800/600"} 
                alt="Community" 
                fill 
                className="object-cover"
                data-ai-hint="community gathering"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl -z-10"></div>
    </section>
  );
}
