import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import emailjs from "@emailjs/browser";  // Correct import
import "./AppointmentBooking.css";  

export const AppointmentBooking = () => {
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("");

  // Initialize EmailJS (Best Practice)
  useEffect(() => {
    emailjs.init("eTO5gmqMPncxTr98F"); 
  }, []);

  const handleBooking = (e) => {
    e.preventDefault();

    const templateParams = {
      to_email: "sneheeg@gmail.com",
      user_name: name,
      user_purpose: purpose,
      user_email: email,
      appointment_date: date.toDateString(),
      appointment_time: time,
    };

    console.log("Sending Email with:", templateParams);

    emailjs
      .send("service_k1w5xhf", "template_st6y1uo", templateParams)
      .then((response) => {
        console.log("SUCCESS!", response.status, response.text);
        alert("Appointment booked successfully!");
      })
      .catch((error) => {
        console.error("FAILED...", error);
        alert(`Failed to book appointment. Error: ${error.text}`);
      });
  };

  return (
    <div className="container">
      <h1>Hi! I am Tanshu Gurung.</h1>
      <p>Make an appointment</p>
      <form className="form" onSubmit={handleBooking}>
        <div className="leftbar">
          <Calendar onChange={setDate} value={date} className="calendar" />
        </div>
        <div className="rightbar">
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
          
          <input
            type="time"
            className="input"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
          {/* <DemoItem label="Controlled calendar">
            <DateCalendar value={value} onChange={(newValue) => setValue(newValue)} />
          </DemoItem> */}
          <input
            type="email"
            placeholder="Your Email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="button">Book Appointment</button>
        </div>
        
        
      </form>
    </div>
  );
};
