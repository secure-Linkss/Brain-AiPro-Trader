export function LoadingAnimation() {
    return (
        <div className="flex items-center justify-center space-x-2 animate-pulse">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce"></div>
        </div>
    )
}

export function PageLoading() {
    return (
        <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50">
            <div className="relative mb-4">
                <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                <div className="h-16 w-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-400 text-sm font-medium animate-pulse">Initializing Brain AiPro...</p>
        </div>
    )
}
