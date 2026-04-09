import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import GroupCard from '../components/GroupCard';

const Dashboard = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [totalOwed, setTotalOwed] = useState(0);
  const [totalToReceive, setTotalToReceive] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupEmails, setNewGroupEmails] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  const fetchData = async () => {
    try {
      const [groupsRes, balancesRes] = await Promise.all([
        API.get('/groups'),
        API.get('/expenses/dashboard'),
      ]);
      setGroups(groupsRes.data.groups);
      setTotalOwed(balancesRes.data.totalOwed);
      setTotalToReceive(balancesRes.data.totalToReceive);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    setCreateLoading(true);
    setCreateError('');

    try {
      const memberEmails = newGroupEmails
        .split(',')
        .map((e) => e.trim())
        .filter((e) => e.length > 0);

      await API.post('/groups', {
        name: newGroupName,
        memberEmails,
      });

      setNewGroupName('');
      setNewGroupEmails('');
      setShowCreateGroup(false);
      fetchData();
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setCreateLoading(false);
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
          <p className="text-dark-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const netBalance = totalToReceive - totalOwed;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Welcome back, <span className="gradient-text">{user?.name}</span>
        </h1>
        <p className="text-dark-400 mt-1">Here's your financial overview</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </div>
            <span className="text-sm text-dark-400 font-medium">You Owe</span>
          </div>
          <p className="text-2xl font-bold text-red-400">₹{totalOwed.toFixed(2)}</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-sm text-dark-400 font-medium">You Are Owed</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">₹{totalToReceive.toFixed(2)}</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-xl ${netBalance >= 0 ? 'bg-primary-500/10' : 'bg-amber-500/10'} flex items-center justify-center`}>
              <svg className={`w-5 h-5 ${netBalance >= 0 ? 'text-primary-400' : 'text-amber-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-sm text-dark-400 font-medium">Net Balance</span>
          </div>
          <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {netBalance >= 0 ? '+' : ''}₹{netBalance.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Groups Section */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Your Groups</h2>
        <button
          onClick={() => setShowCreateGroup(true)}
          className="btn-primary text-sm"
          id="create-group-btn"
        >
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Group
          </span>
        </button>
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="modal-overlay" onClick={() => setShowCreateGroup(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Create Group</h2>
              <button onClick={() => setShowCreateGroup(false)} className="text-dark-400 hover:text-dark-200 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {createError && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Group Name</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g., Trip to Goa"
                  className="input-field"
                  required
                  id="group-name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  Member Emails <span className="text-dark-500">(comma separated)</span>
                </label>
                <textarea
                  value={newGroupEmails}
                  onChange={(e) => setNewGroupEmails(e.target.value)}
                  placeholder="alice@example.com, bob@example.com"
                  className="input-field resize-none h-24"
                  id="group-emails"
                />
                <p className="text-xs text-dark-500 mt-1">You will be automatically added to the group</p>
              </div>

              <button
                type="submit"
                disabled={createLoading}
                className="btn-primary w-full disabled:opacity-50"
                id="submit-group"
              >
                {createLoading ? 'Creating...' : 'Create Group'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <svg className="w-20 h-20 mx-auto mb-4 text-dark-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-dark-300 mb-2">No groups yet</h3>
          <p className="text-dark-500 mb-6">Create a group to start splitting expenses with friends</p>
          <button onClick={() => setShowCreateGroup(true)} className="btn-primary">
            Create Your First Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <GroupCard key={group._id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
