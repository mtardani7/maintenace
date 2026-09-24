'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getPlantOptions, type PlantOption } from '@/lib/maintenance-api';
import { apiMessage, getTickets } from '@/lib/ticket-api';
import { ticketPriorities, ticketStatuses, type Ticket, type TicketFilters, type TicketPriority, type TicketStatus } from '@/lib/ticket-types';
import { EmptyState, ErrorState, LoadingState } from './ui';

function label(value: string) {
  return value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filters, setFilters] = useState<TicketFilters>({ sort: 'newest', page: 1 });
  const [search, setSearch] = useState('');
  const [plants, setPlants] = useState<PlantOption[]>([]);
  const [pageInfo, setPageInfo] = useState({ current: 1, last: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getPlantOptions().then(setPlants).catch(() => setPlants([]));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getTickets(filters).then((page) => {
      if (!active) return;
      setTickets(page.data);
      setPageInfo({ current: page.currentPage, last: page.lastPage, total: page.total });
      setError('');
    }).catch((reason) => {
      if (active) setError(apiMessage(reason));
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [filters]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters((current) => ({ ...current, search: search.trim() || undefined, page: 1 }));
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  function update(key: keyof TicketFilters, value: string) {
    setFilters((current) => ({ ...current, [key]: value, page: 1 }));
  }

  function resetFilters() {
    setSearch('');
    setFilters({ sort: 'newest', page: 1 });
  }

  const firstItem = pageInfo.total === 0 ? 0 : (pageInfo.current - 1) * 10 + 1;
  const lastItem = pageInfo.total === 0 ? 0 : Math.min(pageInfo.current * 10, pageInfo.total);
  const pageNumbers = Array.from({ length: pageInfo.last }, (_, index) => index + 1)
    .filter((page) => page === 1 || page === pageInfo.last || Math.abs(page - pageInfo.current) <= 1);

  return <div className="ticket-browser">
    <div className="ticket-filters">
      <label className="filter-search">Cari tiket<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nomor, mesin, masalah" /></label>
      <label>Status<select value={filters.status ?? ''} onChange={(event) => update('status', event.target.value as TicketStatus | '')}><option value="">Semua status</option>{ticketStatuses.map((status) => <option key={status} value={status}>{label(status)}</option>)}</select></label>
      <label>Prioritas<select value={filters.priority ?? ''} onChange={(event) => update('priority', event.target.value as TicketPriority | '')}><option value="">Semua prioritas</option>{ticketPriorities.map((priority) => <option key={priority} value={priority}>{label(priority)}</option>)}</select></label>
      <label>Plant<select value={filters.plant ?? ''} onChange={(event) => update('plant', event.target.value)}><option value="">Semua plant</option>{plants.map((plant) => <option key={plant.id} value={plant.id}>{plant.code} - {plant.name}</option>)}</select></label>
      <label>Urutan<select value={filters.sort ?? 'newest'} onChange={(event) => update('sort', event.target.value)}><option value="newest">Terbaru</option><option value="oldest">Terlama</option></select></label>
      <button className="secondary-action ticket-filter-reset" type="button" onClick={resetFilters}>Reset</button>
    </div>
    {loading ? <LoadingState label="Memuat tiket" /> : error ? <ErrorState title="Daftar tiket tidak tersedia" description={error} /> : tickets.length === 0 ? <EmptyState title="Tiket tidak ditemukan" description="Tidak ada tiket yang sesuai filter saat ini." /> : <>
      <div className="ticket-table" role="table">
        <div className="ticket-table__head" role="row"><span>Ticket Number</span><span>Plant / Machine</span><span>Problem</span><span>Priority</span><span>Reporter</span><span>Status</span></div>
        {tickets.map((ticket) => <Link href={`/tickets/${encodeURIComponent(String(ticket.id))}`} className="ticket-row" key={ticket.id} role="row">
          <span className="ticket-row__identity"><strong>{ticket.number}</strong><small>{ticket.createdAt}</small></span>
          <span><strong>{ticket.plant}</strong><small>{ticket.machine.code} / {ticket.machine.name}</small></span>
          <span className="ticket-row__description" title={ticket.description}>{ticket.problemType}<small>{ticket.description}</small></span>
          <span><strong>{label(ticket.priority)}</strong></span>
          <span>{ticket.reporter?.name ?? 'Provided by Laravel'}</span>
          <span><b className={`ticket-status ticket-status--${ticket.status.toLowerCase()}`}>{label(ticket.status)}</b></span>
        </Link>)}
      </div>
      <div className="pagination"><span>Menampilkan {firstItem}–{lastItem} dari {pageInfo.total} ticket</span><div className="pagination__pages"><button className="secondary-action" disabled={pageInfo.current <= 1} onClick={() => setFilters((current) => ({ ...current, page: pageInfo.current - 1 }))}>Previous</button>{pageNumbers.map((page, index) => <span key={page}>{index > 0 && page - pageNumbers[index - 1] > 1 ? <b>...</b> : null}<button className={`secondary-action ${page === pageInfo.current ? 'pagination__current' : ''}`} type="button" onClick={() => setFilters((current) => ({ ...current, page }))}>{page}</button></span>)}<button className="secondary-action" disabled={pageInfo.current >= pageInfo.last} onClick={() => setFilters((current) => ({ ...current, page: pageInfo.current + 1 }))}>Next</button></div></div>
    </>}
  </div>;
}