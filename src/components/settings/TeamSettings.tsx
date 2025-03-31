import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCRMStore } from "@/store/crmStore";
import { toast } from "sonner";

export function TeamSettings() {
  const [email, setEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const { currentTeam, teamMembers, inviteToTeam } = useCRMStore();

  const handleInvite = async () => {
    if (!email || !currentTeam) return;
    
    try {
      setIsInviting(true);
      await inviteToTeam(currentTeam.id, email);
      toast.success("Team member invited successfully");
      setEmail("");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to invite team member';
      if (errorMessage.includes('not found')) {
        toast.error("User needs to sign up first before they can be invited");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage your team members and their roles. Users must sign up for an account before they can be invited.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Enter email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isInviting}
              />
              <Button 
                onClick={handleInvite} 
                disabled={isInviting || !email}
              >
                {isInviting ? "Inviting..." : "Invite Member"}
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No team members yet
                    </TableCell>
                  </TableRow>
                ) : (
                  teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.user_id}</TableCell>
                      <TableCell>{member.role}</TableCell>
                      <TableCell>
                        {new Date(member.joined_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={member.role === 'owner'}
                          onClick={() => {
                            // Implement remove member functionality
                          }}
                        >
                          {member.role === 'owner' ? 'Owner' : 'Remove'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 