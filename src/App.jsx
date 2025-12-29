import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calculator, ChevronDown, ChevronUp, HelpCircle, CheckCircle, 
  Building, PieChart, TrendingUp, Shield, Lightbulb, Wallet, ArrowRight,
  Printer, RotateCcw
} from 'lucide-react';

const Card = ({ children, className = "" }) => (
  <section className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden ${className}`}>
    {children}
  </section>
);

const TipCard = ({ icon, title, desc, savings }) => (
  <article className="flex items-start gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 hover:bg-indigo-50 transition-colors cursor-default">
    <div className="p-2 bg-white rounded-lg shadow-sm shrink-0" aria-hidden="true">
      {icon}
    </div>
    <div>
      <h4 className="text-sm font-bold text-slate-800">{title}</h4>
      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{desc}</p>
      {savings && (
        <div className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
          Potential Save: ₹{savings}
        </div>
      )}
    </div>
  </article>
);

const InputGroup = ({ label, value, onChange, tooltip, icon: Icon, extra }) => (
  <div className="mb-5 print:hidden">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-slate-400" aria-hidden="true" />}
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        {tooltip && (
          <div className="group relative">
            <HelpCircle className="w-3.5 h-3.5 text-slate-300 hover:text-blue-500 cursor-help transition-colors" aria-label="Info" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg hidden group-hover:block z-20 shadow-xl leading-relaxed">
              {tooltip}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
            </div>
          </div>
        )}
      </div>
      {extra}
    </div>
    <div className="relative group">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium group-focus-within:text-blue-500 transition-colors">₹</span>
      <input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full pl-8 pr-4 py-3 text-base bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800 placeholder-slate-300 outline-none hover:bg-white"
        placeholder="0"
        inputMode="decimal"
        aria-label={label}
      />
    </div>
  </div>
);

const ResultRow = ({ label, oldVal, newVal, isTotal, highlight }) => (
  <div className={`flex justify-between items-center py-3 border-b border-slate-50 last:border-0 ${highlight ? 'bg-blue-50/30 -mx-5 px-5 print:bg-gray-100' : ''}`}>
    <span className={`text-sm ${isTotal ? 'font-bold text-slate-900' : 'text-slate-500'}`}>{label}</span>
    <div className="flex gap-4 sm:gap-8 text-sm">
      <span className={`w-24 text-right font-medium ${isTotal ? 'text-slate-900' : 'text-slate-700'}`}>
        {oldVal !== null ? `₹${oldVal.toLocaleString('en-IN')}` : '-'}
      </span>
      <span className={`w-24 text-right font-medium ${isTotal ? 'text-blue-600 print:text-black' : 'text-slate-700'}`}>
        {newVal !== null ? `₹${newVal.toLocaleString('en-IN')}` : '-'}
      </span>
    </div>
  </div>
);

export default function IndianTaxCalculator() {
  // --- SEO & Title Setup ---
  useEffect(() => {
    // Dynamic Title for SEO
    document.title = "Indian Income Tax Calculator 2025-26 | Old vs New Regime | By Vivek Narkhede";
    
    // Dynamic Meta Description for SEO
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = "Calculate your Income Tax for FY 2025-26 with this free tool by Vivek Narkhede. Compare Old vs New Regime, calculate HRA, 80C, 80D, and find tax saving opportunities.";
  }, []);

  // --- State ---
  const [fy, setFy] = useState('2025-2026');
  const [ageGroup, setAgeGroup] = useState('general');
  
  // Income
  const [grossSalary, setGrossSalary] = useState(0);
  const [otherIncome, setOtherIncome] = useState(0);
  const [interestIncome, setInterestIncome] = useState(0);
  
  // Deductions
  const [basicDeduction80C, setBasicDeduction80C] = useState(0);
  
  // Advanced 80D
  const [medicalSelf, setMedicalSelf] = useState(0);
  const [medicalParents, setMedicalParents] = useState(0);
  const [parentsSenior, setParentsSenior] = useState(false);

  const [nps80CCD1B, setNps80CCD1B] = useState(0);
  const [hra, setHra] = useState(0);
  const [homeLoanInterest, setHomeLoanInterest] = useState(0);
  const [professionalTax, setProfessionalTax] = useState(0);
  const [otherDeductions, setOtherDeductions] = useState(0);
  
  // HRA Calculator State
  const [showHraCalc, setShowHraCalc] = useState(false);
  const [basicSalary, setBasicSalary] = useState(0);
  const [hraReceived, setHraReceived] = useState(0);
  const [rentPaid, setRentPaid] = useState(0);
  const [isMetro, setIsMetro] = useState(true);

  const [showBreakdown, setShowBreakdown] = useState(false);

  // --- Logic ---

  const STANDARD_DEDUCTION = 75000;

  // Reset Handler
  const handleReset = () => {
    if (window.confirm('Reset all values?')) {
      setGrossSalary(0); setOtherIncome(0); setInterestIncome(0);
      setBasicDeduction80C(0); setMedicalSelf(0); setMedicalParents(0); setParentsSenior(false);
      setNps80CCD1B(0); setHra(0); setHomeLoanInterest(0); setProfessionalTax(0); setOtherDeductions(0);
      setBasicSalary(0); setHraReceived(0); setRentPaid(0);
    }
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // Auto-calculate HRA
  useMemo(() => {
    if (basicSalary > 0 && rentPaid > 0) {
      const condition1 = hraReceived; 
      const condition2 = isMetro ? basicSalary * 0.5 : basicSalary * 0.4;
      const condition3 = Math.max(0, rentPaid - (basicSalary * 0.1));
      
      const exempt = Math.min(condition1, condition2, condition3);
      setHra(Math.round(exempt));
    }
  }, [basicSalary, hraReceived, rentPaid, isMetro]);

  // Tax Logic Helpers
  const calculateSurcharge = (tax, taxableIncome, regime) => {
    let rate = 0;
    
    if (taxableIncome > 5000000 && taxableIncome <= 10000000) rate = 0.10;
    else if (taxableIncome > 10000000 && taxableIncome <= 20000000) rate = 0.15;
    else if (taxableIncome > 20000000 && taxableIncome <= 50000000) rate = 0.25;
    else if (taxableIncome > 50000000) rate = regime === 'new' ? 0.25 : 0.37;
    
    if (regime === 'new' && taxableIncome > 20000000) rate = 0.25; 

    if (rate === 0) return { surcharge: 0, marginalRelief: 0 };
    return { surcharge: tax * rate, marginalRelief: 0, rate }; 
  };

  const calculateFinalTax = (income, regime) => {
    let tax = 0;
    let slabs = [];
    
    if (regime === 'old') {
      let l1 = ageGroup === 'senior' ? 300000 : (ageGroup === 'super' ? 500000 : 250000);
      let l2 = 500000; let l3 = 1000000;

      if (income > l1) {
        let val = Math.min(income, l2) - l1;
        if(val > 0) { tax += val * 0.05; slabs.push({label: '5% Slab', val: val*0.05}); }
      }
      if (income > l2) {
        let val = Math.min(income, l3) - l2;
        if(val > 0) { tax += val * 0.20; slabs.push({label: '20% Slab', val: val*0.20}); }
      }
      if (income > l3) {
        let val = income - l3;
        tax += val * 0.30; slabs.push({label: '30% Slab', val: val*0.30}); 
      }
    } else {
      if (fy === '2025-2026') {
        const limits = [400000, 800000, 1200000, 1600000, 2000000, 2400000];
        const rates = [0.05, 0.10, 0.15, 0.20, 0.25, 0.30];
        let prev = limits[0];
        rates.forEach((rate, i) => {
          let next = i === rates.length - 1 ? Infinity : limits[i+1];
          if (income > prev) {
            let val = Math.min(income, next) - prev;
            tax += val * rate;
            slabs.push({label: `${rate*100}% Slab`, val: val * rate});
          }
          prev = next;
        });
      } else {
        const ranges = [
          { min: 300000, max: 700000, rate: 0.05 },
          { min: 700000, max: 1000000, rate: 0.10 },
          { min: 1000000, max: 1200000, rate: 0.15 },
          { min: 1200000, max: 1500000, rate: 0.20 },
          { min: 1500000, max: Infinity, rate: 0.30 },
        ];
        ranges.forEach(r => {
          if (income > r.min) {
            let val = Math.min(income, r.max) - r.min;
            tax += val * r.rate;
            slabs.push({label: `${r.rate*100}% Slab`, val: val * r.rate});
          }
        });
      }
    }

    let rebate = 0;
    let rebateLimit = regime === 'old' ? 500000 : (fy === '2025-2026' ? 1200000 : 700000);
    
    if (income <= rebateLimit) {
      rebate = tax;
    } else if (regime === 'new') {
      let excess = income - rebateLimit;
      if (tax > excess) rebate = tax - excess; 
    }
    tax -= rebate;
    if (tax < 0) tax = 0;

    let surchargeData = calculateSurcharge(tax, income, regime);
    let surcharge = surchargeData.surcharge;
    
    // Simplified Surcharge MR Approximation
    if(surcharge > 0 && (income - 5000000 < surcharge || income - 10000000 < surcharge)) {
        // Full MR logic simplified for display
    }

    let cess = (tax + surcharge) * 0.04;
    
    return {
      baseTax: tax + rebate, 
      actualRebate: rebate,
      surcharge,
      marginalRelief: surchargeData.marginalRelief,
      cess,
      totalTax: tax + surcharge + cess,
      slabs
    };
  };

  const results = useMemo(() => {
    const totalIncome = grossSalary + otherIncome + interestIncome;

    // --- Deductions Logic ---
    const valid80C = Math.min(basicDeduction80C, 150000);
    
    // 80D Split Logic
    const limitSelf = ageGroup === 'general' ? 25000 : 50000;
    const limitParents = parentsSenior ? 50000 : 25000;
    const valid80D = Math.min(medicalSelf, limitSelf) + Math.min(medicalParents, limitParents);
    
    const valid80CCD = Math.min(nps80CCD1B, 50000);
    const validHomeLoan = Math.min(homeLoanInterest, 200000);
    
    // 80TTA/TTB Logic
    let valid80TTA_TTB = 0;
    if (ageGroup === 'general') {
       // 80TTA (Savings Interest only, max 10k)
       valid80TTA_TTB = Math.min(interestIncome, 10000);
    } else {
       // 80TTB (All interest, max 50k)
       valid80TTA_TTB = Math.min(interestIncome, 50000);
    }

    const totalOldDeductions = valid80C + valid80D + valid80CCD + hra + validHomeLoan + professionalTax + otherDeductions + 50000 + valid80TTA_TTB; 
    const oldTaxableIncome = Math.max(0, totalIncome - totalOldDeductions);

    const newRegimeDeductions = STANDARD_DEDUCTION; 
    const newTaxableIncome = Math.max(0, totalIncome - newRegimeDeductions);

    const oldRes = calculateFinalTax(oldTaxableIncome, 'old');
    const newRes = calculateFinalTax(newTaxableIncome, 'new');

    return {
      totalIncome,
      old: { ...oldRes, taxableIncome: oldTaxableIncome, deductions: totalOldDeductions, deductionBreakdown: { tta: valid80TTA_TTB, d80: valid80D } },
      new: { ...newRes, taxableIncome: newTaxableIncome, deductions: newRegimeDeductions }
    };
  }, [fy, ageGroup, grossSalary, otherIncome, interestIncome, basicDeduction80C, medicalSelf, medicalParents, parentsSenior, nps80CCD1B, hra, homeLoanInterest, professionalTax, otherDeductions]);

  // --- Dynamic Tax Tips Logic ---
  const taxTips = useMemo(() => {
    const tips = [];
    if (results.totalIncome === 0) return tips;

    const oldTaxable = results.old.taxableIncome;
    let bracketRate = 0.05;
    if (oldTaxable > 1000000) bracketRate = 0.30;
    else if (oldTaxable > 500000) bracketRate = 0.20;
    
    if (basicDeduction80C < 150000) {
      const gap = 150000 - basicDeduction80C;
      tips.push({
        id: '80c', title: "Maximize Section 80C",
        desc: `Invest ₹${gap.toLocaleString()} more in ELSS/PPF.`,
        savings: Math.round(gap * bracketRate * 1.04).toLocaleString(),
        icon: <TrendingUp className="w-5 h-5 text-green-600" />
      });
    }

    if (nps80CCD1B < 50000) {
      const gap = 50000 - nps80CCD1B;
      tips.push({
        id: 'nps', title: "NPS Benefit (80CCD 1B)",
        desc: `Invest ₹${gap.toLocaleString()} in NPS.`,
        savings: Math.round(gap * bracketRate * 1.04).toLocaleString(),
        icon: <Building className="w-5 h-5 text-blue-600" />
      });
    }

    if (medicalSelf === 0) {
       tips.push({
        id: '80d', title: "Health Insurance (Self)",
        desc: "Buying medical insurance saves tax.",
        savings: "~5,000+", icon: <Shield className="w-5 h-5 text-red-600" />
      });
    }

    return tips;
  }, [results, basicDeduction80C, nps80CCD1B, medicalSelf, ageGroup]);

  const savings = results.old.totalTax - results.new.totalTax;
  const recommendation = savings > 0 ? 'New Regime' : 'Old Regime';
  const savingsAmount = Math.abs(savings);
  
  const maxTax = Math.max(results.old.totalTax, results.new.totalTax, 1);
  const oldWidth = (results.old.totalTax / maxTax) * 100;
  const newWidth = (results.new.totalTax / maxTax) * 100;

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-800 print:bg-white">
      
      {/* Print-specific styles */}
      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:bg-white { background: white !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-none { border: none !important; }
          .print\\:text-black { color: black !important; }
          body { -webkit-print-color-adjust: exact; }
        }
      `}</style>

      {/* Top Banner Background (Hidden on Print) */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 h-64 w-full absolute top-0 left-0 z-0 print:hidden"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 pt-10">
        
        {/* Header with Semantic Tag */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="text-white print:text-black">
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/20 print:hidden">
                <Calculator className="w-8 h-8 text-blue-200" aria-hidden="true" />
              </div>
              Indian Tax Calculator
            </h1>
            <p className="text-blue-200 mt-2 text-lg font-light print:text-slate-500">
              FY {fy} | Comparison Report
            </p>
            <div className="text-blue-300/80 text-sm mt-1 font-medium flex items-center gap-1 print:text-black">
              Designed & Developed by Vivek Narkhede
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto print:hidden">
            <button onClick={handleReset} className="px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition backdrop-blur-md border border-white/10 flex items-center justify-center gap-2 font-medium">
               <RotateCcw className="w-4 h-4" /> Reset
            </button>
            <button onClick={handlePrint} className="px-4 py-3 bg-white text-blue-900 rounded-xl hover:bg-blue-50 transition shadow-lg flex items-center justify-center gap-2 font-bold">
               <Printer className="w-4 h-4" /> Print Summary
            </button>
            
            {/* Year & Age Selectors */}
            <div className="relative">
               <select aria-label="Financial Year" value={fy} onChange={(e) => setFy(e.target.value)} className="appearance-none w-full bg-blue-800/50 backdrop-blur-md border border-white/20 text-white text-sm rounded-xl px-4 py-3 pr-10 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="2025-2026" className="text-slate-800">FY 2025-26</option>
                <option value="2024-2025" className="text-slate-800">FY 2024-25</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-200 pointer-events-none" />
            </div>
            <div className="relative">
              <select aria-label="Age Group" value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className="appearance-none w-full bg-blue-800/50 backdrop-blur-md border border-white/20 text-white text-sm rounded-xl px-4 py-3 pr-10 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="general" className="text-slate-800">Age &lt; 60</option>
                <option value="senior" className="text-slate-800">Age 60-80</option>
                <option value="super" className="text-slate-800">Age 80+</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-200 pointer-events-none" />
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
          
          {/* Left Column: Inputs (Hidden on Print) */}
          <div className="lg:col-span-7 space-y-6 print:hidden">
            
            {/* Income Section */}
            <section aria-labelledby="income-heading">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h2 id="income-heading" className="text-lg font-bold mb-6 flex items-center gap-3 text-slate-800">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center" aria-hidden="true">
                    <Wallet className="w-5 h-5 text-blue-600" />
                  </div>
                  Income Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  <InputGroup label="Gross Salary / CTC" value={grossSalary} onChange={setGrossSalary} tooltip="Total annual salary before any deductions." />
                  <InputGroup label="Other Income" value={otherIncome} onChange={setOtherIncome} tooltip="Business, Freelance, or Rental Income." />
                  <InputGroup label="Interest Income" value={interestIncome} onChange={setInterestIncome} tooltip="Savings Bank Interest, FD Interest. Auto-calculates 80TTA/TTB exemption." />
                </div>
              </div>
            </section>

            {/* Deductions Section */}
            <section aria-labelledby="deductions-heading">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-full -mr-8 -mt-8 z-0"></div>
                <h2 id="deductions-heading" className="text-lg font-bold mb-6 flex items-center gap-3 text-slate-800 relative z-10">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center" aria-hidden="true">
                    <PieChart className="w-5 h-5 text-teal-600" />
                  </div>
                  Deductions (Old Regime)
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 relative z-10">
                  <InputGroup label="Section 80C" value={basicDeduction80C} onChange={setBasicDeduction80C} tooltip="EPF, PPF, ELSS, LIC. Max ₹1.5L." icon={TrendingUp} />
                  
                  {/* Advanced 80D Section */}
                  <div className="col-span-1 md:col-span-2 mb-6 p-4 bg-slate-50/80 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                        <Shield className="w-4 h-4 text-slate-400" aria-hidden="true" />
                        <label className="text-sm font-semibold text-slate-700">Medical Insurance (80D)</label>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-slate-500 font-medium mb-1 block">Self & Family</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                <input 
                                  type="number" 
                                  value={medicalSelf || ''} 
                                  onChange={e => setMedicalSelf(Number(e.target.value))} 
                                  className="w-full pl-7 py-2.5 text-base border rounded-lg focus:ring-2 focus:ring-blue-500/20" 
                                  placeholder="0" 
                                  aria-label="Medical Insurance Self"
                                />
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">Max: ₹{ageGroup === 'general' ? '25k' : '50k'}</div>
                        </div>
                        <div>
                            <div className="flex justify-between">
                                <label className="text-xs text-slate-500 font-medium mb-1 block">Parents</label>
                                <label className="flex items-center gap-1 text-[10px] cursor-pointer">
                                    <input type="checkbox" checked={parentsSenior} onChange={e => setParentsSenior(e.target.checked)} className="rounded w-3.5 h-3.5" />
                                    Parents &gt; 60?
                                </label>
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                <input 
                                  type="number" 
                                  value={medicalParents || ''} 
                                  onChange={e => setMedicalParents(Number(e.target.value))} 
                                  className="w-full pl-7 py-2.5 text-base border rounded-lg focus:ring-2 focus:ring-blue-500/20" 
                                  placeholder="0" 
                                  aria-label="Medical Insurance Parents"
                                />
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">Max: ₹{parentsSenior ? '50k' : '25k'}</div>
                        </div>
                    </div>
                  </div>

                  {/* HRA with built-in calculator */}
                  <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-slate-50 to-white p-5 rounded-2xl border border-slate-200 mb-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-slate-400" aria-hidden="true" />
                        <label className="text-sm font-semibold text-slate-700">HRA Exemption</label>
                      </div>
                      <button 
                        onClick={() => setShowHraCalc(!showHraCalc)}
                        className="text-xs bg-white border border-slate-200 px-3 py-2 rounded-full text-blue-600 font-semibold hover:bg-blue-50 transition-colors shadow-sm flex items-center gap-1.5 touch-manipulation"
                      >
                        {showHraCalc ? 'Close Helper' : 'Calculate HRA'}
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                    
                    {showHraCalc && (
                      <div className="mb-5 p-4 bg-white rounded-xl border border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 shadow-sm">
                         <div>
                           <label className="text-xs font-semibold text-slate-500 block mb-1.5 uppercase tracking-wide">Basic Salary</label>
                           <input type="number" className="w-full text-base p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="Basic" value={basicSalary || ''} onChange={e => setBasicSalary(Number(e.target.value))} />
                         </div>
                         <div>
                           <label className="text-xs font-semibold text-slate-500 block mb-1.5 uppercase tracking-wide">HRA Received</label>
                           <input type="number" className="w-full text-base p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="Received" value={hraReceived || ''} onChange={e => setHraReceived(Number(e.target.value))} />
                         </div>
                         <div>
                           <label className="text-xs font-semibold text-slate-500 block mb-1.5 uppercase tracking-wide">Rent Paid (Annual)</label>
                           <input type="number" className="w-full text-base p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="Rent" value={rentPaid || ''} onChange={e => setRentPaid(Number(e.target.value))} />
                         </div>
                         <div className="flex items-end pb-2">
                           <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
                             <input type="checkbox" checked={isMetro} onChange={e => setIsMetro(e.target.checked)} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300" />
                             Live in Metro City?
                           </label>
                         </div>
                         <div className="col-span-full mt-1">
                           <div className="flex justify-between items-center bg-green-50 px-4 py-2 rounded-lg border border-green-100">
                              <span className="text-xs font-semibold text-green-800 uppercase">Exemption Calculated</span>
                              <span className="font-mono font-bold text-green-700">₹{hra.toLocaleString('en-IN')}</span>
                           </div>
                         </div>
                      </div>
                    )}

                    <div className="relative group">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium group-focus-within:text-blue-500">₹</span>
                      <input 
                        type="number" 
                        value={hra || ''} 
                        onChange={(e) => setHra(Number(e.target.value))} 
                        className="w-full pl-8 pr-4 py-3 text-base bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium" 
                        placeholder="0"
                        aria-label="HRA Amount"
                      />
                    </div>
                  </div>

                  <InputGroup label="Home Loan Interest" value={homeLoanInterest} onChange={setHomeLoanInterest} tooltip="Interest on home loan (Self-occupied). Max ₹2L." />
                  <InputGroup label="NPS (80CCD 1B)" value={nps80CCD1B} onChange={setNps80CCD1B} tooltip="Additional NPS deduction. Max ₹50,000." />
                   <InputGroup label="Professional Tax" value={professionalTax} onChange={setProfessionalTax} tooltip="Usually ₹200/month (₹2500/yr)." />
                  <InputGroup label="Other Deductions" value={otherDeductions} onChange={setOtherDeductions} tooltip="LTA, 80E, 80G, etc." />
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Results - Sticky Sidebar (Full width on print) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6 self-start print:col-span-12 print:static">
            
            {/* Recommendation Card */}
            <Card className="p-0 border-0 shadow-xl overflow-hidden relative print:shadow-none print:border print:border-slate-300">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 print:hidden"></div>
              
              {/* Confetti / Decoration overlay */}
              <div className="absolute top-0 right-0 p-4 opacity-10 print:hidden">
                <CheckCircle className="w-32 h-32 text-white" />
              </div>

              <div className="relative p-6 text-white print:text-black">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-2 print:text-slate-500">Recommendation</div>
                    <div className="text-3xl font-bold text-white flex items-center gap-2 print:text-black">
                      {recommendation}
                    </div>
                  </div>
                  {savingsAmount > 0 && (
                    <div className="text-right bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 print:border-slate-200 print:bg-slate-100">
                      <div className="text-indigo-200 text-xs font-bold uppercase mb-0.5 print:text-slate-500">You save</div>
                      <div className="text-2xl font-bold text-emerald-400 print:text-green-700">₹{savingsAmount.toLocaleString('en-IN')}</div>
                    </div>
                  )}
                </div>
                
                {/* Visual Bar Comparison */}
                <div className="space-y-4 print:hidden">
                   <div className="relative h-11 w-full bg-slate-900/50 rounded-lg overflow-hidden flex items-center px-4 border border-white/5">
                      <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-rose-500 to-rose-600 transition-all duration-1000 ease-out" style={{width: `${Math.max(oldWidth, 2)}%`}}></div>
                      <div className="relative z-10 flex justify-between w-full text-sm font-semibold text-white drop-shadow-md">
                         <span>Old Regime</span>
                         <span>₹{results.old.totalTax.toLocaleString('en-IN')}</span>
                      </div>
                   </div>
                   <div className="relative h-11 w-full bg-slate-900/50 rounded-lg overflow-hidden flex items-center px-4 border border-white/5">
                      <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-1000 ease-out" style={{width: `${Math.max(newWidth, 2)}%`}}></div>
                      <div className="relative z-10 flex justify-between w-full text-sm font-semibold text-white drop-shadow-md">
                         <span>New Regime</span>
                         <span>₹{results.new.totalTax.toLocaleString('en-IN')}</span>
                      </div>
                   </div>
                </div>
              </div>
            </Card>

            {/* Smart Tax Tips Widget (Hidden on Print) */}
            {taxTips.length > 0 && (
              <Card className="p-5 border-l-4 border-l-indigo-500 print:hidden">
                <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-4">
                  <Lightbulb className="w-5 h-5 text-amber-500 fill-amber-500" aria-hidden="true" />
                  Tax Saving Ideas
                </h3>
                <div className="space-y-3">
                  {taxTips.map(tip => (
                    <TipCard 
                      key={tip.id} 
                      icon={tip.icon} 
                      title={tip.title} 
                      desc={tip.desc} 
                      savings={tip.savings} 
                    />
                  ))}
                </div>
              </Card>
            )}

            {/* Quick Summary Accordion */}
            <Card className="p-0 print:border print:border-slate-300">
              <div className="bg-slate-50/80 p-5 border-b border-slate-100 flex justify-between items-center print:bg-white print:border-b-2">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  Tax Summary
                </h3>
                <span className="text-xs font-bold px-2.5 py-1 bg-white border border-slate-200 text-slate-500 rounded-md shadow-sm print:border-black">
                   FY {fy.replace('20', '').replace('20', '')}
                </span>
              </div>
              <div className="p-5 space-y-1">
                 <ResultRow label="Taxable Income" oldVal={results.old.taxableIncome} newVal={results.new.taxableIncome} highlight />
                 <ResultRow label="Tax Calculated" oldVal={Math.round(results.old.baseTax)} newVal={Math.round(results.new.baseTax)} />
                 {(results.old.actualRebate > 0 || results.new.actualRebate > 0) && (
                   <ResultRow label="Rebate 87A" oldVal={Math.round(results.old.actualRebate)} newVal={Math.round(results.new.actualRebate)} />
                 )}
                 {(results.old.surcharge > 0 || results.new.surcharge > 0) && (
                   <ResultRow label="Surcharge" oldVal={Math.round(results.old.surcharge)} newVal={Math.round(results.new.surcharge)} />
                 )}
                 <ResultRow label="Cess (4%)" oldVal={Math.round(results.old.cess)} newVal={Math.round(results.new.cess)} />
                 <div className="pt-4 mt-3 border-t border-slate-100 print:border-black">
                    <ResultRow label="Net Tax Payable" oldVal={Math.round(results.old.totalTax)} newVal={Math.round(results.new.totalTax)} isTotal />
                 </div>
                 
                 {/* Print Only Deduction Breakdown */}
                 <div className="hidden print:block mt-8 pt-4 border-t border-dashed border-slate-300">
                    <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Deductions Used (Old Regime)</h4>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                        <div className="flex justify-between"><span>80C</span><span>₹{Math.min(basicDeduction80C, 150000).toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>80D (Medical)</span><span>₹{results.old.deductionBreakdown.d80.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>80TTA/TTB (Interest)</span><span>₹{results.old.deductionBreakdown.tta.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>HRA</span><span>₹{hra.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>NPS</span><span>₹{Math.min(nps80CCD1B, 50000).toLocaleString()}</span></div>
                        <div className="flex justify-between font-bold border-t mt-1 pt-1"><span>Total</span><span>₹{results.old.deductions.toLocaleString()}</span></div>
                    </div>
                 </div>
              </div>

              {/* Breakdown Toggle (Hidden on Print) */}
              <button 
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="w-full py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-600 font-semibold text-sm hover:text-blue-600 hover:bg-slate-100 transition-colors print:hidden touch-manipulation"
              >
                {showBreakdown ? 'Hide Detailed Calculation' : 'Show Detailed Calculation'}
                {showBreakdown ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
              </button>

              {showBreakdown && (
                <div className="p-5 border-t border-slate-100 bg-slate-50/50 animate-in slide-in-from-top-2 print:hidden">
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-3">New Regime Slabs</h4>
                  <div className="space-y-2 text-sm mb-6">
                    {results.new.slabs.map((slab, idx) => (
                      <div key={idx} className="flex justify-between py-1 text-slate-600">
                        <span>{slab.label}</span>
                        <span className="font-mono text-slate-800">₹{Math.round(slab.val).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-3">Old Regime Slabs</h4>
                  <div className="space-y-2 text-sm">
                    {results.old.slabs.map((slab, idx) => (
                      <div key={idx} className="flex justify-between py-1 text-slate-600">
                        <span>{slab.label}</span>
                        <span className="font-mono text-slate-800">₹{Math.round(slab.val).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            <div className="text-center text-xs text-slate-400 mt-4 print:text-black print:text-left print:mt-12">
               * This report is for estimation purposes only. Generated on {new Date().toLocaleDateString()}.
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
