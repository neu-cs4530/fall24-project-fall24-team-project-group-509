import { ObjectId } from 'mongodb';
import { QueryOptions } from 'mongoose';
import { Storage } from '@google-cloud/storage';
import path from 'path';
import {
  Answer,
  AnswerResponse,
  Bookmark,
  BookmarkCollection,
  BookmarkCollectionResponse,
  BookmarkSortOption,
  Comment,
  CommentResponse,
  OrderType,
  Question,
  QuestionResponse,
  Tag,
  User,
  UserResponse,
  Flag,
  FlagReason,
} from '../types';
import AnswerModel from './answers';
import QuestionModel from './questions';
import TagModel from './tags';
import CommentModel from './comments';
import UserModel from './user';
import BookmarkCollectionModel from './bookmarkCollections';
import FlagModel from './flag';

/**
 * Parses tags from a search string.
 *
 * @param {string} search - Search string containing tags in square brackets (e.g., "[tag1][tag2]")
 *
 * @returns {string[]} - An array of tags found in the search string
 */
const parseTags = (search: string): string[] =>
  (search.match(/\[([^\]]+)\]/g) || []).map(word => word.slice(1, -1));

/**
 * Parses keywords from a search string by removing tags and extracting individual words.
 *
 * @param {string} search - The search string containing keywords and possibly tags
 *
 * @returns {string[]} - An array of keywords found in the search string
 */
const parseKeyword = (search: string): string[] =>
  search.replace(/\[([^\]]+)\]/g, ' ').match(/\b\w+\b/g) || [];

/**
 * Checks if given question contains any tags from the given list.
 *
 * @param {Question} q - The question to check
 * @param {string[]} taglist - The list of tags to check for
 *
 * @returns {boolean} - `true` if any tag is present in the question, `false` otherwise
 */
