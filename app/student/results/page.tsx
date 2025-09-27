"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    Clock,
    Target,
    Play,
    Download,
    Eye,
    BarChart3,
    Calendar,
    Award,
    RefreshCw
} from "lucide-react"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Area,
    AreaChart,
    PieChart,
    Pie,
    Cell
} from "recharts"

interface PracticeSession {
    id: string
    sessionId: string
    templateName: string
    status: string
    startedAt: string
    completedAt?: string
    duration: number
    score?: number
    responsesCount: number
    analysis?: {
        localMetrics: {
            avgLatency: string
            avgWords: string
            vocabRichness: string
            clarity: string
        }
        aiMetrics: {
            correctness: number
            relevance: number
            completeness: number
            confidence: number
            professionalism: number
            recommendation: string
        }
    }
    finalScore?: {
        score: number
        breakdown: {
            latency: string
            avgWords: string
            vocabRichness: string
            clarity: string
            correctness: number
            relevance: number
            completeness: number
            confidence: number
            professionalism: number
        }
        interpretation: string
    }
}

interface Analytics {
    totalSessions: number
    completedSessions: number
    averageScore: number
    timeSpent: number
    improvementTrend: number[]
    strongAreas: string[]
    weakAreas: string[]
    lastActivity: string
    streakDays: number
}

