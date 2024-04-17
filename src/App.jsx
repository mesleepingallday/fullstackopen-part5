import { useState, useEffect, useRef } from "react";
import Blog from "./components/Blog";
import Notification from "./components/Notification";
import loginService from "./services/login";
import blogService from "./services/blogs";
import LoginForm from "./components/LoginForm";
import Togglable from "./components/Togglable";
import BlogForm from "./components/BlogForm";

const App = () => {
  const blogFormRef = useRef();
  const [blogs, setBlogs] = useState([]);
  const [notification, setNotification] = useState({
    type: null,
    content: null,
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [loginVisible, setLoginVisible] = useState(false);

  const updateBlog = async () => {
    const newBlogs = await blogService.getAll();
    setBlogs(newBlogs);
  };

  useEffect(() => {
    updateBlog();
  }, []);

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem("loggedBlogappUser");
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setUser(user);
      blogService.setToken(user.token);
    }
  }, []);

  const handleLogout = () => {
    window.localStorage.removeItem("loggedBlogappUser");
    setUser(null);
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const user = await loginService.login({
        username,
        password,
      });

      window.localStorage.setItem("loggedBlogappUser", JSON.stringify(user));
      blogService.setToken(user.token);
      setUser(user);
      setUsername("");
      setPassword("");
    } catch (exception) {
      console.log(exception);
      if (exception.response.status === 500) {
        setNotification({ type: "error", content: "database error" });
      } else {
        setNotification({
          type: "error",
          content: "wrong username or password",
        });
      }
      setTimeout(() => {
        setNotification({ type: null, content: null });
      }, 5000);
    }
  };

  const loginForm = () => {
    const hideWhenVisible = { display: loginVisible ? "none" : "" };
    const showWhenVisible = { display: loginVisible ? "" : "none" };
    return (
      <div>
        <div style={hideWhenVisible}>
          <button onClick={() => setLoginVisible(true)}>login</button>
        </div>
        <div style={showWhenVisible}>
          <LoginForm
            handleSubmit={handleLogin}
            handleUsernameChange={({ target }) => setUsername(target.value)}
            handlePasswordChange={({ target }) => setPassword(target.value)}
            username={username}
            password={password}
          />
          <button onClick={() => setLoginVisible(false)}>cancel</button>
        </div>
      </div>
    );
  };

  const addBlog = (blogObject) => {
    blogFormRef.current.toggleVisibility();
    blogService
      .create(blogObject)
      .then((returnedBlog) => {
        setBlogs(blogs.concat(returnedBlog));
        setNotification({
          type: "success",
          content: `a new blog ${returnedBlog.title} by ${returnedBlog.author} added`,
        });
      })
      .catch((error) => {
        setNotification({ type: "error", content: error.response.data.error });
      });
    setTimeout(() => {
      setNotification({ type: null, content: null });
    }, 5000);
  };

  const handleSort = () => {
    const sortedBlogs = [...blogs].sort((a, b) => b.likes - a.likes);
    setBlogs(sortedBlogs);
  };

  return (
    <div>
      <h1>Blogs</h1>
      <Notification message={notification} />

      {!user && loginForm()}
      {user && (
        <div>
          <span>{user.name} logged in</span>
          <button onClick={handleLogout}>logout</button>
          <Togglable buttonLabel="create new blog" ref={blogFormRef}>
            <BlogForm createBlog={addBlog} />
          </Togglable>
        </div>
      )}
      <button onClick={handleSort}>Sort by likes</button>
      <ul>
        {blogs.map((blog) => (
          <Blog key={blog.id} blog={blog} onChangeData={updateBlog} />
        ))}
      </ul>
    </div>
  );
};

export default App;
