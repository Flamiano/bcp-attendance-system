import React from 'react';
import { FaFacebook, FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa';

export const Footer = () => {
  return (
    <footer className="py-8 mt-16">
      <div className="container mx-auto px-4">
        {/* Bottom Section */}
        <div className="flex flex-col justify-between items-center text-center">
          <p className="text-sm text-gray-700 mb-4">
            © 2025 Attendance Monitoring System. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-white transition duration-300"
            >
              <FaLinkedin size={20} />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-white transition duration-300"
            >
              <FaGithub size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
