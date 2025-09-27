import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, UserCheck, Brain, MessageSquare, Mic, BarChart3, TrendingUp } from "lucide-react"

interface CompletionStepProps {
  completionData: any
  loadingResults: boolean
  questionsCount: number
  totalDuration: number
  companyName: string
}

export default function CompletionStep({ 
  completionData, 
  loadingResults, 
  questionsCount, 
  totalDuration, 
  companyName 
}: CompletionStepProps) {
  if (loadingResults) {
    return (
      <div className="text-center space-y-8 animate-fade-in">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold gradient-text">Processing Your Interview...</h1>
          <p className="text-xl text-muted-foreground">
            Our AI is analyzing your responses. This may take a few moments.
          </p>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  // Extract detailed metrics from completion data
  const finalScore = completionData?.finalScore?.score
  const localMetrics = completionData?.analysis?.localMetrics
  const aiMetrics = completionData?.analysis?.aiMetrics
  const interpretation = completionData?.finalScore?.interpretation

  const hasDetailedAnalysis = finalScore !== undefined && localMetrics && aiMetrics

  return (
    <div className="text-center space-y-8 animate-fade-in">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold gradient-text">Interview Complete!</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Thank you for completing your interview. Your responses have been submitted successfully.
        </p>
      </div>

      {hasDetailedAnalysis ? (
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Overall Score Card */}
          <Card className="border-border/50 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-card to-card/50 rounded-t-lg">
              <CardTitle className="text-2xl text-foreground flex items-center justify-center">
                <CheckCircle className="w-8 h-8 mr-3 text-green-500" />
                Interview Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <span className="text-3xl font-bold text-white">
                    {finalScore}%
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Overall Score</h3>
                  <p className="text-muted-foreground">Based on AI analysis of your responses</p>
                  {interpretation && (
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                      interpretation === 'Hire' ? 'bg-green-100 text-green-800' :
                      interpretation === 'Maybe' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      Recommendation: {interpretation}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-chart-3/20 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                    <Clock className="w-8 h-8 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{totalDuration} min</p>
                    <p className="text-sm text-muted-foreground">Total duration</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-secondary/20 to-chart-3/20 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                    <CheckCircle className="w-8 h-8 text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{questionsCount}</p>
                    <p className="text-sm text-muted-foreground">Questions completed</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-secondary/20 to-chart-3/20 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                    <UserCheck className="w-8 h-8 text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">Recorded</p>
                    <p className="text-sm text-muted-foreground">All responses</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Local Metrics */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-foreground">{localMetrics.avgWords}</div>
                    <div className="text-sm text-muted-foreground">Avg Words</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-foreground">{localMetrics.vocabRichness}</div>
                    <div className="text-sm text-muted-foreground">Vocab Richness</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-foreground">{localMetrics.clarity}</div>
                    <div className="text-sm text-muted-foreground">Clarity</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-foreground">{localMetrics.avgLatency}</div>
                    <div className="text-sm text-muted-foreground">Response Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Metrics */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-500" />
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Correctness</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-muted rounded-full">
                        <div 
                          className="h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                          style={{ width: `${(aiMetrics.correctness / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{aiMetrics.correctness}/10</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Relevance</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-muted rounded-full">
                        <div 
                          className="h-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                          style={{ width: `${(aiMetrics.relevance / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{aiMetrics.relevance}/10</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Completeness</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-muted rounded-full">
                        <div 
                          className="h-2 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"
                          style={{ width: `${(aiMetrics.completeness / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{aiMetrics.completeness}/10</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Confidence</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-muted rounded-full">
                        <div 
                          className="h-2 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"
                          style={{ width: `${(aiMetrics.confidence / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{aiMetrics.confidence}/10</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Professionalism</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-muted rounded-full">
                        <div 
                          className="h-2 bg-gradient-to-r from-red-400 to-red-600 rounded-full"
                          style={{ width: `${(aiMetrics.professionalism / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{aiMetrics.professionalism}/10</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* What happens next */}
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="bg-card/30 rounded-xl p-6 border border-border/30">
                <h4 className="font-semibold text-foreground mb-3 flex items-center">
                  <div className="w-5 h-5 bg-chart-3/20 rounded-full flex items-center justify-center mr-2">
                    <div className="w-2 h-2 bg-chart-3 rounded-full" />
                  </div>
                  What happens next?
                </h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start">
                    <span className="text-chart-3 mr-2">•</span>
                    Your responses will be reviewed by the {companyName} team
                  </li>
                  <li className="flex items-start">
                    <span className="text-chart-3 mr-2">•</span>
                    You'll be contacted directly regarding next steps
                  </li>
                  <li className="flex items-start">
                    <span className="text-chart-3 mr-2">•</span>
                    This interview link is now inactive
                  </li>
                </ul>
              </div>
              <div className="text-center mt-6">
                <p className="text-sm text-muted-foreground">
                  You can now safely close this window. Thank you for your time!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-border max-w-2xl mx-auto">
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-chart-3/10 rounded-lg flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6 text-chart-3" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{questionsCount}</p>
                  <p className="text-sm text-muted-foreground">Questions completed</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{totalDuration} min</p>
                  <p className="text-sm text-muted-foreground">Total duration</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto">
                  <UserCheck className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Recorded</p>
                  <p className="text-sm text-muted-foreground">All responses</p>
                </div>
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2">What happens next?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Your responses will be reviewed by the {companyName} team</li>
                <li>• You'll be contacted directly regarding next steps</li>
                <li>• This interview link is now inactive</li>
              </ul>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                You can now safely close this window. Thank you for your time!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}