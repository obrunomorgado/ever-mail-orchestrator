import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Pool, PoolType } from '@/types/scheduler';
import { cn } from '@/lib/utils';

interface PoolSelectorProps {
  pools: Pool[];
  selectedPool: PoolType;
  onPoolChange: (pool: PoolType) => void;
  className?: string;
}

const getPoolColor = (pool: PoolType) => {
  switch (pool) {
    case 'Pool A':
      return 'bg-success/10 text-success border-success/20';
    case 'Pool B':
      return 'bg-info/10 text-info border-info/20';
    case 'Pool C':
      return 'bg-warning/10 text-warning border-warning/20';
    default:
      return 'bg-muted/10 text-muted-foreground border-muted/20';
  }
};

const getUsagePercentage = (pool: Pool) => {
  return Math.round((pool.currentUsage / pool.capacity) * 100);
};

const getUsageStatus = (percentage: number) => {
  if (percentage >= 90) return 'critical';
  if (percentage >= 75) return 'warning';
  return 'normal';
};

export function PoolSelector({ 
  pools, 
  selectedPool, 
  onPoolChange, 
  className 
}: PoolSelectorProps) {
  const selectedPoolData = pools.find(p => p.name === selectedPool);

  return (
    <Select value={selectedPool} onValueChange={onPoolChange}>
      <SelectTrigger className={cn("w-[200px]", className)}>
        <SelectValue>
          <div className="flex items-center gap-2">
            <span className="text-sm">Pool Padrão do Dia</span>
            <Badge className={cn("text-xs", getPoolColor(selectedPool))}>
              {selectedPool}
            </Badge>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {pools.map((pool) => {
          const usagePercentage = getUsagePercentage(pool);
          const status = getUsageStatus(usagePercentage);
          
          return (
            <SelectItem key={pool.id} value={pool.name}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Badge className={cn("text-xs", getPoolColor(pool.name))}>
                    {pool.name}
                  </Badge>
                  <span className="text-sm">{pool.name}</span>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <div className="text-xs text-muted-foreground">
                    {pool.currentUsage.toLocaleString()} / {pool.capacity.toLocaleString()}
                  </div>
                  
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    status === 'critical' ? 'bg-destructive' :
                    status === 'warning' ? 'bg-warning' : 'bg-success'
                  )} />
                  
                  <span className={cn(
                    "text-xs font-medium",
                    status === 'critical' ? 'text-destructive' :
                    status === 'warning' ? 'text-warning' : 'text-success'
                  )}>
                    {usagePercentage}%
                  </span>
                </div>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}