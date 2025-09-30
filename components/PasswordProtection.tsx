'use client';

import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';

type PasswordProtectionProps = {
  children: ReactNode;
};

const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export function PasswordProtection({ children }: PasswordProtectionProps) {
  const supabase = getSupabaseClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsCheckingSession(false);
      return;
    }

    let isMounted = true;

    const resolveSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!isMounted) {
          return;
        }
        setIsAuthenticated(Boolean(data.session));
      } catch (sessionError) {
        if (!isMounted) {
          return;
        }
        setError(sessionError instanceof Error ? sessionError.message : 'Unable to verify the current session.');
      } finally {
        if (isMounted) {
          setIsCheckingSession(false);
        }
      }
    };

    void resolveSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session));
      setError(null);
    });

    return () => {
      isMounted = false;
      listener?.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please provide both an email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError(signInError.message);
      } else {
        setIsAuthenticated(true);
      }
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : 'Unable to sign in with the provided credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="auth-state">
        <p>Checking authentication…</p>
        <style jsx>{`
          .auth-state {
            display: flex;
            min-height: 100vh;
            align-items: center;
            justify-content: center;
            color: rgba(226, 232, 240, 0.75);
          }
        `}</style>
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="auth-state">
        <p>Supabase credentials are not configured.</p>
        <style jsx>{`
          .auth-state {
            display: flex;
            min-height: 100vh;
            align-items: center;
            justify-content: center;
            color: #f87171;
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="auth-wrapper">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h1>Sign in to continue</h1>
          <p className="hint">Access is restricted to authorized accounts.</p>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <style jsx>{`
          .auth-wrapper {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .auth-card {
            width: min(360px, 100%);
            background: rgba(15, 23, 42, 0.72);
            border: 1px solid rgba(148, 163, 184, 0.24);
            border-radius: 16px;
            padding: 2rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            box-shadow: 0 24px 60px rgba(15, 23, 42, 0.45);
            backdrop-filter: blur(14px);
          }

          h1 {
            font-size: 1.25rem;
            color: #f8fafc;
          }

          .hint {
            font-size: 0.9rem;
            color: rgba(226, 232, 240, 0.65);
          }

          .field {
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
            font-size: 0.95rem;
            color: rgba(226, 232, 240, 0.85);
          }

          input {
            background: rgba(15, 23, 42, 0.85);
            border: 1px solid rgba(148, 163, 184, 0.35);
            border-radius: 10px;
            padding: 0.65rem 0.75rem;
            color: #f8fafc;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
          }

          input:focus {
            outline: none;
            border-color: rgba(96, 165, 250, 0.85);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
          }

          .error {
            color: #f87171;
            font-size: 0.9rem;
          }

          button {
            margin-top: 0.5rem;
            background: linear-gradient(135deg, rgba(96, 165, 250, 0.95), rgba(59, 130, 246, 0.85));
            color: #0b1120;
            font-weight: 600;
            border-radius: 9999px;
            padding: 0.65rem;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }

          button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          button:not(:disabled):hover {
            transform: translateY(-1px);
            box-shadow: 0 12px 25px rgba(59, 130, 246, 0.35);
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
}
