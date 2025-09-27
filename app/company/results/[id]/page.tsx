import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarInitials } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, User, Star, Download, ArrowLeft, Play } from "lucide-react"
import Link from "next/link"

// Mock data for detailed interview result
const interviewDetail = {
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
    codeQuality: 90,
  },
  questions: [
    {
      id: 1,
      question: "Tell me about your experience with React and modern frontend frameworks.",
      answer:
        "I have been working with React for over 4 years, starting with class components and transitioning to hooks. I've built several large-scale applications using React with TypeScript, implementing complex state management with Redux and Context API. Recently, I've been exploring Next.js for server-side rendering and have experience with React Query for data fetching...",
      score: 88,
      feedback: "Excellent technical knowledge and clear communication. Shows deep understanding of React ecosystem.",
      duration: "3:45",
    },
    {
      id: 2,
      question: "How would you approach optimizing the performance of a React application?",
      answer:
        "Performance optimization in React involves several strategies. First, I'd use React DevTools Profiler to identify bottlenecks. Then I'd implement code splitting with React.lazy and Suspense, optimize re-renders using React.memo and useMemo, and ensure proper key props in lists. For larger applications, I'd consider implementing virtual scrolling for long lists...",
      score: 92,
      feedback: "Comprehensive understanding of React performance optimization techniques.",
      duration: "4:12",
    },
    {
      id: 3,
      question: "Describe a challenging technical problem you solved recently.",
      answer:
        "Recently, I worked on a complex data visualization dashboard that was experiencing severe performance issues with large datasets. The main challenge was rendering thousands of data points while maintaining smooth interactions. I solved this by implementing canvas-based rendering instead of SVG, adding data virtualization, and creating a custom hook for debounced updates...",
      score: 85,
      feedback:
        "Good problem-solving approach and technical solution. Could provide more details on the implementation.",
      duration: "5:20",
    },
  ],
  aiAnalysis: {
    strengths: [
      "Strong technical knowledge in React ecosystem",
      "Clear and articulate communication",
      "Good problem-solving methodology",
      "Experience with performance optimization",
    ],
    improvements: [
      "Could provide more specific examples in some answers",
      "Opportunity to discuss testing strategies more",
      "Could elaborate on team collaboration experiences",
    ],
    recommendation: "Strong candidate with solid technical foundation. Recommended for next round.",
    confidence: 87,
  },
}

export default function InterviewDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/company/results">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Results
            </Link>
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback>
                  <AvatarInitials name={interviewDetail.candidateName} />
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{interviewDetail.candidateName}</h1>
                <p className="text-gray-600">{interviewDetail.candidateEmail}</p>
                <p className="text-sm text-gray-500">{interviewDetail.templateName}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="font-bold text-2xl">{interviewDetail.overallScore}%</span>
              </div>
              <Badge variant="default">Completed</Badge>
            </div>
          </div>
        </div>

        {/* Interview Metadata */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="font-medium">{new Date(interviewDetail.completedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium">{interviewDetail.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Questions</p>
                  <p className="font-medium">{interviewDetail.questions.length} answered</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="responses">Responses</TabsTrigger>
            <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
            <TabsTrigger value="recording">Recording</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Score Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Score Breakdown</CardTitle>
                <CardDescription>Performance across different evaluation criteria</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(interviewDetail.scores).map(([category, score]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{category.replace(/([A-Z])/g, " $1").trim()}</span>
                      <span className="font-semibold">{score}%</span>
                    </div>
                    <Progress value={score} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {interviewDetail.aiAnalysis.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-amber-600">Areas for Improvement</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {interviewDetail.aiAnalysis.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="responses" className="space-y-6">
            {interviewDetail.questions.map((q, index) => (
              <Card key={q.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                      <CardDescription className="mt-2">{q.question}</CardDescription>
                    </div>
                    <div className="text-right ml-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-semibold">{q.score}%</span>
                      </div>
                      <div className="text-sm text-gray-500">{q.duration}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Candidate Response:</h4>
                    <p className="text-gray-700 leading-relaxed">{q.answer}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">AI Feedback:</h4>
                    <p className="text-gray-600 text-sm">{q.feedback}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Analysis Report</CardTitle>
                <CardDescription>Comprehensive evaluation based on interview responses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Overall Recommendation</h3>
                  <p className="text-gray-700 mb-4">{interviewDetail.aiAnalysis.recommendation}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Confidence Level:</span>
                    <Progress value={interviewDetail.aiAnalysis.confidence} className="w-32" />
                    <span className="font-medium">{interviewDetail.aiAnalysis.confidence}%</span>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-green-600">Key Strengths</h3>
                    <ul className="space-y-3">
                      {interviewDetail.aiAnalysis.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                            {index + 1}
                          </div>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-amber-600">Development Areas</h3>
                    <ul className="space-y-3">
                      {interviewDetail.aiAnalysis.improvements.map((improvement, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                            {index + 1}
                          </div>
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recording" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Interview Recording</CardTitle>
                <CardDescription>Video recording of the interview session</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center text-white">
                    <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Interview Recording</p>
                    <p className="text-sm opacity-75">Duration: {interviewDetail.duration}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button>
                      <Play className="h-4 w-4 mr-2" />
                      Play
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    Recorded on {new Date(interviewDetail.completedAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
