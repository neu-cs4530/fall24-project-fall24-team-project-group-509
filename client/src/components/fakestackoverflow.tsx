import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layout';
import Login from './login';
import { FakeSOSocket, User } from '../types';
import LoginContext from '../contexts/LoginContext';
import UserContext from '../contexts/UserContext';
import QuestionPage from './main/questionPage';
import TagPage from './main/tagPage';
import NewQuestionPage from './main/newQuestion';
import NewAnswerPage from './main/newAnswer';
import AnswerPage from './main/answerPage';
import ProfileView from './main/userPage/userProfile';
import BookmarkPage from './main/bookmarkPage';
import FlagQuestionPage from './main/flagQuestionPage';
import FlagAnswerPage from './main/flagAnswerPage';
import FlagCommentPage from './main/flagCommentPage';
import ModeratorPage from './main/moderatorPage';
import ModeratorActionPage from './main/moderatorActionsPage';
import SearchResultsPage from './main/searchResultsPage';
import NotificationPage from './main/notificationsPage';
import Signup from './signup';

const ProtectedRoute = ({
  user,
  socket,
  children,
}: {
  user: User | null;
  socket: FakeSOSocket | null;
  children: JSX.Element;
}) => {
  if (!user || !socket) {
    return <Navigate to='/' />;
  }

  return <UserContext.Provider value={{ user, socket }}>{children}</UserContext.Provider>;
};

/**
 * Represents the main component of the application.
 * It manages the state for search terms and the main title.
 */
const FakeStackOverflow = ({ socket }: { socket: FakeSOSocket | null }) => {
  const [user, setUser] = useState<User | null>(null);

  return (
    <LoginContext.Provider value={{ setUser }}>
      <Routes>
        {/* Public Route */}
        <Route path='/' element={<Login />} />
        <Route path='/signup' element={<Signup />} />

        {/* Protected Routes */}
        {
          <Route
            element={
              <ProtectedRoute user={user} socket={socket}>
                <Layout />
              </ProtectedRoute>
            }>
            <Route path='/home' element={<QuestionPage />} />
            <Route path='tags' element={<TagPage />} />
            <Route path='/question/:qid' element={<AnswerPage />} />
            <Route path='/new/question' element={<NewQuestionPage />} />
            <Route path='/new/answer/:qid' element={<NewAnswerPage />} />
            <Route path='/search-results' element={<SearchResultsPage />} />
            <Route path='/profile/:username' element={<ProfileView />} />
            <Route path='/user/:username' element={<ProfileView />} />
            <Route path='/user/bookmarks/:collectionId' element={<BookmarkPage />} />
            <Route path='/flag/question/:qid' element={<FlagQuestionPage />} />
            <Route path='/flag/answer/:aid' element={<FlagAnswerPage />} />
            <Route path='/flag/comment/:cid' element={<FlagCommentPage />} />
            <Route path='/flags' element={<ModeratorPage />} />
            <Route path='flags/:fid' element={<ModeratorActionPage />} />
            <Route path='/notifications' element={<NotificationPage />} />
          </Route>
        }
      </Routes>
    </LoginContext.Provider>
  );
};

export default FakeStackOverflow;
