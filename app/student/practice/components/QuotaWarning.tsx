import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

interface StudentQuota {
    practiceUsed: number
    practiceQuota: number
    remainingSessions: number
}

interface QuotaWarningProps {
    studentQuota: StudentQuota
}

export default function QuotaWarning({ studentQuota }: QuotaWarningProps) {
    if (studentQuota.remainingSessions > 3) return null

    return (
        <Card className="border-amber-500/50 bg-amber-500/10 backdrop-blur-xl">
            <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    <div>
                        <p className="text-amber-400 font-medium">
                            {studentQuota.remainingSessions === 0
                                ? "You've reached your interview limit"
                                : `Only ${studentQuota.remainingSessions} interviews remaining this month`
                            }
                        </p>
                        <p className="text-amber-400/80 text-sm">
                            {studentQuota.remainingSessions === 0
                                ? "Upgrade to continue practicing"
                                : "Consider upgrading to get unlimited interviews"
                            }
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}