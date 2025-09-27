import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface Analytics {
    sessionTypeData: Array<{
        name: string
        value: number
        percentage: number
    }>
}

interface SessionTypeChartProps {
    analytics: Analytics | null
}

const COLORS = [
    '#22c55e', // Green
    '#3b82f6', // Blue  
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Purple
    '#06b6d4'  // Cyan
]

export function SessionTypeChart({ analytics }: SessionTypeChartProps) {
    const safeAnalytics = analytics || {
        sessionTypeData: []
    }

    // Default session type data if no analytics available
    const defaultSessionTypeData = [
        { name: 'Technical', value: 45, percentage: 45 },
        { name: 'Behavioral', value: 30, percentage: 30 },
        { name: 'Case Study', value: 15, percentage: 15 },
        { name: 'General', value: 10, percentage: 10 }
    ]

    const sessionTypeData = safeAnalytics.sessionTypeData.length > 0
        ? safeAnalytics.sessionTypeData
        : defaultSessionTypeData

    return (
        <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
                <CardTitle className="text-white text-lg">Session Types</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie
                            data={sessionTypeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            dataKey="value"
                        >
                            {sessionTypeData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid #475569',
                                borderRadius: '8px',
                                color: '#f1f5f9'
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                    {sessionTypeData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <span className="text-slate-300">{item.name}</span>
                            </div>
                            <span className="text-slate-400">{item.percentage}%</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}