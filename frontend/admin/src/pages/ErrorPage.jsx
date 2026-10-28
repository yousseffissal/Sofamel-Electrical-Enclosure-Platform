import {
  useRouteError,
  isRouteErrorResponse,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function ErrorPage({
  status: customStatus,
  title: customTitle,
  message: customMessage,
}) {

  const error = useRouteError();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  let status = customStatus || 500;
  let title = customTitle || "Something Went Wrong";
  let message = customMessage || "An unexpected error occurred.";

  if (!customStatus && isRouteErrorResponse(error)) {

    status = error.status;

    switch (error.status) {

      case 404:
        title = "Page Not Found";
        message = "The page you are looking for does not exist.";
        break;

      case 403:
        title = "Unauthorized";
        message = "You do not have permission to access this page.";
        break;

      case 401:
        title = "Session Expired";
        message = "Please login again.";
        break;

      default:
        title = `${error.status} ${error.statusText}`;
        message = "An unexpected error occurred.";
    }
  }

  return (
    <div
      className={`w-full flex items-center justify-center bg-gray-50 px-6 ${status === 403 ? "h-full" : "min-h-screen"
        }`}
    >
      <div className="text-center max-w-xl">

        {/* Status */}
        <h2 className="text-8xl font-extrabold text-red-600">
          {status}
        </h2>

        {/* Title */}
        <h1 className="mt-2 text-4xl font-bold text-red-600">
          {title}
        </h1>

        {/* Message */}
        <p className="mt-4 text-gray-600 text-lg">
          {message}
        </p>

        {/* Buttons */}
        <div className="mt-8 flex gap-4 justify-center">

          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 bg-gray-800 text-white rounded-lg hover:opacity-80 transition"
          >
            Go Back
          </button>

          <button
            onClick={() =>
              navigate(isAuthenticated ? "/dashboard/overview" : "/")
            }
            className="px-5 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:opacity-80 transition"
          >
            Back Home
          </button>

        </div>
      </div>
    </div>
  );
}

export default ErrorPage;