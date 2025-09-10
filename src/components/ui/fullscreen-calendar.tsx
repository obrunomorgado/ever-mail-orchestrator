"use client"

import * as React from "react"
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  startOfToday,
  startOfWeek,
  getWeek,
} from "date-fns"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusCircleIcon,
  SearchIcon,
  Calendar as CalendarIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Badge } from "@/components/ui/badge"

interface TacticalEvent {
  id: string
  name: string
  time: string
  datetime: string
  status: 'active' | 'completed' | 'draft'
  campaigns: number
  revenue: number
  contacts: number
  category: string
}

interface CalendarData {
  day: Date
  events: TacticalEvent[]
}

interface FullScreenCalendarProps {
  data: CalendarData[]
  onEventClick?: (event: TacticalEvent) => void
  onDayClick?: (day: Date) => void
  onCreateEvent?: (day: Date) => void
}

const colStartClasses = [
  "",
  "col-start-2",
  "col-start-3",
  "col-start-4",
  "col-start-5",
  "col-start-6",
  "col-start-7",
]

export function FullScreenCalendar({ data, onEventClick, onDayClick, onCreateEvent }: FullScreenCalendarProps) {
  const today = startOfToday()
  const [selectedDay, setSelectedDay] = React.useState(today)
  const [currentMonth, setCurrentMonth] = React.useState(
    format(today, "MMM-yyyy"),
  )
  const firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date())
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const days = eachDayOfInterval({
    start: startOfWeek(firstDayCurrentMonth),
    end: endOfWeek(endOfMonth(firstDayCurrentMonth)),
  })

  const currentWeek = getWeek(selectedDay)

  function previousMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 })
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"))
  }

  function nextMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 })
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"))
  }

  function goToToday() {
    setCurrentMonth(format(today, "MMM-yyyy"))
    setSelectedDay(today)
  }

  function getStatusColor(status: TacticalEvent['status']) {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success border-success/20'
      case 'completed':
        return 'bg-info/10 text-info border-info/20'
      case 'draft':
        return 'bg-muted text-muted-foreground border-border'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  function getStatusLabel(status: TacticalEvent['status']) {
    switch (status) {
      case 'active':
        return 'Ativo'
      case 'completed':
        return 'Concluído'
      case 'draft':
        return 'Rascunho'
      default:
        return status
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Calendar Header */}
      <div className="flex flex-col space-y-4 p-4 md:flex-row md:items-center md:justify-between md:space-y-0 lg:flex-none">
        <div className="flex flex-auto">
          <div className="flex items-center gap-4">
            <div className="hidden w-20 flex-col items-center justify-center rounded-lg border bg-muted p-0.5 md:flex">
              <h1 className="p-1 text-xs uppercase text-muted-foreground">
                {format(today, "MMM")}
              </h1>
              <div className="flex w-full items-center justify-center rounded-lg border bg-background p-0.5 text-lg font-bold">
                <span>{format(today, "d")}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Plano Tático — {format(firstDayCurrentMonth, "MMMM yyyy")}
              </h2>
              <p className="text-sm text-muted-foreground">
                Semana {currentWeek} • {format(firstDayCurrentMonth, "MMM d, yyyy")} -{" "}
                {format(endOfMonth(firstDayCurrentMonth), "MMM d, yyyy")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <Button variant="outline" size="icon" className="hidden lg:flex">
            <SearchIcon size={16} strokeWidth={2} aria-hidden="true" />
          </Button>

          <Separator orientation="vertical" className="hidden h-6 lg:block" />

          <div className="inline-flex w-full -space-x-px rounded-lg shadow-sm shadow-black/5 md:w-auto rtl:space-x-reverse">
            <Button
              onClick={previousMonth}
              className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
              variant="outline"
              size="icon"
              aria-label="Navigate to previous month"
            >
              <ChevronLeftIcon size={16} strokeWidth={2} aria-hidden="true" />
            </Button>
            <Button
              onClick={goToToday}
              className="w-full rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10 md:w-auto"
              variant="outline"
            >
              Hoje
            </Button>
            <Button
              onClick={nextMonth}
              className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
              variant="outline"
              size="icon"
              aria-label="Navigate to next month"
            >
              <ChevronRightIcon size={16} strokeWidth={2} aria-hidden="true" />
            </Button>
          </div>

          <Separator orientation="vertical" className="hidden h-6 md:block" />
          <Separator
            orientation="horizontal"
            className="block w-full md:hidden"
          />

          <Button 
            className="w-full gap-2 md:w-auto"
            onClick={() => onCreateEvent?.(selectedDay)}
          >
            <PlusCircleIcon size={16} strokeWidth={2} aria-hidden="true" />
            <span>Nova Campanha</span>
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="lg:flex lg:flex-auto lg:flex-col">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 border text-center text-xs font-semibold leading-6 lg:flex-none">
          <div className="border-r py-2.5">Dom</div>
          <div className="border-r py-2.5">Seg</div>
          <div className="border-r py-2.5">Ter</div>
          <div className="border-r py-2.5">Qua</div>
          <div className="border-r py-2.5">Qui</div>
          <div className="border-r py-2.5">Sex</div>
          <div className="py-2.5">Sáb</div>
        </div>

        {/* Calendar Days */}
        <div className="flex text-xs leading-6 lg:flex-auto">
          <div className="hidden w-full border-x lg:grid lg:grid-cols-7 lg:grid-rows-5">
            {days.map((day, dayIdx) => {
              const dayEvents = data.filter((date) => isSameDay(date.day, day))
              const isCurrentWeek = getWeek(day) === currentWeek
              
              return (
                <div
                  key={dayIdx}
                  onClick={() => {
                    setSelectedDay(day)
                    onDayClick?.(day)
                  }}
                  className={cn(
                    dayIdx === 0 && colStartClasses[getDay(day)],
                    !isEqual(day, selectedDay) &&
                      !isToday(day) &&
                      !isSameMonth(day, firstDayCurrentMonth) &&
                      "bg-accent/50 text-muted-foreground",
                    "relative flex flex-col border-b border-r hover:bg-muted focus:z-10 cursor-pointer transition-colors",
                    !isEqual(day, selectedDay) && "hover:bg-accent/75",
                    isCurrentWeek && isSameMonth(day, firstDayCurrentMonth) && "bg-primary/5 border-primary/20",
                  )}
                >
                  <header className="flex items-center justify-between p-2.5">
                    <button
                      type="button"
                      className={cn(
                        isEqual(day, selectedDay) && "text-primary-foreground",
                        !isEqual(day, selectedDay) &&
                          !isToday(day) &&
                          isSameMonth(day, firstDayCurrentMonth) &&
                          "text-foreground",
                        !isEqual(day, selectedDay) &&
                          !isToday(day) &&
                          !isSameMonth(day, firstDayCurrentMonth) &&
                          "text-muted-foreground",
                        isEqual(day, selectedDay) &&
                          isToday(day) &&
                          "border-none bg-primary",
                        isEqual(day, selectedDay) &&
                          !isToday(day) &&
                          "bg-foreground",
                        (isEqual(day, selectedDay) || isToday(day)) &&
                          "font-semibold",
                        "flex h-7 w-7 items-center justify-center rounded-full text-xs hover:border",
                      )}
                    >
                      <time dateTime={format(day, "yyyy-MM-dd")}>
                        {format(day, "d")}
                      </time>
                    </button>
                    {isCurrentWeek && isSameMonth(day, firstDayCurrentMonth) && (
                      <div className="text-xs text-primary font-medium">S{currentWeek}</div>
                    )}
                  </header>
                  <div className="flex-1 p-2.5 space-y-1">
                    {dayEvents.length > 0 && (
                      <div className="space-y-1.5">
                        {dayEvents[0].events.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              onEventClick?.(event)
                            }}
                            className={cn(
                              "flex flex-col items-start gap-1 rounded-lg border p-2 text-xs leading-tight cursor-pointer hover:shadow-sm transition-all",
                              getStatusColor(event.status)
                            )}
                          >
                            <div className="flex items-center justify-between w-full">
                              <p className="font-medium leading-none truncate flex-1">
                                {event.name}
                              </p>
                              <Badge variant="outline" className="text-xs ml-1">
                                {getStatusLabel(event.status)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{event.campaigns} campanhas</span>
                              <span>•</span>
                              <span>R$ {event.revenue.toLocaleString()}</span>
                            </div>
                            <p className="leading-none text-muted-foreground">
                              {event.time}
                            </p>
                          </div>
                        ))}
                        {dayEvents[0].events.length > 2 && (
                          <div className="text-xs text-muted-foreground text-center py-1">
                            + {dayEvents[0].events.length - 2} mais
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Mobile View */}
          <div className="isolate grid w-full grid-cols-7 grid-rows-5 border-x lg:hidden">
            {days.map((day, dayIdx) => {
              const dayEvents = data.filter((date) => isSameDay(date.day, day))
              const isCurrentWeek = getWeek(day) === currentWeek
              
              return (
                <button
                  onClick={() => {
                    setSelectedDay(day)
                    onDayClick?.(day)
                  }}
                  key={dayIdx}
                  type="button"
                  className={cn(
                    isEqual(day, selectedDay) && "text-primary-foreground",
                    !isEqual(day, selectedDay) &&
                      !isToday(day) &&
                      isSameMonth(day, firstDayCurrentMonth) &&
                      "text-foreground",
                    !isEqual(day, selectedDay) &&
                      !isToday(day) &&
                      !isSameMonth(day, firstDayCurrentMonth) &&
                      "text-muted-foreground",
                    (isEqual(day, selectedDay) || isToday(day)) &&
                      "font-semibold",
                    "flex h-14 flex-col border-b border-r px-3 py-2 hover:bg-muted focus:z-10",
                    isCurrentWeek && isSameMonth(day, firstDayCurrentMonth) && "bg-primary/5 border-primary/20",
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <time
                      dateTime={format(day, "yyyy-MM-dd")}
                      className={cn(
                        "ml-auto flex size-6 items-center justify-center rounded-full",
                        isEqual(day, selectedDay) &&
                          isToday(day) &&
                          "bg-primary text-primary-foreground",
                        isEqual(day, selectedDay) &&
                          !isToday(day) &&
                          "bg-primary text-primary-foreground",
                      )}
                    >
                      {format(day, "d")}
                    </time>
                    {isCurrentWeek && isSameMonth(day, firstDayCurrentMonth) && (
                      <div className="text-xs text-primary font-medium">S{currentWeek}</div>
                    )}
                  </div>
                  {dayEvents.length > 0 && (
                    <div>
                      {dayEvents.map((date) => (
                        <div
                          key={date.day.toString()}
                          className="-mx-0.5 mt-auto flex flex-wrap-reverse"
                        >
                          {date.events.slice(0, 3).map((event) => (
                            <span
                              key={event.id}
                              className={cn(
                                "mx-0.5 mt-1 h-1.5 w-1.5 rounded-full",
                                event.status === 'active' && "bg-success",
                                event.status === 'completed' && "bg-info", 
                                event.status === 'draft' && "bg-muted-foreground"
                              )}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}