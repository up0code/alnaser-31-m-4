
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import { useCollection, useFirestore, useUser, useDoc } from '@/firebase';
import { 
  collection, 
  doc, 
  deleteDoc, 
  setDoc, 
  query, 
  orderBy,
  limit 
} from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMemoFirebase } from '@/firebase/provider';
import { Navigation } from '@/components/Navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Trash2, 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Shield,
  Newspaper,
  Calendar,
  Building2,
  Wallet,
  Image as ImageIcon,
  FileUp,
  FileText,
  Search,
  TrendingUp,
  TrendingDown,
  Palette,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { QRScanner } from '@/components/QRScanner';

export default function AdminPage() {
  const router = useRouter();
  const { t, dir, language: currentLang } = useLanguage();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const profileRef = useMemoFirebase(() => user ? doc(db, 'userProfiles', user.uid) : null, [db, user]);
  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  const managementRoles = ['admin', 'president', 'secretary', 'treasurer', 'executive'];
  const userRole = profile?.role?.toLowerCase() || '';
  const isActuallyAdmin = user?.email === 'up0code@gmail.com' || (user && managementRoles.includes(userRole));

  useEffect(() => {
    if (!isUserLoading && !isProfileLoading) {
      if (!user || !isActuallyAdmin) {
        toast({ variant: 'destructive', title: "Security Alert", description: "Unauthorized access blocked." });
        router.push('/');
      }
    }
  }, [user, isUserLoading, isProfileLoading, isActuallyAdmin, router, toast]);

  // Firestore Queries
  const membersRef = useMemoFirebase(() => (user && isActuallyAdmin) ? query(collection(db, 'userProfiles'), orderBy('memberSince', 'desc')) : null, [db, user, isActuallyAdmin]);
  const projectsRef = useMemoFirebase(() => (user && isActuallyAdmin) ? query(collection(db, 'projects'), orderBy('startDate', 'desc')) : null, [db, user, isActuallyAdmin]);
  const newsRef = useMemoFirebase(() => (user && isActuallyAdmin) ? query(collection(db, 'newsArticles'), orderBy('publishDate', 'desc')) : null, [db, user, isActuallyAdmin]);
  const eventsRef = useMemoFirebase(() => (user && isActuallyAdmin) ? query(collection(db, 'events'), orderBy('date', 'desc')) : null, [db, user, isActuallyAdmin]);
  const reportsRef = useMemoFirebase(() => (user && isActuallyAdmin) ? query(collection(db, 'annual_reports'), orderBy('date', 'desc')) : null, [db, user, isActuallyAdmin]);
  const paymentsRef = useMemoFirebase(() => (user && isActuallyAdmin) ? query(collection(db, 'all_payments'), orderBy('date', 'desc')) : null, [db, user, isActuallyAdmin]);
  const themeRef = useMemoFirebase(() => (user && isActuallyAdmin) ? doc(db, 'system_settings', 'config') : null, [db, user, isActuallyAdmin]);

  const { data: members } = useCollection(membersRef);
  const { data: projects } = useCollection(projectsRef);
  const { data: reports } = useCollection(reportsRef);
  const { data: newsArticles } = useCollection(newsRef);
  const { data: eventsList } = useCollection(eventsRef);
  const { data: payments } = useCollection(paymentsRef);
  const { data: themeSettings } = useDoc(themeRef);

  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [localTheme, setLocalTheme] = useState<any>({});
  
  // Dialog States
  const [isAddGenericDialogOpen, setAddGenericDialogOpen] = useState(false);
  const [genericForm, setGenericForm] = useState<any>({});

  useEffect(() => {
    if (themeSettings) {
      setLocalTheme(themeSettings);
    }
  }, [themeSettings]);

  // Financial Stats
  const income = payments?.filter(p => p.type !== 'Expense').reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0) || 0;
  const expenses = payments?.filter(p => p.type === 'Expense').reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0) || 0;
  const treasuryBalance = income - expenses;

  const handleFileRead = (file: File, callback: (base64: string) => void) => {
    if (file.size > 1024 * 1024 * 2) { 
      toast({ variant: 'destructive', title: "File Too Large (Max 2MB)" }); 
      return; 
    }
    const reader = new FileReader();
    reader.onloadend = () => callback(reader.result as string);
    reader.readAsDataURL(file);
  };

  const generateMemberNumber = () => Math.floor(100000 + Math.random() * 900000).toString();

  const handleGenericSave = () => {
    const colMap: Record<string, string> = {
      'reports': 'annual_reports',
      'news': 'newsArticles',
      'projects': 'projects',
      'events': 'events',
      'members': 'userProfiles',
      'payments': 'all_payments'
    };
    const col = colMap[activeTab];
    if (!col) return;
    
    const id = activeTab === 'members' ? doc(collection(db, 'userProfiles')).id : doc(collection(db, col)).id;
    const docRef = doc(db, col, id);
    
    const data: any = { 
      ...genericForm, 
      id, 
      timestamp: new Date().toISOString()
    };

    if (activeTab === 'members') {
      data.memberSince = data.memberSince || new Date().toISOString();
      data.memberNumber = generateMemberNumber();
      data.status = 'Active';
    }

    if (genericForm.date) {
      if (activeTab === 'news') data.publishDate = genericForm.date;
      if (activeTab === 'projects') data.startDate = genericForm.date;
      if (activeTab === 'events' || activeTab === 'reports' || activeTab === 'payments') data.date = genericForm.date;
    }

    setDoc(docRef, data).then(() => {
      toast({ title: "Registry Node Added" });
      setAddGenericDialogOpen(false);
      setGenericForm({});
    }).catch(e => {
      toast({ variant: 'destructive', title: "Save Error", description: e.message });
    });
  };

  const handleSaveTheme = async () => {
    if (!themeRef) return;
    try {
      await setDoc(themeRef, localTheme, { merge: true });
      toast({ title: "System Theme Updated" });
    } catch (e: any) {
      toast({ variant: 'destructive', title: "Update Failed", description: e.message });
    }
  };

  const handleDelete = (col: string, id: string) => {
    deleteDoc(doc(db, col, id)).then(() => {
      toast({ title: "Node Removed" });
    });
  };

  const sidebarTabs = [
    { id: 'overview', icon: LayoutDashboard, label: t.admin.overview },
    { id: 'office', icon: Building2, label: t.admin.office },
    { id: 'members', icon: Users, label: t.admin.members },
    { id: 'payments', icon: Wallet, label: t.admin.payments },
    { id: 'reports', icon: Shield, label: t.admin.reports },
    { id: 'projects', icon: Briefcase, label: t.admin.projects },
    { id: 'events', icon: Calendar, label: t.admin.events },
    { id: 'news', icon: Newspaper, label: t.admin.news },
    { id: 'theme', icon: Palette, label: currentLang === 'ar' ? 'الألوان' : 'Colors' }
  ];

  if (isUserLoading || isProfileLoading) return <div className="flex items-center justify-center min-h-screen bg-background">Loading Admin Hub...</div>;

  return (
    <main className="min-h-screen bg-background flex flex-col overflow-hidden">
      <Navigation />
      <div className="flex-grow flex pt-20 relative h-[calc(100vh-80px)]">
        <aside 
          className={cn(
            "bg-card border-r fixed top-20 h-[calc(100vh-80px)] z-40 transition-all duration-500 shadow-2xl flex flex-col print:hidden", 
            isSidebarExpanded ? "w-64" : "w-16", 
            dir === 'rtl' ? "right-0 border-l" : "left-0 border-r"
          )} 
          onMouseEnter={() => setIsSidebarExpanded(true)} 
          onMouseLeave={() => setIsSidebarExpanded(false)}
        >
          <nav className="p-2 space-y-1 overflow-y-auto flex-grow scrollbar-hide">
            {sidebarTabs.map((tab) => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)} 
                className={cn(
                  "w-full flex items-center p-2.5 rounded-xl transition-all h-11", 
                  activeTab === tab.id ? "bg-primary text-white shadow-xl" : "text-muted-foreground hover:bg-secondary/50", 
                  !isSidebarExpanded && "justify-center"
                )}
              >
                <tab.icon size={20} className={cn("shrink-0", isSidebarExpanded && (dir === 'rtl' ? "ml-3" : "mr-3"))} />
                {isSidebarExpanded && <span className="text-[11px] font-bold whitespace-nowrap">{tab.label}</span>}
              </button>
            ))}
          </nav>
        </aside>

        <div className={cn("flex-grow overflow-y-auto transition-all duration-500 px-4 md:px-6 py-8 print:p-0", isSidebarExpanded ? (dir === 'rtl' ? "mr-64" : "ml-64") : (dir === 'rtl' ? "mr-16" : "ml-16"))}>
          <div className="container mx-auto max-w-6xl space-y-8 pb-20 print:pb-0">
            
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: t.admin.stats.registry, value: members?.length || 0, icon: Users, color: "text-blue-500" },
                    { label: t.admin.stats.balance, value: treasuryBalance.toLocaleString(), icon: Wallet, color: "text-emerald-500" },
                    { label: t.admin.stats.activeProjects, value: projects?.filter(p => p.status !== 'Completed').length || 0, icon: Briefcase, color: "text-amber-500" },
                    { label: t.admin.reports, value: reports?.length || 0, icon: FileText, color: "text-indigo-500" }
                  ].map((s, i) => (
                    <Card key={i} className="border-none shadow-lg rounded-3xl bg-card">
                      <CardContent className="p-6 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">{s.label}</p>
                          <h3 className="text-2xl font-black tracking-tighter">{s.value}</h3>
                        </div>
                        <div className={cn("w-14 h-14 rounded-2xl bg-secondary/30 flex items-center justify-center", s.color)}>
                          <s.icon size={28} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'office' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <Card className="rounded-[2.5rem] border-none shadow-2xl bg-primary text-white overflow-hidden p-10">
                  <div className="max-w-md space-y-6">
                    <h2 className="text-4xl font-black uppercase tracking-tighter">{t.admin.office}</h2>
                    <p className="opacity-80 font-bold">
                      {currentLang === 'ar' ? 'مسح هويات الأعضاء والتحقق من البيانات الفورية' : 'Scan member IDs and verify instant data points.'}
                    </p>
                    <QRScanner />
                  </div>
                </Card>
              </div>
            )}

            {/* Theme Customizer Tab */}
            {activeTab === 'theme' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <Card className="rounded-[2.5rem] border-none shadow-2xl bg-card overflow-hidden p-8 md:p-12">
                  <div className="max-w-3xl space-y-10">
                    <div className="space-y-2">
                      <h2 className="text-4xl font-black uppercase tracking-tighter text-foreground flex items-center gap-4">
                        <Palette size={40} className="text-primary" /> {currentLang === 'ar' ? 'الهوية البصرية' : 'Visual Identity'}
                      </h2>
                      <p className="text-muted-foreground font-bold">{currentLang === 'ar' ? 'تخصيص لوحة الألوان العالمية للمنصة بأكملها.' : 'Customize the global color palette for the entire association hub.'}</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-8">
                      {[
                        { key: 'primaryColor', label: 'Primary Color (Brand)' },
                        { key: 'backgroundColor', label: 'Global Background' },
                        { key: 'accentColor', label: 'Accent Color (Success)' },
                        { key: 'cardColor', label: 'Card Background' },
                        { key: 'textColor', label: 'Main Text Color' }
                      ].map((item) => (
                        <div key={item.key} className="p-6 bg-secondary/10 rounded-3xl space-y-4 border border-primary/5">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{item.label}</Label>
                          <div className="flex items-center gap-4">
                            <div className="relative group">
                              <Input 
                                type="color" 
                                value={localTheme[item.key] || '#000000'} 
                                onChange={(e) => setLocalTheme({...localTheme, [item.key]: e.target.value})}
                                className="w-16 h-16 p-1 rounded-2xl border-4 border-white shadow-xl cursor-pointer hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="flex-grow">
                              <Input 
                                type="text" 
                                value={localTheme[item.key] || '#000000'} 
                                onChange={(e) => setLocalTheme({...localTheme, [item.key]: e.target.value})}
                                className="font-mono font-black text-sm uppercase rounded-xl h-12 bg-white border-2 border-primary/10 px-4 focus:ring-4 focus:ring-primary/10"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button onClick={handleSaveTheme} className="w-full h-16 rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]">
                      Apply Global Theme Protocol
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* General Data Management UI */}
            {['members', 'payments', 'projects', 'events', 'news', 'reports'].includes(activeTab) && (
              <Card className="rounded-[2.5rem] border-none shadow-2xl bg-card overflow-hidden">
                <CardHeader className="p-8 border-b flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-black uppercase tracking-tighter">
                      {sidebarTabs.find(t => t.id === activeTab)?.label}
                    </CardTitle>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Entries Detected in Registry
                    </p>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-grow md:w-64">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                      <Input 
                        placeholder={t.common.search} 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="rounded-xl pl-10 h-10 text-xs border-none bg-secondary/30" 
                      />
                    </div>
                    <Button onClick={() => setAddGenericDialogOpen(true)} className="rounded-xl h-10 font-black text-[10px] uppercase shadow-lg gap-2">
                      <Plus size={16} /> {t.common.add}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-secondary/20 font-black border-b text-muted-foreground">
                      {activeTab === 'members' ? (
                        <tr>
                          <th className="p-6 uppercase tracking-widest">{t.admin.table.identity}</th>
                          <th className="p-6 uppercase tracking-widest">Member #</th>
                          <th className="p-6 uppercase tracking-widest">{t.admin.table.clearance}</th>
                          <th className="p-6 uppercase tracking-widest">{t.admin.table.status}</th>
                          <th className="p-6 text-center uppercase tracking-widest">{t.admin.table.action}</th>
                        </tr>
                      ) : activeTab === 'payments' ? (
                        <tr>
                          <th className="p-6 uppercase tracking-widest">{t.admin.table.date}</th>
                          <th className="p-6 uppercase tracking-widest">{t.admin.table.desc}</th>
                          <th className="p-6 uppercase tracking-widest">{t.admin.table.amount}</th>
                          <th className="p-6 uppercase tracking-widest">{t.admin.table.type}</th>
                          <th className="p-6 text-center uppercase tracking-widest">{t.admin.table.action}</th>
                        </tr>
                      ) : (
                        <tr>
                          <th className="p-6 uppercase tracking-widest">{t.admin.table.identifier}</th>
                          <th className="p-6 uppercase tracking-widest">{t.admin.table.date}</th>
                          <th className="p-6 text-center uppercase tracking-widest">{t.admin.table.action}</th>
                        </tr>
                      )}
                    </thead>
                    <tbody>
                      {/* Members Tab */}
                      {activeTab === 'members' && members?.filter(m => `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())).map(m => (
                        <tr key={m.id} className="border-b hover:bg-secondary/5 transition-colors">
                          <td className="p-6">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={m.profileImageUrl} />
                                <AvatarFallback className="text-[10px] font-black">{m.firstName?.[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-black text-sm">{m.firstName} {m.lastName}</p>
                                <p className="text-[9px] opacity-60 font-bold uppercase">{m.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-6 font-mono font-bold text-primary">#{m.memberNumber}</td>
                          <td className="p-6"><span className="bg-secondary/50 px-2 py-1 rounded-md font-black text-[10px] uppercase">{m.role}</span></td>
                          <td className="p-6">
                            <div className="flex items-center gap-2">
                              <span className={cn("w-2 h-2 rounded-full", m.status === 'Active' ? "bg-emerald-500" : "bg-destructive")}></span>
                              <span className="font-bold uppercase text-[10px]">{m.status}</span>
                            </div>
                          </td>
                          <td className="p-6 text-center">
                            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete('userProfiles', m.id)}>
                              <Trash2 size={16} />
                            </Button>
                          </td>
                        </tr>
                      ))}

                      {/* Payments Tab */}
                      {activeTab === 'payments' && payments?.filter(p => p.description?.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                        <tr key={p.id} className="border-b hover:bg-secondary/5 transition-colors">
                          <td className="p-6 font-mono opacity-60 font-bold">{p.date}</td>
                          <td className="p-6 font-bold">{p.description}</td>
                          <td className="p-6">
                            <span className={cn("font-black text-sm", p.type === 'Expense' ? "text-destructive" : "text-emerald-600")}>
                              {p.type === 'Expense' ? '-' : '+'}{p.currency} {p.amount}
                            </span>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center gap-2">
                              {p.type === 'Expense' ? <TrendingDown size={14} className="text-destructive" /> : <TrendingUp size={14} className="text-emerald-500" />}
                              <span className="font-black uppercase text-[10px]">{p.type || 'Income'}</span>
                            </div>
                          </td>
                          <td className="p-6 text-center">
                            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete('all_payments', p.id)}>
                              <Trash2 size={16} />
                            </Button>
                          </td>
                        </tr>
                      ))}

                      {/* Other Tabs */}
                      {activeTab === 'reports' && reports?.map(r => (
                        <tr key={r.id} className="border-b">
                          <td className="p-6 font-bold">{r.title || r.name}</td>
                          <td className="p-6 font-mono opacity-60">{r.date}</td>
                          <td className="p-6 text-center">
                            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete('annual_reports', r.id)}>
                              <Trash2 size={16} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {activeTab === 'news' && newsArticles?.map(a => (
                        <tr key={a.id} className="border-b">
                          <td className="p-6 font-bold">{a.title}</td>
                          <td className="p-6 font-mono opacity-60">{a.publishDate}</td>
                          <td className="p-6 text-center">
                            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete('newsArticles', a.id)}>
                              <Trash2 size={16} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {activeTab === 'projects' && projects?.map(p => (
                        <tr key={p.id} className="border-b">
                          <td className="p-6 font-bold">{p.title}</td>
                          <td className="p-6 font-mono opacity-60">{p.startDate}</td>
                          <td className="p-6 text-center">
                            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete('projects', p.id)}>
                              <Trash2 size={16} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {activeTab === 'events' && eventsList?.map(e => (
                        <tr key={e.id} className="border-b">
                          <td className="p-6 font-bold">{e.title}</td>
                          <td className="p-6 font-mono opacity-60">{e.date}</td>
                          <td className="p-6 text-center">
                            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete('events', e.id)}>
                              <Trash2 size={16} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </div>

      {/* Registry Addition Dialog */}
      <Dialog open={isAddGenericDialogOpen} onOpenChange={setAddGenericDialogOpen}>
        <DialogContent className="rounded-[2rem] p-8 sm:max-w-[500px] max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle className="uppercase font-black">New {activeTab} Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            
            {/* Member Form */}
            {activeTab === 'members' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase opacity-60">First Name</Label>
                    <Input value={genericForm.firstName || ''} onChange={e => setGenericForm({...genericForm, firstName: e.target.value})} className="rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase opacity-60">Last Name</Label>
                    <Input value={genericForm.lastName || ''} onChange={e => setGenericForm({...genericForm, lastName: e.target.value})} className="rounded-xl" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase opacity-60">Email Address</Label>
                  <Input type="email" value={genericForm.email || ''} onChange={e => setGenericForm({...genericForm, email: e.target.value})} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase opacity-60">Role</Label>
                  <Select onValueChange={(v) => setGenericForm({...genericForm, role: v})}>
                    <SelectTrigger className="rounded-xl h-10">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      {managementRoles.map(r => <SelectItem key={r} value={r}>{r.toUpperCase()}</SelectItem>)}
                      <SelectItem value="member">MEMBER</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Payment Form */}
            {activeTab === 'payments' && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase opacity-60">Description</Label>
                  <Input placeholder="e.g. Annual Dues" value={genericForm.description || ''} onChange={e => setGenericForm({...genericForm, description: e.target.value})} className="rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase opacity-60">Amount</Label>
                    <Input type="number" value={genericForm.amount || ''} onChange={e => setGenericForm({...genericForm, amount: e.target.value})} className="rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase opacity-60">Currency</Label>
                    <Input placeholder="USD" value={genericForm.currency || 'USD'} onChange={e => setGenericForm({...genericForm, currency: e.target.value})} className="rounded-xl" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase opacity-60">Type</Label>
                  <Select onValueChange={(v) => setGenericForm({...genericForm, type: v})}>
                    <SelectTrigger className="rounded-xl h-10">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Income">INCOME (Contribution)</SelectItem>
                      <SelectItem value="Expense">EXPENSE (Outflow)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {['reports', 'news', 'projects', 'events'].includes(activeTab) && (
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase opacity-60">Title / Name</Label>
                <Input 
                  placeholder="Title" 
                  value={genericForm.title || genericForm.name || ''} 
                  onChange={e => setGenericForm({...genericForm, title: e.target.value, name: e.target.value})} 
                  className="rounded-xl" 
                />
              </div>
            )}

            {['news', 'projects', 'events'].includes(activeTab) && (
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase opacity-60">Description / Content</Label>
                <Textarea 
                  placeholder="Details..." 
                  value={genericForm.content || genericForm.description || ''} 
                  onChange={e => setGenericForm({...genericForm, content: e.target.value, description: e.target.value})} 
                  className="rounded-xl min-h-[100px]" 
                />
              </div>
            )}

            {['news', 'projects'].includes(activeTab) && (
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase opacity-60">Featured Image</Label>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={e => e.target.files?.[0] && handleFileRead(e.target.files[0], (b64) => setGenericForm({...genericForm, imageUrl: b64}))} 
                />
                <Button 
                  variant="outline" 
                  className="w-full rounded-xl gap-2 h-10 font-bold uppercase text-[9px]" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon size={14} /> {genericForm.imageUrl ? 'Image Loaded' : 'Upload Image'}
                </Button>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase opacity-60">Report PDF</Label>
                <input 
                  type="file" 
                  accept=".pdf" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={e => e.target.files?.[0] && handleFileRead(e.target.files[0], (b64) => setGenericForm({...genericForm, fileUrl: b64, type: 'PDF'}))} 
                />
                <Button 
                  variant="outline" 
                  className="w-full rounded-xl gap-2 h-10 font-bold uppercase text-[9px]" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileUp size={14} /> {genericForm.fileUrl ? 'PDF Loaded' : 'Upload PDF'}
                </Button>
              </div>
            )}

            {['reports', 'news', 'projects', 'events', 'payments'].includes(activeTab) && (
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase opacity-60">Target Date</Label>
                <Input 
                  type="date" 
                  value={genericForm.date || genericForm.publishDate || ''} 
                  onChange={e => setGenericForm({...genericForm, date: e.target.value, publishDate: e.target.value})} 
                  className="rounded-xl" 
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleGenericSave} className="w-full rounded-xl font-black h-12 shadow-xl">
              Confirm Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </main>
  );
}
