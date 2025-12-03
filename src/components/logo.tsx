import { Cpu } from "lucide-react"

interface LogoProps {
    className?: string
    showText?: boolean
    size?: "sm" | "md" | "lg"
}

export function Logo({ className = "", showText = true, size = "md" }: LogoProps) {
    const sizeClasses = {
        sm: "h-6 w-6",
        md: "h-8 w-8",
        lg: "h-12 w-12"
    }

    const textClasses = {
        sm: "text-lg",
        md: "text-xl",
        lg: "text-3xl"
    }

    return (
        <div className={`flex items-center ${className}`}>
            <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-sm opacity-50 rounded-full"></div>
                <Cpu className={`${sizeClasses[size]} text-blue-500 relative z-10`} />
            </div>
            {showText && (
                <span className={`ml-2 font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 ${textClasses[size]}`}>
                    Brain AiPro
                </span>
            )}
        </div>
    )
}
