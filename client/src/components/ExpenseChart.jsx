import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = [
  '#6366f1', '#818cf8', '#a78bfa', '#c084fc',
  '#f472b6', '#fb923c', '#facc15', '#34d399',
  '#22d3ee', '#60a5fa',
];

const ExpenseChart = ({ expenses }) => {
  if (!expenses || expenses.length === 0) return null;

  // Aggregate by payer
  const payerMap = {};
  expenses.forEach((exp) => {
    if (exp.settled) return;
    const name = exp.paidBy?.name || 'Unknown';
    payerMap[name] = (payerMap[name] || 0) + exp.amount;
  });

  const data = Object.entries(payerMap).map(([name, amount]) => ({
    name,
    value: Math.round(amount * 100) / 100,
  }));

  if (data.length === 0) return null;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass rounded-xl px-3 py-2 text-sm">
          <p className="text-dark-200 font-medium">{payload[0].name}</p>
          <p className="text-primary-400 font-bold">₹{payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wider mb-4">Expense Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              formatter={(value) => <span className="text-dark-300 text-xs">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExpenseChart;
