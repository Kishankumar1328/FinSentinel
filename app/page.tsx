'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, TrendingUp, Zap, Target, BarChart3 } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">FinSentinel</h1>
        </div>
        <div className="flex gap-3">
          <Link href="/auth/signin">
            <Button variant="outline">Sign In</Button>
          </Link>
          <Link href="/auth/signup">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center space-y-8">
        <div className="space-y-4">
          <h2 className="text-5xl md:text-6xl font-bold text-balance leading-tight">
            Take Control of Your Finances with AI
          </h2>
          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            FinSentinel combines intelligent expense tracking, voice entry, and AI-powered insights to help you manage money smarter
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/auth/signup">
            <Button size="lg" className="gap-2">
              Start Free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/auth/signin">
            <Button size="lg" variant="outline">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h3 className="text-3xl font-bold text-center mb-12">Powerful Features</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Zap className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Voice Entry</CardTitle>
              <CardDescription>
                Log expenses hands-free using natural language voice commands
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Smart Insights</CardTitle>
              <CardDescription>
                AI-powered analysis of your spending patterns and personalized recommendations
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Target className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Goal Tracking</CardTitle>
              <CardDescription>
                Set financial goals and monitor progress with intelligent deadline tracking
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Budget Management</CardTitle>
              <CardDescription>
                Create category budgets, track spending, and receive alerts when nearing limits
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="pt-8 space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Ready to manage your finances better?</h3>
              <p className="text-muted-foreground">
                Join thousands of users using FinSentinel to take control of their money
              </p>
            </div>
            <Link href="/auth/signup">
              <Button size="lg">Create Free Account</Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20 py-8 px-6 text-center text-sm text-muted-foreground">
        <p>FinSentinel © 2026. Your intelligent financial companion.</p>
      </footer>
    </main>
  );
}
