const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    splitAmount: {
      type: Number,
    },
    settled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Auto-calculate split amount before saving
expenseSchema.pre('save', function (next) {
  if (this.participants && this.participants.length > 0) {
    this.splitAmount = this.amount / this.participants.length;
  }
  next();
});

module.exports = mongoose.model('Expense', expenseSchema);
