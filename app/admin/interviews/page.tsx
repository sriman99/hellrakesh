"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Building2,
  Users,
  BarChart3,
  Settings,
  Shield,
  LogOut,
  Search,
  Filter,
  Calendar,
  Clock,
  Eye,
} from "lucide-react"
import Link from "next/link"

// Mock data for interviews
const mockInterviews = [
  {
    id: 1,
    candidateName: "John Smith",
    candidateEmail: "john.smith@email.com",
    companyName: "TechCorp Solutions",
    templateName: "Senior Developer Interview",
    status: "completed",
    scheduledDate: "2024-03-15",
    duration: "45 minutes",
    score: 85,
  },
  {
    id: 2,
    candidateName: "Sarah Johnson",
    candidateEmail: "sarah.j@email.com",
    companyName: "InnovateLabs",
    templateName: "Product Manager Assessment",
    status: "in_progress",
    scheduledDate: "2024-03-16",
    duration: "60 minutes",
    score: null,
  },
  {
    id: 3,
    candidateName: "Mike Chen",
    candidateEmail: "mike.chen@email.com",
    companyName: "StartupHub Inc",
    templateName: "Frontend Developer Test",
    status: "scheduled",
    scheduledDate: "2024-03-17",
    duration: "30 minutes",
    score: null,
  },
  {
    id: 4,
    candidateName: "Emily Davis",
    candidateEmail: "emily.davis@email.com",
    companyName: "Enterprise Systems",
    templateName: "Data Analyst Interview",
    status: "completed",
    scheduledDate: "2024-03-14",
    duration: "40 minutes",
    score: 92,
  },
]

export default function AdminInterviews() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredInterviews = mockInterviews.filter((interview) => {
    const matchesSearch =
      interview.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || interview.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="secondary" className="bg-chart-3/10 text-chart-3">
            Completed
          </Badge>
        )
      case "in_progress":
        return (
          <Badge variant="secondary" className="bg-accent/10 text-accent">
            In Progress
          </Badge>
        )
      case "scheduled":
        return <Badge variant="outline">Scheduled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Admin Panel</span>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <Badge variant="secondary">Humaneq HR</Badge>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Link href="/">
              <Button variant="ghost" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-sidebar border-r border-sidebar-border min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-2">
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">Overview</h3>
            </div>
            <Link href="/admin/dashboard">
              <Button
                variant="ghost"
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <BarChart3 className="w-4 h-4 mr-3" />
                Dashboard
              </Button>
            </Link>
            <Link href="/admin/companies">
              <Button
                variant="ghost"
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <Building2 className="w-4 h-4 mr-3" />
                Companies
              </Button>
            </Link>
            <Button
              variant="secondary"
              className="w-full justify-start bg-sidebar-accent text-sidebar-accent-foreground"
            >
              <Users className="w-4 h-4 mr-3" />
              Interviews
            </Button>
            <Link href="/admin/analytics">
              <Button
                variant="ghost"
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <BarChart3 className="w-4 h-4 mr-3" />
                Analytics
              </Button>
            </Link>

            <div className="px-3 py-2 pt-6">
              <h3 className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">System</h3>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Interview Management</h1>
                <p className="text-muted-foreground">Monitor all interviews across the platform</p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Last updated: {new Date().toLocaleDateString()}</span>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Interviews</CardTitle>
                  <Users className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">1,284</div>
                  <p className="text-xs text-muted-foreground">+127 from last month</p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-chart-3">1,210</div>
                  <p className="text-xs text-muted-foreground">94.2% completion rate</p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">23</div>
                  <p className="text-xs text-muted-foreground">Currently active</p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg Score</CardTitle>
                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">87.3</div>
                  <p className="text-xs text-muted-foreground">+2.1 from last month</p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search interviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            {/* Interviews Table */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-xl">All Interviews ({filteredInterviews.length})</CardTitle>
                <CardDescription>Complete list of interviews across all companies</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInterviews.map((interview) => (
                      <TableRow key={interview.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{interview.candidateName}</div>
                            <div className="text-sm text-muted-foreground">{interview.candidateEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{interview.companyName}</TableCell>
                        <TableCell className="text-muted-foreground">{interview.templateName}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(interview.scheduledDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{interview.duration}</TableCell>
                        <TableCell>{getStatusBadge(interview.status)}</TableCell>
                        <TableCell>
                          {interview.score ? (
                            <span className="font-medium">{interview.score}/100</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
