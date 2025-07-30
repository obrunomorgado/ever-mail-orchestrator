import React, { createContext, useContext, useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

// Types
interface Contact {
  id: string
  email: string
  tags: string[]
  openedEmails: number
  clickedEmails: number
  purchaseAmount: number
  lastOpen: Date
  lastPurchase: Date
  avgERP: number
  isActive: boolean
  audienceId?: string
}

interface Audience {
  id: string
  name: string
  rule: string
  size: number
  contacts: Contact[]
  updatedAt: Date
  type: 'dynamic' | 'static'
  eRPM: number
  health: 'excellent' | 'good' | 'warning' | 'poor'
}

interface Campaign {
  id: string
  name: string
  audienceId: string
  scheduledTime: string
  status: 'scheduled' | 'sending' | 'completed' | 'paused'
  sent: number
  opened: number
  clicked: number
  revenue: number
  spamRate: number
}

interface DataContextType {
  // Data
  contacts: Contact[]
  audiences: Audience[]
  campaigns: Campaign[]
  
  // Global metrics
  totalContacts: number
  dailyRevenue: number
  avgERP: number
  globalSpamRate: number
  
  // Actions
  createAudience: (audience: Omit<Audience, 'id' | 'contacts' | 'size' | 'updatedAt'>) => void
  updateAudience: (id: string, updates: Partial<Audience>) => void
  scheduleCampaign: (campaign: Omit<Campaign, 'id' | 'status'>) => void
  pauseCampaign: (id: string) => void
  
  // Real-time validation
  validateFrequencyCap: (audienceId: string, timeSlot: string) => boolean
  getOverlapPercentage: (audience1Id: string, audience2Id: string) => number
  
  // Performance
  loading: boolean
  lastUpdate: Date
}

// Generate 3M realistic contacts
const generateContacts = (count: number): Contact[] => {
  const contacts: Contact[] = []
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'empresa.com']
  const tags = ['vip', 'opened_3', 'clicked_1', 'hot_eRPM', 'inactive_90d', 'high_value', 'newsletter']
  
  for (let i = 0; i < count; i++) {
    const openedEmails = Math.floor(Math.random() * 20)
    const clickedEmails = Math.floor(Math.random() * openedEmails)
    const purchaseAmount = Math.random() * 2000
    const lastOpen = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
    const lastPurchase = new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000)
    
    contacts.push({
      id: `contact_${i}`,
      email: `user${i}@${domains[Math.floor(Math.random() * domains.length)]}`,
      tags: Array.from({ length: Math.floor(Math.random() * 3) }, () => 
        tags[Math.floor(Math.random() * tags.length)]
      ),
      openedEmails,
      clickedEmails,
      purchaseAmount,
      lastOpen,
      lastPurchase,
      avgERP: purchaseAmount > 500 ? Math.random() * 300 + 100 : Math.random() * 150 + 50,
      isActive: Math.random() > 0.2,
      audienceId: undefined
    })
  }
  
  return contacts
}

