import { useAuth } from '../context/AuthContext';

const ExpenseList = ({ expenses, onSettle }) => {
  const { user } = useAuth();

  if (!expenses || expenses.length === 0) {
    return (
      <div className="text-center py-12 text-dark-400">
        <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
        </svg>
        <p className="text-lg font-medium">No expenses yet</p>
        <p className="text-sm mt-1">Add your first expense to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => {
        const isPayer = expense.paidBy?._id === user?._id;
        const isParticipant = expense.participants?.some((p) => p._id === user?._id);
        const splitAmount = expense.amount / (expense.participants?.length || 1);

        return (
          <div
            key={expense._id}
            className={`glass-card p-4 ${expense.settled ? 'opacity-50' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <div className={`w-2 h-2 rounded-full ${expense.settled ? 'bg-dark-500' : isPayer ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <h4 className="text-white font-medium">{expense.description}</h4>
                </div>
                <div className="ml-5 flex items-center gap-4 text-sm">
                  <span className="text-dark-400">
                    Paid by <span className={`font-medium ${isPayer ? 'text-primary-400' : 'text-dark-200'}`}>
                      {isPayer ? 'You' : expense.paidBy?.name}
                    </span>
                  </span>
                  <span className="text-dark-500">•</span>
                  <span className="text-dark-400">
                    Split among {expense.participants?.length || 0}
                  </span>
                </div>
              </div>

              <div className="text-right flex items-center gap-4">
                <div>
                  <p className="text-lg font-bold text-white">₹{expense.amount.toFixed(2)}</p>
                  {!expense.settled && isParticipant && !isPayer && (
                    <p className="text-xs text-red-400 font-medium">You owe ₹{splitAmount.toFixed(2)}</p>
                  )}
                  {!expense.settled && isPayer && (
                    <p className="text-xs text-emerald-400 font-medium">You get back ₹{(expense.amount - splitAmount).toFixed(2)}</p>
                  )}
                  {expense.settled && (
                    <p className="text-xs text-dark-500 font-medium">Settled</p>
                  )}
                </div>

                {!expense.settled && onSettle && (
                  <button
                    onClick={() => onSettle(expense._id)}
                    className="px-3 py-1.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-all"
                    title="Mark as settled"
                  >
                    Settle
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ExpenseList;
