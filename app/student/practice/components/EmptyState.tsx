import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

interface EmptyStateProps {
    onClearFilters: () => void
}

export default function EmptyState({ onClearFilters }: EmptyStateProps) {
    return (
        <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
            <CardContent className="pt-8 pb-8">
                <div className="text-center">
                    <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No templates found</h3>
                    <p className="text-slate-400 mb-4">
                        Try adjusting your search criteria or browse all available templates.
                    </p>
                    <Button
                        onClick={onClearFilters}
                        variant="outline"
                        className="border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                        Clear Filters
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}