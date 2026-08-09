export interface ICreateDiscussionPayload {
  courseId: string;
  title: string;
  content: string;
}

export interface IUpdateDiscussionPayload {
  title?: string;
  content?: string;
}

export interface ICreateReplyPayload {
  content: string;
  parentId?: string;
}

export interface IUpdateReplyPayload {
  content?: string;
}
