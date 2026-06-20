'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { login, register } from '@/lib/api-client';
import { getRoleHome } from '@/lib/auth-store';
import { Button, Input, PageHeader } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const profile =
        mode === 'login'
          ? await login(email, password)
          : await register(name, email, password);
      router.push(next ?? getRoleHome(profile.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <PageHeader
        title={mode === 'login' ? 'Anmelden' : 'Registrieren'}
        subtitle="Zugang zu Warenkorb, Bestellungen und Händlerportal."
      />
      <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-white p-6">
        {mode === 'register' ? (
          <Input placeholder="Name" required value={name} onChange={(e) => setName(e.target.value)} />
        ) : null}
        <Input type="email" placeholder="E-Mail" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" placeholder="Passwort" required value={password} onChange={(e) => setPassword(e.target.value)} />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {mode === 'login' ? 'Anmelden' : 'Konto erstellen'}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        {mode === 'login' ? (
          <>Noch kein Konto? <button type="button" className="font-semibold text-[#001529]" onClick={() => setMode('register')}>Registrieren</button></>
        ) : (
          <>Bereits registriert? <button type="button" className="font-semibold text-[#001529]" onClick={() => setMode('login')}>Anmelden</button></>
        )}
      </p>
      <p className="mt-4 text-center"><Link href="/" className="text-sm text-gray-500">Zur Startseite</Link></p>
    </div>
  );
}
