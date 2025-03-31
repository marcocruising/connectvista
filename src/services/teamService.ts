import { supabase } from '@/lib/supabase';
import { Team, TeamMember } from '@/types/crm';

export const teamService = {
  async getCurrentUserTeams(): Promise<{ teams: Team[], memberships: TeamMember[] }> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    // Get teams where user is a member
    const { data: memberships, error: membershipError } = await supabase
      .from('team_members')
      .select('*')
      .eq('user_id', userId);

    if (membershipError) {
      console.error('Error fetching memberships:', membershipError);
      return { teams: [], memberships: [] };
    }

    if (!memberships?.length) {
      // If user has no teams, create a default one
      try {
        const newTeam = await this.createTeam('My Team');
        return {
          teams: [newTeam],
          memberships: [{
            id: 'default',
            team_id: newTeam.id,
            user_id: userId!,
            role: 'owner',
            joined_at: new Date().toISOString()
          }]
        };
      } catch (error) {
        console.error('Error creating default team:', error);
        return { teams: [], memberships: [] };
      }
    }

    // Get all teams the user is a member of
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .in('id', memberships.map(m => m.team_id));

    if (teamsError) {
      console.error('Error fetching teams:', teamsError);
      return { teams: [], memberships: [] };
    }

    return {
      teams: teams || [],
      memberships: memberships || []
    };
  },

  async createTeam(name: string): Promise<Team> {
    const { data, error } = await supabase
      .from('teams')
      .insert({
        name,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;

    // Create team member entry for creator (as owner)
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: data.id,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        role: 'owner'
      });

    if (memberError) throw memberError;

    return data;
  },

  async inviteToTeam(teamId: string, email: string, role: 'admin' | 'member' = 'member'): Promise<void> {
    try {
      // Look up user ID using our function
      const { data: result, error: userError } = await supabase
        .rpc('get_user_id_by_email', { lookup_email: email });

      if (userError || !result) {
        throw new Error('User not found. They need to sign up first.');
      }

      // Add user to team_members
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: result,
          role
        });

      if (memberError) throw memberError;
    } catch (error) {
      console.error('Error inviting team member:', error);
      throw error;
    }
  },

  async switchTeam(teamId: string): Promise<void> {
    // Verify user has access to this team
    const { data, error } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (error || !data) throw new Error('Not authorized to access this team');
  },

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        *,
        user:user_id (
          email
        )
      `)
      .eq('team_id', teamId);

    if (error) throw error;
    return data || [];
  },

  async removeTeamMember(teamId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);

    if (error) throw error;
  }
}; 