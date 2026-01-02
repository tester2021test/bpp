/**
 * 🛠️ LOCAL INSTALLATION INSTRUCTIONS:
 * * If you are running this locally, ensure you have installed the following packages:
 * * npm install lucide-react recharts @supabase/supabase-js
 * * ---------------------------------------------------------------------------
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  LayoutDashboard, Wallet, CreditCard, Handshake, TrendingUp, Target, 
  Plus, Trash2, Lock, ChevronRight, ChevronLeft, ArrowUpRight, ArrowDownRight, 
  UserCircle, ClipboardList, Scale, AlertTriangle, CheckCircle2, Coins, Percent, 
  Search, Loader2, AlertCircle, Landmark, CalendarClock, Banknote, FileText, 
  Download, Printer, FileSpreadsheet, Database, Lightbulb, Zap, LogOut, Settings,
  Shield, ShieldAlert, Calendar, Repeat, BellRing, Droplets, Sparkles, TrendingDown,
  ThumbsUp, AlertOctagon, Pencil, Menu, X
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Legend, AreaChart, Area, ComposedChart, 
  Line, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  RadialBarChart, RadialBar
} from 'recharts';

// --- IMPORT SWAP FOR LOCAL DEV ---
// For local VS Code: run 'npm install @supabase/supabase-js' and uncomment the first line:
import { createClient } from '@supabase/supabase-js';
//import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';


// --- Configuration ---
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];
const GLASS_CLASSES = "bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl";

// --- Supabase Initialization (Hardcoded) ---
const supabaseUrl = "https://fyhyixwrufntivxkdxkv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aHlpeHdydWZudGl2eGtkeGt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNjk3NDksImV4cCI6MjA4Mjk0NTc0OX0.fNU_NOlDzjbm0fclPZ8BfEIuSRYetqX6ZeTUUoUL7bU";

// Initialize client
const supabase = createClient(supabaseUrl, supabaseKey);

// --- Utilities ---
const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
const getDateObject = (dateVal: any) => { if (!dateVal) return new Date(); return new Date(dateVal); };
const formatDate = (dateVal: any) => getDateObject(dateVal).toLocaleDateString();

const downloadMonthlyCSV = (data: any, month: number, year: number) => {
    if (!data) return;
    const csvRows = [];
    csvRows.push(['Type', 'Date/Frequency', 'Category', 'Description', 'Credit (+)', 'Debit (-)', 'Notes']);

    data.income.forEach((item: any) => {
        csvRows.push(['Income', 'Monthly', item.type, `"${item.source}"`, item.amount, '0', 'Regular Source']);
    });

    data.expenses.forEach((item: any) => {
        let include = false;
        let dateStr = 'Monthly Recurring';
        
        if (item.tenure_months > 0) {
            include = true;
            dateStr = `EMI (Tenure: ${item.tenure_months}m left)`;
        } else if (item.is_recurring !== false) {
            include = true;
        } else {
            const itemDate = getDateObject(item.date || item.created_at);
            if (itemDate.getMonth() === month && itemDate.getFullYear() === year) {
                include = true;
                dateStr = formatDate(itemDate);
            }
        }

        if (include) {
            csvRows.push(['Expense', dateStr, item.category, `"${item.name}"`, '0', item.amount, item.tenure_months ? 'Loan/Liability' : 'Variable Expense']);
        }
    });

    const csvString = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });
    link.setAttribute('download', `PFCC_Statement_${monthName}_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const downloadMasterBackup = (data: any) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PFCC_Full_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// --- Components ---

const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in print:hidden">
      <div className={`w-full md:w-full max-w-md overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto rounded-2xl ${GLASS_CLASSES}`}>
        <div className="flex justify-between items-center p-5 border-b border-white/10 sticky top-0 bg-slate-900/90 backdrop-blur-md z-10">
          <h3 className="text-lg font-bold text-white tracking-wide">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const Card = ({ title, children, action, className = "" }: any) => (
  <div className={`rounded-2xl flex flex-col ${GLASS_CLASSES} ${className} print:border-slate-300 print:shadow-none print:break-inside-avoid print:bg-white`}>
    <div className="p-5 border-b border-white/5 flex justify-between items-center print:border-slate-300">
      <h3 className="font-semibold text-slate-100 tracking-wide print:text-slate-800">{title}</h3>
      <div className="print:hidden">{action}</div>
    </div>
    <div className="p-5 flex-1">{children}</div>
  </div>
);

const StatCard = ({ title, value, subtext, icon: Icon, trend, color = "blue" }: any) => {
  const colorClasses: any = { 
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20", 
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", 
    rose: "text-rose-400 bg-rose-500/10 border-rose-500/20", 
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
  };

  return (
    <div className={`rounded-2xl p-5 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 ${GLASS_CLASSES} print:border-slate-300 print:shadow-none print:bg-white print:text-black`}>
      <div className="absolute top-0 right-0 p-20 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full -mr-10 -mt-10 pointer-events-none transition-opacity opacity-50 group-hover:opacity-80" />
      
      <div className="flex justify-between items-start mb-3 relative z-10">
        <div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 print:text-slate-600">{title}</p>
          <h4 className="text-2xl font-bold text-white tracking-tight print:text-black">{value}</h4>
        </div>
        <div className={`p-2.5 rounded-xl border ${colorClasses[color]} print:hidden shadow-[0_0_15px_rgba(0,0,0,0.3)]`}>
          <Icon size={20} />
        </div>
      </div>
      {subtext && (
        <div className="flex items-center text-xs relative z-10">
          {trend === 'up' ? <ArrowUpRight size={14} className="text-emerald-400 mr-1 print:text-black" /> : 
           trend === 'down' ? <ArrowDownRight size={14} className="text-rose-400 mr-1 print:text-black" /> : null}
          <span className="text-slate-500 font-medium print:text-slate-600">{subtext}</span>
        </div>
      )}
    </div>
  );
};

// --- AUTH MODULES ---

const LoginScreen = ({ onLogin }: any) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError("");
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            if (data.user) onLogin(data.user);
        } catch (err: any) { setError(err.message || "Login failed"); } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 flex flex-col items-center justify-center p-4">
            <div className={`p-8 rounded-2xl max-w-md w-full ${GLASS_CLASSES}`}>
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-500/20 rounded-xl mb-4 border border-blue-500/30">
                        <LayoutDashboard size={32} className="text-blue-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">PFCC</h1>
                    <p className="text-slate-400 text-sm mt-2">Personal Finance Command Center</p>
                </div>
                {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-sm mb-6 flex items-center"><AlertCircle size={16} className="mr-2"/> {error}</div>}
                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-slate-400 text-xs font-bold mb-1.5 ml-1">EMAIL</label>
                        {/* Mobile optimization: text-base prevents auto-zoom on iOS */}
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-3.5 text-base md:text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600" placeholder="name@example.com" required />
                    </div>
                    <div>
                        <label className="block text-slate-400 text-xs font-bold mb-1.5 ml-1">PASSWORD</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-3.5 text-base md:text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600" placeholder="••••••••" required />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5 flex justify-center mt-2">
                        {loading ? <Loader2 className="animate-spin" /> : "Access Dashboard"}
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- REPORTS MODULE (Printable) ---

