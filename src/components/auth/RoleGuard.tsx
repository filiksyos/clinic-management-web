'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import FullPageLoader from '@/components/ui/FullPageLoader'; // Corrected import path

type AllowedRoles = Array<'receptionist' | 'doctor'>;

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: AllowedRoles;
  fallbackUrl?: string;
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallbackUrl = '/'
}: RoleGuardProps) {
  const { userRole, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Skip checks if still loading initial auth state
    if (isLoading) return;

    // Redirect if:
    // 1. No user is logged in (user is null)
    // 2. User role is not determined yet (userRole is null)
    // 3. User role is not in the allowed list
    if (!user || !userRole || !allowedRoles.includes(userRole)) {
      console.log(`RoleGuard: Access denied for role '${userRole}'. Redirecting to ${fallbackUrl}`);
      router.replace(fallbackUrl); // Use replace to avoid adding to history stack
    }
  }, [userRole, isLoading, user, allowedRoles, router, fallbackUrl]);

  // Show loading indicator while checking authentication and role
  if (isLoading || !user || !userRole) {
    return <FullPageLoader />;
  }

  // If user has an allowed role, render children
  if (allowedRoles.includes(userRole)) {
    return <>{children}</>;
  }

  // Fallback: Render loader while redirecting 
  // This prevents brief flashing of content before redirection completes
  return <FullPageLoader />;
} 