import { Badge } from "@/components/ui/badge"
import { UserCheck } from "lucide-react"

interface InterviewHeaderProps {
  candidateName: string
}

export default function InterviewHeader({ candidateName }: InterviewHeaderProps) {
  return (
    <header className="glass-effect sticky top-0 z-50 border-b border-border/30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
              <UserCheck className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-xl font-bold gradient-text">HumaneQ HR</span>
              <p className="text-xs text-muted-foreground">AI Interview Platform</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            {candidateName}
          </Badge>
        </div>
      </div>
    </header>
  )
}