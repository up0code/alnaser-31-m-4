
'use client';

import React from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useUser, useDoc, useFirestore } from '@/firebase';
import { useLanguage } from './LanguageContext';
import { doc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';

export function AdminFloatingButton() {
  const { user, isUserLoading } = useUser();
  const { t, dir } = useLanguage();
  const db = useFirestore();

  // Fetch profile to verify role
  const profileRef = useMemoFirebase(() => user ? doc(db, 'userProfiles', user.uid) : null, [db, user]);
  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  // Management roles list
  const managementRoles = ['admin', 'president', 'secretary', 'treasurer', 'executive'];
  const userRole = profile?.role?.toLowerCase() || '';
  const isActuallyAdmin = user?.email === 'up0code@gmail.com' || (user && managementRoles.includes(userRole));

  // Do not show button if loading, no user, or not admin
  if (isUserLoading || isProfileLoading || !user || !isActuallyAdmin) return null;

  // Position it opposite to the Chatbot (Chatbot is on the right in LTR, left in RTL)
  // Admin button will be on the Left in LTR, Right in RTL to avoid overlap
  const positionClasses = dir === 'rtl' ? 'right-6' : 'left-6';

  return (
    <div className={`fixed bottom-6 ${positionClasses} z-50`}>
      <Link href="/admin">
        <Button 
          size="icon" 
          className="h-12 w-12 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all bg-primary text-white border-4 border-white/20"
          title={t.common.admin}
        >
          <Shield size={24} />
        </Button>
      </Link>
    </div>
  );
}
