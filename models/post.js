const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      require: true
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: 'User'
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 300,
      default: ''
    },
    book_title: {
      type: String,
      trim: true,
      maxlength: 100,
      default: ''
    },
    book_page_count: {
      type: Number,
      default: 0
    },
    video_title: {
      type: String,
      maxlength: 200,
      default: ''
    },
    video_link: {
      type: String,
      maxlength: 400,
      default: ''
    },
    video_time_count: {
      type: Number,
      default: 0
    },
    project_title: {
      type: String,
      maxlength: 200,
      default: ''
    },
    project_time: {
      type: Number,
      default: 0
    },
    meditation_time: {
      type: Number,
      default: 0
    },
    to_learn: {
      type: String,
      maxlength: 400,
      default: ''
    }
  },
  { timestamps: true }
);

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
