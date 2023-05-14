import * as React from "react";
import * as ReactDOM from "react-dom";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Home from "./pages/home/Home";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Profile from "./pages/profile/Profile";
import DetailedPost from "./components/detailedPost/DetailedPost";

function App() {
  const { currentUser } = useContext(AuthContext);
  console.log(currentUser);

  const AuthRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  const router = createBrowserRouter([
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/",
      element: (
        <AuthRoute>
          <Home />
        </AuthRoute>
      ),
    },
    {
      path: "/profile",
      element: (
        <AuthRoute>
          <Profile />
        </AuthRoute>
      ),
    },
    {
      path: "/detailPost/:id",
      element: (
        <AuthRoute>
          <DetailedPost />
        </AuthRoute>
      ),
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
