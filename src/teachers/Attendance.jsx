import React, { useEffect, useState } from "react";
import supabase from "../db/supabaseClient"; // Import Supabase client
import { IoMdPrint } from "react-icons/io";
import { Footer } from "../components/Footer";
import bcpLogo from "../assets/bcp-logo.png"; // Adjust the path as needed

const Attendance = () => {
  document.title = "Attendance";

  //Tab-Icon
  useEffect(() => {
    const link = document.querySelector("link[rel='icon']");
    if (link) {
      link.href = bcpLogo;
    }
  }, []);

  // State variables
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedCourse, setSelectedCourse] = useState(""); // State to store the selected course

  // Fetch students from the 'users' table
  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, course"); // Fetching 'id', 'name', and 'course' from 'users' table
    if (error) {
      console.error("Error fetching students:", error);
    } else {
      setStudents(data);
    }
  };

  // Fetch attendance data for the selected date
  const fetchAttendance = async () => {
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("date", selectedDate); // Get attendance records for the selected date

    if (error) {
      console.error("Error fetching attendance:", error);
    } else {
      setAttendanceData(data);
    }
  };

  // Handle attendance status change
  const handleStatusChange = async (studentId, status) => {
    const existingAttendance = attendanceData.find(
      (item) => item.student_id === studentId
    );

    const currentTime = new Date().toLocaleTimeString(); // Get current time

    if (existingAttendance) {
      // Update the existing record
      const { error } = await supabase
        .from("attendance")
        .update({ status, time: currentTime })
        .eq("student_id", studentId)
        .eq("date", selectedDate);

      if (error) {
        console.error("Error updating attendance:", error);
      } else {
        // Update the local state with the new status
        setAttendanceData((prev) =>
          prev.map((item) =>
            item.student_id === studentId
              ? { ...item, status, time: currentTime }
              : item
          )
        );
      }
    } else {
      // Insert a new record if attendance does not exist for this student
      const { error } = await supabase.from("attendance").upsert([
        {
          student_id: studentId,
          date: selectedDate,
          status,
          time: currentTime, // Insert current time
        },
      ]);

      if (error) {
        console.error("Error inserting attendance:", error);
      } else {
        // Update the local state with the new status and time
        setAttendanceData((prev) => [
          ...prev,
          {
            student_id: studentId,
            date: selectedDate,
            status,
            time: currentTime,
          },
        ]);
      }
    }
  };

  // Fetch students and attendance on component mount and when the selectedDate changes
  useEffect(() => {
    fetchStudents(); // Fetch the list of students
    fetchAttendance(); // Fetch attendance data for the selected date
  }, [selectedDate]); // Re-fetch when the date changes

  // Filter students by the selected course
  const filteredStudents = selectedCourse
    ? students.filter((student) => student.course === selectedCourse)
    : students;

  // Get unique courses for the dropdown filter
  const courses = [...new Set(students.map((student) => student.course))];

  // Print functionality
  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=800,height=600");

    // Function to format the date as "Day of the week, MM/DD/YYYY"
    const formatDate = (date) => {
      const d = new Date(date);
      const options = {
        weekday: "long",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      };
      const formattedDate = d.toLocaleDateString("en-US", options);
      return formattedDate; // Returns date in the format "Wednesday, 01/08/2025"
    };

    const formattedDate = formatDate(selectedDate); // Format the selectedDate

    printWindow.document.write(`
    <html>
      <head>
        <title>Attendance Report</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

          body {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: "Poppins", serif;
            font-style: normal;
            color: #000;
          }

          h1 {
            text-align: center;
            font-size: 24px;
            margin-top: 20px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }

          th, td {
            padding: 10px;
            border: 1px solid #ddd;
            text-align: center;
          }

          th {
            background-color: #1e90ff;
            color: white;
          }

          .header {
            text-align: center;
            font-size: 18px;
            margin-top: 20px;
          }

          .date {
            text-align: right;
            font-size: 12px;
            position: absolute;
            top: 10px;
            right: 10px;
          }

          .footer {
            text-align: center;
            margin-top: 30px;
          }

          /* Print specific styles */
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            table {
              width: 100%;
              border: 1px solid #000;
            }

            th {
              background-color: #1e90ff;
              color: white;
            }

            td {
              color: #000;
            }

            .footer {
              font-size: 12px;
              color: #000;
            }

            .date {
              font-size: 10px;
            }
          }
        </style>
      </head>
      <body>
        <h1>Attendance Report</h1>
        <div class="header">
          <p><strong>${selectedCourse}</strong></p>
          <p>${formattedDate}</p> <!-- Display formatted date here -->
        </div>
        <div class="date">
          <p>Date: ${new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })} Time: ${new Date().toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    })}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Course</th>
              <th>Date</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            ${filteredStudents
              .map((student) => {
                const currentAttendance = attendanceData.find(
                  (item) => item.student_id === student.id
                );
                return `
                  <tr>
                    <td>${student.name}</td>
                    <td>${student.course}</td>
                    <td>${formattedDate}</td>
                    <td>${
                      currentAttendance ? currentAttendance.status : "N/A"
                    }</td>
                    <td>${
                      currentAttendance ? currentAttendance.time : "--:--"
                    }</td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>
        <div class="footer">
          <p>Generated by Attendance Monitoring System</p>
        </div>
      </body>
    </html>
  `);
    printWindow.document.close();
    printWindow.print();
  };

  // Handle clearing the status and time
  const handleClear = async (studentId) => {
    try {
      console.log(
        "Attempting to clear attendance for:",
        studentId,
        selectedDate
      );

      // Use an empty string or a default value instead of NULL
      const { error } = await supabase
        .from("attendance")
        .update({ status: "", time: null }) // Or replace '' with a suitable default value
        .eq("student_id", studentId)
        .eq("date", selectedDate);

      if (error) {
        console.error("Error clearing attendance:", error);
      } else {
        console.log(
          "Attendance cleared successfully for:",
          studentId,
          selectedDate
        );

        // Update local state (optimistic UI update)
        setAttendanceData((prev) =>
          prev.map((item) =>
            item.student_id === studentId
              ? { ...item, status: "", time: null }
              : item
          )
        );
      }
    } catch (err) {
      console.error("Error in handleClear:", err);
    }
  };

  return (
    <div className="container mx-auto p-6 lg:bg-white md:bg-gray-50 ">
      <h1 className="md:text-4xl xxsm:text-2xl font-semibold w-full text-center text-blue-900 mb-8">
        Attendance Sheets
      </h1>

      <div className="flex flex-wrap justify-center mb-6 space-x-4">
        <div className="flex items-center space-x-3 mb-4 sm:mb-2 w-full sm:w-auto">
          <label
            htmlFor="date"
            className="lg:text-lg xxsm:text-sm w-full font-medium text-gray-700"
          >
            Select Date:
          </label>
          <input
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-2 border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          />
        </div>

        {/* Course filter dropdown */}
        <div className="flex items-center space-x-3 xxsm:text-sm w-full sm:w-auto">
          <label
            htmlFor="course"
            className="lg:text-lg xxsm:text-sm w-full font-medium text-gray-700 xxsm:ml-[-1rem] md:ml-0"
          >
            Filter by Course:
          </label>
          <select
            id="course"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="p-2 border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          >
            <option value="">All Courses</option>
            {courses.map((course, index) => (
              <option key={index} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
        <table className="min-w-full border border-gray-700 table-auto text-left">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="px-6 py-3 text-sm font-medium">Name</th>
              <th className="px-6 py-3 text-sm font-medium">Course</th>
              <th className="px-6 py-3 text-sm font-medium">Date</th>
              <th className="px-6 py-3 text-sm font-medium">Status</th>
              <th className="px-6 py-3 text-sm font-medium">Time</th>
              <th className="px-6 py-3 text-sm font-medium">Action</th>{" "}
              {/* New Action column */}
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-3 text-center text-gray-500">
                  No students available
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => {
                // Find the attendance record for the current student
                const currentAttendance = attendanceData.find(
                  (item) => item.student_id === student.id
                );
                return (
                  <tr key={student.id} className="border-b hover:bg-gray-100">
                    <td className="px-6 py-3">{student.name}</td>
                    <td className="px-6 py-3">{student.course}</td>
                    <td className="px-6 py-3">{selectedDate}</td>
                    <td className="px-6 py-3">
                      <select
                        value={
                          currentAttendance
                            ? currentAttendance.status
                            : "Select"
                        }
                        onChange={(e) =>
                          handleStatusChange(student.id, e.target.value)
                        }
                        className="p-2 border rounded-md shadow-sm"
                      >
                        <option value="Select">Select</option>
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Late">Late</option>
                      </select>
                    </td>
                    <td className="px-6 py-3">
                      {currentAttendance ? currentAttendance.time : "--:--"}
                    </td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => handleClear(student.id)}
                        className="px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-md"
                      >
                        Clear
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Print Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handlePrint}
          className="flex items-center px-7 py-2 bg-blue-600 text-white rounded-md shadow-lg hover:bg-blue-700 transition-colors duration-300 ease-in-out"
        >
          <IoMdPrint size={"20px"} className="mr-2" />
          <span>Print</span>
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default Attendance;
