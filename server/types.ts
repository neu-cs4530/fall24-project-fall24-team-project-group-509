import { Request } from 'express';
import { ObjectId } from 'mongodb';
import { Server } from 'socket.io';

export type FakeSOSocket = Server<ServerToClientEvents>;

/**
 * Type representing the possible ordering options for questions.
 */
export type OrderType = 'newest' | 'unanswered' | 'active' | 'mostViewed';

/**
 * Interface representing an Answer document, which contains:
 * - _id - The unique identifier for the answer. Optional field
 * - text - The content of the answer
 * - ansBy - The username of the user who wrote the answer
 * - ansDateTime - The date and time when the answer was created
 * - comments - Object IDs of comments that have been added to the answer by users, or comments themselves if populated
 */
export interface Answer {
  _id?: ObjectId;
  text: string;
  ansBy: string;
  ansDateTime: Date;
  comments: Comment[] | ObjectId[];
  flags?: Flag[];
}

/**
 * Interface extending the request body when adding an answer to a question, which contains:
 * - qid - The unique identifier of the question being answered
 * - ans - The answer being added
 */
export interface AnswerRequest extends Request {
  body: {
    qid: string;
    ans: Answer;
  };
}

/**
 * Type representing the possible responses for an Answer-related operation.
 */
export type AnswerResponse = Answer | { error: string };

/**
 * Interface representing a Tag document, which contains:
 * - _id - The unique identifier for the tag. Optional field.
 * - name - Name of the tag
 */
export interface Tag {
  _id?: ObjectId;
  name: string;
  description: string;
}

/**
 * Interface representing a Question document, which contains:
 * - _id - The unique identifier for the question. Optional field.
 * - title - The title of the question.
 * - text - The detailed content of the question.
 * - tags - An array of tags associated with the question.
 * - askedBy - The username of the user who asked the question.
 * - askDateTime - he date and time when the question was asked.
 * - answers - Object IDs of answers that have been added to the question by users, or answers themselves if populated.
 * - views - An array of usernames that have viewed the question.
 * - upVotes - An array of usernames that have upvoted the question.
 * - downVotes - An array of usernames that have downvoted the question.
 * - comments - Object IDs of comments that have been added to the question by users, or comments themselves if populated.
 */
export interface Question {
  _id?: ObjectId;
  title: string;
  text: string;
  tags: Tag[];
  askedBy: string;
  askDateTime: Date;
  answers: Answer[] | ObjectId[];
  views: string[];
  upVotes: string[];
  downVotes: string[];
  comments: Comment[] | ObjectId[];
  flags?: Flag[];
}

/**
 * Type representing the possible responses for a Question-related operation.
 */
export type QuestionResponse = Question | { error: string };

/**
 * Interface for the request query to find questions using a search string, which contains:
 * - order - The order in which to sort the questions
 * - search - The search string used to find questions
 * - askedBy - The username of the user who asked the question
 * - username - The username of the user requesting the questions.
 */
export interface FindQuestionRequest extends Request {
  query: {
    order: OrderType;
    search: string;
    askedBy: string;
    username: string;
  };
}

/**
 * Interface for the request parameters when finding a question by its ID.
 * - qid - The unique identifier of the question.
 */
export interface FindQuestionByIdRequest extends Request {
  params: {
    qid: string;
  };
  query: {
    username: string;
  };
}

/**
 * Interface for the request body when adding a new question.
 * - body - The question being added.
 */
export interface AddQuestionRequest extends Request {
  body: Question;
}

/**
 * Interface for the request body when upvoting or downvoting a question.
 * - body - The question ID and the username of the user voting.
 *  - qid - The unique identifier of the question.
 *  - username - The username of the user voting.
 */
export interface VoteRequest extends Request {
  body: {
    qid: string;
    username: string;
  };
}

/**
 * Interface representing a Comment, which contains:
 * - _id - The unique identifier for the comment. Optional field.
 * - text - The content of the comment.
 * - commentBy - The username of the user who commented.
 * - commentDateTime - The date and time when the comment was posted.
 *
 */
