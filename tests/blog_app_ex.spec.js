const { test, expect, beforeEach, describe } = require("@playwright/test");
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
    await request.post("/api/users", {
      data: {
        username: "hainh1",
        name: "Hai Nguyen1",
        password: "moe123456",
      },
    });
    await page.goto("/");
  });

  test("Login form is shown", async ({ page }) => {
    await page.getByRole("button", { name: "login" }).click();
    expect(page.getByTestId("username")).toBeVisible();
    expect(page.getByTestId("password")).toBeVisible();
    expect(page.getByRole("button", { name: "login" })).toBeVisible();
  });

  describe("Login", () => {
    test("succeeds with correct credentials", async ({ page }) => {
      loginWith(page, "hainh", "moe123456");
      await expect(page.getByText("Hai Nguyen logged in")).toBeVisible();
    });

    test("fails with wrong credentials", async ({ page }) => {
      loginWith(page, "hainh", "wrongpassword");
      await expect(page.getByText("wrong username or password")).toBeVisible();
    });
  });

  describe("When logged in", () => {
    beforeEach(async ({ page }) => {
      loginWith(page, "hainh", "moe123456");
    });

    test("a new blog can be created", async ({ page }) => {
      await createBlog(page, "created new blog", "author", "url");
      await expect(
        page.locator("li").filter({ hasText: "created new blog" })
      ).toBeVisible();
      await expect(
        page.locator("li").filter({ hasText: "author" })
      ).toBeVisible();
    });
  });

  describe("When there are blogs", () => {
    beforeEach(async ({ page }) => {
      loginWith(page, "hainh", "moe123456");
      await createBlog(page, "first blog", "author", "url");
      await createBlog(page, "second blog", "author", "url");
      await createBlog(page, "third blog", "author", "url");
    });

    test("user can like a blog", async ({ page }) => {
      const secondBlogTitle = await page.getByText("second blog");
      const secondBlog = await secondBlogTitle.locator("..");
      await secondBlog.getByRole("button", { name: "view" }).click();
      await secondBlog.getByTestId("likeButton").click();
      await expect(secondBlog.getByText("likes 1")).toBeVisible();
    });

    test("user can delete a blog", async ({ page }) => {
      page.on("dialog", async (dialog) => {
        expect(dialog.message()).toContain("Remove blog third blog");
        await dialog.accept();
      });
      await page
        .locator("li")
        .filter({ hasText: "third blogauthorview" })
        .getByRole("button")
        .click();
      await page.getByRole("button", { name: "remove" }).click();
      await expect(page.getByText("deleted!")).toBeVisible();
      await expect(
        page.locator("li").filter({ hasText: "third blog" })
      ).toBeHidden();
    });

    test("wrong user cannot delete a blog", async ({ page }) => {
      await page.click("text=logout");
      await loginWith(page, "hainh1", "moe123456");
      await expect(page.getByText("Hai Nguyen1 logged in")).toBeVisible();
      await page
        .locator("li")
        .filter({ hasText: "third blogauthorview" })
        .getByRole("button")
        .click();
      page.on("dialog", async (dialog) => {
        expect(dialog.message()).toContain("Remove blog third blog");
        await dialog.accept();
      });
      await page.getByRole("button", { name: "remove" }).click();
      await expect(page.getByText("Unauthorized")).toBeVisible();
    });

    test("blogs are ordered by likes", async ({ page }) => {
      await page
        .locator("li")
        .filter({ hasText: "second blog" })
        .getByRole("button", { name: "view" })
        .click();
      const secondLikeButton = await page
        .locator("li")
        .filter({ hasText: "second blog" })
        .getByTestId("likeButton");

      for (let i = 0; i < 3; i++) {
        await secondLikeButton.click();
        await page
          .locator("li")
          .filter({ hasText: "second blog" })
          .getByText(`likes ${i + 1}`)
          .waitFor();
      }

      await page
        .locator("li")
        .filter({ hasText: "first blog" })
        .getByRole("button", { name: "view" })
        .click();
      const firstLikeButton = await page
        .locator("li")
        .filter({ hasText: "first blog" })
        .getByTestId("likeButton");

      for (let i = 0; i < 1; i++) {
        await firstLikeButton.click();
        await page
          .locator("li")
          .filter({ hasText: "first blog" })
          .getByText(`likes ${i + 1}`)
          .waitFor();
      }
      await page.getByRole("button", { name: "Sort by likes" }).click();
      expect(await page.locator("li").nth(0).innerText()).toContain(
        "second blog"
      );
    });
  });
});