export default function StudentResultsPage() {
    const [sessions, setSessions] = useState<PracticeSession[]>([])
    const [analytics, setAnalytics] = useState<Analytics | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState("all")
    const [sortBy, setSortBy] = useState("recent")
    const [viewMode, setViewMode] = useState<"list" | "analytics">("list")
    const router = useRouter()

    useEffect(() => {
        fetchSessions()
    }, [statusFilter, sortBy])

    const fetchSessions = async () => {
        try {
            const params = new URLSearchParams()
            if (statusFilter !== "all") params.append("status", statusFilter)
            params.append("limit", "50")

            const response = await fetch(`/api/practice/sessions?${params}`)
            if (response.ok) {
                const data = await response.json()
                setSessions(data.sessions)
                setAnalytics(data.analytics)
            } else if (response.status === 401) {
                router.push('/student/login')
            }
        } catch (error) {
            console.error('Error fetching sessions:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${minutes}m ${secs}s`
    }

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: "default" | "secondary" | "destructive", color: string }> = {
            completed: { variant: "default", color: "bg-green-500/20 text-green-400 border-green-500/30" },
            "in-progress": { variant: "secondary", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
            abandoned: { variant: "destructive", color: "bg-red-500/20 text-red-400 border-red-500/30" }
        }
        const config = variants[status] || variants.completed
        return (
            <Badge className={config.color}>
                {status.replace('-', ' ')}
            </Badge>
        )
    }

    const getScoreColor = (score: number) => {
        if (score >= 90) return "text-green-400"
        if (score >= 75) return "text-blue-400"
        if (score >= 60) return "text-yellow-400"
        return "text-red-400"
    }

    const getScoreTrend = () => {
        if (!analytics || analytics.improvementTrend.length < 2) return null
        const recent = analytics.improvementTrend.slice(-2)
        const trend = recent[1] - recent[0]
        return trend > 0 ? "up" : trend < 0 ? "down" : "stable"
    }

    const scoreTrend = getScoreTrend()

    // Sample data for charts
    const improvementData = analytics?.improvementTrend.map((score, index) => ({
        session: index + 1,
        score
    })) || []

    const skillsBreakdown = sessions
        .filter(s => s.finalScore)
        .reduce((acc, session) => {
            if (session.finalScore) {
                const breakdown = session.finalScore.breakdown
                acc.push({
                    session: session.templateName.substring(0, 15),
                    communication: breakdown.professionalism,
                    technical: breakdown.correctness,
                    confidence: breakdown.confidence,
                    clarity: parseFloat(breakdown.clarity) || 0
                })
            }
            return acc
        }, [] as any[])

    const completionRate = analytics ?
        Math.round((analytics.completedSessions / analytics.totalSessions) * 100) : 0

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-white">Loading your results...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/student/dashboard')}
                            className="text-slate-400 hover:text-white"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Practice Results</h1>
                            <p className="text-slate-400 mt-2">
                                Track your progress and analyze your performance
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant={viewMode === "list" ? "default" : "outline"}
                                onClick={() => setViewMode("list")}
                                className="border-slate-700"
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                Sessions
                            </Button>
                            <Button
                                variant={viewMode === "analytics" ? "default" : "outline"}
                                onClick={() => setViewMode("analytics")}
                                className="border-slate-700"
                            >
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Analytics
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                {analytics && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <Target className="w-8 h-8 text-emerald-500" />
                                    {scoreTrend && (
                                        <div className={`flex items-center gap-1 ${scoreTrend === 'up' ? 'text-green-400' :
                                                scoreTrend === 'down' ? 'text-red-400' : 'text-slate-400'
                                            }`}>
                                            {scoreTrend === 'up' ? <TrendingUp className="w-4 h-4" /> :
                                                scoreTrend === 'down' ? <TrendingDown className="w-4 h-4" /> : null}
                                        </div>
                                    )}
                                </div>
                                <CardTitle className="text-2xl font-bold text-white">
                                    {analytics.averageScore.toFixed(1)}%
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Average Score
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <Play className="w-8 h-8 text-blue-500" />
                                    <span className="text-xs text-slate-400">{completionRate}% completion</span>
                                </div>
                                <CardTitle className="text-2xl font-bold text-white">
                                    {analytics.completedSessions}
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Sessions Completed
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <Progress value={completionRate} className="h-2" />
                            </CardContent>
                        </Card>

                        <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <Clock className="w-8 h-8 text-purple-500" />
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                </div>
                                <CardTitle className="text-2xl font-bold text-white">
                                    {Math.round(analytics.timeSpent / 3600)}h
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Total Practice Time
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <Award className="w-8 h-8 text-yellow-500" />
                                    <span className="text-xs text-slate-400">day streak</span>
                                </div>
                                <CardTitle className="text-2xl font-bold text-white">
                                    {analytics.streakDays}
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Current Streak
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                )}

                {viewMode === "analytics" ? (
                    /* Analytics View */
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Progress Chart */}
                        <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-white">Score Progress</CardTitle>
                                <CardDescription className="text-slate-400">
                                    Your performance improvement over time
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={improvementData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis dataKey="session" stroke="#9ca3af" />
                                        <YAxis stroke="#9ca3af" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1e293b',
                                                border: '1px solid #475569',
                                                borderRadius: '8px',
                                                color: '#f1f5f9'
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="score"
                                            stroke="#22c55e"
                                            strokeWidth={3}
                                            dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Skills Breakdown */}
                        <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-white">Skills Performance</CardTitle>
                                <CardDescription className="text-slate-400">
                                    Performance across different skill areas
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={skillsBreakdown.slice(-5)}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis dataKey="session" stroke="#9ca3af" fontSize={12} />
                                        <YAxis stroke="#9ca3af" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1e293b',
                                                border: '1px solid #475569',
                                                borderRadius: '8px',
                                                color: '#f1f5f9'
                                            }}
                                        />
                                        <Bar dataKey="communication" fill="#22c55e" />
                                        <Bar dataKey="technical" fill="#3b82f6" />
                                        <Bar dataKey="confidence" fill="#f59e0b" />
                                        <Bar dataKey="clarity" fill="#ef4444" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Strong & Weak Areas */}
                        <Card className="lg:col-span-2 border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-white">Performance Analysis</CardTitle>
                                <CardDescription className="text-slate-400">
                                    Areas where you excel and areas for improvement
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-green-400 font-medium mb-3 flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4" />
                                            Strong Areas
                                        </h4>
                                        <div className="space-y-2">
                                            {analytics?.strongAreas.length ? (
                                                analytics.strongAreas.map((area, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                                                        <span className="text-slate-300">{area}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-slate-500">Complete more sessions to see insights</div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-yellow-400 font-medium mb-3 flex items-center gap-2">
                                            <Target className="w-4 h-4" />
                                            Areas for Improvement
                                        </h4>
                                        <div className="space-y-2">
                                            {analytics?.weakAreas.length ? (
                                                analytics.weakAreas.map((area, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                                                        <span className="text-slate-300">{area}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-slate-500">Complete more sessions to see insights</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    /* Sessions List View */
                    <div className="space-y-6">
                        {/* Filters */}
                        <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
                            <CardContent className="pt-6">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="md:w-48 bg-slate-800/50 border-slate-700/50 text-white">
                                            <SelectValue placeholder="Filter by status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Sessions</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="in-progress">In Progress</SelectItem>
                                            <SelectItem value="abandoned">Abandoned</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="md:w-48 bg-slate-800/50 border-slate-700/50 text-white">
                                            <SelectValue placeholder="Sort by" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="recent">Most Recent</SelectItem>
                                            <SelectItem value="score">Highest Score</SelectItem>
                                            <SelectItem value="duration">Longest Duration</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Button
                                        onClick={fetchSessions}
                                        variant="outline"
                                        className="border-slate-700 text-slate-300 hover:bg-slate-800"
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Refresh
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Sessions List */}
                        <div className="space-y-4">
                            {sessions.length > 0 ? (
                                sessions.map((session) => (
                                    <Card key={session.id} className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl hover:border-emerald-500/50 transition-all duration-300">
                                        <CardContent className="pt-6">
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-lg font-medium text-white">{session.templateName}</h3>
                                                        {getStatusBadge(session.status)}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            {formatDate(session.startedAt)}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            {formatDuration(session.duration)}
                                                        </span>
                                                        <span>
                                                            {session.responsesCount} responses
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    {session.score !== undefined && (
                                                        <div className="text-right">
                                                            <div className={`text-2xl font-bold ${getScoreColor(session.score)}`}>
                                                                {session.score}%
                                                            </div>
                                                            <div className="text-xs text-slate-400">Final Score</div>
                                                        </div>
                                                    )}

                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-slate-700 text-slate-300 hover:bg-slate-800"
                                                            onClick={() => router.push(`/student/results/${session.sessionId}`)}
                                                        >
                                                            <Eye className="w-4 h-4 mr-1" />
                                                            View
                                                        </Button>
                                                        {session.status === "completed" && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="border-slate-700 text-slate-300 hover:bg-slate-800"
                                                            >
                                                                <Download className="w-4 h-4 mr-1" />
                                                                Export
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
                                    <CardContent className="pt-8 pb-8">
                                        <div className="text-center">
                                            <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-white mb-2">No results yet</h3>
                                            <p className="text-slate-400 mb-4">
                                                Complete some practice sessions to see your results here.
                                            </p>
                                            <Button
                                                onClick={() => router.push('/student/practice')}
                                                className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500"
                                            >
                                                <Play className="w-4 h-4 mr-2" />
                                                Start Practicing
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}