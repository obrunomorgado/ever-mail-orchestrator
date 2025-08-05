import React, { useEffect, useState } from 'react';
import { Calendar, Mic, MicOff, Brain, Gauge, Target, ShieldAlert, Zap, Clock, Users, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlannerProvider } from '@/contexts/PlannerContext';
import { PlanoTaticoBoard } from '@/components/PlanoTaticoBoard';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';
import { usePlannerDefaults } from '@/hooks/usePlannerDefaults';
import { segments } from '@/mocks/demoData';
import { useIsMobile } from '@/hooks/use-mobile';

const timeSlots = ['07:00', '09:00', '12:00', '15:00', '18:00'];

function SmartPlannerContent() {
  return <PlanoTaticoBoard />;
}

export function SmartPlannerPage() {
  return (
    <PlannerProvider>
      <SmartPlannerContent />
    </PlannerProvider>
  );
}