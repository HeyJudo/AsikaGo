import type { LucideIcon } from 'lucide-react'
import { Check } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from 'cn'
import { Label } from '@/components/ui/label'
import { RadioGroupItem } from '@/components/ui/radio-group'

type Props = {
  value: string
  id: string
  icon: LucideIcon
  title: string
  description?: string
  selected: boolean
  index: number
  invalid?: boolean
}

// Selectable card. Must be rendered inside a Radix RadioGroup (the hidden item keeps arrow-key behavior).
export function ChoiceCard({ value, id, icon: Icon, title, description, selected, index, invalid }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
    >
      <Label
        htmlFor={id}
        className={cn(
          'relative flex min-h-14 cursor-pointer items-start gap-3 rounded-2xl border-2 bg-white p-4 text-left transition-colors hover:border-brand/50 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-brand/40',
          selected ? 'border-brand bg-brand/5' : 'border-border',
          invalid && !selected && 'border-destructive',
        )}
      >
        <RadioGroupItem
          value={value}
          id={id}
          aria-labelledby={`${id}-title`}
          aria-describedby={description ? `${id}-desc` : undefined}
          className="absolute inset-0 size-full opacity-0"
        />
        <span
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors',
            selected ? 'bg-brand text-white' : 'bg-cream-deep text-brand',
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1 pr-7">
          <span id={`${id}-title`} className="text-[15px] font-semibold leading-snug text-navy">
            {title}
          </span>
          {description && (
            <span id={`${id}-desc`} className="text-sm font-normal leading-snug text-muted-foreground">
              {description}
            </span>
          )}
        </span>
        <AnimatePresence>
          {selected && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
              className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-brand text-white"
              aria-hidden="true"
            >
              <Check className="size-3.5" strokeWidth={3} />
            </motion.span>
          )}
        </AnimatePresence>
      </Label>
    </motion.div>
  )
}
