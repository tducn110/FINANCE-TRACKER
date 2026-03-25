import React, { useEffect, useState } from 'react';
import { financeService } from '../services/api';
import { Wallet, Activity, PlusCircle, CheckCircle } from 'lucide-react';

export function Dashboard() {
  const [safeToSpend, setSafeToSpend] = useState<any>(null);
  const [mascotStatus, setMascotStatus] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Add Form State
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [safeRes, mascotRes, catRes] = await Promise.all([
        financeService.getSafeToSpend(),
        financeService.getMascotStatus(),
        financeService.getCategories()
      ]);
      setSafeToSpend(safeRes.data);
      setMascotStatus(mascotRes.data);
      setCategories(catRes.data || []);
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
        category_id: Number(categoryId)
      });
      setSuccessMsg('Transaction added successfully!');
      setAmount('');
      setNote('');
      setCategoryId('');
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchData(); // Refresh summary data
    } catch (err) {
      console.error('Failed to add transaction', err);
    }
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center text-gray-500 animate-pulse">Loading amazing financial insights...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Stats Row (Grid Responsive) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Safe To Spend Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
          <div>
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Wallet className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-gray-500 font-medium">Safe To Spend</h3>
            </div>
            <div className="mt-4">
              <span className="text-4xl font-bold text-gray-900 tracking-tight">
                {safeToSpend?.safeToSpend?.toLocaleString('vi-VN')} đ
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Remaining budget for the month.
            </p>
          </div>
        </div>

        {/* Mascot Status Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group lg:col-span-2">
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
              <span className="text-sm text-gray-500 sm:mb-1">/ Daily Recommended Limit</span>
            </div>
            <div className="mt-4 space-y-2">
               <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                 <div 
                  className={`h-2.5 rounded-full ${mascotStatus?.isOverLimit ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min((mascotStatus?.todayExpense / mascotStatus?.dailyLimit) * 100, 100) || 0}%` }}
                 ></div>
               </div>
               <p className={`text-sm font-medium ${mascotStatus?.isOverLimit ? 'text-red-500' : 'text-green-600'}`}>
                 {mascotStatus?.isOverLimit ? 'Over Limit! The mascot is stressed!' : 'Mascot is happy! Good job.'}
                 {' '}(Spent: {mascotStatus?.todayExpense?.toLocaleString('vi-VN')} đ)
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Quick Add Transaction */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <PlusCircle className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Quick Add Expense</h2>
          </div>

          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center gap-2 text-sm border border-green-100">
              <CheckCircle className="w-4 h-4" />
              {successMsg}
            </div>
          )}

          <form onSubmit={handleQuickAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (VND)</label>
              <input
                type="number"
                min="0"
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Ex: 50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white transition-all appearance-none"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Ex: Grab bike, Lunch..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg mt-2"
            >
              Add Transaction
            </button>
          </form>
        </div>

        {/* Upcoming feature card (Goal Impact or OCR placeholder) */}
        <div className="bg-gradient-to-br from-gray-900 to-indigo-900 rounded-2xl shadow-md p-8 flex flex-col justify-center text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-12 translate-x-12"></div>
           <div className="relative z-10">
             <h2 className="text-3xl font-bold mb-4">Goal Impact Simulator</h2>
             <p className="text-indigo-200 mb-8 max-w-sm text-lg">
               Want to buy something expensive? Simulate the expense here to see how it delays your financial goals.
             </p>
             <button disabled className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-sm transition-all font-medium border border-white/10 w-max cursor-not-allowed">
               Advanced Features Coming Soon...
             </button>
           </div>
        </div>

      </div>
    </div>
  );
}
