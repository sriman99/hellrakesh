"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  FileText,
  Plus,
  Edit,
  Copy,
  Eye,
  Search,
  Filter,
  ArrowLeft,
  Clock,
  Users,
  Star,
  MoreHorizontal,
} from "lucide-react"
import Link from "next/link"

// Mock data for templates
const mockTemplates = [
  {
    id: 1,
    title: "Frontend Developer Interview",
    description: "Comprehensive assessment for frontend development roles",
    category: "Engineering",
    difficulty: "Intermediate",
    duration: "30-45 minutes",
    questions: [
      {
        id: 1,
        question: "Tell me about your experience with React and modern JavaScript frameworks.",
        timeLimit: 5,
        type: "open-ended",
      },
      {
        id: 2,
        question: "How do you handle state management in large applications?",
        timeLimit: 7,
        type: "technical",
      },
      {
        id: 3,
        question: "Describe your approach to responsive design and cross-browser compatibility.",
        timeLimit: 6,
        type: "technical",
      },
    ],
    createdDate: "2024-01-15",
    lastModified: "2024-02-01",
    usageCount: 15,
    isStarred: true,
  },
  {
    id: 2,
    title: "Backend Developer Assessment",
    description: "Technical evaluation for backend engineering positions",
    category: "Engineering",
    difficulty: "Advanced",
    duration: "45-60 minutes",
    questions: [
      {
        id: 1,
        question: "Explain your experience with database design and optimization.",
        timeLimit: 8,
        type: "technical",
      },
      {
        id: 2,
        question: "How do you ensure API security and handle authentication?",
        timeLimit: 7,
        type: "technical",
      },
      {
        id: 3,
        question: "Describe your approach to handling high traffic and scalability.",
        timeLimit: 10,
        type: "system-design",
      },
    ],
    createdDate: "2024-01-20",
    lastModified: "2024-01-25",
    usageCount: 23,
    isStarred: false,
  },
  {
    id: 3,
    title: "Product Manager Interview",
    description: "Behavioral and strategic assessment for PM roles",
    category: "Product",
    difficulty: "Intermediate",
    duration: "30-40 minutes",
    questions: [
      {
        id: 1,
        question: "How do you prioritize product features when resources are limited?",
        timeLimit: 6,
        type: "behavioral",
      },
      {
        id: 2,
        question: "Describe your experience with user research and data-driven decisions.",
        timeLimit: 8,
        type: "analytical",
      },
      {
        id: 3,
        question: "How do you handle conflicts between stakeholders with different priorities?",
        timeLimit: 5,
        type: "behavioral",
      },
    ],
    createdDate: "2024-02-01",
    lastModified: "2024-02-05",
    usageCount: 8,
    isStarred: true,
  },
]

export default function TemplatesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)

  const filteredTemplates = mockTemplates.filter((template) => {
    const matchesSearch =
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || template.category.toLowerCase() === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-chart-3/10 text-chart-3"
      case "intermediate":
        return "bg-accent/10 text-accent"
      case "advanced":
        return "bg-destructive/10 text-destructive"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/company/dashboard" className="flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-secondary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Interview Templates</span>
            </div>
          </div>
          <Link href="/company/templates/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </Link>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input border-border"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48 bg-input border-border">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="border-border hover:shadow-lg transition-shadow group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <CardTitle className="text-lg text-balance">{template.title}</CardTitle>
                        {template.isStarred && <Star className="w-4 h-4 text-chart-3 fill-current" />}
                      </div>
                      <CardDescription className="text-pretty">{template.description}</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Template Metadata */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{template.category}</Badge>
                      <Badge variant="outline" className={getDifficultyColor(template.difficulty)}>
                        {template.difficulty}
                      </Badge>
                    </div>

                    {/* Template Stats */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{template.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FileText className="w-4 h-4" />
                          <span>{template.questions.length} questions</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{template.usageCount} uses</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="text-xs text-muted-foreground">
                        Modified {new Date(template.lastModified).toLocaleDateString()}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedTemplate(template)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>{selectedTemplate?.title}</DialogTitle>
                              <DialogDescription>{selectedTemplate?.description}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="flex items-center space-x-4">
                                <Badge variant="outline">{selectedTemplate?.category}</Badge>
                                <Badge
                                  variant="outline"
                                  className={getDifficultyColor(selectedTemplate?.difficulty || "")}
                                >
                                  {selectedTemplate?.difficulty}
                                </Badge>
                                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                  <Clock className="w-4 h-4" />
                                  <span>{selectedTemplate?.duration}</span>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <h4 className="font-medium text-foreground">Interview Questions</h4>
                                {selectedTemplate?.questions.map((q: any, index: number) => (
                                  <div key={q.id} className="p-4 bg-muted/30 rounded-lg">
                                    <div className="flex items-start justify-between mb-2">
                                      <span className="text-sm font-medium text-accent">Question {index + 1}</span>
                                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                        <Badge variant="outline" className="text-xs">
                                          {q.type}
                                        </Badge>
                                        <span>{q.timeLimit} min</span>
                                      </div>
                                    </div>
                                    <p className="text-sm text-foreground">{q.question}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline">
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicate
                              </Button>
                              <Link href={`/company/templates/${selectedTemplate?.id}/edit`}>
                                <Button>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Template
                                </Button>
                              </Link>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Link href={`/company/templates/${template.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No templates found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCategory !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Create your first interview template to get started"}
              </p>
              <Link href="/company/templates/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
