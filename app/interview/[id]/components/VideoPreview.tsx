import { useRef, useEffect } from "react"
import { UserCheck } from "lucide-react"

interface VideoPreviewProps {
  mediaStream: MediaStream | null
  isCameraOn: boolean
  candidateName: string
}

export default function VideoPreview({ mediaStream, isCameraOn, candidateName }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  // Attach media stream to video element with useEffect for proper handling
  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream
      console.log("VideoPreview: MediaStream attached", mediaStream.getTracks())
    }
  }, [mediaStream])

  return (
    <div
      className="absolute top-4 right-4 w-64 h-48 rounded-lg overflow-hidden shadow-lg border-2 border-white/20 bg-gray-800 z-20 cursor-move hover:border-white/40 transition-all"
      style={{ userSelect: 'none' }}
      onMouseDown={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const startX = e.clientX - rect.left
        const startY = e.clientY - rect.top

        const handleMouseMove = (moveE: MouseEvent) => {
          const newX = moveE.clientX - startX
          const newY = moveE.clientY - startY
          e.currentTarget.style.left = `${Math.max(0, Math.min(window.innerWidth - 256, newX))}px`
          e.currentTarget.style.top = `${Math.max(0, Math.min(window.innerHeight - 192, newY))}px`
          e.currentTarget.style.right = 'auto'
        }

        const handleMouseUp = () => {
          document.removeEventListener('mousemove', handleMouseMove)
          document.removeEventListener('mouseup', handleMouseUp)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
      }}
    >
      {mediaStream && isCameraOn ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mx-auto">
              <UserCheck className="w-6 h-6 text-gray-300" />
            </div>
            <div className="text-white">
              <p className="text-sm font-medium">{candidateName}</p>
              <p className="text-xs text-gray-300">Camera is {isCameraOn ? "loading..." : "off"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}