const PrintableReport = ({ data }: any) => {
    const totalIncome = data.income.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
    const totalExpense = data.expenses.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
    const totalInvestments = data.investments.reduce((acc: number, curr: any) => acc + Number(curr.value), 0);
    const net = totalIncome - totalExpense;

    return (
        <div className="hidden print:block bg-white text-black p-8 font-serif">
            <div className="border-b-2 border-black pb-4 mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold uppercase tracking-widest">Financial Status Report</h1>
                    <p className="text-sm text-gray-600 mt-1">Generated by Personal Finance Command Center</p>
                </div>
                <div className="text-right">
                    <p className="font-bold">{new Date().toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">Confidential</p>
                </div>
            </div>
            <div className="mb-8">
                <h2 className="text-xl font-bold border-b border-gray-300 mb-4 pb-1">Executive Summary</h2>
                <div className="grid grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-100 rounded">
                        <p className="text-xs text-gray-500 uppercase">Monthly Income</p>
                        <p className="text-lg font-bold">{formatCurrency(totalIncome)}</p>
                    </div>
                    <div className="p-4 bg-gray-100 rounded">
                        <p className="text-xs text-gray-500 uppercase">Monthly Outflow</p>
                        <p className="text-lg font-bold text-red-600">{formatCurrency(totalExpense)}</p>
                    </div>
                    <div className="p-4 bg-gray-100 rounded">
                        <p className="text-xs text-gray-500 uppercase">Net Cashflow</p>
                        <p className="text-lg font-bold text-green-600">{formatCurrency(net)}</p>
                    </div>
                    <div className="p-4 bg-gray-100 rounded">
                        <p className="text-xs text-gray-500 uppercase">Total Assets</p>
                        <p className="text-lg font-bold text-blue-600">{formatCurrency(totalInvestments)}</p>
                    </div>
                </div>
            </div>
            <div className="text-center text-xs text-gray-400 mt-10">End of Report</div>
        </div>
    );
};

// --- DATA MODULES ---

const MasterSummaryModule = ({ data }: any) => {
  // Calculations
  const investmentTotal = data.investments.reduce((acc: number, c: any) => acc + Number(c.value), 0);
  const totalAssets = investmentTotal;
  const emiDebt = data.expenses.filter((e: any) => e.tenure_months > 0).reduce((acc: number, e: any) => acc + (Number(e.amount) * Number(e.tenure_months)), 0);
  const settlementDebt = data.settlements.reduce((acc: number, s: any) => acc + Number(s.settlement || s.outstanding), 0);
  const totalLiabilities = emiDebt + settlementDebt;
  const netWorth = totalAssets - totalLiabilities;
  
  const totalIncome = data.income.reduce((acc: number, c: any) => acc + Number(c.amount), 0);
  const totalMonthlyExpense = data.expenses.reduce((acc: number, c: any) => acc + Number(c.amount), 0);
  
  // New Simple Metrics
  const monthlySurplus = totalIncome - totalMonthlyExpense;
  const safetyMargin = totalMonthlyExpense > 0 ? ((totalIncome / totalMonthlyExpense) * 100).toFixed(0) : 0;
  
  // DTI (Debt to Income Ratio)
  const totalMonthlyEMI = data.expenses.filter((e: any) => e.tenure_months > 0).reduce((acc: number, e: any) => acc + Number(e.amount), 0);
  const dti = totalIncome > 0 ? ((totalMonthlyEMI / totalIncome) * 100).toFixed(0) : 0;
  
  // Savings Rate
  const savingsRate = totalIncome > 0 ? (((totalIncome - totalMonthlyExpense) / totalIncome) * 100).toFixed(0) : 0;

  // AI Suggestions Logic
  const generateSuggestions = () => {
      const suggestions = [];
      
      // Surplus/Deficit
      if (monthlySurplus < 0) {
          suggestions.push({ type: 'danger', icon: AlertTriangle, title: "Spending Exceeds Income", text: `You are overspending by ${formatCurrency(Math.abs(monthlySurplus))} monthly. Review variable expenses immediately.` });
      } else if (monthlySurplus > 0 && monthlySurplus < (totalIncome * 0.1)) {
          suggestions.push({ type: 'warning', icon: AlertOctagon, title: "Low Savings Margin", text: "You're saving less than 10% of income. Try to cut non-essential costs to build a safety net." });
      } else {
          suggestions.push({ type: 'success', icon: ThumbsUp, title: "Healthy Cashflow", text: `Great job! You have ${formatCurrency(monthlySurplus)} surplus monthly. Consider investing 50% of this.` });
      }

      // Debt
      if (Number(dti) > 40) {
          suggestions.push({ type: 'danger', icon: TrendingDown, title: "High Debt Burden", text: `Your EMIs take up ${dti}% of income. Avoid new loans and try to prepay existing ones.` });
      }

      // Wealth
      if (netWorth < 0) {
           suggestions.push({ type: 'warning', icon: Scale, title: "Negative Net Worth", text: "Your total debts are higher than your assets. Focus on debt clearance to reach positive ground." });
      } else if (investmentTotal === 0) {
           suggestions.push({ type: 'info', icon: TrendingUp, title: "Start Investing", text: "You have no tracked assets. Start a SIP or recurring deposit with your monthly surplus." });
      }

      if (suggestions.length === 0) {
          suggestions.push({ type: 'info', icon: Lightbulb, title: "All Systems Go", text: "Your finances look stable! Keep tracking your expenses to maintain this health." });
      }
      return suggestions;
  };

  const suggestions = generateSuggestions();

  return (
    <div className="space-y-6 animate-fade-in">
       {/* High Level Stats */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Net Worth" value={formatCurrency(netWorth)} icon={Scale} color={netWorth >= 0 ? "emerald" : "rose"} subtext="Assets - Liabilities" />
          <StatCard title="Total Assets" value={formatCurrency(totalAssets)} icon={TrendingUp} color="blue" subtext="Investments Portfolio" />
          <StatCard title="Total Liabilities" value={formatCurrency(totalLiabilities)} icon={ShieldAlert} color="amber" subtext="Loans + Settlements" />
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Suggestions Panel */}
          <Card title="AI Financial Suggestions" className="lg:col-span-1">
             <div className="flex flex-col h-full space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {suggestions.map((item, idx) => {
                    let colorClass = "bg-blue-500/10 border-blue-500/20 text-blue-300";
                    if (item.type === 'danger') colorClass = "bg-rose-500/10 border-rose-500/20 text-rose-300";
                    if (item.type === 'warning') colorClass = "bg-amber-500/10 border-amber-500/20 text-amber-300";
                    if (item.type === 'success') colorClass = "bg-emerald-500/10 border-emerald-500/20 text-emerald-300";

                    return (
                        <div key={idx} className={`p-4 rounded-xl border ${colorClass} flex gap-3 transition-all hover:translate-x-1`}>
                            <div className="mt-0.5 shrink-0"><item.icon size={18} /></div>
                            <div>
                                <h4 className="font-bold text-sm mb-1">{item.title}</h4>
                                <p className="text-xs opacity-90 leading-relaxed">{item.text}</p>
                            </div>
                        </div>
                    );
                })}
             </div>
          </Card>
          
          <Card title="Financial Health Scorecard" className="lg:col-span-2">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-2">
                <div className="space-y-6">
                   {/* DTI */}
                   <div>
                       <div className="flex justify-between items-center mb-2"><span className="text-slate-400 text-xs uppercase font-bold tracking-wider">Debt Ratio (DTI)</span><span className={`font-bold ${Number(dti) < 30 ? 'text-emerald-400' : 'text-rose-400'}`}>{dti}%</span></div>
                       <div className="w-full bg-slate-800/50 h-2 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-1000 ${Number(dti) < 30 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${Math.min(Number(dti), 100)}%` }}></div></div>
                       <p className="text-[10px] text-slate-500 mt-1">% of income spent on Loan EMIs. Target &lt; 30%</p>
                   </div>
                   {/* Cash Leftover (Replaces Runway) */}
                   <div>
                       <div className="flex justify-between items-center mb-2"><span className="text-slate-400 text-xs uppercase font-bold tracking-wider">Cash Leftover</span><span className={`font-bold ${monthlySurplus > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{formatCurrency(monthlySurplus)}</span></div>
                       <div className="w-full bg-slate-800/50 h-2 rounded-full overflow-hidden">
                           {/* Visual bar logic for surplus: if positive, green bar relative to income */}
                           <div className={`h-full rounded-full transition-all duration-1000 ${monthlySurplus > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${Math.min(Math.abs(monthlySurplus) / totalIncome * 100, 100)}%` }}></div>
                       </div>
                       <p className="text-[10px] text-slate-500 mt-1">Monthly Income minus All Expenses.</p>
                   </div>
                </div>
                <div className="space-y-6">
                   {/* Safety Margin (Replaces FI Progress) */}
                   <div>
                       <div className="flex justify-between items-center mb-2"><span className="text-slate-400 text-xs uppercase font-bold tracking-wider">Safety Margin</span><span className={`font-bold ${Number(safetyMargin) > 110 ? 'text-emerald-400' : 'text-amber-400'}`}>{safetyMargin}%</span></div>
                       <div className="w-full bg-slate-800/50 h-2 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-1000 ${Number(safetyMargin) > 100 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(Number(safetyMargin)/2, 100)}%` }}></div></div>
                       <p className="text-[10px] text-slate-500 mt-1">Income vs Expenses ratio. 100% means you break even.</p>
                   </div>
                   {/* Savings Rate */}
                   <div>
                       <div className="flex justify-between items-center mb-2"><span className="text-slate-400 text-xs uppercase font-bold tracking-wider">Savings Rate</span><span className="font-bold text-blue-400">{savingsRate}%</span></div>
                       <div className="w-full bg-slate-800/50 h-2 rounded-full overflow-hidden"><div className="h-full rounded-full bg-blue-500 transition-all duration-1000" style={{ width: `${Math.min(Number(savingsRate), 100)}%` }}></div></div>
                       <p className="text-[10px] text-slate-500 mt-1">% of income saved. Target &gt; 20%</p>
                   </div>
                </div>
             </div>
          </Card>
       </div>
    </div>
  );
};

