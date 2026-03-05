
"use client";

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useLanguage } from './LanguageContext';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import { cn } from '@/lib/utils';

export function Projects() {
  const { t, language } = useLanguage();
  const db = useFirestore();

  const projectsQuery = useMemoFirebase(() => {
    return query(collection(db, 'projects'), orderBy('startDate', 'desc'), limit(6));
  }, [db]);

  const { data: dbProjects, isLoading } = useCollection(projectsQuery);
  
  // Fallback static projects if DB is empty
  const staticProjects = [
    { id: 'project-garden', title: t.projects.items[0].title, desc: t.projects.items[0].desc, status: t.projects.status.completed, progress: 100, date: "2023", volunteers: 45 },
    { id: 'project-coding', title: t.projects.items[1].title, desc: t.projects.items[1].desc, status: t.projects.status.ongoing, progress: 65, date: "2023", volunteers: 12 },
    { id: 'project-recycling', title: t.projects.items[2].title, desc: t.projects.items[2].desc, status: t.projects.status.planning, progress: 20, date: "2024", volunteers: 8 }
  ];

  const projects = dbProjects && dbProjects.length > 0 ? dbProjects.map(p => ({
    id: p.id,
    title: p.title,
    desc: p.description,
    status: p.status,
    progress: p.status === 'Completed' ? 100 : p.status === 'Ongoing' ? 65 : 10,
    date: p.startDate ? new Date(p.startDate).getFullYear().toString() : "2024",
    volunteers: p.volunteersCount || Math.floor(Math.random() * 20) + 5
  })) : staticProjects;

  return (
    <section id="projects" className="py-24 bg-background transition-colors">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div className="max-w-2xl text-center md:text-right">
            <h2 className="font-headline font-bold text-3xl md:text-4xl mb-2 relative section-title inline-block text-foreground">{t.projects.title}</h2>
            <p className="text-base text-muted-foreground mt-4 leading-relaxed">{t.projects.subtitle}</p>
          </div>
          <Badge variant="outline" className="px-4 py-1 text-sm border-primary text-primary cursor-pointer uppercase font-bold rounded-xl">{t.projects.viewAll}</Badge>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="h-80 bg-secondary/10 rounded-3xl animate-pulse"></div>)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => {
              const img = PlaceHolderImages.find(i => i.id === project.id);
              return (
                <Card key={project.id} className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full rounded-3xl bg-card">
                  <div className="relative h-56 overflow-hidden">
                    <Image 
                      src={img?.imageUrl || `https://picsum.photos/seed/${project.id}/600/400`} 
                      alt={project.title} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      data-ai-hint="community project"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className={cn(
                        "shadow-lg font-bold text-xs h-7 px-3 py-0",
                        project.status === 'Completed' ? 'bg-green-500' : project.status === 'Ongoing' ? 'bg-primary' : 'bg-amber-500'
                      )}>
                        {project.status === 'Ongoing' && (language === 'ar' ? 'قيد التنفيذ' : 'Ongoing')}
                        {project.status === 'Completed' && (language === 'ar' ? 'مكتمل' : 'Completed')}
                        {project.status === 'Planning' && (language === 'ar' ? 'قيد التخطيط' : 'Planning')}
                        {!['Ongoing', 'Completed', 'Planning'].includes(project.status) && project.status}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="p-6 pb-2">
                    <CardTitle className="font-headline font-bold text-xl leading-tight line-clamp-1 text-foreground">{project.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-2 flex-grow">
                    <p className="text-muted-foreground text-sm mb-6 leading-relaxed line-clamp-2">
                      {project.desc}
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold mb-1 text-foreground">
                        <span>{t.projects.progress}</span>
                        <span>%{project.progress}</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 pt-4 border-t bg-secondary/10 grid grid-cols-2 gap-4 transition-colors">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                      <Calendar size={16} className="text-primary" />
                      <span className="truncate">{project.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground justify-end">
                      <Users size={16} className="text-primary" />
                      <span className="truncate">{project.volunteers} {t.projects.volunteers}</span>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
