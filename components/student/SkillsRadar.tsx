import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts'
import { Award } from "lucide-react"

interface Analytics {
    skillsData: Array<{
        skill: string
        score: number
        fullMark: number
    }>
}

interface SkillsRadarProps {
    analytics: Analytics | null
}

export function SkillsRadar({ analytics }: SkillsRadarProps) {
    const safeAnalytics = analytics || {
        skillsData: []
    }

    // Default skills data if no analytics available
    const defaultSkillsData = [
        { skill: 'Communication', score: 75, fullMark: 100 },
        { skill: 'Technical', score: 68, fullMark: 100 },
        { skill: 'Problem Solving', score: 82, fullMark: 100 },
        { skill: 'Confidence', score: 70, fullMark: 100 },
        { skill: 'Professionalism', score: 85, fullMark: 100 }
    ]

    const skillsData = safeAnalytics.skillsData.length > 0 ? safeAnalytics.skillsData : defaultSkillsData

    return (
        <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Skills Assessment
                </CardTitle>
                <CardDescription className="text-gray-400">
                    Your performance across different skill areas
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={skillsData}>
                        <PolarGrid stroke="#374151" />
                        <PolarAngleAxis
                            dataKey="skill"
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                        />
                        <PolarRadiusAxis
                            domain={[0, 100]}
                            tick={{ fill: '#9ca3af', fontSize: 10 }}
                            tickCount={5}
                        />
                        <Radar
                            name="Score"
                            dataKey="score"
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            fillOpacity={0.3}
                            strokeWidth={2}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}