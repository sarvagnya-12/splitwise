const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes are protected AND strictly require 'admin' role
router.use(protect, authorize('admin'));

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

module.exports = router;
