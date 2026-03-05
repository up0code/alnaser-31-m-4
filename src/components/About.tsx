'use client';

import React from 'react';
import { Target, ShieldCheck, Database, LayoutTemplate, Globe, Smartphone, Shield, Server, Zap } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from './LanguageContext';

export function About() {
  const { t } = useLanguage();

  const goalIcons = [Globe, Database, LayoutTemplate, ShieldCheck];
  const techIcons = [Shield, Server, Smartphone, Zap];
  const techColors = ["bg-blue-600", "bg-emerald-600", "bg-indigo-600", "bg-amber-600"];

  return (
    <section id="about" className="py-24 bg-background text-foreground transition-colors">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="font-headline font-bold text-3xl md:text-4xl mb-4 relative section-title inline-block text-foreground">{t.about.title}</h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mt-4 leading-relaxed">
            {t.about.subtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-10">
            <div>
              <h3 className="text-2xl font-bold font-headline mb-4 flex items-center gap-3 text-foreground">
                <Target className="text-primary" size={28} /> {t.about.mission}
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                {t.about.missionText}
              </p>
            </div>

            <div className="bg-secondary/15 p-8 rounded-[1.5rem] border border-primary/5 shadow-sm">
              <h4 className="font-bold text-lg mb-6 text-foreground">{t.about.goalsTitle}</h4>
              <div className="grid sm:grid-cols-2 gap-6">
                {t.about.goals.map((goal: any, i: number) => {
                  const Icon = goalIcons[i];
                  return (
                    <div key={i} className="flex gap-4">
                      <div className="mt-1 w-10 h-10 rounded-xl bg-card flex items-center justify-center text-primary shadow-sm shrink-0">
                        <Icon size={20} />
                      </div>
                      <div>
                        <h5 className="font-bold text-base mb-1 leading-tight text-foreground">{goal.title}</h5>
                        <p className="text-sm text-muted-foreground leading-snug">{goal.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-bold font-headline mb-2 text-foreground">{t.about.techTitle}</h3>
            <p className="text-base text-muted-foreground mb-8">
              {t.about.techSubtitle}
            </p>
            
            <div className="grid gap-4">
              {t.about.techFeatures.map((item: any, i: number) => {
                const Icon = techIcons[i];
                return (
                  <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all rounded-[1.5rem] bg-card overflow-hidden">
                    <CardContent className="p-5 flex items-start gap-5">
                      <div className={`w-12 h-12 rounded-2xl ${techColors[i]} flex items-center justify-center text-white shrink-0 shadow-lg mt-1`}>
                        <Icon size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg mb-1 leading-tight text-foreground">{item.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}