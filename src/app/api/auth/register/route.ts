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

    // First create user in Supabase Auth to get a valid UUID that satisfies foreign key
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase(),
      password: password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName || '',
        role: role || 'researcher'
      }
    });

    if (authError || !authUser || !authUser.user) {
      console.error('Auth user creation error:', { authError, authUser });
      return NextResponse.json(
        {
          error: 'Failed to create authentication account',
          details: authError?.message || 'No user data returned'
        },
        { status: 500 }
      );
    }

    console.log('Auth user created successfully:', { userId: authUser.user.id, email: authUser.user.email });

    // Now create/update the profile in users table with the auth UUID
    const userProfile = {
      id: authUser.user.id,
      email: email.toLowerCase(),
      password_hash: hashedPassword,
      first_name: firstName,
      last_name: lastName || '',
      role: role || 'researcher',
      email_verified: true
    };

    console.log('Creating user profile:', userProfile);

    const { data: newUser, error: createError } = await supabase
      .from('users')
      .upsert(userProfile)
      .select('*')
      .single();

    if (createError) {
      console.error('Profile creation error:', {
        error: createError,
        code: createError.code,
        message: createError.message,
        details: createError.details,
        userProfile
      });

      // Try to clean up the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authUser.user.id);

      return NextResponse.json(
        {
          error: 'Failed to create user profile',
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
        emailVerified: newUser.email_verified || true,
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