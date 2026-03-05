'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Menu, 
  X, 
  Bell, 
  LogOut, 
  Globe,
  Shield,
  Moon,
  Sun,
  CheckCircle2,
  UserCircle,
  LogIn
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from './LanguageContext';
import { useUser, useAuth, useFirestore, useDoc, useCollection } from '@/firebase';
import { signOut } from 'firebase/auth';
import { AuthModal } from './AuthModal';
import { doc, collection, query, limit, orderBy } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import { useTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { language, setLanguage, t, dir } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const profileRef = useMemoFirebase(() => user ? doc(db, 'userProfiles', user.uid) : null, [db, user]);
  const { data: profile } = useDoc(profileRef);

  const notificationsQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(
      collection(db, 'userProfiles', user.uid, 'notifications'),
      orderBy('sendDate', 'desc'),
      limit(5)
    );
  }, [db, user]);
  const { data: notifications } = useCollection(notificationsQuery);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsOpen(false);
      router.push('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navLinks = [
    { name: t.nav.home, href: '/#home' },
    { name: t.nav.news, href: '/#news' },
    { name: t.nav.about, href: '/#about' },
    { name: t.nav.projects, href: '/#projects' },
    { name: t.nav.events, href: '/#events' },
    { name: t.nav.directory, href: '/#directory' },
  ];

  const managementRoles = ['admin', 'president', 'secretary', 'treasurer', 'executive'];
  const userRole = profile?.role?.toLowerCase() || '';
  const isAdmin = user?.email === 'up0code@gmail.com' || managementRoles.includes(userRole);

  const displayAvatar = profile?.profileImageUrl || user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'guest'}`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md shadow-sm border-b h-20 transition-all duration-300">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex-1 flex items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-md">
              <Users size={20} />
            </div>
            <div className="hidden sm:block text-left">
              <h1 className="font-headline font-black text-sm leading-tight text-black dark:text-white">{t.common.appName}</h1>
              <p className="text-[9px] text-black dark:text-white font-headline uppercase tracking-widest font-black opacity-80">
                {language === 'ar' ? 'منصة إدارة المجتمع' : language === 'rw' ? 'Urubuga rw\'abaturage' : language === 'fr' ? 'Hub Communautaire' : 'Community Hub'}
              </p>
            </div>
          </Link>
        </div>

        <div className="hidden lg:flex flex-[2] justify-center items-center">
          <div className="flex items-center bg-secondary/30 backdrop-blur-lg border border-primary/10 px-6 py-2.5 rounded-full gap-8 shadow-inner transition-all hover:bg-secondary/40">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-all text-black dark:text-white relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-end gap-3">
          {mounted && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="hidden md:flex items-center gap-2 h-9 rounded-xl px-4 hover:bg-secondary/50 text-[10px] font-black tracking-widest text-black dark:text-white"
                  >
                    <Globe size={16} />
                    <span className="uppercase">{language}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="rounded-xl p-2">
                  <DropdownMenuItem onClick={() => setLanguage('ar')} className="font-bold text-xs">العربية (AR)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('en')} className="font-bold text-xs">English (EN)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('rw')} className="font-bold text-xs">Kinyarwanda (RW)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('fr')} className="font-bold text-xs">Français (FR)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 rounded-xl hover:bg-secondary/50 text-black dark:text-white"
                onClick={toggleTheme}
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </Button>

              {user && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative h-9 w-9 hover:bg-secondary/50 rounded-xl text-black dark:text-white">
                      <Bell size={20} />
                      {notifications && notifications.length > 0 && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border border-white"></span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 rounded-2xl p-0 border-none shadow-2xl mt-4 overflow-hidden" align={dir === 'rtl' ? 'start' : 'end'}>
                    <div className="bg-primary p-4 text-white">
                      <h3 className="text-sm font-bold flex items-center gap-2"><Bell size={16} /> Notifications</h3>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
                      {!notifications || notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                          <CheckCircle2 className="mx-auto mb-2 opacity-20" size={32} />
                          <p className="text-xs font-bold">No new notifications</p>
                        </div>
                      ) : (
                        <div className="divide-y">
                          {notifications.map((notif: any) => (
                            <div key={notif.id} className="p-4 hover:bg-secondary/10 transition-colors cursor-pointer">
                              <p className="text-xs font-bold text-foreground mb-1">{notif.title}</p>
                              <p className="text-[10px] text-muted-foreground leading-relaxed">{notif.message}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
              
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 w-10 rounded-full p-0 border-2 border-primary/10 overflow-hidden hover:scale-105 transition-transform shadow-sm">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={displayAvatar} />
                        <AvatarFallback className="text-sm font-bold">{user.email?.[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 rounded-[1.5rem] p-3 shadow-2xl border-none mt-4" align={dir === 'rtl' ? 'start' : 'end'}>
                    <DropdownMenuLabel className="font-normal p-4">
                      <div className="flex flex-col space-y-1.5">
                        <p className="text-base font-bold leading-none text-foreground">{profile?.firstName || user.displayName || 'User'}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="opacity-5" />
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center w-full text-sm py-3 px-4 rounded-xl cursor-pointer hover:bg-primary/5">
                          <Shield className={cn("h-4 w-4 text-primary", dir === 'rtl' ? "ml-3" : "mr-3")} />
                          <span className="font-bold">{t.common.admin} Control</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center w-full text-sm py-3 px-4 rounded-xl cursor-pointer hover:bg-primary/5">
                        <UserCircle className={cn("h-4 w-4 text-primary", dir === 'rtl' ? "ml-3" : "mr-3")} />
                        <span className="font-bold">{language === 'ar' ? 'الملف الرقمي' : 'Digital Profile'}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="opacity-5" />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive text-sm py-3 px-4 rounded-xl font-bold cursor-pointer hover:bg-destructive/5 transition-colors">
                      <LogOut className={cn("h-4 w-4", dir === 'rtl' ? "ml-3" : "mr-3")} />
                      <span>{t.common.logout}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <AuthModal trigger={
                    <Button size="sm" className="h-9 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:scale-105 active:scale-95 transition-all gap-2 text-black dark:text-white border border-primary/10">
                      <LogIn size={14} /> {t.common.login}
                    </Button>
                  } />
                </div>
              )}
            </>
          )}

          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden h-9 w-9 hover:bg-secondary/50 rounded-xl text-black dark:text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden absolute top-20 left-4 right-4 bg-background/95 backdrop-blur-xl border border-primary/10 rounded-3xl p-6 space-y-4 shadow-2xl animate-in fade-in slide-in-from-top-4 z-50">
          <div className="grid grid-cols-2 gap-3">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className="flex items-center justify-center h-12 text-[10px] font-black uppercase tracking-widest text-black dark:text-white bg-secondary/20 rounded-2xl hover:bg-primary/10 hover:text-primary transition-all"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="flex-1 min-w-[80px] rounded-2xl h-12 text-[9px] font-black uppercase text-black dark:text-white" onClick={() => { setLanguage('ar'); setIsOpen(false); }}>العربية</Button>
              <Button variant="outline" className="flex-1 min-w-[80px] rounded-2xl h-12 text-[9px] font-black uppercase text-black dark:text-white" onClick={() => { setLanguage('en'); setIsOpen(false); }}>English</Button>
              <Button variant="outline" className="flex-1 min-w-[80px] rounded-2xl h-12 text-[9px] font-black uppercase text-black dark:text-white" onClick={() => { setLanguage('rw'); setIsOpen(false); }}>Kinyarwanda</Button>
              <Button variant="outline" className="flex-1 min-w-[80px] rounded-2xl h-12 text-[9px] font-black uppercase text-black dark:text-white" onClick={() => { setLanguage('fr'); setIsOpen(false); }}>Français</Button>
            </div>
            {!user && (
              <AuthModal trigger={
                <Button className="w-full rounded-2xl h-12 text-[10px] font-black uppercase tracking-widest shadow-xl gap-2">
                  <LogIn size={16} /> {t.common.login}
                </Button>
              } />
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
