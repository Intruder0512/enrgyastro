const BlogPost = require('../models/BlogPost');
const { toEmbedUrl } = require('../utils/videoEmbed');

const PAGE_SIZE = 9;

exports.listPosts = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);

  const [posts, total] = await Promise.all([
    BlogPost.find({ status: 'published' })
      .sort('-publishedAt')
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE),
    BlogPost.countDocuments({ status: 'published' })
  ]);

  res.render('blog/index', {
    title: 'Blog',
    posts,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE)
  });
};

exports.showPost = async (req, res) => {
  const post = await BlogPost.findOne({ slug: req.params.slug, status: 'published' });
  if (!post) return res.status(404).render('error', { title: 'Not Found', message: 'This post could not be found.' });

  const embedUrl = toEmbedUrl(post.videoUrl);

  const related = await BlogPost.find({ status: 'published', _id: { $ne: post._id } })
    .sort('-publishedAt')
    .limit(3);

  res.render('blog/show', { title: post.title, post, embedUrl, related });
};
