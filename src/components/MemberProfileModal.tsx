
'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from './LanguageContext';
import { useUser, useDoc, useFirestore, useCollection } from '@/firebase';
import { doc, collection, query, orderBy, limit } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import { 
  User, 
  Phone, 
  Mail, 
  ShieldCheck, 
  IdCard,
  Download,
  Printer,
  X,
  Fingerprint,
  Loader2,
  Lock,
  AlertCircle,
  Calendar,
  HeartPulse,
  CreditCard,
  History
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface MemberProfileModalProps {
  member: any;
  onClose: () => void;
}

export function MemberProfileModal({ member, onClose }: MemberProfileModalProps) {
  const { t, language } = useLanguage();
  const { user } = useUser();
  const db = useFirestore();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Authorization Check: Is the viewer an admin or the owner?
  const viewerProfileRef = useMemoFirebase(() => user ? doc(db, 'userProfiles', user.uid) : null, [db, user]);
  const { data: viewerProfile } = useDoc(viewerProfileRef);
  
  const managementRoles = ['admin', 'president', 'secretary', 'treasurer', 'executive'];
  const viewerRole = viewerProfile?.role?.toLowerCase() || '';
  const isAuthorized = user?.email === 'up0code@gmail.com' || managementRoles.includes(viewerRole) || user?.uid === member?.id;

  // Fetch Member's Payment History (Authorized View Only)
  const paymentsRef = useMemoFirebase(() => 
    (member && isAuthorized) ? query(collection(db, 'userProfiles', member.id, 'membershipPayments'), orderBy('date', 'desc'), limit(5)) : null, 
    [db, member, isAuthorized]
  );
  const { data: payments } = useCollection(paymentsRef);

  if (!member) return null;

  // Strict Privacy Block: If guest somehow triggers the modal
  if (!user) {
    return (
      <Dialog open={!!member} onOpenChange={() => onClose()}>
        <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] p-10 text-center border-none shadow-3xl bg-background">
          <div className="w-20 h-20 bg-destructive/10 rounded-3xl flex items-center justify-center text-destructive mx-auto mb-6">
            <Lock size={40} />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tighter mb-2">Access Restricted</h3>
          <p className="text-sm text-muted-foreground mb-8">Digital Identity nodes are protected by the association's data security protocols. Please log in to verify this member.</p>
          <Button onClick={onClose} className="w-full rounded-xl font-black uppercase tracking-widest">Acknowledge</Button>
        </DialogContent>
      </Dialog>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    try {
      const element = document.getElementById('member-card-print');
      if (!element) return;
      
      const { default: html2canvas } = await import('html2canvas');
      const { jsPDF } = await import('jspdf');
      
      const canvas = await html2canvas(element, { 
        scale: 4, 
        useCORS: true,
        backgroundColor: null,
        logging: false,
        windowWidth: 1200, 
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({ 
        orientation: 'landscape', 
        unit: 'px', 
        format: [canvas.width, canvas.height] 
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height, undefined, 'FAST');
      pdf.save(`ANNA_ID_${member.memberNumber || member.id}.pdf`);
    } catch (e) {
      console.error("PDF generation failed", e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <Dialog open={!!member} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[800px] w-[95vw] max-h-[95vh] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-3xl bg-background flex flex-col">
        <DialogHeader className="p-6 pb-2 shrink-0 border-b bg-secondary/5 print:hidden">
           <div className="flex justify-between items-center">
             <DialogTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
               <ShieldCheck className="text-primary" size={24} /> {language === 'ar' ? 'بطاقة الهوية الرقمية' : 'Digital Identity Card'}
             </DialogTitle>
             <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl h-8 w-8"><X size={18} /></Button>
           </div>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto scrollbar-hide flex flex-col md:flex-row print:flex-row print:overflow-visible bg-secondary/5">
          {/* Layer 1: Digital ID (Publicly Verifiable Interface) */}
          <div className="p-6 flex justify-center items-center bg-transparent shrink-0">
            <div id="member-card-print" className="w-[320px] md:w-64 bg-primary p-6 text-white flex flex-col items-center text-center space-y-4 relative shadow-2xl rounded-3xl print:w-[3.375in] print:h-[2.125in] print:rounded-lg print:shadow-none print:m-0">
              <div className="relative z-10">
                <Avatar className="w-24 h-24 rounded-3xl border-4 border-white/30 shadow-2xl mx-auto">
                  <AvatarImage src={member.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`} />
                  <AvatarFallback className="bg-white/20 text-white text-2xl font-black">{member.firstName?.[0]}</AvatarFallback>
                </Avatar>
              </div>
              <div className="relative z-10 space-y-1">
                <h2 className="text-lg font-black uppercase tracking-tighter line-clamp-1 leading-none">{member.firstName} {member.lastName}</h2>
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="secondary" className="bg-white/20 text-white border-none font-bold text-[8px] uppercase tracking-widest px-2">{member.role}</Badge>
                  <span className="text-[10px] font-black font-mono">#{member.memberNumber}</span>
                </div>
              </div>
              <div className="bg-white p-2 rounded-2xl shadow-xl relative z-10 border-4 border-white">
                <QRCodeSVG value={JSON.stringify({ id: member.id, num: member.memberNumber })} size={100} level="H" includeMargin={true} />
              </div>
              <p className="text-[7px] font-black uppercase tracking-widest opacity-50">Verified Hub ID • Digital Node</p>
              <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 text-white/5 pointer-events-none" />
            </div>
          </div>

          {/* Layer 2: Secure PII & Records (Only Owner or Admin) */}
          <div className="flex-1 p-6 space-y-8 bg-card print:hidden border-l overflow-y-auto scrollbar-hide">
            {isAuthorized ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                {/* Information Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: IdCard, label: t.qr.memberId, value: member.memberNumber || member.id },
                    { icon: Mail, label: 'Email', value: member.email },
                    { icon: Phone, label: 'Emergency Contact', value: member.emergencyContact || 'N/A' },
                    { icon: Fingerprint, label: 'National ID', value: member.nationalId || 'N/A' },
                    { icon: Calendar, label: 'Birth Date', value: member.birthDate || 'N/A' },
                    { icon: HeartPulse, label: 'Blood Type', value: member.bloodType || 'N/A' }
                  ].map((item, i) => (
                    <div key={i} className="p-3 bg-secondary/10 rounded-xl space-y-1 border border-primary/5">
                      <div className="flex items-center gap-2 text-muted-foreground"><item.icon size={12} className="text-primary/60" /><span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span></div>
                      <p className="text-xs font-bold truncate text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Participation & Financial History */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.3em] flex items-center gap-2">
                    <History size={14} /> Treasury Ledger (Last 5)
                  </h4>
                  <div className="space-y-2">
                    {(!payments || payments.length === 0) ? (
                      <div className="p-4 bg-secondary/5 rounded-2xl text-center border border-dashed">
                        <p className="text-[10px] font-bold text-muted-foreground italic">No financial records found.</p>
                      </div>
                    ) : (
                      payments.map((p: any) => (
                        <div key={p.id} className="flex items-center justify-between p-3 bg-secondary/10 rounded-xl border border-primary/5 hover:bg-secondary/20 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-emerald-500 shadow-sm"><CreditCard size={16} /></div>
                            <div>
                              <p className="text-[10px] font-black uppercase">{p.description || 'Association Dues'}</p>
                              <p className="text-[8px] font-bold text-muted-foreground">{p.date}</p>
                            </div>
                          </div>
                          <p className="text-xs font-black text-emerald-600">{p.currency} {p.amount}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4 bg-secondary/5 rounded-3xl border-2 border-dashed border-primary/10">
                <Lock className="text-primary/40" size={48} />
                <div className="space-y-1">
                  <h4 className="font-black uppercase text-xs tracking-widest">Privacy Protocol Active</h4>
                  <p className="text-[10px] font-bold text-muted-foreground leading-relaxed">
                    Personal Identifiable Information (PII) and financial records are restricted to the individual node owner and verified management.
                  </p>
                </div>
              </div>
            )}
            
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 text-center">
              <p className="text-[9px] font-black text-primary uppercase mb-1 tracking-widest">Official Registry Status</p>
              <p className="text-xs font-bold text-foreground">Member Since {new Date(member.memberSince).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-card shrink-0 flex gap-3 print:hidden">
          <Button onClick={handlePrint} className="flex-1 h-12 rounded-xl font-black uppercase text-[10px] gap-2 shadow-xl bg-primary text-white hover:opacity-90">
            <Printer size={16} /> {language === 'ar' ? 'طباعة' : 'Print Card'}
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF} disabled={isGeneratingPdf} className="flex-1 h-12 rounded-xl font-black uppercase text-[10px] gap-2 border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all">
            {isGeneratingPdf ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
            {language === 'ar' ? 'تحميل PDF' : 'Download PDF'}
          </Button>
        </div>

        <style jsx global>{`
          @media print {
            body * { visibility: hidden; }
            #member-card-print, #member-card-print * { visibility: visible !important; }
            #member-card-print {
              position: fixed !important; 
              left: 50% !important; 
              top: 50% !important;
              transform: translate(-50%, -50%) !important;
              width: 3.375in !important;
              height: 2.125in !important;
              box-shadow: none !important;
              background-color: #2E6CDC !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              border-radius: 12px !important;
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
              justify-content: center !important;
            }
            .print\:hidden { display: none !important; }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
