"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Check, Crown, Zap, Rocket } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: 39,
    icon: Zap,
    color: "blue",
    description: "Perfect for beginners"
  },
  {
    id: "pro",
    name: "Pro Trader",
    price: 119,
    icon: Crown,
    color: "purple",
    description: "Most popular for serious traders",
    popular: true
  },
  {
    id: "elite",
    name: "Elite",
    price: 319,
    icon: Rocket,
    color: "gold",
    description: "For institutional traders"
  }
]

function RegisterForm() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [country, setCountry] = useState("")
  const [selectedPlan, setSelectedPlan] = useState("pro") // Default to Pro
  const [billingCycle, setBillingCycle] = useState("monthly")
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [wantsNewsletter, setWantsNewsletter] = useState(true)

  // UI state
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPlanDetails, setShowPlanDetails] = useState(true)

  // Get plan from URL if coming from pricing page
  useEffect(() => {
    const planFromUrl = searchParams.get('plan')
    if (planFromUrl && plans.find(p => p.id === planFromUrl)) {
      setSelectedPlan(planFromUrl)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      setIsLoading(false)
      return
    }

    if (!agreeToTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          country,
          selectedPlan,
          billingCycle,
          wantsNewsletter
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Something went wrong")
      } else {
        // Redirect to checkout or dashboard based on plan
        if (selectedPlan !== "free") {
          // Redirect to Stripe checkout
          router.push(`/checkout?plan=${selectedPlan}&cycle=${billingCycle}`)
        } else {
          router.push("/login?message=Registration successful! Please sign in.")
        }
      }
    } catch (error) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const selectedPlanDetails = plans.find(p => p.id === selectedPlan)
  const PlanIcon = selectedPlanDetails?.icon || Zap
  const finalPrice = billingCycle === "annual" && selectedPlanDetails
    ? Math.round(selectedPlanDetails.price * 12 * 0.8) // 20% discount
    : selectedPlanDetails?.price || 0

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 py-12">
      <Card className="w-full max-w-4xl shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Create Your Account
          </CardTitle>
          <CardDescription className="text-base">
            Join thousands of successful traders using Brain AiPro
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Plan Selection */}
            <div className="space-y-4 p-6 bg-slate-50 dark:bg-slate-900 rounded-lg border-2 border-purple-200 dark:border-purple-900">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Select Your Plan</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPlanDetails(!showPlanDetails)}
                >
                  {showPlanDetails ? "Hide" : "Show"} Details
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => {
                  const Icon = plan.icon
                  const isSelected = selectedPlan === plan.id
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`relative cursor-pointer p-4 rounded-lg border-2 transition-all ${isSelected
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/20 shadow-lg scale-105'
                        : 'border-slate-200 dark:border-slate-700 hover:border-purple-400'
                        }`}
                    >
                      {plan.popular && (
                        <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-blue-600">
                          Popular
                        </Badge>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`h-5 w-5 text-${plan.color}-500`} />
                        <h3 className="font-bold">{plan.name}</h3>
                      </div>
                      <p className="text-2xl font-bold mb-1">
                        ${plan.price}
                        <span className="text-sm font-normal text-muted-foreground">/mo</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{plan.description}</p>
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <Check className="h-5 w-5 text-purple-600" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Billing Cycle */}
              <div className="flex items-center justify-center gap-4 pt-4">
                <Button
                  type="button"
                  variant={billingCycle === "monthly" ? "default" : "outline"}
                  onClick={() => setBillingCycle("monthly")}
                  className="flex-1"
                >
                  Monthly
                </Button>
                <Button
                  type="button"
                  variant={billingCycle === "annual" ? "default" : "outline"}
                  onClick={() => setBillingCycle("annual")}
                  className="flex-1 relative"
                >
                  Annual
                  <Badge className="absolute -top-2 -right-2 bg-green-600">Save 20%</Badge>
                </Button>
              </div>

              {showPlanDetails && selectedPlanDetails && (
                <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Your Selection:</span>
                    <span className="text-2xl font-bold text-purple-600">
                      ${billingCycle === "annual" ? finalPrice : selectedPlanDetails.price}
                      <span className="text-sm font-normal text-muted-foreground">
                        /{billingCycle === "annual" ? "year" : "month"}
                      </span>
                    </span>
                  </div>
                  {billingCycle === "annual" && (
                    <p className="text-sm text-green-600 font-medium">
                      You save ${Math.round(selectedPlanDetails.price * 12 * 0.2)} per year!
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Select value={country} onValueChange={setCountry} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="GB">United Kingdom</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="AU">Australia</SelectItem>
                    <SelectItem value="DE">Germany</SelectItem>
                    <SelectItem value="FR">France</SelectItem>
                    <SelectItem value="NG">Nigeria</SelectItem>
                    <SelectItem value="ZA">South Africa</SelectItem>
                    <SelectItem value="IN">India</SelectItem>
                    <SelectItem value="SG">Singapore</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
            </div>

            {/* Terms and Newsletter */}
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                  required
                />
                <label
                  htmlFor="terms"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the{" "}
                  <Link href="/legal/terms" className="text-primary hover:underline" target="_blank">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/legal/privacy" className="text-primary hover:underline" target="_blank">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="newsletter"
                  checked={wantsNewsletter}
                  onCheckedChange={(checked) => setWantsNewsletter(checked as boolean)}
                />
                <label
                  htmlFor="newsletter"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Send me trading tips, market insights, and special offers
                </label>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {isLoading ? "Creating Account..." : "Create Account & Continue"}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
              <p className="text-xs text-muted-foreground">
                🔒 Secure payment • 7-day free trial • Cancel anytime
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}