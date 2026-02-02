import { useEffect, useState } from 'react';
import api from '../services/api';

const Schedule = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/schedule/')
      .then(res => setEvents(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Helper to format date nicely
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <div className="p-10 text-center">Loading schedule...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-900">📅 Event Timeline</h1>
      
      <div className="space-y-6">
        {events.map((event) => (
            <div key={event.id} className="flex bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                {/* Time Box */}
                <div className="flex-shrink-0 w-24 text-center border-r border-gray-200 pr-4 flex flex-col justify-center">
                    <span className="text-lg font-bold text-gray-800">{formatTime(event.start_time)}</span>
                    <span className="text-sm text-gray-500">to {formatTime(event.end_time)}</span>
                </div>

                {/* Details */}
                <div className="pl-6">
                    <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                    <p className="text-blue-600 font-semibold text-sm mb-2">📍 {event.location}</p>
                    <p className="text-gray-600">{event.description}</p>
                </div>
            </div>
        ))}

        {events.length === 0 && (
            <div className="text-center text-gray-500 italic">No events scheduled yet.</div>
        )}
      </div>
    </div>
  );
};

export default Schedule;