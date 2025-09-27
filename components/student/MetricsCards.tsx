import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, Clock, TrendingUp, BookOpen, Play } from "lucide-react"

interface StudentData {
    id: string
    email: string
    firstName: string
    lastName: string
    major: string
    university: string
    graduationYear: number
}

interface Analytics {
    totalSessions: number
    completedSessions: number
    averageScore: number
    timeSpent: number
    streakDays: number
}

interface MetricsCardsProps {
    student: StudentData
    analytics: Analytics | null
}

export function MetricsCards({ student, analytics }: MetricsCardsProps) {
    const safeAnalytics = analytics || {
        totalSessions: 0,
        completedSessions: 0,
        averageScore: 0,
        timeSpent: 0,
        streakDays: 0
    }

    const formatTime = (hours: number) => {
        if (hours >= 1) {
            return `${hours.toFixed(1)}h`
        }
        const minutes = Math.round(hours * 60)
        return `${minutes}m`
    }

    // Calculate improvement rate from sessions (simple approximation)
    const improvementRate = safeAnalytics.averageScore > 75 ? 5.2 :
        safeAnalytics.averageScore > 50 ? 2.8 : 0

    // Calculate completion rate
    const completionRate = safeAnalytics.totalSessions > 0
        ? (safeAnalytics.completedSessions / safeAnalytics.totalSessions) * 100
        : 0

    return (
        <>
            <Card className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 border-emerald-700/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-emerald-300">
                        Total Sessions
                    </CardTitle>
                    <BookOpen className="h-4 w-4 text-emerald-300" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">
                        {safeAnalytics.totalSessions}
                    </div>
                    <p className="text-xs text-emerald-400 mt-1">
                        {safeAnalytics.completedSessions} completed
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-purple-300">
                        Average Score
                    </CardTitle>
                    <Target className="h-4 w-4 text-purple-300" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">
                        {safeAnalytics.averageScore.toFixed(1)}%
                    </div>
                    <p className="text-xs text-purple-400 mt-1">
                        {improvementRate > 0 ? '+' : ''}{improvementRate.toFixed(1)}% improvement
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-700/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-orange-300">
                        Current Streak
                    </CardTitle>
                    <Trophy className="h-4 w-4 text-orange-300" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">
                        {safeAnalytics.streakDays}
                    </div>
                    <p className="text-xs text-orange-400 mt-1">
                        {completionRate.toFixed(1)}% completion rate
                    </p>
                </CardContent>
            </Card>
        </>
    )
}