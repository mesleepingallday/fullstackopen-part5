import React, { useRef } from "react";

const BlogForm = ({ createBlog }) => {
  const formRef = useRef();

  const addBlog = (event) => {
    event.preventDefault();
    const formData = new FormData(formRef.current);
    console.log(formData.get("title"));
    const blogObject = {
      title: formData.get("title"),
      author: formData.get("author"),
      url: formData.get("url"),
      likes: 0,
    };

    createBlog(blogObject);
    formRef.current.reset();
  };
  return (
    <div>
      <h2>Create a new blog</h2>
      <form onSubmit={addBlog} ref={formRef}>
        <div>
          title:
          <input name="title" />
        </div>
        <div>
          author:
          <input name="author" />
        </div>
        <div>
          url:
          <input name="url" />
        </div>
        <button type="submit">save</button>
      </form>
    </div>
  );
};

export default BlogForm;
