import React, { createContext, useContext, useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

// Enhanced Types for Best Time Optimization
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
  // New fields for Best Time
  openTimestamps: number[] // Unix timestamps of email opens
  clickTimestamps: number[] // Unix timestamps of email clicks
  timezoneOffset: number // Minutes from UTC (-720 to +840)
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

interface BestTimeData {
  contactId: string
  hourlyHistogram: number[] // 24 hours (0-23)
  weeklyHistogram: number[] // 168 bins (24*7)
  bestHour: number // 0-23
  confidence: number // 0-1 based on event count
  lastUpdated: Date
}

interface ContentType {
  id: string
  name: string
  category: 'newsletter' | 'alert' | 'promo' | 'analysis' | 'breaking'
  marketHoursOptimal: boolean
  urgencyLevel: 'low' | 'medium' | 'high' | 'urgent'
}

interface DataContextType {
  // Data
  contacts: Contact[]
  audiences: Audience[]
  campaigns: Campaign[]
  bestTimeData: BestTimeData[]
  contentTypes: ContentType[]
  
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
  
  // Best Time functions
  calculateBestTime: (contactId: string) => { hour: number; confidence: number; fallbackUsed: string }
  getOptimalSendTime: (audienceId: string, contentType?: string) => Date
  getBestTimeInsights: (audienceId: string) => { 
    optimalHour: number
    expectedLift: number
    confidence: number
    fallbackReason?: string
  }
  
  // Real-time validation
  validateFrequencyCap: (audienceId: string, timeSlot: string) => boolean
  getOverlapPercentage: (audience1Id: string, audience2Id: string) => number
  
  // Performance
  loading: boolean
  lastUpdate: Date
}

// Generate 3M realistic contacts with Best Time data
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
    
    // Generate realistic email interaction timestamps
    const openTimestamps: number[] = []
    const clickTimestamps: number[] = []
    const eventCount = Math.floor(Math.random() * 20) // 0-19 historical events
    
    for (let e = 0; e < eventCount; e++) {
      const eventDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
      
      // Financial publishers: higher activity 9-17h weekdays
      const isWeekday = eventDate.getDay() >= 1 && eventDate.getDay() <= 5
      const marketHours = isWeekday && Math.random() > 0.3
      
      if (marketHours) {
        eventDate.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60))
      } else {
        eventDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60))
      }
      
      openTimestamps.push(eventDate.getTime())
      
      // 15% chance of click after open
      if (Math.random() < 0.15) {
        const clickDate = new Date(eventDate.getTime() + Math.random() * 3600000) // Within 1 hour
        clickTimestamps.push(clickDate.getTime())
      }
    }

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
      audienceId: undefined,
      openTimestamps,
      clickTimestamps,
      timezoneOffset: Math.floor(Math.random() * 25) * 60 - 720, // -12 to +12 hours
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

const generateBestTimeData = (contacts: Contact[]): BestTimeData[] => {
  return contacts.map(contact => {
    const hourlyHistogram = new Array(24).fill(0)
    const weeklyHistogram = new Array(168).fill(0)
    
    // Populate histograms from contact's interaction history
    contact.openTimestamps.forEach(timestamp => {
      const date = new Date(timestamp)
      const hour = date.getHours()
      const dayOfWeek = date.getDay()
      const weeklyBin = dayOfWeek * 24 + hour
      
      hourlyHistogram[hour]++
      weeklyHistogram[weeklyBin]++
    })
    
    // Find best hour (most opens)
    const bestHour = hourlyHistogram.indexOf(Math.max(...hourlyHistogram))
    const totalEvents = contact.openTimestamps.length
    const confidence = Math.min(totalEvents / 10, 1) // 0-1 based on event count
    
    return {
      contactId: contact.id,
      hourlyHistogram,
      weeklyHistogram,
      bestHour: totalEvents >= 3 ? bestHour : -1, // -1 means insufficient data
      confidence,
      lastUpdated: new Date(),
    }
  })
}

