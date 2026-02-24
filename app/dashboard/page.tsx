'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Wallet, Target, Plus } from 'lucide-react';
import Link from 'next/link';

const demoData = {
  totalIncome: 5000,
  totalExpenses: 2150,
  balance: 2850,
  expenses: [
    { category: 'Food', amount: 650, percentage: 30 },
    { category: 'Transport', amount: 350, percentage: 16 },
    { category: 'Entertainment', amount: 400, percentage: 19 },
    { category: 'Utilities', amount: 350, percentage: 16 },
    { category: 'Other', amount: 400, percentage: 19 },
  ],
  goals: [
    { name: 'Emergency Fund', progress: 65, target: 10000, current: 6500 },
    { name: 'Vacation', progress: 45, target: 5000, current: 2250 },
  ],
  budgets: [
    { category: 'Food', spent: 650, limit: 800, percentage: 81 },
    { category: 'Transport', spent: 350, limit: 400, percentage: 88 },
    { category: 'Entertainment', spent: 400, limit: 500, percentage: 80 },
  ],
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to FinSentinel! This is demo data to showcase the app.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${demoData.totalIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${demoData.totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${demoData.balance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Available this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Expense Breakdown
            </CardTitle>
            <CardDescription>Category distribution of your expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {demoData.expenses.map((exp) => (
                <div key={exp.category} className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">{exp.category}</span>
                    <span className="text-muted-foreground">${exp.amount}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${exp.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Financial Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Goals Progress
            </CardTitle>
            <CardDescription>Track your financial goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {demoData.goals.map((goal) => (
                <div key={goal.name} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">{goal.name}</span>
                    <span className="text-xs text-muted-foreground">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-accent"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Budget Status
          </CardTitle>
          <CardDescription>Monitor your spending against budget limits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {demoData.budgets.map((budget) => (
              <div key={budget.category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{budget.category}</span>
                  <span className={budget.percentage >= 100 ? 'text-destructive' : 'text-foreground'}>
                    ${budget.spent} / ${budget.limit}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      budget.percentage >= 100
                        ? 'bg-destructive'
                        : budget.percentage >= 80
                          ? 'bg-yellow-500'
                          : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/expenses">
          <Button className="w-full gap-2" variant="outline">
            <Plus className="w-4 h-4" />
            Add Expense
          </Button>
        </Link>
        <Link href="/dashboard/voice-entry">
          <Button className="w-full gap-2" variant="outline">
            <Plus className="w-4 h-4" />
            Voice Entry
          </Button>
        </Link>
        <Link href="/dashboard/insights">
          <Button className="w-full gap-2" variant="outline">
            <TrendingUp className="w-4 h-4" />
            View Insights
          </Button>
        </Link>
      </div>
    </div>
  );
}
