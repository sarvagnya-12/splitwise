const Expense = require('../models/Expense');
const Group = require('../models/Group');

// @route   POST /api/expenses
const addExpense = async (req, res, next) => {
  try {
    const { groupId, description, amount, paidBy, participants } = req.body;

    if (!groupId || !description || !amount || !paidBy || !participants) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Verify group exists and user is a member
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const isMember = group.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const expense = await Expense.create({
      groupId,
      description,
      amount: parseFloat(amount),
      paidBy,
      participants,
    });

    const populated = await Expense.findById(expense._id)
      .populate('paidBy', 'name email')
      .populate('participants', 'name email');

    res.status(201).json({ success: true, expense: populated });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/expenses/group/:groupId
const getExpensesByGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const isMember = group.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const expenses = await Expense.find({ groupId })
      .populate('paidBy', 'name email')
      .populate('participants', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, expenses });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/expenses/balances/:groupId
// Calculates net balances for each member in the group
const getGroupBalances = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId).populate('members', 'name email');
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const isMember = group.members.some(
      (m) => m._id.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const expenses = await Expense.find({ groupId })
      .populate('paidBy', 'name email')
      .populate('participants', 'name email');

    // net[userId] = amount paid - amount owed
    const net = {};
    group.members.forEach((m) => {
      net[m._id.toString()] = { user: m, balance: 0 };
    });

    expenses.forEach((expense) => {
      if (expense.settled) return;
      const split = expense.amount / expense.participants.length;
      const payerId = expense.paidBy._id.toString();

      expense.participants.forEach((p) => {
        const pid = p._id.toString();
        if (net[pid]) net[pid].balance -= split;
        if (net[payerId]) net[payerId].balance += split;
      });
    });

    // Build "who owes whom" settlements
    const settlements = [];
    const debtors = [];
    const creditors = [];

    Object.values(net).forEach(({ user, balance }) => {
      if (balance < -0.01) debtors.push({ user, amount: -balance });
      else if (balance > 0.01) creditors.push({ user, amount: balance });
    });

    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const d = debtors[i];
      const c = creditors[j];
      const settleAmount = Math.min(d.amount, c.amount);

      settlements.push({
        from: d.user,
        to: c.user,
        amount: Math.round(settleAmount * 100) / 100,
      });

      d.amount -= settleAmount;
      c.amount -= settleAmount;

      if (d.amount < 0.01) i++;
      if (c.amount < 0.01) j++;
    }

    const balances = Object.values(net).map(({ user, balance }) => ({
      user,
      balance: Math.round(balance * 100) / 100,
    }));

    res.json({ success: true, balances, settlements });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/expenses/dashboard
// Returns total owed and to receive for the logged-in user across all groups
const getDashboardBalances = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();

    // Get all groups the user is part of
    const groups = await Group.find({ members: req.user._id });
    const groupIds = groups.map((g) => g._id);

    const expenses = await Expense.find({ groupId: { $in: groupIds }, settled: false })
      .populate('paidBy', 'name email')
      .populate('participants', 'name email');

    let totalOwed = 0;      // user owes others
    let totalToReceive = 0; // others owe user

    expenses.forEach((expense) => {
      const split = expense.amount / expense.participants.length;
      const payerId = expense.paidBy._id.toString();
      const isParticipant = expense.participants.some((p) => p._id.toString() === userId);

      if (payerId === userId && isParticipant) {
        // User paid, others owe user
        totalToReceive += expense.amount - split; // user's own share excluded
      } else if (payerId === userId && !isParticipant) {
        totalToReceive += expense.amount;
      } else if (isParticipant) {
        totalOwed += split;
      }
    });

    res.json({
      success: true,
      totalOwed: Math.round(totalOwed * 100) / 100,
      totalToReceive: Math.round(totalToReceive * 100) / 100,
    });
  } catch (err) {
    next(err);
  }
};

// @route   PATCH /api/expenses/:expenseId/settle
const settleExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.expenseId);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    expense.settled = true;
    await expense.save();

    res.json({ success: true, message: 'Expense settled', expense });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addExpense,
  getExpensesByGroup,
  getGroupBalances,
  getDashboardBalances,
  settleExpense,
};
