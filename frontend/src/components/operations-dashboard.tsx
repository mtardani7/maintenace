'use client';

import { Activity, AlertTriangle, Clock3, RefreshCw, Wrench } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { useEffect, useMemo, useState } from 'react';
import { getMachinePage, getPlantOptions, getQaDashboard, type QaDashboard } from '@/lib/maintenance-api';
import type { Machine, MachinePage } from '@/lib/maintenance-types';
import { ErrorState, LoadingState } from './ui';

type DashboardFilters = { period: 'daily' | 'weekly' | 'monthly'; date: string; plant: string; line: string; machine: string; maintenanceType: string; status: string };
type ChartPoint = { label: string; value: number };

const statuses: Array<DashboardFilters['status']> = ['', 'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'VERIFIED', 'CLOSED'];
const formatNumber = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const today = () => new Date().toISOString().slice(0, 10);

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="maintenance-chart-card"><div className="maintenance-chart-heading"><h3>{title}</h3></div>{children}</section>;
}

function EmptyChart({ message = 'Tidak ada data pemeliharaan untuk filter yang dipilih.' }: { message?: string }) {
  return <div className="maintenance-chart-empty">{message}</div>;
}

function BarChart({ rows, color = 'red' }: { rows: ChartPoint[]; color?: 'red' | 'slate' }) {
  if (!rows.length) return <EmptyChart />;
  const option: EChartsOption = { tooltip: { trigger: 'axis', valueFormatter: (value) => formatNumber.format(Number(value)) }, grid: { left: 128, right: 28, top: 18, bottom: 34, containLabel: true }, xAxis: { type: 'value', min: 0, ...chartAxis, axisLabel: { color: '#64748b' } }, yAxis: { type: 'category', data: [...rows].reverse().map((row) => row.label), axisLabel: { color: '#64748b', width: 112, overflow: 'truncate' } }, series: [{ type: 'bar', data: [...rows].reverse().map((row) => row.value), barMaxWidth: 28, itemStyle: { color: color === 'red' ? '#ef4444' : '#64748b' }, label: { show: true, position: 'right', color: '#475569', fontSize: 11 } }] };
  return <ReactECharts option={option} style={{ height: 320, width: '100%' }} opts={{ renderer: 'canvas' }} />;
}

function LineChart({ rows, color = 'red' }: { rows: ChartPoint[]; color?: 'red' | 'slate' }) {
  if (!rows.length) return <EmptyChart />;
  const option: EChartsOption = { tooltip: { trigger: 'axis', valueFormatter: (value) => formatNumber.format(Number(value)) }, grid: { left: 52, right: 20, top: 24, bottom: 40, containLabel: true }, xAxis: { type: 'category', data: rows.map((row) => row.label), ...chartAxis, axisLabel: { color: '#64748b', hideOverlap: true } }, yAxis: { type: 'value', min: 0, ...chartAxis, axisLabel: { color: '#64748b' } }, series: [{ type: 'line', smooth: true, data: rows.map((row) => row.value), areaStyle: { opacity: 0.12 }, itemStyle: { color: color === 'red' ? '#ef4444' : '#64748b' } }] };
  return <ReactECharts option={option} style={{ height: 320, width: '100%' }} opts={{ renderer: 'canvas' }} />;
}

function DistributionChart({ rows }: { rows: ChartPoint[] }) {
  if (!rows.length) return <EmptyChart />;
  const option: EChartsOption = { tooltip: { trigger: 'item', valueFormatter: (value) => formatNumber.format(Number(value)) }, legend: { bottom: 4, left: 'center', type: 'scroll', textStyle: { color: '#64748b' } }, series: [{ type: 'pie', radius: ['38%', '68%'], center: ['50%', '45%'], data: rows.map((row) => ({ name: row.label, value: row.value })), itemStyle: { borderColor: '#fff', borderWidth: 2 }, label: { color: '#475569', fontSize: 11 } }] };
  return <ReactECharts option={option} style={{ height: 320, width: '100%' }} opts={{ renderer: 'canvas' }} />;
}

