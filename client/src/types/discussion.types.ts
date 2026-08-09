export interface IDiscussion {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  isResolved: boolean;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  courseId: string;
  studentId: string;
}

export interface ICreateDiscussionPayload {
  courseId: string;
  title: string;
  content: string;
}

export interface IUpdateDiscussionPayload {
  title?: string;
  content?: string;
}

export interface IDiscussionReply {
  id: string;
  content: string;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  discussionId: string;
  studentId?: string | null;
  instructorId?: string | null;
  parentId?: string | null;
}

export interface ICreateReplyPayload {
  content: string;
  parentId?: string;
}

export interface IUpdateReplyPayload {
  content?: string;
}
