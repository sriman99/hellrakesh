"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Plus, Trash2, Save, Eye, Clock, FileText, AlertCircle, GripVertical } from "lucide-react"
import Link from "next/link"

interface Question {
  id: string
  question: string
  timeLimit: number
  type: string
  required: boolean
}

export default function CreateTemplatePage() {
  const [template, setTemplate] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "",
    estimatedDuration: "",
  })

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      question: "",
      timeLimit: 5,
      type: "open-ended",
      required: true,
    },
  ])

  const [isPreviewMode, setIsPreviewMode] = useState(false)

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: "",
      timeLimit: 5,
      type: "open-ended",
      required: true,
    }
    setQuestions([...questions, newQuestion])
  }

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)))
  }

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id))
    }
  }

  const moveQuestion = (id: string, direction: "up" | "down") => {
    const index = questions.findIndex((q) => q.id === id)
    if ((direction === "up" && index > 0) || (direction === "down" && index < questions.length - 1)) {
      const newQuestions = [...questions]
      const targetIndex = direction === "up" ? index - 1 : index + 1
      ;[newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]]
      setQuestions(newQuestions)
    }
  }

  const getTotalDuration = () => {
    return questions.reduce((total, q) => total + q.timeLimit, 0)
  }

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case "technical":
        return "bg-accent/10 text-accent"
      case "behavioral":
        return "bg-chart-3/10 text-chart-3"
      case "system-design":
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
            <Link href="/company/templates" className="flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Templates
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-secondary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Create Template</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => setIsPreviewMode(!isPreviewMode)} className="bg-transparent">
              <Eye className="w-4 h-4 mr-2" />
              {isPreviewMode ? "Edit" : "Preview"}
            </Button>
            <Button>
              <Save className="w-4 h-4 mr-2" />
              Save Template
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {!isPreviewMode ? (
            /* Edit Mode */
            <div className="space-y-8">
              {/* Template Details */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Template Information</CardTitle>
                  <CardDescription>Basic details about your interview template</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Template Title *</Label>
                      <Input
                        id="title"
                        value={template.title}
                        onChange={(e) => setTemplate({ ...template, title: e.target.value })}
                        placeholder="e.g., Frontend Developer Interview"
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={template.category}
                        onValueChange={(value) => setTemplate({ ...template, category: value })}
                      >
                        <SelectTrigger className="bg-input border-border">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="engineering">Engineering</SelectItem>
                          <SelectItem value="product">Product</SelectItem>
                          <SelectItem value="design">Design</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="operations">Operations</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={template.description}
                      onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                      placeholder="Brief description of what this template assesses"
                      className="bg-input border-border"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty Level</Label>
                      <Select
                        value={template.difficulty}
                        onValueChange={(value) => setTemplate({ ...template, difficulty: value })}
                      >
                        <SelectTrigger className="bg-input border-border">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Estimated Duration</Label>
                      <div className="flex items-center space-x-2 p-3 bg-muted/30 rounded-lg">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{getTotalDuration()} minutes</span>
                        <span className="text-xs text-muted-foreground">(calculated from questions)</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Questions */}
              <Card className="border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Interview Questions</CardTitle>
                      <CardDescription>Add questions that candidates will answer during the interview</CardDescription>
                    </div>
                    <Button onClick={addQuestion} variant="outline" className="bg-transparent">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {questions.map((question, index) => (
                    <div key={question.id} className="p-4 border border-border rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                          <span className="font-medium text-sm">Question {index + 1}</span>
                          {question.required && (
                            <Badge variant="outline" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveQuestion(question.id, "up")}
                            disabled={index === 0}
                          >
                            ↑
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveQuestion(question.id, "down")}
                            disabled={index === questions.length - 1}
                          >
                            ↓
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQuestion(question.id)}
                            disabled={questions.length === 1}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Question Text *</Label>
                          <Textarea
                            value={question.question}
                            onChange={(e) => updateQuestion(question.id, "question", e.target.value)}
                            placeholder="Enter your interview question..."
                            className="bg-input border-border"
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Question Type</Label>
                            <Select
                              value={question.type}
                              onValueChange={(value) => updateQuestion(question.id, "type", value)}
                            >
                              <SelectTrigger className="bg-input border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open-ended">Open-ended</SelectItem>
                                <SelectItem value="technical">Technical</SelectItem>
                                <SelectItem value="behavioral">Behavioral</SelectItem>
                                <SelectItem value="system-design">System Design</SelectItem>
                                <SelectItem value="analytical">Analytical</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Time Limit (minutes)</Label>
                            <Input
                              type="number"
                              value={question.timeLimit}
                              onChange={(e) =>
                                updateQuestion(question.id, "timeLimit", Number.parseInt(e.target.value) || 5)
                              }
                              min="1"
                              max="30"
                              className="bg-input border-border"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Required Question</Label>
                            <div className="flex items-center space-x-2 pt-2">
                              <Switch
                                checked={question.required}
                                onCheckedChange={(checked) => updateQuestion(question.id, "required", checked)}
                              />
                              <span className="text-sm text-muted-foreground">
                                {question.required ? "Required" : "Optional"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {questions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                      <p>Add at least one question to create your template</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Preview Mode */
            <div className="space-y-6">
              <Card className="border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">{template.title || "Untitled Template"}</CardTitle>
                      <CardDescription className="text-base mt-2">
                        {template.description || "No description provided"}
                      </CardDescription>
                    </div>
                    <div className="text-right space-y-2">
                      {template.category && <Badge variant="outline">{template.category}</Badge>}
                      {template.difficulty && (
                        <Badge variant="outline" className="ml-2">
                          {template.difficulty}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{getTotalDuration()} minutes total</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FileText className="w-4 h-4" />
                      <span>{questions.length} questions</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Interview Questions</h3>
                {questions.map((question, index) => (
                  <Card key={question.id} className="border-border">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-sm font-medium text-accent">Question {index + 1}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={getQuestionTypeColor(question.type)}>
                            {question.type}
                          </Badge>
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{question.timeLimit} min</span>
                          </div>
                          {question.required && (
                            <Badge variant="outline" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-foreground">{question.question || "Question text not provided"}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
