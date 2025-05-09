import { supabase } from '@/lib/supabase';

export const bucketCollaboratorService = {
  // Invite a member by email
  async inviteCollaborator(email: string, bucketId: string) {
    if (!email || !email.trim()) throw new Error('Email is required to invite a collaborator');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('bucket_collaborators')
      .insert([
        {
          bucket_id: bucketId,
          email: email.trim(),
          role: 'member',
          status: 'pending',
          invited_by: user.id,
          invited_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Accept an invite (called after login/signup)
  async acceptInvite(bucketId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    // Find pending invite for this email and bucket
    const { data: invite, error: findError } = await supabase
      .from('bucket_collaborators')
      .select('*')
      .eq('bucket_id', bucketId)
      .eq('email', user.email)
      .eq('status', 'pending')
      .maybeSingle();
    if (findError) throw findError;
    if (!invite) throw new Error('No pending invite found');
    // Accept the invite
    const { data, error } = await supabase
      .from('bucket_collaborators')
      .update({
        user_id: user.id,
        status: 'active',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', invite.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // List all collaborators for a bucket
  async listCollaborators(bucketId: string) {
    const { data, error } = await supabase
      .from('bucket_collaborators')
      .select('*')
      .eq('bucket_id', bucketId)
      .order('invited_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  // Remove a collaborator (owner only)
  async removeCollaborator(collaboratorId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    // Set status to removed, record who removed and when
    const { data, error } = await supabase
      .from('bucket_collaborators')
      .update({
        status: 'removed',
        removed_by: user.id,
        removed_at: new Date().toISOString(),
      })
      .eq('id', collaboratorId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Member leaves a bucket
  async leaveBucket(bucketId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    // Find their active membership
    const { data: membership, error: findError } = await supabase
      .from('bucket_collaborators')
      .select('*')
      .eq('bucket_id', bucketId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();
    if (findError) throw findError;
    if (!membership) throw new Error('No active membership found');
    // Set status to removed
    const { data, error } = await supabase
      .from('bucket_collaborators')
      .update({
        status: 'removed',
        removed_by: user.id,
        removed_at: new Date().toISOString(),
      })
      .eq('id', membership.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
}; 