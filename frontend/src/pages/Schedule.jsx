import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

// ─── Color mapping for event types ───────────────────────────────
const EVENT_COLORS = {
  Talks: {
    bg: "bg-indigo-50",
    card: "bg-indigo-100",
    border: "border-indigo-400",
    badge: "bg-indigo-100 text-indigo-700",
    dot: "bg-indigo-500",
    text: "text-indigo-700",
  },
  Workshops: {
    bg: "bg-emerald-50",
    card: "bg-emerald-100",
    border: "border-emerald-400",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
  },
  Games: {
    bg: "bg-amber-50",
    card: "bg-amber-100",
    border: "border-amber-400",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
    text: "text-amber-700",
  },
  "Keynote Speaker": {
    bg: "bg-purple-50",
    card: "bg-purple-100",
    border: "border-purple-400",
    badge: "bg-purple-100 text-purple-700",
    dot: "bg-purple-500",
    text: "text-purple-700",
  },
  "Poster Sessions": {
    bg: "bg-rose-50",
    card: "bg-rose-100",
    border: "border-rose-400",
    badge: "bg-rose-100 text-rose-700",
    dot: "bg-rose-500",
    text: "text-rose-700",
  },
  default: {
    bg: "bg-gray-50",
    card: "bg-gray-100",
    border: "border-gray-400",
    badge: "bg-gray-100 text-gray-700",
    dot: "bg-gray-500",
    text: "text-gray-900",
  },
};

const getColor = (title) => {
  for (const key of Object.keys(EVENT_COLORS)) {
    if (key !== "default" && title.toLowerCase().includes(key.toLowerCase()))
      return { ...EVENT_COLORS[key], label: key };
  }
  return { ...EVENT_COLORS.default, label: "Event" };
};

// ─── Helpers ─────────────────────────────────────────────────────
const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const formatDateTimeLocal = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const isPast = (endIso) => new Date(endIso) < new Date();

