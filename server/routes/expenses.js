const express = require('express');
const router = express.Router();
const {
  addExpense,
  getExpensesByGroup,
  getGroupBalances,
  getDashboardBalances,
  settleExpense,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', addExpense);
router.get('/dashboard', getDashboardBalances);
router.get('/group/:groupId', getExpensesByGroup);
router.get('/balances/:groupId', getGroupBalances);
router.patch('/:expenseId/settle', settleExpense);

module.exports = router;
