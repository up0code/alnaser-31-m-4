
"use client";

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2,
  Users as UsersIcon
} from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import { cn } from '@/lib/utils';
import { AuthModal } from './AuthModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function Events() {
  const { t, language, dir } = useLanguage();
  const { user } = useUser();
  const db = useFirestore();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const profileRef = useMemoFirebase(() => user ? doc(db, 'userProfiles', user.uid) : null, [db, user]);
  const { data: profile } = useDoc(profileRef);

  const events = [
    { id: '1', day: 15, title: t.events.items[0].title, time: language === 'ar' ? "6:00 مساءً" : "6:00 PM", loc: t.events.items[0].loc, type: "social", desc: "A gathering for community members to discuss social initiatives." },
    { id: '2', day: 20, title: t.events.items[1].title, time: language === 'ar' ? "4:00 مساءً" : "4:00 PM", loc: t.events.items[1].loc, type: "education", desc: "Technical workshop for youth to learn modern programming skills." },
    { id: '3', day: 25, title: t.events.items[2].title, time: language === 'ar' ? "7:00 مساءً" : "7:00 PM", loc: t.events.items[2].loc, type: "official", desc: "The annual general assembly meeting for all registered members." },
  ];

  const daysInMonth = 30;
  const startingDay = 3; 

  const renderCalendar = () => {
    const cells = [];
    for (let i = 0; i < startingDay; i++) {
      cells.push(<div key={`pad-${i}`} className="h-20 md:h-24 bg-secondary/10 border-b border-l border-border/30"></div>);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dayEvents = events.filter(e => e.day === d);
      cells.push(
        <div key={d} className="h-20 md:h-24 border-b border-l border-border/30 p-2 relative group hover:bg-secondary/20 transition-colors">
          <span className={cn(
            "text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full mb-1",
            dayEvents.length > 0 ? "bg-primary text-white" : "text-muted-foreground"
          )}>{d}</span>
          <div className="mt-1 space-y-1">
            {dayEvents.map((ev, i) => (
              <div key={i} className="text-[10px] p-1 bg-card rounded-lg border shadow-sm truncate font-bold text-primary border-primary/10">
                {ev.title}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return cells;
  };

  return (
    <section id="events" className="py-24 bg-background transition-colors">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="text-center md:text-right">
            <h2 className="font-headline font-bold text-3xl md:text-4xl mb-2 relative section-title inline-block text-foreground">{t.events.title}</h2>
            <p className="text-base text-muted-foreground mt-4 leading-relaxed max-w-2xl">{t.events.subtitle}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <Card className="rounded-[1.5rem] shadow-xl border-none overflow-hidden bg-card transition-colors">
              <div className="bg-primary p-6 flex justify-between items-center text-white">
                <h3 className="font-headline font-bold text-lg">
                  {language === 'ar' ? 'نوفمبر 2023' : 'November 2023'}
                </h3>
                <div className="flex gap-3">
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-white hover:bg-white/20 rounded-xl transition-colors">
                    {dir === 'rtl' ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-white hover:bg-white/20 rounded-xl transition-colors">
                    {dir === 'rtl' ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
                  </Button>
                </div>
              </div>
              <CardContent className="p-0">
                <div className="grid grid-cols-7 text-center bg-secondary/30 border-b border-border/20">
                  {t.events.days.map((d: string) => (
                    <div key={d} className="py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7">
                  {renderCalendar()}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <h3 className="font-bold text-xl font-headline flex items-center gap-3 mb-4 text-foreground">
              <CalendarIcon className="text-primary" size={28} /> {t.events.upcoming}
            </h3>
            {events.map((event, i) => (
              <Card key={i} className="border-none shadow-md hover:shadow-xl transition-all rounded-[1.5rem] group cursor-pointer bg-card overflow-hidden" onClick={() => setSelectedEvent(event)}>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="secondary" className="text-[9px] px-2 py-0.5 uppercase font-black tracking-widest bg-secondary/50">{event.type}</Badge>
                    <Badge variant="outline" className="text-[10px] font-black px-3 h-6 rounded-lg uppercase tracking-widest border-primary/20 text-foreground">
                      {event.day} {language === 'ar' ? 'نوفمبر' : 'Nov'}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-sm mb-3 group-hover:text-primary transition-colors leading-tight line-clamp-2 text-foreground">{event.title}</h4>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock size={14} className="text-primary/60" /> <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin size={14} className="text-primary/60" /> <span className="truncate">{event.loc}</span>
                    </div>
                  </div>
                  <Button size="sm" className="w-full h-8 rounded-xl text-[11px] font-bold uppercase tracking-widest shadow-md">
                    {t.events.rsvp}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-[400px] rounded-[1.5rem] p-6 shadow-3xl border-none">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-3 text-foreground">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <CalendarIcon size={18} />
              </div>
              {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">{selectedEvent?.desc}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-secondary/30 rounded-xl flex items-center gap-3">
                <Clock size={16} className="text-primary" />
                <div className="overflow-hidden">
                  <p className="text-[9px] font-black uppercase opacity-60 text-muted-foreground">{language === 'ar' ? 'الوقت' : 'TIME'}</p>
                  <p className="text-xs font-bold truncate text-foreground">{selectedEvent?.time}</p>
                </div>
              </div>
              <div className="p-3 bg-secondary/30 rounded-xl flex items-center gap-3">
                <MapPin size={16} className="text-primary" />
                <div className="overflow-hidden">
                  <p className="text-[9px] font-black uppercase opacity-60 text-muted-foreground">{language === 'ar' ? 'الموقع' : 'LOCATION'}</p>
                  <p className="text-xs font-bold truncate text-foreground">{selectedEvent?.loc}</p>
                </div>
              </div>
            </div>
            
            {!user ? (
              <div className="p-4 bg-destructive/5 rounded-2xl border border-destructive/10 text-center">
                <p className="text-xs font-bold text-destructive mb-3">{language === 'ar' ? 'يجب تسجيل الدخول للتسجيل' : 'Login required to RSVP'}</p>
                <AuthModal mode="login" trigger={
                  <Button size="sm" variant="outline" className="h-8 text-[11px] font-bold uppercase rounded-lg border-destructive/40 text-destructive hover:bg-destructive hover:text-white transition-all">
                    {t.common.login}
                  </Button>
                } />
              </div>
            ) : (
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-3">
                <UsersIcon size={20} className="text-primary" />
                <p className="text-xs font-bold leading-tight text-foreground">
                  {language === 'ar' ? 'أنت مسجل كـ: ' : 'Registering as: '}
                  <span className="text-primary">{user.email}</span>
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(null)} className="h-8 rounded-lg px-4 font-bold text-xs text-foreground hover:bg-secondary/20">{t.common.cancel}</Button>
            <Button size="sm" disabled={!user} className="h-8 rounded-lg px-6 shadow-md font-bold text-xs">
              <CheckCircle2 size={14} className="mr-2"/> {language === 'ar' ? 'تأكيد التسجيل' : 'Confirm RSVP'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