const chartAxis = { axisLine: { lineStyle: { color: '#cbd5e1' } }, splitLine: { lineStyle: { color: '#e2e8f0' } } };

export function OperationsDashboard() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [machineTotal, setMachineTotal] = useState(0);
  const [qaDashboard, setQaDashboard] = useState<QaDashboard | null>(null);
  const [plants, setPlants] = useState<{ id: number; code: string; name: string }[]>([]);
  const [filters, setFilters] = useState<DashboardFilters>({ period: 'monthly', date: today(), plant: '', line: '', machine: '', maintenanceType: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadDashboard() {
    setLoading(true);
    setError('');
    const results = await Promise.allSettled([getMachinePage({ page: 1, per_page: 100 }), getPlantOptions(), getQaDashboard({ date: filters.date, period: filters.period, plant_id: filters.plant || undefined, line_id: filters.line || undefined, machine_id: filters.machine || undefined })]);
    const [machineResult, plantResult, qaResult] = results;
    if (machineResult.status === 'fulfilled') { const page = machineResult.value as MachinePage; setMachines(page.data); setMachineTotal(page.total); }
    if (plantResult.status === 'fulfilled') setPlants(plantResult.value);
    if (qaResult.status === 'fulfilled') setQaDashboard({ ...qaResult.value, summary: qaResult.value.summary ?? { production_pcs: 0, defect_qty: 0, defect_rate: 0, yield: 0 } });
    if (results.every((result) => result.status === 'rejected')) setError('Tidak dapat memuat data dasbor pemeliharaan.');
    setLoading(false);
  }

  useEffect(() => {
    let active = true;
    loadDashboard().catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : 'Unable to load maintenance dashboard data.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filteredMachines = useMemo(() => machines.filter((machine) => (!filters.plant || machine.plant === filters.plant) && (!filters.line || machine.line === filters.line) && (!filters.machine || String(machine.id) === filters.machine)), [filters, machines]);
  const lineOptions = Array.from(new Map(machines.filter((machine) => !filters.plant || String(machine.plant_id) === filters.plant).filter((machine) => machine.line_id).map((machine) => [String(machine.line_id), machine.line])).entries());
  const machineOptions = machines.filter((machine) => !filters.plant || String(machine.plant_id) === filters.plant).filter((machine) => !filters.line || String(machine.line_id) === filters.line);
  const summary = qaDashboard?.summary ?? { production_pcs: 0, defect_qty: 0, defect_rate: 0, yield: 0 };
  const defectCategories = Array.isArray(qaDashboard?.defect_categories) ? qaDashboard.defect_categories : [];
  const productionTrend = Array.isArray(qaDashboard?.production_trend) ? qaDashboard.production_trend : [];
  const defectTrend = Array.isArray(qaDashboard?.defect_trend) ? qaDashboard.defect_trend : [];
  const pareto = Array.isArray(qaDashboard?.pareto) ? qaDashboard.pareto : [];
  const topMachines = Array.isArray(qaDashboard?.top_machines) ? qaDashboard.top_machines : [];
  const topDefects = Array.isArray(qaDashboard?.top_defects) ? qaDashboard.top_defects : [];
  const typeOptions = defectCategories.map((row) => row.name);
  const trendRows = productionTrend.map((row) => ({ label: row.date, value: row.production_pcs }));
  const statusRows = defectTrend.map((row) => ({ label: row.date, value: row.defect_qty }));
  const breakdownRows = pareto.map((row) => ({ label: row.name, value: row.quantity }));
  const typeRows = defectCategories.map((row) => ({ label: row.name, value: row.value }));
  const machineRows = topMachines.map((row) => ({ label: row.name, value: row.output_pcs ?? row.value }));
  const issueRows = topDefects.map((row) => ({ label: row.name, value: row.quantity }));
  const production = summary.production_pcs;
  const defects = summary.defect_qty;

  if (loading) return <div className="operations-dashboard"><LoadingState label="Memuat dasbor pemeliharaan" /></div>;
  if (error) return <div className="operations-dashboard"><ErrorState title="Maintenance dashboard unavailable" description={error} /></div>;

  return <div className="operations-dashboard maintenance-dashboard"><section className="maintenance-dashboard-header"><div><div className="maintenance-dashboard-label"><Activity aria-hidden="true" /> MAINTENANCE SYSTEM</div><h1>Maintenance Overview</h1><p>QA production and defect performance for maintenance decisions.</p></div><button className="maintenance-refresh" type="button" onClick={loadDashboard} disabled={loading}><RefreshCw aria-hidden="true" /> Refresh</button></section><section className="maintenance-filters"><div className="maintenance-filter-heading"><div><strong>Dashboard filters</strong><span>Use the same QA data scope.</span></div><button type="button" onClick={() => setFilters({ period: 'monthly', date: today(), plant: '', line: '', machine: '', maintenanceType: '', status: '' })}>Reset</button></div><label>Period<select value={filters.period} onChange={(event) => setFilters({ ...filters, period: event.target.value as DashboardFilters['period'] })}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></label><label>Date<input type="date" value={filters.date} onChange={(event) => setFilters({ ...filters, date: event.target.value })} /></label><label>Plant<select value={filters.plant} onChange={(event) => setFilters({ ...filters, plant: event.target.value, line: '', machine: '' })}><option value="">All plants</option>{plants.map((plant) => <option key={plant.id} value={String(plant.id)}>{plant.code} — {plant.name}</option>)}</select></label><label>Line<select value={filters.line} onChange={(event) => setFilters({ ...filters, line: event.target.value, machine: '' })}><option value="">All lines</option>{lineOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label><label>Machine<select value={filters.machine} onChange={(event) => setFilters({ ...filters, machine: event.target.value })}><option value="">All machines</option>{machineOptions.map((machine) => <option key={machine.id} value={machine.id}>{machine.code} — {machine.name}</option>)}</select></label><label>Maintenance Type<select value={filters.maintenanceType} onChange={(event) => setFilters({ ...filters, maintenanceType: event.target.value })}><option value="">All types</option>{typeOptions.map((type) => <option key={type} value={type}>{type}</option>)}</select></label><label>Status<select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value as DashboardFilters['status'] })}>{statuses.map((status) => <option key={status} value={status}>{status ? status.replace('_', ' ') : 'All statuses'}</option>)}</select></label></section><section><div className="maintenance-section-title"><h2>{filters.period.charAt(0).toUpperCase() + filters.period.slice(1)} QA overview</h2><span>{filters.date}</span></div><div className="maintenance-kpis"><KpiCard label="Production" value={formatNumber.format(production)} icon={Wrench} /><KpiCard label="Defects" value={formatNumber.format(defects)} icon={AlertTriangle} /><KpiCard label="Defect Rate" value={`${qaDashboard?.summary.defect_rate ?? 0}%`} icon={Clock3} /><KpiCard label="Yield" value={`${qaDashboard?.summary.yield ?? 0}%`} icon={AlertTriangle} /></div></section><section><div className="maintenance-section-title"><h2>QA production and quality</h2></div><div className="maintenance-grid"><ChartCard title="Production Trend"><LineChart rows={trendRows} /></ChartCard><ChartCard title="Defect Trend"><LineChart rows={statusRows} color="slate" /></ChartCard><ChartCard title="Pareto Defect"><BarChart rows={breakdownRows} /></ChartCard><ChartCard title="Defect by Category"><DistributionChart rows={typeRows} /></ChartCard><ChartCard title="Production by Machine"><BarChart rows={machineRows} color="slate" /></ChartCard><ChartCard title="Top 10 Defects"><BarChart rows={issueRows} /></ChartCard></div></section></div>;
}

function KpiCard({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Wrench }) { return <article className="maintenance-kpi"><div><span>{label}</span><strong>{value}</strong></div><Icon aria-hidden="true" /></article>; }
