import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, UserCheck, Camera } from "lucide-react"

interface WelcomeStepProps {
  candidateName: string
  candidateEmail: string
  templateTitle: string
  templateDescription: string
  questionsCount: number
  totalDuration: number
  onStartInterview: () => void
}

export default function WelcomeStep({
  candidateName,
  candidateEmail,
  templateTitle,
  templateDescription,
  questionsCount,
  totalDuration,
  onStartInterview
}: WelcomeStepProps) {
  return (
    <div className="text-center space-y-8 animate-fade-in">
      <div className="space-y-4">
        <h1 className="text-5xl font-bold gradient-text text-balance mb-4">
          Welcome to Your Interview, {candidateName}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
          You've been invited to complete a {templateTitle} with {candidateEmail}.
        </p>
      </div>

      <Card className="border-border/50 max-w-2xl mx-auto shadow-2xl hover:shadow-primary/10 transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-card to-card/50 rounded-t-lg">
          <CardTitle className="text-2xl text-foreground">{templateTitle}</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            {templateDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-8">
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
              <div className="w-16 h-16 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                <UserCheck className="w-8 h-8 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{questionsCount}</p>
                <p className="text-sm text-muted-foreground">Questions to complete</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="w-16 h-16 bg-gradient-to-br from-chart-3/20 to-accent/20 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                <Camera className="w-8 h-8 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">Video</p>
                <p className="text-sm text-muted-foreground">Recorded responses</p>
              </div>
            </div>
          </div>

          <div className="bg-card/30 rounded-xl p-6 border border-border/30">
            <h4 className="font-semibold text-foreground mb-3 flex items-center">
              <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center mr-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
              </div>
              What to expect:
            </h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                You'll be asked to enable your camera and microphone
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Questions will be presented one at a time
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Each question has a time limit for your response
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                You can pause and resume recording as needed
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Your responses will be recorded for review
              </li>
            </ul>
          </div>

          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-primary/25 transition-all duration-300"
            onClick={onStartInterview}
          >
            Start Interview
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}