export interface Comment {
  _id?: ObjectId;
  text: string;
  commentBy: string;
  commentDateTime: Date;
  flags?: Flag[];
}

/**
 * Interface extending the request body when adding a comment to a question or an answer, which contains:
 * - id - The unique identifier of the question or answer being commented on.
 * - type - The type of the comment, either 'question' or 'answer'.
 * - comment - The comment being added.
 */
export interface AddCommentRequest extends Request {
  body: {
    id: string;
    type: 'question' | 'answer';
    comment: Comment;
  };
}

/**
 * Type representing the possible responses for a Comment-related operation.
 */
export type CommentResponse = Comment | { error: string };

/**
 * Interface representing the payload for a comment update event, which contains:
 * - result - The updated question or answer.
 * - type - The type of the updated item, either 'question' or 'answer'.
 */
export interface CommentUpdatePayload {
  result: AnswerResponse | QuestionResponse | null;
  type: 'question' | 'answer';
}

/**
 * Interface representing the payload for a vote update event, which contains:
 * - qid - The unique identifier of the question.
 * - upVotes - An array of usernames who upvoted the question.
 * - downVotes - An array of usernames who downvoted the question.
 */
export interface VoteUpdatePayload {
  qid: string;
  upVotes: string[];
  downVotes: string[];
}

/**
 * Interface representing the payload for an answer update event, which contains:
 * - qid - The unique identifier of the question.
 * - answer - The updated answer.
 */
export interface AnswerUpdatePayload {
  qid: string;
  answer: AnswerResponse;
}

/**
 * Interface representing the payload for an user update event, which contains:
 * - username - The unique identifier of the user.
 * - bio - The bio of the user.
 */
export interface BioUpdatePayload {
  username: string;
  bio: string;
}

/**
 * Interface representing the payload for an user update event, which contains:
 * - username - The unique identifier of the user.
 * - profilePictureURL - The url of the profile picture of the user.
 */
export interface ProfilePictureUpdatePayload {
  username: string; // Username of the profile being updated
  profilePictureURL: string; // URL of the updated profile picture
}

/**profilePictureFile: Express.Multer.File;
 * Union type representing the payload for a profile update event.
 *
 * Ensures that each update contains only the relevant fields for that type of update.
 */
export type ProfileUpdatePayload = BioUpdatePayload | ProfilePictureUpdatePayload;

/**
 * Interface representing the payload for a bookmark collection update event, which contains:
 * - collectionId - The unique identifier of the bookmark collection.
 * - updatedCollection - The updated bookmark collection.
 */
export interface BookmarkCollectionUpdatePayload {
  collectionId: string;
  updatedCollection: BookmarkCollection;
}

/**
 * Interface representing the possible events that the server can emit to the client.
 */
export interface ServerToClientEvents {
  questionUpdate: (question: QuestionResponse) => void;
  answerUpdate: (result: AnswerUpdatePayload) => void;
  viewsUpdate: (question: QuestionResponse) => void;
  voteUpdate: (vote: VoteUpdatePayload) => void;
  commentUpdate: (comment: CommentUpdatePayload) => void;
  profileUpdate: (update: ProfileUpdatePayload) => void;
  collectionUpdate: (update: BookmarkCollectionUpdatePayload) => void;
  postFlagged: (payload: { id: string; type: 'question' | 'answer' | 'comment' }) => void;
  flagNotification: (payload: FlagNotificationPayload) => void; 
  deletePostNotification: (payload: DeletePostNotificationPayload) => void; 
}

/**
 * Interface representing the payload for a flag notification event, which contains:
 * - flaggedBy - The username of the user who flagged the post.
 * - postId - The unique identifier of the post that was flagged.
 * - postType - The type of the flagged post (question, answer, or comment).
 * - reason - The reason for flagging the post.
 * - message - A message describing the flagging action.
 */
export interface FlagNotificationPayload {
  flaggedBy: string;
  postId: string;
  postType: 'question' | 'answer' | 'comment';
  reason: FlagReason;
  message: string;
}

