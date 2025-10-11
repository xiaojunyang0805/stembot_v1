import { createClientComponentClient } from '../supabase';

export interface NotificationSettings {
  email: {
    project_deadlines: {
      '7_days': boolean;
      '3_days': boolean;
      '1_day': boolean;
    };
    weekly_summary: boolean;
    announcements: boolean;
    tips: boolean;
  };
  in_app: {
    ai_suggestions: boolean;
    milestones: boolean;
    health_checks: boolean;
  };
}

export interface ResearchPreferences {
  methodologies: string[];
  statistical_software: string;
  citation_style: string;
  ai_assistance_level: 'minimal' | 'moderate' | 'maximum';
  auto_save: boolean;
  default_timeline_weeks: number;
}

export interface PrivacySettings {
  analytics: boolean;
  research_sharing: boolean;
  chat_history: boolean;
  chat_history_days: number;
}

export interface UserPreferences {
  id?: string;
  user_id: string;
  notification_settings: NotificationSettings;
  research_preferences: ResearchPreferences;
  privacy_settings: PrivacySettings;
  storage_limit_mb: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get user preferences from database
 */
export async function getUserPreferences(): Promise<{ data: UserPreferences | null; error: Error | null }> {
  try {
    const supabase = createClientComponentClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // If no preferences exist yet, return null (will be created on first save)
      if (error.code === 'PGRST116') {
        return { data: null, error: null };
      }
      console.error('Error fetching user preferences:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as UserPreferences, error: null };
  } catch (error) {
    console.error('Error in getUserPreferences:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Update or create user preferences
 */
export async function upsertUserPreferences(
  preferences: Partial<UserPreferences>
): Promise<{ data: UserPreferences | null; error: Error | null }> {
  try {
    const supabase = createClientComponentClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        ...preferences,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting user preferences:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as UserPreferences, error: null };
  } catch (error) {
    console.error('Error in upsertUserPreferences:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Update notification settings only
 */
export async function updateNotificationSettings(
  settings: NotificationSettings
): Promise<{ error: Error | null }> {
  const { error } = await upsertUserPreferences({
    notification_settings: settings
  });
  return { error };
}

/**
 * Update research preferences only
 */
export async function updateResearchPreferences(
  preferences: ResearchPreferences
): Promise<{ error: Error | null }> {
  const { error } = await upsertUserPreferences({
    research_preferences: preferences
  });
  return { error };
}

/**
 * Update privacy settings only
 */
export async function updatePrivacySettings(
  settings: PrivacySettings
): Promise<{ error: Error | null }> {
  const { error } = await upsertUserPreferences({
    privacy_settings: settings
  });
  return { error };
}

/**
 * Get default preferences
 */
export function getDefaultPreferences(userId: string): UserPreferences {
  return {
    user_id: userId,
    notification_settings: {
      email: {
        project_deadlines: {
          '7_days': true,
          '3_days': true,
          '1_day': true
        },
        weekly_summary: true,
        announcements: true,
        tips: true
      },
      in_app: {
        ai_suggestions: true,
        milestones: true,
        health_checks: true
      }
    },
    research_preferences: {
      methodologies: [],
      statistical_software: 'SPSS',
      citation_style: 'APA',
      ai_assistance_level: 'moderate',
      auto_save: true,
      default_timeline_weeks: 12
    },
    privacy_settings: {
      analytics: true,
      research_sharing: false,
      chat_history: true,
      chat_history_days: 30
    },
    storage_limit_mb: 100
  };
}
