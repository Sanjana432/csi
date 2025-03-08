import React, { useState, useEffect } from "react";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from "axios";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      // Fetch available slots and user's calendar events from backend
      axios.get("/api/slots")
        .then((response) => setAvailableSlots(response.data))
        .catch((error) => setError("Error fetching slots"));
    }
  }, [isAuthenticated]);

  const handleLoginSuccess = (response) => {
    // Send the Google token to the backend for authentication
    axios.post("/api/login", { token: response.credential })
      .then((res) => {
        setUserDetails(res.data.user);
        setIsAuthenticated(true);
      })
      .catch((err) => setError("Login failed"));
  };

  const handleBooking = (slotId) => {
    // Send the booking request to backend
    axios.post("/api/book", { slotId, userId: userDetails.id })
      .then((res) => {
        setBookedSlots([...bookedSlots, res.data]);
        setAvailableSlots(availableSlots.filter(slot => slot.id !== slotId));
      })
      .catch((err) => setError("Booking failed"));
  };

  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <div>
        {!isAuthenticated ? (
          <GoogleLogin onSuccess={handleLoginSuccess} onError={() => setError("Login failed")} />
        ) : (
          <div>
            <h1>Welcome, {userDetails.name}</h1>
            <h2>Available Slots</h2>
            {availableSlots.length > 0 ? (
              availableSlots.map((slot) => (
                <div key={slot.id}>
                  <p>{slot.time}</p>
                  <button onClick={() => handleBooking(slot.id)}>Book</button>
                </div>
              ))
            ) : (
              <p>No available slots</p>
            )}
          </div>
        )}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </GoogleOAuthProvider>
  );
};

export default App;
