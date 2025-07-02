// components/wallet/ConnectButton.tsx
'use client'

import React from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { motion } from 'framer-motion'
import { Wallet, Zap, AlertTriangle, CheckCircle } from 'lucide-react'
import { useWallet } from '@/hooks/useWallet'
import { Button } from '@/components/ui/Button'

interface CustomConnectButtonProps {
  showBalance?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'outline'
}

export const CustomConnectButton: React.FC<CustomConnectButtonProps> = ({
  showBalance = false,
  size = 'md',
  variant = 'primary'
}) => {
  const { isOnCorrectNetwork, switchToCorrectNetwork, networkConfig, isSwitchPending } = useWallet()

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading'
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated')

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    variant={variant}
                    size={size}
                    className="flex items-center"
                  >
                    <Wallet className="w-5 h-5 mr-2" />
                    Connect Wallet
                  </Button>
                )
              }

              if (chain.unsupported || !isOnCorrectNetwork) {
                return (
                  <Button
                    onClick={isSwitchPending ? undefined : switchToCorrectNetwork}
                    disabled={isSwitchPending}
                    variant="outline"
                    size={size}
                    className="flex items-center border-red-500 text-red-400 hover:bg-red-500/10"
                  >
                    {isSwitchPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400 mr-2"></div>
                        Switching...
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Switch to {networkConfig.name}
                      </>
                    )}
                  </Button>
                )
              }

              return (
                <div className="flex items-center space-x-2">
                  {/* Network Indicator */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center bg-green-500/20 text-green-400 px-2 py-1 rounded-lg text-xs font-medium"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {chain.name}
                  </motion.div>

                  {/* Balance (if requested) */}
                  {showBalance && account.displayBalance && (
                    <div className="text-sm text-gray-400 font-mono">
                      {account.displayBalance}
                    </div>
                  )}

                  {/* Account Button */}
                  <Button
                    onClick={openAccountModal}
                    variant="outline"
                    size={size}
                    className="flex items-center"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-vibe flex items-center justify-center mr-2">
                      <span className="text-xs font-bold text-white">
                        {account.displayName?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <span className="font-mono">
                      {account.displayName}
                    </span>
                  </Button>
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}

// Simple connect button for create economy flow
export const SimpleConnectButton: React.FC<{
  onConnect?: () => void
}> = ({ onConnect }) => {
  return (
    <ConnectButton.Custom>
      {({ openConnectModal, connectModalOpen }) => {
        const handleConnect = () => {
          openConnectModal()
          onConnect?.()
        }

        return (
          <Button
            onClick={handleConnect}
            disabled={connectModalOpen}
            className="w-full"
            size="lg"
          >
            {connectModalOpen ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Opening Wallet...
              </div>
            ) : (
              <>
                <Wallet className="w-5 h-5 mr-2" />
                Connect Wallet
              </>
            )}
          </Button>
        )
      }}
    </ConnectButton.Custom>
  )
}