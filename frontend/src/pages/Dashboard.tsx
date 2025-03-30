import React from "react";
import { Link } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";

const Dashboard: React.FC = () => {
  const { account, connect, disconnect } = useWeb3();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">DigiHeir</span>
            <span className="block text-indigo-600">Digital Will & Inheritance System</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Secure your digital assets and ensure they are distributed according to your wishes using blockchain technology.
          </p>
        </div>

        <div className="mt-10">
          {!account ? (
            <div className="text-center">
              <button
                onClick={connect}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Connect Wallet
              </button>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">Create Will</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Create a new digital will and specify your beneficiaries.
                  </p>
                  <div className="mt-6">
                    <Link
                      to="/create"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Create New Will
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">View Will</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    View and manage your existing digital will.
                  </p>
                  <div className="mt-6">
                    <Link
                      to="/view"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      View Your Will
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">Account</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Connected: {account.slice(0, 6)}...{account.slice(-4)}
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={disconnect}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Disconnect Wallet
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 