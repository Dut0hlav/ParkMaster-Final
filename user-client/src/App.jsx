import { useState, useEffect } from "react";
import axios from "axios";

const API = "https://parkmaster-final.onrender.com";

export default function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [date, setDate] = useState(new Date());
  const [reservations, setReservations] = useState([]);
  const spots = ["A1", "A2", "A3", "A4", "B1", "B2", "B3", "B4"];

  useEffect(() => {
    axios.get(`${API}/reservations`).then((res) => {
      setReservations(res.data);
    });
  }, [date]);

  const handleAuth = async () => {
    if (username && password) {
      try {
        const url = `${API}/${authMode}`;
        const res = await axios.post(url, { username, password });
        if (res.data.success) setUser(res.data.username);
        else alert(res.data.message);
      } catch (err) {
        alert(err.response.data.message || "Auth failed");
      }
    }
  };

  const isReserved = (spot) => {
    return reservations.some(
      (r) => r.spot === spot && r.date === date.toDateString()
    );
  };

  const reserveSpot = async () => {
    if (!selectedSpot) return alert("Select a spot");
    try {
      const res = await axios.post(`${API}/reserve`, {
        spot: selectedSpot,
        date: date.toDateString(),
        lot: "MainLot",
        user,
      });
      if (res.data.success) {
        setReservations([...reservations, {
          spot: selectedSpot,
          date: date.toDateString(),
          lot: "MainLot",
          user,
        }]);
        alert("Reservation successful!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Reservation failed");
    }
  };

  if (!user) {
    return (
      <div className="p-6 max-w-sm mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">ParkMaster Login</h1>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="border rounded px-3 py-2 w-full mb-2" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="border rounded px-3 py-2 w-full mb-2" />
        <button onClick={handleAuth} className="w-full bg-blue-600 text-white py-2 rounded">
          {authMode === "login" ? "Login" : "Register"}
        </button>
        <p className="text-center mt-2 cursor-pointer text-sm text-blue-500" onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}>
          {authMode === "login" ? "Create account" : "Back to login"}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user}</h1>

      <label className="block mb-2 font-semibold">Select date:</label>
      <input
        type="date"
        value={date.toISOString().split("T")[0]}
        onChange={(e) => setDate(new Date(e.target.value))}
        className="border px-2 py-1 rounded mb-4"
      />

      <div className="grid grid-cols-4 gap-2 mb-4">
        {spots.map((spot) => {
          const reserved = isReserved(spot);
          return (
            <button
              key={spot}
              className={`border px-4 py-2 rounded ${reserved ? 'bg-red-300 cursor-not-allowed' : selectedSpot === spot ? 'bg-blue-600 text-white' : 'bg-white'}`}
              disabled={reserved}
              onClick={() => setSelectedSpot(spot)}
            >
              {spot}
            </button>
          );
        })}
      </div>

      <button onClick={reserveSpot} className="w-full bg-green-600 text-white py-2 rounded">Reserve</button>

      <div className="mt-6">
        <h2 className="font-bold mb-2">All Reservations (client view):</h2>
        {reservations.map((r, i) => (
          <div key={i} className="border px-3 py-2 mb-1 rounded text-sm bg-gray-100">
            <p><strong>User:</strong> {r.user}</p>
            <p><strong>Spot:</strong> {r.spot}</p>
            <p><strong>Date:</strong> {r.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
