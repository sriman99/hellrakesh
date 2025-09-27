import { useEffect, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MouseWarningAlertProps {
    show: boolean
    onHide: () => void
    position?: 'bottom' | 'top' | 'center'
    variant?: 'subtle' | 'prominent' | 'minimal'
}

export default function MouseWarningAlert({
    show,
    onHide,
    position = 'bottom',
    variant = 'subtle'
}: MouseWarningAlertProps) {
    const [visible, setVisible] = useState(false)
    const [animating, setAnimating] = useState(false)

    useEffect(() => {
        if (show) {
            setVisible(true)
            setAnimating(true)
            // Remove animation class after animation completes
            const timer = setTimeout(() => setAnimating(false), 300)
            return () => clearTimeout(timer)
        } else {
            setAnimating(true)
            // Hide after fade out animation
            const timer = setTimeout(() => {
                setVisible(false)
                setAnimating(false)
            }, 300)
            return () => clearTimeout(timer)
        }
    }, [show])

    if (!visible) return null

    const getPositionClasses = () => {
        switch (position) {
            case 'top':
                return 'top-8 left-1/2 transform -translate-x-1/2'
            case 'center':
                return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
            case 'bottom':
            default:
                return 'bottom-24 left-1/2 transform -translate-x-1/2'
        }
    }

    const getVariantClasses = () => {
        switch (variant) {
            case 'prominent':
                return 'bg-amber-100 border-2 border-amber-400 text-amber-900 shadow-xl'
            case 'minimal':
                return 'bg-black/70 text-white border border-white/20'
            case 'subtle':
            default:
                return 'bg-yellow-50 border border-yellow-200 text-yellow-800 shadow-lg backdrop-blur-sm'
        }
    }

    const getAnimationClasses = () => {
        if (!animating) return ''
        return show ? 'animate-slide-up' : 'animate-fade-out'
    }

    return (
        <>
            {/* Custom animations */}
            <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        
        @keyframes fade-out {
          from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
          to {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
        
        .animate-fade-out {
          animation: fade-out 0.3s ease-in forwards;
        }
      `}</style>

            <div
                className={`
          fixed z-50 px-4 py-3 rounded-lg max-w-sm mx-auto
          ${getPositionClasses()}
          ${getVariantClasses()}
          ${getAnimationClasses()}
          transition-all duration-300
        `}
                role="alert"
                aria-live="polite"
            >
                <div className="flex items-center space-x-3">
                    {/* Warning Icon */}
                    <div className="flex-shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                    </div>

                    {/* Message */}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                            Keep cursor in designated area
                        </p>
                        <p className="text-xs opacity-80 mt-0.5">
                            Please focus on the interview controls
                        </p>
                    </div>

                    {/* Close Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onHide}
                        className="flex-shrink-0 w-6 h-6 p-1 hover:bg-black/10 rounded-full"
                        aria-label="Dismiss warning"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Progress bar (shows auto-dismiss countdown) */}
                {variant !== 'minimal' && (
                    <div className="mt-2 w-full bg-current/20 rounded-full h-1 overflow-hidden">
                        <div
                            className="h-full bg-current/60 rounded-full animate-shrink"
                            style={{
                                animation: 'shrink 4s linear forwards'
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Progress bar animation */}
            <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
        </>
    )
}