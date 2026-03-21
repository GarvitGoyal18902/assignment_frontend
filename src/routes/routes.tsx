import type { RouteObject } from 'react-router-dom';
import Login from '../containers/Login/Login';
import PollResult from '../containers/PollResult';
import QuestionManager from '../containers/QuestionManager';
import StudentPoll from '../containers/StudentPoll';
import StudentPollScreen from '../containers/StudentPollScreen';
import AllPolls from '../containers/AllPolls';
import WaitingScreen from '../containers/WaitingScreen';
import KickWindow from '../containers/KickWindow';

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
    { path: '/poll/all', element: <AllPolls/> },
    { path: '/waiting', element: <WaitingScreen /> },
    { path: '/kicked', element: <KickWindow /> }
];

export default routes;
