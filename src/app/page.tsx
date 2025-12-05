import { redirect } from 'next/navigation'

export default function RootPage() {
  // Redirect to marketing homepage
  redirect('/(marketing)')
}