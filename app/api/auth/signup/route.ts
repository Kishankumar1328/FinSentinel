import { initializeDbAsync, executeQuery, executeInsert } from '@/lib/db';
import { SignUpSchema } from '@/lib/schemas';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket } from 'mysql2/promise';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

interface UserRow extends RowDataPacket {
  id: string;
}

export async function POST(request: NextRequest) {
  try {
    // Initialize database first
    await initializeDbAsync();

    const body = await request.json();

    // Validate input
    const validation = SignUpSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, name } = validation.data;

    // Check if user already exists
    const existingUsers = await executeQuery<UserRow[]>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userId = uuidv4();
    const now = new Date();

    await executeInsert(
      `
      INSERT INTO users (id, email, password_hash, full_name, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [userId, email, passwordHash, name, now, now]
    );

    // Generate JWT token
    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });

    const response = NextResponse.json(
      {
        success: true,
        data: {
          userId,
          email,
          name,
          token,
        },
      },
      { status: 201 }
    );

    // Set HttpOnly cookie with token
    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[v0] Signup error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
