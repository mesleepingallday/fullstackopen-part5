const { test, expect, describe, beforeEach } = require("@playwright/test");
const { loginWith, createBlog } = require("./helper");

describe("Blog app", () => {
  beforeEach(async ({ page, request }) => {
    await request.post("/api/testing/reset");
    await request.post("/api/users", {
      data: {
        username: "hainh",
        name: "Hai Nguyen",
        password: "moe123456",
      },
    });
    await page.goto("/");
  });
  test("front page can be opened", async ({ page }) => {
    const locator = await page.getByText("Blogs");
    await expect(locator).toBeVisible();
    await expect(page.getByText("Blog app, Hai Nguyen")).toBeVisible();
  });

  test("login form can be opened", async ({ page }) => {
    loginWith(page, "hainh", "moe123456");
    await expect(page.getByText("Hai Nguyen logged in")).toBeVisible();
  });

  describe("when logged in", () => {
    beforeEach(async ({ page }) => {
      loginWith(page, "hainh", "moe123456");
    });

    describe("and several blogs exists", () => {
      beforeEach(async ({ page }) => {
        await createBlog(page, "first blog", "author", "url");
        await createBlog(page, "second blog", "author", "url");
        await createBlog(page, "third blog", "author", "url");
      });

      test("one of those can be upvoted", async ({ page }) => {
        const viewButtons = await page
          .getByRole("button", { name: "view" })
          .nth(0);
        await viewButtons.click();
        await page.getByTestId("likeButton").click();
        await expect(page.getByText("likes 1")).toBeVisible();
      });

      test("second blog can be upvoted", async ({ page }) => {
        await page.pause();
        const secondBlogTitle = await page.getByText("second blog");
        const secondBlog = await secondBlogTitle.locator("..");
        await secondBlog.getByRole("button", { name: "view" }).click();
        await secondBlog.getByTestId("likeButton").click();
        await expect(secondBlog.getByText("likes 1")).toBeVisible();
      });

      test("a new note can be created", async ({ page }) => {
        createBlog(page, "new blog", "author", "url");

        await expect(
          page.getByText(`a new blog new blog by author added`)
        ).toBeVisible();
      });

      describe("and a blog exists", () => {
        beforeEach(async ({ page }) => {
          createBlog(page, "new blog", "author", "url");
        });

        test("a user can like a blog", async ({ page }) => {
          await page.getByRole("button", { name: "view" }).click();
          await page.getByTestId("likeButton").click();
          await expect(page.getByText("likes 1")).toBeVisible();
        });

        test("a user can delete a blog", async ({ page }) => {
          await page.getByRole("button", { name: "view" }).click();
          page.on("dialog", async (dialog) => {
            expect(dialog.message()).toContain("Remove blog new blog");
            await dialog.accept();
          });
          await page.getByRole("button", { name: "remove" }).click();
          await expect(page.getByText("deleted!")).toBeVisible();
        });
      });
    });
    test.only("login fails with wrong password", async ({ page }) => {
      loginWith(page, "hainh", "wrong");

      await expect(page.getByText("wrong username or password")).toBeVisible();
    });

    test("login fails with wrong username", async ({ page }) => {
      loginWith(page, "wrong", "moe123456");
      const errorDiv = await page.locator(".error");
      await expect(errorDiv).toContainText("wrong username or password");
    });

    test("login fails with wrong password havecss", async ({ page }) => {
      loginWith(page, "hainh", "wrong");

      const errorDiv = await page.locator(".error");
      await expect(errorDiv).toContainText("wrong username or password");
      await expect(errorDiv).toHaveCSS("border-style", "solid");
      await expect(errorDiv).toHaveCSS("color", "rgb(255, 0, 0)");

      await expect(page.getByText("Hai Nguyen logged in")).not.toBeVisible();
    });
  });
});
