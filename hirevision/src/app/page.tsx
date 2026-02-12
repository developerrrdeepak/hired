'use client';

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, Briefcase, BrainCircuit, GraduationCap, ChevronRight, Sparkles, Zap, Target } from "lucide-react"
import Link from "next/link"
import { HireVisionLogo } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { LoginDialog } from "@/components/login-dialog";

function FeatureCard({ icon: Icon, title, description, gradient }: { icon: React.ElementType, title: string, description: string, gradient: string }) {
  return (
    <Card className="relative overflow-hidden group hover:-translate-y-2 transition-all duration-300 border-2 hover:shadow-2xl">
      <div className={`absolute inset-0 ${gradient} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
      <div className="relative flex flex-col items-center text-center p-8">
        <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${gradient} text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className="h-8 w-8" />
        </div>
        <CardTitle className="text-xl font-bold mb-3">{title}</CardTitle>
        <CardContent className="text-muted-foreground p-0 leading-relaxed">
          {description}
        </CardContent>
      </div>
    </Card>
  )
}

function LandingHeader() {
  return (
    <header className="sticky top-0 left-0 right-0 z-50 py-4 px-4 sm:px-6 lg:px-8 bg-background/95 backdrop-blur-md border-b shadow-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg group-hover:shadow-xl transition-all">
            <HireVisionLogo className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">HireVision</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LoginDialog />
          <div className="hidden sm:flex items-center gap-2">
            <Separator orientation="vertical" className="h-6 mx-1" />
            <Button asChild className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all">
              <Link href="/signup">For Employers <ChevronRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

const DYNAMIC_WORDS = ["Intelligent", "Efficient", "Collaborative", "Simplified", "Automated"];

export default function HomePage() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentWordIndex((prevIndex) => (prevIndex + 1) % DYNAMIC_WORDS.length);
        setIsFading(false);
      }, 500);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-background text-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative z-10">
        <LandingHeader />
        <main className="flex flex-col items-center justify-center text-center px-4">
          <section id="home" className="max-w-5xl py-24 sm:py-32">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">AI-Powered Recruitment Platform</span>
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl animate-in fade-in slide-in-from-top-8 duration-1000 mb-6">
              The Future of Hiring is{" "}
              <span className="relative inline-block">
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 blur-2xl opacity-30"></span>
                <span className={cn("relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent transition-opacity duration-500", isFading ? "opacity-0" : "opacity-100")}>
                  {DYNAMIC_WORDS[currentWordIndex]}
                </span>
              </span>
            </h1>

            <p className="mt-8 text-xl leading-8 text-muted-foreground max-w-3xl mx-auto animate-in fade-in slide-in-from-top-12 duration-1000 delay-200">
              Transform your hiring process with AI-powered tools. Find the best talent faster, streamline interviews, and empower candidates to succeed.
            </p>

            <div className="mt-12 flex items-center justify-center gap-4 animate-in fade-in slide-in-from-top-16 duration-1000 delay-400">
              <Button asChild size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                <Link href="/login">
                  Find Your Next Role
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl px-8 py-6 text-lg border-2 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-950/50 dark:hover:to-purple-950/50 transition-all">
                <Link href="/signup">
                  Start Hiring
                  <Zap className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </section>

          <section id="features" className="max-w-7xl w-full py-24 sm:py-32">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
                A Platform for Everyone
              </h2>
              <p className="text-lg text-muted-foreground">Whether you're sourcing talent or looking for your next role, HireVision has you covered.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={Briefcase}
                title="For Recruiters"
                description="Source, track, and manage candidates with powerful AI-driven tools that reduce time-to-hire."
                gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
              />
              <FeatureCard
                icon={BrainCircuit}
                title="For Hiring Managers"
                description="Get deep insights into candidate fit, review AI-summarized feedback, and make data-driven decisions."
                gradient="bg-gradient-to-br from-purple-500 to-pink-500"
              />
              <FeatureCard
                icon={GraduationCap}
                title="For Candidates"
                description="Prepare for interviews with AI coaching, get resume feedback, and find your dream job."
                gradient="bg-gradient-to-br from-emerald-500 to-teal-500"
              />
            </div>
          </section>

          <section id="how-it-works" className="max-w-6xl w-full py-24 sm:py-32">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
                How It Works
              </h2>
              <p className="text-lg text-muted-foreground">Get up and running in minutes.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="relative p-8 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 hover:shadow-xl transition-all group">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">1</div>
                <Target className="h-10 w-10 text-indigo-600 mb-4" />
                <p className="text-xl font-bold mb-3">Sign Up</p>
                <p className="text-muted-foreground">Create your account in seconds. No credit card required to get started.</p>
              </div>
              <div className="relative p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-2xl border-2 border-purple-200 dark:border-purple-800 hover:shadow-xl transition-all group">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">2</div>
                <Briefcase className="h-10 w-10 text-purple-600 mb-4" />
                <p className="text-xl font-bold mb-3">Post a Job</p>
                <p className="text-muted-foreground">Use our AI assistant to craft the perfect job description and define your ideal candidate.</p>
              </div>
              <div className="relative p-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 hover:shadow-xl transition-all group">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">3</div>
                <Zap className="h-10 w-10 text-emerald-600 mb-4" />
                <p className="text-xl font-bold mb-3">Hire Smart</p>
                <p className="text-muted-foreground">Watch as AI ranks candidates, summarizes profiles, and helps you make the best hiring decisions.</p>
              </div>
            </div>
          </section>

          <section id="faq" className="max-w-3xl w-full py-24 sm:py-32">
            <div className="max-w-2xl mx-auto text-center mb-12">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
                Frequently Asked Questions
              </h2>
            </div>
            <Accordion type="single" collapsible className="w-full text-left">
              <AccordionItem value="item-1">
                <AccordionTrigger>Is there a free trial available?</AccordionTrigger>
                <AccordionContent>
                  Yes, you can sign up for free to explore the core features of HireVision. Our free plan is generous and perfect for small teams.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>How does the AI ensure fairness?</AccordionTrigger>
                <AccordionContent>
                  Our AI models are trained to focus on skills, experience, and qualifications, actively ignoring demographic information to reduce unconscious bias in the screening process.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Can I integrate HireVision with my existing HR systems?</AccordionTrigger>
                <AccordionContent>
                  Integrations with popular HRIS and ATS platforms are on our roadmap. Contact us to discuss your specific needs.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>Is my data secure?</AccordionTrigger>
                <AccordionContent>
                  Absolutely. We use industry-leading encryption and security practices to ensure your organization's and candidates' data is always protected.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        </main>
        <footer className="py-12 text-center text-muted-foreground border-t bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
          <p className="text-sm">&copy; {new Date().getFullYear()} HireVision. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}