const generateContentTypes = (): ContentType[] => {
  return [
    {
      id: 'newsletter',
      name: 'Daily Newsletter',
      category: 'newsletter',
      marketHoursOptimal: true,
      urgencyLevel: 'low',
    },
    {
      id: 'market-alert',
      name: 'Market Alert',
      category: 'alert',
      marketHoursOptimal: true,
      urgencyLevel: 'high',
    },
    {
      id: 'breaking-news',
      name: 'Breaking News',
      category: 'breaking',
      marketHoursOptimal: false,
      urgencyLevel: 'urgent',
    },
    {
      id: 'weekly-analysis',
      name: 'Weekly Analysis',
      category: 'analysis',
      marketHoursOptimal: true,
      urgencyLevel: 'medium',
    },
    {
      id: 'promo-offer',
      name: 'Promotional Offer',
      category: 'promo',
      marketHoursOptimal: false,
      urgencyLevel: 'medium',
    },
  ]
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [audiences, setAudiences] = useState<Audience[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [bestTimeData, setBestTimeData] = useState<BestTimeData[]>([])
  const [contentTypes] = useState<ContentType[]>(generateContentTypes())
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const { toast } = useToast()

  // Initialize data
  useEffect(() => {
    const initializeData = () => {
      console.log('Generating 500K contacts with Best Time data...')
      const generatedContacts = generateContacts(500000)
      const generatedAudiences = generateAudiences(generatedContacts)
      const generatedBestTimeData = generateBestTimeData(generatedContacts)
      
      setContacts(generatedContacts)
      setAudiences(generatedAudiences)
      setBestTimeData(generatedBestTimeData)
      setLastUpdate(new Date())
      setLoading(false)
      
      console.log(`Generated ${generatedContacts.length} contacts and ${generatedAudiences.length} audiences with Best Time optimization`)
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

  // Best Time Optimization functions
  const calculateBestTime = (contactId: string): { hour: number; confidence: number; fallbackUsed: string } => {
    const contactBestTime = bestTimeData.find(btd => btd.contactId === contactId)
    
    if (!contactBestTime || contactBestTime.bestHour === -1) {
      // Fallback to audience average
      const contact = contacts.find(c => c.id === contactId)
      if (contact) {
        const audienceContacts = contacts.filter(c => c.tags.some(tag => contact.tags.includes(tag)))
        const audienceBestTimes = audienceContacts
          .map(c => bestTimeData.find(btd => btd.contactId === c.id))
          .filter(btd => btd && btd.bestHour !== -1)
        
        if (audienceBestTimes.length > 0) {
          const avgHour = Math.round(
            audienceBestTimes.reduce((sum, btd) => sum + btd!.bestHour, 0) / audienceBestTimes.length
          )
          return { hour: avgHour, confidence: 0.6, fallbackUsed: 'audience' }
        }
      }
      
      // Global fallback for financial content: 10 AM (market hours)
      return { hour: 10, confidence: 0.3, fallbackUsed: 'global' }
    }
    
    return { 
      hour: contactBestTime.bestHour, 
      confidence: contactBestTime.confidence,
      fallbackUsed: 'none'
    }
  }

  const getOptimalSendTime = (audienceId: string, contentType?: string): Date => {
    const audience = audiences.find(a => a.id === audienceId)
    if (!audience) return new Date()
    
    const audienceContacts = audience.contacts
    const bestTimes = audienceContacts.map(contact => calculateBestTime(contact.id))
    
    // Calculate weighted average of best times
    const totalWeight = bestTimes.reduce((sum, bt) => sum + bt.confidence, 0)
    const weightedHour = totalWeight > 0 
      ? Math.round(bestTimes.reduce((sum, bt) => sum + (bt.hour * bt.confidence), 0) / totalWeight)
      : 10 // Default to 10 AM
    
    // Content type adjustments
    const content = contentTypes.find(ct => ct.id === contentType)
    let adjustedHour = weightedHour
    
    if (content?.category === 'breaking' || content?.urgencyLevel === 'urgent') {
      // Breaking news: send immediately, but respect minimum hour
      adjustedHour = Math.max(new Date().getHours(), 8)
    } else if (content?.marketHoursOptimal) {
      // Market hours content: 9-17h weekdays
      adjustedHour = Math.max(9, Math.min(17, weightedHour))
    }
    
    const sendTime = new Date()
    sendTime.setHours(adjustedHour, 0, 0, 0)
    
    // If time has passed today, schedule for tomorrow
    if (sendTime <= new Date()) {
      sendTime.setDate(sendTime.getDate() + 1)
    }
    
    return sendTime
  }

  const getBestTimeInsights = (audienceId: string): { 
    optimalHour: number
    expectedLift: number
    confidence: number
    fallbackReason?: string
  } => {
    const audience = audiences.find(a => a.id === audienceId)
    if (!audience) return { optimalHour: 10, expectedLift: 0, confidence: 0 }
    
    const audienceContacts = audience.contacts
    const bestTimes = audienceContacts.map(contact => calculateBestTime(contact.id))
    
    const validBestTimes = bestTimes.filter(bt => bt.fallbackUsed === 'none')
    const fallbackCount = bestTimes.length - validBestTimes.length
    
    if (validBestTimes.length === 0) {
      return { 
        optimalHour: 10, 
        expectedLift: 0, 
        confidence: 0,
        fallbackReason: 'insufficient-data'
      }
    }
    
    const avgConfidence = validBestTimes.reduce((sum, bt) => sum + bt.confidence, 0) / validBestTimes.length
    const totalWeight = validBestTimes.reduce((sum, bt) => sum + bt.confidence, 0)
    const optimalHour = Math.round(
      validBestTimes.reduce((sum, bt) => sum + (bt.hour * bt.confidence), 0) / totalWeight
    )
    
    // Expected lift based on data quality and financial industry benchmarks
    const expectedLift = Math.min(25, avgConfidence * 30 + (validBestTimes.length / audienceContacts.length) * 20)
    
    return {
      optimalHour,
      expectedLift: Math.round(expectedLift),
      confidence: avgConfidence,
      fallbackReason: fallbackCount > audienceContacts.length * 0.5 ? 'partial-data' : undefined
    }
  }

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
    bestTimeData,
    contentTypes,
    totalContacts,
    dailyRevenue,
    avgERP,
    globalSpamRate,
    createAudience,
    updateAudience,
    scheduleCampaign,
    pauseCampaign,
    calculateBestTime,
    getOptimalSendTime,
    getBestTimeInsights,
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