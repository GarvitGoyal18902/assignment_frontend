import type { RouteObject } from 'react-router-dom';
import Login from '../containers/Login/Login';
import PollResult from '../containers/PollResult';
import QuestionManager from '../containers/QuestionManager';
import StudentPoll from '../containers/StudentPoll';
import StudentPollScreen from '../containers/StudentPollScreen';
import WaitingScreen from '../containers/WaitingScreen';

// Central route configuration for the app.
// You can consume this with React Router's `useRoutes` or
// `createBrowserRouter` APIs if you decide to move routing
// out of `App.tsx`.
const routes: RouteObject[] = [
    { path: '/', element: <Login /> },
    { path: '/question-manager', element: <QuestionManager /> },
    { path: '/student', element: <StudentPoll /> },
    { path: '/student/poll', element: <StudentPollScreen /> },
    { path: '/poll/:id', element: <PollResult /> },
    { path: '/waiting', element: <WaitingScreen /> }
];

export default routes;
