import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function HomePage() {
  // If database isn't configured, just show the landing page
  if (!process.env.DATABASE_URL) {
    redirect('/landing')
  }

  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) {
    redirect('/dashboard')
  }
  redirect('/landing')
}
