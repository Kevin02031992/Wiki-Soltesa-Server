const express = require('express');

const postController = require('../controllers/post');

const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

router.post('/posts',authenticateToken.authenticateToken, postController.getPosts);

router.post('/myposts',authenticateToken.authenticateToken,  postController.getUserPosts);

router.get('/post/:cod', authenticateToken.authenticateToken, postController.getPost);

router.get('/file/:cod', authenticateToken.authenticateToken, postController.getFile);

router.get('/categories', authenticateToken.authenticateToken, postController.getCategories);

router.post('/comment', authenticateToken.authenticateToken, postController.postComment);

router.post('/favorite', authenticateToken.authenticateToken, postController.postFavorite);

router.post('/new', authenticateToken.authenticateToken, postController.newPost);

router.post('/upload/:cod',  authenticateToken.authenticateToken, postController.uploadFiles);

router.put('/update', authenticateToken.authenticateToken, postController.updatePost);

router.put('/status', authenticateToken.authenticateToken, postController.updateState);

router.delete('/post/:cod',authenticateToken.authenticateToken, postController.deletePost);

router.delete('/comment/:cod',authenticateToken.authenticateToken, postController.deleteComment);

router.post('/pending', authenticateToken.authenticateToken, postController.getPendingPost);

router.get('/comments/:cod', authenticateToken.authenticateToken , postController.getComments);

router.post('/assignPost',/*  authenticateToken.authenticateToken, */ postController.assignPost);



module.exports = router;