const DashboardModule = ({ data, setActiveTab }: any) => {
  const currentMonth = new Date();
  const totalIncome = data.income.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
  // Calculate expenses for current month specifically for the "Outflow" card
  const totalExpense = data.expenses.reduce((acc: number, item: any) => {
      if (item.tenure_months > 0) return acc + Number(item.amount);
      if (item.is_recurring !== false) return acc + Number(item.amount);
      const itemDate = getDateObject(item.date || item.created_at);
      if (itemDate.getMonth() === currentMonth.getMonth() && itemDate.getFullYear() === currentMonth.getFullYear()) return acc + Number(item.amount);
      return acc;
  }, 0);
  const net = totalIncome - totalExpense;
  const dailyBurn = new Date().getDate() > 0 ? (totalExpense / new Date().getDate()) : 0;

  // Category Breakdown for the Pie Chart
  const categoryData = useMemo(() => {
    const cats: any = {};
    data.expenses.forEach((e:any) => {
       const cat = e.category || 'Uncategorized';
       cats[cat] = (cats[cat] || 0) + Number(e.amount);
    });
    return Object.keys(cats).map(k => ({ name: k, value: cats[k] })).sort((a,b) => b.value - a.value).slice(0, 5); // Top 5
  }, [data.expenses]);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-end mb-4">
        <div>
            <h1 className="text-4xl font-bold text-white tracking-tighter">Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                System Operational • {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Monthly Income" value={formatCurrency(totalIncome)} icon={ArrowUpRight} trend="up" subtext="Active sources" />
        <StatCard title="Current Month Outflow" value={formatCurrency(totalExpense)} icon={ArrowDownRight} trend="down" subtext="Fixed + Var. Spending" />
        <StatCard title="Net In-Hand" value={formatCurrency(net)} icon={Wallet} subtext="Potential Savings" />
        <div className={`rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between ${GLASS_CLASSES}`}>
             <div className="relative z-10">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Daily Burn Rate</p>
                <h4 className="text-2xl font-bold text-amber-400 tracking-tight">{formatCurrency(dailyBurn)}</h4>
             </div>
             <div className="mt-2 text-xs text-slate-500 relative z-10">Avg spend/day this month</div>
             <div className="absolute right-4 top-4 p-2.5 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20"><Zap size={20}/></div>
             <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-amber-500/10 rounded-full blur-xl"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <CashflowTimeline income={data.income} expenses={data.expenses} />
            
            {/* Category Breakdown (New Feature) */}
            <Card title="Top Expense Categories (This Month)">
                <div className="h-48 flex items-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={categoryData} margin={{ left: 10, right: 10 }}>
                             <XAxis type="number" hide />
                             <YAxis dataKey="name" type="category" width={100} tick={{fill: '#94a3b8', fontSize: 12}} />
                             <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                             <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
        
        <div className="lg:col-span-1 space-y-6">
            {/* Upcoming Commitments Widget (New Feature) */}
            <Card title="Upcoming Commitments">
                <div className="space-y-3">
                    {data.expenses.filter((e:any) => e.is_recurring || e.tenure_months > 0).slice(0, 4).map((item:any, i:number) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg"><BellRing size={16} /></div>
                                <div>
                                    <p className="text-sm font-medium text-white">{item.name}</p>
                                    <p className="text-[10px] text-slate-400">{item.tenure_months ? 'Loan EMI' : 'Monthly Bill'}</p>
                                </div>
                            </div>
                            <span className="font-bold text-white text-sm">{formatCurrency(item.amount)}</span>
                        </div>
                    ))}
                    <button onClick={() => setActiveTab('expenses')} className="w-full text-center text-xs text-blue-400 hover:text-blue-300 mt-2">View All Expenses</button>
                </div>
            </Card>

            <Card title="Quick Actions">
                <div className="flex flex-col gap-3">
                    <button onClick={() => setActiveTab('expenses')} className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-4 py-3 rounded-xl text-sm text-slate-200 transition-all border border-white/5 hover:border-white/20 group">
                        <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg group-hover:scale-110 transition-transform"><CreditCard size={18} /></div>
                        <span className="font-medium">Add Expense</span>
                    </button>
                    <button onClick={() => setActiveTab('income')} className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-4 py-3 rounded-xl text-sm text-slate-200 transition-all border border-white/5 hover:border-white/20 group">
                        <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg group-hover:scale-110 transition-transform"><Wallet size={18} /></div>
                        <span className="font-medium">Log Income</span>
                    </button>
                    <button onClick={() => setActiveTab('investments')} className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-4 py-3 rounded-xl text-sm text-slate-200 transition-all border border-white/5 hover:border-white/20 group">
                        <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg group-hover:scale-110 transition-transform"><TrendingUp size={18} /></div>
                        <span className="font-medium">Update Portfolio</span>
                    </button>
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};

const CashflowTimeline = ({ income, expenses }: any) => {
    const totalIncome = income.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
    const recurringExpenses = expenses.filter((e: any) => (!e.tenure_months) && (e.is_recurring !== false)).reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
    const emis = expenses.filter((e: any) => e.tenure_months > 0);
    const maxTenure = Math.max(...emis.map((e: any) => e.tenure_months), 24); 
    const timelineData = useMemo(() => {
        const data = []; const today = new Date();
        for (let i = 0; i <= maxTenure + 1; i++) {
            const monthDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
            const monthLabel = monthDate.toLocaleString('default', { month: 'short', year: '2-digit' });
            const activeEmis = emis.filter((e: any) => e.tenure_months > i);
            const emiLoad = activeEmis.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
            const totalExpenses = recurringExpenses + emiLoad;
            data.push({ name: monthLabel, cashflow: totalIncome - totalExpenses, expenses: totalExpenses });
        }
        return data;
    }, [totalIncome, recurringExpenses, emis, maxTenure]);
    return (
        <Card title="Cashflow Freedom Timeline">
             <div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}><defs><linearGradient id="colorCashflow" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} /><XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 10}} interval={2} /><YAxis stroke="#94a3b8" tick={{fontSize: 10}} tickFormatter={(val) => `₹${val/1000}k`} /><Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} /><Legend /><Area type="monotone" dataKey="cashflow" name="Free Cashflow" stroke="#10b981" fill="url(#colorCashflow)" strokeWidth={2} /><Line type="stepAfter" dataKey="expenses" name="Total Expenses" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} /></ComposedChart></ResponsiveContainer></div>
        </Card>
    );
};

