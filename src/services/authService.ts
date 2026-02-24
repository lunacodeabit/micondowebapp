// =================================================================
// AUTH SERVICE - Supabase Auth
// Replaces Firebase Auth calls in AuthContext.tsx
// =================================================================

import { supabase } from '../supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

export type UserRole = 'superadmin' | 'admin' | 'resident';

export interface UserProfile {
    id: string;
    email: string;
    full_name: string | null;
    role: UserRole;
    company_id: string | null;
    phone: string | null;
    avatar_url: string | null;
}

/**
 * Sign in with email/password
 * Replaces: signInWithEmailAndPassword(auth, email, pass)
 */
export async function loginWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) throw error;
    return data;
}

/**
 * Sign out
 * Replaces: signOut(auth)
 */
export async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

/**
 * Sign up with email/password
 */
export async function signUpWithEmail(email: string, password: string, fullName: string, role: UserRole = 'resident') {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                role: role
            }
        }
    });
    if (error) throw error;
    return data;
}

/**
 * Reset password
 */
export async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
}

/**
 * Sign in with Google
 */
export async function loginWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
        }
    });
    if (error) throw error;
    return data;
}

/**
 * Get current session (includes user)
 */
export async function getSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

/**
 * Subscribe to auth state changes
 * Replaces: onAuthStateChanged(auth, callback)
 */
export function onAuthStateChange(
    callback: (user: User | null, session: Session | null) => void
) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
            callback(session?.user ?? null, session);
        }
    );
    return subscription;
}

/**
 * Fetch user profile from profiles table
 * Replaces: Firestore doc read for user role/company
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
    return data as UserProfile;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>
) {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;
    return data as UserProfile;
}

/**
 * Check if user is SuperAdmin
 */
export async function checkIsSuperAdmin(userId: string): Promise<boolean> {
    const profile = await getUserProfile(userId);
    return profile?.role === 'superadmin';
}
