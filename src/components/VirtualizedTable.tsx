import { useMemo } from 'react'
import { FixedSizeList as List } from 'react-window'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface VirtualizedTableProps {
  data: any[]
  columns: { key: string; label: string; render?: (value: any, item: any) => React.ReactNode }[]
  height?: number
  itemHeight?: number
}

export function VirtualizedTable({ data, columns, height = 400, itemHeight = 50 }: VirtualizedTableProps) {
  const tableData = useMemo(() => data, [data])

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = tableData[index]
    
    return (
      <div style={style} className="flex items-center border-b border-border">
        {columns.map((column, colIndex) => (
          <div 
            key={column.key} 
            className={`flex-1 px-4 text-sm ${colIndex === 0 ? 'font-medium' : ''}`}
          >
            {column.render ? column.render(item[column.key], item) : item[column.key]}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      {/* Header */}
      <div className="flex items-center bg-muted/50 border-b border-border">
        {columns.map((column) => (
          <div key={column.key} className="flex-1 px-4 py-3 text-sm font-medium">
            {column.label}
          </div>
        ))}
      </div>
      
      {/* Virtualized Body */}
      <List
        height={height}
        itemCount={tableData.length}
        itemSize={itemHeight}
        width="100%"
      >
        {Row}
      </List>
    </div>
  )
}