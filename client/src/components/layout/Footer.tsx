import { Link } from "wouter";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">
              seek<span className="text-primary-400">withDami</span>
            </h3>
            <p className="text-gray-400 mb-4">
              Find your dream job with the platform that connects talented professionals with top companies.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white"
                aria-label="Facebook"
              >
                <FaFacebookF />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white"
                aria-label="Twitter"
              >
                <FaTwitter />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">For Job Seekers</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/jobs" className="text-gray-400 hover:text-white">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/auth?tab=register" className="text-gray-400 hover:text-white">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-white">
                  Job Alerts
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-white">
                  Career Advice
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-white">
                  Salary Calculator
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">For Employers</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/auth?tab=register&role=employer" className="text-gray-400 hover:text-white">
                  Post a Job
                </Link>
              </li>
              <li>
                <Link href="/dashboard/employer" className="text-gray-400 hover:text-white">
                  Employer Dashboard
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-white">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-white">
                  Recruitment Solutions
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-white">
                  Advertise with Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">About</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-white">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-white">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6 mt-6 text-sm text-gray-400 text-center">
          <p>&copy; {new Date().getFullYear()} Seek with Dami. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
