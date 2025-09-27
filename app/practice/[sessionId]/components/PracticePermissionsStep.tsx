import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Mic, AlertCircle, CheckCircle, GraduationCap } from "lucide-react"

interface PracticePermissionsStepProps {
    devices: MediaDeviceInfo[]
    onRequestPermissions: (deviceId?: string) => void
}

export default function PracticePermissionsStep({ devices, onRequestPermissions }: PracticePermissionsStepProps) {
    const [selectedCamera, setSelectedCamera] = useState<string>("")
    const [permissionError, setPermissionError] = useState<string | null>(null)

    const handlePermissionRequest = () => {
        setPermissionError(null)
        try {
            onRequestPermissions(selectedCamera || undefined)
        } catch (error) {
            setPermissionError("Failed to access camera and microphone. Please check your permissions.")
        }
    }

    return (
        <div className="text-center space-y-8 animate-fade-in">
            <div className="space-y-4">
                <div className="flex items-center justify-center mb-4">
                    <GraduationCap className="w-12 h-12 text-blue-500 mr-3" />
                    <span className="text-blue-500 text-lg font-semibold">Practice Mode</span>
                </div>
                <h1 className="text-4xl font-bold gradient-text">Camera & Microphone Setup</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    We need access to your camera and microphone for the practice session
                </p>
            </div>

            <Card className="border-border/50 max-w-2xl mx-auto shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-t-lg">
                    <CardTitle className="text-2xl text-foreground flex items-center justify-center">
                        <Camera className="w-8 h-8 mr-3 text-blue-500" />
                        Device Permissions
                    </CardTitle>
                    <CardDescription className="text-base">
                        Please allow access to continue with your practice session
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3 text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                                <Camera className="w-8 h-8 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">Camera Access</h3>
                                <p className="text-sm text-muted-foreground">Required for practice video responses</p>
                            </div>
                        </div>
                        <div className="space-y-3 text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                                <Mic className="w-8 h-8 text-purple-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">Microphone Access</h3>
                                <p className="text-sm text-muted-foreground">Required for practice audio responses</p>
                            </div>
                        </div>
                    </div>

                    {devices.length > 1 && (
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-foreground">
                                Select Camera (Optional):
                            </label>
                            <select
                                value={selectedCamera}
                                onChange={(e) => setSelectedCamera(e.target.value)}
                                className="w-full p-3 border border-border rounded-lg bg-card text-foreground"
                            >
                                <option value="">Default Camera</option>
                                {devices.map((device) => (
                                    <option key={device.deviceId} value={device.deviceId}>
                                        {device.label || `Camera ${device.deviceId.slice(0, 8)}...`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {permissionError && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center">
                            <AlertCircle className="w-5 h-5 text-destructive mr-3" />
                            <p className="text-destructive text-sm">{permissionError}</p>
                        </div>
                    )}

                    <div className="bg-blue-500/5 rounded-lg p-4 space-y-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            This is practice mode - completely safe environment
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            Practice recording only starts when you begin
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            You can turn off camera/microphone at any time
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            No real interviews - just practice and learning
                        </div>
                    </div>

                    <Button
                        size="lg"
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-500/90 hover:to-purple-500/90"
                        onClick={handlePermissionRequest}
                    >
                        <Camera className="w-5 h-5 mr-2" />
                        Allow Camera & Microphone
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}