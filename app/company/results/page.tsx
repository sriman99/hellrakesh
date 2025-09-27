import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarInitials } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Calendar, Clock, User, Star, TrendingUp, Filter, Download, Eye } from "lucide-react"
import Link from "next/link"

// Mock data for interview results
const interviewResults = [
  {
    id: "int_001",
    candidateName: "Sarah Johnson",
    candidateEmail: "sarah.johnson@email.com",
    templateName: "Senior Frontend Developer",
    completedAt: "2024-01-15T14:30:00Z",
    duration: "45 minutes",
    status: "completed",
    overallScore: 85,
    scores: {
      technical: 88,
      communication: 82,
      problemSolving: 87,
    },
    questionsAnswered: 8,
    totalQuestions: 8,
  },
  {
    id: "int_002",
    candidateName: "Michael Chen",
    candidateEmail: "michael.chen@email.com",
    templateName: "Product Manager",
    completedAt: "2024-01-14T10:15:00Z",
    duration: "38 minutes",
    status: "completed",
    overallScore: 92,
    scores: {
      leadership: 94,
      strategy: 90,
      communication: 92,
    },
    questionsAnswered: 6,
    totalQuestions: 6,
  },
  {
    id: "int_003",
    candidateName: "Emily Rodriguez",
    candidateEmail: "emily.rodriguez@email.com",
    templateName: "UX Designer",
    completedAt: "2024-01-13T16:45:00Z",
    duration: "42 minutes",
    status: "completed",
    overallScore: 78,
    scores: {
      design: 82,
      userResearch: 75,
      collaboration: 77,
    },
    questionsAnswered: 7,
    totalQuestions: 7,
  },
]

const analytics = {
  totalInterviews: 156,
  completionRate: 94,
  averageScore: 82,
  averageDuration: "41 minutes",
  topPerformingTemplate: "Senior Frontend Developer",
  monthlyTrend: "+12%",
}

export default function ResultsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Results & Analytics</h1>
          <p className="text-gray-600">View and analyze candidate interview performance</p>
        </div>

        <Tabs defaultValue="results" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="results">Interview Results</TabsTrigger>
            <TabsTrigger value="analytics">Analytics Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filter Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input placeholder="Search candidates..." />
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Templates</SelectItem>
                      <SelectItem value="frontend">Senior Frontend Developer</SelectItem>
                      <SelectItem value="pm">Product Manager</SelectItem>
                      <SelectItem value="ux">UX Designer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Date Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Results List */}
            <div className="grid gap-6">
              {interviewResults.map((result) => (
                <Card key={result.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            <AvatarInitials name={result.candidateName} />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{result.candidateName}</h3>
                          <p className="text-gray-600">{result.candidateEmail}</p>
                          <p className="text-sm text-gray-500">{result.templateName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-semibold text-lg">{result.overallScore}%</span>
                        </div>
                        <Badge variant={result.status === "completed" ? "default" : "secondary"}>{result.status}</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {new Date(result.completedAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        {result.duration}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        {result.questionsAnswered}/{result.totalQuestions} questions
                      </div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="space-y-3 mb-4">
                      {Object.entries(result.scores).map(([category, score]) => (
                        <div key={category} className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-700 w-24 capitalize">{category}:</span>
                          <Progress value={score} className="flex-1" />
                          <span className="text-sm font-medium text-gray-900 w-12">{score}%</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button asChild size="sm">
                        <Link href={`/company/results/${result.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalInterviews}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">{analytics.monthlyTrend}</span> from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.completionRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+2%</span> from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.averageScore}%</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+5%</span> from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.averageDuration}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-red-600">+3 min</span> from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts and Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Interview Performance Trends</CardTitle>
                  <CardDescription>Average scores over the last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    [Chart: Line chart showing performance trends]
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Template Performance</CardTitle>
                  <CardDescription>Success rates by interview template</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    [Chart: Bar chart showing template performance]
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Templates</CardTitle>
                <CardDescription>Templates with highest candidate scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Senior Frontend Developer", score: 87, interviews: 45 },
                    { name: "Product Manager", score: 84, interviews: 32 },
                    { name: "UX Designer", score: 81, interviews: 28 },
                    { name: "Backend Engineer", score: 79, interviews: 38 },
                  ].map((template, index) => (
                    <div key={template.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-gray-600">{template.interviews} interviews conducted</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-lg">{template.score}%</div>
                        <div className="text-sm text-gray-600">avg score</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
