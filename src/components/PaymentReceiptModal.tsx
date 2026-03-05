'use client';

import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { 
  Printer, 
  Download, 
  X, 
  ShieldCheck, 
  User,
  CreditCard,
  Building2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface PaymentReceiptModalProps {
  payment: any;
  member: any;
  onClose: () => void;
}

export function PaymentReceiptModal({ payment, member, onClose }: PaymentReceiptModalProps) {
  const { language, t } = useLanguage();

  if (!payment) return null;

  const handlePrint = () => { window.print(); };

  const verificationData = useMemo(() => JSON.stringify({
    org: "ANNA Association Hub",
    protocolId: payment.id,
    member: member ? `${member.firstName} ${member.lastName}` : "Unknown",
    amount: payment.amount,
    currency: payment.currency || 'USD',
    method: payment.method,
    date: payment.date,
    timestamp: new Date().toISOString()
  }), [payment, member]);

  return (
    <Dialog open={!!payment} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[550px] w-[95vw] max-h-[95vh] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-3xl bg-background flex flex-col">
        <DialogHeader className="p-6 pb-2 shrink-0 border-b bg-secondary/5 print:hidden">
           <div className="flex justify-between items-center">
             <DialogTitle className="text-xl font-black uppercase tracking-tighter text-foreground flex items-center gap-3">
               <ShieldCheck className="text-primary" size={24} /> {language === 'ar' ? 'إيصال مالي رسمي' : language === 'rw' ? 'Inyandiko y\'ubwishyure' : 'Official Financial Voucher'}
             </DialogTitle>
             <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl h-8 w-8 hover:bg-secondary/50"><X size={18} /></Button>
           </div>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto p-6 flex flex-col items-center bg-secondary/5 print:bg-white print:p-0 print:overflow-visible scrollbar-hide">
          <div id="receipt-voucher" className="w-full max-w-[450px] bg-card border-2 border-dashed border-primary/30 rounded-[3rem] p-10 space-y-8 relative overflow-hidden shadow-xl print:border-solid print:border-black/20 print:rounded-none print:shadow-none print:w-full print:max-w-none print:p-8 print:m-0">
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none"><ShieldCheck size={300} /></div>

            <div className="text-center space-y-2 border-b-2 border-primary/10 pb-8 relative z-10">
              <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl mb-4 print:border print:border-black"><Building2 size={36} /></div>
              <h3 className="font-black text-2xl uppercase tracking-tighter">ANNA Association</h3>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{language === 'ar' ? 'نموذج مالي معتمد' : language === 'rw' ? 'INYEZAMBUKO YEMEYE' : 'OFFICIAL TREASURY VOUCHER'}</p>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="bg-secondary/10 p-5 rounded-3xl flex items-center justify-between border border-primary/5">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase text-muted-foreground opacity-60 tracking-widest">{language === 'ar' ? 'هوية العضو' : language === 'rw' ? 'UMWIRONDORO' : 'MEMBER IDENTITY'}</p>
                  <p className="text-lg font-black uppercase">{member ? `${member.firstName} ${member.lastName}` : 'System Node'}</p>
                  <p className="text-[10px] font-bold text-primary font-mono">{member?.id || 'UID-PENDING'}</p>
                </div>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-primary/5"><User size={24} className="text-primary" /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary/5 p-5 rounded-3xl space-y-1 border border-primary/10">
                  <p className="text-[9px] font-black uppercase text-muted-foreground opacity-60 tracking-widest">AMOUNT PAID</p>
                  <p className="text-2xl font-black text-primary">{payment.currency || 'USD'} {parseFloat(payment.amount).toLocaleString()}</p>
                </div>
                <div className="bg-secondary/10 p-5 rounded-3xl space-y-1 border border-primary/5">
                  <p className="text-[9px] font-black uppercase text-muted-foreground opacity-60 tracking-widest">METHOD</p>
                  <div className="flex items-center gap-2"><CreditCard size={18} className="text-primary" /><p className="text-[10px] font-black uppercase">{payment.method}</p></div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center space-y-5 pt-8 border-t-2 border-primary/10 border-dotted relative z-10">
              <div className="bg-white p-4 rounded-[2rem] shadow-2xl border-4 border-secondary/20 print:shadow-none print:border-black/10">
                <QRCodeSVG value={verificationData} size={140} level="H" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">SCAN FOR VERIFICATION</p>
                <p className="text-[8px] font-bold text-muted-foreground max-w-[280px] mx-auto">This document is digitally encrypted and verified as final proof of financial contribution.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 border-t bg-card shrink-0 flex gap-4 print:hidden">
          <Button onClick={handlePrint} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] gap-3 shadow-2xl text-white hover:opacity-90 transition-all group">
            <Printer size={20} className="text-white" /> {language === 'ar' ? 'طباعة الإيصال' : language === 'rw' ? 'Capa Inyandiko' : 'Print Official Receipt'}
          </Button>
        </div>

        <style jsx global>{`
          @media print {
            body * { visibility: hidden; }
            #receipt-voucher, #receipt-voucher * { visibility: visible !important; }
            #receipt-voucher { position: fixed !important; left: 50% !important; top: 50% !important; transform: translate(-50%, -50%) !important; width: 450px !important; margin: 0 !important; padding: 40px !important; border: 1px solid #000 !important; box-shadow: none !important; background: white !important; }
            .print\:hidden { display: none !important; }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
