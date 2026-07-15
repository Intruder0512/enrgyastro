const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', asyncHandler(blogController.listPosts));
router.get('/:slug', asyncHandler(blogController.showPost));

module.exports = router;
