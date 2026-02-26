import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUser } from '@/lib/auth';
import { initializeDbAsync, executeQuery, executeInsert } from '@/lib/db';
import { ExpenseSchema, ExpenseQuerySchema } from '@/lib/schemas';
import { RowDataPacket } from 'mysql2/promise';

interface ExpenseRow extends RowDataPacket {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  description: string | null;
  date: string;
  created_at: Date;
  updated_at: Date;
}

interface CountRow extends RowDataPacket {
  count: number;
}

export async function POST(request: NextRequest) {
  try {
    await initializeDbAsync();
    const user = getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = ExpenseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { category, amount, description, date, payment_method, tags, mood, is_donation } = validation.data;
    const now = new Date();
    const expenseId = uuidv4();

    await executeInsert(
      `
      INSERT INTO expenses (id, user_id, category, amount, description, date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [expenseId, user.id, category, amount, description || null, date, now, now]
    );

    const expenses = await executeQuery<ExpenseRow[]>('SELECT * FROM expenses WHERE id = ?', [expenseId]);
    const expense = expenses[0];

    return NextResponse.json(
      {
        success: true,
        data: expense,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[v0] Create expense error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await initializeDbAsync();
    const user = getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryData = {
      startDate: searchParams.get('startDate') ? parseInt(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? parseInt(searchParams.get('endDate')!) : undefined,
      category: searchParams.get('category') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    };

    const validation = ExpenseQuerySchema.safeParse(queryData);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { startDate, endDate, category, page, limit } = validation.data;

    // Build query
    let query = 'SELECT * FROM expenses WHERE user_id = ?';
    const params: any[] = [user.id];

    if (startDate) {
      query += ' AND date >= FROM_UNIXTIME(?)';
      params.push(startDate / 1000);
    }
    if (endDate) {
      query += ' AND date <= FROM_UNIXTIME(?)';
      params.push(endDate / 1000);
    }
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
    const countResults = await executeQuery<CountRow[]>(countQuery, params);
    const total = countResults[0].count;

    // Get paginated results
    const offset = (page - 1) * limit;
    const paginatedQuery = query + ' ORDER BY date DESC LIMIT ? OFFSET ?';
    const paginatedParams = [...params, limit, offset];

    const expenses = await executeQuery<ExpenseRow[]>(paginatedQuery, paginatedParams);

    return NextResponse.json({
      success: true,
      data: {
        expenses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('[v0] Get expenses error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