const checkTagInQuestion = (q: Question, taglist: string[]): boolean => {
  for (const tagname of taglist) {
    for (const tag of q.tags) {
      if (tagname === tag.name) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Checks if any keywords in the provided list exist in a given question's title or text.
 *
 * @param {Question} q - The question to check
 * @param {string[]} keywordlist - The list of keywords to check for
 *
 * @returns {boolean} - `true` if any keyword is present, `false` otherwise.
 */
const checkKeywordInQuestion = (q: Question, keywordlist: string[]): boolean => {
  for (const w of keywordlist) {
    if (q.title.includes(w) || q.text.includes(w)) {
      return true;
    }
  }

  return false;
};

/**
 * Gets the newest questions from a list, sorted by the asking date in descending order.
 *
 * @param {Question[]} qlist - The list of questions to sort
 *
 * @returns {Question[]} - The sorted list of questions
 */
const sortQuestionsByNewest = (qlist: Question[]): Question[] =>
  qlist.sort((a, b) => b.askDateTime.getTime() - a.askDateTime.getTime());

/**
 * Gets unanswered questions from a list, sorted by the asking date in descending order.
 *
 * @param {Question[]} qlist - The list of questions to filter and sort
 *
 * @returns {Question[]} - The filtered and sorted list of unanswered questions
 */
const sortQuestionsByUnanswered = (qlist: Question[]): Question[] =>
  sortQuestionsByNewest(qlist).filter(q => q.answers.length === 0);

/**
 * Records the most recent answer time for a question.
 *
 * @param {Question} question - The question to check
 * @param {Map<string, Date>} mp - A map of the most recent answer time for each question
 */
const getMostRecentAnswerTime = (question: Question, mp: Map<string, Date>): void => {
  // This is a private function and we can assume that the answers field is not undefined or an array of ObjectId
  const answers = question.answers as Answer[];
  answers.forEach((answer: Answer) => {
    if (question._id !== undefined) {
      const currentMostRecent = mp.get(question?._id.toString());
      if (!currentMostRecent || currentMostRecent < answer.ansDateTime) {
        mp.set(question._id.toString(), answer.ansDateTime);
      }
    }
  });
};

/**
 * Gets active questions from a list, sorted by the most recent answer date in descending order.
 *
 * @param {Question[]} qlist - The list of questions to filter and sort
 *
 * @returns {Question[]} - The filtered and sorted list of active questions
 */
const sortQuestionsByActive = (qlist: Question[]): Question[] => {
  const mp = new Map<string, Date>();
  qlist.forEach(q => {
    getMostRecentAnswerTime(q, mp);
  });

  return sortQuestionsByNewest(qlist).sort((a, b) => {
    const adate = mp.get(a._id?.toString() || '');
    const bdate = mp.get(b._id?.toString() || '');
    if (!adate) {
      return 1;
    }
    if (!bdate) {
      return -1;
    }
    return bdate.getTime() - adate.getTime();
  });
};

/**
 * Sorts a list of questions by the number of views in descending order.
 *
 * @param qlist The array of Question objects to be sorted.
 *
 * @returns A new array of Question objects sorted by the number of views.
 */
const sortQuestionsByMostViews = (qlist: Question[]): Question[] =>
  sortQuestionsByNewest(qlist).sort((a, b) => b.views.length - a.views.length);

/**
 * Adds a tag to the database if it does not already exist.
 *
 * @param {Tag} tag - The tag to add
 *
 * @returns {Promise<Tag | null>} - The added or existing tag, or `null` if an error occurred
 */
export const addTag = async (tag: Tag): Promise<Tag | null> => {
  try {
    // Check if a tag with the given name already exists
    const existingTag = await TagModel.findOne({ name: tag.name });

    if (existingTag) {
      return existingTag as Tag;
    }

    // If the tag does not exist, create a new one
    const newTag = new TagModel(tag);
    const savedTag = await newTag.save();

    return savedTag as Tag;
  } catch (error) {
    return null;
  }
};

/**
 * Excludes questions that have been flagged by the specified user.
 *
 * @param qlist The array of Question objects to filter.
 * @param username The username of the user who flagged the questions.
 *
 * @returns Filtered array of Question objects.
 */
const excludeFlaggedQuestions = (qlist: Question[], username: string): Question[] =>
  qlist.filter(q => {
    // q.flags is an array of Flag objects
    const flaggedByUser = q.flags?.some(flag => flag.flaggedBy === username);
    return !flaggedByUser;
  });

/**
 * Gets questions from the database, ordered by the specified criteria and excludes questions flagged by the user.
 *
 * @param order The order type to filter the questions.
 * @param username The username of the user making the request.
 *
 * @returns A Promise that resolves to a list of ordered questions.
 */
export const getQuestionsByOrder = async (
  order: OrderType,
  username: string,
): Promise<Question[]> => {
  try {
    let qlist = [];
    if (order === 'active') {
      qlist = await QuestionModel.find().populate([
        { path: 'tags', model: TagModel },
        { path: 'answers', model: AnswerModel },
        { path: 'flags', model: FlagModel },
      ]);
      qlist = excludeFlaggedQuestions(qlist, username);
      return sortQuestionsByActive(qlist);
    }
    qlist = await QuestionModel.find().populate([
      { path: 'tags', model: TagModel },
      { path: 'flags', model: FlagModel },
    ]);
    qlist = excludeFlaggedQuestions(qlist, username);
    if (order === 'unanswered') {
      return sortQuestionsByUnanswered(qlist);
    }
    if (order === 'newest') {
      return sortQuestionsByNewest(qlist);
    }
    return sortQuestionsByMostViews(qlist);
  } catch (error) {
    return [];
  }
};

/**
 * Filters a list of questions by the user who asked them.
 *
 * @param qlist The array of Question objects to be filtered.
 * @param askedBy The username of the user who asked the questions.
 *
 * @returns Filtered Question objects.
 */
export const filterQuestionsByAskedBy = (qlist: Question[], askedBy: string): Question[] =>
  qlist.filter(q => q.askedBy === askedBy);

/**
 * Filters questions based on a search string containing tags and/or keywords.
 *
 * @param {Question[]} qlist - The list of questions to filter
 * @param {string} search - The search string containing tags and/or keywords
 *
 * @returns {Question[]} - The filtered list of questions matching the search criteria
 */
export const filterQuestionsBySearch = (qlist: Question[], search: string): Question[] => {
  const searchTags = parseTags(search);
  const searchKeyword = parseKeyword(search);

  if (!qlist || qlist.length === 0) {
    return [];
  }
  return qlist.filter((q: Question) => {
    if (searchKeyword.length === 0 && searchTags.length === 0) {
      return true;
    }

    if (searchKeyword.length === 0) {
      return checkTagInQuestion(q, searchTags);
    }

    if (searchTags.length === 0) {
      return checkKeywordInQuestion(q, searchKeyword);
    }

    return checkKeywordInQuestion(q, searchKeyword) || checkTagInQuestion(q, searchTags);
  });
};

/**
 * Populates a document (question or answer), excluding content flagged by the user.
 *
 * @param id The ID of the document to populate.
 * @param type The type of the document, either 'question' or 'answer'.
 * @param username The username of the user making the request.
 *
 * @returns A Promise that resolves to the populated document or an error message.
 */
export const populateDocument = async (
  id: string | undefined,
  type: 'question' | 'answer',
  username: string,
): Promise<QuestionResponse | AnswerResponse> => {
  try {
    if (!id) {
      throw new Error('Provided question ID is undefined.');
    }

    let result = null;

    if (type === 'question') {
      result = await QuestionModel.findOne({ _id: id }).populate([
        {
          path: 'tags',
          model: TagModel,
        },
        {
          path: 'answers',
          model: AnswerModel,
          populate: { path: 'comments', model: CommentModel },
        },
        { path: 'comments', model: CommentModel },
        { path: 'flags', model: FlagModel },
      ]);
      if (result) {
        // Exclude answers flagged by the user
        const question = result as Question;
        question.answers = (question.answers as Answer[]).filter(answer => {
          if (!answer.flags) return true;
          const answerFlaggedByUser = answer.flags.some(flag => flag.flaggedBy === username);
          return !answerFlaggedByUser;
        });
        // Exclude comments flagged by the user
        question.comments = (question.comments as Comment[]).filter(comment => {
          if (!comment.flags) return true;
          const commentFlaggedByUser = comment.flags.some(flag => flag.flaggedBy === username);
          return !commentFlaggedByUser;
        });
      }
    } else if (type === 'answer') {
      result = await AnswerModel.findOne({ _id: id }).populate([
        { path: 'comments', model: CommentModel },
        { path: 'flags', model: FlagModel },
      ]);
      if (result) {
        // Exclude comments flagged by the user
        const answer = result as Answer;
        answer.comments = (answer.comments as Comment[]).filter(comment => {
          if (!comment.flags) return true;
          const commentFlaggedByUser = comment.flags.some(flag => flag.flaggedBy === username);
          return !commentFlaggedByUser;
        });
      }
    }
    if (!result) {
      throw new Error(`Failed to fetch and populate a ${type}`);
    }
    // Exclude the post itself if it is flagged by the user
    if (result.flags && result.flags.some((flag: Flag) => flag.flaggedBy === username)) {
      return { error: 'Post has been flagged by the user' };
    }
    return result;
  } catch (error) {
    return { error: `Error when fetching and populating a document: ${(error as Error).message}` };
  }
};
/**
 * Fetches a question by its ID and increments its view count, excluding content flagged by the user.
 *
 * @param qid The ID of the question to fetch.
 * @param username The username of the user requesting the question.
 *
 * @returns A Promise that resolves to the fetched question
 *          with incremented views, null if the question is not found, or an error message.
 */
export const fetchAndIncrementQuestionViewsById = async (
  qid: string,
  username: string,
): Promise<QuestionResponse | null> => {
  try {
    const q = await QuestionModel.findOneAndUpdate(
      { _id: new ObjectId(qid) },
      { $addToSet: { views: username } },
      { new: true },
    ).populate([
      {
        path: 'tags',
        model: TagModel,
      },
      {
        path: 'answers',
        model: AnswerModel,
        populate: { path: 'comments', model: CommentModel },
      },
      { path: 'comments', model: CommentModel },
      { path: 'flags', model: FlagModel },
    ]);

    if (q && q.flags && q.flags.some(flag => flag.flaggedBy === username)) {
      return { error: 'Question has been flagged by the user' };
    }

    // Exclude answers flagged by the user
    if (q && q.answers) {
      q.answers = (q.answers as Answer[]).filter(answer => {
        if (!answer.flags) return true;
        const answerFlaggedByUser = answer.flags.some(flag => flag.flaggedBy === username);
        return !answerFlaggedByUser;
      });
    }

    // Exclude comments flagged by the user
    if (q && q.comments) {
      q.comments = (q.comments as Comment[]).filter(comment => {
        if (!comment.flags) return true;
        const commentFlaggedByUser = comment.flags.some(flag => flag.flaggedBy === username);
        return !commentFlaggedByUser;
      });
    }

    return q;
  } catch (error) {
    return { error: 'Error when fetching and updating a question' };
  }
};

/**
 * Saves a new question to the database.
 *
 * @param {Question} question - The question to save
 *
 * @returns {Promise<QuestionResponse>} - The saved question, or error message
 */
export const saveQuestion = async (question: Question): Promise<QuestionResponse> => {
  try {
    const result = await QuestionModel.create(question);

    // Update the user's activity history
    await UserModel.findOneAndUpdate(
      { username: question.askedBy },
      {
        $push: {
          activityHistory: {
            postId: result._id.toString(),
            postType: 'Question',
            qTitle: question.title,
            createdAt: question.askDateTime,
          },
        },
      },
    );

    return result;
  } catch (error) {
    return { error: 'Error when saving a question' };
  }
};

/**
 * Saves a new answer to the database.
 *
 * @param {Answer} answer - The answer to save
 *
 * @returns {Promise<AnswerResponse>} - The saved answer, or an error message if the save failed
 */
export const saveAnswer = async (answer: Answer): Promise<AnswerResponse> => {
  try {
    const result = await AnswerModel.create(answer);

    // // find the question that contains the answer
    // const question = await QuestionModel.findOne({ answers: result._id });

    // // if (!question) {
    // //   throw new Error('Question not found for the answer');
    // // }

    // // Update the user's activity history
    // await UserModel.findOneAndUpdate(
    //   { username: answer.ansBy },
    //   {
    //     $push: {
    //       activityHistory: {
    //         postId: question ? question._id : null,
    //         postType: 'Answer',
    //         createdAt: answer.ansDateTime,
    //       },
    //     },
    //   },
    // );

    return result;
  } catch (error) {
    return { error: 'Error when saving an answer' };
  }
};

/**
 * Saves a new comment to the database.
 *
 * @param {Comment} comment - The comment to save
 *
 * @returns {Promise<CommentResponse>} - The saved comment, or an error message if the save failed
 */
export const saveComment = async (comment: Comment): Promise<CommentResponse> => {
  try {
    const result = await CommentModel.create(comment);

    return result;
  } catch (error) {
    return { error: 'Error when saving a comment' };
  }
};

/**
 * Processes a list of tags by removing duplicates, checking for existing tags in the database,
 * and adding non-existing tags. Returns an array of the existing or newly added tags.
 * If an error occurs during the process, it is logged, and an empty array is returned.
 *
 * @param tags The array of Tag objects to be processed.
 *
 * @returns A Promise that resolves to an array of Tag objects.
 */
export const processTags = async (tags: Tag[]): Promise<Tag[]> => {
  try {
    // Extract unique tag names from the provided tags array using a Set to eliminate duplicates
    const uniqueTagNamesSet = new Set(tags.map(tag => tag.name));

    // Create an array of unique Tag objects by matching tag names
    const uniqueTags = [...uniqueTagNamesSet].map(
      name => tags.find(tag => tag.name === name)!, // The '!' ensures the Tag is found, assuming no undefined values
    );

    // Use Promise.all to asynchronously process each unique tag.
    const processedTags = await Promise.all(
      uniqueTags.map(async tag => {
        const existingTag = await TagModel.findOne({ name: tag.name });

        if (existingTag) {
          return existingTag; // If tag exists, return it as part of the processed tags
        }

        const addedTag = await addTag(tag);
        if (addedTag) {
          return addedTag; // If the tag does not exist, attempt to add it to the database
        }

        // Throwing an error if addTag fails
        throw new Error(`Error while adding tag: ${tag.name}`);
      }),
    );

    return processedTags;
  } catch (error: unknown) {
    // Log the error for debugging purposes
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    // eslint-disable-next-line no-console
    console.log('An error occurred while adding tags:', errorMessage);
    return [];
  }
};

/**
 * Adds a vote to a question.
 *
 * @param qid The ID of the question to add a vote to.
 * @param username The username of the user who voted.
 * @param type The type of vote to add, either 'upvote' or 'downvote'.
 *
 * @returns A Promise that resolves to an object containing either a success message or an error message,
 *          along with the updated upVotes and downVotes arrays.
 */
export const addVoteToQuestion = async (
  qid: string,
  username: string,
  type: 'upvote' | 'downvote',
): Promise<{ msg: string; upVotes: string[]; downVotes: string[] } | { error: string }> => {
  let updateOperation: QueryOptions;

  if (type === 'upvote') {
    updateOperation = [
      {
        $set: {
          upVotes: {
            $cond: [
              { $in: [username, '$upVotes'] },
              { $filter: { input: '$upVotes', as: 'u', cond: { $ne: ['$$u', username] } } },
              { $concatArrays: ['$upVotes', [username]] },
            ],
          },
          downVotes: {
            $cond: [
              { $in: [username, '$upVotes'] },
              '$downVotes',
              { $filter: { input: '$downVotes', as: 'd', cond: { $ne: ['$$d', username] } } },
            ],
          },
        },
      },
    ];
  } else {
    updateOperation = [
      {
        $set: {
          downVotes: {
            $cond: [
              { $in: [username, '$downVotes'] },
              { $filter: { input: '$downVotes', as: 'd', cond: { $ne: ['$$d', username] } } },
              { $concatArrays: ['$downVotes', [username]] },
            ],
          },
          upVotes: {
            $cond: [
              { $in: [username, '$downVotes'] },
              '$upVotes',
              { $filter: { input: '$upVotes', as: 'u', cond: { $ne: ['$$u', username] } } },
            ],
          },
        },
      },
    ];
  }

  try {
    const result = await QuestionModel.findOneAndUpdate({ _id: qid }, updateOperation, {
      new: true,
    });

    if (!result) {
      return { error: 'Question not found!' };
    }

    let msg = '';

    if (type === 'upvote') {
      msg = result.upVotes.includes(username)
        ? 'Question upvoted successfully'
        : 'Upvote cancelled successfully';
    } else {
      msg = result.downVotes.includes(username)
        ? 'Question downvoted successfully'
        : 'Downvote cancelled successfully';
    }

    return {
      msg,
      upVotes: result.upVotes || [],
      downVotes: result.downVotes || [],
    };
  } catch (err) {
    return {
      error:
        type === 'upvote'
          ? 'Error when adding upvote to question'
          : 'Error when adding downvote to question',
    };
  }
};

/**
 * Adds an answer to a question.
 *
 * @param {string} qid - The ID of the question to add an answer to
 * @param {Answer} ans - The answer to add
 *
 * @returns Promise<QuestionResponse> - The updated question or an error message
 */
export const addAnswerToQuestion = async (qid: string, ans: Answer): Promise<QuestionResponse> => {
  try {
    if (!ans || !ans.text || !ans.ansBy || !ans.ansDateTime) {
      throw new Error('Invalid answer');
    }
    const result = await QuestionModel.findOneAndUpdate(
      { _id: qid },
      { $push: { answers: { $each: [ans._id], $position: 0 } } },
      { new: true },
    );
    if (result === null) {
      throw new Error('Error when adding answer to question');
    }
    return result;
  } catch (error) {
    return { error: 'Error when adding answer to question' };
  }
};

/**
 * Adds a comment to a question or answer.
 *
 * @param id The ID of the question or answer to add a comment to
 * @param type The type of the comment, either 'question' or 'answer'
 * @param comment The comment to add
 *
 * @returns A Promise that resolves to the updated question or answer, or an error message if the operation fails
 */
export const addComment = async (
  id: string,
  type: 'question' | 'answer',
  comment: Comment,
): Promise<QuestionResponse | AnswerResponse> => {
  try {
    if (!comment || !comment.text || !comment.commentBy || !comment.commentDateTime) {
      throw new Error('Invalid comment');
    }
    let result: QuestionResponse | AnswerResponse | null;
    if (type === 'question') {
      result = await QuestionModel.findOneAndUpdate(
        { _id: id },
        { $push: { comments: { $each: [comment._id] } } },
        { new: true },
      );
    } else {
      result = await AnswerModel.findOneAndUpdate(
        { _id: id },
        { $push: { comments: { $each: [comment._id] } } },
        { new: true },
      );
    }
    if (result === null) {
      throw new Error('Failed to add comment');
    }
    return result;
  } catch (error) {
    return { error: `Error when adding comment: ${(error as Error).message}` };
  }
};

/**
 * Gets a map of tags and their corresponding question counts.
 *
 * @returns {Promise<Map<string, number> | null | { error: string }>} - A map of tags to their
 *          counts, `null` if there are no tags in the database, or the error message.
 */
export const getTagCountMap = async (): Promise<Map<string, number> | null | { error: string }> => {
  try {
    const tlist = await TagModel.find();
    const qlist = await QuestionModel.find().populate({
      path: 'tags',
      model: TagModel,
    });

    if (!tlist || tlist.length === 0) {
      return null;
    }

    const tmap = new Map(tlist.map(t => [t.name, 0]));

    if (qlist != null && qlist !== undefined && qlist.length > 0) {
      qlist.forEach(q => {
        q.tags.forEach(t => {
          tmap.set(t.name, (tmap.get(t.name) || 0) + 1);
        });
      });
    }

    return tmap;
  } catch (error) {
    return { error: 'Error when constructing tag map' };
  }
};

/**
 * Fetches and populates a user document based on the provided username.
 * @param username - the username of the user to fetch
 * @param requesterUsername - the username of the user making the request
 *
 * @returns the user document
 */
export const getUserByUsername = async (
  username: string,
  requesterUsername: string,
): Promise<UserResponse | null> => {
  try {
    if (!username || username === '') {
      throw new Error('Invalid username');
    }
    const result = await UserModel.findOne({ username });
    // .populate({
    //   path: 'activityHistory.postId',
    // });
    return result;
  } catch (error) {
    return { error: 'Error when fetching user by username' };
  }
};

/**
 * Saves a new user to the database.
 * @param user - the user to save
 * @returns user - the user saved to the database
 */
export const saveUser = async (user: User): Promise<UserResponse> => {
  try {
    const existingUser = await getUserByUsername(user.username, user.username);
    if (existingUser) {
      const eUser = existingUser as User;
      if (eUser.password !== user.password) {
        return { error: 'Password does not match' };
      }
      if (eUser.password === user.password) {
        const { username } = user;
        const result = await UserModel.findOne({ username });
        if (result) {
          return result as User;
        }
      }
    }
    const result = await UserModel.create(user);
    return result;
  } catch (error) {
    return { error: 'Error when saving a user' };
  }
};

/**
 * Adds a biography to a user.
 * @param username - the username of the user to add a bio to
 * @param bio - the biography to add to the user
 * @returns the updated user
 */
export const addUserBio = async (username: string, bio: string): Promise<UserResponse> => {
  try {
    const result = await UserModel.findOneAndUpdate({ username }, { bio }, { new: true });
    if (result === null) {
      throw new Error('Error when adding bio to user');
    }
    return result;
  } catch (error) {
    return { error: 'Error when adding bio to user' };
  }
};

const CREDENTIALS_PATH = path.join(__dirname, '../googleCloudCredentials.json');
const storage = new Storage({ keyFilename: CREDENTIALS_PATH }); // Google Cloud Storage client
const bucket = storage.bucket('cs4530-509-userprofile-pictures'); // Google Cloud Storage bucket
/**
 * Adds a profile picture to a user given a file.
 * Uploads the file to the Google Cloud Storage bucket and receives the URL of the uploaded file.
 * Updates the user's profilePictureURL to the Google Cloud Storage URL of the uploaded file.
 * @param username - the username of the user to add a profile picture to
 * @param file - the file containing the profile picture
 */
export const addUserProfilePicture = async (
  username: string,
  file: Express.Multer.File,
): Promise<UserResponse> => {
  try {
    // Define the destination of the file in the bucket
    const destination = `${username}/${file.originalname}`;
    const gcsFile = bucket.file(destination);

    // Upload the file buffer to the bucket
    await gcsFile.save(file.buffer, { contentType: file.mimetype });

    await gcsFile.makePublic(); // Make the file public

    // Get the URL of the uploaded file
    const publicURL = `https://storage.googleapis.com/cs4530-509-userprofile-pictures/${destination}`;

    // Update the user's profilePictureURL to the URL of the uploaded file
    const result = await UserModel.findOneAndUpdate(
      { username },
      { profilePictureURL: publicURL },
      { new: true },
    );
    if (result === null) {
      throw new Error('Error when adding profile picture to user');
    }
    return result;
  } catch (error) {
    return { error: 'Error when adding profile picture to user' };
  }
};

/**
 * Searches for users based on a search string.
 * @param searchString - the search string used to find users
 * @returns an array of users matching the search criteria
 */
export const searchUsers = async (searchString: string): Promise<User[] | { error: string }> => {
  try {
    const users = await UserModel.find({
      $text: { $search: searchString },
    });

    return users;
  } catch (error) {
    return { error: 'Error when searching for users' };
  }
};

/**
 * Creates a new bookmark collection.
 * @param username - the username of the user creating the collection
 * @param title - the title of the collection
 * @param isPublic - whether the collection is public
 * @returns the created bookmark collection
 */
export const createBookmarkCollection = async (
  username: string,
  title: string,
  isPublic: boolean,
): Promise<BookmarkCollectionResponse> => {
  try {
    const newCollection = new BookmarkCollectionModel({
      title,
      owner: username,
      isPublic,
      savedPosts: [],
    });
    const savedCollection = await newCollection.save();

    // Update the user's bookmarkCollections field
    await UserModel.findOneAndUpdate(
      { username },
      { $push: { bookmarkCollections: savedCollection._id } },
    );

    return savedCollection;
  } catch (error) {
    return { error: 'Error when creating bookmark collection' };
  }
};

/**
 * Adds a question to a bookmark collection.
 * @param collectionId - the ID of the bookmark collection
 * @param questionId - the ID of the question to add
 * @returns the updated bookmark collection
 */
export const addQuestionToBookmarkCollection = async (
  collectionId: string,
  questionId: string,
): Promise<BookmarkCollectionResponse> => {
  try {
    // PROBABLY NEED TO ADD THIS CODE TO PASS IN TITLE FOR A BOOKMARK
    const ourQuestion = await QuestionModel.findOne({ _id: questionId });
    if (!ourQuestion) {
      throw new Error('Question not found');
    }
    const questionTitle = ourQuestion.title;
    const numberAnswers = ourQuestion.answers.length;

    const bookmark: Bookmark = {
      postId: questionId,
      qTitle: questionTitle,
      savedAt: new Date(),
      numAnswers: numberAnswers,
    };

    // const updatedCollection = await BookmarkCollectionModel.findOneAndUpdate(
    //   { _id: new ObjectId(collectionId) },
    //   { $push: { savedPosts: bookmark } },
    //   { new: true },
    // );

    // if (!updatedCollection) {
    //   throw new Error('Bookmark collection not found');
    // }
    // Find the collection to check if the question is already bookmarked
    const collection = await BookmarkCollectionModel.findById(collectionId);

    if (!collection) {
      throw new Error('Bookmark collection not found');
    }

    // Check if the question is already bookmarked
    const isAlreadyBookmarked = collection.savedPosts.some(
      post => post.postId.toString() === questionId,
    );

    if (isAlreadyBookmarked) {
      return collection; // Return the collection without adding the bookmark
    }

    // Add the bookmark if it does not already exist
    const updatedCollection = await BookmarkCollectionModel.findOneAndUpdate(
      { _id: new ObjectId(collectionId) },
      { $push: { savedPosts: bookmark } },
      { new: true },
    );

    if (!updatedCollection) {
      throw new Error('Bookmark collection not found');
    }

    return updatedCollection;
  } catch (error) {
    return {
      error: `Error when adding question to bookmark collection: ${(error as Error).message}`,
    };
  }
};

/**
 * Removes a question from a bookmark collection.
 * @param collectionId - the ID of the bookmark collection
 * @param questionId - the ID of the question to remove
 * @returns the updated bookmark collection
 */
export const removeQuestionFromBookmarkCollection = async (
  collectionId: string,
  questionId: string,
): Promise<BookmarkCollectionResponse> => {
  try {
    const updatedCollection = await BookmarkCollectionModel.findOneAndUpdate(
      { _id: new ObjectId(collectionId) },
      { $pull: { savedPosts: { postId: new ObjectId(questionId) } } },
      { new: true },
    );

    if (!updatedCollection) {
      throw new Error('Bookmark collection not found');
    }

    return updatedCollection;
  } catch (error) {
    return {
      error: `Error when removing question from bookmark collection: ${(error as Error).message}`,
    };
  }
};

/**
 * Retrieves a user's bookmark collections.
 * @param username - the username of the owner of the collections
 * @param requesterUsername - the username of the user making the request
 * @param sortOption - the option by which to sort the bookmarks (optional)
 * @returns an array of bookmark collections
 */
export const getUserBookmarkCollections = async (
  username: string,
  requesterUsername: string,
  sortOption?: BookmarkSortOption,
): Promise<BookmarkCollection[]> => {
  try {
    // Find the user
    const user = await UserModel.findOne({ username });

    if (!user) {
      throw new Error('User not found');
    }

    // Determine which collections to retrieve
    let collections;
    if (username === requesterUsername) {
      // If the requester is the owner, retrieve all collections
      collections = await BookmarkCollectionModel.find({ owner: username });
      // .populate({
      //   path: 'savedPosts',
      //   model: 'Question',
      //   populate: { path: 'tags', model: TagModel },
      // });
    } else {
      // If the requester is not the owner, retrieve public collections or private collections they are permitted to view
      collections = await BookmarkCollectionModel.find({
        owner: username,
        $or: [{ isPublic: true }, { followers: requesterUsername }],
      }).populate({
        path: 'savedPosts',
        model: 'Question',
        populate: { path: 'tags', model: TagModel },
      });
    }

    // Apply sorting if a sortOption is provided
    // if (sortOption) {
    //   collections.forEach(collection => {
    //     if (sortOption === 'date') {
    //       collection.savedPosts.sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime());
    //     } else if (sortOption === 'numberOfAnswers') {
    //       collection.savedPosts.sort((a, b) => {
    //         const aAnswers = (a.postId as Question).answers.length;
    //         const bAnswers = (b.postId as Question).answers.length;
    //         return bAnswers - aAnswers;
    //       });
    //     } else if (sortOption === 'views') {
    //       collection.savedPosts.sort((a, b) => {
    //         const aViews = (a.postId as Question).views.length;
    //         const bViews = (b.postId as Question).views.length;
    //         return bViews - aViews;
    //       });
    //     } else if (sortOption === 'title') {
    //       collection.savedPosts.sort((a, b) => {
    //         const aTitle = (a.postId as Question).title.toLowerCase();
    //         const bTitle = (b.postId as Question).title.toLowerCase();
    //         return aTitle.localeCompare(bTitle);
    //       });
    //     } // Add more sorting options if needed
    //   });
    // }

    return collections;
  } catch (error) {
    return [];
  }
};

/**
 * Follows a user to a bookmark collection.
 * This can be used to grant view access to a private bookmark collection for a non-owner user.
 * @param collectionId - the ID of the bookmark collection to follow
 * @param username - the username of the user following the collection
 * @returns the updated bookmark collection
 */
export const followBookmarkCollection = async (
  collectionId: string,
  username: string,
): Promise<BookmarkCollectionResponse> => {
  try {
    const updatedCollection = await BookmarkCollectionModel.findOneAndUpdate(
      {
        _id: new ObjectId(collectionId),
        // isPublic: true
      },
      { $addToSet: { followers: username } },
      { new: true },
    );

    if (!updatedCollection) {
      throw new Error('Bookmark collection not found or is not public');
    }

    // Update the user's followedBookmarkCollections
    await UserModel.findOneAndUpdate(
      { username },
      { $addToSet: { followedBookmarkCollections: collectionId } },
    );

    return updatedCollection;
  } catch (error) {
    return { error: `Error when following bookmark collection: ${(error as Error).message}` };
  }
};

/**
 * Unfollows a bookmark collection.
 * @param collectionId - the ID of the bookmark collection to unfollow
 * @param username - the username of the user unfollowing the collection
 * @returns the updated bookmark collection
 */
export const unfollowBookmarkCollection = async (
  collectionId: string,
  username: string,
): Promise<BookmarkCollectionResponse> => {
  try {
    const updatedCollection = await BookmarkCollectionModel.findOneAndUpdate(
      { _id: new ObjectId(collectionId) },
      { $pull: { followers: username } },
      { new: true },
    );

    if (!updatedCollection) {
      throw new Error('Bookmark collection not found');
    }

    // Update the user's followedBookmarkCollections
    await UserModel.findOneAndUpdate(
      { username },
      { $pull: { followedBookmarkCollections: collectionId } },
    );

    return updatedCollection;
  } catch (error) {
    return { error: `Error when unfollowing bookmark collection: ${(error as Error).message}` };
  }
};

/**
 * Retrieves content from followed bookmark collections.
 * @param username - the username of the user
 * @returns an array of bookmark collections the user is following
 */
export const getFollowedBookmarkCollections = async (
  username: string,
): Promise<BookmarkCollection[]> => {
  try {
    const user = await UserModel.findOne({ username });

    if (!user) {
      throw new Error('User not found');
    }

    const collections = await BookmarkCollectionModel.find({
      _id: { $in: user.followedBookmarkCollections },
    }).populate({
      path: 'savedPosts',
      model: 'Question',
      populate: { path: 'tags', model: TagModel },
    });

    return collections;
  } catch (error) {
    return [];
  }
};

/**
 * Updates a user's activityHistory in the database with the question that they commented or answered on.
 * @param username - the username of the user
 * @param qid - the ID of the question
 * @param type - the type of post (comment or answer)
 * @param date - the date of the comment or answer
 */
export const updateActivityHistoryWithQuestionID = async (
  username: string,
  qid: string,
  type: 'comment' | 'answer',
  date: Date,
): Promise<void> => {
  try {
    if (!qid) {
      throw new Error('Provided question ID is undefined.');
    }
    // find the title of the question
    const question = await QuestionModel.findOne({ _id: qid });
    if (!question) {
      throw new Error('Question not found');
    }

    const questionTitle = question.title;

    if (type === 'comment') {
      await UserModel.findOneAndUpdate(
        { username },
        {
          $push: {
            activityHistory: {
              postId: qid,
              postType: 'Comment',
              qTitle: questionTitle,
              createdAt: date,
            },
          },
        },
      );
    } else if (type === 'answer') {
      await UserModel.findOneAndUpdate(
        { username },
        {
          $push: {
            activityHistory: {
              postId: qid,
              postType: 'Answer',
              qTitle: questionTitle,
              createdAt: date,
            },
          },
        },
      );
    }
  } catch (error) {
    // Log the error for debugging purposes
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    // eslint-disable-next-line no-console
    console.log('Error when updating activity history with question ID:', errorMessage);
  }
};

/**
 * Gets the question ID that contains the answer with the given answer ID.
 * @param answerID - the ID of the answer
 * @returns the ID of the question containing the answer.
 */
export const findQuestionIDByAnswerID = async (answerID: string): Promise<string | null> => {
  try {
    const question = await QuestionModel.findOne({ answers: new ObjectId(answerID) });

    if (!question) {
      throw new Error('Question not found');
    }
    // eslint-disable-next-line no-console
    console.log(question._id.toString());
    return question._id.toString();
  } catch (error) {
    throw new Error('Error when finding question ID by answer ID');
  }
};

/**
 * Finds and retrieves a bookmark collection by its ID.
 * @param collectionId - the ID of the bookmarkCollection to retrieve
 * @returns - the bookmarkCollection with the given ID
 */
export const getBookmarkCollectionById = async (
  collectionId: string,
): Promise<BookmarkCollectionResponse> => {
  try {
    const collection = await BookmarkCollectionModel.findOne({ _id: collectionId });
    // .populate({
    //   path: 'savedPosts.postId',
    //   model: 'Question',
    //   // populate: { path: 'questions', model: QuestionModel },
    // });
    if (!collection) {
      throw new Error('Bookmark collection not found');
    }
    return collection;
  } catch (error) {
    return { error: `Error when retrieving bookmark collection: ${(error as Error).message}` };
  }
};

/**
 * Flags a post (Question, Answer, or Comment) as inappropriate.
 *
 * @param id - The unique identifier of the post being flagged.
 * @param type - The type of the post, either 'question', 'answer', or 'comment'.
 * @param reason - The reason for flagging the post.
 * @param flaggedBy - The username of the user flagging the post.
 *
 * @returns A Promise that resolves to the updated post, or an error message if the operation fails.
 */
export const flagPost = async (
  id: string,
  type: 'question' | 'answer' | 'comment',
  reason: FlagReason,
  flaggedBy: string,
): Promise<QuestionResponse | AnswerResponse | CommentResponse> => {
  try {
    // Create new flag document
    const newFlag = new FlagModel({
      flaggedBy,
      reason,
      dateFlagged: new Date(),
      status: 'pending',
      postId: id,
      postType: type,
    });
    const savedFlag = await newFlag.save();

    // Add the flag to the post's flags array
    let updatedPost;

    if (type === 'question') {
      updatedPost = await QuestionModel.findOneAndUpdate(
        { _id: id },
        { $push: { flags: savedFlag._id } },
        { new: true },
      );
    } else if (type === 'answer') {
      updatedPost = await AnswerModel.findOneAndUpdate(
        { _id: id },
        { $push: { flags: savedFlag._id } },
        { new: true },
      );
    } else if (type === 'comment') {
      updatedPost = await CommentModel.findOneAndUpdate(
        { _id: id },
        { $push: { flags: savedFlag._id } },
        { new: true },
      );
    } else {
      throw new Error('Invalid type specified');
    }

    if (!updatedPost) {
      throw new Error('Post not found');
    }

    return updatedPost;
  } catch (error) {
    return { error: `Error when flagging post: ${(error as Error).message}` };
  }
};

export const MODERATORUSERNAME = ['mod1', 'mod2', 'mod3', 'mod4'];

export const getFlaggedPosts = async (): Promise<{
  questions: Question[];
  answers: Answer[];
  comments: Comment[];
}> => {
  try {
    const flaggedQuestions = await QuestionModel.find({ 'flags.status': 'pending' }).populate([
      { path: 'flags', model: FlagModel },
    ]);
    const flaggedAnswers = await AnswerModel.find({ 'flags.status': 'pending' }).populate([
      { path: 'flags', model: FlagModel },
    ]);
    const flaggedComments = await CommentModel.find({ 'flags.status': 'pending' }).populate([
      { path: 'flags', model: FlagModel },
    ]);
    return { questions: flaggedQuestions, answers: flaggedAnswers, comments: flaggedComments };
  } catch (error) {
    return { questions: [], answers: [], comments: [] };
  }
};

export const markFlagAsReviewed = async (
  flagId: string,
  moderatorUsername: string,
): Promise<{ success: boolean; message?: string }> => {
  try {
    if (!MODERATORUSERNAME.includes(moderatorUsername)) {
      return { success: false, message: 'User is not authorized to perform this action' };
    }

    const updatedFlag = await FlagModel.findOneAndUpdate(
      { _id: flagId },
      { status: 'reviewed', reviewedBy: moderatorUsername, reviewedAt: new Date() },
      { new: true },
    );

    if (!updatedFlag) {
      return { success: false, message: 'Flag not found' };
    }

    return { success: true };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
};

export const deletePost = async (
  id: string,
  type: 'question' | 'answer' | 'comment',
  moderatorUsername: string,
): Promise<{ success: boolean; message?: string }> => {
  try {
    if (!MODERATORUSERNAME.includes(moderatorUsername)) {
      return { success: false, message: 'User is not authorized to perform this action' };
    }

    if (type === 'question') {
      const question = await QuestionModel.findById(id);
      if (!question) {
        return { success: false, message: 'Question not found' };
      }
      await AnswerModel.deleteMany({ _id: { $in: question.answers } });
      await CommentModel.deleteMany({ _id: { $in: question.comments } });
      await QuestionModel.deleteOne({ _id: id });
    } else if (type === 'answer') {
      const answer = await AnswerModel.findById(id);
      if (!answer) {
        return { success: false, message: 'Answer not found' };
      }
      await CommentModel.deleteMany({ _id: { $in: answer.comments } });
      await AnswerModel.deleteOne({ _id: id });
      await QuestionModel.updateMany({}, { $pull: { answers: id } });
    } else if (type === 'comment') {
      await CommentModel.deleteOne({ _id: id });
      await QuestionModel.updateMany({}, { $pull: { comments: id } });
      await AnswerModel.updateMany({}, { $pull: { comments: id } });
    }

    await FlagModel.deleteMany({ postId: id });

    return { success: true };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
};
