import React, { useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';

// Supabase client setup
const supabaseUrl = 'https://jatyugjnkxvfgnbiitdf.supabase.co';  // Replace with your Supabase URL
const supabaseKey = 'YOUR_SUPABASE_KEY';  // Replace with your Supabase Key
const supabase = createClient(supabaseUrl, supabaseKey);

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [absences, setAbsences] = useState([]);
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    const fetchStudentData = async () => {
      const user = supabase.auth.user(); // Get the logged-in user

      if (user) {
        // Fetch student info (name, email) from the "accounts" table
        const { data, error } = await supabase
          .from("accounts")
          .select("fullname, email")
          .eq("email", user.email)
          .single();

        if (error) {
          console.error("Error fetching student data: ", error);
          return;
        }

        setStudentData(data);

        // Fetch absences from the "absences" table
        const { data: absencesData, error: absencesError } = await supabase
          .from("absences")
          .select("*")
          .eq("student_email", user.email);

        if (absencesError) {
          console.error("Error fetching absences: ", absencesError);
        } else {
          setAbsences(absencesData);
        }

        // Fetch schedule from the "schedules" table
        const { data: scheduleData, error: scheduleError } = await supabase
          .from("schedules")
          .select("*")
          .eq("student_email", user.email);

        if (scheduleError) {
          console.error("Error fetching schedule: ", scheduleError);
        } else {
          setSchedule(scheduleData);
        }
      }
    };

    fetchStudentData();
  }, []);

  if (!studentData) {
    return <div className="text-center mt-10 text-xl">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-blue-900">
        Hello, {studentData.fullname}
      </h2>
      <p className="text-lg text-blue-600">Email: {studentData.email}</p>

      <div className="mt-6">
        <h3 className="text-xl font-semibold text-blue-500">Your Absences</h3>
        {absences.length > 0 ? (
          <ul className="list-none space-y-2 mt-3">
            {absences.map((absence, index) => (
              <li key={index} className="p-3 bg-gray-100 rounded-lg shadow-sm">
                <p className="text-blue-900">
                  {absence.date}: {absence.reason}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 mt-2">No absences recorded.</p>
        )}
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold text-blue-500">Your Schedule</h3>
        {schedule.length > 0 ? (
          <ul className="list-none space-y-2 mt-3">
            {schedule.map((classInfo, index) => (
              <li key={index} className="p-3 bg-gray-100 rounded-lg shadow-sm">
                <p className="text-blue-900">
                  {classInfo.day} - {classInfo.time}: {classInfo.subject}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 mt-2">No schedule found.</p>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
