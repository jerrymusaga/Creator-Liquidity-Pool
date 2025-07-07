import { notFound } from 'next/navigation'

// This page is deprecated as we've moved to Zora SDK integration
// Economy details are now handled through the main coin display components
export default async function EconomyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Redirect to home since this page is no longer supported
  notFound()
}

