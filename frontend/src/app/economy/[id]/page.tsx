import React from 'react'
import { EconomyPage } from '@/components/economy/EconomyPage'
import { mockEconomies } from '@/lib/mockData'
import { notFound } from 'next/navigation'
export default function EconomyDetailPage({ params }: { params: { id: string } }) {
  const economy = mockEconomies.find((e) => e.id === params.id)
  if (!economy) {
    notFound()
  }
  const handleBack = () => {
    // Navigate back to home (to be implemented with router)
    console.log('Back to home')
  }
  return <EconomyPage economy={economy} onBack={handleBack} />
}

