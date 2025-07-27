import React from "react";
import { FaInstagram, FaWhatsapp, FaLinkedin, FaGithub } from "react-icons/fa";
import { AiOutlineMail, AiOutlinePhone } from "react-icons/ai";

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Brand */}
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">
              Code Eagles
            </h1>
            <p className="text-gray-400">Empowering developers worldwide</p>
          </div>

          {/* Social Icons */}
          <div className="flex space-x-6">
            <a
              href="https://www.instagram.com/code_eagles?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-pink-500 transition-colors duration-200"
              aria-label="Instagram"
            >
              <FaInstagram size={24} />
            </a>
            <a
              href="https://wa.me/201033705805"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-green-500 transition-colors duration-200"
              aria-label="WhatsApp"
            >
              <FaWhatsapp size={24} />
            </a>
            {/* <a
              href="https://www.linkedin.com/in/ahmed-amer-884242289?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
              aria-label="LinkedIn"
            >
              <FaLinkedin size={24} />
            </a> */}
            {/* <a
              href="https://github.com/yourusername"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-gray-100 transition-colors duration-200"
              aria-label="GitHub"
            >
              <FaGithub size={24} />
            </a> */}
          </div>

          {/* Contact Info */}
          <div className="flex flex-col space-y-3 text-center md:text-right">
            <div className="flex items-center justify-center md:justify-end space-x-2">
              <AiOutlineMail className="text-blue-400" size={20} />
              <a
                href="mailto:contact@codeeagles653.com"
                className="text-gray-300 hover:text-white transition-colors duration-200"
              >
                contact@codeeagles653.com
              </a>
            </div>
            <div className="flex items-center justify-center md:justify-end space-x-2">
              <AiOutlinePhone className="text-blue-400" size={20} />
              <a
                href="tel:+201033705805"
                className="text-gray-300 hover:text-white transition-colors duration-200"
              >
                +20 103 370 5805
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} Code Eagles. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Building the future of tech education
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;