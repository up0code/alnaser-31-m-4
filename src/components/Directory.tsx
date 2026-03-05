
"use client";

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Filter, Lock, ShieldCheck } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import { MemberProfileModal } from './MemberProfileModal';
import { useToast } from '@/hooks/use-toast';
import { AuthModal } from './AuthModal';

export function Directory() {
  const { t } = useLanguage();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const membersRef = useMemoFirebase(() => query(collection(db, 'userProfiles'), orderBy('firstName', 'asc')), [db]);
  const { data: members, isLoading } = useCollection(membersRef);

  const filteredMembers = members?.filter(m => 
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCardClick = (member: any) => {
    if (user) {
      setSelectedMember(member);
    } else {
      // Silent protection: Do not open modal or show "Restricted" UI prompts
      // Optionally show a subtle toast for accessibility
      toast({
        variant: "default",
        title: "Community Directory",
        description: "Please log in to view verified identity details.",
      });
    }
  };

  return (
    <section id="directory" className="py-16 bg-background text-foreground transition-colors">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="font-headline font-bold text-2xl md:text-3xl mb-3 relative section-title inline-block text-foreground">{t.directory.title}</h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mt-2 leading-relaxed">
            {t.directory.subtitle}
          </p>
        </div>

        <div className="bg-secondary/15 p-4 rounded-2xl mb-8 flex flex-col md:flex-row gap-4 items-center border border-primary/5">
          <div className="relative flex-grow w-full">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              placeholder={t.directory.searchPlaceholder} 
              className="pr-10 h-10 text-sm rounded-xl bg-card border-none shadow-sm focus-visible:ring-2 focus-visible:ring-primary text-foreground"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button variant="outline" size="sm" className="rounded-lg h-8 gap-2 bg-card border border-input shadow-sm flex-grow md:flex-grow-0 text-xs font-bold text-foreground">
              <Filter size={14} /> {t.directory.filter}
            </Button>
            <div className="h-8 px-4 bg-card rounded-lg shadow-sm flex items-center gap-4 text-xs font-bold border border-primary/5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-muted-foreground uppercase tracking-widest text-[9px]">{t.directory.online}:</span>
                <span className="text-primary text-sm font-black">12</span>
              </div>
              <div className="w-[1px] h-3 bg-border opacity-30"></div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground uppercase tracking-widest text-[9px]">{t.directory.total}:</span>
                <span className="text-primary text-sm font-black">{members?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-secondary/10 rounded-3xl animate-pulse"></div>)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredMembers?.map((member) => (
              <Card 
                key={member.id} 
                className="border-none shadow-md hover:shadow-xl transition-all rounded-3xl group bg-card overflow-hidden cursor-pointer" 
                onClick={() => handleCardClick(member)}
              >
                <CardContent className="p-6 text-center flex flex-col items-center">
                  <div className="relative inline-block mb-4">
                    <Avatar className="w-24 h-24 border-4 border-background shadow-xl mx-auto group-hover:scale-105 transition-transform">
                      <AvatarImage src={member.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`} />
                      <AvatarFallback className="text-xl font-black">{member.firstName?.[0]}</AvatarFallback>
                    </Avatar>
                    {member.status === 'Active' && (
                      <span className="absolute bottom-1 left-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background shadow-md"></span>
                    )}
                  </div>
                  <h4 className="font-bold text-lg mb-2 leading-tight text-foreground">{member.firstName} {member.lastName}</h4>
                  
                  {user && (
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary opacity-60 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <ShieldCheck size={12} /> {t.qr.preview}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <MemberProfileModal member={selectedMember} onClose={() => setSelectedMember(null)} />
    </section>
  );
}
