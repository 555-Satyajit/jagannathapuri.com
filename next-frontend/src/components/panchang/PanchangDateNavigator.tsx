"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CalendarDays } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export default function PanchangDateNavigator() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dateParam = searchParams.get('date')

  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  useEffect(() => {
    if (dateParam) {
      // Parse YYYY-MM-DD directly without timezones to avoid skipping days
      const [y, m, d] = dateParam.split('-').map(Number)
      if (y && m && d) {
        setCurrentDate(new Date(y, m - 1, d))
      }
    } else {
      setCurrentDate(new Date())
    }
  }, [dateParam])

  const navigateToDate = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    router.push(`/panchang?date=${y}-${m}-${d}`)
  }

  const handlePrev = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 1)
    navigateToDate(newDate)
  }

  const handleNext = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 1)
    navigateToDate(newDate)
  }

  const handleToday = () => {
    navigateToDate(new Date())
  }

  const handleSelectDate = (date: Date | undefined) => {
    if (date) {
      navigateToDate(date)
      setIsPopoverOpen(false)
    }
  }

  const formattedDate = format(currentDate, "d MMMM yyyy")

  return (
    <div className="flex flex-col md:flex-row items-center justify-between bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-zinc-200 gap-4 mb-10">
      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
        <button 
          onClick={handlePrev}
          className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 hover:bg-orange-100 hover:text-orange-700 transition-colors shrink-0"
          aria-label="Previous day"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl md:text-2xl font-serif font-bold text-zinc-900 flex items-center gap-2 tracking-tight">
          <CalendarIcon className="w-5 h-5 text-orange-500 hidden sm:block" />
          <span className="whitespace-nowrap">{formattedDate}</span>
        </h2>
        
        <button 
          onClick={handleNext}
          className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 hover:bg-orange-100 hover:text-orange-700 transition-colors shrink-0"
          aria-label="Next day"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <button 
          onClick={handleToday}
          className="flex-1 md:flex-none px-6 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-700 transition-colors shadow-sm"
        >
          Today
        </button>
        
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-zinc-200 text-zinc-700 rounded-xl text-sm font-bold hover:bg-zinc-50 hover:border-zinc-300 transition-colors">
            <CalendarDays className="w-4 h-4" />
            Select Date
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={currentDate}
              onSelect={handleSelectDate}
            />
          </PopoverContent>
        </Popover>

      </div>
    </div>
  )
}
