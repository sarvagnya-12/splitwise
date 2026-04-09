const BalanceSummary = ({ balances, settlements }) => {
  if ((!balances || balances.length === 0) && (!settlements || settlements.length === 0)) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Individual Balances */}
      {balances && balances.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wider mb-3">Member Balances</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {balances.map((b) => (
              <div key={b.user._id} className="glass-card p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                    {b.user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-dark-200 font-medium">{b.user.name}</span>
                </div>
                <span
                  className={`text-sm font-bold ${
                    b.balance > 0
                      ? 'text-emerald-400'
                      : b.balance < 0
                      ? 'text-red-400'
                      : 'text-dark-400'
                  }`}
                >
                  {b.balance > 0 ? '+' : ''}₹{b.balance.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settlements */}
      {settlements && settlements.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wider mb-3">Who Owes Whom</h3>
          <div className="space-y-2">
            {settlements.map((s, idx) => (
              <div key={idx} className="glass-card p-3 flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white text-xs font-bold">
                    {s.from.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-dark-200 font-medium">{s.from.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <span className="text-sm font-bold text-amber-400">₹{s.amount.toFixed(2)}</span>
                  <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>

                <div className="flex items-center gap-2 flex-1 justify-end">
                  <span className="text-sm text-dark-200 font-medium">{s.to.name}</span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                    {s.to.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BalanceSummary;
