import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

import { useStore } from '@/stores/useStore'
import toast from 'react-hot-toast'
interface CreateEconomyProps {
  onComplete: () => void
}
export const CreateEconomy: React.FC<CreateEconomyProps> = ({ onComplete }) => {
  const { user } = useStore()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    video: '',
    tokenSymbol: '',
    totalSupply: 1000000,
    airdropAmount: 100,
  })
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setFormData({ ...formData, [e.target.name]: url })
    }
  }
  const handleSubmit = () => {
    if (!user) {
      toast.error('Please login first!')
      return
    }

if (!formData.name || !formData.description || !formData.tokenSymbol) {
  toast.error('Please fill all required fields!')
  return
}

// Mock economy creation


toast.success('Economy created! Frame shared on Farcaster!')
onComplete()

  }
  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto py-6"
    >
      <Card className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Launch Your Vibe</h2>
        <div className="flex justify-between mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-1/3 h-2 rounded-full ${s <= step ? 'bg-vibe-purple' : 'bg-gray-700'}`}
            />
          ))}
        </div>

    {step === 1 && (
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full bg-gray-700 text-white rounded-lg p-3"
            placeholder="Epic Fortnite Win"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full bg-gray-700 text-white rounded-lg p-3"
            placeholder="Join my gaming crew!"
            rows={4}
          />
        </div>
        <Button className="w-full" onClick={nextStep}>
          Next
        </Button>
      </div>
    )}

    {step === 2 && (
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Image *</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full bg-gray-700 text-white rounded-lg p-3"
          />
          {formData.image && (
            <img src={formData.image} alt="Preview" className="mt-4 w-full h-48 object-cover rounded-lg" />
          )}
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Video (Optional)</label>
          <input
            type="file"
            name="video"
            accept="video/*"
            onChange={handleFileChange}
            className="w-full bg-gray-700 text-white rounded-lg p-3"
          />
        </div>
        <div className="flex space-x-4">
          <Button variant="secondary" className="flex-1" onClick={prevStep}>
            Back
          </Button>
          <Button className="flex-1" onClick={nextStep}>
            Next
          </Button>
        </div>
      </div>
    )}

    {step === 3 && (
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Token Symbol *</label>
          <input
            type="text"
            name="tokenSymbol"
            value={formData.tokenSymbol}
            onChange={handleChange}
            className="w-full bg-gray-700 text-white rounded-lg p-3"
            placeholder="JAKE"
            maxLength={10}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Total Supply</label>
          <input
            type="number"
            name="totalSupply"
            value={formData.totalSupply}
            onChange={handleChange}
            className="w-full bg-gray-700 text-white rounded-lg p-3"
            placeholder="1000000"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Airdrop Amount</label>
          <input
            type="number"
            name="airdropAmount"
            value={formData.airdropAmount}
            onChange={handleChange}
            className="w-full bg-gray-700 text-white rounded-lg p-3"
            placeholder="100"
          />
        </div>
        <div className="flex space-x-4">
          <Button variant="secondary" className="flex-1" onClick={prevStep}>
            Back
          </Button>
          <Button className="flex-1" onClick={handleSubmit}>
            Launch Vibe
          </Button>
        </div>
      </div>
    )}
  </Card>
</motion.div>

  )
}