const ReportsModule = ({ data }: any) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const monthStats = useMemo(() => {
        const totalIncome = data.income.reduce((acc: number, c: any) => acc + Number(c.amount), 0);
        const totalExpense = data.expenses.reduce((acc: number, item: any) => {
            if (item.tenure_months > 0) return acc + Number(item.amount);
            if (item.is_recurring !== false) return acc + Number(item.amount);
            const itemDate = getDateObject(item.date || item.created_at);
            if (itemDate.getMonth() === selectedDate.getMonth() && itemDate.getFullYear() === selectedDate.getFullYear()) { return acc + Number(item.amount); }
            return acc;
        }, 0);
        return { income: totalIncome, expense: totalExpense, net: totalIncome - totalExpense };
    }, [data, selectedDate]);
    const changeMonth = (offset: number) => { const newDate = new Date(selectedDate); newDate.setMonth(newDate.getMonth() + offset); setSelectedDate(newDate); };
    return (
        <div className="space-y-6">
            <Card title="Monthly Statement Generator" action={<FileSpreadsheet className="text-emerald-500" size={20} />}>
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1 w-full"><div className="flex items-center justify-between bg-white/5 border border-white/10 p-3 rounded-lg mb-4"><button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/10 rounded-full text-slate-400"><ChevronLeft size={20} /></button><div className="text-center"><span className="block font-bold text-white text-lg">{selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span><span className="text-xs text-slate-500">Select period</span></div><button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/10 rounded-full text-slate-400"><ChevronRight size={20} /></button></div><div className="grid grid-cols-3 gap-2 text-center text-xs"><div className="bg-emerald-900/20 p-2 rounded border border-emerald-900/30"><span className="block text-emerald-400 mb-1">In</span><span className="font-bold text-white">{formatCurrency(monthStats.income)}</span></div><div className="bg-rose-900/20 p-2 rounded border border-rose-900/30"><span className="block text-rose-400 mb-1">Out</span><span className="font-bold text-white">{formatCurrency(monthStats.expense)}</span></div><div className="bg-blue-900/20 p-2 rounded border border-blue-900/30"><span className="block text-blue-400 mb-1">Net</span><span className="font-bold text-white">{formatCurrency(monthStats.net)}</span></div></div></div>
                    <div className="flex-1 w-full flex flex-col justify-center"><button onClick={() => downloadMonthlyCSV(data, selectedDate.getMonth(), selectedDate.getFullYear())} className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20 mb-3"><Download size={20} /><span>Download {selectedDate.toLocaleString('default', { month: 'short' })} Statement</span></button></div>
                </div>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Printable Report" action={<Printer className="text-blue-500" size={20} />}><div className="text-center p-4"><p className="text-sm text-slate-400 mb-4">Generate A4-formatted PDF summary.</p><button onClick={() => window.print()} className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20"><Printer size={20} /><span>Print / Save as PDF</span></button></div></Card>
                <Card title="Data Backup" action={<Database className="text-amber-500" size={20} />}><div className="text-center p-4"><p className="text-sm text-slate-400 mb-4">Export raw database as JSON.</p><button onClick={() => downloadMasterBackup(data)} className="w-full flex items-center justify-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-xl font-bold transition-all border border-slate-600"><Download size={20} /><span>Export Backup</span></button></div></Card>
            </div>
        </div>
    );
};

