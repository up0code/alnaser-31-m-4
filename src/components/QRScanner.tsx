'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from "html5-qrcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from './LanguageContext';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { QrCode, Camera, X, Search, User as UserIcon, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { MemberProfileModal } from './MemberProfileModal';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function QRScanner() {
  const { t, language, dir } = useLanguage();
  const { toast } = useToast();
  const db = useFirestore();
  
  const [isOpen, setOpen] = useState(false);
  const [isScanning, setScanning] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [hasError, setHasError] = useState<string | null>(null);
  const [manualId, setManualId] = useState('');
  const [scannedMember, setScannedMember] = useState<any>(null);
  const [cameraMode, setCameraMode] = useState<'environment' | 'user'>('environment');
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const videoId = "qr-reader-container";

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        setScanning(false);
      } catch (err) {
        console.error("Failed to stop scanner", err);
      }
    }
  };

  const startScanner = async () => {
    if (!isOpen) return;
    setLoading(true);
    setHasError(null);
    
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(videoId);
      }
      
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      
      // Attempt to start with preferred camera mode
      try {
        await scannerRef.current.start(
          { facingMode: cameraMode },
          config,
          (decodedText) => { handleResult(decodedText); },
          () => {} 
        );
      } catch (e: any) {
        console.warn("Primary camera mode failed, checking available devices...", e);
        // Fallback: Detect all cameras and use the first one
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          await scannerRef.current.start(
            devices[0].id,
            config,
            (decodedText) => { handleResult(decodedText); },
            () => {}
          );
        } else {
          throw new Error("No camera hardware detected on this device.");
        }
      }
      setScanning(true);
    } catch (err: any) {
      console.error("Scanner start error", err);
      setHasError(err.message || "Camera access denied or device not found.");
    } finally {
      setLoading(false);
    }
  };

  const handleResult = async (id: string) => {
    await stopScanner();
    setLoading(true);
    try {
      let lookupId = id;
      try {
        const parsed = JSON.parse(id);
        lookupId = parsed.id || id;
      } catch { /* ignore */ }

      const snap = await getDoc(doc(db, 'userProfiles', lookupId));
      if (snap.exists()) {
        setScannedMember({ ...snap.data(), id: snap.id });
        setOpen(false);
      } else {
        toast({ variant: "destructive", title: t.qr.notFound });
        startScanner(); // Restart if not found
      }
    } catch (err) {
      toast({ variant: "destructive", title: t.qr.invalid });
      startScanner();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Delay slightly to ensure DOM element is ready
      const timer = setTimeout(startScanner, 500);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [isOpen, cameraMode]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full h-16 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest gap-4 shadow-2xl transition-all active:scale-95">
            <Camera size={28} />
            {t.qr.scanTitle}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] rounded-[1.5rem] p-0 overflow-hidden border-none shadow-3xl bg-card">
          <DialogHeader className="p-5 border-b flex flex-row items-center justify-between space-y-0 bg-secondary/5">
            <DialogTitle className="text-base font-bold flex items-center gap-3">
              <Camera className="text-primary" size={20} /> {t.qr.scanTitle}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 text-[10px] font-bold rounded-lg gap-2 border-2" 
                onClick={() => setCameraMode(prev => prev === 'environment' ? 'user' : 'environment')}
              >
                <RefreshCw size={12} className={cn(cameraMode === 'user' && "rotate-180 transition-transform")} />
                {t.qr.switchCamera}
              </Button>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-6">
            {hasError ? (
              <div className="space-y-4">
                <Alert variant="destructive" className="rounded-2xl border-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="font-black uppercase tracking-tighter">Hardware Access Error</AlertTitle>
                  <AlertDescription className="text-xs font-bold leading-relaxed">
                    {hasError}. Please ensure you have granted camera permissions in your browser settings and that a camera is connected.
                  </AlertDescription>
                </Alert>
                <Button onClick={startScanner} className="w-full h-12 rounded-xl font-bold uppercase tracking-widest gap-2 shadow-lg">
                  <RefreshCw size={16} /> Retry Initialization
                </Button>
              </div>
            ) : (
              <div className="relative aspect-square bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-secondary/20">
                <div id={videoId} className="w-full h-full"></div>
                
                {/* Visual Scan Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-primary/40 rounded-[2rem] relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-primary animate-scan shadow-[0_0_20px_hsl(var(--primary))]"></div>
                  </div>
                </div>

                {isLoading && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white gap-4 backdrop-blur-md">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase">{t.qr.loadingCamera}</span>
                  </div>
                )}
              </div>
            )}

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-muted/30"></span></div>
              <div className="relative flex justify-center text-[9px] uppercase font-black tracking-widest"><span className="bg-card px-4 text-muted-foreground">OR VERIFY BY ID</span></div>
            </div>

            <div className="flex gap-2">
              <Input 
                placeholder={t.qr.manualPlaceholder} 
                className="h-12 text-sm rounded-xl bg-secondary/20 border-none px-4 font-bold focus:ring-4 focus:ring-primary/10"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleResult(manualId)}
              />
              <Button onClick={() => handleResult(manualId)} disabled={!manualId.trim() || isLoading} size="icon" className="h-12 w-12 shrink-0 rounded-xl shadow-xl bg-primary hover:bg-primary/90">
                <Search size={20} />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <MemberProfileModal member={scannedMember} onClose={() => setScannedMember(null)} />

      <style jsx global>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan { animation: scan 3s ease-in-out infinite; }
        #qr-reader-container video {
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>
    </>
  );
}