/**
 * Interface representing the payload for a delete post notification event, which contains:
 * - postId - The unique identifier of the post that was deleted.
 * - postType - The type of the deleted post (question, answer, or comment).
 * - message - A message describing the deletion action.
 */
export interface DeletePostNotificationPayload {
  postId: string;
  postType: 'question' | 'answer' | 'comment';
  message: string;
}
/**
 * Interface representing the possible events that the client can emit to the server.
 */
export interface ClientToServerEvents {
  followCollection: (collectionId: string, username: string) => void;
  unfollowCollection: (collectionId: string, username: string) => void;
}

/**
 * Interface representing a bookmark, which contains:
 * - postId - The unique identifier of the post (question or answer).
 * - savedAt - The date and time when the post was bookmarked.
 * - qTitle - The title of the question that the post belongs to.
 */
export interface Bookmark {
  _id?: ObjectId;
  postId: string;
  qTitle: string;
  savedAt: Date;
  numAnswers?: number;
}

/**
 * Interface representing a bookmark collection, which contains:
 * - _id - The unique identifier for the bookmark collection. Optional field.
 * - title - The title of the bookmark collection.
 * - owner - The username of the user who owns the collection.
 * - isPublic - A boolean indicating whether the bookmark collection is public.
 * - permittedUsers - An array of usernames permitted to access the collection if it's private.
 * - followers - An array of usernames who follow the collection.
 * - savedPosts - An array of bookmarks that have been saved to the collection.
 */
export interface BookmarkCollection {
  _id?: ObjectId;
  title: string;
  owner: string;
  isPublic: boolean;
  // permittedUsers?: string[];
  followers?: string[];
  savedPosts: Bookmark[];
}

/**
 * Interface representing a user of the platform, which contains:
 * - username - The unique identifier for the user.
 * - password - The password for the user.
 * - bio - A short description of the user. Optional field.
 * - profilePictureURL - The URL of the user's profile picture (if they have one). Optional field.
 * - activityHistory - The history of the user's activity on the platform.
 * - bookmarkCollections - An array of bookmark collections owned by the user.
 * - followedBookmarkCollections - An array of IDs of bookmark collections the user is following.
 * - isBanned - A boolean indicating whether the user is banned.
 * - isShadowBanned - A boolean indicating whether the user is shadow banned.
 * - FollowUpdateNotifications - An array of notifications for when a bookmark collections the user is following is updated.
 */
export interface User {
  username: string;
  password: string;
  bio?: string;
  profilePictureURL?: string;
  activityHistory?: Array<{
    postId: string;
    postType: 'Question' | 'Answer' | 'Comment';
    qTitle: string;
    createdAt: Date;
  }>;
  bookmarkCollections?: BookmarkCollection[];
  followedBookmarkCollections?: ObjectId[];
  sharedCollections?: ObjectId[];
  isBanned?: boolean;
  isShadowBanned?: boolean;
  followUpdateNotifications?: FollowNotificationLog[];
}

/**
 * Interface representing a notification log for when a bookmark collection a user is following is updated, which contains:
 *
 * - _id - The unique identifier for the notification log. Optional field.
 * - qTitle - The title of the question that was added to the bookmark collection.
 * - collectionId - The unique identifier of the bookmark collection that was updated.
 * - bookmarkCollectionTitle - The title of the bookmark collection that was updated.
 * - createdAt - The date and time when the notification was created.
 */
export interface FollowNotificationLog {
  _id?: ObjectId;
  qTitle: string;
  collectionId: string;
  bookmarkCollectionTitle: string;
  createdAt: Date;
}

/**
 * Interface representing the request body when adding a new user, which contains:
 * - body - The user being added.
 */
export interface AddUserRequest extends Request {
  body: User;
}

/**
 * Interface representing the request to add a biography to a user, which contains:
 * - username - The unique identifier for the user.
 * - bio - The biography to add to the user.
 */
export interface AddUserBioRequest extends Request {
  body: {
    username: string;
    bio: string;
  };
}

