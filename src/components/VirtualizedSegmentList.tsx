import React from 'react';
import { FixedSizeList as List } from 'react-window';
import { CampaignSegment } from '@/contexts/PlannerContext';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface VirtualizedSegmentListProps {
  segments: CampaignSegment[];
  height: number;
}

interface SegmentItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    segments: CampaignSegment[];
  };
}

function SegmentItem({ index, style, data }: SegmentItemProps) {
  const segment = data.segments[index];
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: segment.id });

  const itemStyle = {
    ...style,
    transform: CSS.Transform.toString(transform),
    transition,
    padding: '4px',
  };

  return (
    <div style={itemStyle}>
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        role="option"
        tabIndex={0}
        className={cn(
          "p-3 bg-card border rounded-lg cursor-grab active:cursor-grabbing transition-all",
          "hover:shadow-md hover:border-primary/50",
          isDragging && "opacity-50 scale-95"
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{segment.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                {(segment.size / 1000).toFixed(0)}k
              </Badge>
              <span className="text-xs text-muted-foreground">
                CTR: {(segment.ctr * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VirtualizedSegmentList({ segments, height }: VirtualizedSegmentListProps) {
  const itemData = { segments };

  return (
    <List
      height={height}
      width="100%"
      itemCount={segments.length}
      itemSize={80}
      itemData={itemData}
    >
      {SegmentItem}
    </List>
  );
}