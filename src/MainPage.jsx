import React, { useState } from "react";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import logo from "./assets/bcp-logo.png";
import bg from "./assets/bcp-bg.jpg";
import { FiAlignRight } from "react-icons/fi";
import { IoCloseSharp } from "react-icons/io5"; // close icon for mobile
import { IoIosHelpCircleOutline } from "react-icons/io"; // icon for help in mobile
import supabase from "./supabaseClient";
import { useNavigate } from "react-router-dom";

export const MainPage = () => {
  document.title = "BCP-System";

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // 'signin' or 'signup'
  const navigate = useNavigate(); // Add this line

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const [role, setRole] = React.useState(""); // Tracks the selected role

  //Sign in Functionality
  const handleSignInSubmit = async (e) => {
    e.preventDefault();

    const role = e.target.role?.value;
    const email = e.target.email?.value;
    const password = e.target.password?.value;
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // Adding delay to avoid exceeding rate limits
    await delay(3000); // Wait for 3 seconds before submitting the next request

    if (!role || !email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (signInError?.message.includes("rate limit exceeded")) {
        alert("Too many requests made. Please try again after a few minutes.");
        return;
      }

      // Check if the email is verified
      const { data: userData, error: fetchError } = await supabase
        .from("accounts")
        .select("role")
        .eq("email", email)
        .single();

      if (fetchError || !userData) {
        alert("Role mismatch or user not found.");
        return;
      }

      if (userData.role !== role) {
        alert(`Role mismatch: You cannot sign in as a ${role}.`);
        return;
      }

      const { user } = signInData;

      // Check if email is confirmed
      if (!user.email_confirmed_at) {
        alert("Please verify your email before signing in.");
        return;
      }

      alert(
        `${role.charAt(0).toUpperCase() + role.slice(1)} login successful!`
      );
      navigate(
        role === "teacher" ? "/teachers/dashboard" : "/students/dashboard"
      );
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  //Sign up Functionality
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();

    const role = e.target.role?.value;
    const email = e.target.email?.value;
    const password = e.target.password?.value;
    const confirmPassword = e.target["confirm-password"]?.value;
    const name = e.target.name?.value;
    const studentNumber =
      role === "student" ? e.target["student-number"]?.value : null;

    if (
      !role ||
      !email ||
      !password ||
      !name ||
      (role === "student" && !studentNumber)
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      // Adding delay to avoid exceeding rate limits
      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      await delay(3000); // Wait for 3 seconds before submitting the next request

      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
          options: { data: { role, studentNumber } },
        });

      if (signUpError?.message.includes("rate limit exceeded")) {
        alert("Too many requests made. Please try again after a few minutes.");
        return;
      }

      if (signUpError) {
        alert(signUpError.message);
        return;
      }

      const { error: insertError } = await supabase
        .from("accounts")
        .insert([{ email, fullname: name, role }]);

      if (insertError) {
        alert(insertError.message);
        return;
      }

      alert("Account created successfully! Please verify your email.");
      e.target.reset();
      navigate(role === "teacher" ? "/teachers" : "/students");
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  //Auth Forgot Pass
  const handleForgotPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      alert("Password reset email sent!");
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  let attempts = 0;
  const maxAttempts = 5;

  const resetPasswordWithBackoff = async (email) => {
    while (attempts < maxAttempts) {
      try {
        const { data, error } = await supabase.auth.resetPasswordForEmail(
          email
        );
        if (error) throw error;
        alert("Password reset email sent!");
        break; // Break the loop if successful
      } catch (error) {
        if (error.message.includes("rate limit exceeded")) {
          attempts += 1;
          const delayTime = Math.pow(2, attempts) * 1000; // Exponential backoff
          alert(
            `Rate limit exceeded. Retrying in ${delayTime / 1000} seconds...`
          );
          await new Promise((resolve) => setTimeout(resolve, delayTime));
        } else {
          alert(`Error: ${error.message}`);
          break;
        }
      }
    }
  };

  //Auth Reset Pass
  const handleResetPassword = async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      alert("Password reset successful!");
      closeModal();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${bg})`,
      }}
    >
      {/* Header */}
      <header className="bg-opacity-60 bg-gray-800 text-white py-4 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <img
              src={logo}
              alt="BCP Logo"
              className="xxsm:w-10 xxsm:h-10 md:w-12 md:h-12 mr-5"
            />
            <h1 className="text-2xl font-bold xxsm:hidden md:block">
              Bestlink College of the Philippines
            </h1>
          </div>

          {/* Hamburger Menu for Mobile */}
          <div className="xxsm:block md:hidden">
            <button onClick={toggleMenu} className="text-white text-2xl">
              {isMenuOpen ? (
                <IoCloseSharp className="text-white" />
              ) : (
                <FiAlignRight className="text-white" />
              )}
            </button>
          </div>

          {/* Desktop Menu */}
          <nav className="xxsm:hidden md:block">
            <ul className="flex space-x-4">
              <li>
                <button
                  onClick={() => openModal("signin")}
                  className="hover:underline"
                >
                  Sign In
                </button>
              </li>
              <li>
                <button
                  onClick={() => openModal("signup")}
                  className="hover:underline"
                >
                  Sign Up
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Mobile Menu with Sliding Effect from the Right */}
      <div
        className={`${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        } fixed top-0 right-0 bg-black bg-opacity-50 w-full h-full z-40 transition-all duration-300 ease-in-out`}
        onClick={() => setIsMenuOpen(false)}
      >
        <div
          className={`w-4/5 bg-white text-black p-6 absolute top-0 right-0 h-full transform transition-transform duration-300 ease-in-out ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Close Button */}
          <div className="flex justify-end">
            <button onClick={toggleMenu}>
              <IoCloseSharp className="text-black text-3xl" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-col items-center space-y-10 mt-28">
            <button
              onClick={() => openModal("signin")}
              className="text-xl font-medium bg-blue-500 text-white py-3 px-6 w-full rounded-lg shadow-lg shadow-blue-500/50 hover:bg-blue-600 transition-all duration-200"
            >
              Sign In
            </button>
            <button
              onClick={() => openModal("signup")}
              className="text-xl font-medium bg-blue-500 text-white py-3 px-6 w-full rounded-lg shadow-lg shadow-blue-500/50 hover:bg-blue-600 transition-all duration-200"
            >
              Sign Up
            </button>
            <button
              onClick={toggleMenu}
              className="flex items-center justify-center text-xl font-medium bg-blue-500 text-white py-3 px-6 w-full rounded-lg shadow-lg shadow-blue-500/50 hover:bg-blue-600 transition-all duration-200"
            >
              Help
              <IoIosHelpCircleOutline className="text-2xl ml-2" />
            </button>
          </nav>

          {/* Bottom Section */}
          <div className="absolute bottom-8 flex items-center justify-center w-full">
            <div className="flex items-center">
              <img
                src={logo}
                alt="BCP Logo"
                className="w-10 h-10 xxsm:mr-[-1rem] xsm:mr-2 xxsm:ml-0 xsm:ml-[-3rem]"
              />
              <h1 className="text-sm font-semibold text-center">
                Bestlink College of the Philippines
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center text-white">
        <div className="text-center px-4 py-8 rounded-lg text-white w-full mx-auto">
          <h2 className="xxsm:text-xl md:text-4xl font-bold mb-4">
            Welcome to the Attendance Monitoring System
          </h2>
          <p className="xxsm:text-sm md:text-xl mb-6">
            Efficiently track and manage attendance records. Explore the
            features to manage records, users, and more.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex justify-center space-x-6">
            <button
              onClick={() => openModal("signin")}
              className="bg-blue-500 text-white xxsm:px-3 xxsm:py-2 md:px-6 md:py-3 rounded-lg xxsm:text-sm md:text-lg font-semibold hover:bg-blue-600 transition duration-300"
            >
              Get Started
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-2 mt-16 bg-gray-800 text-white">
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Left Section for Text */}
          <p className="xxsm:text-[10px] xsm:text-[11.5px] sm:text-[13px] md:text-sm">
            © 2025 Attendance Monitoring System. All rights reserved.
          </p>

          {/* Right Section for Icons */}
          <div className="hidden md:flex xxsm:gap-2 md:gap-4">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-700 transition duration-300"
            >
              <FaLinkedin size={20} />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-700 transition duration-300"
            >
              <FaGithub size={20} />
            </a>
          </div>
        </div>
      </footer>

      {/* Sign In / Sign Up Modal */}
      {isModalOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white p-8 rounded-lg max-w-md w-full mx-4 shadow-2xl border-4 border-blue-500"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end">
              <button onClick={closeModal}>
                <IoCloseSharp className="text-black text-3xl hover:text-red-500 duration-200 ease-in-out" />
              </button>
            </div>

            {/* Sign In Modal */}
            {modalType === "signin" && (
              <div>
                <h2 className="text-3xl font-bold mb-6 text-center">Sign In</h2>
                <form onSubmit={handleSignInSubmit} className="sign-in-form">
                  <label className="block mb-2 text-sm font-semibold">
                    Role
                    <select
                      name="role"
                      required
                      className="w-full px-4 py-2 border rounded-lg mb-4"
                      aria-label="Select your role"
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="" disabled>
                        Select Role
                      </option>
                      <option value="teacher">Teacher</option>
                      <option value="student">Student</option>
                    </select>
                  </label>

                  <label className="block mb-2 text-sm font-semibold">
                    Email
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full px-4 py-2 border rounded-lg mb-4"
                      aria-label="Enter your email"
                    />
                  </label>

                  <label className="block mb-2 text-sm font-semibold">
                    Password
                    <input
                      type="password"
                      name="password"
                      required
                      className="w-full px-4 py-2 border rounded-lg mb-4"
                      aria-label="Enter your password"
                    />
                  </label>

                  <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300 font-semibold"
                  >
                    Sign In
                  </button>
                </form>

                <div className="text-center mt-4">
                  <p className="text-sm">
                    Don’t have an account?{" "}
                    <button
                      onClick={() => openModal("signup")}
                      className="text-blue-500 hover:underline font-semibold"
                    >
                      Sign up now!
                    </button>
                  </p>
                  <p className="text-sm mt-2">
                    <button
                      onClick={() => openModal("forgotPassword")}
                      className="text-blue-500 hover:underline font-semibold"
                    >
                      Forgot Password?
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* Sign Up Modal */}
            {modalType === "signup" && (
              <div>
                <h2 className="text-3xl font-bold mb-6 text-center">Sign Up</h2>
                <form onSubmit={handleSignUpSubmit} className="sign-up-form">
                  <label className="block mb-2 text-sm font-semibold">
                    Role
                    <select
                      name="role"
                      className="w-full px-4 py-2 border rounded-lg mb-4"
                      required
                      aria-label="Select your role"
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="" disabled>
                        Select Role
                      </option>
                      <option value="teacher">Teacher</option>
                      <option value="student">Student</option>
                    </select>
                  </label>

                  {role === "student" && (
                    <label className="block mb-2 text-sm font-semibold">
                      Student Number
                      <input
                        type="text"
                        placeholder="Student Number"
                        name="student-number"
                        className="w-full px-4 py-2 mb-4 border rounded-lg"
                        required
                        aria-label="Enter your student number"
                      />
                    </label>
                  )}

                  <label className="block mb-2 text-sm font-semibold">
                    Fullname
                    <input
                      type="text"
                      name="name"
                      placeholder="Fullname"
                      className="w-full px-4 py-2 mb-4 border rounded-lg"
                      required
                      aria-label="Enter your fullname"
                    />
                  </label>

                  <label className="block mb-2 text-sm font-semibold">
                    Email
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      className="w-full px-4 py-2 mb-4 border rounded-lg"
                      required
                      aria-label="Enter your email"
                    />
                  </label>

                  <label className="block mb-2 text-sm font-semibold">
                    Password
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      className="w-full px-4 py-2 mb-4 border rounded-lg"
                      required
                      aria-label="Enter your password"
                    />
                  </label>

                  <label className="block mb-2 text-sm font-semibold">
                    Confirm Password
                    <input
                      type="password"
                      name="confirm-password"
                      placeholder="Confirm Password"
                      className="w-full px-4 py-2 mb-4 border rounded-lg"
                      required
                      aria-label="Re-enter your password"
                    />
                  </label>

                  <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300 font-semibold"
                  >
                    Sign Up
                  </button>
                </form>

                {/* Additional Links */}
                <div className="text-center mt-4">
                  <p className="text-sm">
                    Already have an account?{" "}
                    <button
                      onClick={() => openModal("signin")}
                      className="text-blue-500 hover:underline font-semibold"
                    >
                      Sign in now!
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* Forgot Password Modals */}
            {modalType === "forgotPassword" && (
              <div>
                <h2 className="text-3xl font-bold mb-6 text-center">
                  Forgot Password
                </h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const email = e.target.email.value;
                    handleForgotPassword(email);
                  }}
                >
                  {" "}
                  <label className="block mb-2 text-sm font-semibold">
                    Email
                    <input
                      type="email"
                      placeholder="Enter your registered email"
                      className="w-full px-4 py-2 mb-4 border rounded-lg"
                      required
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => openModal("resetCode")}
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300 font-semibold"
                  >
                    Send Verification Code
                  </button>
                </form>
              </div>
            )}
            {modalType === "resetCode" && (
              <div>
                <h2 className="text-3xl font-bold mb-6 text-center">
                  Verification Code
                </h2>
                <form>
                  <label className="block mb-2 text-sm font-semibold">
                    Code
                    <input
                      type="text"
                      placeholder="Enter the verification code"
                      className="w-full px-4 py-2 mb-4 border rounded-lg"
                      required
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => openModal("resetPassword")}
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300 font-semibold"
                  >
                    Verify Code
                  </button>
                </form>
              </div>
            )}
            {modalType === "resetPassword" && (
              <div>
                <h2 className="text-3xl font-bold mb-6 text-center">
                  Reset Password
                </h2>
                <form>
                  <label className="block mb-2 text-sm font-semibold">
                    New Password
                    <input
                      type="password"
                      placeholder="Enter new password"
                      className="w-full px-4 py-2 mb-4 border rounded-lg"
                      required
                    />
                  </label>
                  <label className="block mb-2 text-sm font-semibold">
                    Confirm Password
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full px-4 py-2 mb-4 border rounded-lg"
                      required
                    />
                  </label>
                  <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300 font-semibold"
                  >
                    Reset Password
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
