import { createContext, useContext } from 'react'
export const TierContext = createContext<'high' | 'low'>('high')
export const useSceneTier = () => useContext(TierContext)
