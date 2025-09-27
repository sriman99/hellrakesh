import { Card, CardContent } from "@/components/ui/card"
import { UserCheck } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Humaneq HR</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full animate-pulse mx-auto" />
            <div className="space-y-2">
              <div className="h-8 bg-muted rounded animate-pulse mx-auto w-3/4" />
              <div className="h-4 bg-muted rounded animate-pulse mx-auto w-1/2" />
            </div>
          </div>

          <Card className="border-border">
            <CardContent className="p-8 space-y-4">
              <div className="h-6 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
              <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
            </CardContent>
          </Card>

          <p className="text-muted-foreground">Loading your interview...</p>
        </div>
      </div>
    </div>
  )
}
