import React from "react";
import { FaInstagram, FaWhatsapp, FaLinkedin } from "react-icons/fa";
import { AiOutlineMail, AiOutlinePhone } from "react-icons/ai";

function Footer() {
  return (
    <footer className="bg-dark text-white py-4 mt-5">
      <div className="container">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
          <h1 className="mb-3 mb-md-0">Code Eagles</h1>
          <div className="social-icons mb-4 mb-md-0 d-flex justify-content-center">
            <a
              href="https://www.instagram.com/ahmed_3amer118/profilecard/?igsh=dnc3dmRsazhjY21k"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white mx-2"
            >
              <FaInstagram size={30} />
            </a>
            <a
              href="https://wa.me/201033705805"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white mx-2"
            >
              <FaWhatsapp size={30} />
            </a>
            <a
              href="https://www.linkedin.com/in/ahmed-amer-884242289?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white mx-2"
            >
              <FaLinkedin size={30} />
            </a>
          </div>
          <div className="contact-info mb-4 d-flex flex-column align-items-center">
            <div className="d-flex justify-content-center mb-2">
              <AiOutlineMail size={20} className="me-2" />
              <a href="mailto:codeeagles.com" className="text-white">
                codeeagles.com
              </a>
            </div>
            <div className="d-flex justify-content-center">
              <AiOutlinePhone size={20} className="me-2" />
              <a href="tel:+201033705805" className="text-white">
                +20 103 370 5805
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-4 border-top pt-3">
        <p className="mb-0">
          &copy; {new Date().getFullYear()} Code Eagles. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
