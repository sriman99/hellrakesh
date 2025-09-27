"use client"

import { useState } from "react"
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
  Edit,
  LogOut,
  Plus,
  UserPlus,
  Search,
  Filter,
} from "lucide-react"
import Link from "next/link"

// Mock data for companies
const mockCompanies = [
  {
    id: 1,
    name: "TechCorp Solutions",
    email: "hr@techcorp.com",
    registeredDate: "2024-01-15",
    interviewQuota: 100,
    interviewsUsed: 67,
    status: "active",
    industry: "Technology",
    employees: "500-1000",
  },
  {
    id: 2,
    name: "InnovateLabs",
    email: "hiring@innovatelabs.com",
    registeredDate: "2024-02-03",
    interviewQuota: 50,
    interviewsUsed: 23,
    status: "active",
    industry: "Software",
    employees: "50-100",
  },
  {
    id: 3,
    name: "StartupHub Inc",
    email: "talent@startuphub.com",
    registeredDate: "2024-01-28",
    interviewQuota: 75,
    interviewsUsed: 75,
    status: "quota_reached",
    industry: "Consulting",
    employees: "100-500",
  },
  {
    id: 4,
    name: "Enterprise Systems",
    email: "recruitment@enterprise.com",
    registeredDate: "2024-02-10",
    interviewQuota: 200,
    interviewsUsed: 134,
    status: "active",
    industry: "Enterprise",
    employees: "1000+",
  },
]

export default function AdminCompanies() {
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [newQuota, setNewQuota] = useState("")
  const [showAddCompany, setShowAddCompany] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [newCompanyData, setNewCompanyData] = useState({
    name: "",
    email: "",
    initialQuota: "50",
    industry: "",
    employees: "",
  })

  const filteredCompanies = mockCompanies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddCompany = () => {
    console.log("Adding new company:", newCompanyData)
    setShowAddCompany(false)
    setNewCompanyData({ name: "", email: "", initialQuota: "50", industry: "", employees: "" })
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
            <Button
              variant="secondary"
              className="w-full justify-start bg-sidebar-accent text-sidebar-accent-foreground"
            >
              <Building2 className="w-4 h-4 mr-3" />
              Companies
            </Button>
            <Link href="/admin/interviews">
              <Button
                variant="ghost"
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <Users className="w-4 h-4 mr-3" />
                Interviews
              </Button>
            </Link>
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
                <h1 className="text-3xl font-bold text-foreground">Company Management</h1>
                <p className="text-muted-foreground">Manage all registered companies and their interview quotas</p>
              </div>
              <Dialog open={showAddCompany} onOpenChange={setShowAddCompany}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Company
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Company</DialogTitle>
                    <DialogDescription>Register a new company and set their initial interview quota</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Company Name</Label>
                      <Input
                        id="company-name"
                        value={newCompanyData.name}
                        onChange={(e) => setNewCompanyData({ ...newCompanyData, name: e.target.value })}
                        placeholder="Enter company name"
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-email">Company Email</Label>
                      <Input
                        id="company-email"
                        type="email"
                        value={newCompanyData.email}
                        onChange={(e) => setNewCompanyData({ ...newCompanyData, email: e.target.value })}
                        placeholder="hr@company.com"
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="initial-quota">Initial Interview Quota</Label>
                      <Input
                        id="initial-quota"
                        type="number"
                        value={newCompanyData.initialQuota}
                        onChange={(e) => setNewCompanyData({ ...newCompanyData, initialQuota: e.target.value })}
                        className="bg-input border-border"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddCompany(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddCompany}>Add Company</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search companies..."
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

            {/* Companies Table */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-xl">All Companies ({filteredCompanies.length})</CardTitle>
                <CardDescription>Complete list of registered companies and their details</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead>Employees</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead>Quota Usage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompanies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell className="text-muted-foreground">{company.email}</TableCell>
                        <TableCell className="text-muted-foreground">{company.industry}</TableCell>
                        <TableCell className="text-muted-foreground">{company.employees}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(company.registeredDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="text-sm">
                              {company.interviewsUsed}/{company.interviewQuota}
                            </div>
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  company.interviewsUsed >= company.interviewQuota
                                    ? "bg-destructive"
                                    : company.interviewsUsed / company.interviewQuota > 0.8
                                      ? "bg-chart-3"
                                      : "bg-accent"
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
                            variant={
                              company.status === "active"
                                ? "secondary"
                                : company.status === "quota_reached"
                                  ? "destructive"
                                  : "outline"
                            }
                          >
                            {company.status === "active"
                              ? "Active"
                              : company.status === "quota_reached"
                                ? "Quota Reached"
                                : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Plus className="w-4 h-4 mr-1" />
                              Add
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
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
