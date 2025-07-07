'use client'
import React from 'react'
import { RealCreateEconomy } from '@/components/creator/RealCreateEconomy'
export default function CreatePage() {
  const handleComplete = () => {
    // Navigate to home or economy page (to be implemented)
    console.log('Economy created')
  }
  return <RealCreateEconomy onComplete={handleComplete} />
}

