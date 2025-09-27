"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    GraduationCap,
    FileText,
    Brain,
    Users,
    Calendar,
    Activity,
    LogOut,
    Target,
    Zap,
    Sparkles,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle,
    Star,
    BookOpen,
    ExternalLink,
    Play,
    BarChart3,
    Award,
    Mail,
    Building2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface AvailableTemplate {
    _id: string
    title: string
    description: string
    questions: Array<{
        id: string
        type: string
        question: string
        timeLimit?: number
        required: boolean
    }>
    estimatedDuration: number
    isActive: boolean
    createdAt: string
    category: string
    difficulty: "beginner" | "intermediate" | "advanced"
    companyName?: string
}

interface PracticeSession {
    _id: string
    sessionId: string
    templateId: string
    templateName: string
    status: "in-progress" | "completed" | "abandoned"
    score?: number
    startedAt: string
    completedAt?: string
    duration: number
}

interface StudentInterview {
    _id: string
    interviewId: string
    candidateName: string
    candidateEmail: string
    templateId: string
    templateName: string
    companyName: string
    status: "pending" | "in-progress" | "completed" | "expired"
    uniqueLink: string
    scheduledAt?: string
    completedAt?: string
    score?: number
    feedback?: string
    invitedAt: string
}

interface StudentStats {
    totalSessions: number
    practiceQuota: number
    practiceUsed: number
    averageScore: number
    completedSessions: number
    pendingInterviews: number
    completedInterviews: number
    availableTemplates: number
}

