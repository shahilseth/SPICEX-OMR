import { redirect } from 'next/navigation';

export default function Home() {
  // Root page redirects to dashboard (which handles auth)
  redirect('/dashboard');
}