// Generate realistic audiences
const generateAudiences = (contacts: Contact[]): Audience[] => {
  const audienceConfigs = [
    {
      name: 'Cartões VIP',
      rule: 'purchase_amount > 500 AND last_purchase < 30d',
      filter: (c: Contact) => c.purchaseAmount > 500 && 
        (Date.now() - c.lastPurchase.getTime()) < 30 * 24 * 60 * 60 * 1000
    },
    {
      name: 'Hot eRPM',
      rule: 'avg_eRPM > 150 AND opened_last_7d = true',
      filter: (c: Contact) => c.avgERP > 150 && 
        (Date.now() - c.lastOpen.getTime()) < 7 * 24 * 60 * 60 * 1000
    },
    {
      name: 'Opened_3',
      rule: 'opened_emails >= 3 AND last_open < 7d',
      filter: (c: Contact) => c.openedEmails >= 3 && 
        (Date.now() - c.lastOpen.getTime()) < 7 * 24 * 60 * 60 * 1000
    },
    {
      name: 'Clicked_1',
      rule: 'clicked_emails >= 1 AND last_click < 30d',
      filter: (c: Contact) => c.clickedEmails >= 1 && c.isActive
    },
    {
      name: 'Newsletter Subscribers',
      rule: 'newsletter_tag = true',
      filter: (c: Contact) => c.tags.includes('newsletter')
    },
    {
      name: 'High Value Customers',
      rule: 'purchase_amount > 1000',
      filter: (c: Contact) => c.purchaseAmount > 1000
    }
  ]
  
  return audienceConfigs.map((config, index) => {
    const filteredContacts = contacts.filter(config.filter)
    const avgERP = filteredContacts.reduce((sum, c) => sum + c.avgERP, 0) / filteredContacts.length || 0
    
    // Assign audience ID to contacts
    filteredContacts.forEach(contact => {
      contact.audienceId = `audience_${index}`
    })
    
    return {
      id: `audience_${index}`,
      name: config.name,
      rule: config.rule,
      size: filteredContacts.length,
      contacts: filteredContacts,
      updatedAt: new Date(),
      type: 'dynamic' as const,
      eRPM: avgERP,
      health: avgERP > 150 ? 'excellent' : avgERP > 100 ? 'good' : avgERP > 50 ? 'warning' : 'poor'
    }
  })
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [audiences, setAudiences] = useState<Audience[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const { toast } = useToast()

  // Initialize data
  useEffect(() => {
    const initializeData = () => {
      console.log('Generating 3M contacts...')
      const generatedContacts = generateContacts(3000000)
      const generatedAudiences = generateAudiences(generatedContacts)
      
      setContacts(generatedContacts)
      setAudiences(generatedAudiences)
      setLastUpdate(new Date())
      setLoading(false)
      
      console.log(`Generated ${generatedContacts.length} contacts and ${generatedAudiences.length} audiences`)
    }

    // Simulate loading time
    setTimeout(initializeData, 1000)
  }, [])

  // Real-time data updates
  useEffect(() => {
    if (loading) return

    const interval = setInterval(() => {
      // Update audience sizes and metrics
      setAudiences(prev => prev.map(audience => ({
        ...audience,
        size: audience.size + Math.floor(Math.random() * 100 - 50), // ±50 variation
        eRPM: audience.eRPM + (Math.random() - 0.5) * 10, // ±5 variation
        updatedAt: new Date()
      })))
      
      setLastUpdate(new Date())
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [loading])

  // Calculated metrics
  const totalContacts = contacts.length
  const dailyRevenue = audiences.reduce((sum, a) => sum + (a.size * a.eRPM / 1000), 0)
  const avgERP = audiences.reduce((sum, a) => sum + a.eRPM, 0) / audiences.length || 0
  const globalSpamRate = Math.random() * 0.08 // 0-0.08%

  // Actions
  const createAudience = (audienceData: Omit<Audience, 'id' | 'contacts' | 'size' | 'updatedAt'>) => {
    const newAudience: Audience = {
      ...audienceData,
      id: `audience_${Date.now()}`,
      contacts: [], // Would apply rule filtering here
      size: Math.floor(Math.random() * 100000) + 10000,
      updatedAt: new Date()
    }
    
    setAudiences(prev => [...prev, newAudience])
    toast({
      title: "Audience criada!",
      description: `${newAudience.name} com ${newAudience.size.toLocaleString('pt-BR')} contatos`,
    })
  }

  const updateAudience = (id: string, updates: Partial<Audience>) => {
    setAudiences(prev => prev.map(audience => 
      audience.id === id ? { ...audience, ...updates, updatedAt: new Date() } : audience
    ))
  }

  const scheduleCampaign = (campaignData: Omit<Campaign, 'id' | 'status'>) => {
    const newCampaign: Campaign = {
      ...campaignData,
      id: `campaign_${Date.now()}`,
      status: 'scheduled'
    }
    
    setCampaigns(prev => [...prev, newCampaign])
    toast({
      title: "Campanha agendada!",
      description: `${newCampaign.name} para ${newCampaign.scheduledTime}`,
    })
  }

  const pauseCampaign = (id: string) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === id ? { ...campaign, status: 'paused' as const } : campaign
    ))
  }

  // Validation functions
  const validateFrequencyCap = (audienceId: string, timeSlot: string): boolean => {
    const audience = audiences.find(a => a.id === audienceId)
    if (!audience) return false
    
    // Check if this would violate frequency cap (simplified logic)
    const recentCampaigns = campaigns.filter(c => 
      c.audienceId === audienceId && 
      c.scheduledTime === timeSlot
    )
    
    return recentCampaigns.length < 2 // Max 2 campaigns per time slot
  }

  const getOverlapPercentage = (audience1Id: string, audience2Id: string): number => {
    const audience1 = audiences.find(a => a.id === audience1Id)
    const audience2 = audiences.find(a => a.id === audience2Id)
    
    if (!audience1 || !audience2) return 0
    
    // Simplified overlap calculation
    const smaller = Math.min(audience1.size, audience2.size)
    const overlap = Math.floor(smaller * (Math.random() * 0.4 + 0.1)) // 10-50% overlap
    
    return Math.round((overlap / smaller) * 100)
  }

  const contextValue: DataContextType = {
    contacts,
    audiences,
    campaigns,
    totalContacts,
    dailyRevenue,
    avgERP,
    globalSpamRate,
    createAudience,
    updateAudience,
    scheduleCampaign,
    pauseCampaign,
    validateFrequencyCap,
    getOverlapPercentage,
    loading,
    lastUpdate
  }

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}