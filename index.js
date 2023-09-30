const express = require("express");
const axios = require("axios");
const _ = require("lodash");
const app = express();
const port = 8000;

let blogData = [];

app.get("/api/blog-stats", async (req, res) => {
  try {
    if (blogData.length === 0) {
      const response = await axios.get(
        "https://intent-kit-16.hasura.app/api/rest/blogs",
        {
          headers: {
            "x-hasura-admin-secret":
              "32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6",
          },
        }
      );

      blogData = response.data;
    }

    // console.log(blogData);

    const totalBlogs = blogData.blogs.length;
    //console.log("1",totalBlogs);
    const longestTitleBlog = _.maxBy(blogData.blogs, "title.length");
    
    const blogsWithPrivacy = _.filter(blogData.blogs, (blog) =>
      _.includes(_.toLower(blog.title), "privacy")
    );

    const uniqueBlogTitles = _.uniqBy(blogData.blogs, "title");

    // Response
    const responseJSON = {
      totalBlogs,
      longestTitle: longestTitleBlog.title,
      blogsWithPrivacy: blogsWithPrivacy.length,
      uniqueBlogTitles: uniqueBlogTitles.map((blog) => blog.title),
    };

    res.status(200).send({
      success: true,
      message: "Success done in blog-stats",
      responseJSON,
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: error,
    });
  }
});

app.get("/api/blog-search", (req, res) => {
  const { query } = req.query;
  try {
    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    //console.log(blogData)
    if (blogData.length === 0) {
      return res.status(500).json({ error: "Blog data not available" });
    }

    // Use blogData for search
    const filteredBlogs = blogData.blogs.filter((blog) =>
      _.includes(_.toLower(blog.title), _.toLower(query))
    );

    res.status(200).send({
      success: true,
      message: "successfully done in blg-search",
      filteredBlogs,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: error,
      error,
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
