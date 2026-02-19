import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/auth/users/");
      setUsers(res.data);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = async (userId, username, isCurrentlyAdmin) => {
    const action = isCurrentlyAdmin ? "demote" : "promote";
    if (
      !confirm(
        `Are you sure you want to ${action} "${username}" ${isCurrentlyAdmin ? "from" : "to"} admin?`,
      )
    ) {
      return;
    }

    setTogglingId(userId);
    setError("");
    setSuccessMsg("");

    try {
      const res = await api.post(`/auth/users/${userId}/toggle-admin/`);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, is_admin: res.data.is_admin } : u,
        ),
      );
      setSuccessMsg(res.data.message);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update user");
      setTimeout(() => setError(""), 3000);
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
          <span className="text-gray-500 font-medium">Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-teal-500">
            👥 Manage Users
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {users.length} registered user{users.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 px-4 py-3 bg-teal-50 border border-teal-200 text-teal-700 rounded-xl text-sm font-medium">
          ✓ {successMsg}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-800 to-teal-600 text-white">
              <tr>
                <th className="py-4 px-6 text-left text-sm font-semibold">
                  User
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold hidden sm:table-cell">
                  Email
                </th>
                <th className="py-4 px-6 text-center text-sm font-semibold">
                  Role
                </th>
                <th className="py-4 px-6 text-center text-sm font-semibold hidden sm:table-cell">
                  Joined
                </th>
                <th className="py-4 px-6 text-center text-sm font-semibold">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id;
                const isSuperuser = u.is_superuser;
                const isToggling = togglingId === u.id;

                return (
                  <tr
                    key={u.id}
                    className={`transition-colors ${
                      isSelf ? "bg-teal-50/50" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {u.username}
                            {isSelf && (
                              <span className="ml-2 text-xs px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full">
                                You
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-500 text-sm hidden sm:table-cell">
                      {u.email || "—"}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {isSuperuser ? (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                          Super Admin
                        </span>
                      ) : u.is_admin ? (
                        <span className="px-3 py-1 bg-teal-100 text-teal-700 text-xs font-bold rounded-full">
                          Admin
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
                          User
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center text-gray-500 text-sm hidden sm:table-cell">
                      {u.date_joined}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {isSelf || isSuperuser ? (
                        <span className="text-xs text-gray-400">—</span>
                      ) : (
                        <button
                          onClick={() =>
                            toggleAdmin(u.id, u.username, u.is_admin)
                          }
                          disabled={isToggling}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                            u.is_admin
                              ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                              : "bg-gradient-to-r from-gray-800 to-teal-500 text-white hover:from-gray-900 hover:to-teal-600 shadow-sm"
                          } disabled:opacity-50`}
                        >
                          {isToggling
                            ? "..."
                            : u.is_admin
                              ? "Demote"
                              : "Promote"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
