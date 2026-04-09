import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import ExpenseList from '../components/ExpenseList';
import AddExpenseModal from '../components/AddExpenseModal';
import BalanceSummary from '../components/BalanceSummary';
import ExpenseChart from '../components/ExpenseChart';

const GroupDetails = () => {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [activeTab, setActiveTab] = useState('expenses');

  const fetchData = async () => {
    try {
      const [groupRes, expensesRes, balancesRes] = await Promise.all([
        API.get(`/groups/${id}`),
        API.get(`/expenses/group/${id}`),
        API.get(`/expenses/balances/${id}`),
      ]);
      setGroup(groupRes.data.group);
      setExpenses(expensesRes.data.expenses);
      setBalances(balancesRes.data.balances || []);
      setSettlements(balancesRes.data.settlements || []);
    } catch (err) {
      console.error('Failed to fetch group data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleSettle = async (expenseId) => {
    try {
      await API.patch(`/expenses/${expenseId}/settle`);
      fetchData();
    } catch (err) {
      console.error('Failed to settle expense:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-10 h-10 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-dark-400 text-sm">Loading group...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <p className="text-dark-400 text-lg">Group not found</p>
        <Link to="/" className="text-primary-400 hover:text-primary-300 mt-2 inline-block">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.settled ? 0 : e.amount), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-dark-400 mb-6">
        <Link to="/" className="hover:text-primary-400 transition-colors">Dashboard</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-dark-200">{group.name}</span>
      </div>

      {/* Group Header */}
      <div className="glass-card p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">{group.name}</h1>
            <div className="flex items-center gap-3 text-sm text-dark-400">
              <span>{group.members?.length} members</span>
              <span>•</span>
              <span>Total active: ₹{totalExpenses.toFixed(2)}</span>
            </div>

            {/* Members */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {group.members?.map((m) => (
                <span
                  key={m._id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-dark-700/50 text-dark-300 border border-dark-600/50"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-[10px] font-bold">
                    {m.name?.charAt(0).toUpperCase()}
                  </div>
                  {m.name}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowAddExpense(true)}
            className="btn-primary shrink-0"
            id="add-expense-btn"
          >
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Expense
            </span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-dark-800/50 rounded-xl w-fit">
        {['expenses', 'balances', 'chart'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                : 'text-dark-400 hover:text-dark-200'
            }`}
          >
            {tab === 'expenses' ? 'Expenses' : tab === 'balances' ? 'Balances' : 'Chart'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'expenses' && (
        <ExpenseList expenses={expenses} onSettle={handleSettle} />
      )}

      {activeTab === 'balances' && (
        <BalanceSummary balances={balances} settlements={settlements} />
      )}

      {activeTab === 'chart' && (
        <ExpenseChart expenses={expenses} />
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <AddExpenseModal
          groupId={id}
          members={group.members || []}
          onClose={() => setShowAddExpense(false)}
          onExpenseAdded={fetchData}
        />
      )}
    </div>
  );
};

export default GroupDetails;
