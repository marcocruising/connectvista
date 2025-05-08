-- Companies policies
CREATE POLICY "Users can delete their own companies"
  ON companies FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Tags policies
CREATE POLICY "Users can view all tags"
  ON tags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create tags"
  ON tags FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Individuals policies
CREATE POLICY "Users can view all individuals"
  ON individuals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create individuals"
  ON individuals FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update individuals"
  ON individuals FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own individuals"
  ON individuals FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Conversations policies
CREATE POLICY "Users can view conversations they participate in"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = conversations.id
      AND individual_id IN (
        SELECT id FROM individuals WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Team Members policies
CREATE POLICY "Users can view team members"
  ON team_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can create team members"
  ON team_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can update team members"
  ON team_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can delete team members"
  ON team_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
    )
  ); 