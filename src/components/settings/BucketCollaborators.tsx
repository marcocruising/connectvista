import { useState, useEffect } from "react";
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
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Copy } from 'lucide-react';

export function BucketCollaborators({ bucket }: { bucket: any }) {
  const [email, setEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [newOwnerId, setNewOwnerId] = useState("");
  const {
    currentBucketId,
    collaborators,
    fetchCollaborators,
    inviteCollaborator,
    removeCollaborator,
    leaveCurrentBucket,
    transferOwnership,
    user,
    isLoadingCollaborators,
    error,
    cancelInvite,
  } = useCRMStore();

  const [copied, setCopied] = useState(false);
  const [archivedIds, setArchivedIds] = useState<string[]>([]);

  useEffect(() => {
    if (bucket?.id) fetchCollaborators(bucket.id);
    // eslint-disable-next-line
  }, [bucket?.id]);

  useEffect(() => {
    if (showTransfer) {
      useCRMStore.getState().clearError();
    }
  }, [showTransfer]);

  // Load archived IDs from localStorage on mount or bucket change
  useEffect(() => {
    if (bucket?.id) {
      const key = `archivedCollaborators_${bucket.id}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        setArchivedIds(JSON.parse(stored));
      } else {
        setArchivedIds([]);
      }
    }
  }, [bucket?.id]);

  const isOwner = collaborators.some(
    (c) => c.user_id === user?.id && c.role === "owner" && c.status === "active"
  );
  const activeCollaborators = collaborators.filter((c) => c.status === "active");
  const visibleCollaborators = collaborators.filter(
    (c) => c.status !== "removed" || !archivedIds.includes(c.id)
  );

  const handleInvite = async () => {
    if (!email || !bucket?.id) return;
    try {
      setIsInviting(true);
      await inviteCollaborator(email, bucket.id);
      toast.success("Collaborator invited successfully");
      setEmail("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to invite collaborator");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemove = async (collaboratorId: string) => {
    try {
      await removeCollaborator(collaboratorId);
      toast.success("Collaborator removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove collaborator");
    }
  };

  const handleLeave = async () => {
    try {
      await leaveCurrentBucket();
      toast.success("You have left the bucket");
    } catch (error: any) {
      if (
        error instanceof Error &&
        (error.message.includes("Transfer ownership before leaving") ||
          error.message.includes("You must add another owner before leaving this bucket."))
      ) {
        setShowTransfer(true);
        useCRMStore.getState().clearError();
        return;
      }
      toast.error(error instanceof Error ? error.message : "Failed to leave bucket");
    }
  };

  const handleTransferOwnership = async () => {
    if (!bucket?.id || !newOwnerId) return;
    try {
      await transferOwnership(bucket.id, newOwnerId);
      toast.success("Ownership transferred and you have left the bucket");
      setShowTransfer(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to transfer ownership");
    }
  };

  // Get last 4 digits of bucket ID
  const bucketIdShort = bucket?.id ? `#${bucket.id.slice(-4).toLowerCase()}` : '';

  const handleCopy = () => {
    if (bucket?.id) {
      navigator.clipboard.writeText(bucket.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  // Archive handler that persists to localStorage
  const handleArchive = (id: string) => {
    setArchivedIds(ids => {
      const updated = [...ids, id];
      if (bucket?.id) {
        localStorage.setItem(`archivedCollaborators_${bucket.id}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  return (
    <div className="space-y-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            Collaborators for: <span className="font-semibold">{bucket?.name}</span>
            {bucketIdShort && bucket?.id && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="ml-2 text-xs text-gray-400 cursor-pointer">{bucketIdShort}</span>
                </TooltipTrigger>
                <TooltipContent>
                  <span className="font-mono text-xs">{bucket.id}</span>
                  <button
                    className="ml-1 p-1 rounded hover:bg-gray-200"
                    onClick={e => { e.stopPropagation(); handleCopy(); }}
                  >
                    <Copy size={14} />
                  </button>
                  {copied && <span className="ml-2 text-green-600 text-xs">Copied!</span>}
                </TooltipContent>
              </Tooltip>
            )}
          </CardTitle>
          <CardDescription>
            Manage your bucket collaborators and their roles. Invite by email below.
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
                {isInviting ? "Inviting..." : "Invite Collaborator"}
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleCollaborators.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No collaborators yet
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleCollaborators.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.email || (member.user_id ? `...${member.user_id.slice(-4)}` : '')}</TableCell>
                      <TableCell>{member.role}</TableCell>
                      <TableCell>{member.status}</TableCell>
                      <TableCell>
                        {isOwner && member.status === 'pending' && member.email && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              await cancelInvite(member.email, member.bucket_id);
                              toast.success('Invite cancelled');
                            }}
                          >
                            Cancel Invite
                          </Button>
                        )}
                        {isOwner && member.user_id !== user?.id && member.status === 'active' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemove(member.id)}
                          >
                            Remove
                          </Button>
                        )}
                        {member.user_id === user?.id && member.status === 'active' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (isOwner && activeCollaborators.length === 1) {
                                setShowTransfer(true);
                              } else {
                                handleLeave();
                              }
                            }}
                          >
                            {isOwner ? 'Leave (Transfer Required)' : 'Leave'}
                          </Button>
                        )}
                        {member.status === 'removed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleArchive(member.id)}
                          >
                            Archive
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {showTransfer && (
              <div className="mt-4 p-4 border rounded bg-yellow-50">
                <div className="mb-2">You must transfer ownership before leaving. Select a new owner:</div>
                <select
                  className="border p-2 rounded"
                  value={newOwnerId}
                  onChange={e => setNewOwnerId(e.target.value)}
                >
                  <option value="">Select new owner</option>
                  {activeCollaborators.filter(c => c.user_id !== user?.id).map(c => (
                    <option key={c.user_id} value={c.user_id}>{c.email || `...${c.user_id.slice(-4)}`}</option>
                  ))}
                </select>
                <Button className="ml-2" onClick={handleTransferOwnership} disabled={!newOwnerId}>
                  Transfer Ownership & Leave
                </Button>
                <Button className="ml-2" variant="ghost" onClick={() => setShowTransfer(false)}>
                  Cancel
                </Button>
              </div>
            )}

            {!showTransfer && error && (
              <div className="text-red-600 mt-2">{error}</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 