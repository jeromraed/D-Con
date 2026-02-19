import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Scoreboard = () => {
  const [activeTab, setActiveTab] = useState("churches"); // 'churches' or 'members'
  const [churches, setChurches] = useState([]);
  const [members, setMembers] = useState([]);
  const [allChurches, setAllChurches] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [scoreForm, setScoreForm] = useState({
    member: "",
    points: "",
    reason: "",
  });
  const [memberForm, setMemberForm] = useState({ name: "", church: "" });
  const [submitting, setSubmitting] = useState(false);

  const { isAdmin } = useAuth();

  // Fetch data
  const fetchData = async () => {
    try {
      const [churchRes, memberRes] = await Promise.all([
        api.get("/leaderboard/"),
        api.get("/leaderboard/members/"),
      ]);
      setChurches(churchRes.data);
      setMembers(memberRes.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch scores:", err);
      setError("Failed to load scores. Server might be down.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      const [churchRes, memberRes] = await Promise.all([
        api.get("/churches/"),
        api.get("/members/"),
      ]);
      setAllChurches(churchRes.data);
      setAllMembers(memberRes.data);
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    }
  };

  useEffect(() => {
    fetchData();
    if (isAdmin) fetchAdminData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  // Add points to member
  const handleAddScore = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/scores/", {
        member: parseInt(scoreForm.member),
        points: parseInt(scoreForm.points),
        reason: scoreForm.reason,
      });
      setShowScoreModal(false);
      setScoreForm({ member: "", points: "", reason: "" });
      fetchData();
      fetchAdminData();
    } catch (err) {
      console.error("Failed to add score:", err);
      alert("Failed to add score. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Add new member
  const handleAddMember = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/members/manage/", {
        name: memberForm.name,
        church: parseInt(memberForm.church),
        score: 0,
      });
      setShowMemberModal(false);
      setMemberForm({ name: "", church: "" });
      fetchData();
      fetchAdminData();
    } catch (err) {
      console.error("Failed to add member:", err);
      alert("Failed to add member. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return <div className="text-center p-10 text-xl">Loading scores...</div>;
  if (error)
    return (
      <div className="text-center p-10 text-red-500 font-bold">{error}</div>
    );

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-teal-600">
          🏆 Live Standings
        </h1>

        {isAdmin && (
          <div className="flex gap-3">
            <button
              onClick={() => setShowMemberModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg transition-all"
            >
              + Add Member
            </button>
            <button
              onClick={() => setShowScoreModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg transition-all"
            >
              + Add Points
            </button>
          </div>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-white rounded-xl shadow-lg p-1 mb-6">
        <button
          onClick={() => setActiveTab("churches")}
          className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
            activeTab === "churches"
              ? "bg-gradient-to-r from-gray-800 to-teal-600 text-white shadow-md"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          ⛪ Churches
        </button>
        <button
          onClick={() => setActiveTab("members")}
          className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
            activeTab === "members"
              ? "bg-gradient-to-r from-gray-800 to-teal-600 text-white shadow-md"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          👤 Members
        </button>
      </div>

      {/* Churches Table */}
      {activeTab === "churches" && (
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-gray-800 to-teal-600 text-white">
              <tr>
                <th className="py-4 px-6 text-left">Rank</th>
                <th className="py-4 px-6 text-left">Church</th>
                <th className="py-4 px-6 text-center">Members</th>
                <th className="py-4 px-6 text-right">Total Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {churches.map((church, index) => (
                <tr
                  key={church.id}
                  className={
                    index < 3
                      ? "bg-gradient-to-r from-teal-50 to-yellow-50 font-bold"
                      : "hover:bg-gray-50"
                  }
                >
                  <td className="py-4 px-6 text-xl">
                    {index === 0 && "🥇"}
                    {index === 1 && "🥈"}
                    {index === 2 && "🥉"}
                    {index > 2 && `#${index + 1}`}
                  </td>
                  <td className="py-4 px-6 text-xl">{church.name}</td>
                  <td className="py-4 px-6 text-center text-gray-500">
                    {church.members_total || 0}
                  </td>
                  <td className="py-4 px-6 text-right text-2xl font-mono text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-teal-600">
                    {church.leaderboard_score || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {churches.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No churches registered yet.
            </div>
          )}
        </div>
      )}

      {/* Members Table */}
      {activeTab === "members" && (
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-gray-800 to-teal-600 text-white">
              <tr>
                <th className="py-4 px-6 text-left">Rank</th>
                <th className="py-4 px-6 text-left">Name</th>
                <th className="py-4 px-6 text-left">Church</th>
                <th className="py-4 px-6 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((member, index) => (
                <tr
                  key={member.id}
                  className={
                    index < 3
                      ? "bg-gradient-to-r from-teal-50 to-yellow-50 font-bold"
                      : "hover:bg-gray-50"
                  }
                >
                  <td className="py-4 px-6 text-xl">
                    {index === 0 && "🥇"}
                    {index === 1 && "🥈"}
                    {index === 2 && "🥉"}
                    {index > 2 && `#${index + 1}`}
                  </td>
                  <td className="py-4 px-6 text-xl">{member.name}</td>
                  <td className="py-4 px-6 text-gray-600">
                    {member.church_name}
                  </td>
                  <td className="py-4 px-6 text-right text-2xl font-mono text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-teal-600">
                    {member.score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {members.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No members registered yet.
            </div>
          )}
        </div>
      )}

      {/* Add Score Modal */}
      {showScoreModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Add Points to Member
            </h2>
            <form onSubmit={handleAddScore} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Member
                </label>
                <select
                  value={scoreForm.member}
                  onChange={(e) =>
                    setScoreForm({ ...scoreForm, member: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select a member...</option>
                  {allMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.church_name})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points
                </label>
                <input
                  type="number"
                  value={scoreForm.points}
                  onChange={(e) =>
                    setScoreForm({ ...scoreForm, points: e.target.value })
                  }
                  required
                  placeholder="e.g. 10 or -5"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use negative numbers for penalties
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason
                </label>
                <input
                  type="text"
                  value={scoreForm.reason}
                  onChange={(e) =>
                    setScoreForm({ ...scoreForm, reason: e.target.value })
                  }
                  required
                  placeholder="e.g. Won Bible quiz"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowScoreModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-800 to-teal-600 text-white rounded-xl disabled:opacity-50"
                >
                  {submitting ? "Adding..." : "Add Points"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Add New Member
            </h2>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={memberForm.name}
                  onChange={(e) =>
                    setMemberForm({ ...memberForm, name: e.target.value })
                  }
                  required
                  placeholder="Member's name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Church
                </label>
                <select
                  value={memberForm.church}
                  onChange={(e) =>
                    setMemberForm({ ...memberForm, church: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select a church...</option>
                  {allChurches.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-700 to-teal-700 text-white rounded-xl disabled:opacity-50"
                >
                  {submitting ? "Adding..." : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scoreboard;
