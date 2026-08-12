"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/services/notification.services";
import { Notification, NotificationType } from "@/types/notification.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Bell, BookOpen, CheckCheck, CheckCircle, MessageSquare, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "ENROLLMENT":
      return <BookOpen className="size-5 text-positive" />;
    case "REVIEW":
      return <MessageSquare className="size-5 text-warning-deep" />;
    case "SYSTEM":
      return <CheckCircle className="size-5 text-ink-solid" />;
    case "USER":
      return <UserPlus className="size-5 text-positive-deep" />;
    default:
      return <Bell className="size-5 text-muted-foreground" />;
  }
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["notifications", "page", filter],
    queryFn: () =>
      getMyNotifications(
        `limit=${PAGE_SIZE}&sortBy=createdAt&sortOrder=desc${
          filter === "UNREAD" ? "&isRead=false" : ""
        }`,
      ),
  });

  const notifications: Notification[] = data?.data ?? [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
  };

  const markRead = useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: invalidate,
  });

  const markAll = useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: () => {
      invalidate();
      toast.success("All notifications marked as read");
    },
  });

  const handleOpen = async (notification: Notification) => {
    if (!notification.isRead) {
      markRead.mutate(notification.id);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-mute-text">
            Inbox
          </p>
          <h1 className="mt-1 font-heading text-3xl font-black tracking-tight text-ink">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-mute-text">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
              : "You're all caught up"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-full bg-canvas-soft p-1">
            {(["ALL", "UNREAD"] as const).map((option) => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={cn(
                  "cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                  filter === option
                    ? "bg-white text-ink shadow-sm"
                    : "text-mute-text hover:text-ink",
                )}
              >
                {option === "ALL" ? "All" : "Unread"}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            className="gap-2 rounded-full"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending || unreadCount === 0}
          >
            <CheckCheck className="size-4" />
            Mark all read
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed py-20 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary-pale">
            <Bell className="size-7 text-ink-deep" />
          </div>
          <div>
            <p className="font-heading text-lg font-bold text-ink">
              No notifications
            </p>
            <p className="mt-1 text-sm text-mute-text">
              {filter === "UNREAD"
                ? "You have no unread notifications."
                : "Updates about your courses will show up here."}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {isFetching && !isLoading && (
            <p className="text-center text-xs text-mute-text">Refreshing…</p>
          )}
          {notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => handleOpen(notification)}
              className={cn(
                "flex w-full cursor-pointer items-start gap-4 rounded-2xl bg-card p-5 text-left ring-1 ring-border transition-all duration-200 hover:shadow-md",
                !notification.isRead && "ring-2 ring-primary/40",
              )}
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-pale">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p
                    className={cn(
                      "font-semibold text-ink",
                      !notification.isRead && "font-bold",
                    )}
                  >
                    {notification.title}
                  </p>
                  <span className="shrink-0 text-xs text-mute-text">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-body-text">
                  {notification.message}
                </p>
              </div>
              {!notification.isRead && (
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}