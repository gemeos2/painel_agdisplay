import React from 'react'
import { Check } from 'lucide-react'
import { cn } from '../../lib/utils'

const Checkbox = React.forwardRef(({ className, checked, onCheckedChange, ...props }, ref) => (
    <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        ref={ref}
        onClick={() => onCheckedChange?.(!checked)}
        className={cn(
            "peer h-6 w-6 shrink-0 rounded border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground flex items-center justify-center transition-all",
            checked ? "bg-primary text-primary-foreground" : "bg-transparent",
            className
        )}
        {...props}
    >
        {checked && <Check className="h-4 w-4" strokeWidth={3} />}
    </button>
))
Checkbox.displayName = "Checkbox"

export { Checkbox }
