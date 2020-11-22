const express = require('express');
const router = new express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/post');

router.post('/posts', auth, createPost);
router.get('/posts/:id', auth, fetchPost);
router.patch('/posts/:id', auth, updatePost);

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
    const post = await Post.findOne({ _id: req.params.id, user_id: req.userId });
    if (!post) return res.status(200).send({ error: 'Post not found' });
    res.status(200).send({ post });
  } catch (e) {
    res.status(500).send();
  }
}

async function updatePost(req, res) {
  const updates = Object.keys(req.body);
  try {
    const post = await Post.findOne({ _id: req.params.id, user_id: req.userId });

    updates.forEach(update => (post[update] = req.body[update]));
    await post.save();
    res.status(201).send({ post });
  } catch (error) {
    res.status(400).send({ error });
  }
}

module.exports = router;
