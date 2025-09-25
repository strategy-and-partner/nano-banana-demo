import { verifySession } from '@/lib/dal';
import GeminiDemoClient from '@/components/GeminiDemoClient';

export default async function GeminiDemo() {
  // Verify user is authenticated, redirect to login if not
  await verifySession();

  return (
    <GeminiDemoClient />
  );
}