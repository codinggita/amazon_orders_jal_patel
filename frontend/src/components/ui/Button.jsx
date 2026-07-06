import * as React from "react"
import { cn } from "../../lib/utils"
import { motion } from "framer-motion"

const Button = React.forwardRef(({ className, variant = "default", size = "default", children, isLoading, ...props }, ref) => {
  const variants = {
    default: "bg-amazon-orange text-slate-950 hover:bg-amazon-yellow shadow-sm",
    destructive: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20",
    outline: "border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-200",
    secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700",
    ghost: "hover:bg-slate-800/50 hover:text-slate-100 text-slate-400",
    link: "text-amazon-orange underline-offset-4 hover:underline",
  }

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-12 rounded-md px-8 text-base",
    icon: "h-10 w-10",
  }

  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amazon-orange disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </motion.button>
  )
})
Button.displayName = "Button"

export { Button }
