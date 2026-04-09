const User = require('../models/User');
const Group = require('../models/Group');
const Expense = require('../models/Expense');

// @route   GET /api/admin/users
// @desc    Get all users (admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user (admin only)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete an admin user' });
    }

    // Optional: Could cascade delete groups/expenses here, but keeping it simple
    // Remove user from all groups
    await Group.updateMany(
      { members: req.params.id },
      { $pull: { members: req.params.id } }
    );

    await User.deleteOne({ _id: req.params.id });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, deleteUser };
