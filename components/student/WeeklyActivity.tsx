import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts'

interface Analytics {
    weeklyData: Array<{
        day: string
        sessions: number
    }>
}

interface WeeklyActivityProps {
    analytics: Analytics | null
}

export function WeeklyActivity({ analytics }: WeeklyActivityProps) {
    const safeAnalytics = analytics || {
        weeklyData: []
    }

    // Default weekly data if no analytics available
    const defaultWeeklyData = [
        { day: 'Mon', sessions: 2 },
        { day: 'Tue', sessions: 1 },
        { day: 'Wed', sessions: 3 },
        { day: 'Thu', sessions: 0 },
        { day: 'Fri', sessions: 2 },
        { day: 'Sat', sessions: 1 },
        { day: 'Sun', sessions: 0 }
    ]

    const weeklyData = safeAnalytics.weeklyData.length > 0 ? safeAnalytics.weeklyData : defaultWeeklyData

    return (
        <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
                <CardTitle className="text-white text-lg">This Week</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={weeklyData}>
                        <XAxis
                            dataKey="day"
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Bar
                            dataKey="sessions"
                            fill="#22c55e"
                            radius={[2, 2, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}