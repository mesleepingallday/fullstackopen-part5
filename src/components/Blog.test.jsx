import { render, screen } from "@testing-library/react";
import Blog from "./Blog";
import userEvent from "@testing-library/user-event";
import BlogForm from "./BlogForm";

test("renders content", () => {
  const blog = {
    title: "Component testing is done with react-testing-library",
    author: "Test Author",
    likes: 0,
    url: "http://localhost:3000",
  };

  const { container } = render(<Blog blog={blog} />);

  const div = container.querySelector(".blog");
  expect(div).toHaveTextContent(
    "Component testing is done with react-testing-library"
  );
});

test("renders content + debug", () => {
  const blog = {
    title: "Component testing is done with react-testing-library",
    author: "Test Author",
    likes: 0,
    url: "http://localhost:3000",
  };

  render(<Blog blog={blog} />);

  const element = screen.getByText(
    "Component testing is done with react-testing-library"
  );

  screen.debug(element);

  expect(element).toBeDefined();
});

test("clicking the button calls event handler once", async () => {
  const blog = {
    title: "Component testing is done with react-testing-library",
    author: "Test Author",
    likes: 0,
    url: "http://localhost:3000",
  };

  const component = render(<Blog blog={blog} />);

  const user = userEvent.setup();
  const button = screen.getByText("view");
  await user.click(button);

  const div = component.container.querySelector(".details");
  expect(div).toHaveTextContent("http://localhost:3000");
});

test("render title and author, but not url and likes", () => {
  const blog = {
    title: "Component testing is done with react-testing-library",
    author: "Test author",
    likes: 0,
    url: "http://localhost:3000",
  };
  const { container } = render(<Blog blog={blog} />);
  const div = container.querySelector(".blog");
  expect(div).toHaveTextContent(
    "Component testing is done with react-testing-library"
  );
  expect(div).toHaveTextContent("Test author");
  expect(div).not.toHaveTextContent("http://localhost:3000");
  expect(div).not.toHaveTextContent(0);
});

describe("<Blog />", () => {
  let component;
  let blog;

  beforeEach(() => {
    blog = {
      title: "Component testing is done with react-testing-library",
      author: "Test author",
      likes: 0,
      url: "http://localhost:3000",
    };
    component = render(<Blog blog={blog} />);
  });

  test("clicking the button shows url and likes", async () => {
    const { container } = component;
    const user = userEvent.setup();
    const button = screen.getByText("view");
    await user.click(button);

    const div = container.querySelector(".details");
    expect(div).toHaveTextContent("http://localhost:3000");
    expect(div).toHaveTextContent(0);
  });

  test("clicking like button twice calls event handler twice", async () => {
    const mockHandler = vi.fn();
    const { container } = render(
      <Blog blog={blog} onChangeData={mockHandler} />
    );
    const user = userEvent.setup();
    const viewButton = container.querySelector(".viewButton");
    await user.click(viewButton);

    const likeButton = container.querySelector(".likeButton");
    await user.click(likeButton);
    await user.click(likeButton);

    expect(mockHandler.mock.calls).toHaveLength(2);
  });

  test("form calls event handler with right details", async () => {
    const mockHandler = vi.fn();
    const user = userEvent.setup();

    render(<BlogForm createBlog={mockHandler} />);

    const title = screen.getByPlaceholderText("title");
    const author = screen.getByPlaceholderText("author");
    const url = screen.getByPlaceholderText("url");
    const sendButton = screen.getByText("save");

    await user.type(
      title,
      "Component testing is done with react-testing-library"
    );
    await user.type(author, "Test author");
    await user.type(url, "http://localhost:3000");
    await user.click(sendButton);

    expect(mockHandler.mock.calls).toHaveLength(1);
    expect(mockHandler.mock.calls[0][0].title).toBe(blog.title);
  });
});
