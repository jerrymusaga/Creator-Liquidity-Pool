import React from 'react'
import { CreateEconomy } from '@/components/creator/CreateEconomy'
export default function CreatePage() {
  const handleComplete = () => {
    // Navigate to home or economy page (to be implemented)
    console.log('Economy created')
  }
  return <CreateEconomy onComplete={handleComplete} />
}

