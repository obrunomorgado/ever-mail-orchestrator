import React from 'react';
import { TacticalSlotCard } from './TacticalSlotCard';
import { TacticalPlan, TacticalSlot } from '@/types/scheduler';

interface TacticalGridProps {
  plan: TacticalPlan;
  onSlotUpdate: (slot: TacticalSlot, data: any) => void;
  onSlotClick: (slot: TacticalSlot) => void;
  onGenerateVariation: (slot: TacticalSlot) => void;
  onReuseTemplate: (slot: TacticalSlot) => void;
  draggedItem?: any;
}

const timeSlots: TacticalSlot[] = ['06h', '09h', '12h', '15h', '18h', '21h'];

export function TacticalGrid({ 
  plan, 
  onSlotUpdate, 
  onSlotClick, 
  onGenerateVariation, 
  onReuseTemplate,
  draggedItem 
}: TacticalGridProps) {
  return (
    <div className="space-y-4">
      {/* Header da Grade */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        {timeSlots.map((slot) => (
          <div key={slot} className="text-center">
            <h3 className="text-lg font-bold text-foreground">{slot}</h3>
            <p className="text-sm text-muted-foreground">
              {slot === '06h' && 'Madrugada'}
              {slot === '09h' && 'Manhã'}
              {slot === '12h' && 'Almoço'}
              {slot === '15h' && 'Tarde'}
              {slot === '18h' && 'Final da Tarde'}
              {slot === '21h' && 'Noite'}
            </p>
          </div>
        ))}
      </div>

      {/* Grade de Slots */}
      <div className="grid grid-cols-6 gap-4">
        {timeSlots.map((slot) => {
          const slotData = plan.slots[slot];
          return (
            <TacticalSlotCard
              key={slot}
              slotData={slotData}
              onDrop={(slotId, data) => onSlotUpdate(slot, data)}
              onGenerateVariation={onGenerateVariation}
              onReuseTemplate={onReuseTemplate}
              onClick={() => onSlotClick(slot)}
              isDragOver={!!draggedItem}
            />
          );
        })}
      </div>
    </div>
  );
}