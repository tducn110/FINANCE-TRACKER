import React, { useEffect, useState } from 'react';
import { financeService } from '../services/api';
import { Wallet, Activity, PlusCircle, CheckCircle, TrendingUp, ArrowDownRight, ArrowUpRight, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const [safeToSpend, setSafeToSpend] = useState<any>(null);
  const [mascotStatus, setMascotStatus] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Add Form State
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [safeRes, mascotRes, catRes, transRes, trendRes] = await Promise.all([
        financeService.getSafeToSpend(),
        financeService.getMascotStatus(),
        financeService.getCategories(),
        financeService.getTransactions(),
        financeService.getMonthlyTrend()
      ]);
      setSafeToSpend(safeRes.data);
      setMascotStatus(mascotRes.data);
      setCategories(catRes.data || []);
      setRecentTransactions((transRes.data || []).slice(0, 5));
      setMonthlyTrend(trendRes.data || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId || !note) return;

    try {
      await financeService.quickAddTransaction({
        amount: Number(amount),
        note,
        category_id: String(categoryId)
      });
      setSuccessMsg('Transaction added successfully!');
      setAmount('');
      setNote('');
      setCategoryId('');
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchData(); // Refresh all data
    } catch (err) {
      console.error('Failed to add transaction', err);
    }
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center text-gray-500 animate-pulse">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="font-medium">Loading your financial story...</p>
      </div>
    </div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Safe To Spend Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
          <div>
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Wallet className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-gray-500 font-medium">Safe To Spend</h3>
            </div>
            <div className="mt-4">
              <div className="text-4xl font-bold text-gray-900 tracking-tight">
                {safeToSpend?.safeToSpend?.toLocaleString('vi-VN')} đ
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-2 flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Keep it up! Your budget is healthy.
            </p>
          </div>
        </div>

        {/* Mascot Status Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden group lg:col-span-2">
           <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
           <div>
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-2 rounded-lg">
                <Activity className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-gray-500 font-medium">Daily Mascot Status</h3>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row sm:items-end gap-2">
              <span className="text-3xl font-bold text-gray-900 tracking-tight">
                {mascotStatus?.dailyLimit?.toLocaleString('vi-VN')} đ
              </span>
              <span className="text-sm text-gray-500 sm:mb-1">/ Daily Target</span>
            </div>
            <div className="mt-4 space-y-2">
               <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                 <div 
                  className={`h-2.5 rounded-full transition-all duration-1000 ${mascotStatus?.isOverLimit ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-green-500'}`}
                  style={{ width: `${Math.min((mascotStatus?.todayExpense / mascotStatus?.dailyLimit) * 100, 100) || 0}%` }}
                 ></div>
               </div>
               <div className="flex justify-between items-center">
                 <p className={`text-sm font-semibold ${mascotStatus?.isOverLimit ? 'text-red-500' : 'text-green-600'}`}>
                   {mascotStatus?.mascotMood === 'HAPPY' ? '😊 AI Mascot is Happy!' : '😟 AI Mascot is Stressed!'}
                   {' '}(Spent: {mascotStatus?.todayExpense?.toLocaleString('vi-VN')} đ)
                 </p>
                 <span className="text-xs text-gray-400">Updating live</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts & Transactions Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Spending Trend Chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Spending Trend</h2>
            <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> Income</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400"></div> Expenses</div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: any) => [`${value.toLocaleString()} đ`]}
                />
                <Area type="monotone" dataKey="income" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" stroke="#f87171" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Add Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <PlusCircle className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Quick Add Expense</h2>
          </div>

          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center gap-2 text-sm border border-green-100 animate-in fade-in zoom-in duration-300">
              <CheckCircle className="w-4 h-4" />
              {successMsg}
            </div>
          )}

          <form onSubmit={handleQuickAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Amount (VND)</label>
              <input
                type="number"
                min="0"
                required
                className="w-full px-4 py-3 border border-gray-100 bg-gray-50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all placeholder:text-gray-300"
                placeholder="Ex: 50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Category</label>
              <select
                required
                className="w-full px-4 py-3 border border-gray-100 bg-gray-50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all appearance-none"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="" disabled>Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Note</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-100 bg-gray-50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all placeholder:text-gray-300"
                placeholder="Grab bike, Lunch..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              Add Transaction
            </button>
          </form>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          </div>
          <button className="text-sm font-bold text-blue-600 hover:text-blue-700">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Note</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                        {tx.categoryIcon}
                      </div>
                      <span className="font-semibold text-gray-700">{tx.categoryName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{tx.note}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {new Date(tx.date).toLocaleDateString('vi-VN')}
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${Number(tx.amount) < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {Number(tx.amount) < 0 ? '-' : '+'}
                    {Math.abs(Number(tx.amount)).toLocaleString('vi-VN')} đ
                  </td>
                </tr>
              ))}
              {recentTransactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-medium">
                    No transactions found. Add one above! 🚀
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
