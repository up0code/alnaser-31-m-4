"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { 
  ShieldCheck, 
  Eye, 
  Vote, 
  FileText, 
  CheckCircle2, 
  Lock, 
  Download, 
  FileSearch,
  ShieldAlert
} from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import { AuthModal } from './AuthModal';
import { Button } from '@/components/ui/button';

export function Financials() {
  const { t, language } = useLanguage();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  // Fetch reports for the restricted card - only if user is logged in
  const reportsRef = useMemoFirebase(() => 
    user ? query(collection(db, 'annual_reports'), orderBy('date', 'desc'), limit(3)) : null, 
    [db, user]
  );
  const { data: dbReports } = useCollection(reportsRef);

  // Fallback static reports if DB is empty, so user sees content immediately
  const staticReports = [
    { id: 'rep-1', name: language === 'ar' ? 'تقرير الربع الثالث 2023' : 'Q3 2023 Fiscal Report', type: 'PDF', date: '2023-10-15' },
    { id: 'rep-2', name: language === 'ar' ? 'تقرير التدقيق السنوي' : 'Annual Audit Review', type: 'PDF', date: '2023-06-20' },
    { id: 'rep-3', name: language === 'ar' ? 'ميزانية المشاريع التنموية' : 'Development Projects Budget', type: 'PDF', date: '2023-01-10' }
  ];

  const reports = dbReports && dbReports.length > 0 ? dbReports : staticReports;

  const chartData = [
    { name: language === 'ar' ? 'المشاريع والتطوير' : 'Projects & Development', value: 250000, color: 'hsl(var(--primary))' },
    { name: language === 'ar' ? 'التشغيل والإدارة' : 'Operations & Admin', value: 120000, color: 'hsl(var(--accent))' },
    { name: language === 'ar' ? 'الفعاليات والأنشطة' : 'Events & Activities', value: 80000, color: 'hsl(var(--chart-3))' },
  ];

  const featureIcons = [Eye, CheckCircle2, Vote];

  return (
    <section id="financial" className="py-24 bg-background text-foreground transition-colors">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header - Always Visible */}
        <div className="text-center mb-16">
          <h2 className="font-headline font-bold text-3xl md:text-4xl mb-3 relative section-title inline-block text-foreground">{t.financial.title}</h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mt-2 leading-relaxed">{t.financial.subtitle}</p>
        </div>

        {/* Data Layer - Authenticated vs Public */}
        <div className="mb-16">
          {isUserLoading ? (
            <div className="py-24 text-center font-black uppercase text-[10px] tracking-widest opacity-40">Verifying Financial Access...</div>
          ) : user ? (
            /* MEMBER VIEW: Charts and Reports */
            <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
              {/* Budget Card */}
              <Card className="rounded-[2rem] shadow-xl border-none bg-card overflow-hidden">
                <CardHeader className="p-8 pb-2 border-b bg-secondary/5">
                  <CardTitle className="flex items-center gap-3 font-black text-xs uppercase tracking-widest text-primary">
                    <FileText size={18} /> {t.financial.budget}
                  </CardTitle>
                  <CardDescription className="text-[10px] mt-1 font-bold text-muted-foreground">{t.financial.budgetDesc}</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={90}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '20px', fontSize: '10px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', backgroundColor: 'hsl(var(--card))' }} />
                        <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Collection Card */}
              <Card className="rounded-[2rem] shadow-2xl border-none bg-primary text-primary-foreground overflow-hidden relative flex flex-col">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <ShieldCheck size={140} />
                </div>
                <CardHeader className="p-8">
                  <CardTitle className="font-headline text-primary-foreground text-2xl uppercase font-black">{t.financial.collection}</CardTitle>
                  <CardDescription className="text-[10px] opacity-70 text-primary-foreground mt-1 font-black uppercase tracking-widest">Active Fiscal Cycle</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center flex-grow p-8">
                  <div className="text-7xl font-black mb-4 tracking-tighter">92%</div>
                  <p className="text-[10px] uppercase tracking-[0.4em] font-black opacity-80">{t.financial.collectionRate}</p>
                  
                  <div className="w-full mt-10 space-y-4">
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                      <span>{t.financial.paidMembers}</span>
                      <span>237</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden shadow-inner">
                      <div className="bg-white h-full transition-all duration-1000 shadow-[0_0_15px_white]" style={{ width: '92%' }}></div>
                    </div>
                    <div className="flex justify-between text-[9px] opacity-60 font-black uppercase tracking-widest">
                      <span>Target: 257 Members</span>
                      <span>Goal reached</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Annual Reports Card */}
              <Card className="rounded-[2rem] shadow-xl border-none bg-secondary/20 flex flex-col overflow-hidden">
                <CardHeader className="p-8 pb-2 border-b bg-white/50">
                  <CardTitle className="flex items-center gap-3 font-black text-xs uppercase tracking-widest text-primary">
                    <FileSearch size={18} /> {t.financial.reports}
                  </CardTitle>
                  <CardDescription className="text-[10px] mt-1 font-bold text-muted-foreground">{t.financial.reportsDesc}</CardDescription>
                </CardHeader>
                <CardContent className="p-8 flex-grow">
                  <div className="space-y-3">
                    {reports.map((report: any) => (
                      <div key={report.id} className="group flex items-center justify-between p-4 bg-card rounded-2xl shadow-sm border border-primary/5 hover:border-primary/20 transition-all hover:translate-x-1">
                        <div className="overflow-hidden">
                          <p className="text-xs font-black uppercase truncate">{report.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[8px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-md uppercase">{report.type}</span>
                            <span className="text-[9px] text-muted-foreground font-mono">{report.date}</span>
                          </div>
                        </div>
                        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl text-primary hover:bg-primary/10" title="Download PDF">
                          <Download size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-primary/5">
                    <Button variant="outline" className="w-full h-11 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 gap-2" onClick={() => window.location.href='/admin'}>
                      {t.financial.archive} <FileSearch size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* PUBLIC VIEW: Lock Screen Call-to-Action */
            <div className="bg-secondary/10 rounded-[3rem] p-12 text-center border-2 border-dashed border-primary/20 relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-primary shadow-inner">
                  <Lock size={40} />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 text-foreground">Data Privacy Active</h3>
                <p className="text-muted-foreground mb-8 max-w-lg mx-auto font-bold leading-relaxed">
                  {language === 'ar' 
                    ? 'البيانات المالية والتقارير السنوية محمية بموجب بروتوكولات الخصوصية. يرجى تسجيل الدخول كعضو معتمد للوصول إلى لوحة الشفافية.' 
                    : 'Live financial data and official annual reports are restricted to verified members. Please log in to participate in our transparency initiatives.'}
                </p>
                <AuthModal trigger={
                  <Button className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest shadow-2xl bg-primary text-white hover:scale-105 transition-transform">
                    {t.common.login} to Access Hub
                  </Button>
                } />
              </div>
              <ShieldAlert className="absolute -bottom-10 -right-10 w-64 h-64 text-primary/5 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Feature Cards - Always Visible at Bottom */}
        <div className="grid md:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-1000">
          {t.financial.features.map((item: any, i: number) => {
            const Icon = featureIcons[i];
            return (
              <div key={i} className="flex flex-col items-center text-center p-8 rounded-[2.5rem] bg-card shadow-lg hover:shadow-xl transition-all group border border-primary/5">
                <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shadow-inner mb-6 group-hover:scale-110 transition-transform">
                  <Icon size={32} />
                </div>
                <h4 className="font-black text-sm uppercase tracking-widest mb-3 text-foreground">{item.title}</h4>
                <p className="text-xs text-muted-foreground font-bold leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
