import React, { useState, useEffect } from 'react';
import {
  BarChart2, Play, RefreshCw, CheckCircle2, TrendingUp,
  PieChart, Activity, Layers, Star, Award
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, PieChart as RePieChart, Pie
} from 'recharts';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

export default function AdminModelMetricsPage() {
  const [metrics, setMetrics] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [kValue, setKValue] = useState(10);
  const { showToast } = useToast();

  useEffect(() => {
    loadMetrics();
  }, [kValue]);

  const loadMetrics = async () => {
    try {
      const data = await api.getModelMetrics(kValue);
      setMetrics(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunEvaluation = async () => {
    setEvaluating(true);
    try {
      const data = await api.evaluateModel(kValue);
      setMetrics(data);
      showToast('Live evaluation job completed successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Evaluation job failed', 'error');
    } finally {
      setEvaluating(false);
    }
  };

  const genreChartData = metrics?.genre_distribution
    ? Object.entries(metrics.genre_distribution).map(([genre, count]) => ({
        name: genre,
        count,
      }))
    : [];

  const ageChartData = metrics?.age_group_distribution
    ? Object.entries(metrics.age_group_distribution).map(([cohort, count]) => ({
        name: cohort,
        value: count,
      }))
    : [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800/40 text-purple-300 text-xs font-semibold mb-2">
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            <span>Machine Learning Performance Evaluation</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-white">Model Metrics & Diagnostics</h1>
          <p className="text-xs text-slate-400 mt-1">
            Empirical evaluation of content-based and demographic baseline recommendations against user interactions.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <div className="flex items-center space-x-1.5 text-xs text-slate-300 bg-[#11131e] px-3 py-1.5 rounded-xl border border-white/10">
            <span>Rank K:</span>
            <select
              value={kValue}
              onChange={(e) => setKValue(parseInt(e.target.value, 10))}
              className="bg-transparent font-bold text-purple-300 focus:outline-none"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
            </select>
          </div>

          <button
            onClick={handleRunEvaluation}
            disabled={evaluating}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white shadow-lg shadow-purple-600/30 flex items-center space-x-2 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${evaluating ? 'animate-spin' : ''}`} />
            <span>{evaluating ? 'Running Job...' : 'Run Evaluation Job'}</span>
          </button>
        </div>
      </div>

      {/* Model Spec Overview Card */}
      <div className="p-6 rounded-3xl bg-[#11131e]/90 border border-white/10 space-y-4">
        <h2 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center space-x-2">
          <Layers className="w-4 h-4 text-purple-400" />
          <span>Active Pipeline Metadata</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="text-slate-400 text-[11px]">Model Type:</span>
            <div className="font-bold text-white mt-0.5 truncate">{metrics?.model_type || 'Hybrid Content+Demographic'}</div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="text-slate-400 text-[11px]">Pipeline Version:</span>
            <div className="font-bold text-cyan-300 mt-0.5 font-mono">v{metrics?.version || '2.1.0'}</div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="text-slate-400 text-[11px]">Active Songs:</span>
            <div className="font-bold text-white mt-0.5">{metrics?.dataset_size || 0} tracks</div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="text-slate-400 text-[11px]">Total Interactions:</span>
            <div className="font-bold text-white mt-0.5">{metrics?.total_interactions || 0} events</div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="text-slate-400 text-[11px]">Test Sample Size:</span>
            <div className="font-bold text-white mt-0.5">{metrics?.evaluation_sample_size || 0} subjects</div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="text-slate-400 text-[11px]">Last Evaluated:</span>
            <div className="font-medium text-slate-300 mt-0.5 text-[10px] truncate">{metrics?.last_evaluated_at || 'Just now'}</div>
          </div>
        </div>
      </div>

      {/* ML Evaluation Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Precision@K */}
        <div className="p-5 rounded-3xl bg-[#11131e]/90 border border-white/5 space-y-2">
          <div className="text-xs text-slate-400 font-semibold">Precision@{kValue}</div>
          <div className="text-3xl font-black text-purple-300 tracking-tight">
            {metrics ? `${Math.round(metrics.precision_at_k * 100)}%` : '--'}
          </div>
          <div className="text-[10px] text-slate-500">Relevant items in top-{kValue}</div>
        </div>

        {/* Recall@K */}
        <div className="p-5 rounded-3xl bg-[#11131e]/90 border border-white/5 space-y-2">
          <div className="text-xs text-slate-400 font-semibold">Recall@{kValue}</div>
          <div className="text-3xl font-black text-cyan-300 tracking-tight">
            {metrics ? `${Math.round(metrics.recall_at_k * 100)}%` : '--'}
          </div>
          <div className="text-[10px] text-slate-500">Liked items retrieved</div>
        </div>

        {/* NDCG@K */}
        <div className="p-5 rounded-3xl bg-[#11131e]/90 border border-white/5 space-y-2">
          <div className="text-xs text-slate-400 font-semibold">NDCG@{kValue}</div>
          <div className="text-3xl font-black text-emerald-300 tracking-tight">
            {metrics ? metrics.ndcg_at_k.toFixed(3) : '--'}
          </div>
          <div className="text-[10px] text-slate-500">Rank position discount</div>
        </div>

        {/* Catalog Coverage */}
        <div className="p-5 rounded-3xl bg-[#11131e]/90 border border-white/5 space-y-2">
          <div className="text-xs text-slate-400 font-semibold">Catalog Coverage</div>
          <div className="text-3xl font-black text-amber-300 tracking-tight">
            {metrics ? `${metrics.catalog_coverage_pct}%` : '--'}
          </div>
          <div className="text-[10px] text-slate-500">Unique songs surfaced</div>
        </div>

        {/* Mean Reciprocal Rank */}
        <div className="p-5 rounded-3xl bg-[#11131e]/90 border border-white/5 space-y-2">
          <div className="text-xs text-slate-400 font-semibold">MRR (Mean RR)</div>
          <div className="text-3xl font-black text-pink-300 tracking-tight">
            {metrics ? metrics.mean_reciprocal_rank.toFixed(3) : '--'}
          </div>
          <div className="text-[10px] text-slate-500">1st hit position inverse</div>
        </div>

        {/* Average Feedback Rating */}
        <div className="p-5 rounded-3xl bg-[#11131e]/90 border border-white/5 space-y-2">
          <div className="text-xs text-slate-400 font-semibold">Average Rating</div>
          <div className="text-3xl font-black text-yellow-400 tracking-tight flex items-center space-x-1">
            <span>{metrics ? metrics.average_user_rating : '--'}</span>
            <Star className="w-5 h-5 fill-yellow-400 inline" />
          </div>
          <div className="text-[10px] text-slate-500">From listener feedback</div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genre Catalog Distribution */}
        <div className="p-6 rounded-3xl bg-[#11131e]/90 border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <BarChart2 className="w-4 h-4 text-purple-400" />
            <span>Catalog Distribution by Musical Genre</span>
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={genreChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} angle={-30} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#181b2a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demographic Age Group Breakdown */}
        <div className="p-6 rounded-3xl bg-[#11131e]/90 border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <PieChart className="w-4 h-4 text-cyan-400" />
            <span>Listener Distribution by Age Group</span>
          </h3>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={ageChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {ageChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#181b2a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
