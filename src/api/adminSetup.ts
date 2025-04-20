
import { supabase } from '@/integrations/supabase/client';

export const createAdminUser = async () => {
  try {
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .single();

    if (existingUser) {
      console.log('Admin user already exists');
      return { success: true, message: 'Admin user already exists' };
    }

    const { data: newUser, error: signUpError } = await supabase.auth.signUp({
      email: 'admin@pishield.local',
      password: 'test1234',
      options: {
        data: {
          full_name: 'Admin User'
        }
      }
    });

    if (signUpError) {
      throw new Error(signUpError.message);
    }

    return { success: true, message: 'Admin user created successfully' };
  } catch (error) {
    console.error('Error creating admin user:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
};
