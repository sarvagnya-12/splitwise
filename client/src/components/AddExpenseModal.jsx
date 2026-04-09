import { useState } from 'react';
import API from '../services/api';

const AddExpenseModal = ({ groupId, members, onClose, onExpenseAdded }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState(
    members.map((m) => m._id)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleParticipant = (id) => {
    setSelectedParticipants((prev) =>
      prev.includes(id)
        ? prev.filter((p) => p !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !amount || !paidBy || selectedParticipants.length === 0) {
      setError('Please fill all fields and select at least one participant');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await API.post('/expenses', {
        groupId,
        description,
        amount: parseFloat(amount),
        paidBy,
        participants: selectedParticipants,
      });
      onExpenseAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  const splitAmount = amount && selectedParticipants.length > 0
    ? (parseFloat(amount) / selectedParticipants.length).toFixed(2)
    : '0.00';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Add Expense</h2>
          <button onClick={onClose} className="text-dark-400 hover:text-dark-200 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Dinner, Movie tickets"
              className="input-field"
              id="expense-description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              className="input-field"
              id="expense-amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Paid by</label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="input-field"
              id="expense-paid-by"
            >
              <option value="">Select who paid</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Split among
              {selectedParticipants.length > 0 && (
                <span className="text-primary-400 ml-2">
                  (₹{splitAmount} each)
                </span>
              )}
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {members.map((m) => (
                <label
                  key={m._id}
                  className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                    selectedParticipants.includes(m._id)
                      ? 'bg-primary-500/10 border border-primary-500/20'
                      : 'bg-dark-700/30 border border-dark-600/50 hover:border-dark-500'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedParticipants.includes(m._id)}
                    onChange={() => toggleParticipant(m._id)}
                    className="w-4 h-4 rounded accent-primary-500"
                  />
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                    {m.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-dark-200">{m.name}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            id="submit-expense"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Adding...
              </span>
            ) : (
              'Add Expense'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
