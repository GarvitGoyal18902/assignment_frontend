import type { RouteObject } from 'react-router-dom';
import Login from '../containers/Login/Login';
import PollResult from '../containers/PollResult';
import QuestionManager from '../containers/QuestionManager';
import StudentLogin from '../containers/StudentLogin';
import TeacherLogin from '../containers/TeacherLogin';
import StudentPollScreen from '../containers/StudentPollScreen';
import AllPolls from '../containers/AllPolls';
import WaitingScreen from '../containers/WaitingScreen';
import KickWindow from '../containers/KickWindow';


const routes: RouteObject[] = [
    { path: '/', element: <Login /> },
    { path: '/question-manager', element: <QuestionManager /> },
    { path: '/student', element: <StudentLogin /> },
    { path: '/teacher', element: <TeacherLogin /> },
    { path: '/student/poll', element: <StudentPollScreen /> },
    { path: '/poll/:id', element: <PollResult /> },
    { path: '/poll/all', element: <AllPolls/> },
    { path: '/waiting', element: <WaitingScreen /> },
    { path: '/kicked', element: <KickWindow /> }
];

export default routes;
