import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Building2,
  Shield,
  Zap,
  BarChart3,
  Sparkles,
  Brain,
  Target,
  Star,
  CheckCircle,
  ArrowRight,
  Play,
  Award,
  TrendingUp,
  UserCheck,
  MessageSquare,
  Video,
  Mic,
  ChevronRight,
  Quote,
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="glass-enterprise sticky top-0 z-50 border-b border-border/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-enterprise-gradient rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold gradient-text-enterprise">HumaneQ HR</span>
                <div className="text-xs text-muted-foreground">Enterprise AI Platform</div>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/features" className="text-muted-foreground hover:text-primary transition-colors">
                Features
              </Link>
              <Link href="/pricing" className="text-muted-foreground hover:text-primary transition-colors">
                Pricing
              </Link>
              <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/admin/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-enterprise hover:border-primary/50 transition-all duration-300 bg-transparent"
                >
                  Admin Login
                </Button>
              </Link>
              <Link href="/student/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-emerald-500/50 hover:border-emerald-400/70 transition-all duration-300 bg-transparent text-emerald-400 hover:text-emerald-300"
                >
                  Student Login
                </Button>
              </Link>
              <Link href="/company/login">
                <Button size="sm" className="btn-enterprise">
                  Company Login
                </Button>
              </Link>
              <Link href="/company/signup">
                <Button variant="secondary" size="sm" className="hover:bg-secondary/90 transition-all duration-300">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />

        <div className="container mx-auto max-w-7xl relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left animate-fade-in">
              <Badge
                variant="secondary"
                className="mb-6 px-4 py-2 text-sm font-medium bg-primary/10 border border-primary/20 text-primary"
              >
                <Award className="w-4 h-4 mr-2" />
                #1 AI Interview Platform - G2 Leader 2024
              </Badge>
              <h1 className="text-5xl md:text-6xl font-black text-foreground mb-6 text-balance leading-tight">
                The Future of <span className="gradient-text-enterprise">Intelligent</span> Hiring
              </h1>
              <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl leading-relaxed">
                Transform your recruitment with enterprise-grade AI that evaluates candidates 10x faster while
                delivering exceptional candidate experiences.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/company/signup">
                  <Button size="lg" className="w-full sm:w-auto px-8 py-4 text-lg btn-enterprise">
                    <Target className="w-5 h-5 mr-2" />
                    Start Free Trial
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto px-8 py-4 text-lg border-enterprise hover:bg-primary/5 bg-transparent"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Watch Demo
                  </Button>
                </Link>
              </div>
              <div className="flex items-center space-x-6 text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm">No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm">Setup in 5 minutes</span>
                </div>
              </div>
            </div>

            <div className="relative animate-slide-up">
              <div className="glass-enterprise rounded-3xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <img src="/professional-woman-headshot.png" alt="Sarah Chen" className="w-10 h-10 rounded-full" />
                    <div>
                      <div className="font-semibold text-foreground">Sarah Chen</div>
                      <div className="text-sm text-muted-foreground">VP Engineering, TechCorp</div>
                    </div>
                  </div>
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse" />
                    Live Interview
                  </Badge>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-card/50 rounded-xl border border-border/30">
                    <span className="text-muted-foreground">AI Confidence Score</span>
                    <span className="text-2xl font-bold text-primary">94%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-card/50 rounded-xl border border-border/30">
                    <span className="text-muted-foreground">Technical Skills</span>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-card/50 rounded-xl border border-border/30">
                    <span className="text-muted-foreground">Communication</span>
                    <span className="text-lg font-semibold text-chart-3">Excellent</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-gradient-to-br from-chart-3/5 via-accent/5 to-chart-4/5 relative overflow-hidden">
        <div className="container mx-auto max-w-7xl relative">
          <div className="text-center mb-16 animate-fade-in">
            <Badge
              variant="outline"
              className="mb-6 px-6 py-3 text-base font-medium border-chart-3/30 text-chart-3 bg-chart-3/10"
            >
              <Quote className="w-4 h-4 mr-2" />
              Customer Success Stories
            </Badge>
            <h2 className="text-4xl font-bold text-foreground mb-6 gradient-text-enterprise">
              What Industry Leaders Say
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Join 2,500+ companies that have revolutionized their hiring process with HumaneQ HR
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 stagger-animation">
            <Card className="testimonial-card-pro p-6">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <img src="/professional-woman-ceo.png" alt="Sarah Chen" className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <h4 className="text-lg font-bold text-foreground">Sarah Chen</h4>
                    <p className="text-sm text-muted-foreground">CEO, TechCorp</p>
                    <div className="flex mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <blockquote className="text-base text-muted-foreground leading-relaxed mb-4">
                  "HumaneQ HR transformed our technical hiring completely. We reduced time-to-hire by 75% while
                  improving candidate quality. The AI insights are incredibly accurate."
                </blockquote>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-chart-3">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    <span className="font-semibold text-sm">75% faster hiring</span>
                  </div>
                  <Badge className="bg-chart-3/20 text-chart-3 text-xs">Enterprise</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="testimonial-card-pro p-6">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <img
                    src="/professional-cto-headshot.png"
                    alt="Marcus Rodriguez"
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="text-lg font-bold text-foreground">Marcus Rodriguez</h4>
                    <p className="text-sm text-muted-foreground">CTO, StartupX</p>
                    <div className="flex mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <blockquote className="text-base text-muted-foreground leading-relaxed mb-4">
                  "The candidate experience is phenomenal. Our offer acceptance rate increased by 60% since switching.
                  The platform feels modern and professional."
                </blockquote>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-chart-4">
                    <UserCheck className="w-4 h-4 mr-2" />
                    <span className="font-semibold text-sm">60% higher acceptance</span>
                  </div>
                  <Badge className="bg-chart-4/20 text-chart-4 text-xs">Growth</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="testimonial-card-pro p-6">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <img
                    src="/professional-chro-headshot.png"
                    alt="Aisha Patel"
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="text-lg font-bold text-foreground">Aisha Patel</h4>
                    <p className="text-sm text-muted-foreground">CHRO, GlobalTech</p>
                    <div className="flex mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <blockquote className="text-base text-muted-foreground leading-relaxed mb-4">
                  "The ROI was immediate. Within 30 days, we saw 400% improvement in hiring efficiency. The analytics
                  dashboard is a game-changer for data-driven decisions."
                </blockquote>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-chart-5">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    <span className="font-semibold text-sm">400% ROI improvement</span>
                  </div>
                  <Badge className="bg-chart-5/20 text-chart-5 text-xs">Fortune 500</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center animate-fade-in">
            <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-black gradient-text-enterprise mb-3">2,500+</div>
                <p className="text-base text-muted-foreground font-medium">Companies Trust Us</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black gradient-text-enterprise mb-3">250K+</div>
                <p className="text-base text-muted-foreground font-medium">Interviews Completed</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black gradient-text-enterprise mb-3">96.8%</div>
                <p className="text-base text-muted-foreground font-medium">Success Rate</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black gradient-text-enterprise mb-3">99.99%</div>
                <p className="text-base text-muted-foreground font-medium">Uptime SLA</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16 animate-fade-in">
            <Badge
              variant="outline"
              className="mb-6 px-6 py-3 text-base font-medium border-chart-4/30 text-chart-4 bg-chart-4/10"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Platform Features
            </Badge>
            <h2 className="text-4xl font-bold text-foreground mb-6 gradient-text-enterprise">
              Everything You Need for Modern Hiring
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our comprehensive AI-powered platform provides advanced tools for every stakeholder in the hiring process
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 stagger-animation">
            <Card className="card-hover border-chart-3/20 hover:border-chart-3/40 p-6">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-chart-3 to-chart-3/80 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-foreground mb-3">Admin Control Center</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Complete oversight with enterprise-grade analytics and management capabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-muted-foreground text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-chart-3 mr-3" />
                    Multi-tenant company management
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-chart-3 mr-3" />
                    Advanced quota allocation system
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-chart-3 mr-3" />
                    Real-time platform analytics
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-chart-3 mr-3" />
                    Enterprise security controls
                  </li>
                </ul>
                <Button className="w-full mt-6 bg-gradient-to-r from-chart-3 to-chart-3/90 hover:from-chart-3/90 hover:to-chart-3">
                  Explore Admin Features
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="card-hover border-chart-4/20 hover:border-chart-4/40 p-6">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-chart-4 to-chart-4/80 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-foreground mb-3">Company Portal</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Powerful recruitment tools with AI-driven insights and candidate management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-muted-foreground text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-chart-4 mr-3" />
                    Custom AI interview templates
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-chart-4 mr-3" />
                    Smart candidate link generation
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-chart-4 mr-3" />
                    Comprehensive results dashboard
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-chart-4 mr-3" />
                    Team collaboration tools
                  </li>
                </ul>
                <Button
                  variant="outline"
                  className="w-full mt-6 border-chart-4 text-chart-4 hover:bg-chart-4/10 bg-transparent"
                >
                  Explore Company Features
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="card-hover border-chart-5/20 hover:border-chart-5/40 p-6">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-chart-5 to-chart-5/80 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-foreground mb-3">Candidate Experience</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Seamless, professional interview process with modern interface design
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-muted-foreground text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-chart-5 mr-3" />
                    Zero-friction registration process
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-chart-5 mr-3" />
                    Modern, intuitive interface
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-chart-5 mr-3" />
                    Advanced media integration
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-chart-5 mr-3" />
                    Mobile-responsive design
                  </li>
                </ul>
                <Button
                  variant="outline"
                  className="w-full mt-6 border-chart-5 text-chart-5 hover:bg-chart-5/10 bg-transparent"
                >
                  Explore Candidate Features
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-gradient-to-br from-muted/50 to-card/30">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in">
              <Badge
                variant="outline"
                className="mb-6 px-5 py-2 text-base font-medium border-chart-5/30 text-chart-5 bg-chart-5/10"
              >
                <Brain className="w-4 h-4 mr-2" />
                AI-Powered Intelligence
              </Badge>
              <h2 className="text-3xl font-bold text-foreground mb-6 gradient-text-enterprise">
                Advanced AI That Understands Human Potential
              </h2>
              <p className="text-base text-muted-foreground mb-8 leading-relaxed">
                Our proprietary AI engine analyzes verbal and non-verbal cues, technical competency, and cultural fit to
                provide comprehensive candidate evaluations.
              </p>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-chart-5/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Video className="w-6 h-6 text-chart-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Video Analysis</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Advanced computer vision analyzes facial expressions, body language, and engagement levels during
                      interviews.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-chart-4/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mic className="w-6 h-6 text-chart-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Speech Recognition</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Natural language processing evaluates communication skills, technical knowledge, and response
                      quality.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-chart-3/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-6 h-6 text-chart-3" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Predictive Analytics</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Machine learning models predict job performance and cultural fit based on interview data.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative animate-slide-up">
              <div className="glass-enterprise rounded-3xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-xl font-semibold text-foreground">AI Analysis Dashboard</h4>
                  <Badge className="bg-chart-5/20 text-chart-5 border-chart-5/30">
                    <Brain className="w-3 h-3 mr-1" />
                    Live Analysis
                  </Badge>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-card/50 rounded-xl border border-border/30">
                    <div className="flex items-center space-x-3">
                      <img
                        src="/professional-candidate-headshot.jpg"
                        alt="Candidate"
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="font-semibold text-foreground text-sm">Technical Assessment</div>
                        <div className="text-xs text-muted-foreground">Software Engineer Role</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-chart-5">92%</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-card/30 rounded-lg border border-border/30">
                      <div className="text-xs text-muted-foreground mb-1">Communication</div>
                      <div className="text-base font-bold text-chart-3">Excellent</div>
                    </div>
                    <div className="p-3 bg-card/30 rounded-lg border border-border/30">
                      <div className="text-xs text-muted-foreground mb-1">Problem Solving</div>
                      <div className="text-base font-bold text-chart-4">Strong</div>
                    </div>
                  </div>
                  <div className="p-3 bg-chart-5/10 rounded-lg border border-chart-5/20">
                    <div className="flex items-center justify-between">
                      <span className="text-chart-5 font-semibold text-sm">Recommendation</span>
                      <CheckCircle className="w-4 h-4 text-chart-5" />
                    </div>
                    <p className="text-xs text-chart-5/80 mt-1">Strong candidate - proceed to final round</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-enterprise-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto max-w-7xl text-center relative animate-fade-in">
          <Badge
            variant="secondary"
            className="mb-6 px-6 py-3 text-base font-medium bg-white/20 border-white/30 text-white"
          >
            <Zap className="w-4 h-4 mr-2" />
            Ready to Transform Your Hiring?
          </Badge>
          <h2 className="text-4xl font-bold mb-6">Join the AI Revolution in Recruitment</h2>
          <p className="text-white/90 mb-12 max-w-3xl mx-auto text-lg leading-relaxed">
            Join 2,500+ companies already using HumaneQ HR to streamline their recruitment and find the best talent
            faster with enterprise-grade AI precision.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link href="/company/signup">
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto px-10 py-4 text-lg bg-white text-primary hover:bg-white/90"
              >
                <Target className="w-5 h-5 mr-2" />
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-10 py-4 text-lg border-white/30 text-white hover:bg-white/10 bg-transparent"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Contact Sales
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center space-x-8 text-white/70 text-base">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>2,500+ companies trust us</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>250,000+ interviews completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>99.99% uptime SLA</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-10 px-4 bg-card/50 border-t border-border/50">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-enterprise-gradient rounded-xl flex items-center justify-center shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold gradient-text-enterprise">HumaneQ HR</span>
                  <div className="text-sm text-muted-foreground">Enterprise AI Platform</div>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6 text-base">
                The future of corporate hiring, powered by artificial intelligence and designed for modern enterprise
                teams worldwide.
              </p>
              <div className="flex space-x-3">
                <Badge className="bg-chart-3/20 text-chart-3 text-xs">SOC 2 Compliant</Badge>
                <Badge className="bg-chart-4/20 text-chart-4 text-xs">GDPR Ready</Badge>
                <Badge className="bg-chart-5/20 text-chart-5 text-xs">ISO 27001</Badge>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-6 text-lg">Platform</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <Link href="/features" className="hover:text-primary transition-colors text-sm">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-primary transition-colors text-sm">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="hover:text-primary transition-colors text-sm">
                    Security
                  </Link>
                </li>
                <li>
                  <Link href="/integrations" className="hover:text-primary transition-colors text-sm">
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link href="/api" className="hover:text-primary transition-colors text-sm">
                    API
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-6 text-lg">Support</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <Link href="/docs" className="hover:text-primary transition-colors text-sm">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-primary transition-colors text-sm">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-primary transition-colors text-sm">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/status" className="hover:text-primary transition-colors text-sm">
                    System Status
                  </Link>
                </li>
                <li>
                  <Link href="/community" className="hover:text-primary transition-colors text-sm">
                    Community
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-6 text-lg">Company</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-primary transition-colors text-sm">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-primary transition-colors text-sm">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/press" className="hover:text-primary transition-colors text-sm">
                    Press
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-primary transition-colors text-sm">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-primary transition-colors text-sm">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 mt-10 pt-6 text-center">
            <p className="text-muted-foreground text-base">
              © 2024 HumaneQ HR. All rights reserved. Powered by Enterprise AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
