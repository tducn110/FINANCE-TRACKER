import React, { useEffect, useState } from 'react';
import { financeService } from '../services/api';
import { Search, Filter, ArrowUpRight, ArrowDownRight, Clock, MoreVertical, Trash2 } from 'lucide-react';

export function Transactions() {
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transRes, catRes] = await Promise.all([
        financeService.getTransactions(),
        financeService.getCategories()
      ]);
      setAllTransactions(transRes.data || []);
      setFilteredTransactions(transRes.data || []);
      setCategories(catRes.data || []);
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = allTransactions;
    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterType !== 'all') {
       filtered = filtered.filter(tx => 
         filterType === 'income' ? Number(tx.amount) > 0 : Number(tx.amount) < 0
       );
    }
    setFilteredTransactions(filtered);
  }, [searchTerm, filterType, allTransactions]);

  if (loading) {
    return <div className="h-full flex items-center justify-center text-gray-500 animate-pulse">Loading transaction history...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Transaction Manager</h1>
          <p className="text-gray-500 mt-1">Review and manage your financial activity</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-max">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search note or category..." 
            className="pl-10 pr-4 py-2 border border-gray-100 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-max">
          <Filter className="w-4 h-4 text-gray-400" />
          <select 
            className="px-4 py-2 border border-gray-100 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="income">Income Only</option>
            <option value="expense">Expense Only</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Note</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-center w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl text-blue-600">
                        {tx.categoryIcon || '📁'}
                      </div>
                      <span className="font-semibold text-gray-700">{tx.categoryName || 'General'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium">{tx.note}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(tx.date).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-right font-bold text-lg ${Number(tx.amount) < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {Number(tx.amount) < 0 ? '-' : '+'}
                    {Math.abs(Number(tx.amount)).toLocaleString('vi-VN')} đ
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-2 text-gray-300 hover:text-red-500 bg-transparent hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">
                    No matching transactions found. 🔍
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