const ExpensesModule = ({ data, onAdd, onUpdate, onDelete, safeMode }: any) => {
    const [viewDate, setViewDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>({ name: '', amount: '', category: 'General', is_recurring: true, date: '' });
    const filteredExpenses = useMemo(() => {
        return data.filter((item: any) => {
            if (item.is_recurring !== false) return true;
            const itemDate = getDateObject(item.date || item.created_at);
            return itemDate.getMonth() === viewDate.getMonth() && itemDate.getFullYear() === viewDate.getFullYear();
        });
    }, [data, viewDate]);
    const totalMonthly = filteredExpenses.reduce((acc: number, item: any) => acc + Number(item.amount), 0);
    
    const openAdd = () => { setEditingId(null); setFormData({ name: '', amount: '', category: 'General', is_recurring: true, date: '' }); setIsModalOpen(true); };
    const openEdit = (item: any) => { setEditingId(item.id); setFormData({ name: item.name, amount: item.amount, category: item.category, is_recurring: item.is_recurring, date: item.date || '' }); setIsModalOpen(true); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { ...formData, amount: Number(formData.amount), tenure_months: null, is_recurring: formData.is_recurring === 'true' || formData.is_recurring === true, date: formData.date || new Date().toISOString() };
        if (editingId) {
             const success = await onUpdate('expenses', editingId, payload);
             if (success) setIsModalOpen(false);
        } else {
             const success = await onAdd('expenses', { ...payload, created_at: new Date().toISOString() }); // created_at handled by DB mostly but safer
             if (success) setIsModalOpen(false);
        }
    };
    const handleChange = (field: string, value: any) => { setFormData((prev: any) => ({ ...prev, [field]: value })); };
    const changeMonth = (offset: number) => { const newDate = new Date(viewDate); newDate.setMonth(newDate.getMonth() + offset); setViewDate(newDate); };
    
    return (
        <div className="space-y-6">
             <div className="flex items-center justify-between bg-white/5 border border-white/10 p-4 rounded-xl"><button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white"><ChevronLeft size={24} /></button><div className="text-center"><h2 className="text-lg font-bold text-white">{viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2><p className="text-xs text-slate-500">Expense Log</p></div><button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white"><ChevronRight size={24} /></button></div>
             <div className="grid grid-cols-1 gap-4"><StatCard title={`Total for ${viewDate.toLocaleString('default', { month: 'short' })}`} value={formatCurrency(totalMonthly)} icon={Wallet} color="blue" subtext="Recurring + One-time" /></div>
            <Card title={`Expenses (${viewDate.toLocaleString('default', { month: 'short' })})`} action={!safeMode && (<button onClick={openAdd} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm flex items-center transition-colors"><Plus size={16} className="mr-1" /> Add Expense</button>)}>
                <div className="overflow-x-auto"><table className="w-full text-left text-sm text-slate-400"><thead className="bg-white/5 text-slate-200 uppercase text-xs font-semibold"><tr><th className="px-4 py-3">Expense Name</th><th className="px-4 py-3">Cost</th><th className="px-4 py-3">Type</th>{!safeMode && <th className="px-4 py-3 text-right">Actions</th>}</tr></thead><tbody className="divide-y divide-white/5">{filteredExpenses.length === 0 ? (<tr><td colSpan={4} className="px-4 py-8 text-center text-slate-600 italic">No expenses for this month.</td></tr>) : (filteredExpenses.map((item: any) => (<tr key={item.id} className="hover:bg-white/5 transition-colors"><td className="px-4 py-3 text-white font-medium">{item.name}<div className="text-[10px] text-slate-500">{item.category}</div></td><td className="px-4 py-3">{formatCurrency(item.amount)}</td><td className="px-4 py-3">{item.is_recurring !== false ? <span className="flex items-center text-emerald-400 text-xs"><Repeat size={12} className="mr-1"/> Recurring</span> : <span className="flex items-center text-blue-400 text-xs"><Calendar size={12} className="mr-1"/> One-time</span>}</td>{!safeMode && (<td className="px-4 py-3 text-right flex justify-end gap-2"><button onClick={() => openEdit(item)} className="text-blue-400 hover:text-blue-300 p-1"><Pencil size={16}/></button><button onClick={() => onDelete('expenses', item.id)} className="text-rose-500 hover:text-rose-400 p-1"><Trash2 size={16} /></button></td>)}</tr>)))}</tbody></table></div>
            </Card>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Expense" : "Add Expense"}><form onSubmit={handleSubmit} className="space-y-4"><div><label className="block text-xs font-medium text-slate-400 mb-1">Expense Name</label><input type="text" required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} /></div><div><label className="block text-xs font-medium text-slate-400 mb-1">Cost (₹)</label><input type="number" required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none" value={formData.amount} onChange={(e) => handleChange('amount', e.target.value)} /></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-medium text-slate-400 mb-1">Type</label><select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none" value={formData.is_recurring} onChange={(e) => handleChange('is_recurring', e.target.value === 'true')}><option value="true">Recurring (Monthly)</option><option value="false">One-time (Specific Date)</option></select></div><div><label className="block text-xs font-medium text-slate-400 mb-1">Date (if One-time)</label><input type="date" disabled={formData.is_recurring === true || formData.is_recurring === 'true'} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" value={formData.date ? formData.date.split('T')[0] : ''} onChange={(e) => handleChange('date', e.target.value)} /></div></div><div><label className="block text-xs font-medium text-slate-400 mb-1">Category</label><input type="text" placeholder="General" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none" value={formData.category} onChange={(e) => handleChange('category', e.target.value)} /></div><button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-medium mt-4">Save Expense</button></form></Modal>
        </div>
    );
};

const LoansModule = ({ data, onAdd, onUpdate, onDelete, safeMode }: any) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>({ name: '', amount: '', category: 'Loan', tenure_months: '' });

    const openAdd = () => { setEditingId(null); setFormData({ name: '', amount: '', category: 'Loan', tenure_months: '' }); setIsModalOpen(true); };
    const openEdit = (item: any) => { setEditingId(item.id); setFormData({ name: item.name, amount: item.amount, category: item.category, tenure_months: item.tenure_months }); setIsModalOpen(true); };

    const handleSubmit = async (e: React.FormEvent) => { 
        e.preventDefault(); 
        const payload = { ...formData, amount: Number(formData.amount), tenure_months: Number(formData.tenure_months) };
        if (editingId) {
             const success = await onUpdate('expenses', editingId, payload);
             if (success) setIsModalOpen(false);
        } else {
             const success = await onAdd('expenses', payload);
             if (success) setIsModalOpen(false);
        }
    };
    const handleChange = (field: string, value: any) => { setFormData((prev: any) => ({ ...prev, [field]: value })); };
    const totalMonthlyEMI = data.reduce((acc: number, item: any) => acc + Number(item.amount), 0);
    const totalOutstanding = data.reduce((acc: number, item: any) => acc + (Number(item.amount) * Number(item.tenure_months)), 0);
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><StatCard title="Total Monthly EMI" value={formatCurrency(totalMonthlyEMI)} icon={CalendarClock} color="rose" /><StatCard title="Total Outstanding Debt" value={formatCurrency(totalOutstanding)} icon={Banknote} color="amber" /></div>
            <Card title="Active Loans & EMIs" action={!safeMode && (<button onClick={openAdd} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm flex items-center transition-colors"><Plus size={16} className="mr-1" /> Add Loan</button>)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{data.map((loan: any) => { const endDate = new Date(); endDate.setMonth(endDate.getMonth() + loan.tenure_months); return (<div key={loan.id} className="bg-white/5 border border-white/10 p-5 rounded-xl relative group">{!safeMode && (<div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => openEdit(loan)} className="text-blue-400 hover:text-blue-300 p-1"><Pencil size={16}/></button><button onClick={() => onDelete('expenses', loan.id)} className="text-slate-600 hover:text-rose-500 p-1"><Trash2 size={16}/></button></div>)}<div><h3 className="text-white font-bold">{loan.name}</h3><div className="text-rose-400 font-bold text-xl">{formatCurrency(loan.amount)}</div><div className="text-slate-500 text-xs">Tenure: {loan.tenure_months} months</div></div><div className="mt-4 space-y-3"><div className="flex justify-between text-sm"><span className="text-slate-400">Total Pending</span><span className="text-amber-400 font-medium">{formatCurrency(loan.amount * loan.tenure_months)}</span></div><div className="pt-3 border-t border-white/5 mt-2"><div className="flex items-center text-emerald-400 text-xs font-bold"><CheckCircle2 size={12} className="mr-1"/> Debt Free: {endDate.toLocaleString('default', { month: 'short', year: 'numeric' })}</div></div></div></div>); })}</div>
            </Card>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Loan" : "Add Loan"}><form onSubmit={handleSubmit} className="space-y-4"><div><label className="block text-xs font-medium text-slate-400 mb-1">Name</label><input type="text" required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} /></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-medium text-slate-400 mb-1">EMI</label><input type="number" required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none" value={formData.amount} onChange={(e) => handleChange('amount', e.target.value)} /></div><div><label className="block text-xs font-medium text-slate-400 mb-1">Tenure</label><input type="number" required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none" value={formData.tenure_months} onChange={(e) => handleChange('tenure_months', e.target.value)} /></div></div><button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-medium mt-4">Save</button></form></Modal>
        </div>
    );
};

const InvestmentsModule = ({ data, onAdd, onUpdate, onDelete, safeMode }: any) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>({ name: '', value: '', invested_amount: '', type: 'Mutual Fund', schemeCode: '', units: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [mfResults, setMfResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [fetchedNav, setFetchedNav] = useState<number | null>(null);
    
    const totalValue = data.reduce((acc: any, c: any) => acc + Number(c.value), 0);
    const totalInvested = data.reduce((acc: any, c: any) => acc + (Number(c.invested_amount) || Number(c.value)), 0);
    const totalPnL = totalValue - totalInvested;
    const roi = totalInvested > 0 ? ((totalPnL / totalInvested) * 100).toFixed(1) : 0;
    
    useEffect(() => { if (!searchQuery || formData.type !== 'Mutual Fund') { setMfResults([]); return; } const delayDebounceFn = setTimeout(async () => { setIsSearching(true); try { const res = await fetch(`https://api.mfapi.in/mf/search?q=${searchQuery}`); const json = await res.json(); setMfResults(json.slice(0, 5)); } catch (error) { console.error("MF Search failed", error); } finally { setIsSearching(false); } }, 500); return () => clearTimeout(delayDebounceFn); }, [searchQuery, formData.type]);
    
    const selectFund = async (fund: any) => { setFormData({ ...formData, name: fund.schemeName, schemeCode: fund.schemeCode }); setSearchQuery(""); setMfResults([]); try { const res = await fetch(`https://api.mfapi.in/mf/${fund.schemeCode}`); const json = await res.json(); if (json.data && json.data.length > 0) setFetchedNav(Number(json.data[0].nav)); } catch (e) { console.error(e); } };
    
    const openAdd = () => { setEditingId(null); setFormData({ name: '', value: '', invested_amount: '', type: 'Mutual Fund', schemeCode: '', units: '' }); setIsModalOpen(true); };
    const openEdit = (item: any) => { setEditingId(item.id); setFormData({ name: item.name, value: item.value, invested_amount: item.invested_amount, type: item.type, schemeCode: item.schemeCode || '', units: item.units || '' }); setIsModalOpen(true); };

    const handleAddOrUpdate = async (e: React.FormEvent) => { 
        e.preventDefault(); 
        let finalValue = Number(formData.value); 
        let finalNav = fetchedNav; 
        if (formData.type === 'Mutual Fund' && formData.schemeCode && formData.units && fetchedNav) finalValue = Number(formData.units) * fetchedNav; 
        
        const payload = { ...formData, value: finalValue, invested_amount: Number(formData.invested_amount), units: formData.units ? Number(formData.units) : null, nav: finalNav };
        
        if (editingId) {
             const success = await onUpdate('investments', editingId, payload);
             if (success) setIsModalOpen(false);
        } else {
             const success = await onAdd('investments', payload);
             if (success) setIsModalOpen(false);
        }
    };
    
    const handleChange = (field: string, value: any) => { setFormData((prev: any) => ({ ...prev, [field]: value })); };
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"><StatCard title="Current Value" value={formatCurrency(totalValue)} icon={TrendingUp} color="blue" /><StatCard title="Total Invested" value={formatCurrency(totalInvested)} icon={Coins} color="amber" /><StatCard title="Total P&L" value={formatCurrency(totalPnL)} icon={totalPnL >= 0 ? ArrowUpRight : ArrowDownRight} color={totalPnL >= 0 ? "emerald" : "rose"} /><StatCard title="Overall ROI" value={`${roi}%`} icon={Percent} color={Number(roi) >= 0 ? "emerald" : "rose"} /></div>
            <Card title="Holdings" action={!safeMode && (<button onClick={openAdd} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm flex items-center transition-colors"><Plus size={16} className="mr-1" /> Add</button>)}><div className="overflow-x-auto"><table className="w-full text-left text-sm text-slate-400"><thead className="bg-white/5 text-slate-200 uppercase text-xs font-semibold"><tr><th className="px-4 py-3">Asset</th><th className="px-4 py-3">Invested</th><th className="px-4 py-3">Current</th><th className="px-4 py-3">P&L</th><th className="px-4 py-3 text-right">Action</th></tr></thead><tbody className="divide-y divide-white/5">{data.map((item: any) => { const pnl = Number(item.value) - (Number(item.invested_amount) || Number(item.value)); const pnlPercent = (Number(item.invested_amount) || 0) > 0 ? ((pnl / Number(item.invested_amount)) * 100).toFixed(1) : '0'; return (<tr key={item.id} className="hover:bg-white/5 transition-colors"><td className="px-4 py-3"><div className="text-white font-medium">{item.name}</div><div className="text-[10px] text-slate-500">{item.type} {item.nav && `NAV: ${item.nav}`}</div></td><td className="px-4 py-3">{formatCurrency(item.invested_amount || item.value)}</td><td className="px-4 py-3 text-white font-medium">{formatCurrency(item.value)}</td><td className={`px-4 py-3 font-medium ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{pnl >= 0 ? '+' : ''}{formatCurrency(pnl)} <span className="text-xs opacity-75">({pnlPercent}%)</span></td><td className="px-4 py-3 text-right flex justify-end gap-2"><button onClick={() => openEdit(item)} className="text-blue-400 hover:text-blue-300 p-1"><Pencil size={16}/></button><button onClick={() => onDelete('investments', item.id)} className="text-rose-500 hover:text-rose-400 p-1 rounded-md hover:bg-rose-500/10"><Trash2 size={16}/></button></td></tr>); })}</tbody></table></div></Card>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Investment" : "Add Investment"}><form onSubmit={handleAddOrUpdate} className="space-y-4"><div><label className="block text-xs font-medium text-slate-400 mb-1">Asset Class</label><select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none" onChange={(e) => { handleChange('type', e.target.value); if (e.target.value !== 'Mutual Fund') { setFetchedNav(null); setSearchQuery(""); } }} value={formData.type}><option value="Mutual Fund">Mutual Fund (Auto-Fetch)</option><option value="Stocks">Stocks / Equity</option><option value="Govt Scheme">Govt Scheme (PPF/EPF)</option><option value="Commodity">Gold / Silver</option><option value="Crypto">Crypto</option><option value="Real Estate">Real Estate</option><option value="Cash">Cash / FD</option></select></div>{formData.type === 'Mutual Fund' ? (<><div className="relative"><label className="block text-xs font-medium text-slate-400 mb-1">Search Mutual Fund</label><div className="relative"><Search className="absolute left-3 top-2.5 text-slate-500" size={16} /><input type="text" placeholder="Type fund name" className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white outline-none" value={formData.name || searchQuery} onChange={(e) => { setSearchQuery(e.target.value); if (formData.schemeCode) setFormData({...formData, schemeCode: '', name: ''}); }} />{isSearching && <Loader2 className="absolute right-3 top-2.5 text-blue-500 animate-spin" size={16} />}</div>{mfResults.length > 0 && !formData.schemeCode && (<div className="absolute z-50 w-full bg-slate-800 border border-slate-700 rounded-lg mt-1 shadow-xl max-h-48 overflow-y-auto">{mfResults.map((fund: any) => (<div key={fund.schemeCode} className="p-2 hover:bg-slate-700 cursor-pointer text-xs text-slate-200 border-b border-slate-700/50" onClick={() => selectFund(fund)}>{fund.schemeName}</div>))}</div>)}</div>{formData.schemeCode && fetchedNav && (<div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex justify-between items-center"><span className="text-xs text-emerald-400 font-medium">Live NAV Fetched</span><span className="text-sm font-bold text-white">₹{fetchedNav}</span></div>)}<div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-medium text-slate-400 mb-1">Total Invested (₹)</label><input type="number" required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none" onChange={(e) => handleChange('invested_amount', e.target.value)} value={formData.invested_amount}/></div><div><label className="block text-xs font-medium text-slate-400 mb-1">Units Held</label><input type="number" step="0.001" required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none" onChange={(e) => handleChange('units', e.target.value)} value={formData.units}/></div></div></>) : (<><div><label className="block text-xs font-medium text-slate-400 mb-1">Asset Name</label><input type="text" required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none" onChange={(e) => handleChange('name', e.target.value)} value={formData.name} /></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-medium text-slate-400 mb-1">Invested Amount (₹)</label><input type="number" required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none" onChange={(e) => handleChange('invested_amount', e.target.value)} value={formData.invested_amount}/></div><div><label className="block text-xs font-medium text-slate-400 mb-1">Current Value (₹)</label><input type="number" required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none" onChange={(e) => handleChange('value', e.target.value)} value={formData.value}/></div></div></>)}<button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-medium mt-4">Save Investment</button></form></Modal>
        </div>
    );
};

const GenericListModule = ({ title, data, collectionName, fields, onAdd, onUpdate, onDelete, safeMode }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  
  const openAdd = () => { setEditingId(null); setFormData({}); setIsModalOpen(true); };
  const openEdit = (item: any) => { setEditingId(item.id); setFormData(item); setIsModalOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => { 
      e.preventDefault(); 
      if (editingId) {
          const success = await onUpdate(collectionName, editingId, formData); 
          if (success) setIsModalOpen(false); 
      } else {
          const success = await onAdd(collectionName, formData); 
          if (success) setIsModalOpen(false); 
      }
  };
  const handleChange = (field: string, value: string) => { setFormData((prev: any) => ({ ...prev, [field]: value })); };
  
  return (
    <Card title={title} action={!safeMode && (<button onClick={openAdd} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm flex items-center transition-colors"><Plus size={16} className="mr-1" /> Add</button>)}>
      <div className="overflow-x-auto"><table className="w-full text-left text-sm text-slate-400"><thead className="bg-white/5 text-slate-200 uppercase text-xs font-semibold"><tr>{fields.map((f: any) => (<th key={f.key} className="px-4 py-3">{f.label}</th>))}{!safeMode && <th className="px-4 py-3 text-right">Actions</th>}</tr></thead><tbody className="divide-y divide-white/5">{data.length === 0 ? (<tr><td colSpan={fields.length + 1} className="px-4 py-8 text-center text-slate-600 italic">No records found.</td></tr>) : (data.map((item: any) => (<tr key={item.id} className="hover:bg-white/5 transition-colors">{fields.map((f: any) => (<td key={f.key} className={`px-4 py-3 ${f.primary ? 'text-white font-medium' : ''}`}>{f.format ? f.format(item[f.key]) : (item[f.key] !== undefined && item[f.key] !== null) ? String(item[f.key]) : '-'}</td>))}{!safeMode && (<td className="px-4 py-3 text-right flex justify-end gap-2"><button onClick={() => openEdit(item)} className="text-blue-400 hover:text-blue-300 p-1"><Pencil size={16}/></button><button onClick={() => onDelete(collectionName, item.id)} className="text-rose-500 hover:text-rose-400 p-1 rounded-md hover:bg-rose-500/10 transition-colors"><Trash2 size={16} /></button></td>)}</tr>)))}</tbody></table></div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? `Edit ${title}` : `Add ${title}`}><form onSubmit={handleSubmit} className="space-y-4">{fields.map((f: any) => (<div key={f.key}><label className="block text-xs font-medium text-slate-400 mb-1">{f.label}</label><input type={f.type || "text"} required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none" value={formData[f.key] || ''} onChange={(e) => handleChange(f.key, e.target.value)} /></div>))}<button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-medium mt-4">Save Record</button></form></Modal>
    </Card>
  );
};

const SettlementsModule = ({ data, onAdd, onUpdate, onDelete, safeMode }: any) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>({ bank_name: '', outstanding: '', settlement: '', status: 'Negotiating' });
    
    // Analytics
    const totalOutstanding = data.reduce((acc: number, curr: any) => acc + Number(curr.outstanding), 0);
    const totalSettlement = data.reduce((acc: number, curr: any) => acc + Number(curr.settlement), 0);
    const totalWaived = totalOutstanding - totalSettlement;
    const savingsPct = totalOutstanding > 0 ? ((totalWaived / totalOutstanding) * 100).toFixed(1) : 0;

    const statusData = useMemo(() => {
        const stats: any = {};
        data.forEach((s: any) => { stats[s.status] = (stats[s.status] || 0) + 1; });
        return Object.keys(stats).map(k => ({ name: k, value: stats[k] }));
    }, [data]);

    const openAdd = () => { setEditingId(null); setFormData({ bank_name: '', outstanding: '', settlement: '', status: 'Negotiating' }); setIsModalOpen(true); };
    
    const openEdit = (item: any) => { 
        setEditingId(item.id); 
        setFormData({ 
            bank_name: item.bank_name, 
            outstanding: item.outstanding, 
            settlement: item.settlement, 
            status: item.status 
        }); 
        setIsModalOpen(true); 
    };

    const handleSubmit = async (e: React.FormEvent) => { 
        e.preventDefault(); 
        const payload = { ...formData, outstanding: Number(formData.outstanding), settlement: Number(formData.settlement), waived: Number(formData.outstanding) - Number(formData.settlement) };
        if (editingId) {
            const success = await onUpdate('settlements', editingId, payload); 
            if (success) setIsModalOpen(false); 
        } else {
            const success = await onAdd('settlements', payload); 
            if (success) setIsModalOpen(false); 
        }
    };
    const handleChange = (field: string, value: any) => { setFormData((prev: any) => ({ ...prev, [field]: value })); };
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><StatCard title="Total Liability" value={formatCurrency(totalOutstanding)} icon={Banknote} color="rose" /><StatCard title="Settlement Cost" value={formatCurrency(totalSettlement)} icon={Handshake} color="blue" /><StatCard title="Total Savings" value={formatCurrency(totalWaived)} icon={TrendingDown} color="emerald" subtext={`${savingsPct}% Waived`} /></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title="Status Overview" className="lg:col-span-1">
                    <div className="h-64 flex flex-col items-center justify-center">
                         <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{statusData.map((entry:any, index:number) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} /><Legend verticalAlign="bottom" height={36}/></PieChart></ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Settlement Tracking" className="lg:col-span-2" action={!safeMode && (<button onClick={openAdd} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm flex items-center transition-colors"><Plus size={16} className="mr-1" /> Add</button>)}>
                    <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {data.map((s: any) => {
                            const progress = s.outstanding > 0 ? ((s.waived / s.outstanding) * 100) : 0;
                            return (
                                <div key={s.id} className="bg-white/5 border border-white/10 p-5 rounded-xl relative group hover:border-blue-500/30 transition-all">
                                    {!safeMode && (<div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => openEdit(s)} className="text-blue-400 hover:text-blue-300 p-1"><Pencil size={16}/></button><button onClick={() => onDelete('settlements', s.id)} className="text-slate-600 hover:text-rose-500 p-1"><Trash2 size={16}/></button></div>)}
                                    <div className="flex justify-between items-start mb-2 pr-8">
                                        <div><h3 className="text-white font-bold text-lg">{s.bank_name}</h3><span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider mt-1 ${s.status === 'NOC Received' ? 'bg-emerald-500/20 text-emerald-400' : s.status === 'Settled' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>{s.status}</span></div>
                                        <div className="text-right"><div className="text-sm text-slate-400">Pay Only</div><div className="text-blue-400 font-bold text-lg">{formatCurrency(s.settlement)}</div></div>
                                    </div>
                                    <div className="mt-3">
                                        <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Savings Progress</span><span>{progress.toFixed(0)}% Waived</span></div>
                                        <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div></div>
                                        <div className="flex justify-between text-xs mt-2"><span className="text-slate-500">Original Debt: {formatCurrency(s.outstanding)}</span><span className="text-emerald-400 font-bold">You Save: {formatCurrency(s.waived)}</span></div>
                                    </div>
                                </div>
                            );
                        })}
                        {data.length === 0 && <div className="text-center text-slate-500 py-8 italic">No settlements tracked.</div>}
                    </div>
                </Card>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Settlement" : "Add Settlement"}><form onSubmit={handleSubmit} className="space-y-4"><div><label className="block text-xs font-medium text-slate-400 mb-1">Bank</label><input type="text" required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none" value={formData.bank_name || ''} onChange={(e) => handleChange('bank_name', e.target.value)} /></div><div><label className="block text-xs font-medium text-slate-400 mb-1">Outstanding</label><input type="number" required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none" value={formData.outstanding || ''} onChange={(e) => handleChange('outstanding', e.target.value)} /></div><div><label className="block text-xs font-medium text-slate-400 mb-1">Settlement</label><input type="number" required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none" value={formData.settlement || ''} onChange={(e) => handleChange('settlement', e.target.value)} /></div><div><label className="block text-xs font-medium text-slate-400 mb-1">Status</label><select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none" value={formData.status || 'Negotiating'} onChange={(e) => handleChange('status', e.target.value)}><option value="Negotiating">Negotiating</option><option value="Offer Received">Offer Received</option><option value="Settled">Settled</option><option value="NOC Received">NOC Received</option></select></div><button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-medium mt-4">Save</button></form></Modal>
        </div>
    );
};

// --- AUTHENTICATED APP ---

const AuthenticatedApp = ({ user, onLogout }: any) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [data, setData] = useState<any>({ income: [], expenses: [], settlements: [], investments: [], wishlist: [] });
    const [loading, setLoading] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState<{open: boolean, table: string | null, id: string | null}>({ open: false, table: null, id: null });
    const [safeMode, setSafeMode] = useState(false); 
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile Menu State

    const fetchData = useCallback(async () => {
        if (!supabase) return;
        try {
            const results: any = {};
            const tables = ['income', 'expenses', 'settlements', 'investments', 'wishlist'];
            await Promise.all(tables.map(async (table) => {
                const { data: tableData, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
                if (error) console.error(`Error fetching ${table}:`, error);
                results[table] = tableData || [];
            }));
            results.liabilities = []; 
            setData(results);
        } catch (e) {
            console.error("Fetch error", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAdd = async (table: string, payload: any) => {
        if (!supabase) return false;
        try {
            const { error } = await supabase.from(table).insert([{ ...payload, user_id: user.id }]);
            if (error) throw error;
            fetchData(); return true; 
        } catch (e: any) {
            alert(`Error: ${e.message}`);
            return false;
        }
    };
    
    const handleUpdate = async (table: string, id: string, payload: any) => {
        if (!supabase) return false;
        try {
            const { error } = await supabase.from(table).update(payload).eq('id', id);
            if (error) throw error;
            fetchData(); return true; 
        } catch (e: any) {
            alert(`Error: ${e.message}`);
            return false;
        }
    };

    const handleDelete = async () => {
        if (!supabase || !deleteConfirm.table || !deleteConfirm.id) return;
        try {
            const { error } = await supabase.from(deleteConfirm.table).delete().eq('id', deleteConfirm.id);
            if (error) throw error;
            setDeleteConfirm({ open: false, table: null, id: null });
            fetchData();
        } catch (e: any) {
            alert(`Error: ${e.message}`);
        }
    };

    const requestDelete = (table: string, id: string) => setDeleteConfirm({ open: true, table, id });
    const commonProps = { data, userId: user.id, onDelete: requestDelete, onAdd: handleAdd, onUpdate: handleUpdate, safeMode: false };

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-blue-500"><Loader2 className="animate-spin" size={32} /></div>;

    // Mobile Menu Helper
    const NavContent = ({ mobile = false }) => (
        <>
            <button onClick={() => { setActiveTab('summary'); if(mobile) setIsMobileMenuOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all mb-1 ${activeTab === 'summary' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}><ClipboardList size={20} /><span className="font-medium">Master Summary</span></button>
            <button onClick={() => { setActiveTab('dashboard'); if(mobile) setIsMobileMenuOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all mb-1 ${activeTab === 'dashboard' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}><LayoutDashboard size={20} /><span className="font-medium">Dashboard</span></button>
            
            <div className="pt-4 pb-2 text-[10px] font-bold text-slate-500 px-4 uppercase tracking-widest">Finances</div>
            <button onClick={() => { setActiveTab('income'); if(mobile) setIsMobileMenuOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all mb-1 ${activeTab === 'income' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}><Wallet size={20} /><span className="font-medium">Income</span></button>
            <button onClick={() => { setActiveTab('expenses'); if(mobile) setIsMobileMenuOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all mb-1 ${activeTab === 'expenses' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}><CreditCard size={20} /><span className="font-medium">Monthly Expenses</span></button>
            <button onClick={() => { setActiveTab('emis'); if(mobile) setIsMobileMenuOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all mb-1 ${activeTab === 'emis' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}><Landmark size={20} /><span className="font-medium">Loans & EMIs</span></button>
            
            <div className="pt-4 pb-2 text-[10px] font-bold text-slate-500 px-4 uppercase tracking-widest">Portfolio</div>
            <button onClick={() => { setActiveTab('investments'); if(mobile) setIsMobileMenuOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all mb-1 ${activeTab === 'investments' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}><TrendingUp size={20} /><span className="font-medium">Investments</span></button>
            <button onClick={() => { setActiveTab('settlements'); if(mobile) setIsMobileMenuOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all mb-1 ${activeTab === 'settlements' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}><Handshake size={20} /><span className="font-medium">Settlements</span></button>
            <button onClick={() => { setActiveTab('goals'); if(mobile) setIsMobileMenuOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all mb-1 ${activeTab === 'goals' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}><Target size={20} /><span className="font-medium">Wishlist & Goals</span></button>
            
            <div className="pt-4 border-t border-white/5 mt-4"></div>
            <button onClick={() => { setActiveTab('reports'); if(mobile) setIsMobileMenuOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all mb-1 ${activeTab === 'reports' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}><FileText size={20} /><span className="font-medium">Reports & Export</span></button>
        </>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex print:bg-white print:text-black">
            {/* Desktop Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col print:hidden">
                <div className="p-6 border-b border-slate-800 flex items-center space-x-2"><div className="bg-blue-600 p-2 rounded-lg"><LayoutDashboard size={20} className="text-white" /></div><div><h1 className="font-bold text-white text-lg tracking-tight">PFCC</h1><p className="text-xs text-slate-500">v3.9.5</p></div></div>
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                    <NavContent />
                </nav>
                <div className="p-4 border-t border-slate-800"><button onClick={onLogout} className="w-full flex items-center space-x-3 px-4 py-3 text-rose-400 hover:bg-rose-900/20 rounded-lg transition-colors"><LogOut size={20} /><span>Sign Out</span></button></div>
            </aside>

            {/* Mobile Drawer Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="w-64 h-full bg-slate-900 border-r border-white/10 flex flex-col" onClick={e => e.stopPropagation()}>
                         <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center space-x-2"><div className="bg-blue-600 p-2 rounded-lg"><LayoutDashboard size={20} className="text-white" /></div><span className="font-bold text-white">Menu</span></div>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400"><X size={24} /></button>
                         </div>
                         <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                            <NavContent mobile={true} />
                         </nav>
                         <div className="p-4 border-t border-slate-800"><button onClick={onLogout} className="w-full flex items-center space-x-3 px-4 py-3 text-rose-400 hover:bg-rose-900/20 rounded-lg transition-colors"><LogOut size={20} /><span>Sign Out</span></button></div>
                    </div>
                </div>
            )}

            <main className="flex-1 overflow-y-auto pb-24 md:pb-0 print:overflow-visible print:h-auto -webkit-overflow-scrolling-touch">
                <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 md:px-6 py-4 flex justify-between items-center print:hidden">
                    <div className="flex items-center gap-3">
                        <button className="md:hidden text-slate-400 p-1" onClick={() => setIsMobileMenuOpen(true)}><Menu size={24} /></button>
                        <h2 className="text-lg md:text-xl font-bold text-white capitalize">{activeTab.replace('-', ' ')}</h2>
                    </div>
                    <div className="flex items-center space-x-4"><div className="hidden md:block text-right"><p className="text-sm font-medium text-white flex items-center justify-end"><UserCircle size={14} className="mr-1 text-blue-400"/>{user.email}</p><p className="text-xs text-slate-500">ID: {user.id.slice(0, 6)}...</p></div></div>
                </header>
                <div className="hidden print:block p-8 pb-4 text-center border-b border-black"><h1 className="text-2xl font-bold text-black uppercase tracking-widest">Financial Status Report</h1><p className="text-sm text-gray-600">Personal Finance Command Center</p></div>
                <div className="p-4 md:p-6 max-w-7xl mx-auto print:p-8 print:w-full">
                    <div className="print:visible block"><div className="hidden print:block"><PrintableReport data={data} /></div></div>
                    <div className="print:hidden">
                        {activeTab === 'summary' && <MasterSummaryModule {...commonProps} />}
                        {activeTab === 'reports' && <ReportsModule {...commonProps} />}
                        {activeTab === 'dashboard' && <DashboardModule {...commonProps} setActiveTab={setActiveTab} />}
                        {activeTab === 'income' && <GenericListModule title="Income Sources" collectionName="income" fields={[{ key: 'source', label: 'Source', primary: true }, { key: 'amount', label: 'Amount (₹)', type: 'number', format: formatCurrency }, { key: 'type', label: 'Type' }]} {...commonProps} data={data.income} />}
                        {activeTab === 'expenses' && <ExpensesModule {...commonProps} data={data.expenses.filter((e: any) => !e.tenure_months || e.tenure_months === 0)} />}
                        {activeTab === 'emis' && <LoansModule {...commonProps} data={data.expenses.filter((e: any) => e.tenure_months > 0)} />}
                        {activeTab === 'settlements' && <SettlementsModule {...commonProps} data={data.settlements} />}
                        {activeTab === 'investments' && <InvestmentsModule {...commonProps} data={data.investments} />}
                        {activeTab === 'goals' && <GenericListModule title="Wishlist & Targets" collectionName="wishlist" fields={[{ key: 'item', label: 'Goal Item', primary: true }, { key: 'cost', label: 'Estimated Cost (₹)', type: 'number', format: formatCurrency }, { key: 'target_date', label: 'Target Date', type: 'date' }]} {...commonProps} data={data.wishlist} />}
                    </div>
                </div>
            </main>

            {/* Mobile Bottom Quick Nav */}
            <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-white/10 flex md:hidden z-40 print:hidden pb-[env(safe-area-inset-bottom)] justify-around items-center h-16">
              <button onClick={() => setActiveTab('dashboard')} className={`p-2 rounded-full ${activeTab === 'dashboard' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400'}`}><LayoutDashboard size={24} /></button>
              <button onClick={() => setActiveTab('expenses')} className={`p-2 rounded-full ${activeTab === 'expenses' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400'}`}><CreditCard size={24} /></button>
              <button onClick={() => setActiveTab('investments')} className={`p-2 rounded-full ${activeTab === 'investments' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400'}`}><TrendingUp size={24} /></button>
              <button onClick={() => setIsMobileMenuOpen(true)} className={`p-2 rounded-full text-slate-400`}><Menu size={24} /></button>
            </div>

            <Modal isOpen={deleteConfirm.open} onClose={() => setDeleteConfirm({ ...deleteConfirm, open: false })} title="Confirm Deletion"><div className="space-y-4"><div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-start space-x-3"><AlertTriangle className="text-rose-500 shrink-0" size={20} /><div><p className="text-rose-400 font-medium text-sm">Permanent Action</p><p className="text-xs text-rose-300/70">This record will be permanently deleted from the database.</p></div></div><p className="text-slate-300 text-sm">Are you sure you want to proceed?</p><div className="flex space-x-3 pt-2"><button onClick={() => setDeleteConfirm({ ...deleteConfirm, open: false })} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium text-sm">Cancel</button><button onClick={handleDelete} className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-medium flex justify-center items-center text-sm"><Trash2 size={16} className="mr-2" /> Delete</button></div></div></Modal>
        </div>
    );
};

// --- ROOT APP ---

export default function App() {
    const [session, setSession] = useState<any>(null);

    useEffect(() => {
        if (!supabase) return;
        
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (!supabase) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="bg-slate-800 p-8 rounded-xl border border-rose-500/50 text-center max-w-md">
                    <AlertTriangle className="text-rose-500 mx-auto mb-4" size={40} />
                    <h2 className="text-xl font-bold text-white mb-2">Supabase Config Missing</h2>
                    <p className="text-slate-400 text-sm mb-4">
                        We couldn't detect your VITE_SUPABASE_URL or VITE_SUPABASE_KEY.
                    </p>
                </div>
            </div>
        );
    }

    if (!session) {
        return <LoginScreen onLogin={() => {}} />;
    }

    return (
        <AuthenticatedApp
            user={session.user}
            onLogout={() => supabase!.auth.signOut()}
        />
    );
}
