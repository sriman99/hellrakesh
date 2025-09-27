import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Users, TrendingUp, Activity, BarChart3, PieChart, Download } from "lucide-react"

// Mock data for admin analytics
const systemMetrics = {
  totalCompanies: 47,
  totalInterviews: 1247,
  activeUsers: 156,
  systemUptime: 99.9,
  averageScore: 82.4,
  completionRate: 94.2,
  monthlyGrowth: {
    companies: 12,
    interviews: 23,
    users: 18,
  },
}

const companyStats = [
  {
    id: 1,
    name: "TechCorp Solutions",
    interviews: 89,
    quota: 100,
    avgScore: 85.2,
    completionRate: 96,
    status: "active",
  },
  {
    id: 2,
    name: "StartupXYZ",
    interviews: 45,
    quota: 50,
    avgScore: 78.9,
    completionRate: 92,
    status: "active",
  },
  {
    id: 3,
    name: "Enterprise Inc",
    interviews: 156,
    quota: 200,
    avgScore: 88.1,
    completionRate: 98,
    status: "active",
  },
  {
    id: 4,
    name: "Innovation Labs",
    interviews: 23,
    quota: 75,
    avgScore: 81.5,
    completionRate: 89,
    status: "trial",
  },
]

const templateStats = [
  { name: "Software Engineer", usage: 234, avgScore: 84.2 },
  { name: "Product Manager", usage: 156, avgScore: 82.1 },
  { name: "Data Scientist", usage: 98, avgScore: 86.7 },
  { name: "UX Designer", usage: 87, avgScore: 79.8 },
  { name: "DevOps Engineer", usage: 76, avgScore: 85.9 },
]

export default function AdminAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">System Analytics</h1>
              <p className="text-gray-600">Comprehensive platform performance and usage metrics</p>
            </div>
            <div className="flex gap-2">
              <Select defaultValue="30d">
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="interviews">Interviews</TabsTrigger>
            <TabsTrigger value="system">System Health</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemMetrics.totalCompanies}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+{systemMetrics.monthlyGrowth.companies}</span> this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemMetrics.totalInterviews.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+{systemMetrics.monthlyGrowth.interviews}%</span> this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemMetrics.activeUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+{systemMetrics.monthlyGrowth.users}%</span> this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemMetrics.systemUptime}%</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">Excellent</span> performance
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Interview Volume Trends</CardTitle>
                  <CardDescription>Daily interview completions over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>Interview volume chart would be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Company Distribution</CardTitle>
                  <CardDescription>Companies by subscription tier</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <PieChart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>Company distribution chart would be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Performance</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Interview Score</span>
                    <span className="font-semibold">{systemMetrics.averageScore}%</span>
                  </div>
                  <Progress value={systemMetrics.averageScore} />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Completion Rate</span>
                    <span className="font-semibold">{systemMetrics.completionRate}%</span>
                  </div>
                  <Progress value={systemMetrics.completionRate} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Interview Templates</CardTitle>
                  <CardDescription>Most popular templates by usage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {templateStats.slice(0, 3).map((template, index) => (
                      <div key={template.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium">{template.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{template.usage}</div>
                          <div className="text-xs text-gray-500">{template.avgScore}% avg</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="companies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Performance Overview</CardTitle>
                <CardDescription>Detailed metrics for all registered companies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {companyStats.map((company) => (
                    <div key={company.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{company.name}</h3>
                          <Badge variant={company.status === "active" ? "default" : "secondary"}>
                            {company.status}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{company.avgScore}%</div>
                          <div className="text-sm text-gray-600">avg score</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Interview Usage</div>
                          <div className="flex items-center gap-2">
                            <Progress value={(company.interviews / company.quota) * 100} className="flex-1" />
                            <span className="text-sm font-medium">
                              {company.interviews}/{company.quota}
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-gray-600 mb-1">Completion Rate</div>
                          <div className="flex items-center gap-2">
                            <Progress value={company.completionRate} className="flex-1" />
                            <span className="text-sm font-medium">{company.completionRate}%</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                          <Button size="sm">Manage Quota</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interviews" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Interview Template Analytics</CardTitle>
                  <CardDescription>Performance metrics by template type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {templateStats.map((template, index) => (
                      <div key={template.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <span className="font-medium">{template.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{template.usage} uses</div>
                          <div className="text-sm text-gray-600">{template.avgScore}% avg score</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Interview Activity</CardTitle>
                  <CardDescription>Latest completed interviews across all companies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { company: "TechCorp Solutions", candidate: "John Doe", score: 87, time: "2 hours ago" },
                      { company: "StartupXYZ", candidate: "Jane Smith", score: 92, time: "4 hours ago" },
                      { company: "Enterprise Inc", candidate: "Mike Johnson", score: 78, time: "6 hours ago" },
                      { company: "Innovation Labs", candidate: "Sarah Wilson", score: 85, time: "8 hours ago" },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{activity.candidate}</div>
                          <div className="text-sm text-gray-600">{activity.company}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{activity.score}%</div>
                          <div className="text-sm text-gray-600">{activity.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Health Metrics</CardTitle>
                  <CardDescription>Real-time system performance indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Server Uptime</span>
                    <span className="font-semibold text-green-600">99.9%</span>
                  </div>
                  <Progress value={99.9} />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">API Response Time</span>
                    <span className="font-semibold">245ms</span>
                  </div>
                  <Progress value={85} />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Database Performance</span>
                    <span className="font-semibold text-green-600">Optimal</span>
                  </div>
                  <Progress value={92} />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Storage Usage</span>
                    <span className="font-semibold">67%</span>
                  </div>
                  <Progress value={67} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Error Monitoring</CardTitle>
                  <CardDescription>System errors and resolution status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">API Rate Limit Exceeded</div>
                        <div className="text-sm text-gray-600">Last occurred: 2 hours ago</div>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Resolved
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Database Connection Timeout</div>
                        <div className="text-sm text-gray-600">Last occurred: 1 day ago</div>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Resolved
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">File Upload Failed</div>
                        <div className="text-sm text-gray-600">Last occurred: 3 days ago</div>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Resolved
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
