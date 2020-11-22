const mongoose = require('mongoose');
const validator = require('validator');
const Post = require('./post');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    first_name: {
      type: String,
      required: true,
      trim: true
    },
    last_name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) throw new Error('Email is invalid');
      }
    },
    password: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

userSchema.virtual('posts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'user_id'
});

userSchema.pre('remove', async function (next) {
  const user = this;
  await Post.deleteMany({ user_id: user._id });
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
