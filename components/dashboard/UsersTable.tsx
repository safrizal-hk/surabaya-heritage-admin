"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, useDB } from "@/lib/context";
import { useToast } from "@/components/ui/toast";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

const ITEMS_PER_PAGE = 5;

interface UsersTableProps {
  initialUsers: User[];
}

export default function UsersTable({ initialUsers }: UsersTableProps) {
  const { users: contextUsers, currentUser, deleteUser } = useDB();
  const { toast } = useToast();

  const users = contextUsers.length > 0 ? contextUsers : initialUsers;

  // Search/Filters states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Delete modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Filter users list
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = selectedRole === "all" || user.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  // Pagination calculations
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleDeleteClick = (id: number) => {
    if (currentUser && currentUser.id === id) {
      toast({
        title: "Action Prevented",
        description: "Self-deletion is forbidden. You cannot delete your own logged-in account.",
        type: "error",
      });
      return;
    }
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmId !== null) {
      const result = await deleteUser(deleteConfirmId);
      if (result.success) {
        toast({
          title: "User Deleted",
          description: "User account and all submitted reviews have been deleted.",
          type: "success",
        });

        // Adjust page if current page becomes empty
        const updatedTotal = totalItems - 1;
        const updatedPages = Math.ceil(updatedTotal / ITEMS_PER_PAGE) || 1;
        if (currentPage > updatedPages) {
          setCurrentPage(updatedPages);
        }
      } else {
        toast({
          title: "Deletion Failed",
          description: result.error || "Could not delete user account.",
          type: "error",
        });
      }
      setDeleteConfirmId(null);
    }
  };

  const getInitials = (nName: string) => {
    return nName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  };

  return (
    <div className="w-full min-w-0 space-y-6 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950">User Management</h1>
          <p className="text-sm text-zinc-500 font-medium">
            Manage administrator accounts and mobile app user access.
          </p>
        </div>
        <Link href="/dashboard/users/create" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto h-9.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
            <Plus className="h-4 w-4" />
            <span>Add User Account</span>
          </Button>
        </Link>
      </div>

      {/* Filters and search bar */}
      <Card className="bg-white border-zinc-200 shadow-2xs">
        <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search accounts by name or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 border-zinc-200"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              setCurrentPage(1);
            }}
            className="flex h-9.5 rounded-md border border-zinc-200 bg-transparent px-3 py-1.5 text-xs shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring cursor-pointer sm:w-48 w-full"
          >
            <option value="all">All Roles</option>
            <option value="admin">Administrators</option>
            <option value="user">Mobile Users</option>
          </select>
        </CardContent>
      </Card>

      {/* Users Table Card */}
      <Card className="w-full overflow-hidden bg-white border-zinc-200 shadow-2xs">
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200/80 bg-zinc-50/50 text-zinc-400 font-bold uppercase tracking-wider">
                  <th className="p-4 font-semibold">User Profile</th>
                  <th className="p-4 font-semibold">Role</th>
                  <th className="p-4 font-semibold">Joined Date</th>
                  <th className="p-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className={`border-b border-zinc-100 last:border-0 hover:bg-zinc-50/30 transition-colors ${
                        currentUser?.id === user.id ? "bg-zinc-50/20" : ""
                      }`}
                    >
                      {/* User Avatar + Details */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-zinc-200 shrink-0">
                            <AvatarImage src={user.avatar_url} alt={user.name} />
                            <AvatarFallback className="text-[10px] font-bold bg-zinc-100 text-zinc-800">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col overflow-hidden max-w-xs">
                            <span className="font-bold text-zinc-950 text-sm flex items-center gap-1.5">
                              {user.name}
                              {currentUser?.id === user.id && (
                                <span className="text-[9px] font-semibold bg-zinc-950 text-white px-1.5 py-0.2 rounded-full">
                                  You
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-medium truncate mt-0.5">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="p-4">
                        {user.role === "admin" ? (
                          <Badge className="gap-1 text-[10px] font-bold bg-zinc-950 text-white">
                            <ShieldCheck className="h-3 w-3" />
                            <span>Admin</span>
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1 text-[10px] font-bold">
                            <UserCheck className="h-3 w-3" />
                            <span>User</span>
                          </Badge>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="p-4 text-zinc-500 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                          {new Date(user.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </td>

                      {/* Action Controls */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/dashboard/users/${user.id}/edit`}>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-zinc-600 border-zinc-200 cursor-pointer"
                            >
                              <Edit className="h-3.5 w-3.5" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="icon"
                            className={`h-8 w-8 text-destructive border-zinc-200 cursor-pointer ${
                              currentUser?.id === user.id
                                ? "opacity-30 cursor-not-allowed pointer-events-none"
                                : "hover:bg-destructive/5 hover:text-destructive"
                            }`}
                            onClick={() => handleDeleteClick(user.id)}
                            disabled={currentUser?.id === user.id}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-zinc-400 font-medium">
                      No users registered matching search filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-zinc-200/80 p-4 bg-zinc-50/50">
              <div className="text-xs text-zinc-500">
                Showing <span className="font-semibold text-zinc-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
                <span className="font-semibold text-zinc-900">
                  {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
                </span>{" "}
                of <span className="font-semibold text-zinc-900">{totalItems}</span> users
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="h-8 gap-1 text-xs cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Previous</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="h-8 gap-1 text-xs cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              <span>Confirm Account Deletion</span>
            </DialogTitle>
            <DialogDescription className="pt-2 text-zinc-600 leading-relaxed">
              Are you sure you want to delete this user account? This action is permanent and will cascade delete all reviews submitted by this user from the database.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(null)} className="cursor-pointer">
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteConfirm} className="cursor-pointer">
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