export default function StudentDashboardPage() {
    const [activeTab, setActiveTab] = useState("overview")
    const [isLoading, setIsLoading] = useState(false)

    const [availableTemplates, setAvailableTemplates] = useState<AvailableTemplate[]>([])
    const [sessions, setSessions] = useState<PracticeSession[]>([])
    const [interviews, setInterviews] = useState<StudentInterview[]>([])
    const [studentStats, setStudentStats] = useState<StudentStats>({
        totalSessions: 0,
        practiceQuota: 0,
        practiceUsed: 0,
        averageScore: 0,
        completedSessions: 0,
        pendingInterviews: 0,
        completedInterviews: 0,
        availableTemplates: 0,
    })
    const [user, setUser] = useState<any>(null)

    const router = useRouter()

    useEffect(() => {
        fetchStudentProfile()
        fetchAvailableTemplates()
        fetchSessions()
        fetchInterviews()
    }, [])

    const fetchStudentProfile = async () => {
        try {
            const response = await fetch('/api/student/profile')
            if (response.ok) {
                const data = await response.json()
                setUser(data.student)
                setStudentStats(prev => ({
                    ...prev,
                    practiceQuota: data.student.practiceQuota || 0,
                    practiceUsed: data.student.practiceUsed || 0,
                }))
            } else if (response.status === 401) {
                router.push('/student/login')
            }
        } catch (error) {
            console.error('Error fetching student profile:', error)
        }
    }

    const fetchAvailableTemplates = async () => {
        try {
            const response = await fetch('/api/practice/templates')
            if (response.ok) {
                const data = await response.json()
                setAvailableTemplates(data.templates || [])
                setStudentStats(prev => ({
                    ...prev,
                    availableTemplates: data.templates?.length || 0,
                }))
            }
        } catch (error) {
            console.error('Error fetching available templates:', error)
        }
    }

    const fetchSessions = async () => {
        try {
            const response = await fetch('/api/student/sessions')
            if (response.ok) {
                const data = await response.json()
                setSessions(data.sessions || [])
                const completed = data.sessions?.filter((s: PracticeSession) => s.status === 'completed') || []
                const avgScore = completed.length > 0
                    ? completed.reduce((sum: number, s: PracticeSession) => sum + (s.score || 0), 0) / completed.length
                    : 0

                setStudentStats(prev => ({
                    ...prev,
                    totalSessions: data.sessions?.length || 0,
                    completedSessions: completed.length,
                    averageScore: Math.round(avgScore),
                }))
            }
        } catch (error) {
            console.error('Error fetching sessions:', error)
        }
    }

    const fetchInterviews = async () => {
        try {
            const response = await fetch('/api/student/interviews')
            if (response.ok) {
                const data = await response.json()
                setInterviews(data.interviews || [])
                const pending = data.interviews?.filter((i: StudentInterview) => i.status === 'pending') || []
                const completed = data.interviews?.filter((i: StudentInterview) => i.status === 'completed') || []

                setStudentStats(prev => ({
                    ...prev,
                    pendingInterviews: pending.length,
                    completedInterviews: completed.length,
                }))
            }
        } catch (error) {
            console.error('Error fetching interviews:', error)
        }
    }

    const startPracticeSession = async (templateId: string) => {
        try {
            const response = await fetch('/api/practice/sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ templateId }),
            })

            if (response.ok) {
                const data = await response.json()
                router.push(`/practice/${data.session.sessionId}`)
            } else {
                const error = await response.json()
                alert(error.error || 'Failed to start practice session')
            }
        } catch (error) {
            console.error('Error starting practice session:', error)
            alert('Failed to start practice session')
        }
    }

    const startInterview = async (interviewId: string) => {
        try {
            const interview = interviews.find(i => i.interviewId === interviewId)
            if (interview) {
                // Use the student interview endpoint
                router.push(`/student/interview/${interview.uniqueLink}`)
            }
        } catch (error) {
            console.error('Error starting interview:', error)
            alert('Failed to start interview')
        }
    }

    const handleLogout = async () => {
        try {
            await fetch('/api/student/auth/logout', { method: 'POST' })
            router.push('/student/login')
        } catch (error) {
            console.error('Logout error:', error)
            router.push('/student/login')
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-900 to-purple-950 cursor-reactive-bg relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10" />
            <div className="absolute top-20 left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl hero-float" />
            <div
                className="absolute bottom-20 right-10 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl hero-float"
                style={{ animationDelay: "2s" }}
            />
            <div
                className="absolute top-1/2 left-1/4 w-32 h-32 bg-indigo-500/15 rounded-full blur-2xl hero-float"
                style={{ animationDelay: "4s" }}
            />

            <div className="relative">
                {/* Header */}
                <header className="glass-student border-b border-blue-500/20 backdrop-blur-xl shadow-2xl animate-fade-in">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-student-gradient rounded-2xl flex items-center justify-center shadow-lg">
                                    <GraduationCap className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold gradient-text-student">Student Dashboard</h1>
                                    <p className="text-blue-200 text-sm">
                                        Welcome back, {user?.firstName || 'Student'}!
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="hidden md:flex items-center space-x-2 glass-student px-4 py-2 rounded-xl border border-blue-500/30">
                                    <Activity className="w-4 h-4 text-blue-400" />
                                    <span className="text-blue-200 text-sm">
                                        {studentStats.practiceUsed}/{studentStats.practiceQuota} Sessions Used
                                    </span>
                                </div>

                                <Button
                                    onClick={handleLogout}
                                    variant="outline"
                                    size="sm"
                                    className="border-blue-500/30 text-blue-200 hover:bg-blue-500/20 hover:border-blue-400/50 transition-all duration-300"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Logout
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Navigation Tabs */}
                    <div className="flex space-x-1 glass-student p-1 rounded-xl mb-8 border border-blue-500/20 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                        {[
                            { id: "overview", label: "Overview", icon: BarChart3 },
                            { id: "interviews", label: "My Interviews", icon: Building2 },
                            { id: "practice", label: "Practice Sessions", icon: BookOpen },
                            { id: "analytics", label: "Analytics", icon: TrendingUp },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center px-6 py-3 rounded-lg transition-all duration-300 flex-1 justify-center ${activeTab === tab.id
                                        ? "bg-student-gradient text-white shadow-lg transform scale-105"
                                        : "text-blue-200 hover:text-white hover:bg-blue-500/20"
                                    }`}
                            >
                                <tab.icon className="w-4 h-4 mr-2" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                        <div className="space-y-8 animate-fade-in">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <Card className="glass-student border-blue-500/20 shadow-xl animate-scale-in">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-blue-200">Pending Interviews</CardTitle>
                                        <Mail className="h-4 w-4 text-orange-400" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-white">{studentStats.pendingInterviews}</div>
                                        <p className="text-xs text-blue-300 mt-1">Awaiting your response</p>
                                    </CardContent>
                                </Card>

                                <Card className="glass-student border-blue-500/20 shadow-xl animate-scale-in" style={{ animationDelay: "0.1s" }}>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-blue-200">Practice Sessions</CardTitle>
                                        <Activity className="h-4 w-4 text-purple-400" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-white">{studentStats.totalSessions}</div>
                                        <p className="text-xs text-blue-300 mt-1">Total practice runs</p>
                                    </CardContent>
                                </Card>

                                <Card className="glass-student border-blue-500/20 shadow-xl animate-scale-in" style={{ animationDelay: "0.2s" }}>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-blue-200">Average Score</CardTitle>
                                        <Star className="h-4 w-4 text-yellow-400" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-white">{studentStats.averageScore}%</div>
                                        <p className="text-xs text-blue-300 mt-1">Performance average</p>
                                    </CardContent>
                                </Card>

                                <Card className="glass-student border-blue-500/20 shadow-xl animate-scale-in" style={{ animationDelay: "0.3s" }}>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-blue-200">Available Templates</CardTitle>
                                        <FileText className="h-4 w-4 text-green-400" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-white">{studentStats.availableTemplates}</div>
                                        <p className="text-xs text-blue-300 mt-1">Ready for practice</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Quick Actions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="glass-student border-blue-500/20 shadow-xl animate-fade-in" style={{ animationDelay: "0.4s" }}>
                                    <CardHeader>
                                        <CardTitle className="text-white flex items-center">
                                            <Mail className="w-5 h-5 mr-2 text-orange-400" />
                                            Pending Interviews
                                        </CardTitle>
                                        <CardDescription className="text-blue-200">
                                            Companies have invited you to interviews - respond now!
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {studentStats.pendingInterviews > 0 ? (
                                            <Button
                                                onClick={() => setActiveTab("interviews")}
                                                className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-xl"
                                            >
                                                <Mail className="w-4 h-4 mr-2" />
                                                View {studentStats.pendingInterviews} Pending Interview{studentStats.pendingInterviews > 1 ? 's' : ''}
                                            </Button>
                                        ) : (
                                            <div className="text-center py-4">
                                                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                                                <p className="text-blue-200 text-sm">No pending interviews</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="glass-student border-blue-500/20 shadow-xl animate-fade-in" style={{ animationDelay: "0.5s" }}>
                                    <CardHeader>
                                        <CardTitle className="text-white flex items-center">
                                            <Play className="w-5 h-5 mr-2 text-green-400" />
                                            Practice Mode
                                        </CardTitle>
                                        <CardDescription className="text-blue-200">
                                            Improve your skills with practice sessions on available templates
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button
                                            onClick={() => setActiveTab("practice")}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white shadow-xl"
                                        >
                                            <Play className="w-4 h-4 mr-2" />
                                            Start Practice Session
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* Interviews Tab */}
                    {activeTab === "interviews" && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-white">My Interviews</h2>
                                <Badge className="bg-orange-500/20 text-orange-300">
                                    {studentStats.pendingInterviews} Pending
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {interviews.map((interview, index) => (
                                    <Card key={interview._id} className="glass-student border-blue-500/20 shadow-xl animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                                        <CardContent className="pt-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h3 className="text-white font-semibold">{interview.templateName}</h3>
                                                        <Badge className={`${interview.status === 'pending' ? 'bg-orange-500/20 text-orange-300' :
                                                                interview.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                                                                    interview.status === 'in-progress' ? 'bg-blue-500/20 text-blue-300' :
                                                                        'bg-red-500/20 text-red-300'
                                                            }`}>
                                                            {interview.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center space-x-4 text-sm text-blue-200">
                                                        <span className="flex items-center">
                                                            <Building2 className="w-4 h-4 mr-1" />
                                                            {interview.companyName}
                                                        </span>
                                                        <span className="flex items-center">
                                                            <Calendar className="w-4 h-4 mr-1" />
                                                            Invited: {new Date(interview.invitedAt).toLocaleDateString()}
                                                        </span>
                                                        {interview.score && (
                                                            <span className="flex items-center">
                                                                <Star className="w-4 h-4 mr-1" />
                                                                Score: {interview.score}%
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    {interview.status === 'pending' && (
                                                        <Button
                                                            onClick={() => startInterview(interview.interviewId)}
                                                            className="bg-orange-600 hover:bg-orange-700 text-white"
                                                        >
                                                            <Play className="w-4 h-4 mr-2" />
                                                            Start Interview
                                                        </Button>
                                                    )}
                                                    {interview.status === 'in-progress' && (
                                                        <Button
                                                            onClick={() => router.push(`/student/interview/${interview.uniqueLink}`)}
                                                            className="btn-student"
                                                        >
                                                            <Play className="w-4 h-4 mr-2" />
                                                            Continue
                                                        </Button>
                                                    )}
                                                    {interview.status === 'completed' && (
                                                        <Button
                                                            onClick={() => router.push(`/student/interview/${interview.uniqueLink}/results`)}
                                                            variant="outline"
                                                            className="border-blue-500/30 text-blue-200 hover:bg-blue-500/20"
                                                        >
                                                            <BarChart3 className="w-4 h-4 mr-2" />
                                                            View Results
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}

                                {interviews.length === 0 && (
                                    <div className="text-center py-12">
                                        <Mail className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-white mb-2">No Interviews Yet</h3>
                                        <p className="text-blue-200 mb-6">Companies will send you interview invitations when they're interested in your profile</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Practice Tab */}
                    {activeTab === "practice" && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-white">Practice Sessions</h2>
                                <div className="text-blue-200 text-sm">
                                    {studentStats.practiceUsed}/{studentStats.practiceQuota} sessions used
                                </div>
                            </div>

                            {/* Available Templates */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Available Templates</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {availableTemplates.map((template, index) => (
                                        <Card key={template._id} className="glass-student border-blue-500/20 shadow-xl animate-scale-in hover:scale-105 transition-all duration-300" style={{ animationDelay: `${index * 0.1}s` }}>
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <CardTitle className="text-white text-lg">{template.title}</CardTitle>
                                                        <CardDescription className="text-blue-200 mt-1">
                                                            {template.description}
                                                        </CardDescription>
                                                    </div>
                                                    <Badge className={`ml-2 ${template.difficulty === 'beginner' ? 'bg-green-500/20 text-green-300' :
                                                            template.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                                                                'bg-red-500/20 text-red-300'
                                                        }`}>
                                                        {template.difficulty}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between text-sm text-blue-200">
                                                        <span>{template.questions.length} questions</span>
                                                        <span>{template.estimatedDuration} min</span>
                                                    </div>

                                                    {template.companyName && (
                                                        <div className="flex items-center text-sm text-blue-200">
                                                            <Building2 className="w-4 h-4 mr-2 text-blue-400" />
                                                            {template.companyName}
                                                        </div>
                                                    )}

                                                    <Separator className="bg-blue-500/20" />

                                                    <Button
                                                        onClick={() => startPracticeSession(template._id)}
                                                        disabled={studentStats.practiceUsed >= studentStats.practiceQuota}
                                                        className="w-full btn-student shadow-lg"
                                                    >
                                                        <Play className="w-4 h-4 mr-2" />
                                                        Start Practice
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Sessions */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Recent Practice Sessions</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {sessions.slice(0, 5).map((session, index) => (
                                        <Card key={session._id} className="glass-student border-blue-500/20 shadow-xl animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                                            <CardContent className="pt-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="text-white font-semibold">{session.templateName}</h3>
                                                        <div className="flex items-center space-x-4 mt-2 text-sm text-blue-200">
                                                            <span>Started: {new Date(session.startedAt).toLocaleDateString()}</span>
                                                            <span>Duration: {Math.floor(session.duration / 60)}m {session.duration % 60}s</span>
                                                            {session.score && <span>Score: {session.score}%</span>}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <Badge className={`${session.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                                                                session.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-300' :
                                                                    'bg-red-500/20 text-red-300'
                                                            }`}>
                                                            {session.status}
                                                        </Badge>
                                                        {session.status === 'in-progress' && (
                                                            <Button
                                                                onClick={() => router.push(`/practice/${session.sessionId}`)}
                                                                size="sm"
                                                                className="btn-student"
                                                            >
                                                                Continue
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}

                                    {sessions.length === 0 && (
                                        <div className="text-center py-12">
                                            <Activity className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-white mb-2">No Practice Sessions</h3>
                                            <p className="text-blue-200 mb-6">Start your first practice session to begin improving your skills</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Analytics Tab */}
                    {activeTab === "analytics" && (
                        <div className="space-y-6 animate-fade-in">
                            <h2 className="text-2xl font-bold text-white">Analytics & Progress</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="glass-student border-blue-500/20 shadow-xl">
                                    <CardHeader>
                                        <CardTitle className="text-white flex items-center">
                                            <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                                            Performance Overview
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-blue-200">Average Score</span>
                                                <span className="text-white font-semibold">{studentStats.averageScore}%</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-blue-200">Completed Sessions</span>
                                                <span className="text-white font-semibold">{studentStats.completedSessions}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-blue-200">Completed Interviews</span>
                                                <span className="text-white font-semibold">{studentStats.completedInterviews}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-blue-200">Total Practice Time</span>
                                                <span className="text-white font-semibold">
                                                    {Math.floor(sessions.reduce((sum, s) => sum + s.duration, 0) / 60)} minutes
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="glass-student border-blue-500/20 shadow-xl">
                                    <CardHeader>
                                        <CardTitle className="text-white flex items-center">
                                            <Award className="w-5 h-5 mr-2 text-yellow-400" />
                                            Achievements
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {studentStats.totalSessions >= 1 && (
                                                <div className="flex items-center space-x-3">
                                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                                    <span className="text-blue-200">First Practice Session</span>
                                                </div>
                                            )}
                                            {studentStats.completedInterviews >= 1 && (
                                                <div className="flex items-center space-x-3">
                                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                                    <span className="text-blue-200">Interview Completed</span>
                                                </div>
                                            )}
                                            {studentStats.averageScore >= 80 && (
                                                <div className="flex items-center space-x-3">
                                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                                    <span className="text-blue-200">High Performer</span>
                                                </div>
                                            )}
                                            {studentStats.completedSessions >= 5 && (
                                                <div className="flex items-center space-x-3">
                                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                                    <span className="text-blue-200">Practice Veteran</span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}