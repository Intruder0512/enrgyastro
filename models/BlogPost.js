const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, trim: true, maxlength: 300 },
    content: { type: String, required: true }, // rich-text HTML from the admin editor

    coverImage: { type: String }, // path under /uploads/blog
    videoUrl: { type: String }, // external YouTube/Vimeo link, auto-embedded
    videoFile: { type: String }, // path under /uploads/blog if directly uploaded

    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    publishedAt: { type: Date },

    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

blogPostSchema.index({ status: 1, publishedAt: -1 });

module.exports = mongoose.model('BlogPost', blogPostSchema);
