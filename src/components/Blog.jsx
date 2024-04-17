import { useEffect, useState } from "react";
import blogService from "../services/blogs";

const Blog = ({ blog, onChangeData }) => {
  const [view, setView] = useState(false);
  const handleView = () => {
    setView(!view);
  };
  const handleLike = async () => {
    const blogToLike = await blogService.getBlog(blog.id);
    const updatedBlog = { ...blogToLike, likes: blogToLike.likes + 1 };
    await blogService.updateBlog(blog.id, updatedBlog);
    onChangeData();
  };
  const handleDelete = async () => {
    if (window.confirm(`Remove blog ${blog.title}. YOU're NOT  gonna need it! by ${blog.author}`)) {
      await blogService.deleteBlog(blog.id);
      onChangeData();
    }
  };
  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: "solid",
    borderWidth: 1,
    marginBottom: 5,
  };

  return (
    <div>
      <li style={blogStyle}>
        {blog.title}{" "}
        <button onClick={handleView}>{view ? "hide" : "view"}</button>
        {view && (
          <div>
            <p>{blog.url}</p>
            <p>
              likes {blog.likes} <button onClick={handleLike}>like</button>
            </p>
            <p>{blog.author}</p>
            <button onClick={handleDelete}>remove</button>
          </div>
        )}
      </li>
    </div>
  );
};

export default Blog;
