"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Building2,
  FileText,
  Link2,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Users,
  Calendar,
  Activity,
  LogOut,
  Brain,
  Target,
  Zap,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Shield,
  Copy,
  ExternalLink,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface Template {
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
  updatedAt: string
}

interface Interview {
  _id: string
  candidateName: string
  candidateEmail: string
  templateId: string
  uniqueLink: string
  status: "pending" | "in-progress" | "completed" | "expired"
  responses: Array<any>
  score?: number
  createdAt: string
  completedAt?: string
}

interface CompanyStats {
  totalTemplates: number
  totalInterviews: number
  interviewQuota: number
  completedInterviews: number
  interviewsUsed: number
}

export default function CompanyDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [newTemplate, setNewTemplate] = useState({ title: "", description: "", questions: [""] })
  const [newInterview, setNewInterview] = useState({
    candidateName: "",
    candidateEmail: "",
    templateId: "",
  })

  const [templates, setTemplates] = useState<Template[]>([])
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [companyStats, setCompanyStats] = useState<CompanyStats>({
    totalTemplates: 0,
    totalInterviews: 0,
    interviewQuota: 0,
    completedInterviews: 0,
    interviewsUsed: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [isInterviewDialogOpen, setIsInterviewDialogOpen] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null)
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null)
  const [selectedFinalScore, setSelectedFinalScore] = useState<any>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchTemplates()
    fetchInterviews()
    fetchCompanyStats() // Fetch the correct company stats
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/templates")
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates)
        setCompanyStats((prev) => ({ ...prev, totalTemplates: data.templates.length }))
      }
    } catch (error) {
      console.error("Error fetching templates:", error)
    }
  }

  const fetchInterviews = async () => {
    try {
      const response = await fetch("/api/interviews")
      if (response.ok) {
        const data = await response.json()
        setInterviews(data.interviews)
        const completed = data.interviews.filter((i: Interview) => i.status === "completed").length
        setCompanyStats((prev) => ({
          ...prev,
          totalInterviews: data.interviews.length,
          completedInterviews: completed,
          interviewsUsed: data.interviews.length,
        }))
      }
    } catch (error) {
      console.error("Error fetching interviews:", error)
    }
  }

  const fetchCompanyStats = async () => {
    try {
      const response = await fetch("/api/auth/me") // Assuming this endpoint returns the logged-in user's data
      if (response.ok) {
        const data = await response.json()
        setCompanyStats((prev) => ({
          ...prev,
          interviewQuota: data.interviewQuota,
          interviewsUsed: data.interviewsUsed,
        }))
      } else {
        console.error("Failed to fetch company stats")
      }
    } catch (error) {
      console.error("Error fetching company stats:", error)
    }
  }

  const createTemplate = async () => {
    if (!newTemplate.title || newTemplate.questions.some((q) => !q.trim())) {
      setError("Please fill in all fields")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const questions = newTemplate.questions.map((q, index) => ({
        id: `q${index + 1}`,
        type: "text",
        question: q,
        timeLimit: 300,
        required: true,
      }))

      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTemplate.title,
          description: newTemplate.description,
          questions,
          estimatedDuration: questions.length * 5,
        }),
      })

      if (response.ok) {
        setNewTemplate({ title: "", description: "", questions: [""] })
        setIsTemplateDialogOpen(false)
        fetchTemplates()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create template")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const createInterview = async () => {
    if (!newInterview.candidateName || !newInterview.candidateEmail || !newInterview.templateId) {
      setError("Please fill in all fields")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: newInterview.templateId,
          candidateName: newInterview.candidateName,
          candidateEmail: newInterview.candidateEmail,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setNewInterview({ candidateName: "", candidateEmail: "", templateId: "" })
        setIsInterviewDialogOpen(false)
        fetchInterviews()

        // Show the generated link
        setGeneratedLink(data.interviewUrl)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create interview")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
      router.push("/")
    }
  }

  const addQuestion = () => {
    setNewTemplate({
      ...newTemplate,
      questions: [...newTemplate.questions, ""],
    })
  }

  const updateQuestion = (index: number, value: string) => {
    const updatedQuestions = [...newTemplate.questions]
    updatedQuestions[index] = value
    setNewTemplate({ ...newTemplate, questions: updatedQuestions })
  }

  const removeQuestion = (index: number) => {
    const updatedQuestions = newTemplate.questions.filter((_, i) => i !== index)
    setNewTemplate({ ...newTemplate, questions: updatedQuestions })
  }

  const copyToClipboard = (uniqueLink: string) => {
    const url = `${window.location.origin}/interview/${uniqueLink}`
    navigator.clipboard.writeText(url)
    alert("Interview link copied to clipboard!")
  }

  const getTemplateById = (templateId: string) => {
    return templates.find((t) => t._id === templateId)
  }

  const fetchInterviewDetails = async (uniqueLink: string) => {
    try {
      const response = await fetch(`/api/interviews/${uniqueLink}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedInterview(data.interview)
        setSelectedAnalysis(data.analysis)
        setSelectedFinalScore(data.finalScore)
        setIsDetailsDialogOpen(true)
      } else {
        console.error("Failed to fetch interview details")
      }
    } catch (error) {
      console.error("Error fetching interview details:", error)
    }
  }

  const generateQuestions = async (prompt: string) => {
    if (!prompt.trim()) {
      setError("Please provide a prompt to generate questions.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/templates/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      if (response.ok) {
        const data = await response.json()
        setNewTemplate((prev) => ({
          ...prev,
          questions: [...prev.questions, ...data.questions],
        }))
      } else {
        const data = await response.json()
        setError(data.error || "Failed to generate questions.")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTemplate = async () => {
    if (!newTemplate.title || newTemplate.questions.some((q) => !q.trim())) {
      setError("Please fill in all fields")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const questions = newTemplate.questions.map((q, index) => ({
        id: `q${index + 1}`,
        type: "text",
        question: q,
        timeLimit: 300,
        required: true,
      }))

      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTemplate.title,
          description: newTemplate.description,
          questions,
          estimatedDuration: questions.length * 5,
        }),
      })

      if (response.ok) {
        setNewTemplate({ title: "", description: "", questions: [""] })
        setIsTemplateDialogOpen(false)
        fetchTemplates()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create template")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const editTemplate = (template: Template) => {
    // Implement edit template logic here
    console.log("Edit template:", template)
  }

  const deleteTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchTemplates()
      } else {
        console.error("Failed to delete template")
      }
    } catch (error) {
      console.error("Error deleting template:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background cursor-reactive-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl hero-float" />
      <div
        className="absolute bottom-20 right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl hero-float"
        style={{ animationDelay: "2s" }}
      />

      <header className="glass-enterprise sticky top-0 z-50 border-b border-enterprise shadow-lg">
        <div className="flex items-center justify-between px-8 py-5">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-enterprise-gradient rounded-2xl flex items-center justify-center shadow-lg">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold gradient-text-enterprise">HumaneQ HR</span>
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    <Shield className="w-3 h-3 mr-1" />
                    Enterprise
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Company Dashboard</p>
              </div>
            </div>
            <Separator orientation="vertical" className="h-10 bg-border/50" />
            <Badge className="bg-chart-3/20 text-chart-3 border-chart-3/30 px-4 py-2">
              <Activity className="w-4 h-4 mr-2" />
              System Active
            </Badge>
          </div>
          <div className="flex items-center space-x-6">
            <div className="glass-enterprise px-6 py-3 rounded-xl border border-primary/20">
              <div className="flex items-center space-x-4">
                <div>
                  <p className="text-sm text-muted-foreground">Interview Quota</p>
                  <p className="text-lg font-bold text-foreground">
                    {companyStats.interviewsUsed}/{companyStats.interviewQuota || 100}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex relative">
        <aside className="w-72 glass-enterprise border-r border-enterprise min-h-[calc(100vh-89px)] backdrop-blur-xl">
          <nav className="p-6 space-y-3">
            <div className="px-4 py-3 mb-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Navigation</h3>
            </div>
            <Button
              variant={activeTab === "overview" ? "secondary" : "ghost"}
              className={`w-full justify-start h-12 text-base transition-all duration-300 ${
                activeTab === "overview"
                  ? "bg-primary/15 text-primary hover:bg-primary/20 border border-primary/30 shadow-lg"
                  : "text-muted-foreground hover:bg-card/50 hover:text-foreground"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              <BarChart3 className="w-5 h-5 mr-4" />
              Dashboard Overview
            </Button>
            <Button
              variant={activeTab === "templates" ? "secondary" : "ghost"}
              className={`w-full justify-start h-12 text-base transition-all duration-300 ${
                activeTab === "templates"
                  ? "bg-accent/15 text-accent hover:bg-accent/20 border border-accent/30 shadow-lg"
                  : "text-muted-foreground hover:bg-card/50 hover:text-foreground"
              }`}
              onClick={() => setActiveTab("templates")}
            >
              <FileText className="w-5 h-5 mr-4" />
              Interview Templates
            </Button>
            <Button
              variant={activeTab === "interviews" ? "secondary" : "ghost"}
              className={`w-full justify-start h-12 text-base transition-all duration-300 ${
                activeTab === "interviews"
                  ? "bg-chart-3/15 text-chart-3 hover:bg-chart-3/20 border border-chart-3/30 shadow-lg"
                  : "text-muted-foreground hover:bg-card/50 hover:text-foreground"
              }`}
              onClick={() => setActiveTab("interviews")}
            >
              <Link2 className="w-5 h-5 mr-4" />
              Active Interviews
            </Button>
            <Button
              variant={activeTab === "results" ? "secondary" : "ghost"}
              className={`w-full justify-start h-12 text-base transition-all duration-300 ${
                activeTab === "results"
                  ? "bg-secondary/15 text-secondary hover:bg-secondary/20 border border-secondary/30 shadow-lg"
                  : "text-muted-foreground hover:bg-card/50 hover:text-foreground"
              }`}
              onClick={() => setActiveTab("results")}
            >
              <Users className="w-5 h-5 mr-4" />
              Candidate Results
            </Button>

            <div className="px-4 py-3 mt-8 mb-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Enterprise</h3>
            </div>
            <div className="glass-enterprise rounded-xl p-4 border border-primary/20">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Brain className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">AI Insights</p>
                  <p className="text-xs text-muted-foreground">Advanced analytics</p>
                </div>
              </div>
              <Button size="sm" className="w-full btn-enterprise text-sm">
                View Analytics
              </Button>
            </div>
          </nav>
        </aside>

        <main className="flex-1 p-8 bg-gradient-to-br from-background via-background to-card/10 relative">
          <div className="max-w-7xl mx-auto space-y-10">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <>
                <div className="flex items-center justify-between animate-fade-in">
                  <div>
                    <h1 className="text-5xl font-black gradient-text-enterprise mb-3">Dashboard Overview</h1>
                    <p className="text-xl text-muted-foreground">
                      Monitor your AI-powered recruitment activities and performance metrics
                    </p>
                  </div>
                  <div className="glass-enterprise px-6 py-4 rounded-2xl border border-primary/20">
                    <div className="flex items-center space-x-3 text-muted-foreground">
                      <Calendar className="w-5 h-5" />
                      <span className="text-base">Last updated: {new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-slide-up">
                  <Card className="card-hover border-primary/20 hover:border-primary/40 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                      <CardTitle className="text-base font-semibold text-muted-foreground">Templates Created</CardTitle>
                      <div className="w-14 h-14 bg-enterprise-gradient rounded-2xl flex items-center justify-center shadow-lg">
                        <FileText className="w-7 h-7 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-black text-foreground mb-2">{companyStats.totalTemplates}</div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <p className="text-sm text-primary font-medium">Active templates</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-hover border-accent/20 hover:border-accent/40 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                      <CardTitle className="text-base font-semibold text-muted-foreground">
                        Interviews Created
                      </CardTitle>
                      <div className="w-14 h-14 bg-gradient-to-br from-accent to-chart-3 rounded-2xl flex items-center justify-center shadow-lg">
                        <Link2 className="w-7 h-7 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-black text-foreground mb-2">{companyStats.totalInterviews}</div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-accent" />
                        <p className="text-sm text-accent font-medium">
                          {(companyStats.interviewQuota || 100) - companyStats.interviewsUsed} remaining
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-hover border-chart-3/20 hover:border-chart-3/40 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                      <CardTitle className="text-base font-semibold text-muted-foreground">Completed</CardTitle>
                      <div className="w-14 h-14 bg-gradient-to-br from-chart-3 to-primary rounded-2xl flex items-center justify-center shadow-lg">
                        <CheckCircle className="w-7 h-7 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-black text-chart-3 mb-2">{companyStats.completedInterviews}</div>
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-chart-3" />
                        <p className="text-sm text-chart-3 font-medium">
                          {companyStats.totalInterviews > 0
                            ? Math.round((companyStats.completedInterviews / companyStats.totalInterviews) * 100)
                            : 0}
                          % completion rate
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-hover border-secondary/20 hover:border-secondary/40 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                      <CardTitle className="text-base font-semibold text-muted-foreground">Quota Usage</CardTitle>
                      <div className="w-14 h-14 bg-gradient-to-br from-secondary to-primary rounded-2xl flex items-center justify-center shadow-lg">
                        <BarChart3 className="w-7 h-7 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-black text-secondary mb-2">
                        {Math.round((companyStats.interviewsUsed / (companyStats.interviewQuota || 100)) * 100)}%
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {companyStats.interviewsUsed}/{companyStats.interviewQuota || 100} interviews used
                      </p>
                      <div className="w-full bg-muted/50 rounded-full h-3">
                        <div
                          className="bg-enterprise-gradient h-3 rounded-full transition-all duration-500 shadow-sm"
                          style={{
                            width: `${(companyStats.interviewsUsed / (companyStats.interviewQuota || 100)) * 100}%`,
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 animate-fade-in">
                  <Card className="glass-enterprise border-primary/20 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-xl pb-6">
                      <CardTitle className="text-2xl text-foreground flex items-center">
                        <Brain className="w-6 h-6 mr-3 text-primary" />
                        Recent Templates
                      </CardTitle>
                      <CardDescription className="text-base">
                        Your latest AI-powered interview templates
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                      {templates.slice(0, 3).map((template) => (
                        <div
                          key={template._id}
                          className="flex items-center justify-between p-4 glass-enterprise rounded-xl border border-primary/10 hover:border-primary/20 transition-all duration-300"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                              <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground text-base">{template.title}</p>
                              <p className="text-sm text-muted-foreground">{template.questions.length} questions</p>
                            </div>
                          </div>
                          <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1">
                            {interviews.filter((i) => i.templateId === template._id).length} uses
                          </Badge>
                        </div>
                      ))}
                      {templates.length === 0 && (
                        <div className="text-center py-8">
                          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground text-lg">No templates created yet</p>
                          <p className="text-sm text-muted-foreground">Create your first template to get started</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="glass-enterprise border-accent/20 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-accent/5 to-chart-3/5 rounded-t-xl pb-6">
                      <CardTitle className="text-2xl text-foreground flex items-center">
                        <Target className="w-6 h-6 mr-3 text-accent" />
                        Recent Interviews
                      </CardTitle>
                      <CardDescription className="text-base">Latest candidate interview sessions</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                      {interviews.slice(0, 3).map((interview) => (
                        <div
                          key={interview._id}
                          className="flex items-center justify-between p-4 glass-enterprise rounded-xl border border-accent/10 hover:border-accent/20 transition-all duration-300"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
                              <Users className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground text-base">{interview.candidateName}</p>
                              <p className="text-sm text-muted-foreground">{interview.candidateEmail}</p>
                            </div>
                          </div>
                          <Badge
                            variant={interview.status === "completed" ? "secondary" : "outline"}
                            className={
                              interview.status === "completed"
                                ? "bg-chart-3/20 text-chart-3 border-chart-3/30 px-3 py-1"
                                : "border-border/50 px-3 py-1"
                            }
                          >
                            {interview.status}
                          </Badge>
                        </div>
                      ))}
                      {interviews.length === 0 && (
                        <div className="text-center py-8">
                          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground text-lg">No interviews created yet</p>
                          <p className="text-sm text-muted-foreground">Create your first interview to get started</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {/* Templates Tab */}
            {activeTab === "templates" && (
              <>
                <div className="flex items-center justify-between animate-fade-in">
                  <div>
                    <h1 className="text-5xl font-black gradient-text-enterprise mb-3">Interview Templates</h1>
                    <p className="text-xl text-muted-foreground">
                      Create and manage AI-powered interview question templates
                    </p>
                  </div>
                  <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="btn-enterprise shadow-xl px-8 py-4 text-lg">
                        <Plus className="w-5 h-5 mr-3" />
                        Create Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto glass-enterprise border-enterprise">
                      <DialogHeader className="pb-6">
                        <DialogTitle className="text-2xl text-foreground flex items-center">
                          <Sparkles className="w-6 h-6 mr-3 text-primary" />
                          Create Interview Template
                        </DialogTitle>
                        <DialogDescription className="text-base text-muted-foreground">
                          Create a new AI-powered template with custom questions for your interviews
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        {error && (
                          <div className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl animate-fade-in">
                            {error}
                          </div>
                        )}
                        <div className="space-y-3">
                          <Label htmlFor="title" className="text-base font-semibold text-foreground">
                            Template Title
                          </Label>
                          <Input
                            id="title"
                            value={newTemplate.title}
                            onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                            placeholder="e.g., Senior Frontend Developer Interview"
                            className="bg-input/50 border-enterprise hover:border-primary/50 focus:border-primary transition-all duration-300 h-12 text-base"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="description" className="text-base font-semibold text-foreground">
                            Description (Optional)
                          </Label>
                          <Input
                            id="description"
                            value={newTemplate.description}
                            onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                            placeholder="Brief description of this template"
                            className="bg-input/50 border-enterprise hover:border-primary/50 focus:border-primary transition-all duration-300 h-12 text-base"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="generate-questions" className="text-base font-semibold text-foreground">
                            Generate Questions with AI
                          </Label>
                          <div className="flex items-center space-x-3">
                            <Input
                              id="generate-questions"
                              placeholder="Enter a prompt to generate questions (e.g., 'React developer with 5 years experience')"
                              className="bg-input/50 border-enterprise hover:border-primary/50 focus:border-primary transition-all duration-300 h-12 text-base flex-1"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  generateQuestions(e.currentTarget.value)
                                  e.currentTarget.value = ""
                                }
                              }}
                            />
                            <Button
                              onClick={() => {
                                const input = document.getElementById("generate-questions") as HTMLInputElement
                                if (input) generateQuestions(input.value)
                              }}
                              className="bg-accent hover:bg-accent/90 px-6 h-12"
                            >
                              <Zap className="w-5 h-5 mr-2" />
                              Generate
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <Label className="text-base font-semibold text-foreground">Interview Questions</Label>
                          {newTemplate.questions.map((question, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-2">
                                <span className="text-sm font-semibold text-primary">{index + 1}</span>
                              </div>
                              <Textarea
                                value={question}
                                onChange={(e) => updateQuestion(index, e.target.value)}
                                placeholder={`Question ${index + 1}`}
                                className="bg-input/50 border-enterprise hover:border-primary/50 focus:border-primary transition-all duration-300 text-base flex-1"
                                rows={3}
                              />
                              {newTemplate.questions.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeQuestion(index)}
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10 mt-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            onClick={addQuestion}
                            className="w-full border-enterprise hover:bg-primary/5 hover:border-primary/50 h-12 text-base bg-transparent"
                          >
                            <Plus className="w-5 h-5 mr-2" />
                            Add Question
                          </Button>
                        </div>
                      </div>
                      <DialogFooter className="pt-6">
                        <Button
                          variant="outline"
                          onClick={() => setIsTemplateDialogOpen(false)}
                          className="border-enterprise hover:bg-muted/50"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreateTemplate}
                          disabled={isLoading || !newTemplate.title || newTemplate.questions.length === 0}
                          className="btn-enterprise px-8"
                        >
                          {isLoading ? "Creating..." : "Create Template"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up">
                  {templates.map((template) => (
                    <Card
                      key={template._id}
                      className="glass-enterprise border-primary/20 hover:border-primary/40 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                              <FileText className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg text-foreground">{template.title}</CardTitle>
                              <CardDescription className="text-sm">
                                {template.description || "No description"}
                              </CardDescription>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-accent/20 text-accent border-accent/30">
                            {template.questions.length} questions
                          </Badge>
                          <Badge className="bg-chart-3/20 text-chart-3 border-chart-3/30">
                            {interviews.filter((i) => i.templateId === template._id).length} uses
                          </Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editTemplate(template)}
                            className="flex-1 border-enterprise hover:bg-primary/5"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteTemplate(template._id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {templates.length === 0 && (
                    <div className="col-span-full text-center py-16">
                      <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-12 h-12 text-muted-foreground" />
                      </div>
                      <h3 className="text-2xl font-semibold text-foreground mb-2">No templates yet</h3>
                      <p className="text-muted-foreground text-lg mb-6">
                        Create your first interview template to get started
                      </p>
                      <Button onClick={() => setIsTemplateDialogOpen(true)} className="btn-enterprise px-8 py-3">
                        <Plus className="w-5 h-5 mr-2" />
                        Create Your First Template
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Interviews Tab */}
            {activeTab === "interviews" && (
              <>
                <div className="flex items-center justify-between animate-fade-in">
                  <div>
                    <h1 className="text-5xl font-black gradient-text-enterprise mb-3">Active Interviews</h1>
                    <p className="text-xl text-muted-foreground">
                      Manage your ongoing interviews and create new ones
                    </p>
                  </div>
                  <Dialog open={isInterviewDialogOpen} onOpenChange={setIsInterviewDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="btn-enterprise shadow-xl px-8 py-4 text-lg">
                        <Plus className="w-5 h-5 mr-3" />
                        Create Interview
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl glass-enterprise border-enterprise">
                      <DialogHeader className="pb-6">
                        <DialogTitle className="text-2xl text-foreground flex items-center">
                          <Link2 className="w-6 h-6 mr-3 text-primary" />
                          Create New Interview
                        </DialogTitle>
                        <DialogDescription className="text-base text-muted-foreground">
                          Create a new interview session for candidates
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        {error && (
                          <div className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl animate-fade-in">
                            {error}
                          </div>
                        )}
                        <div className="space-y-3">
                          <Label htmlFor="candidateName" className="text-base font-semibold text-foreground">
                            Candidate Name
                          </Label>
                          <Input
                            id="candidateName"
                            value={newInterview.candidateName}
                            onChange={(e) => setNewInterview({ ...newInterview, candidateName: e.target.value })}
                            placeholder="Enter candidate's full name"
                            className="bg-input/50 border-enterprise hover:border-primary/50 focus:border-primary transition-all duration-300 h-12 text-base"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="candidateEmail" className="text-base font-semibold text-foreground">
                            Candidate Email
                          </Label>
                          <Input
                            id="candidateEmail"
                            type="email"
                            value={newInterview.candidateEmail}
                            onChange={(e) => setNewInterview({ ...newInterview, candidateEmail: e.target.value })}
                            placeholder="candidate@example.com"
                            className="bg-input/50 border-enterprise hover:border-primary/50 focus:border-primary transition-all duration-300 h-12 text-base"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="templateSelect" className="text-base font-semibold text-foreground">
                            Interview Template
                          </Label>
                          <select
                            id="templateSelect"
                            value={newInterview.templateId}
                            onChange={(e) => setNewInterview({ ...newInterview, templateId: e.target.value })}
                            className="w-full bg-input/50 border border-enterprise hover:border-primary/50 focus:border-primary transition-all duration-300 h-12 text-base rounded-md px-3"
                          >
                            <option value="">Select a template</option>
                            {templates.map((template) => (
                              <option key={template._id} value={template._id}>
                                {template.title}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex justify-end space-x-3 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => setIsInterviewDialogOpen(false)}
                            className="px-6"
                          >
                            Cancel
                          </Button>
                          <Button onClick={createInterview} className="btn-enterprise px-6">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Interview
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
                  {interviews.map((interview) => (
                    <Card key={interview._id} className="card-hover border-chart-3/20 hover:border-chart-3/40 shadow-lg">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg font-bold text-foreground mb-2">
                              {interview.candidateName}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">{interview.candidateEmail}</p>
                          </div>
                          <Badge
                            variant={
                              interview.status === "completed"
                                ? "secondary"
                                : interview.status === "in-progress"
                                ? "default"
                                : "outline"
                            }
                            className="capitalize"
                          >
                            {interview.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 mr-2" />
                            Created: {new Date(interview.createdAt).toLocaleDateString()}
                          </div>
                          {interview.templateId && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <FileText className="w-4 h-4 mr-2" />
                              Template: {templates.find(t => t._id === interview.templateId)?.title || 'Unknown Template'}
                            </div>
                          )}
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Link2 className="w-4 h-4 mr-2" />
                            Link: {interview.uniqueLink ? "Generated" : "Pending"}
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (interview.uniqueLink) {
                                navigator.clipboard.writeText(`${window.location.origin}/interview/${interview.uniqueLink}`)
                                alert("Interview link copied to clipboard!")
                              }
                            }}
                            className="flex-1 border-chart-3/20 hover:bg-chart-3/5"
                            disabled={!interview.uniqueLink}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Link
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (interview.uniqueLink) {
                                window.open(`/interview/${interview.uniqueLink}`, '_blank')
                              }
                            }}
                            className="flex-1 border-chart-3/20 hover:bg-chart-3/5"
                            disabled={!interview.uniqueLink}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {interviews.length === 0 && (
                    <div className="col-span-full text-center py-16">
                      <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Link2 className="w-12 h-12 text-muted-foreground" />
                      </div>
                      <h3 className="text-2xl font-semibold text-foreground mb-2">No interviews yet</h3>
                      <p className="text-muted-foreground text-lg mb-6">
                        Create your first interview to get started
                      </p>
                      <Button onClick={() => setIsInterviewDialogOpen(true)} className="btn-enterprise px-8 py-3">
                        <Plus className="w-5 h-5 mr-2" />
                        Create Your First Interview
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ... existing code for other tabs ... */}
          </div>
        </main>
      </div>
    </div>
  )
}
