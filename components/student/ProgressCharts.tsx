import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Analytics {
    improvementData: Array<{
        session: number
        score: number
        date: string
    }>
}

interface ProgressChartsProps {
    analytics: Analytics | null
}

export function ProgressCharts({ analytics }: ProgressChartsProps) {
    const safeAnalytics = analytics || {
        improvementData: []
    }

    // Default data if no analytics available
    const defaultProgressData = [
        { session: 1, score: 65, date: '2025-01-01' },
        { session: 2, score: 72, date: '2025-01-02' },
        { session: 3, score: 78, date: '2025-01-03' },
        { session: 4, score: 85, date: '2025-01-04' }
    ]

    const progressData = safeAnalytics.improvementData.length > 0 ? safeAnalytics.improvementData : defaultProgressData

    return (
        <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
                <CardTitle className="text-white">Progress Over Time</CardTitle>
                <CardDescription className="text-gray-400">
                    Your improvement trend
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={progressData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                            dataKey="session" 
                            stroke="#9CA3AF"
                            fontSize={12}
                        />
                        <YAxis 
                            stroke="#9CA3AF"
                            fontSize={12}
                        />
                        <Tooltip 
                            contentStyle={{
                                backgroundColor: '#1F2937',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                color: '#F3F4F6'
                            }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="score" 
                            stroke="#10B981" 
                            strokeWidth={2}
                            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}