/**
 * Interface representing the request to add a profile picture to a user, which contains:
 * - username - The unique identifier for the user.
 * - profilePictureURL - The URL of the profile picture to add to the user.
 */
export interface AddUserProfilePicRequest extends Request {
  body: {
    username: string;
    profilePictureFile: Express.Multer.File;
  };
}

/**
 * Interface representing the response for a user-related operation, which contains:
 * - user - The user document.
 */
export type UserResponse = User | { error: string };

/**
 * Interface representing the request to find a user by their username
 * - username - The unique identifier for the user to be found.
 * - requesterUsername - The username of the user making the request.
 */
export interface FindUserByUsernameRequest extends Request {
  params: {
    username: string;
  };
  query: {
    requesterUsername: string;
  };
}

/**
 * Type representing the possible sorting options for bookmarks.
 */
export type BookmarkSortOption = 'date' | 'numberOfAnswers' | 'views' | 'title' | 'tags';

/**
 * Interface representing the response for a bookmark collection operation, which contains one of the following:
 * - collection - The bookmark collection document.
 * - error - An error message.
 */
export type BookmarkCollectionResponse = BookmarkCollection | { error: string };

/**
 * Interface representing the request to get bookmarks, which contains:
 * - sortOption - The option by which to sort the bookmarks.
 */
export interface GetBookmarksRequest extends Request {
  params: {
    username: string;
    requesterUsername: string;
  };
  query: {
    sortOption: BookmarkSortOption;
  };
}

/**
 * Interface representing the request to create a new bookmark collection.
 * - username - The username of the user creating the collection.
 * - title - The title of the collection.
 * - isPublic - Whether the collection is public.
 */
export interface CreateBookmarkCollectionRequest extends Request {
  body: {
    username: string;
    title: string;
    isPublic: boolean;
  };
}

/**
 * Interface representing the request to update an existing bookmark collection.
 * - collectionId - The unique identifier of the collection.
 * - title - The new title of the collection. Optional.
 * - isPublic - The new public status of the collection. Optional.
 * - permittedUsers - The new list of permitted users. Optional.
 */
export interface UpdateBookmarkCollectionRequest extends Request {
  body: {
    collectionId: string;
    title?: string;
    isPublic?: boolean;
    permittedUsers?: string[];
  };
}

/**
 * Interface representing the request to add a post to a bookmark collection.
 * - collectionId - The unique identifier of the collection.
 * - postId - The unique identifier of the post.
 */
export interface AddQuestionToBookmarkCollectionRequest extends Request {
  body: {
    collectionId: string;
    postId: string;
  };
}

/**
 * Interface representing the request to remove a post from a bookmark collection.
 * - collectionId - The unique identifier of the collection.
 * - postId - The unique identifier of the post.
 */
export interface RemovePostFromBookmarkCollectionRequest extends Request {
  body: {
    collectionId: string;
    postId: string;
  };
}

/**
 * Interface representing the request to follow a bookmark collection.
 * - collectionId - The unique identifier of the collection.
 * - username - The username of the user following the collection.
 */
export interface FollowBookmarkCollectionRequest extends Request {
  body: {
    collectionId: string;
    username: string;
  };
}

/**
 * Interface representing the request to unfollow a bookmark collection.
 * - collectionId - The unique identifier of the collection.
 * - username - The username of the user unfollowing the collection.
 */
export interface UnfollowBookmarkCollectionRequest extends Request {
  body: {
    collectionId: string;
    username: string;
  };
}

/**
 * Interface representing the request to get a bookmark collection by its ID.
 * - collectionId - The unique identifier of the collection.
 */
export interface GetBookmarkCollectionByIdRequest extends Request {
  params: {
    collectionId: string;
  };
}

/**
 * Interface representing the request to search for users by a partial or full username.
 * - username - The search term to match against usernames.
 */
export interface SearchUserByUsernameRequest extends Request {
  query: {
    username: string;
  };
}

/**
 * Interface representing the request to get a user by their username.
 * - username - The unique identifier of the user.
 */
export interface GetUserNotificationsRequest extends Request {
  params: {
    username: string;
  };
}

