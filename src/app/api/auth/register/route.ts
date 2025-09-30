import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, role } = await request.json();

    // Validate input
    if (!email || !password || !firstName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user in database with detailed error handling - let DB auto-generate ID
    let insertData: any = {
      email: email.toLowerCase()
    };

    // Add custom auth fields if they exist
    try {
      insertData.password_hash = hashedPassword;
      insertData.first_name = firstName;
      insertData.last_name = lastName || '';
      insertData.role = role || 'researcher';
      insertData.email_verified = false;
    } catch (err) {
      console.error('Error preparing user data:', err);
    }

    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert(insertData)
      .select('*')
      .single();

    if (createError) {
      console.error('Database error creating user:', {
        error: createError,
        code: createError.code,
        message: createError.message,
        details: createError.details,
        hint: createError.hint
      });

      return NextResponse.json(
        {
          error: 'Failed to create user account',
          details: createError.message,
          code: createError.code
        },
        { status: 500 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role || 'researcher'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return success response
    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name || firstName,
        lastName: newUser.last_name || lastName || '',
        role: newUser.role || role || 'researcher',
        emailVerified: newUser.email_verified || false,
        createdAt: newUser.created_at || new Date().toISOString()
      },
      token
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}