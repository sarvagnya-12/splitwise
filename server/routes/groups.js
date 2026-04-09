const express = require('express');
const router = express.Router();
const { createGroup, getGroups, getGroupById } = require('../controllers/groupController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getGroups).post(createGroup);
router.route('/:id').get(getGroupById);

module.exports = router;
