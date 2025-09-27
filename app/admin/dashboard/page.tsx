"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
  Users,
  BarChart3,
  Settings,
  Shield,
  TrendingUp,
  Calendar,
  Edit,
  LogOut,
  Plus,
  UserPlus,
  Activity,
  Server,
  Database,
  Zap,
} from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const [companies, setCompanies] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalInterviews: 0,
    activeInterviews: 0,
    completionRate: 0,
  })
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [newQuota, setNewQuota] = useState("")
  const [showAddCompany, setShowAddCompany] = useState(false)
  const [newCompanyData, setNewCompanyData] = useState({
    name: "",
    email: "",
    initialQuota: "50",
  })
  const [actionType, setActionType] = useState<"update" | "add">("update")

  useEffect(() => {
    fetchCompanies()
    fetchStats()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/admin/companies")
      if (response.ok) {
        const data = await response.json()
        setCompanies(data.companies)
      } else {
        console.error("Failed to fetch companies")
      }
    } catch (error) {
      console.error("Error fetching companies:", error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        console.error("Failed to fetch stats")
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleUpdateQuota = async () => {
    if (!selectedCompany || !newQuota.trim()) return

    try {
      const response = await fetch("/api/admin/companies", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: selectedCompany._id,
          interviewQuota: Number.parseInt(newQuota),
          addToExisting: actionType === "add",
        }),
      })

      if (response.ok) {
        alert(
          actionType === "add"
            ? `Successfully added ${newQuota} interviews to ${selectedCompany.name}'s quota.`
            : `Successfully updated ${selectedCompany.name}'s quota to ${newQuota}.`,
        )
        fetchCompanies()
        setSelectedCompany(null)
        setNewQuota("")
        setActionType("update")
      } else {
        const data = await response.json()
        alert(data.error || "Failed to update quota.")
      }
    } catch (error) {
      console.error("Error updating quota:", error)
      alert("Network error. Please try again.")
    }
  }

  const handleAddCompany = async () => {
    try {
      const response = await fetch("/api/admin/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCompanyData),
      })

      if (response.ok) {
        alert("Company added successfully")
        fetchCompanies()
        setShowAddCompany(false)
        setNewCompanyData({ name: "", email: "", initialQuota: "50" })
      } else {
        const data = await response.json()
        alert(data.error || "Failed to add company.")
      }
    } catch (error) {
      console.error("Error adding company:", error)
      alert("Network error. Please try again.")
    }
  }

  const handleAddInterviews = (company: any) => {
    setSelectedCompany(company)
    setNewQuota("")
    setActionType("add")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-effect sticky top-0 z-50 border-b border-border/30">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xl font-bold gradient-text">Admin Panel</span>
                <p className="text-xs text-muted-foreground">HumaneQ HR Platform</p>
              </div>
            </div>
            <Separator orientation="vertical" className="h-8" />
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              <Activity className="w-3 h-3 mr-1" />
              Live
            </Badge>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" className="border-border/50 hover:border-primary/50 bg-transparent">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Link href="/">
              <Button variant="ghost" size="sm" className="hover:bg-destructive/10 hover:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 bg-card/50 border-r border-border/50 min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-2">
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overview</h3>
            </div>
            <Button
              variant="secondary"
              className="w-full justify-start bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
            >
              <BarChart3 className="w-4 h-4 mr-3" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:bg-card hover:text-foreground transition-all duration-200"
            >
              <Building2 className="w-4 h-4 mr-3" />
              Companies
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:bg-card hover:text-foreground transition-all duration-200"
            >
              <Users className="w-4 h-4 mr-3" />
              Interviews
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:bg-card hover:text-foreground transition-all duration-200"
            >
              <TrendingUp className="w-4 h-4 mr-3" />
              Analytics
            </Button>

            <div className="px-3 py-2 pt-6">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">System</h3>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:bg-card hover:text-foreground transition-all duration-200"
            >
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </Button>
          </nav>
        </aside>

        <main className="flex-1 p-6 bg-gradient-to-br from-background via-background to-card/20">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between animate-fade-in">
              <div>
                <h1 className="text-4xl font-bold gradient-text mb-2">Dashboard Overview</h1>
                <p className="text-muted-foreground text-lg">Monitor platform usage and manage company accounts</p>
              </div>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground bg-card/50 px-4 py-2 rounded-lg border border-border/50">
                <Calendar className="w-4 h-4" />
                <span>Last updated: {new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
              <Card className="border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Companies</CardTitle>
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{stats.totalCompanies}</div>
                  <p className="text-xs text-muted-foreground mt-1">Registered organizations</p>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:border-accent/30 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Interviews</CardTitle>
                  <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-chart-3/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-5 h-5 text-accent" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{stats.totalInterviews}</div>
                  <p className="text-xs text-muted-foreground mt-1">Completed sessions</p>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:border-chart-3/30 transition-all duration-300 hover:shadow-lg hover:shadow-chart-3/10 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Interviews</CardTitle>
                  <div className="w-10 h-10 bg-gradient-to-br from-chart-3/20 to-primary/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="w-5 h-5 text-chart-3" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-chart-3">{stats.activeInterviews}</div>
                  <p className="text-xs text-muted-foreground mt-1">Currently in progress</p>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:border-secondary/30 transition-all duration-300 hover:shadow-lg hover:shadow-secondary/10 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
                  <div className="w-10 h-10 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="w-5 h-5 text-secondary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-secondary">{stats.completionRate}%</div>
                  <p className="text-xs text-muted-foreground mt-1">Success rate</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/50 hover:border-primary/20 transition-all duration-300 shadow-lg animate-fade-in">
              <CardHeader className="bg-gradient-to-r from-card to-card/50 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl text-foreground">Company Management</CardTitle>
                    <CardDescription className="text-muted-foreground mt-1">
                      Manage registered companies and their interview quotas
                    </CardDescription>
                  </div>
                  <Dialog open={showAddCompany} onOpenChange={setShowAddCompany}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/25 transition-all duration-300">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Company
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border/50">
                      <DialogHeader>
                        <DialogTitle className="text-xl text-foreground">Add New Company</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                          Register a new company and set their initial interview quota
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="company-name" className="text-foreground">
                            Company Name
                          </Label>
                          <Input
                            id="company-name"
                            value={newCompanyData.name}
                            onChange={(e) => setNewCompanyData({ ...newCompanyData, name: e.target.value })}
                            placeholder="Enter company name"
                            className="bg-input border-border/50 focus:border-primary/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company-email" className="text-foreground">
                            Company Email
                          </Label>
                          <Input
                            id="company-email"
                            type="email"
                            value={newCompanyData.email}
                            onChange={(e) => setNewCompanyData({ ...newCompanyData, email: e.target.value })}
                            placeholder="hr@company.com"
                            className="bg-input border-border/50 focus:border-primary/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="initial-quota" className="text-foreground">
                            Initial Interview Quota
                          </Label>
                          <Input
                            id="initial-quota"
                            type="number"
                            value={newCompanyData.initialQuota}
                            onChange={(e) => setNewCompanyData({ ...newCompanyData, initialQuota: e.target.value })}
                            className="bg-input border-border/50 focus:border-primary/50"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddCompany(false)} className="border-border/50">
                          Cancel
                        </Button>
                        <Button onClick={handleAddCompany} className="bg-primary hover:bg-primary/90">
                          Add Company
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50">
                        <TableHead className="text-muted-foreground font-semibold">Company Name</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Email</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Registered</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Quota Usage</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {companies.map((company) => (
                        <TableRow
                          key={company._id}
                          className="border-border/30 hover:bg-card/50 transition-colors duration-200"
                        >
                          <TableCell className="font-medium text-foreground">{company.companyName}</TableCell>
                          <TableCell className="text-muted-foreground">{company.email}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(company.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="text-sm font-medium text-foreground">
                                {company.interviewsUsed}/{company.interviewQuota}
                              </div>
                              <div className="w-24 bg-muted/50 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    company.interviewsUsed >= company.interviewQuota
                                      ? "bg-destructive"
                                      : company.interviewsUsed / company.interviewQuota > 0.8
                                        ? "bg-chart-3"
                                        : "bg-primary"
                                  }`}
                                  style={{
                                    width: `${Math.min((company.interviewsUsed / company.interviewQuota) * 100, 100)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={company.interviewsUsed >= company.interviewQuota ? "destructive" : "secondary"}
                              className={
                                company.interviewsUsed >= company.interviewQuota
                                  ? "bg-destructive/10 text-destructive border-destructive/20"
                                  : "bg-primary/10 text-primary border-primary/20"
                              }
                            >
                              {company.interviewsUsed >= company.interviewQuota ? "Quota Reached" : "Active"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddInterviews(company)}
                                className="border-border/50 hover:border-primary/50 hover:bg-primary/10"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedCompany(company)
                                      setNewQuota(company.interviewQuota.toString())
                                      setActionType("update")
                                    }}
                                    className="hover:bg-accent/10 hover:text-accent"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-card border-border/50">
                                  <DialogHeader>
                                    <DialogTitle className="text-xl text-foreground">
                                      {actionType === "add" ? "Add Interview Allocation" : "Update Interview Quota"}
                                    </DialogTitle>
                                    <DialogDescription className="text-muted-foreground">
                                      {actionType === "add"
                                        ? `Add more interviews to ${selectedCompany?.companyName}'s existing quota`
                                        : `Modify the total interview quota for ${selectedCompany?.companyName}`}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="quota" className="text-foreground">
                                        {actionType === "add" ? "Additional Interviews" : "New Total Quota"}
                                      </Label>
                                      <Input
                                        id="quota"
                                        type="number"
                                        value={newQuota}
                                        onChange={(e) => setNewQuota(e.target.value)}
                                        className="bg-input border-border/50 focus:border-primary/50"
                                      />
                                    </div>
                                    <div className="text-sm text-muted-foreground space-y-1 bg-card/30 p-3 rounded-lg">
                                      <div>Current quota: {selectedCompany?.interviewQuota} interviews</div>
                                      <div>Current usage: {selectedCompany?.interviewsUsed} interviews</div>
                                      {actionType === "add" && (
                                        <div className="font-medium text-primary">
                                          New total:{" "}
                                          {selectedCompany?.interviewQuota + Number.parseInt(newQuota || "0")}{" "}
                                          interviews
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      variant="outline"
                                      onClick={() => setSelectedCompany(null)}
                                      className="border-border/50"
                                    >
                                      Cancel
                                    </Button>
                                    <Button onClick={handleUpdateQuota} className="bg-primary hover:bg-primary/90">
                                      {actionType === "add" ? "Add Interviews" : "Update Quota"}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6 animate-slide-up">
              <Card className="border-border/50 hover:border-accent/20 transition-all duration-300 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-card to-card/50 rounded-t-lg">
                  <CardTitle className="text-xl text-foreground flex items-center">
                    <Building2 className="w-5 h-5 mr-2 text-accent" />
                    Recent Company Registrations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {companies.slice(0, 3).map((company) => (
                    <div
                      key={company._id}
                      className="flex items-center justify-between p-3 bg-card/30 rounded-lg border border-border/30"
                    >
                      <div>
                        <p className="font-medium text-foreground">{company.companyName}</p>
                        <p className="text-sm text-muted-foreground">{company.email}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(company.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:border-chart-3/20 transition-all duration-300 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-card to-card/50 rounded-t-lg">
                  <CardTitle className="text-xl text-foreground flex items-center">
                    <Server className="w-5 h-5 mr-2 text-chart-3" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-card/30 rounded-lg border border-border/30">
                    <div className="flex items-center space-x-2">
                      <Server className="w-4 h-4 text-chart-3" />
                      <span className="text-sm text-muted-foreground">Server Status</span>
                    </div>
                    <Badge variant="secondary" className="bg-chart-3/10 text-chart-3 border-chart-3/20">
                      <div className="w-2 h-2 bg-chart-3 rounded-full mr-2 animate-pulse" />
                      Online
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-card/30 rounded-lg border border-border/30">
                    <div className="flex items-center space-x-2">
                      <Database className="w-4 h-4 text-primary" />
                      <span className="text-sm text-muted-foreground">Database</span>
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      <div className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse" />
                      Healthy
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-card/30 rounded-lg border border-border/30">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-accent" />
                      <span className="text-sm text-muted-foreground">API Response Time</span>
                    </div>
                    <span className="text-sm font-medium text-accent">127ms</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-card/30 rounded-lg border border-border/30">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-secondary" />
                      <span className="text-sm text-muted-foreground">Uptime</span>
                    </div>
                    <span className="text-sm font-medium text-secondary">99.9%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
