import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = getDb();
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    // Run core queries in parallel for speed
    const [expenseResult, incomeResult, categoryExpenses, budgets, upcomingGoals] = await Promise.all([
      db.prepare(`SELECT SUM(amount) as total FROM expenses WHERE user_id = ? AND date >= ?`)
        .get(user.id, thirtyDaysAgo) as Promise<any>,
      db.prepare(`SELECT SUM(amount) as total FROM income WHERE user_id = ? AND date >= ?`)
        .get(user.id, thirtyDaysAgo) as Promise<any>,
      db.prepare(`
        SELECT category, SUM(amount) as amount, COUNT(*) as count
        FROM expenses WHERE user_id = ? AND date >= ?
        GROUP BY category ORDER BY amount DESC LIMIT 5
      `).all(user.id, thirtyDaysAgo) as Promise<any[]>,
      db.prepare(`
        SELECT id, category, limit_amount, alert_threshold
        FROM budgets WHERE user_id = ? ORDER BY created_at DESC
      `).all(user.id) as Promise<any[]>,
      db.prepare(`
        SELECT * FROM goals
        WHERE user_id = ? AND status = 'active' AND deadline > ?
        ORDER BY deadline ASC LIMIT 5
      `).all(user.id, now) as Promise<any[]>,
    ]);

    const totalExpenses = (expenseResult as any)?.total || 0;
    const totalIncome = (incomeResult as any)?.total || 0;

    const topExpenseCategories = (categoryExpenses as any[]).map((cat: any) => ({
      category: cat.category,
      amount: cat.amount,
    }));

    // Calculate live spent per budget (parallel)
    const budgetStatus = await Promise.all(
      (budgets as any[]).map(async (budget: any) => {
        const spentResult = await db.prepare(`
          SELECT COALESCE(SUM(amount), 0) as spent
          FROM expenses
          WHERE user_id = ? AND LOWER(category) = LOWER(?) AND date >= ?
        `).get(user.id, budget.category, thirtyDaysAgo) as any;
        return {
          category: budget.category,
          spent: spentResult?.spent || 0,
          limit: budget.limit_amount,
          threshold: budget.alert_threshold,
        };
      })
    );

    // Financial Health Score
    const savingsRatio = totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome : 0;
    const savingsScore = Math.min(Math.max(savingsRatio * 100, 0), 100);

    const budgetsCount = budgetStatus.length;
    const cleanBudgets = budgetStatus.filter((b: any) => b.spent <= b.limit).length;
    const budgetScore = budgetsCount > 0 ? (cleanBudgets / budgetsCount) * 100 : 80;

    const avgGoalProgress = (upcomingGoals as any[]).length > 0
      ? (upcomingGoals as any[]).reduce((sum: number, g: any) => sum + (g.current_amount / g.target_amount), 0) / (upcomingGoals as any[]).length
      : 0.5;
    const goalScore = avgGoalProgress * 100;

    const healthScore = Math.round((savingsScore * 0.4) + (budgetScore * 0.3) + (goalScore * 0.3));

    const alertingBudget = budgetStatus.find((b: any) => b.spent > b.limit);
    const primaryInsight = alertingBudget
      ? { title: 'Budget Alert Detected', description: `You have exceeded your ${alertingBudget.category} budget limit.`, severity: 'warning' }
      : savingsRatio > 0.2
        ? { title: 'Wealth Growth Positive', description: 'Your savings rate is above 20% this month. Good job building security!', severity: 'success' }
        : { title: 'Steady Progress', description: 'Continue tracking your expenses to build long-term wealth.', severity: 'info' };

    return NextResponse.json({
      success: true,
      data: {
        healthScore,
        primaryInsight,
        summary: {
          totalExpenses,
          totalIncome,
          balance: totalIncome - totalExpenses,
          period: 'last_30_days',
        },
        topExpenseCategories,
        budgetStatus,
        upcomingGoals: (upcomingGoals as any[]).map((goal: any) => ({
          id: goal.id,
          title: goal.title,
          target_amount: goal.target_amount,
          current_amount: goal.current_amount,
          deadline: goal.deadline,
          progress: Math.round((goal.current_amount / goal.target_amount) * 100),
        })),
      },
    });
  } catch (error) {
    console.error('[v0] Dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
