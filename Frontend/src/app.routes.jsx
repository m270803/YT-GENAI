import {createBrowserRouter} from "react-router";
import LogIn from "./features/auth/pages/LogIn";
import Register from "./features/auth/pages/Register";
import Protected from "./features/auth/componenents/Protected";
import Home from "./features/interview/pages/Home";
import Interview from "./features/interview/pages/Interview";

export const router = createBrowserRouter([
    {
        path: "/login",
        element:<LogIn />
    },
    {
        path: "/register",
        element:<Register />
    },
    {
        path: "/",
        element:<Protected><Home /></Protected>
    },
    {
        path: "/interview/:interviewId",
        element: <Protected><Interview /></Protected>
    }
])