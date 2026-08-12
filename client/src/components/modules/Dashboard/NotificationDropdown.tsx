"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Bell, BookOpen, CheckCircle, MessageSquare, UserPlus } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  getMyNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/services/notification.services";
import { Notification, NotificationType } from "@/types/notification.types";
import { useState } from "react";

export const notificationKeys = {
  myNotifications: ["notifications", "mine"] as const,
  unreadCount: ["notifications", "unread-count"] as const,
};

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "ENROLLMENT":
      return <BookOpen className="h-4 w-4 text-positive" />;
    case "REVIEW":
      return <MessageSquare className="h-4 w-4 text-warning-deep" />;
    case "SYSTEM":
      return <CheckCircle className="h-4 w-4 text-ink-solid" />;
    case "USER":
      return <UserPlus className="h-4 w-4 text-positive-deep" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
};

const NotificationDropdown = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: notificationKeys.myNotifications,
    queryFn: () => getMyNotifications("limit=20&sortBy=createdAt&sortOrder=desc"),
    enabled: open,
  });

  const { data: unreadData } = useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: () => getUnreadNotificationCount(),
    refetchInterval: 60000,
  });

  const notifications: Notification[] = notificationsData?.data ?? [];
  const unreadCount = unreadData?.data?.unreadCount ?? 0;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: notificationKeys.myNotifications });
    queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount });
  };

  const handleMarkAsRead = async (id: string) => {
    if (notifications.find((n) => n.id === id)?.isRead) return;
    await markNotificationAsRead(id);
    invalidate();
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    await markAllNotificationsAsRead();
    invalidate();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={"outline"}
          size={"icon"}
          className="relative"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0"
              variant={"destructive"}
            >
              <span className="text-[10px]">{unreadCount > 9 ? "9+" : unreadCount}</span>
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={"end"} className="w-80">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge variant={"secondary"} className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <ScrollArea className="h-75">
          {isLoading ? (
            <div className="space-y-3 p-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => handleMarkAsRead(notification.id)}
                className={`flex cursor-pointer flex-col items-start gap-2 p-3 ${notification.isRead ? "opacity-60" : ""}`}
              >
                <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">
                      {notification.title}
                    </p>
                    {!notification.isRead && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>

                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {notification.message}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          )}
        </ScrollArea>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="justify-center text-center"
          onClick={handleMarkAllAsRead}
        >
          Mark all as read
        </DropdownMenuItem>

        <DropdownMenuItem
          className="justify-center text-center font-semibold text-primary"
          render={<Link href="/notifications" />}
          onSelect={() => setOpen(false)}
        >
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;