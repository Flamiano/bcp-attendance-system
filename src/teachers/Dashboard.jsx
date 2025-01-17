import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import supabase from "../supabaseClient"; 
import bcpLogo from "../assets/bcp-logo.png"; 



const Dashboard = () => {
  document.title = "Dashboard";

  //Tab-Icon
  useEffect(() => {
    const link = document.querySelector("link[rel='icon']");
    if (link) {
      link.href = bcpLogo;
    }
  }, []);

  const [genderData, setGenderData] = useState([]);
  const [allData, setAllData] = useState([]); // To hold unfiltered data
  const [yearOptions, setYearOptions] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All");
  const [yearData, setYearData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("gender, year");

        if (error) {
          throw new Error(error.message);
        }

        if (data && data.length > 0) {
          setAllData(data);

          // Extract unique years and sort them numerically
          const uniqueYears = Array.from(
            new Set(data.map((item) => item.year))
          );

          // Sort years numerically by extracting the number from the "1st Year" format
          const sortedYears = uniqueYears
            .map((year) => {
              const match = year.match(/(\d+)/);
              return match ? parseInt(match[0], 10) : 0; // Extract the number and convert it to a number
            })
            .sort((a, b) => a - b) // Sort the years numerically
            .map((yearNum) => `${yearNum}${getYearSuffix(yearNum)}`); // Reformat back to "1st Year", "2nd Year", etc.

          sortedYears.unshift("All"); //
          setYearOptions(sortedYears);
          setSelectedYear("All"); // Set default to "All"

          console.log("Year Options:", sortedYears); // Debugging line

          // Process initial gender data for the "All" selection
          filterGenderData(data, "All");
          processYearData(data, "All"); // Process year data for initial "All"
        } else {
          setErrorMessage("No data found.");
        }
      } catch (err) {
        setErrorMessage(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getYearSuffix = (year) => {
    if (year === 1) return "st";
    if (year === 2) return "nd";
    if (year === 3) return "rd";
    return "th";
  };

  const filterGenderData = (data, year) => {
    let filteredData = data;
    if (year !== "All") {
      filteredData = data.filter((item) => item.year === year);
    }

    const genderCount = filteredData.reduce((acc, { gender }) => {
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});

    const genderChartData = Object.entries(genderCount).map(([key, value]) => ({
      name: key,
      value,
    }));

    console.log("Gender Data for selected year:", genderChartData); // Debugging line

    setGenderData(genderChartData);
  };

  const processYearData = (data, year) => {
    let filteredData = data;
    if (year !== "All") {
      filteredData = data.filter((item) => item.year === year);
    }

    const yearCount = filteredData.reduce((acc, { year }) => {
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {});

    const yearChartData = Object.entries(yearCount).map(([name, pv]) => ({
      name,
      pv,
    }));

    console.log("Year Data:", yearChartData); // Debugging line

    setYearData(yearChartData);
  };

  const handleYearChange = (event) => {
    const selected = event.target.value;
    console.log("Selected Year:", selected); // Debugging line
    setSelectedYear(selected);
    filterGenderData(allData, selected);
    processYearData(allData, selected); // Update year data on year change
  };

  const COLORS = ["#156080", "#009CDB", "#F8B400", "#E63946"];

  // Calculate the total number of students
  const totalStudents = yearData.reduce((acc, { pv }) => acc + pv, 0);

  return (
    <div className="xxsm:text-right lg-items-end min-h-screen w-full lg:text-left lg:w-full bg-gray-50 p-10 ">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-4">Dashboard</h1>
          <p className="text-gray-600">
            Welcome to your admin dashboard. Here's an overview of your data.
          </p>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-4xl font-bold text-blue-600">{totalStudents}</p>
            <h2 className="text-xl font-medium text-gray-600">
              Total Students
            </h2>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-4xl font-bold text-green-500">3</p>
            <h2 className="text-xl font-medium text-gray-600">
              Number of Courses
            </h2>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-4xl font-bold text-purple-600">
              {genderData.length}
            </p>
            <h2 className="text-xl font-medium text-gray-600">
              Gender Categories
            </h2>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gender Pie Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md xxsm:text-left">
            <div className="flex justify-between items-center mb-4 relative">
              <h2 className="text-lg font-medium text-gray-700">
                Gender Distribution
              </h2>
              <select
                value={selectedYear}
                onChange={handleYearChange}
                className="border border-gray-400 rounded-md p-2 z-10 xxsm:w-16 xxsm:text-sm"
                style={{ zIndex: 10 }}
              >
                {yearOptions.map((year, index) => (
                  <option key={index} value={year}>
                    {year === "All" ? "All" : `${year} Year`}
                  </option>
                ))}
              </select>
            </div>
            {loading ? (
              <p>Loading chart...</p>
            ) : errorMessage ? (
              <p className="text-red-500">{errorMessage}</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {genderData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Year Bar Chart (Updated from LineChart to BarChart) */}
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h2 className="text-lg font-medium text-gray-700 mb-4">
              Number of Students by Year
            </h2>
            {loading ? (
              <p>Loading chart...</p>
            ) : errorMessage ? (
              <p className="text-red-500">{errorMessage}</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={yearData.sort((a, b) => a.name.localeCompare(b.name))}
                  margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "gray" }} // Color of X-axis LABEL
                    axisLine={{ stroke: "black" }} // Color of X-axis LINE
                  />
                  <YAxis
                    tick={{ fill: "gray" }} // Color of Y-axis LABEL
                    axisLine={{ stroke: "black" }} // Color of Y-axis LINE
                  />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="pv"
                    fill="#1E90FF" // Color of bars
                    name="Number of Students" // Update the name of the legend to be more descriptive
                    label={{ className: "text-xs sm:text-sm md:text-sm" }} // Add responsive classes here for smaller text on mobile
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
