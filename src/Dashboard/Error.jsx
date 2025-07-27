import React from 'react';
import { Link } from 'react-router-dom';

function Error() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-2xl">
        {/* Error Illustration */}
        <div className="mb-8 mx-auto w-48 h-48">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FECACA" d="M40,-58.2C52.1,-48.8,62.3,-37.8,66.8,-24.9C71.3,-12,70.2,2.8,65.5,15.4C60.8,28,52.6,38.5,41.5,48.1C30.4,57.7,16.2,66.5,1.5,64.6C-13.2,62.7,-26.4,50.1,-39.1,39.7C-51.8,29.3,-64,21.1,-69.1,9.2C-74.2,-2.7,-72.2,-18.3,-63.4,-30.2C-54.6,-42.1,-39,-50.3,-24.8,-59.2C-10.6,-68.1,2.3,-77.7,15.5,-76.2C28.7,-74.7,42.2,-62.1,40,-58.2Z" transform="translate(100 100)" />
            <text x="100" y="110" fontFamily="Arial" fontSize="40" fontWeight="bold" textAnchor="middle" fill="#DC2626">404</text>
          </svg>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl font-bold text-red-600 mb-4">Page Not Found</h1>
        <p className="text-xl text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist or may have been moved.
        </p>

        {/* Helpful Actions */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors duration-200"
          >
            Return Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition-colors duration-200"
          >
            Go Back
          </button>
        </div>

        {/* Additional Help */}
        <div className="mt-10 text-sm text-gray-500">
          <p>If you believe this is an error, please contact <Link to="/contact" className='text-blue-400'>Support </Link> .</p>
         
        </div>
      </div>
    </div>
  );
}

export default Error;