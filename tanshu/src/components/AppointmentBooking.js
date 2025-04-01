import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import emailjs from "emailjs-com";
import "./AppointmentBooking.css";

export const AppointmentBooking = () => {
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("");

  const handleBooking = (e) => {
    e.preventDefault();

    const templateParams = {
      user_name: name,
      user_purpose: purpose,
      user_email: email,
      appointment_date: date.toDateString(),
      appointment_time: time,
    };

    emailjs
      .send("service_xxxx", "template_xxxx", templateParams, "user_xxxx")
      .then((response) => {
        alert("Appointment booked successfully!");
      })
      .catch((error) => {
        alert("Failed to book appointment.");
      });
  };

  return (
    <div className="container">
      <h1>Hi! I am Tanshu.</h1>
      {/* <p>Book an appointment easily below.</p> */}
      <form className="form" onSubmit={handleBooking}>
        <input
          type="text"
          placeholder="Your Name"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Purpose of Meet"
          className="input"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          required
        />
        <Calendar
          onChange={setDate}
          value={date}
          className="calendar"
        />
        <input
          type="time"
          className="input"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Your Email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="button">
          Book Appointment
        </button>
      </form>
    </div>
  );
};