// ─── Main Component ──────────────────────────────────────────────
const Schedule = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("schedule"); // "schedule" | "tasks"
  const [activeDay, setActiveDay] = useState(1);
  const [taskFilter, setTaskFilter] = useState("all"); // "all" | "pending" | "done"
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    start_time: "",
    end_time: "",
    location: "",
    description: "",
    day: 1,
    sub_events: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [togglingIds, setTogglingIds] = useState(new Set());
  const [selectedSession, setSelectedSession] = useState(null);
  const { isAdmin } = useAuth();

  const fetchEvents = () => {
    api
      .get("/schedule/")
      .then((res) => setEvents(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // ── Admin CRUD ───────────────────────────────────────────────
  const openAddModal = () => {
    setEditingEvent(null);
    setFormData({
      title: "",
      start_time: "",
      end_time: "",
      location: "",
      description: "",
      day: activeDay,
      sub_events: [],
    });
    setShowModal(true);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      start_time: formatDateTimeLocal(event.start_time),
      end_time: formatDateTimeLocal(event.end_time),
      location: event.location,
      description: event.description || "",
      day: event.day,
      sub_events: (event.sub_events || []).map((s) => ({
        title: s.title,
        location: s.location || "",
        description: s.description || "",
        speaker_name: s.speaker_name || "",
        speaker_bio: s.speaker_bio || "",
        speaker_contact: s.speaker_contact || "",
        speaker_image: s.speaker_image || "",
      })),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        sub_events: formData.sub_events.filter((s) => s.title.trim() !== ""),
      };
      if (editingEvent)
        await api.put(`/schedule/manage/${editingEvent.id}/`, payload);
      else await api.post("/schedule/manage/", payload);
      setShowModal(false);
      setFormData({
        title: "",
        start_time: "",
        end_time: "",
        location: "",
        description: "",
        day: 1,
        sub_events: [],
      });
      setEditingEvent(null);
      fetchEvents();
    } catch (err) {
      console.error("Failed to save event:", err);
      alert("Failed to save event. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await api.delete(`/schedule/manage/${eventId}/`);
      fetchEvents();
    } catch (err) {
      console.error("Failed to delete event:", err);
      alert("Failed to delete event.");
    }
  };

  const toggleDone = async (event) => {
    setTogglingIds((prev) => new Set([...prev, event.id]));
    try {
      await api.patch(`/schedule/manage/${event.id}/`, {
        is_done: !event.is_done,
      });
      fetchEvents();
    } catch (err) {
      console.error("Failed to toggle:", err);
      alert("Failed to update status.");
    } finally {
      setTogglingIds((prev) => {
        const s = new Set(prev);
        s.delete(event.id);
        return s;
      });
    }
  };

  // ── Filtered / grouped data ──────────────────────────────────
  const dayEvents = events.filter((e) => e.day === activeDay);
  const filteredTasks = events.filter((e) => {
    if (taskFilter === "done") return e.is_done;
    if (taskFilter === "pending") return !e.is_done;
    return true;
  });

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-200 border-t-[#B22234] rounded-full animate-spin"></div>
          <span className="text-gray-500 font-medium">Loading schedule...</span>
        </div>
      </div>
    );

  // ─── RENDER ──────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#B22234] to-[#2BB5B8]">
          <img
            src="/Nkom-Logo.png"
            alt="Nkom"
            className="inline-block h-16 w-auto mr-2 align-middle"
          />{" "}
          Event Schedule
        </h1>
        {isAdmin && (
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 bg-gradient-to-r from-[#B22234] to-[#2BB5B8] hover:from-[#8B1A29] hover:to-[#239396] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all text-sm"
          >
            + Add Event
          </button>
        )}
      </div>

      {/* ── View Toggle ──────────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {[
          { key: "schedule", label: "Schedule", icon: "" },
          { key: "tasks", label: "Tasks", icon: "" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setViewMode(key)}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              viewMode === key
                ? "bg-white text-[#B22234] shadow-md"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ── SCHEDULE VIEW ─────────────────────────────────────────  */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {viewMode === "schedule" && (
        <>
          {/* Timeline */}
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-[4.5rem] top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#2BB5B8] via-gray-300 to-[#B22234] hidden sm:block"></div>

            <div className="space-y-4">
              {dayEvents.map((event) => {
                const color = getColor(event.title);
                const eventPast = isPast(event.end_time);
                const hasSubs = event.sub_events && event.sub_events.length > 0;

                return (
                  <div
                    key={event.id}
                    className={`relative transition-all duration-300 ${
                      event.is_done ? "opacity-60" : ""
                    }`}
                  >
                    {/* ── Time badge + dot row ─────────────────── */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-0">
                      <div className="flex-shrink-0 w-full sm:w-36 flex sm:flex-col items-center sm:items-end gap-2 sm:pr-6 sm:pt-4">
                        <span className="text-sm font-bold text-gray-800 whitespace-nowrap">
                          {formatTime(event.start_time)}
                        </span>
                        <span className="text-xs text-gray-400">
                          to {formatTime(event.end_time)}
                        </span>
                        {/* Timeline dot */}
                        <div
                          className={`hidden sm:block absolute left-[4.05rem] top-5 w-3 h-3 rounded-full ring-4 ring-white ${color.dot} ${
                            !eventPast && !event.is_done ? "animate-pulse" : ""
                          }`}
                        ></div>
                      </div>

                      {/* ── Main card (always shown) ───────────── */}
                      <div
                        className={`flex-grow ${color.bg} border-l-4 ${color.border} rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow ${
                          event.is_done
                            ? "line-through decoration-gray-400"
                            : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3
                                className={`text-lg font-bold ${event.is_done ? "text-gray-400" : "text-gray-900"}`}
                              >
                                {event.title}
                              </h3>
                              {hasSubs && (
                                <span className="px-2 py-0.5 bg-white/60 text-gray-600 text-xs font-bold rounded-full border border-gray-200">
                                  {event.sub_events.length} parallel sessions ↓
                                </span>
                              )}
                              {event.is_done && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                  ✓ Done
                                </span>
                              )}
                              {!event.is_done && eventPast && (
                                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                                  ⏰ Ended
                                </span>
                              )}
                            </div>
                            {event.location && !hasSubs && (
                              <p className="text-sm text-gray-500 mb-1">
                                📍 {event.location}
                              </p>
                            )}
                            {event.description && (
                              <p className="text-sm text-gray-600">
                                {event.description}
                              </p>
                            )}
                          </div>

                          {/* Admin actions */}
                          {isAdmin && (
                            <div className="flex flex-col gap-1.5 flex-shrink-0">
                              <button
                                onClick={() => openEditModal(event)}
                                className="px-3 py-1 text-xs bg-white/80 text-[#B22234] rounded-lg hover:bg-white transition-colors border border-[#B22234]/20"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(event.id)}
                                className="px-3 py-1 text-xs bg-white/80 text-red-700 rounded-lg hover:bg-white transition-colors border border-red-200"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ── Branching sub-events ─────────────────── */}
                    {hasSubs && (
                      <div className="relative sm:ml-36">
                        {/* Branch-out connector */}
                        <div className="hidden sm:block absolute -left-[4.85rem] top-0 w-5 h-px bg-gray-300"></div>

                        {/* Vertical branch line on the left of the sub-events grid */}
                        <div
                          className="hidden sm:block absolute -left-[4.85rem] top-0 bottom-0 w-0.5 bg-gray-300"
                          style={{ borderRadius: "1px" }}
                        ></div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2 pl-0 sm:pl-2 items-stretch">
                          {event.sub_events.map((sub, idx) => (
                            <div key={sub.id} className="relative group">
                              {/* Horizontal connector from branch line to card */}
                              <div className="hidden sm:block absolute -left-2 top-1/2 w-2 h-px bg-gray-300"></div>

                              <div
                                className={`${color.bg} border ${color.border} rounded-lg p-3 hover:shadow-md transition-all h-full`}
                              >
                                <div className="flex items-start gap-2">
                                  <div
                                    className={`flex-shrink-0 w-6 h-6 rounded-full ${color.dot} flex items-center justify-center mt-0.5`}
                                  >
                                    <span className="text-white text-xs font-bold">
                                      {idx + 1}
                                    </span>
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-sm text-gray-800 leading-tight">
                                      {sub.title}
                                    </p>
                                    {sub.location && (
                                      <p className="text-xs text-gray-500 mt-0.5">
                                        📍 {sub.location}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Merge dot — reconnects the timeline */}
                        <div className="hidden sm:flex items-center -ml-[4.85rem] mt-2 mb-1">
                          <div
                            className={`w-2 h-2 rounded-full ${color.dot} ring-2 ring-white`}
                          ></div>
                          <div className="flex-grow h-px bg-gradient-to-r from-gray-300 to-transparent max-w-[3rem]"></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {dayEvents.length === 0 && (
                <div className="text-center text-gray-400 italic py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                  No events for Day {activeDay}.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ── TASKS VIEW ────────────────────────────────────────────  */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {viewMode === "tasks" && (
        <>
          {/* Filter pills */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {[
              { key: "all", label: "All", count: events.length },
              {
                key: "pending",
                label: "Pending",
                count: events.filter((e) => !e.is_done).length,
              },
              {
                key: "done",
                label: "Done",
                count: events.filter((e) => e.is_done).length,
              },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setTaskFilter(key)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  taskFilter === key
                    ? "bg-gradient-to-r from-[#B22234] to-[#2BB5B8] text-white shadow-md"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-[#B22234]/30 shadow-sm"
                }`}
              >
                {label}
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    taskFilter === key
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mb-6 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700">
                Progress
              </span>
              <span className="text-sm font-bold text-[#B22234]">
                {events.filter((e) => e.is_done).length} / {events.length} tasks
                done
              </span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#B22234] to-[#2BB5B8] rounded-full transition-all duration-500"
                style={{
                  width: `${events.length ? (events.filter((e) => e.is_done).length / events.length) * 100 : 0}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Task cards */}
          <div className="space-y-3">
            {filteredTasks.map((event) => {
              const color = getColor(event.title);
              const eventPast = isPast(event.end_time);
              const canToggle = isAdmin;
              const toggling = togglingIds.has(event.id);

              return (
                <div
                  key={event.id}
                  className={`rounded-xl shadow-sm transition-all duration-300 hover:shadow-md ${
                    event.is_done ? "bg-green-100" : color.card
                  }`}
                >
                  <div className="flex items-center p-4 gap-4">
                    {/* Toggle button */}
                    <button
                      onClick={() => canToggle && toggleDone(event)}
                      disabled={!canToggle || toggling}
                      className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                        event.is_done
                          ? "bg-green-500 border-green-500 text-white"
                          : canToggle
                            ? "border-gray-300 hover:border-green-400 hover:bg-green-50 cursor-pointer"
                            : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
                      } ${toggling ? "animate-pulse" : ""}`}
                      title={
                        event.is_done
                          ? "Mark as not done"
                          : isAdmin
                            ? "Mark as done"
                            : "Admin only"
                      }
                    >
                      {event.is_done && (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </button>

                    {/* Content */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={`font-bold ${event.is_done ? "text-gray-400 line-through" : "text-gray-900"}`}
                        >
                          {event.title}
                        </h3>
                        {event.is_done && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                            ✓ Done
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="font-medium">
                          🕐 {formatTime(event.start_time)} –{" "}
                          {formatTime(event.end_time)}
                        </span>
                        {event.location && <span>📍 {event.location}</span>}
                      </div>

                      {/* Sub-events */}
                      {event.sub_events && event.sub_events.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {event.sub_events.map((sub) => (
                            <span
                              key={sub.id}
                              className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium"
                            >
                              {sub.title}
                              {sub.location ? ` @ ${sub.location}` : ""}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Status indicator */}
                    <div className="flex-shrink-0">
                      {event.is_done ? (
                        <span className="w-3 h-3 rounded-full bg-green-500 block"></span>
                      ) : eventPast ? (
                        <span className="w-3 h-3 rounded-full bg-yellow-400 block animate-pulse"></span>
                      ) : (
                        <span className="w-3 h-3 rounded-full bg-[#2BB5B8] block"></span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredTasks.length === 0 && (
              <div className="text-center text-gray-400 italic py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                No tasks match the current filter.
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ── ADMIN MODAL ───────────────────────────────────────────  */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingEvent ? "Edit Event" : "Add New Event"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  placeholder="e.g. Opening Ceremony"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2BB5B8] focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) =>
                      setFormData({ ...formData, start_time: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2BB5B8] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) =>
                      setFormData({ ...formData, end_time: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2BB5B8] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="e.g. Main Hall"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2BB5B8] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Day
                  </label>
                  <select
                    value={formData.day}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        day: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2BB5B8] focus:border-transparent"
                  >
                    <option value={1}>Day 1</option>
                    <option value={2}>Day 2</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Additional details..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2BB5B8] focus:border-transparent resize-none"
                />
              </div>

              {/* ── Sub-events / Parallel Sessions ─────────── */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Parallel Sessions
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        sub_events: [
                          ...formData.sub_events,
                          {
                            title: "",
                            location: "",
                            description: "",
                            speaker_name: "",
                            speaker_bio: "",
                            speaker_contact: "",
                            speaker_image: "",
                          },
                        ],
                      })
                    }
                    className="text-xs px-3 py-1 bg-red-50 text-[#B22234] rounded-lg hover:bg-red-100 transition-colors font-semibold"
                  >
                    + Add Session
                  </button>
                </div>

                {formData.sub_events.length === 0 && (
                  <p className="text-xs text-gray-400 italic py-2">
                    No parallel sessions. Click "+ Add Session" to add one.
                  </p>
                )}

                <div className="space-y-2">
                  {formData.sub_events.map((sub, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 rounded-lg p-3 space-y-2"
                    >
                      <div className="flex gap-2 items-start">
                        <span className="text-xs font-bold text-gray-400 mt-3 w-5 text-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={sub.title}
                          onChange={(e) => {
                            const updated = [...formData.sub_events];
                            updated[idx] = {
                              ...updated[idx],
                              title: e.target.value,
                            };
                            setFormData({ ...formData, sub_events: updated });
                          }}
                          placeholder="Session title"
                          className="flex-grow px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2BB5B8] focus:border-transparent"
                        />
                        <select
                          value={sub.location}
                          onChange={(e) => {
                            const updated = [...formData.sub_events];
                            updated[idx] = {
                              ...updated[idx],
                              location: e.target.value,
                            };
                            setFormData({ ...formData, sub_events: updated });
                          }}
                          className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2BB5B8] focus:border-transparent"
                        >
                          <option value="">Room</option>
                          <option value="H">H</option>
                          <option value="C1">C1</option>
                          <option value="C2">C2</option>
                          <option value="C3">C3</option>
                          <option value="C4">C4</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = formData.sub_events.filter(
                              (_, i) => i !== idx,
                            );
                            setFormData({ ...formData, sub_events: updated });
                          }}
                          className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-0.5"
                        >
                          ✕
                        </button>
                      </div>
                      {/* Speaker fields */}
                      <div className="ml-7 grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={sub.speaker_name || ""}
                          onChange={(e) => {
                            const updated = [...formData.sub_events];
                            updated[idx] = {
                              ...updated[idx],
                              speaker_name: e.target.value,
                            };
                            setFormData({ ...formData, sub_events: updated });
                          }}
                          placeholder="Speaker name"
                          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2BB5B8] focus:border-transparent"
                        />
                        <input
                          type="text"
                          value={sub.speaker_contact || ""}
                          onChange={(e) => {
                            const updated = [...formData.sub_events];
                            updated[idx] = {
                              ...updated[idx],
                              speaker_contact: e.target.value,
                            };
                            setFormData({ ...formData, sub_events: updated });
                          }}
                          placeholder="Contact (phone/email)"
                          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2BB5B8] focus:border-transparent"
                        />
                        <input
                          type="url"
                          value={sub.speaker_image || ""}
                          onChange={(e) => {
                            const updated = [...formData.sub_events];
                            updated[idx] = {
                              ...updated[idx],
                              speaker_image: e.target.value,
                            };
                            setFormData({ ...formData, sub_events: updated });
                          }}
                          placeholder="Speaker image URL"
                          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2BB5B8] focus:border-transparent"
                        />
                        <input
                          type="text"
                          value={sub.description || ""}
                          onChange={(e) => {
                            const updated = [...formData.sub_events];
                            updated[idx] = {
                              ...updated[idx],
                              description: e.target.value,
                            };
                            setFormData({ ...formData, sub_events: updated });
                          }}
                          placeholder="Session description"
                          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2BB5B8] focus:border-transparent"
                        />
                        <textarea
                          value={sub.speaker_bio || ""}
                          onChange={(e) => {
                            const updated = [...formData.sub_events];
                            updated[idx] = {
                              ...updated[idx],
                              speaker_bio: e.target.value,
                            };
                            setFormData({ ...formData, sub_events: updated });
                          }}
                          placeholder="Speaker bio"
                          rows={2}
                          className="col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2BB5B8] focus:border-transparent resize-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#B22234] to-[#2BB5B8] text-white rounded-xl hover:from-[#8B1A29] hover:to-[#239396] disabled:opacity-50 transition-all font-semibold"
                >
                  {submitting
                    ? "Saving..."
                    : editingEvent
                      ? "Update Event"
                      : "Add Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
