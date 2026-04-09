const Group = require('../models/Group');
const User = require('../models/User');

// @route   POST /api/groups
const createGroup = async (req, res, next) => {
  try {
    const { name, memberEmails } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    // Find members by email and include the creator
    let memberIds = [req.user._id];

    if (memberEmails && memberEmails.length > 0) {
      const members = await User.find({ email: { $in: memberEmails } });
      const foundEmails = members.map((m) => m.email);

      // Check for unknown emails
      const notFound = memberEmails.filter((e) => !foundEmails.includes(e));
      if (notFound.length > 0) {
        return res.status(400).json({
          message: `Users not found: ${notFound.join(', ')}`,
        });
      }

      const memberIdsFromEmail = members.map((m) => m._id.toString());
      memberIdsFromEmail.forEach((id) => {
        if (!memberIds.map((m) => m.toString()).includes(id)) {
          memberIds.push(id);
        }
      });
    }

    const group = await Group.create({
      name,
      members: memberIds,
      createdBy: req.user._id,
    });

    const populated = await Group.findById(group._id)
      .populate('members', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json({ success: true, group: populated });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/groups
const getGroups = async (req, res, next) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate('members', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, groups });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/groups/:id
const getGroupById = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'name email')
      .populate('createdBy', 'name email');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check membership
    const isMember = group.members.some(
      (m) => m._id.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({ success: true, group });
  } catch (err) {
    next(err);
  }
};

module.exports = { createGroup, getGroups, getGroupById };
