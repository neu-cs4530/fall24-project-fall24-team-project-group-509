import { Socket } from 'socket.io-client';

export type FakeSOSocket = Socket<ServerToClientEvents>;

/**
 * Represents a user in the application.
 */
export interface User {
  username: string;
}

/**
 * Represents the user profile data.
 * This is used for displaying a user's profile information on their profile page.
 * This should be used as the return type for all user-related operations.
 * This contains:
 * - username: The username of the user. This is unique.
 * - bio: A short description of the user.
 * - profilePictureURL: The URL of the user's profile picture.
 * - activityHistory: The list of questions the user has interacted with.
 * - bookmarks: The collections of posts the user has saved.
 */
export interface UserProfile {
  username: string;
  bio: string;
  profilePictureURL: string;
  activityHistory?: Array<{
    postId: string;
    postType: string;
    createdAt: Date;
  }>;
  bookmarks: BookmarkCollection[];
  // add fields for activityHistory
  // add fields for bookmarks
}

/**
 * Enum representing the possible ordering options for questions.
 * and their display names.
 */
export const orderTypeDisplayName = {
  newest: 'Newest',
  unanswered: 'Unanswered',
  active: 'Active',
  mostViewed: 'Most Viewed',
} as const;

/**
 * Type representing the keys of the orderTypeDisplayName object.
 * This type can be used to restrict values to the defined order types.
 */
export type OrderType = keyof typeof orderTypeDisplayName;

/**
 * Interface represents a comment.
 *
 * text - The text of the comment.
 * commentBy - Username of the author of the comment.
 * commentDateTime - Time at which the comment was created.
 */
export interface Comment {
  text: string;
  commentBy: string;
  commentDateTime: Date;
}

/**
 * Interface representing a tag associated with a question.
 *
 * @property name - The name of the tag.
 * @property description - A description of the tag.
 */
export interface Tag {
  _id?: string;
  name: string;
  description: string;
}

/**
 * Interface represents the data for a tag.
 *
 * name - The name of the tag.
 * qcnt - The number of questions associated with the tag.
 */
export interface TagData {
  name: string;
  qcnt: number;
}

/**
 * Interface representing the voting data for a question, which contains:
 * - qid - The ID of the question being voted on
 * - upVotes - An array of user IDs who upvoted the question
 * - downVotes - An array of user IDs who downvoted the question
 */
export interface VoteData {
  qid: string;
  upVotes: string[];
  downVotes: string[];
}

/**
 * Interface representing an Answer document, which contains:
 * - _id - The unique identifier for the answer. Optional field
 * - text - The content of the answer
 * - ansBy - The username of the user who wrote the answer
 * - ansDateTime - The date and time when the answer was created
 * - comments - Comments associated with the answer.
 */
export interface Answer {
  _id?: string;
  text: string;
  ansBy: string;
  ansDateTime: Date;
  comments: Comment[];
}

/**
 * Interface representing the structure of a Question object.
 *
 * - _id - The unique identifier for the question.
 * - tags - An array of tags associated with the question, each containing a name and description.
 * - answers - An array of answers to the question
 * - title - The title of the question.
 * - views - An array of usernames who viewed the question.
 * - text - The content of the question.
 * - askedBy - The username of the user who asked the question.
 * - askDateTime - The date and time when the question was asked.
 * - upVotes - An array of usernames who upvoted the question.
 * - downVotes - An array of usernames who downvoted the question.
 * - comments - Comments associated with the question.
 */
export interface Question {
  _id?: string;
  tags: Tag[];
  answers: Answer[];
  title: string;
  views: string[];
  text: string;
  askedBy: string;
  askDateTime: Date;
  upVotes: string[];
  downVotes: string[];
  comments: Comment[];
}

/**
 * Interface representing the payload for a vote update socket event.
 */
export interface VoteUpdatePayload {
  qid: string;
  upVotes: string[];
  downVotes: string[];
}

export interface AnswerUpdatePayload {
  qid: string;
  answer: Answer;
}

export interface CommentUpdatePayload {
  result: Question | Answer;
  type: 'question' | 'answer';
}

/**
 * Interface representing the possible events that the server can emit to the client.
 */
export interface ServerToClientEvents {
  questionUpdate: (question: Question) => void;
  answerUpdate: (update: AnswerUpdatePayload) => void;
  viewsUpdate: (question: Question) => void;
  voteUpdate: (vote: VoteUpdatePayload) => void;
  commentUpdate: (update: CommentUpdatePayload) => void;
  activityHistoryUpdate: (
    update: Array<{ postID: string; postType: string; createdAt: Date }>,
  ) => void;
  bookmarkUpdate: (update: BookmarkCollection[]) => void;
  questionDeletionUpdate: (update: string) => void;
}

/**
 * Interface representing a bookmark collection, which contains:
 * - _id - The unique identifier for the bookmark collection. Optional field.
 * - title - The title of the bookmark collection.
 * - owner - The username of the owner of the bookmark collection.
 * - isPublic - A boolean indicating whether the bookmark collection is public or private.
 * - followers - An array of usernames who follow the bookmark collection.
 * - savedPosts - An array of questions that have been saved to the collection.
 */
export interface BookmarkCollection {
  _id?: string;
  title: string;
  owner: string;
  isPublic: boolean;
  followers: string[];
  savedPosts: Bookmark[];
}

/**
 * Interface representing a bookmark, which contains:
 * - _id - The unique identifier for the bookmark. Optional field.
 * - postID - The Question that has been bookmarked.
 * - savedAt - The date and time when the bookmark was created.
 * qTitle - The title of the question that has been bookmarked
 */
export interface Bookmark {
  _id?: string;
  postId: string;
  qTitle: string;
  savedAt: Date;
}
