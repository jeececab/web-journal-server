const express = require('express');
const router = new express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/post');
const User = require('../models/user');

router.post('/posts', auth, createPost);
router.get('/posts/:date_title', auth, fetchPost);
router.patch('/posts/:date_title', auth, updatePost);
router.get('/posts', auth, fetchUserPosts);

async function createPost(req, res) {
  const post = new Post({
    ...req.body,
    user_id: req.userId
  });

  try {
    await post.save();
    res.status(201).send({ post });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
}

async function fetchPost(req, res) {
  try {
    const post = await Post.findOne({ date_title: req.params.date_title, user_id: req.userId });
    if (!post) return res.status(200).send({ error: 'Post not found' });
    res.send({ post });
  } catch (e) {
    res.status(500).send();
  }
}

async function updatePost(req, res) {
  const updates = Object.keys(req.body);
  try {
    const post = await Post.findOne({ date_title: req.params.date_title, user_id: req.userId });

    updates.forEach(update => (post[update] = req.body[update]));
    await post.save();
    res.status(201).send({ post });
  } catch (error) {
    res.status(400).send({ error });
  }
}

async function fetchUserPosts(req, res) {
  try {
    const user = await User.findOne({ _id: req.userId });
    if (!user) return res.status(404).send({ error: 'User not found' });

    const match = {};
    let limit = Number(req.query.limit);
    const skip = Number(req.query.skip) > 0 ? Number(req.query.skip) * Number(req.query.limit) : 0;
    const sort = { date_title: req.query.sort === 'desc' ? -1 : 1 };

    const count = await Post.find({ user_id: req.userId }).countDocuments();

    if (req.query.month) {
      match.date_title = new RegExp(req.query.month, 'i');
    }

    await user
      .populate({
        path: 'posts',
        match,
        options: {
          limit,
          skip,
          sort
        }
      })
      .execPopulate();
    res.send({
      posts: user.posts,
      meta: {
        documentsCount: count,
        currentPage: Number(req.query.skip) + 1,
        totalPages: Math.ceil(count / Number(req.query.limit))
      }
    });
  } catch (error) {
    res.status(500).send();
  }
}

module.exports = router;
