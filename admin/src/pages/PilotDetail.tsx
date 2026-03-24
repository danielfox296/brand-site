import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
// pilotStore available if needed for cross-page cache invalidation
import { supabase } from '../lib/supabase';
import type { Pilot, Contact } from '../types/pilot';
import type { ICP } from '../types/icp';
import type { Track } from '../types/music';

type Tab = 'overview' | 'contacts' | 'icps' | 'tracks';

const STATUS_OPTIONS: Pilot['status'][] = ['prospect', 'onboarding', 'active', 'completed', 'churned'];

const STATUS_COLORS: Record<Pilot['status'], string> = {
  prospect: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  onboarding: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  completed: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  churned: 'bg-red-500/15 text-red-400 border-red-500/30',
};

interface ContactFormData {
  name: string;
  role: string;
  email: string;
  phone: string;
  is_primary: boolean;
}

const emptyContact: ContactFormData = { name: '', role: '', email: '', phone: '', is_primary: false };

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '--';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTimestamp(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

function StarRating({ rating }: { rating: number | null }) {
  const stars = rating ?? 0;
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i <= stars ? 'text-[#d7af74]' : 'text-[#2a2a2a]'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

export default function PilotDetail() {
  const { id } = useParams<{ id: string }>();
  // Pilot state
  const [pilot, setPilot] = useState<Pilot | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Contacts state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [addingContact, setAddingContact] = useState(false);
  const [newContact, setNewContact] = useState<ContactFormData>(emptyContact);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [editContactData, setEditContactData] = useState<ContactFormData>(emptyContact);
  const [deletingContactId, setDeletingContactId] = useState<string | null>(null);

  // ICPs & Tracks state
  const [icps, setIcps] = useState<ICP[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [icpsLoading, setIcpsLoading] = useState(false);
  const [tracksLoading, setTracksLoading] = useState(false);
  const [playlistCount, setPlaylistCount] = useState(0);

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Fetch pilot
  const fetchPilot = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const { data, error } = await supabase.from('pilots').select('*').eq('id', id).single();
    if (!error && data) {
      setPilot(data as Pilot);
      setNameValue(data.name);
    }
    setLoading(false);
  }, [id]);

  // Fetch contacts
  const fetchContacts = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase
      .from('contacts')
      .select('*')
      .eq('pilot_id', id)
      .order('is_primary', { ascending: false })
      .order('name');
    setContacts((data as Contact[]) || []);
  }, [id]);

  // Fetch ICPs
  const fetchIcps = useCallback(async () => {
    if (!id) return;
    setIcpsLoading(true);
    const { data } = await supabase.from('icps').select('*').eq('pilot_id', id).order('created_at');
    setIcps((data as ICP[]) || []);
    setIcpsLoading(false);
  }, [id]);

  // Fetch Tracks
  const fetchTracks = useCallback(async () => {
    if (!id) return;
    setTracksLoading(true);
    const { data } = await supabase.from('tracks').select('*').eq('pilot_id', id).order('created_at', { ascending: false });
    setTracks((data as Track[]) || []);
    setTracksLoading(false);
  }, [id]);

  // Fetch playlist count
  const fetchPlaylistCount = useCallback(async () => {
    if (!id) return;
    const { count } = await supabase.from('playlists').select('*', { count: 'exact', head: true }).eq('pilot_id', id);
    setPlaylistCount(count ?? 0);
  }, [id]);

  useEffect(() => {
    fetchPilot();
    fetchContacts();
    fetchIcps();
    fetchTracks();
    fetchPlaylistCount();
  }, [fetchPilot, fetchContacts, fetchIcps, fetchTracks, fetchPlaylistCount]);

  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [editingName]);

  // Update pilot field
  const updatePilot = async (updates: Partial<Pilot>) => {
    if (!id) return;
    const { error } = await supabase.from('pilots').update(updates).eq('id', id);
    if (!error) {
      setPilot((prev) => (prev ? { ...prev, ...updates, updated_at: new Date().toISOString() } : prev));
    }
  };

  // Name editing
  const saveName = async () => {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== pilot?.name) {
      await updatePilot({ name: trimmed });
    } else {
      setNameValue(pilot?.name || '');
    }
    setEditingName(false);
  };

  // Contact CRUD
  const createContact = async () => {
    if (!id || !newContact.name.trim()) return;
    const { error } = await supabase.from('contacts').insert([{ ...newContact, pilot_id: id }]);
    if (!error) {
      setAddingContact(false);
      setNewContact(emptyContact);
      fetchContacts();
    }
  };

  const saveContactEdit = async () => {
    if (!editingContactId || !editContactData.name.trim()) return;
    const { error } = await supabase.from('contacts').update(editContactData).eq('id', editingContactId);
    if (!error) {
      setEditingContactId(null);
      fetchContacts();
    }
  };

  const deleteContact = async (contactId: string) => {
    const { error } = await supabase.from('contacts').delete().eq('id', contactId);
    if (!error) {
      setDeletingContactId(null);
      fetchContacts();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#d7af74] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!pilot) {
    return (
      <div className="text-center py-20">
        <p className="text-[#a0a0a0]">Pilot not found.</p>
        <Link to="/pilots" className="text-[#d7af74] hover:underline text-sm mt-2 inline-block">Back to Pilots</Link>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'contacts', label: `Contacts (${contacts.length})` },
    { key: 'icps', label: `ICPs (${icps.length})` },
    { key: 'tracks', label: `Tracks (${tracks.length})` },
  ];

  return (
    <div>
      {/* Back link */}
      <Link
        to="/pilots"
        className="text-sm text-[#a0a0a0] hover:text-white transition-colors inline-flex items-center gap-1.5 mb-6"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Pilots
      </Link>

      {/* Header */}
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
          {/* Name + Status */}
          <div className="flex items-center gap-3 min-w-0">
            {editingName ? (
              <input
                ref={nameInputRef}
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onBlur={saveName}
                onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') { setNameValue(pilot.name); setEditingName(false); } }}
                className="text-xl font-semibold text-white bg-[#0a0a0a] border border-[#2a2a2a] rounded px-2 py-0.5 outline-none focus:border-[#d7af74] min-w-0"
              />
            ) : (
              <h1
                onClick={() => setEditingName(true)}
                className="text-xl font-semibold text-white cursor-pointer hover:text-[#d7af74] transition-colors truncate"
                title="Click to edit"
              >
                {pilot.name}
              </h1>
            )}
            <select
              value={pilot.status}
              onChange={(e) => updatePilot({ status: e.target.value as Pilot['status'] })}
              className={`text-xs font-medium px-2.5 py-1 rounded border cursor-pointer outline-none ${STATUS_COLORS[pilot.status]} bg-transparent`}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} className="bg-[#141414] text-white">
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-4 text-sm shrink-0">
            <label className="flex items-center gap-2 text-[#a0a0a0]">
              Start
              <input
                type="date"
                value={pilot.start_date || ''}
                onChange={(e) => updatePilot({ start_date: e.target.value || null })}
                className="bg-[#0a0a0a] border border-[#2a2a2a] rounded px-2 py-1 text-white text-sm outline-none focus:border-[#d7af74] [color-scheme:dark]"
              />
            </label>
            <label className="flex items-center gap-2 text-[#a0a0a0]">
              End
              <input
                type="date"
                value={pilot.end_date || ''}
                onChange={(e) => updatePilot({ end_date: e.target.value || null })}
                className="bg-[#0a0a0a] border border-[#2a2a2a] rounded px-2 py-1 text-white text-sm outline-none focus:border-[#d7af74] [color-scheme:dark]"
              />
            </label>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Contacts', value: contacts.length },
            { label: 'ICPs', value: icps.length },
            { label: 'Tracks', value: tracks.length },
            { label: 'Playlists', value: playlistCount },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-center">
              <div className="text-2xl font-semibold text-white">{stat.value}</div>
              <div className="text-xs text-[#a0a0a0] mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#2a2a2a] mb-6">
        <nav className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab.key
                  ? 'border-[#d7af74] text-white'
                  : 'border-transparent text-[#a0a0a0] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && <OverviewTab pilot={pilot} updatePilot={updatePilot} />}
      {activeTab === 'contacts' && (
        <ContactsTab
          contacts={contacts}
          addingContact={addingContact}
          setAddingContact={setAddingContact}
          newContact={newContact}
          setNewContact={setNewContact}
          createContact={createContact}
          editingContactId={editingContactId}
          setEditingContactId={setEditingContactId}
          editContactData={editContactData}
          setEditContactData={setEditContactData}
          saveContactEdit={saveContactEdit}
          deletingContactId={deletingContactId}
          setDeletingContactId={setDeletingContactId}
          deleteContact={deleteContact}
        />
      )}
      {activeTab === 'icps' && <ICPsTab icps={icps} loading={icpsLoading} pilotId={id!} onDelete={fetchIcps} />}
      {activeTab === 'tracks' && <TracksTab tracks={tracks} loading={tracksLoading} />}
    </div>
  );
}