/**
 * Interface representing the request to check if a user is banned.
 * - username - The username of the user to check.
 */
export interface isUserBannedRequest extends Request {
  params: {
    username: string;
  };
}

/**
 * Interface representing the request to validate credentials.
 * - username - The username of the user to check.
 * - password - The password of the user to check.
 */
export interface ValidateUserCredentialsRequest extends Request {
  body: {
    username: string;
    password: string;
  };
}

/**
 * Type representing the possible responses for a user search operation.
 */
export type UserSearchResponse = User[] | { error: string };

/**
 * Enum representing the possible reasons for flagging a post.
 */
export type FlagReason = 'spam' | 'offensive language' | 'irrelevant content' | 'other';

/**
 * Interface representing a flag on a post.
 * - flaggedBy: The username of the user who flagged the post.
 * - reason: The reason for flagging.
 * - dateFlagged: The date and time when the post was flagged.
 * - status: The status of the flag, either 'pending' or 'reviewed'.
 * - reviewedBy: The username of the moderator who reviewed the flag. Optional field.
 * - reviewedAt: The date and time when the flag was reviewed. Optional field.
 * - postId: The unique identifier of the post being flagged. This can be either a question, comment, or answer.
 * - postType: The type of the post being flagged, either 'question', 'answer', or 'comment'.
 * - postText: The text of the post being flagged.
 * - flaggedUser: The username of the user who created the post being flagged.
 */

export interface Flag {
  _id?: string;
  flaggedBy: string;
  reason: FlagReason;
  dateFlagged: Date;
  status: 'pending' | 'reviewed';
  reviewedBy?: string;
  reviewedAt?: Date;
  postId: string;
  postType: 'question' | 'answer' | 'comment';
  postText: string;
  flaggedUser: string;
}

/**
 * Interface for the request body when flagging a post.
 * - id: The unique identifier of the post being flagged.
 * - type: The type of the post, either 'question', 'answer', or 'comment'.
 * - reason: The reason for flagging the post.
 * - flaggedBy: The username of the user flagging the post.
 */
export interface FlagPostRequest extends Request {
  body: {
    id: string;
    type: 'question' | 'answer' | 'comment';
    reason: FlagReason;
    flaggedBy: string;
  };
}

/**
 * Interface for the request to get all flagged posts.
 * - username: The username of the user requesting the flagged posts.
 */
export interface GetFlaggedPostsRequest extends Request {
  query: {
    username: string;
  };
}

/**
 * Interface for the request to get a flag object by its ID.
 * - fid: The unique identifier of the flag.
 */
export interface GetFlagByIdRequest extends Request {
  params: {
    fid: string;
  };
  query: {
    username: string;
  };
}

/**
 * Interface for the request to review a flag.
 * - flagId: The unique identifier of the flag.
 * - moderatorUsername: The username of the moderator reviewing the flag.
 */
export interface ReviewFlagRequest extends Request {
  body: {
    flagId: string;
    moderatorUsername: string;
  };
}

/**
 * Type representing the possible responses for a flag-related operation. Can be a Flag object or an error message.
 * - flag - The flag object.
 * - error - An error message.
 */
export type FlagResponse = Flag | { error: string };

/**
 * Interface representing the request to delete a post.
 * - id - The unique identifier of the post to delete.
 * - type - The type of the post, either 'question', 'answer', or 'comment'.
 * - moderatorUsername - The username of the moderator performing the action.
 */
export interface DeletePostRequest extends Request {
  body: {
    id: string;
    type: 'question' | 'answer' | 'comment';
    moderatorUsername: string;
  };
}

/**
 * Interface representing the request to get all pending flags.
 * - username - The username of the user requesting the pending flags.
 */
export interface GetPendingFlagsRequest extends Request {
  query: {
    username: string;
  };
}

/**
 * Interface representing the request to ban or unban a user.
 * - username - The username of the user to ban or unban.
 * - moderatorUsername - The username of the moderator performing the action.
 */
export interface BanUserRequest extends Request {
  body: {
    username: string;
    moderatorUsername: string;
  };
}
