import { useEffect, useState } from "react";
import axios from "axios";

const API = "park-master-user.vercel.app";

export default function App() {
  const [reservations, setReservations] = useState([]);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const fetchData = () => {
      axios.get(`${API}/reservations`).then((res) => {
        setReservations(res.data);
      });
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const spots = ["A1", "A2", "A3", "A4", "B1", "B2", "B3", "B4"];

  const isReserved = (spot) => {
    return reservations.some(
      (r) => r.spot === spot && r.date === date.toDateString()
    );
  };

  return (
    <div className="p-6 max-w-xl mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">🅿️ ParkMaster – Display</h1>
      <p className="mb-4">Date: 
        <input
          type="date"
          className="ml-2 border px-2 py-1 rounded"
          value={date.toISOString().split("T")[0]}
          onChange={(e) => setDate(new Date(e.target.value))}
        />
      </p>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {spots.map((spot) => (
          <div
            key={spot}
            className={`p-4 rounded font-bold text-white ${
              isReserved(spot) ? "bg-red-600" : "bg-green-600"
            }`}
          >
            {spot}
          </div>
        ))}
      </div>

      <div className="text-left">
        <h2 className="font-bold mb-2">All Reservations:</h2>
        {reservations.map((r, i) => (
          <div key={i} className="text-sm border px-3 py-2 rounded mb-2 bg-gray-100">
            <strong>{r.spot}</strong> – {r.date} – {r.user}
          </div>
        ))}
      </div>
    </div>
  );
}
