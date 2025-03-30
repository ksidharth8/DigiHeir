import React from "react";
import { Link } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";

const Navbar: React.FC = () => {
  const { account, connect } = useWeb3();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="text-xl font-bold text-indigo-600">
                DigiHeir
              </Link>
            </div>
            <div className="hidden md:block ml-[40rem]">
              <div className="flex items-center space-x-4">
                <Link to="/" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </Link>
                <Link to="/create" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                  Create Will
                </Link>
                <Link to="/view" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                  View Will
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            {account ? (
              <span className="text-sm text-gray-500">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            ) : (
              <button
                onClick={connect}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 