// ──────────────────────────────────────────────
// Overview Tab
// ──────────────────────────────────────────────
function OverviewTab({ pilot, updatePilot }: { pilot: Pilot; updatePilot: (u: Partial<Pilot>) => Promise<void> }) {
  const [notes, setNotes] = useState(pilot.notes || '');

  return (
    <div className="space-y-6">
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-5">
        <label className="block text-sm font-medium text-[#a0a0a0] mb-2">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => { if (notes !== (pilot.notes || '')) updatePilot({ notes: notes || null }); }}
          rows={6}
          placeholder="Internal notes about this pilot..."
          className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white text-sm placeholder-[#555] outline-none focus:border-[#d7af74] resize-y"
        />
      </div>

      <div className="flex gap-6 text-xs text-[#666]">
        <span>Created {formatTimestamp(pilot.created_at)}</span>
        <span>Updated {formatTimestamp(pilot.updated_at)}</span>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Contacts Tab
// ──────────────────────────────────────────────
interface ContactsTabProps {
  contacts: Contact[];
  addingContact: boolean;
  setAddingContact: (v: boolean) => void;
  newContact: ContactFormData;
  setNewContact: (v: ContactFormData) => void;
  createContact: () => void;
  editingContactId: string | null;
  setEditingContactId: (v: string | null) => void;
  editContactData: ContactFormData;
  setEditContactData: (v: ContactFormData) => void;
  saveContactEdit: () => void;
  deletingContactId: string | null;
  setDeletingContactId: (v: string | null) => void;
  deleteContact: (id: string) => void;
}

function ContactsTab(props: ContactsTabProps) {
  const {
    contacts, addingContact, setAddingContact, newContact, setNewContact,
    createContact, editingContactId, setEditingContactId, editContactData,
    setEditContactData, saveContactEdit, deletingContactId, setDeletingContactId, deleteContact,
  } = props;

  const inputClass = 'bg-[#0a0a0a] border border-[#2a2a2a] rounded px-2 py-1.5 text-white text-sm outline-none focus:border-[#d7af74] w-full';

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[#a0a0a0]">{contacts.length} contact{contacts.length !== 1 ? 's' : ''}</h3>
        <button
          onClick={() => setAddingContact(true)}
          disabled={addingContact}
          className="text-xs font-medium px-3 py-1.5 rounded bg-[#d7af74] text-black hover:bg-[#c9a060] transition-colors disabled:opacity-50"
        >
          + Add Contact
        </button>
      </div>

      <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a2a2a] text-[#a0a0a0] text-xs">
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Role</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Phone</th>
              <th className="text-center px-4 py-3 font-medium">Primary</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Add row */}
            {addingContact && (
              <tr className="border-b border-[#2a2a2a] bg-[#1a1a1a]">
                <td className="px-4 py-2">
                  <input value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} placeholder="Name" className={inputClass} autoFocus />
                </td>
                <td className="px-4 py-2">
                  <input value={newContact.role} onChange={(e) => setNewContact({ ...newContact, role: e.target.value })} placeholder="Role" className={inputClass} />
                </td>
                <td className="px-4 py-2">
                  <input value={newContact.email} onChange={(e) => setNewContact({ ...newContact, email: e.target.value })} placeholder="Email" type="email" className={inputClass} />
                </td>
                <td className="px-4 py-2">
                  <input value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} placeholder="Phone" className={inputClass} />
                </td>
                <td className="px-4 py-2 text-center">
                  <input type="checkbox" checked={newContact.is_primary} onChange={(e) => setNewContact({ ...newContact, is_primary: e.target.checked })} className="accent-[#d7af74]" />
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button onClick={createContact} className="text-xs px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-500">Save</button>
                    <button onClick={() => { setAddingContact(false); setNewContact(emptyContact); }} className="text-xs px-2 py-1 rounded bg-[#2a2a2a] text-[#a0a0a0] hover:text-white">Cancel</button>
                  </div>
                </td>
              </tr>
            )}

            {/* Contact rows */}
            {contacts.map((c) => {
              const isEditing = editingContactId === c.id;
              const isDeleting = deletingContactId === c.id;

              if (isEditing) {
                return (
                  <tr key={c.id} className="border-b border-[#2a2a2a] bg-[#1a1a1a]">
                    <td className="px-4 py-2"><input value={editContactData.name} onChange={(e) => setEditContactData({ ...editContactData, name: e.target.value })} className={inputClass} /></td>
                    <td className="px-4 py-2"><input value={editContactData.role} onChange={(e) => setEditContactData({ ...editContactData, role: e.target.value })} className={inputClass} /></td>
                    <td className="px-4 py-2"><input value={editContactData.email} onChange={(e) => setEditContactData({ ...editContactData, email: e.target.value })} type="email" className={inputClass} /></td>
                    <td className="px-4 py-2"><input value={editContactData.phone} onChange={(e) => setEditContactData({ ...editContactData, phone: e.target.value })} className={inputClass} /></td>
                    <td className="px-4 py-2 text-center"><input type="checkbox" checked={editContactData.is_primary} onChange={(e) => setEditContactData({ ...editContactData, is_primary: e.target.checked })} className="accent-[#d7af74]" /></td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={saveContactEdit} className="text-xs px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-500">Save</button>
                        <button onClick={() => setEditingContactId(null)} className="text-xs px-2 py-1 rounded bg-[#2a2a2a] text-[#a0a0a0] hover:text-white">Cancel</button>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={c.id} className="border-b border-[#2a2a2a] last:border-b-0 hover:bg-[#1a1a1a] transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-[#a0a0a0]">{c.role || '--'}</td>
                  <td className="px-4 py-3">
                    {c.email ? (
                      <a href={`mailto:${c.email}`} className="text-[#d7af74] hover:underline">{c.email}</a>
                    ) : (
                      <span className="text-[#555]">--</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#a0a0a0]">{c.phone || '--'}</td>
                  <td className="px-4 py-3 text-center">
                    {c.is_primary && (
                      <span className="inline-block w-2 h-2 rounded-full bg-[#d7af74]" title="Primary contact" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isDeleting ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-xs text-red-400 mr-1">Delete?</span>
                        <button onClick={() => deleteContact(c.id)} className="text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-500">Yes</button>
                        <button onClick={() => setDeletingContactId(null)} className="text-xs px-2 py-1 rounded bg-[#2a2a2a] text-[#a0a0a0] hover:text-white">No</button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingContactId(c.id);
                            setEditContactData({
                              name: c.name,
                              role: c.role || '',
                              email: c.email || '',
                              phone: c.phone || '',
                              is_primary: c.is_primary,
                            });
                          }}
                          className="p-1.5 rounded text-[#a0a0a0] hover:text-white hover:bg-[#2a2a2a] transition-colors"
                          title="Edit"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeletingContactId(c.id)}
                          className="p-1.5 rounded text-[#a0a0a0] hover:text-red-400 hover:bg-[#2a2a2a] transition-colors"
                          title="Delete"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}

            {/* Empty state */}
            {contacts.length === 0 && !addingContact && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-[#555] text-sm">
                  No contacts yet. Add the first one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// ICPs Tab
// ──────────────────────────────────────────────
function ICPsTab({ icps, loading, pilotId, onDelete }: { icps: ICP[]; loading: boolean; pilotId: string; onDelete: () => void }) {
  const handleDelete = async (e: React.MouseEvent, icpId: string, label: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete ICP "${label}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('icps').delete().eq('id', icpId);
    if (!error) onDelete();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-5 h-5 border-2 border-[#d7af74] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (icps.length === 0) {
    return (
      <div className="border-2 border-dashed border-[#2a2a2a] rounded-lg py-16 flex flex-col items-center gap-3">
        <svg className="w-8 h-8 text-[#2a2a2a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
        <p className="text-sm text-[#555]">No ICP profiles created yet.</p>
        <Link
          to={`/pilots/${pilotId}/icps/new`}
          className="mt-2 px-4 py-2 bg-[#d7af74] text-black text-sm font-medium rounded-lg hover:bg-[#c9a060] transition-colors"
        >
          + New ICP
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[#a0a0a0]">{icps.length} ICP profile{icps.length !== 1 ? 's' : ''}</h3>
        <Link
          to={`/pilots/${pilotId}/icps/new`}
          className="px-3 py-1.5 bg-[#d7af74] text-black text-sm font-medium rounded-lg hover:bg-[#c9a060] transition-colors"
        >
          + New ICP
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {icps.map((icp) => (
          <Link
            key={icp.id}
            to={`/pilots/${pilotId}/icps/${icp.id}`}
            className="relative bg-[#141414] border border-[#2a2a2a] rounded-lg p-5 hover:border-[#d7af74]/40 transition-colors block"
          >
            <button
              onClick={(e) => handleDelete(e, icp.id, icp.label)}
              className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded text-[#555] hover:text-red-400 hover:bg-red-400/10 transition-colors"
              title="Delete ICP"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h4 className="text-white font-medium mb-3 truncate pr-6">{icp.label}</h4>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-[#666]">Age Range</dt>
                <dd className="text-[#a0a0a0]">
                  {icp.age_range_low != null && icp.age_range_high != null
                    ? `${icp.age_range_low}--${icp.age_range_high}`
                    : '--'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#666]">Formation Era</dt>
                <dd className="text-[#a0a0a0]">{icp.formation_era || '--'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#666]">Cultural Capital</dt>
                <dd className="text-[#a0a0a0]">{icp.cultural_capital || '--'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#666]">Primary State</dt>
                <dd className="text-[#a0a0a0]">{icp.primary_state || '--'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#666]">Emotional Promise</dt>
                <dd className="text-[#a0a0a0] truncate max-w-[50%]">{icp.emotional_promise || '--'}</dd>
              </div>
            </dl>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Tracks Tab
// ──────────────────────────────────────────────
const TRACK_STATUS_COLORS: Record<Track['status'], string> = {
  review: 'bg-amber-500/15 text-amber-400',
  approved: 'bg-emerald-500/15 text-emerald-400',
  rejected: 'bg-red-500/15 text-red-400',
  archived: 'bg-zinc-500/15 text-zinc-400',
};

function TracksTab({ tracks, loading }: { tracks: Track[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-5 h-5 border-2 border-[#d7af74] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="border-2 border-dashed border-[#2a2a2a] rounded-lg py-16 flex flex-col items-center gap-2">
        <svg className="w-8 h-8 text-[#2a2a2a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
        </svg>
        <p className="text-sm text-[#555]">No tracks generated yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[#a0a0a0]">{tracks.length} track{tracks.length !== 1 ? 's' : ''}</h3>
      </div>

      <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a2a2a] text-[#a0a0a0] text-xs">
              <th className="text-left px-4 py-3 font-medium">Title</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Rating</th>
              <th className="text-right px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((t) => (
              <tr key={t.id} className="border-b border-[#2a2a2a] last:border-b-0 hover:bg-[#1a1a1a] transition-colors">
                <td className="px-4 py-3 text-white font-medium">{t.title}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${TRACK_STATUS_COLORS[t.status]}`}>
                    {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3"><StarRating rating={t.rating} /></td>
                <td className="px-4 py-3 text-right text-[#a0a0a0]">{formatDate(t.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
