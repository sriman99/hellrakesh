import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Calendar, Clock } from "lucide-react"

interface Session {
    id: string
    title: string
    type: string
    difficulty: string
    duration: number
    score?: number
    status: string
    startedAt?: Date
    completedAt?: Date
    createdAt: Date
}

interface Analytics {
    recentSessions?: Session[]
}

interface RecentSessionsProps {
    analytics: Analytics | null
}

export function RecentSessions({ analytics }: RecentSessionsProps) {
    const [sessions, setSessions] = useState<Session[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchRecentSessions()
    }, [])

    const fetchRecentSessions = async () => {
        try {
            const response = await fetch('/api/practice/sessions?limit=5')
            if (response.ok) {
                const data = await response.json()
                setSessions(data.sessions || [])
            } else {
                console.error('Failed to fetch sessions:', response.status)
            }
        } catch (error) {
            console.error('Error fetching sessions:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)
        const remainingMinutes = minutes % 60

        if (hours > 0) {
            return `${hours}h ${remainingMinutes}m`
        }
        return `${minutes}m`
    }

    const formatDate = (date?: Date | string) => {
        if (!date) return 'Not completed'
        const dateObj = new Date(date)
        return dateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusColor = (session: Session) => {
        switch (session.status) {
            case 'completed':
                return 'bg-emerald-900/50 text-emerald-300'
            case 'in-progress':
                return 'bg-blue-900/50 text-blue-300'
            case 'not-started':
            default:
                return 'bg-gray-900/50 text-gray-300'
        }
    }

    const getStatusText = (session: Session) => {
        return session.status || 'not-started'
    }

    if (isLoading) {
        return (
            <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                    <CardTitle className="text-white">Recent Practice Sessions</CardTitle>
                    <CardDescription className="text-gray-400">
                        Loading your latest practice activities...
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-400">
                        Loading sessions...
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-white">Recent Practice Sessions</CardTitle>
                    <CardDescription className="text-gray-400">
                        Your latest interview practice activities
                    </CardDescription>
                </div>
                <Button
                    onClick={() => window.location.href = '/student/results'}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                    View All
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {sessions.slice(0, 5).map((session) => (
                    <div
                        key={session.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-emerald-900/30">
                                <Play className="h-4 w-4 text-emerald-400" />
                            </div>
                            <div>
                                <h4 className="font-medium text-white">{session.title}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                    <div className="flex items-center gap-1 text-sm text-gray-400">
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(session.startedAt || session.createdAt)}
                                    </div>
                                    {session.duration > 0 && (
                                        <div className="flex items-center gap-1 text-sm text-gray-400">
                                            <Clock className="h-3 w-3" />
                                            {formatTime(session.duration)}
                                        </div>
                                    )}
                                    <Badge variant="outline" className="text-xs">
                                        {session.difficulty}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge className={getStatusColor(session)}>
                                {getStatusText(session)}
                            </Badge>
                            {session.status === 'completed' && session.score !== undefined && (
                                <div className="text-right">
                                    <div className="text-lg font-semibold text-white">
                                        {session.score}%
                                    </div>
                                    <div className="text-xs text-gray-400">Score</div>
                                </div>
                            )}
                            {session.status !== 'completed' && (
                                <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                    onClick={() => window.location.href = '/student/practice'}
                                >
                                    {session.status === 'in-progress' ? 'Continue' : 'Start'}
                                </Button>
                            )}
                        </div>
                    </div>
                ))}

                {sessions.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                        <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No practice sessions yet</p>
                        <Button
                            className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => window.location.href = '/student/practice'}
                        >
                            Start Your First Practice
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}