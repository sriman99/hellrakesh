import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target } from "lucide-react"

interface StudentData {
    id: string
    email: string
    firstName: string
    lastName: string
    major: string
    university: string
    graduationYear: number
    subscriptionTier?: string
    practiceQuota?: number
    practiceUsed?: number
}

interface Analytics {
    completedSessions: number
}

interface QuotaCardProps {
    student: StudentData
    analytics: Analytics | null
}

export function QuotaCard({ student, analytics }: QuotaCardProps) {
    const practiceQuota = student.practiceQuota || 10
    const practiceUsed = analytics?.completedSessions || 0
    const quotaPercentage = (practiceUsed / practiceQuota) * 100
    const remainingSessions = practiceQuota - practiceUsed

    return (
        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700/50">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <Target className="w-8 h-8 text-blue-300" />
                    <div className="text-right">
                        <Badge variant="secondary" className="bg-blue-900/50 text-blue-300">
                            {student.subscriptionTier || 'Free'}
                        </Badge>
                        <div className="text-xs text-blue-400 mt-1">
                            {remainingSessions} left
                        </div>
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold text-white">
                    {practiceUsed}
                </CardTitle>
                <CardDescription className="text-blue-400">
                    Sessions Completed
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
                <Progress
                    value={quotaPercentage}
                    className="h-2"
                />
                <div className="flex justify-between text-xs text-blue-400 mt-2">
                    <span>{practiceUsed} used</span>
                    <span>{practiceQuota} total</span>
                </div>
            </CardContent>
        </Card>
    )
}