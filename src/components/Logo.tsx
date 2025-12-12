import Link from 'next/link'
import { BrainCircuit } from 'lucide-react'

interface LogoProps {
  className?: string
  showText?: boolean
}

export const Logo = ({ className = "h-8 w-8", showText = true }: LogoProps) => {
  return (
    <Link href="/" className="flex items-center gap-2">
      <BrainCircuit className={`${className} text-primary`} />
      {showText && (
        <span className="font-bold text-xl tracking-tight">
          Brain<span className="text-primary">AI</span>
        </span>
      )}
    </Link>
  )
}
