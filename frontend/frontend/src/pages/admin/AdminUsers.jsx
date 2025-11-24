import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import useAuth from '../../hooks/useAuth';
import Toast from '../../components/Toast';
import useToast from '../../hooks/useToast';

export default function AdminUsers() {
  const { token, user } = useAuth();
  const { toasts, showToast, removeToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '+232', role: 'MANAGER' });
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ phone: '', role: '' });

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Loading users...', { token, user });
      const res = await client.get('/users');
      console.log('Users loaded:', res.data);
      setUsers(res.data || []);
    } catch (e) {
      console.error('Failed to load users:', e);
      const errorMsg = e?.response?.data?.message || e?.message || 'Failed to load users';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.phone || !form.role) {
      showToast('Please fill all fields', 'error');
      return;
    }
    try {
      setLoading(true);
      await client.post('/users', form);
      showToast('User created', 'success');
      setForm({ name: '', email: '', password: '', phone: '+232', role: 'MANAGER' });
      await loadUsers();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to create user';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'MANAGER', label: 'Manager User' },
    { value: 'BILLING', label: 'Billing User' },
  ];

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const startEdit = (u) => {
    setEditingId(u.id);
    setEditForm({ phone: u.phone || '', role: u.role });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ phone: '', role: '' });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      setLoading(true);
      await client.put(`/users/${editingId}`, {
        phone: editForm.phone,
        role: editForm.role,
      });
      showToast('User updated', 'success');
      cancelEdit();
      await loadUsers();
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to update user';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      setLoading(true);
      await client.delete(`/users/${id}`);
      showToast('User deleted', 'success');
      await loadUsers();
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to delete user';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Early return if component is still initializing
  if (!user && !error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="p-4 rounded-md bg-blue-50 border border-blue-200 text-blue-800">
          Loading user information...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {toasts.map(t => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
      ))}

      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Add System Users</h1>
        <p className="text-sm text-gray-600">Only Super Admin can add new users.</p>
      </div>

      {!isSuperAdmin && (
        <div className="p-4 mb-6 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800">
          You do not have permission to add users. Contact a Super Admin.
        </div>
      )}

      {error && (
        <div className="p-4 mb-6 rounded-md bg-red-50 border border-red-200 text-red-800">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!user && (
        <div className="p-4 mb-6 rounded-md bg-blue-50 border border-blue-200 text-blue-800">
          Loading user information...
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Create User</h2>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="name">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={onChange}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
                  disabled={!isSuperAdmin || loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="name@example.com"
                  disabled={!isSuperAdmin || loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={onChange}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                  disabled={!isSuperAdmin || loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="phone">Phone No</label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  value={form.phone}
                  onChange={onChange}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+232--------"
                  disabled={!isSuperAdmin || loading}
                />
                <p className="text-xs text-gray-500 mt-1">Sierra Leone format: +232--------</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="role">User Role</label>
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={onChange}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isSuperAdmin || loading}
                >
                  {roles.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md disabled:opacity-60"
                disabled={!isSuperAdmin || loading}
              >
                {loading ? 'Saving...' : 'Create User'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Users</h2>
              <button
                onClick={loadUsers}
                disabled={loading}
                className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-60"
              >
                Refresh
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">Email</th>
                    <th className="py-2 px-3">Phone No</th>
                    <th className="py-2 px-3">Role</th>
                    {isSuperAdmin && <th className="py-2 px-3 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={isSuperAdmin ? 5 : 4} className="py-6 text-center text-gray-500">{loading ? 'Loading...' : 'No users yet'}</td>
                    </tr>
                  )}
                  {users.map(u => (
                    <tr key={u.id} className="border-t">
                      <td className="py-2 px-3">{u.name}</td>
                      <td className="py-2 px-3">{u.email}</td>
                      <td className="py-2 px-3">
                        {isSuperAdmin && editingId === u.id ? (
                          <input
                            type="text"
                            className="border rounded px-2 py-1 text-sm w-full"
                            value={editForm.phone}
                            onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                          />
                        ) : (
                          u.phone
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {isSuperAdmin && editingId === u.id ? (
                          <select
                            className="border rounded px-2 py-1 text-sm"
                            value={editForm.role}
                            onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                          >
                            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                            <option value="MANAGER">MANAGER</option>
                            <option value="BILLING">BILLING</option>
                            <option value="OPERATOR">OPERATOR</option>
                          </select>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            {u.role}
                          </span>
                        )}
                      </td>
                      {isSuperAdmin && (
                        <td className="py-2 px-3 text-right space-x-2">
                          {editingId === u.id ? (
                            <>
                              <button
                                type="button"
                                onClick={saveEdit}
                                className="px-3 py-1 text-xs rounded bg-green-600 text-white"
                                disabled={loading}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="px-3 py-1 text-xs rounded border"
                                disabled={loading}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => startEdit(u)}
                                className="px-3 py-1 text-xs rounded border"
                                disabled={loading}
                              >
                                Edit
                              </button>
                              {u.id !== user?.id && (
                                <button
                                  type="button"
                                  onClick={() => deleteUser(u.id)}
                                  className="px-3 py-1 text-xs rounded bg-red-600 text-white"
                                  disabled={loading}
                                >
                                  Delete
                                </button>
                              )}
                            </>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
