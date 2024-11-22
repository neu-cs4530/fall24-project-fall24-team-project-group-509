import express, { Response } from 'express';
import {
  CreateBookmarkCollectionRequest,
  AddQuestionToBookmarkCollectionRequest,
  RemovePostFromBookmarkCollectionRequest,
  FollowBookmarkCollectionRequest,
  UnfollowBookmarkCollectionRequest,
  GetBookmarksRequest,
  FakeSOSocket,
  BookmarkCollectionUpdatePayload,
  BookmarkSortOption,
  GetBookmarkCollectionByIdRequest,
} from '../types';
import {
  createBookmarkCollection,
  addQuestionToBookmarkCollection,
  removeQuestionFromBookmarkCollection,
  getUserBookmarkCollections,
  followBookmarkCollection,
  unfollowBookmarkCollection,
  getBookmarkCollectionById,
  notifyFollowersOfCollectionUpdate,
} from '../models/application';

const bookmarkController = (socket: FakeSOSocket) => {
  const router = express.Router();

  /**
   * Creates a new bookmark collection.
   * @param req The request containing username, title, and isPublic.
   * @param res The response object.
   */
  const createBookmarkCollectionRoute = async (
    req: CreateBookmarkCollectionRequest,
    res: Response,
  ): Promise<void> => {
    const { username, title, isPublic } = req.body;

    if (!username || !title || isPublic === undefined) {
      res.status(400).send('Invalid request');
      return;
    }

    try {
      const result = await createBookmarkCollection(username, title, isPublic);
      if ('error' in result) {
        throw new Error(result.error);
      }

      res.json(result);
    } catch (err: unknown) {
      res.status(500).send(`Error when creating bookmark collection: ${(err as Error).message}`);
    }
  };

  /**
   * Adds a question to a bookmark collection.
   * @param req The request containing collectionId and postId.
   * @param res The response object.
   */
  const addQuestionToBookmarkCollectionRoute = async (
    req: AddQuestionToBookmarkCollectionRequest,
    res: Response,
  ): Promise<void> => {
    const { collectionId, postId } = req.body;

    if (!collectionId || !postId) {
      res.status(400).send('Invalid request');
      return;
    }

    try {
      const updatedCollection = await addQuestionToBookmarkCollection(collectionId, postId);
      if ('error' in updatedCollection) {
        throw new Error(updatedCollection.error);
      }

      // Emit collection update to followers
      // socket.emit('collectionUpdate', {
      //   collectionId,
      //   updatedCollection,
      // } as BookmarkCollectionUpdatePayload);
      await notifyFollowersOfCollectionUpdate(collectionId, updatedCollection, socket);

      res.json(updatedCollection);
    } catch (err: unknown) {
      res.status(500).send(`Error when adding question to collection: ${(err as Error).message}`);
    }
  };

  /**
   * Removes a question from a bookmark collection.
   * @param req The request containing collectionId and postId.
   * @param res The response object.
   */
  const removeQuestionFromBookmarkCollectionRoute = async (
    req: RemovePostFromBookmarkCollectionRequest,
    res: Response,
  ): Promise<void> => {
    const { collectionId, postId } = req.body;

    if (!collectionId || !postId) {
      res.status(400).send('Invalid request');
      return;
    }

    try {
      const updatedCollection = await removeQuestionFromBookmarkCollection(collectionId, postId);
      if ('error' in updatedCollection) {
        throw new Error(updatedCollection.error);
      }

      // Emit collection update to followers
      socket.emit('collectionUpdate', {
        collectionId,
        updatedCollection,
      } as BookmarkCollectionUpdatePayload);

      res.json(updatedCollection);
    } catch (err: unknown) {
      res
        .status(500)
        .send(`Error when removing question from collection: ${(err as Error).message}`);
    }
  };

  /**
   * Retrieves a user's bookmark collections.
   * @param req The request containing username, requesterUsername, and optional sortOption.
   * @param res The response object.
   */
  const getUserBookmarkCollectionsRoute = async (
    req: GetBookmarksRequest,
    res: Response,
  ): Promise<void> => {
    const { username } = req.params;
    const { requesterUsername } = req.params;
    const sortOptionParam = req.query.sortOption as string;

    if (!username || !requesterUsername) {
      res.status(400).send('Invalid request: missing username or requesterUsername');
      return;
    }

    let sortOption: BookmarkSortOption | undefined;
    if (sortOptionParam) {
      // Validate sortOption
      const validSortOptions: BookmarkSortOption[] = [
        'date',
        'numberOfAnswers',
        'views',
        'title',
        'tags',
      ];
      if (validSortOptions.includes(sortOptionParam as BookmarkSortOption)) {
        sortOption = sortOptionParam as BookmarkSortOption;
      } else {
        res.status(400).send('Invalid sortOption');
        return;
      }
    }

    try {
      const collections = await getUserBookmarkCollections(username, requesterUsername, sortOption);
      if ('error' in collections) {
        throw new Error(collections.error as string);
      }

      res.json(collections);
    } catch (err: unknown) {
      res.status(500).send(`Error when retrieving bookmark collections: ${(err as Error).message}`);
    }
  };

  /**
   * Follows a bookmark collection.
   * @param req The request containing collectionId and username.
   * @param res The response object.
   */
  const followBookmarkCollectionRoute = async (
    req: FollowBookmarkCollectionRequest,
    res: Response,
  ): Promise<void> => {
    const { collectionId, username } = req.body;

    if (!collectionId || !username) {
      res.status(400).send('Invalid request');
      return;
    }

    try {
      const updatedCollection = await followBookmarkCollection(collectionId, username);
      if ('error' in updatedCollection) {
        throw new Error(updatedCollection.error);
      }

      res.json(updatedCollection);
    } catch (err: unknown) {
      res.status(500).send(`Error when following collection: ${(err as Error).message}`);
    }
  };

  /**
   * Unfollows a bookmark collection.
   * @param req The request containing collectionId and username.
   * @param res The response object.
   */
  const unfollowBookmarkCollectionRoute = async (
    req: UnfollowBookmarkCollectionRequest,
    res: Response,
  ): Promise<void> => {
    const { collectionId, username } = req.body;

    if (!collectionId || !username) {
      res.status(400).send('Invalid request');
      return;
    }

    try {
      const updatedCollection = await unfollowBookmarkCollection(collectionId, username);
      if ('error' in updatedCollection) {
        throw new Error(updatedCollection.error);
      }

      res.json(updatedCollection);
    } catch (err: unknown) {
      res.status(500).send(`Error when unfollowing collection: ${(err as Error).message}`);
    }
  };

  /**
   * Retrieves a bookmark collection by its ID.
   * @param req - the GetBookmarkCollectionByIdRequest object containing the collectionId
   * @param res - the response object
   * @returns - a Promise that resolves to void
   */
  const getBookmarkCollectionByIdRoute = async (
    req: GetBookmarkCollectionByIdRequest,
    res: Response,
  ): Promise<void> => {
    const { collectionId } = req.params;

    if (!collectionId) {
      res.status(400).send('Invalid request');
      return;
    }

    try {
      const collection = await getBookmarkCollectionById(collectionId);
      if ('error' in collection) {
        throw new Error(collection.error);
      }

      res.json(collection);
    } catch (err: unknown) {
      res.status(500).send(`Error when retrieving bookmark collection: ${(err as Error).message}`);
    }
  };

  // Define routes
  router.post('/createCollection', createBookmarkCollectionRoute);
  router.post('/addQuestionToCollection', addQuestionToBookmarkCollectionRoute);
  router.post('/removeQuestionFromCollection', removeQuestionFromBookmarkCollectionRoute);
  router.get('/getUserCollections/:username/:requesterUsername', getUserBookmarkCollectionsRoute);
  router.post('/followCollection', followBookmarkCollectionRoute);
  router.post('/unfollowCollection', unfollowBookmarkCollectionRoute);
  router.get('/getBookmarkCollectionById/:collectionId', getBookmarkCollectionByIdRoute);

  return router;
};

export default bookmarkController;
