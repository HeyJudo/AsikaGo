import { Building2, CircleCheck, CircleHelp, User, Users } from 'lucide-react'
import { motion } from 'motion/react'
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'
import { cn } from 'cn'

// RadioGroup value of the "Not sure" card. Never stored in values.businessType.
export const NOT_SURE = 'not-sure'

export type HelperAnswer = 'ask' | 'yes' | 'no'

const ONE_OWNER = ['Sole Proprietorship', 'One Person Corporation']

// The business type after a Yes/No answer. No only clears a type that contradicts it.
export function answerOwner(answer: 'yes' | 'no', businessType: string) {
  if (answer === 'yes') return 'Sole Proprietorship'
  return ONE_OWNER.includes(businessType) ? '' : businessType
}

// The helper after the user picks a real type. The Yes panel says we picked it, so it closes. No stays.
export function helperAfterPick(helper: HelperAnswer | null) {
  return helper === 'yes' ? null : helper
}

// Text from docs/qa/business-type-helper.md (US-012-AI-01). Copy exactly.
const TEXT = {
  yesTitle: 'Sole Proprietorship fits you',
  yesReason:
    'You own the business alone. You register your business name online with DTI (Department of Trade and Industry).',
  opc: "A One Person Corporation (OPC) also has one owner and registers with SEC (Securities and Exchange Commission). It keeps your own money and property safe from the business's debts, as long as you keep the two separate.",
  partnership:
    'Two or more people put in money or property and share the profits. You register it with SEC (Securities and Exchange Commission).',
  corporation:
    'The business counts as its own "person" under the law, and its owners each hold shares (parts of the business). You also register it with SEC.',
}

const OPTIONS = [
  { value: 'yes', label: 'Yes', icon: User },
  { value: 'no', label: 'No', icon: Users },
] as const

const fadeIn = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.2 } }

// No auto-focus on open: Radix selects a card on arrow-key focus, so moving focus here would trap keyboard users.
export function NotSureHelper({ answer, onAnswer }: { answer: HelperAnswer; onAnswer: (answer: 'yes' | 'no') => void }) {
  return (
    <motion.section
      {...fadeIn}
      aria-labelledby="helper-q"
      className="mt-4 rounded-2xl border border-cream-deep bg-cream p-4 sm:px-6 sm:py-5"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gold text-navy">
          <CircleHelp className="size-[22px]" aria-hidden="true" />
        </span>
        <p id="helper-q" className="text-[17px] font-bold leading-snug text-navy">
          Ikaw lang ba ang <span className="whitespace-nowrap">may-ari?</span>
          <span className="block text-sm font-normal text-muted-foreground">Are you the only owner?</span>
        </p>
      </div>

      <RadioGroupPrimitive.Root
        className="mt-3 grid grid-cols-2 gap-3 sm:max-w-[360px]"
        value={answer === 'ask' ? '' : answer}
        aria-labelledby="helper-q"
      >
        {OPTIONS.map(({ value, label, icon: Icon }) => (
          <RadioGroupPrimitive.Item
            key={value}
            value={value}
            // onClick, not onValueChange: re-clicking the shown answer must apply it again
            onClick={() => onAnswer(value)}
            className={cn(
              'inline-flex h-12 items-center justify-center gap-1.5 rounded-xl border-2 text-[15px] font-semibold outline-none transition-colors focus-visible:ring-3 focus-visible:ring-brand/40',
              answer === value ? 'border-brand bg-brand text-white' : 'border-border bg-white text-navy hover:border-brand/50',
            )}
          >
            <Icon className="size-[18px]" aria-hidden="true" />
            {label}
          </RadioGroupPrimitive.Item>
        ))}
      </RadioGroupPrimitive.Root>

      {/* One live region, always mounted, so screen readers announce the answer when it appears */}
      <div role="status">
      {answer === 'yes' && (
        <motion.div
          {...fadeIn}
          key="yes"
          className="mt-4 rounded-xl border-l-4 border-gold bg-white p-4 text-sm leading-relaxed text-navy"
        >
          <h3 className="mb-1 flex items-center gap-2 text-[15px] font-bold">
            <CircleCheck className="size-[18px] text-brand" aria-hidden="true" />
            {TEXT.yesTitle}
          </h3>
          <p>{TEXT.yesReason}</p>
          <p className="mt-2">We picked it for you above. You can still choose another type.</p>
          <p className="mt-3 border-t border-border pt-3 text-muted-foreground">
            <b className="text-navy">Also for one owner:</b> {TEXT.opc}
          </p>
        </motion.div>
      )}

      {answer === 'no' && (
        <motion.div {...fadeIn} key="no">
          <div className="mt-3 grid grid-cols-2 gap-3">
            {[
              { title: 'Partnership', icon: Users, text: TEXT.partnership },
              { title: 'Corporation', icon: Building2, text: TEXT.corporation },
            ].map(({ title, icon: Icon, text }) => (
              <div key={title} className="min-w-0 rounded-xl bg-white p-3 text-sm leading-normal text-navy sm:px-4 sm:py-3.5">
                <h3 className="mb-1 flex flex-col items-start gap-1 text-[15px] font-bold sm:flex-row sm:items-center sm:gap-1.5">
                  <Icon className="size-[18px] text-brand" aria-hidden="true" />
                  {title}
                </h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm leading-normal text-muted-foreground">
            Choose one of them from the list above. You can still pick any type.
          </p>
        </motion.div>
      )}
      </div>
    </motion.section>
  )
}
