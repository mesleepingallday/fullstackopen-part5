import { useState } from "react";
import blogService from "../services/blogs";
import PropTypes from "prop-types";

const Blog = ({ blog, onChangeData }) => {
  const [view, setView] = useState(false);
  const handleView = () => {
    setView(!view);
  };
  const handleDelete = async () => {
    if (
      window.confirm(
        `Remove blog ${blog.title}. YOU're NOT  gonna need it! by ${blog.author}`
      )
    ) {
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
      <li style={blogStyle} className="blog">
        {blog.title} <p>{blog.author}</p>
        <button onClick={handleView} className="viewButton">
          {view ? "hide" : "view"}
        </button>
        {view && (
          <div className="details">
            <p>{blog.url}</p>
            <p>
              likes {blog.likes}{" "}
              <button onClick={onChangeData} className="likeButton">
                like
              </button>
            </p>
            <button onClick={handleDelete}>remove</button>
          </div>
        )}
      </li>
    </div>
  );
};

Blog.propTypes = {
  blog: PropTypes.object.isRequired,
  onChangeData: PropTypes.func.isRequired,
};

export default Blog;
