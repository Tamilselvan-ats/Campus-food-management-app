import React, { useState, useEffect } from 'react';
import {
  HeadcountMeal,
  MealSupplyCalculation,
  SupplyItem,
  WasteLog,
  PredictiveAlert,
  MealSlot,
  User,
} from '../types';
import {
  Users,
  ChefHat,
  Scale,
  AlertTriangle,
  Send,
  Plus,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Printer,
  Sliders,
  CheckCircle,
  HelpCircle,
  Info,
  Calendar,
  FileSpreadsheet,
} from 'lucide-react';
import {
  fetchHeadcounts,
  fetchSupplies,
  fetchWasteLogs,
  createWasteLog,
  fetchAlerts,
  broadcastNotification,
} from '../services/api';
import { triggerPushNotification, fireEcoConfetti } from '../services/notificationService';

interface AdminViewProps {
  currentUser: User;
  onRefreshData: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ currentUser, onRefreshData }) => {
  const [activeTab, setActiveTab] = useState<'headcounts' | 'supplies' | 'wastelog' | 'alerts' | 'broadcast'>('headcounts');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Data states
  const [headcounts, setHeadcounts] = useState<HeadcountMeal[]>([]);
  const [totalRegistered, setTotalRegistered] = useState<number>(0);
  const [suppliesData, setSuppliesData] = useState<{
    bufferPercent: number;
    calibrationMultiplier: number;
    predictionNote: string;
    mealSupplies: MealSupplyCalculation[];
    dailyGroceryList: SupplyItem[];
    grandTotalCost: number;
  } | null>(null);
  const [bufferSlider, setBufferSlider] = useState<number>(5);

  const [wasteLogs, setWasteLogs] = useState<WasteLog[]>([]);
  const [alerts, setAlerts] = useState<PredictiveAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // New Waste Log Form state
  const [showLogModal, setShowLogModal] = useState(false);
  const [newLogSlot, setNewLogSlot] = useState<MealSlot>('lunch');
  const [newLogDish, setNewLogDish] = useState('');
  const [newLogPlannedPortions, setNewLogPlannedPortions] = useState(180);
  const [newLogCookedKg, setNewLogCookedKg] = useState(75);
  const [newLogActualEaters, setNewLogActualEaters] = useState(165);
  const [newLogLeftoverKg, setNewLogLeftoverKg] = useState(4.5);
  const [newLogDisposal, setNewLogDisposal] = useState<WasteLog['disposal']>('donated_shelter');
  const [newLogReason, setNewLogReason] = useState<WasteLog['wasteReason']>('accurate_prep');
  const [newLogAction, setNewLogAction] = useState('');

  // Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSlot, setBroadcastSlot] = useState<MealSlot>('dinner');
  const [broadcastStatus, setBroadcastStatus] = useState('');

  // Load all admin data
  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      const [hcRes, supRes, wRes, alRes] = await Promise.all([
        fetchHeadcounts(selectedDate),
        fetchSupplies(selectedDate, bufferSlider),
        fetchWasteLogs(),
        fetchAlerts(),
      ]);

      setHeadcounts(hcRes.meals);
      setTotalRegistered(hcRes.totalRegisteredStudents);
      setSuppliesData(supRes);
      setWasteLogs(wRes.logs);
      setAlerts(alRes.alerts);
    } catch (err) {
      console.error('Error loading admin data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [selectedDate, bufferSlider]);

  // Handle Waste Log Submission
  const handleCreateWasteLog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const eatenKg = Math.max(0, newLogCookedKg - newLogLeftoverKg);
      await createWasteLog({
        date: selectedDate,
        slot: newLogSlot,
        mainDish: newLogDish || 'Daily Special',
        plannedPortions: Number(newLogPlannedPortions),
        cookedKg: Number(newLogCookedKg),
        actualEaters: Number(newLogActualEaters),
        eatenKg: parseFloat(eatenKg.toFixed(1)),
        leftoverKg: Number(newLogLeftoverKg),
        disposal: newLogDisposal,
        wasteReason: newLogReason,
        actionTaken: newLogAction || 'Surplus logged in daily kitchen registry.',
        loggedBy: currentUser.name,
      });

      setShowLogModal(false);
      fireEcoConfetti();
      triggerPushNotification(
        '📊 Waste Log Recorded',
        `Logged ${newLogLeftoverKg} kg leftover for ${newLogSlot}. Adaptive predictions updated!`
      );
      loadAdminData();
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Push Broadcast
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;

    try {
      await broadcastNotification(broadcastTitle, broadcastMessage, broadcastSlot, 'cutoff');
      triggerPushNotification(broadcastTitle, broadcastMessage);
      setBroadcastStatus('Broadcast sent to all campus students!');
      setBroadcastTitle('');
      setBroadcastMessage('');
      setTimeout(() => setBroadcastStatus(''), 4000);
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrintPrepSheet = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Admin Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-amber-950/30 border border-amber-500/20 p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <ChefHat className="w-3.5 h-3.5" /> Mess Kitchen Command
            </span>
            <span className="text-xs text-slate-400">Headcount & Raw Supplies Optimization</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Kitchen Operations & Prep Hub
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time meal RSVPs drive exact ingredient prep to eliminate hostel food waste.
          </p>
        </div>

        {/* Date Selector & Refresh */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none"
            />
          </div>
          <button
            onClick={loadAdminData}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            title="Refresh counts"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Critical Predictive Alerts Banner (if any) */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border flex items-start justify-between gap-3 text-xs leading-relaxed ${
                alert.level === 'warning'
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                  : alert.level === 'info'
                  ? 'bg-blue-950/40 border-blue-500/40 text-blue-200'
                  : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    alert.level === 'warning'
                      ? 'text-amber-400'
                      : alert.level === 'info'
                      ? 'text-blue-400'
                      : 'text-emerald-400'
                  }`}
                />
                <div>
                  <h4 className="font-bold text-sm text-slate-100">{alert.title}</h4>
                  <p className="mt-0.5 text-slate-300">{alert.description}</p>
                  <div className="mt-1.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 font-medium text-emerald-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Kitchen Action: {alert.recommendedAction}</span>
                  </div>
                </div>
              </div>

              <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900 border border-slate-700">
                {alert.impactKg} kg Impact
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Admin Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('headcounts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeTab === 'headcounts'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" /> Live Headcounts
        </button>
        <button
          onClick={() => setActiveTab('supplies')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeTab === 'supplies'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" /> Supplies Calculator
        </button>
        <button
          onClick={() => setActiveTab('wastelog')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeTab === 'wastelog'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ChefHat className="w-4 h-4" /> Waste Log & Prediction
        </button>
        <button
          onClick={() => setActiveTab('broadcast')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeTab === 'broadcast'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Send className="w-4 h-4" /> Push Notifications
        </button>
      </div>

      {/* TAB 1: Live Headcounts */}
      {activeTab === 'headcounts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {headcounts.map((meal) => {
              const attendPct = totalRegistered > 0 ? Math.round((meal.attendingCount / totalRegistered) * 100) : 0;
              return (
                <div
                  key={meal.slot}
                  className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                        {meal.slotLabel}
                      </span>
                      <span className="text-[11px] text-slate-500">{meal.timeWindow}</span>
                    </div>
                    <h3 className="font-bold text-slate-100 mt-1 text-sm">{meal.menuTitle}</h3>

                    {/* Big Count */}
                    <div className="my-4 flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-white">{meal.attendingCount}</span>
                      <span className="text-xs font-medium text-slate-400">/ {totalRegistered} eaters</span>
                      <span className="text-xs font-bold text-emerald-400 ml-auto">{attendPct}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${attendPct}%` }}
                      />
                    </div>

                    {/* Opt-out & Undecided breakdown */}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                      <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                        <span className="text-rose-400 font-bold">{meal.skippingCount}</span> Opted Out
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                        <span className="text-amber-400 font-bold">{meal.undecidedCount}</span> Undecided
                      </div>
                    </div>

                    {/* Dietary breakdown */}
                    <div className="mt-3 pt-3 border-t border-slate-800">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Dietary Distribution
                      </div>
                      <div className="flex flex-wrap gap-1.5 text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          Veg: {meal.dietaryBreakdown.Veg}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-300 border border-orange-500/20">
                          Non-Veg: {meal.dietaryBreakdown['Non-Veg']}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">
                          Jain: {meal.dietaryBreakdown.Jain}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-lime-500/10 text-lime-300 border border-lime-500/20">
                          Vegan: {meal.dietaryBreakdown.Vegan}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Student Attendee List preview */}
                  <div className="mt-4 pt-3 border-t border-slate-800 text-xs">
                    <div className="text-[11px] font-semibold text-slate-300 mb-1.5">Attending Students:</div>
                    <div className="max-h-24 overflow-y-auto space-y-1 pr-1 text-[11px]">
                      {meal.attendingStudents.map((s) => (
                        <div key={s.id} className="flex items-center justify-between text-slate-300">
                          <span className="truncate max-w-[130px]">{s.name}</span>
                          {s.dietaryNote && (
                            <span className="text-[10px] text-amber-400 truncate max-w-[100px]" title={s.dietaryNote}>
                              📝 {s.dietaryNote}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Kitchen Supplies Calculator */}
      {activeTab === 'supplies' && suppliesData && (
        <div className="space-y-6">
          {/* Controls Bar: Buffer percentage slider & Calibration note */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-slate-100">Prep Margin & Prediction Buffer</h3>
              </div>
              <p className="text-xs text-slate-400">
                Adjust safety margin added to confirmed student headcount:
              </p>
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={bufferSlider}
                  onChange={(e) => setBufferSlider(Number(e.target.value))}
                  className="w-48 accent-amber-500"
                />
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                  +{bufferSlider}% Buffer
                </span>
                <span className="text-xs text-slate-400">
                  (Multiplier: {suppliesData.calibrationMultiplier}x adaptive offset)
                </span>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <button
                onClick={handlePrintPrepSheet}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>Print Kitchen Prep Sheet</span>
              </button>
            </div>
          </div>

          {/* Adaptive Engine Insight Banner */}
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-200">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold">Kitchen Calibration Status: </span>
              <span>{suppliesData.predictionNote}</span>
            </div>
          </div>

          {/* Aggregated Daily Raw Grocery Requirements */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-md">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  Consolidated Daily Grocery Procurement List
                </h3>
                <p className="text-xs text-slate-400">
                  Total raw ingredients calculated across all 4 meals for {selectedDate}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Estimated Raw Material Cost:</span>
                <div className="text-lg font-bold text-emerald-400">₹{suppliesData.grandTotalCost.toLocaleString()}</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Raw Ingredient</th>
                    <th className="px-5 py-3">Exact Quantity Needed</th>
                    <th className="px-5 py-3">Estimated Budget</th>
                    <th className="px-5 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {suppliesData.dailyGroceryList.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-850/60">
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-semibold text-slate-100">{item.name}</td>
                      <td className="px-5 py-3 font-bold text-amber-300 text-sm">
                        {item.amount} {item.unit}
                      </td>
                      <td className="px-5 py-3 text-slate-400">₹{item.cost}</td>
                      <td className="px-5 py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> Ready for Kitchen
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Waste Log & Future Prediction */}
      {activeTab === 'wastelog' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-slate-800">
            <div>
              <h3 className="font-bold text-slate-100 text-base">Kitchen Waste Audit & Calibrated Prediction</h3>
              <p className="text-xs text-slate-400">
                Tracking what was cooked vs. actually eaten refines our automatic prep multipliers.
              </p>
            </div>
            <button
              onClick={() => setShowLogModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Log Finished Kitchen Batch</span>
            </button>
          </div>

          {/* Waste Logs Table */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3">Date / Meal</th>
                    <th className="px-5 py-3">Main Dish</th>
                    <th className="px-5 py-3">Cooked vs Eaten</th>
                    <th className="px-5 py-3">Leftover</th>
                    <th className="px-5 py-3">Disposal Method</th>
                    <th className="px-5 py-3">Cause / Observation</th>
                    <th className="px-5 py-3">Logged By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {wasteLogs.map((log) => {
                    const isMinimal = log.leftoverKg <= 3.5;
                    return (
                      <tr key={log.id} className="hover:bg-slate-850/60">
                        <td className="px-5 py-3">
                          <div className="font-bold text-slate-100">{log.date}</div>
                          <div className="text-[10px] uppercase text-amber-400 font-semibold">{log.slot}</div>
                        </td>
                        <td className="px-5 py-3 font-semibold text-slate-200">{log.mainDish}</td>
                        <td className="px-5 py-3">
                          <div>
                            <span className="font-bold text-slate-100">{log.cookedKg} kg</span> cooked
                          </div>
                          <div className="text-slate-400 text-[11px]">
                            {log.eatenKg} kg eaten ({log.actualEaters} students)
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-xs ${
                              isMinimal
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {log.leftoverKg} kg
                          </span>
                        </td>
                        <td className="px-5 py-3 capitalize">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {log.disposal.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-3 max-w-xs">
                          <div className="font-medium text-slate-300 capitalize">{log.wasteReason.replace('_', ' ')}</div>
                          <div className="text-[11px] text-slate-400 truncate" title={log.actionTaken}>
                            {log.actionTaken}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-slate-400 text-[11px]">{log.loggedBy}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Push Notification Broadcast */}
      {activeTab === 'broadcast' && (
        <div className="max-w-2xl mx-auto rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-5">
          <div>
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-slate-100 text-base">Instant Student Push Broadcast</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Send instant browser push notifications to remind students to submit meal choices before kitchen prep locks.
            </p>
          </div>

          {broadcastStatus && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>{broadcastStatus}</span>
            </div>
          )}

          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Quick Presets</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setBroadcastTitle('⏰ Dinner Cutoff in 30 Mins (07:00 PM)');
                  setBroadcastMessage('Confirm if you are eating dinner tonight to help the chefs minimize food waste!');
                  setBroadcastSlot('dinner');
                }}
                className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-left hover:border-slate-700 transition"
              >
                <div className="font-semibold text-xs text-slate-200">Dinner RSVP Closing Soon</div>
                <div className="text-[11px] text-slate-400">Urgent cutoff reminder</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setBroadcastTitle('✨ Special Festive Feast Tonight!');
                  setBroadcastMessage('Paneer Butter Masala & Gulab Jamun on the menu! Mark your attendance now.');
                  setBroadcastSlot('dinner');
                }}
                className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-left hover:border-slate-700 transition"
              >
                <div className="font-semibold text-xs text-slate-200">Special Feast Announcement</div>
                <div className="text-[11px] text-slate-400">Notify about chef specials</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Notification Title</label>
              <input
                type="text"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. ⏰ Lunch RSVP Cutoff Alert"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Message Content</label>
              <textarea
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Type your alert message to all students..."
                rows={3}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Associated Meal Slot</label>
              <div className="grid grid-cols-4 gap-2">
                {(['breakfast', 'lunch', 'snacks', 'dinner'] as MealSlot[]).map((slot) => (
                  <button
                    type="button"
                    key={slot}
                    onClick={() => setBroadcastSlot(slot)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-medium capitalize border transition ${
                      broadcastSlot === slot
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                        : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast Push Notification to Students</span>
            </button>
          </form>
        </div>
      )}

      {/* Modal: Log New Finished Batch */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-white">
            <h3 className="text-lg font-bold text-slate-100">Log Kitchen Food Waste & Prep Result</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter cooked vs. eaten weights to automatically calibrate future meal predictions.
            </p>

            <form onSubmit={handleCreateWasteLog} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Meal Slot</label>
                  <select
                    value={newLogSlot}
                    onChange={(e) => setNewLogSlot(e.target.value as MealSlot)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="snacks">Evening Snacks</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Main Dish Name</label>
                  <input
                    type="text"
                    value={newLogDish}
                    onChange={(e) => setNewLogDish(e.target.value)}
                    placeholder="e.g. Paneer Butter Masala"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Total Cooked (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newLogCookedKg}
                    onChange={(e) => setNewLogCookedKg(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Actual Students Eaten</label>
                  <input
                    type="number"
                    value={newLogActualEaters}
                    onChange={(e) => setNewLogActualEaters(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Leftover Remaining (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newLogLeftoverKg}
                    onChange={(e) => setNewLogLeftoverKg(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Disposal / Repurpose</label>
                  <select
                    value={newLogDisposal}
                    onChange={(e) => setNewLogDisposal(e.target.value as WasteLog['disposal'])}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="donated_shelter">Donated to Shelter (Annakshetra)</option>
                    <option value="repurposed">Hygienically Repurposed</option>
                    <option value="composted">Organic Vermicompost Pit</option>
                    <option value="discarded">Discarded</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Waste Reason</label>
                <select
                  value={newLogReason}
                  onChange={(e) => setNewLogReason(e.target.value as WasteLog['wasteReason'])}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                >
                  <option value="accurate_prep">Accurate Prep (Zero or minimal waste)</option>
                  <option value="sudden_absenteeism">Sudden Absenteeism (Unannounced skips)</option>
                  <option value="unpopular_dish">Unpopular Dish / Recipe Feedback</option>
                  <option value="overcooked_buffer">Overcooked Buffer Margin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Action Taken / Feedback</label>
                <input
                  type="text"
                  value={newLogAction}
                  onChange={(e) => setNewLogAction(e.target.value)}
                  placeholder="e.g. Leftovers packed and sent to night shelter within 1 hr."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Save Waste Log & Update Predictor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
