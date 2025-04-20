
import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";

const API = import.meta.env.VITE_API_URL;

const lots = {
  "Lot 1": ["A1", "A2", "A3", "A4"],
  "Lot 2": ["B1", "B2", "B3", "B4"],
};

export default function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedLot, setSelectedLot] = useState("Lot 1");
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [date, setDate] = useState(new Date());
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    axios.get(`${API}/reservations`).then((res) => {
      setReservations(res.data);
    });
  }, [date]);

  const handleAuth = () => {
    if (username && password) {
      const url = `${API}/${authMode}`;
      axios.post(url, { username, password })
        .then(res => {
          if (res.data.success) {
            setUser(res.data.username);
          } else {
            alert(res.data.message);
          }
        })
        .catch(err => {
          alert(err.response?.data?.message || "Auth failed");
        });
    }
  };

  const isReserved = (spot) => {
    return reservations.some(
      (r) => r.spot === spot && r.date === date.toDateString() && r.lot === selectedLot
    );
  };

  const reserveSpot = async () => {
    if (!selectedSpot) return alert("Select a spot");
    try {
      const res = await axios.post(`${API}/reserve`, {
        spot: selectedSpot,
        date: date.toDateString(),
        lot: selectedLot,
        user,
      });
      if (res.data.success) {
        setReservations([
          ...reservations,
          {
            spot: selectedSpot,
            date: date.toDateString(),
            lot: selectedLot,
            user,
            id: Date.now(), // temporary id for frontend rendering
          },
        ]);
        alert("Reservation successful!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Reservation failed");
    }
  };

  const cancelReservation = async (id) => {
    try {
      await axios.delete(`${API}/reservations/${id}`);
      setReservations(reservations.filter(r => r.id !== id));
    } catch (err) {
      alert("Failed to cancel reservation");
    }
  };

  if (!user) {
    return (
      <div className="p-6 max-w-sm mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">ParkMaster Login</h1>
        <Card className="mb-4">
          <CardContent>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          </CardContent>
        </Card>
        <Button className="w-full mb-2" onClick={handleAuth}>
          {authMode === "login" ? "Login" : "Register"}
        </Button>
        <p className="text-center text-sm cursor-pointer text-blue-600" onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}>
          {authMode === "login" ? "Create an account" : "Back to login"}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">Welcome, {user}!</h1>

      <Card className="mb-4">
        <CardContent>
          <p className="mb-2 font-semibold">Select parking lot:</p>
          <div className="flex gap-2 mb-2">
            {Object.keys(lots).map((lotName) => (
              <Button
                key={lotName}
                variant={selectedLot === lotName ? "default" : "outline"}
                onClick={() => setSelectedLot(lotName)}
              >
                {lotName}
              </Button>
            ))}
          </div>
          <p className="mb-2 font-semibold">Parking map:</p>
          <div className="grid grid-cols-4 gap-2">
            {lots[selectedLot].map((spot) => (
              <Button
                key={spot}
                variant={
                  isReserved(spot)
                    ? "default"
                    : selectedSpot === spot
                    ? "default"
                    : "outline"
                }
                onClick={() => setSelectedSpot(spot)}
                disabled={isReserved(spot)}
              >
                {spot}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardContent>
          <p className="mb-2 font-semibold">Select date:</p>
          <Calendar selected={date} onSelect={setDate} />
        </CardContent>
      </Card>

      <Button className="w-full" onClick={reserveSpot}>Reserve</Button>

      <div className="mt-6">
        <h2 className="text-xl font-bold mb-2">My Reservations:</h2>
        {reservations.filter(r => r.user === user).map((r) => (
          <div key={r.id} className="border p-2 rounded mb-2 bg-gray-50 flex justify-between items-center">
            <div>
              <p>Lot: {r.lot}</p>
              <p>Spot: {r.spot}</p>
              <p>Date: {r.date}</p>
            </div>
            <button
              onClick={() => cancelReservation(r.id)}
              className="text-red-600 underline text-sm ml-4"
            >
              Cancel
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
