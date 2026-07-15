const BlogPost = require('../models/BlogPost');
const fs = require('fs');
const path = require('path');

function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function uniqueSlug(title, excludeId) {
  const base = slugify(title);
  let slug = base;
  let n = 1;
  while (await BlogPost.findOne({ slug, _id: { $ne: excludeId } })) {
    slug = `${base}-${++n}`;
  }
  return slug;
}

exports.listPosts = async (req, res) => {
  const posts = await BlogPost.find().sort('-createdAt');
  res.render('admin/blog-list', { title: 'Manage Blog', posts });
};

exports.showNewForm = (req, res) => {
  res.render('admin/blog-form', { title: 'New Blog Post', post: null, errors: [] });
};

exports.createPost = async (req, res) => {
  try {
    const { title, excerpt, content, videoUrl, status } = req.body;
    const slug = await uniqueSlug(title);

    const post = new BlogPost({
      title,
      slug,
      excerpt,
      content,
      videoUrl: videoUrl || undefined,
      status: status === 'published' ? 'published' : 'draft'
    });

    if (post.status === 'published') post.publishedAt = new Date();
    if (req.session.userId) post.author = req.session.userId;

    if (req.files?.coverImage?.[0]) post.coverImage = `/uploads/blog/${req.files.coverImage[0].filename}`;
    if (req.files?.videoFile?.[0]) post.videoFile = `/uploads/blog/${req.files.videoFile[0].filename}`;

    await post.save();
    res.redirect('/admin/blog');
  } catch (err) {
    res.status(400).render('admin/blog-form', {
      title: 'New Blog Post',
      post: req.body,
      errors: [{ msg: err.message }]
    });
  }
};

exports.showEditForm = async (req, res) => {
  const post = await BlogPost.findById(req.params.id);
  if (!post) return res.status(404).render('error', { title: 'Not Found', message: 'Post not found.' });
  res.render('admin/blog-form', { title: 'Edit Blog Post', post, errors: [] });
};

exports.updatePost = async (req, res) => {
  const post = await BlogPost.findById(req.params.id);
  if (!post) return res.status(404).render('error', { title: 'Not Found', message: 'Post not found.' });

  try {
    const { title, excerpt, content, videoUrl, status } = req.body;

    if (title && title !== post.title) {
      post.slug = await uniqueSlug(title, post._id);
    }

    post.title = title;
    post.excerpt = excerpt;
    post.content = content;
    post.videoUrl = videoUrl || undefined;

    const wasPublished = post.status === 'published';
    post.status = status === 'published' ? 'published' : 'draft';
    if (post.status === 'published' && !wasPublished) post.publishedAt = new Date();

    if (req.files?.coverImage?.[0]) {
      if (post.coverImage) deleteUpload(post.coverImage);
      post.coverImage = `/uploads/blog/${req.files.coverImage[0].filename}`;
    }
    if (req.files?.videoFile?.[0]) {
      if (post.videoFile) deleteUpload(post.videoFile);
      post.videoFile = `/uploads/blog/${req.files.videoFile[0].filename}`;
    }

    await post.save();
    res.redirect('/admin/blog');
  } catch (err) {
    res.status(400).render('admin/blog-form', {
      title: 'Edit Blog Post',
      post: { ...post.toObject(), ...req.body },
      errors: [{ msg: err.message }]
    });
  }
};

exports.togglePublish = async (req, res) => {
  const post = await BlogPost.findById(req.params.id);
  if (!post) return res.status(404).render('error', { title: 'Not Found', message: 'Post not found.' });

  post.status = post.status === 'published' ? 'draft' : 'published';
  if (post.status === 'published' && !post.publishedAt) post.publishedAt = new Date();
  await post.save();

  res.redirect('/admin/blog');
};

exports.deletePost = async (req, res) => {
  const post = await BlogPost.findById(req.params.id);
  if (post) {
    if (post.coverImage) deleteUpload(post.coverImage);
    if (post.videoFile) deleteUpload(post.videoFile);
    await post.deleteOne();
  }
  res.redirect('/admin/blog');
};

function deleteUpload(relativePath) {
  const full = path.join(__dirname, '..', 'public', relativePath);
  fs.unlink(full, () => {}); // best-effort, ignore errors
}
