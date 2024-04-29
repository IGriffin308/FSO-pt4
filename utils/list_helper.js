const dummy = (blogs) => {
  return 1;
}

const totalLikes = (blogs) => {
  return blogs.reduce((acc, blog) => acc + blog.likes, 0);
};

const favoriteBlog = (blogs) => {
  let favorite = blogs[0];
  blogs.forEach(blog => {
    if (blog.likes > favorite.likes) {
      favorite = blog;
    }
  });
  return favorite;
}

const mostBlogs = (blogs) => {
  let authors = blogs.reduce((acc, blog) => {
    acc[blog.author] = acc[blog.author] ? acc[blog.author] + 1 : 1;
    return acc;
  }, {});
  let mostBlogs = { author: "", blogs: 0 };
  Object.keys(authors).forEach(author => {
    if (authors[author] > mostBlogs.blogs) {
      mostBlogs.author = author;
      mostBlogs.blogs = authors[author];
    }
  });
  return mostBlogs;
};

const mostLikes = (blogs) => {
  let authors = blogs.reduce((acc, blog) => {
    acc[blog.author] = acc[blog.author] ? acc[blog.author] + blog.likes : blog.likes;
    return acc;
  }, {});
  let mostLikes = { author: "", likes: 0 };
  Object.keys(authors).forEach(author => {
    if (authors[author] > mostLikes.likes) {
      mostLikes.author = author;
      mostLikes.likes = authors[author];
    }
  });
  return mostLikes;
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}