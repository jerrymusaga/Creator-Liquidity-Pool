import { create } from 'zustand'
import { User, Economy, NFT, Transaction } from '@/types'

interface AppState {
  user: User | null;
  economies: Economy[];
  userNFTs: NFT[];
  transactions: Transaction[];
  coinHoldings: any[];
  selectedEconomy: Economy | null;
  
  // Actions
  setUser: (user: User) => void;
  setEconomies: (economies: Economy[]) => void;
  setSelectedEconomy: (economy: Economy | null) => void;
  addTransaction: (transaction: Transaction) => void;
  addNFT: (nft: NFT) => void;
  setCoinHoldings: (holdings: any[]) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  economies: [],
  userNFTs: [],
  transactions: [],
  coinHoldings: [],
  selectedEconomy: null,
  
  setUser: (user) => set({ user }),
  setEconomies: (economies) => set({ economies }),
  setSelectedEconomy: (economy) => set({ selectedEconomy: economy }),
  addTransaction: (transaction) => set((state) => ({ 
    transactions: [transaction, ...state.transactions] 
  })),
  addNFT: (nft) => set((state) => ({ 
    userNFTs: [nft, ...state.userNFTs] 
  })),
  setCoinHoldings: (holdings) => set({ coinHoldings: holdings }),
}))