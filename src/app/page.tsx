import React from 'react';
import { Navigation } from '@/components/Navigation';
import { Hero } from '@/components/Hero';
import { News } from '@/components/News';
import { About } from '@/components/About';
import { Membership } from '@/components/Membership';
import { Projects } from '@/components/Projects';
import { Financials } from '@/components/Financials';
import { Events } from '@/components/Events';
import { Directory } from '@/components/Directory';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';
import { Chatbot } from '@/components/Chatbot';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navigation />
      <Hero />
      <News />
      <About />
      <Membership />
      <Projects />
      <Financials />
      <Events />
      <Directory />
      <Contact />
      <Footer />
      <Chatbot />
    </main>
  );
}
