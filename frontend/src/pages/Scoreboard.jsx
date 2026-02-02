import { useEffect, useState } from "react";
import api from "../services/api";

const Scoreboard = () => {
  const [churches, setChurches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch data
  const fetchScores = async () => {
    try {
      const response = await api.get("/leaderboard/");
      setChurches(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch scores:", err);
      setError("Failed to load scores. Server might be down.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Fetch immediately on load
    fetchScores();

    // 2. Set up Auto-Refresh (Polling) every 5 seconds
    // This makes it "Live" without needing WebSockets (Simpler for MVP)
    const interval = setInterval(fetchScores, 5000);

    // 3. Cleanup when leaving the page
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return <div className="text-center p-10 text-xl">Loading scores...</div>;
  if (error)
    return (
      <div className="text-center p-10 text-red-500 font-bold">{error}</div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-extrabold text-center mb-8 text-blue-900">
        🏆 Live Standings
      </h1>

      <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="py-4 px-6 text-left text-lg">Rank</th>
              <th className="py-4 px-6 text-left text-lg">Church</th>
              <th className="py-4 px-6 text-right text-lg">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {churches.map((church, index) => (
              <tr
                key={church.id}
                className={
                  index < 3 ? "bg-yellow-50 font-bold" : "hover:bg-gray-50"
                }
              >
                <td className="py-4 px-6 text-xl">
                  {index === 0 && "🥇"}
                  {index === 1 && "🥈"}
                  {index === 2 && "🥉"}
                  {index > 2 && `#${index + 1}`}
                </td>
                <td className="py-4 px-6 text-xl">{church.name}</td>
                <td className="py-4 px-6 text-right text-2xl font-mono text-blue-600">
                  {church.total_score}
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
    </div>
  );
};

export default Scoreboard;
