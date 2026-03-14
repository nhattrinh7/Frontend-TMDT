'use client'

import { useState } from 'react'
import { CalendarIcon, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Button } from '~/components/ui/button'
import { Calendar } from '~/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { cn } from '~/lib/utils'

interface DateTimePickerProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  disabled?: (date: Date) => boolean
  placeholder?: string
}

export function DateTimePicker({
  value,
  onChange,
  disabled,
  placeholder = 'Chọn ngày và giờ',
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = Array.from({ length: 60 }, (_, i) => i)
  const seconds = Array.from({ length: 60 }, (_, i) => i)

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      onChange(undefined)
      return
    }

    if (value) {
      selectedDate.setHours(value.getHours())
      selectedDate.setMinutes(value.getMinutes())
      selectedDate.setSeconds(value.getSeconds())
    } else {
      selectedDate.setHours(0, 0, 0, 0)
    }

    onChange(selectedDate)
  }

  const handleTimeChange = (
    type: 'hours' | 'minutes' | 'seconds',
    newValue: number,
  ) => {
    const newDate = value ? new Date(value) : new Date()

    if (type === 'hours') newDate.setHours(newValue)
    if (type === 'minutes') newDate.setMinutes(newValue)
    if (type === 'seconds') newDate.setSeconds(newValue)

    onChange(newDate)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className={cn(
            'w-full justify-start text-left font-normal border-[#004643]/20 bg-white text-gray-900',
            !value && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className='mr-2 h-4 w-4' />
          {value
            ? format(value, 'dd/MM/yyyy HH:mm:ss', { locale: vi })
            : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0 bg-white' align='start'>
        <Calendar
          mode='single'
          selected={value}
          onSelect={handleDateSelect}
          disabled={disabled}
          initialFocus
          classNames={{
            months:
              'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
            month: 'space-y-4',
            caption:
              'flex justify-center pt-1 relative items-center text-gray-900',
            caption_label: 'text-sm font-medium text-gray-900',
            nav: 'space-x-1 flex items-center',
            nav_button:
              'h-7 w-7 bg-[#004643] p-0 hover:bg-[#003330] text-white rounded-md',
            nav_button_previous: 'absolute left-1 text-gray-900',
            nav_button_next: 'absolute right-1 text-gray-900',
            table: 'w-full border-collapse space-y-1',
            head_row: 'flex',
            head_cell: 'text-gray-500 rounded-md w-9 font-normal text-[0.8rem]',
            row: 'flex w-full mt-2',
            cell: 'text-center text-sm p-0 relative [&:has([aria-selected])]:bg-[#004643]/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
            day: 'h-9 w-9 p-0 font-normal text-gray-900 aria-selected:opacity-100 hover:bg-[#004643]/10 rounded-md bg-red-200',
            day_selected:
              'bg-[#004643] text-white hover:bg-[#004643] hover:text-white focus:bg-[#004643] focus:text-white',
            day_today: 'bg-gray-100 text-gray-900 font-semibold',
            day_outside: 'text-gray-400 opacity-50',
            day_disabled: 'text-gray-300 opacity-50',
            day_range_middle:
              'aria-selected:bg-[#004643]/10 aria-selected:text-gray-900',
            day_hidden: 'visible',
          }}
        />
        <div className='p-3 border-t border-gray-200 bg-white'>
          <div className='flex items-center gap-2'>
            <Clock className='h-4 w-4 text-gray-500' />
            <span className='text-sm font-medium text-gray-900'>
              Thời gian:
            </span>
          </div>
          <div className='flex gap-2 mt-2'>
            <div className='flex-1'>
              <label className='text-xs text-gray-500 mb-1 block'>Giờ</label>
              <Select
                value={value ? value.getHours().toString() : '0'}
                onValueChange={(val) =>
                  handleTimeChange('hours', parseInt(val))
                }
              >
                <SelectTrigger className='h-9 bg-white text-gray-900'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='bg-white max-h-[200px]'>
                  {hours.map((h) => (
                    <SelectItem
                      key={h}
                      value={h.toString()}
                      className='text-gray-900'
                    >
                      {h.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='flex-1'>
              <label className='text-xs text-gray-500 mb-1 block'>Phút</label>
              <Select
                value={value ? value.getMinutes().toString() : '0'}
                onValueChange={(val) =>
                  handleTimeChange('minutes', parseInt(val))
                }
              >
                <SelectTrigger className='h-9 bg-white text-gray-900'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='bg-white max-h-[200px]'>
                  {minutes.map((m) => (
                    <SelectItem
                      key={m}
                      value={m.toString()}
                      className='text-gray-900'
                    >
                      {m.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='flex-1'>
              <label className='text-xs text-gray-500 mb-1 block'>Giây</label>
              <Select
                value={value ? value.getSeconds().toString() : '0'}
                onValueChange={(val) =>
                  handleTimeChange('seconds', parseInt(val))
                }
              >
                <SelectTrigger className='h-9 bg-white text-gray-900'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='bg-white max-h-[200px]'>
                  {seconds.map((s) => (
                    <SelectItem
                      key={s}
                      value={s.toString()}
                      className='text-gray-900'
                    >
                      {s.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='w-full mt-3'
            onClick={() => setIsOpen(false)}
          >
            Xác nhận
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
