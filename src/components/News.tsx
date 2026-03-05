'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronRight, Newspaper, ArrowLeft } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import { cn } from '@/lib/utils';

export function News() {
  const { t, language, dir } = useLanguage();
  const db = useFirestore();

  const newsQuery = useMemoFirebase(() => {
    return query(collection(db, 'newsArticles'), orderBy('publishDate', 'desc'), limit(4));
  }, [db]);

  const { data: news, isLoading } = useCollection(newsQuery);

  if (isLoading) return <div className="py-24 text-center text-muted-foreground animate-pulse">{t.common.loading}</div>;

  return (
    <section id="news" className="py-24 bg-secondary/5 transition-colors">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
          <div className="text-center md:text-right">
            <h2 className="font-headline font-bold text-3xl md:text-4xl mb-3 relative section-title inline-block text-foreground">{t.news.title}</h2>
            <p className="text-base text-muted-foreground max-w-2xl mt-4 leading-relaxed">
              {t.news.subtitle}
            </p>
          </div>
          <Button variant="outline" className="rounded-xl font-bold h-10 px-6 gap-2 border-primary text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
            {t.news.viewAll} {dir === 'rtl' ? <ArrowLeft size={16} /> : <ChevronRight size={16} />}
          </Button>
        </div>

        {!news || news.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-[2rem] border border-dashed border-muted-foreground/30 text-muted-foreground">
            {t.news.noNews}
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Featured Article */}
            <div className="lg:col-span-7">
              {news[0] && (
                <Card className="group overflow-hidden border-none shadow-xl rounded-[2rem] bg-card h-full flex flex-col">
                  <div className="relative h-[300px] md:h-[400px] overflow-hidden">
                    <Image 
                      src={news[0].imageUrl || `https://picsum.photos/seed/${news[0].id}/800/600`} 
                      alt={news[0].title} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      data-ai-hint="news featured"
                    />
                    <div className="absolute top-6 left-6 flex gap-2">
                      <Badge className="bg-primary text-white font-bold h-8 px-4 text-xs shadow-lg uppercase tracking-wider">
                        {t.news.featured}
                      </Badge>
                      {news[0].isFeatured && (
                        <Badge className="bg-accent text-white font-bold h-8 px-4 text-xs shadow-lg uppercase tracking-wider">
                          Spotlight
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-8 flex-grow">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-bold mb-4 uppercase tracking-widest">
                      <Calendar size={14} className="text-primary" />
                      <span>{new Date(news[0].publishDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-6 group-hover:text-primary transition-colors leading-tight text-foreground">{news[0].title}</h3>
                    <p className="text-muted-foreground leading-relaxed line-clamp-3 mb-8">
                      {news[0].content}
                    </p>
                    <Button variant="ghost" className="p-0 h-auto font-black text-xs uppercase tracking-[0.2em] text-primary hover:bg-transparent group/btn">
                      {t.news.readMore} <ChevronRight className={cn("ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1", dir === 'rtl' && "rotate-180 group-hover/btn:-translate-x-1")} />
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar News */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {news.slice(1).map((article, i) => (
                <Card key={article.id} className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all rounded-[1.5rem] bg-card flex flex-row h-[160px]">
                  <div className="relative w-1/3 overflow-hidden shrink-0">
                    <Image 
                      src={article.imageUrl || `https://picsum.photos/seed/${article.id}/400/400`} 
                      alt={article.title} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      data-ai-hint="news article"
                    />
                  </div>
                  <CardContent className="p-5 flex flex-col justify-center overflow-hidden">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold mb-2 uppercase tracking-widest">
                      <Calendar size={12} className="text-primary" />
                      <span>{new Date(article.publishDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <h4 className="font-bold text-sm mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-tight text-foreground">{article.title}</h4>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3">
                      {article.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
              
              {/* Join Newsletter Mini-Card */}
              <Card className="border-none bg-primary text-primary-foreground rounded-[1.5rem] p-6 shadow-xl relative overflow-hidden flex-grow flex flex-col justify-center">
                <div className="relative z-10">
                  <h4 className="font-bold text-lg mb-2">{t.footer.newsletter}</h4>
                  <p className="text-xs opacity-90 mb-4">{t.footer.newsletterDesc}</p>
                  <Button size="sm" variant="secondary" className="w-full font-bold rounded-xl text-[10px] uppercase tracking-widest h-9">
                    {t.footer.subscribe}
                  </Button>
                </div>
                <Newspaper className="absolute -bottom-4 -right-4 w-24 h-24 opacity-10" />
              </Card>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}