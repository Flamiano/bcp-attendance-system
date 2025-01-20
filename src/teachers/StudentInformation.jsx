import React, { useEffect, useState } from "react";
import supabase from "../db/supabaseClient";
import { IoSearchSharp } from "react-icons/io5"; //Search Icon
import { CiCirclePlus } from "react-icons/ci"; //Add Icon
import { IoMdPrint } from "react-icons/io"; //  Print Icon
import "../App.css";
import { Footer } from "../components/Footer";
import bcpLogo from "../assets/bcp-logo.png"; 


export const StudentInformation = () => {
  // TabName
  document.title = "Student Information";

  //Tab-Icon
  useEffect(() => {
    const link = document.querySelector("link[rel='icon']");
    if (link) {
      link.href = bcpLogo;
    }
  }, []);

  // For Timer 
  const [time, setTime] = useState(new Date());

  // Function to update the time every second
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Get the hours, minutes, and period (AM/PM)
  let hours = time.getHours();
  const minutes = time.getMinutes();
  const period = hours >= 12 ? "PM" : "AM";

  // Convert hours from 24-hour format to 12-hour format
  if (hours > 12) {
    hours -= 12;
  } else if (hours === 0) {
    hours = 12; // Midnight case (12 AM)
  }

  // Format the minutes and hours to have two digits
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

  // USER 
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState({
    id: "",
    name: "",
    student_id: "",
    course: "",
    year: "",
    number: "",
    age: "",
    gender: "",
  });
  const [formVisible, setFormVisible] = useState(false); // State to toggle form visibility
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [userToDelete, setUserToDelete] = useState(null); // User to be deleted

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching users:", error);
    } else {
      setUsers(data);
    }
  }

  //Create Students
  async function createUser(event) {
    event.preventDefault();

    // Check if any field is empty or has only spaces
    if (
      !user.name.trim() ||
      !user.student_id.trim() ||
      !user.course.trim() ||
      !user.year.trim() ||
      !user.number.trim() ||
      !user.age.trim() ||
      !user.gender.trim()
    ) {
      alert("Please fill in all fields.");
      return;
    }

    // Check if the numeric fields are actually numbers
    if (isNaN(user.student_id) || isNaN(user.number) || isNaN(user.age)) {
      alert(
        "Please enter valid numbers for Student ID, Phone number, and Age."
      );
      return;
    }

    // Check for duplicate student name or student number
    const duplicateUser = users.find(
      (existingUser) =>
        existingUser.name === user.name ||
        existingUser.student_id === user.student_id
    );

    if (duplicateUser) {
      setErrorMessage(
        `You entered the same ${
          duplicateUser.name === user.name ? "name" : "Student No#"
        }`
      );
      setShowErrorModal(true); // Show the error modal
      return;
    }

    const newUser = {
      name: user.name,
      student_id: parseInt(user.student_id),
      course: user.course,
      year: user.year,
      number: user.number,
      age: user.age,
      gender: user.gender,
    };

    try {
      const { error } = await supabase.from("users").insert([newUser]);
      if (error) throw error;

      alert("Created successfully!");
      fetchUsers();
      resetForm();
      setFormVisible(false); // Hide the form after submission
    } catch (error) {
      console.error("Supabase error:", error.message);
      alert(`Failed to create user: ${error.message}`);
    }
  }

  //Modal for Same Student's Information
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const renderErrorModal = () => (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-xs w-full text-center">
        <h3 className="text-red-500 text-lg">{errorMessage}</h3>
        <button
          onClick={() => setShowErrorModal(false)}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Close
        </button>
      </div>
    </div>
  );

  /* Edit User/Student Information */
  async function updateUser(event) {
    event.preventDefault();

    // Check if any field is empty
    if (Object.values(user).some((value) => !value)) {
      alert("Please fill in all fields.");
      return;
    }

    // Check for duplicate student name (excluding the current user)
    const duplicateByName = users.find(
      (existingUser) =>
        existingUser.name === user.name && existingUser.id !== user.id
    );

    if (duplicateByName) {
      setErrorMessage("You entered the same name");
      setShowErrorModal(true);
      return;
    }

    try {
      const { error } = await supabase
        .from("users")
        .update(user)
        .eq("id", user.id);

      if (error) throw error;

      alert("Updated successfully!");
      fetchUsers();
      resetForm();
      setFormVisible(false); // Hide the form after submission
    } catch (error) {
      console.error("Supabase error:", error.message);
      alert(`Failed to update user: ${error.message}`);
    }
  }

  function resetForm() {
    setUser({
      id: "",
      name: "",
      student_id: "",
      course: "",
      year: "",
      number: "",
      age: "",
      gender: "",
    });
  }

  function editUser(userToEdit) {
    setUser(userToEdit);
    setFormVisible(true); // Show the form when editing a user
  }

  //Removing Student
  async function removeUser(id) {
    const userToRemove = users.find((user) => user.id === id);

    // Check if userToRemove is valid
    console.log("User selected for deletion:", userToRemove);

    if (userToRemove) {
      // Check if there's only one user left in the table
      if (users.length === 1) {
        alert("Cannot delete the last user.");
        return;
      }
      setUserToDelete(userToRemove);
      setShowModal(true); // Display the modal for confirmation
    } else {
      console.error("User not found.");
      alert("User not found.");
    }
  }

  async function handleDeleteConfirmation() {
    // Log the userToDelete object to ensure it has the correct structure
    console.log("Deleting student:", userToDelete);

    if (userToDelete && userToDelete.id) {
      // Proceed with delete only if id exists
      try {
        const { error } = await supabase
          .from("users")
          .delete()
          .eq("id", userToDelete.id);

        if (error) {
          console.error("Error deleting user:", error.message);
          alert("Failed to delete student: " + error.message);
        } else {
          alert("Deleted successfully!");
          fetchUsers(); // Refresh the user list after deletion
        }
      } catch (error) {
        console.error("Error during deletion:", error.message);
        alert("An unexpected error occurred: " + error.message);
      } finally {
        setShowModal(false);
        setUserToDelete(null);
      }
    } else {
      console.error("No user to delete or id is missing");
      alert("Invalid user id. Please try again.");
    }
  }

  // Handle input changes
  function handleChange(event) {
    const { name, value } = event.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  }

  // Search Bar
  const [searchValue, setSearchValue] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(users); // Initialize with all users

  useEffect(() => {
    // Update the filteredUsers whenever searchValue changes
    if (searchValue.trim() === "") {
      setFilteredUsers(users); // Display all users when search is cleared
    } else {
      const filtered = users.filter((user) =>
        user.name.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchValue, users]); // Re-run the effect when searchValue or users change

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  //For Filtering of Courses
  const [selectedCourse, setSelectedCourse] = useState("");
  const handleCourseFilterChange = (e) => {
    setSelectedCourse(e.target.value);
  };

  useEffect(() => {
    let filtered = users;

    if (searchValue.trim() !== "") {
      filtered = filtered.filter((user) =>
        user.name.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    if (selectedCourse) {
      filtered = filtered.filter((user) => user.course === selectedCourse);
    }

    setFilteredUsers(filtered);
  }, [searchValue, users, selectedCourse]); // Re-run effect when search or selectedCourse changes

  // Print Function
  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=800,height=600");
    printWindow.document.write(`
    <html>
      <head>
        <title>Student List</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
          
          body {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: "Poppins", serif;
            color: #000;
          }
          h1 {
            text-align: center;
            font-size: 24px;
            margin-top: 20px;
          }
          .header {
            text-align: center;
            font-size: 18px;
            margin-top: 10px;
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
          .footer {
            text-align: center;
            margin-top: 30px;
          }

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
          }
        </style>
      </head>
      <body>
        <h1>Student List</h1>
        <div class="header">
          <p><strong>${selectedCourse}</strong></p>
          <p>
            <span>Date: ${new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</span>
            <span style="margin-left: 30px;">Time: ${new Date().toLocaleString(
              "en-US",
              {
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
                hour12: true,
              }
            )}</span>
          </p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Course</th>
              <th>Year</th>
              <th>Age</th>
              <th>Gender</th>
            </tr>
          </thead>
          <tbody>
            ${users
              .map((user) => {
                return `
                  <tr>
                    <td>${user.name}</td>
                    <td>${user.course}</td>
                    <td>${user.year}</td>
                    <td>${user.age}</td>
                    <td>${user.gender}</td>
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

  return (
    <div className="w-full flex justify-center items-center bg-white bg-opacity-70">
      <div className="max-w-[98%] w-full h-full border-none p-10 m-auto">
        {/* Error Modal */}
        {showErrorModal && renderErrorModal()}
        <div className="flex flex-wrap justify-between items-center mb-4 px-4 w-full">
          {/* Search Bar and Add Button */}
          <div className="flex flex-wrap xxsm:flex-nowrap items-center w-full sm:w-auto gap-4">
            {/* Search Bar */}
            <form className="flex items-center bg-gray-200 rounded-full px-3 py-2 shadow-md flex-1 min-w-[140px] sm:min-w-[200px] xsm:min-w-[120px] xxsm:min-w-[140px] xxsm:ml-[-1rem]">
              <IoSearchSharp className="text-gray-500  text-lg sm:text mr-2 xxsm:text-sm" />
              <input
                type="text"
                value={searchValue}
                onChange={handleSearchChange}
                placeholder="Search by Name"
                className="bg-transparent flex-1 outline-none w-full text-gray-700 text-sm sm:text-base xsm:text-sm xxsm:text-sm xxsm:ml-[-2px]"
              />
            </form>
            {/* Add Button */}
            <button
              onClick={() => setFormVisible(true)}
              className="flex items-center bg-green-500 text-white px-3 py-2 rounded-full hover:bg-green-400 transition-all duration-300 shadow-md text-xs xsm:text-sm sm:text-base whitespace-nowrap"
            >
              <CiCirclePlus size={20} className="mr-2" />
              Add
            </button>
          </div>

          {/* Heading */}
          <h1 className="font-bold text-lg text-center w-full hidden lg:block lg:w-auto">
            STUDENT LIST & INFORMATION
          </h1>

          {/* Timer */}
          <div className="text-black text-md font-medium w-full sm:w-auto xl:flex hidden">
            {hours}:{formattedMinutes}
            {period}
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
        </div>

        {/* Filter by Course */}
        <div className="flex items-center mb-4">
          <select
            className="w-full xsm:w-[90%] sm:w-[100%] lg:w-[40%] px-2 py-2 border-2 rounded-md focus:border-blue-700"
            value={selectedCourse}
            onChange={handleCourseFilterChange}
          >
            <option value="">All Courses</option>
            <option value="BSIT">
              BSIT - Bachelor of Science in Information Technology
            </option>
            <option value="BSIS">
              BSIS - Bachelor of Science in Information Systems
            </option>
            <option value="BSCPE">
              BSCPE - Bachelor of Science in Computer Engineering
            </option>
          </select>
        </div>

        {formVisible && (
          <form
            onSubmit={user.id ? updateUser : createUser}
            className="relative flex flex-col space-y-4 w-full mb-10 bg-gray-200 border border-blue-400 p-8 rounded-lg shadow-xl"
          >
            <h3 className="text-2xl font-semibold text-blue-700 mb-4 text-center">
              Student's Information
            </h3>
            <button
              onClick={() => {
                setFormVisible(false); // Hide the form
                resetForm(); // Reset the form fields
              }}
              className="absolute right-4 top-1 font-bold text-red-700 text-xl hover:text-red-500 transition duration-200"
            >
              X
            </button>
            <input
              type="text"
              placeholder="Name"
              name="name"
              value={user.name}
              onChange={handleChange}
              className="px-4 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="number"
              placeholder="Student#"
              name="student_id"
              value={user.student_id}
              onChange={handleChange}
              className="px-4 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <select
              name="course"
              value={user.course}
              onChange={handleChange}
              className="px-4 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="" disabled>
                Select Course
              </option>
              <option value="BSIT">
                BSIT - Bachelor of Science in Information Technology
              </option>
              <option value="BSIS">
                BSIS - Bachelor of Science in Information System
              </option>
              <option value="BSCPE">
                BSCPE - Bachelor of Science in Computer Engineering
              </option>
            </select>
            <select
              name="year"
              value={user.year}
              onChange={handleChange}
              className="px-4 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="" disabled>
                Select Year
              </option>
              <option value="1st">1st Year</option>
              <option value="2nd">2nd Year</option>
              <option value="3rd">3rd Year</option>
              <option value="4th">4th Year</option>
            </select>
            <input
              type="number"
              placeholder="Phone#"
              name="number"
              value={user.number}
              onChange={handleChange}
              className="px-4 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="number"
              placeholder="Age"
              name="age"
              value={user.age}
              onChange={handleChange}
              className="px-4 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <select
              name="gender"
              value={user.gender}
              onChange={handleChange}
              className="px-4 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="" disabled>
                Select Gender
              </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-400 transition duration-200"
            >
              {user.id ? "Update" : "Create"}
            </button>
          </form>
        )}

        <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
          <table className="min-w-full border border-gray-700 table-auto text-left">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="px-6 py-3 text-sm font-medium">
                  No. of Students
                </th>
                <th className="px-6 py-3 text-sm font-medium">Name</th>
                <th className="px-6 py-3 text-sm font-medium">Student No#</th>
                <th className="px-6 py-3 text-sm font-medium">Course</th>
                <th className="px-6 py-3 text-sm font-medium">Year</th>
                <th className="px-6 py-3 text-sm font-medium">Phone#</th>
                <th className="px-6 py-3 text-sm font-medium">Age</th>
                <th className="px-6 py-3 text-sm font-medium">Gender</th>
                <th className="px-6 py-3 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-6 py-3 text-center text-gray-500"
                  >
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr key={user.id} className="border-b hover:bg-gray-100">
                    <td className="px-6 py-3 text-sm">{index + 1}</td>
                    <td className="px-6 py-3 text-sm">{user.name}</td>
                    <td className="px-6 py-3 text-sm">{user.student_id}</td>
                    <td className="px-6 py-3 text-sm">{user.course}</td>
                    <td className="px-6 py-3 text-sm">{user.year}</td>
                    <td className="px-6 py-3 text-sm">{user.number}</td>
                    <td className="px-6 py-3 text-sm">{user.age}</td>
                    <td className="px-6 py-3 text-sm">{user.gender}</td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => editUser(user)}
                        className="px-[26px] py-2 bg-blue-500 text-white rounded-md hover:bg-blue-400 text-sm mr-2 xxsm:mb-2 lg:mb-0"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeUser(user.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-400 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Footer />

        {/* Modal */}
        {showModal && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-md shadow-lg text-center">
              <h3>Are you sure you want to remove this student?</h3>
              <div className="mt-4">
                <button
                  onClick={handleDeleteConfirmation}
                  className="px-5 py-2 bg-red-500 text-white rounded-md hover:bg-red-400 mr-2"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowModal(false)} // Close the modal without doing anything
                  className="px-5 py-2 bg-green-500 text-white rounded-md hover:bg-green-400"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
