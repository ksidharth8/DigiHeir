import React, { useState } from "react";
import { useWeb3 } from "../context/Web3Context";
import { uploadToIPFS } from "../services/ipfs";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";

interface Beneficiary {
  address: string;
  share: number;
}

const CreateWill: React.FC = () => {
  const { contract, account } = useWeb3();
  const [file, setFile] = useState<File | null>(null);
  const [inactivityPeriod, setInactivityPeriod] = useState<number>(86400); // 1 day in seconds
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([{ address: "", share: 0 }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const addBeneficiary = () => {
    setBeneficiaries([...beneficiaries, { address: "", share: 0 }]);
  };

  const updateBeneficiary = (index: number, field: keyof Beneficiary, value: string) => {
    const newBeneficiaries = [...beneficiaries];
    newBeneficiaries[index] = {
      ...newBeneficiaries[index],
      [field]: field === "share" ? parseInt(value) : value,
    };
    setBeneficiaries(newBeneficiaries);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !file || !account) return;

    try {
      setLoading(true);
      setError(null);

      // Validate beneficiary address
      if (!ethers.utils.isAddress(beneficiaries[0].address)) {
        throw new Error("Invalid beneficiary address format");
      }

      // Get current timestamp in seconds
      const currentTimestamp = Math.floor(Date.now() / 1000);
      
      // Convert inactivity period to number and validate
      const inactivitySeconds = Number(inactivityPeriod);
      if (isNaN(inactivitySeconds) || inactivitySeconds <= 0) {
        throw new Error("Invalid inactivity period");
      }

      // Calculate activation timestamp
      const activationTimestamp = currentTimestamp + inactivitySeconds;

      console.log("Creating will with params:", {
        beneficiaries: beneficiaries.map(b => b.address),
        activationTimestamp,
        currentTimestamp,
        inactivitySeconds
      });

      // Validate description
      if (!file) {
        throw new Error("Please select a file to upload");
      }

      // Upload file to IPFS
      const ipfsHash = await uploadToIPFS(file);

      // Create will
      const tx = await contract.createWill(
        beneficiaries[0].address,
        activationTimestamp
      );
      
      console.log("Transaction sent:", tx.hash);
      await tx.wait();
      console.log("Transaction confirmed");

      // Add beneficiaries
      for (const beneficiary of beneficiaries) {
        if (beneficiary.address && beneficiary.share > 0) {
          const tx = await contract.addBeneficiary(beneficiary.address, beneficiary.share);
          await tx.wait();
        }
      }

      setSuccess("Will created successfully! You can add documents later.");
      setTimeout(() => {
        navigate("/view");
      }, 2000);
    } catch (err: any) {
      let errorMessage = "Failed to create will. ";
      console.error("Detailed error:", err);

      if (err.message.includes("Invalid beneficiary")) {
        errorMessage += "Please enter a valid Ethereum address for the beneficiary.";
      } else if (err.message.includes("Invalid inactivity")) {
        errorMessage += "Please enter a valid inactivity period in seconds.";
      } else if (err.message.includes("Will already exists")) {
        errorMessage += "You already have an active will.";
      } else if (err.code === "ACTION_REJECTED") {
        errorMessage += "Transaction was rejected in your wallet.";
      } else if (err.message.includes("insufficient funds")) {
        errorMessage += "You don't have enough ETH to create the will.";
      } else if (err.message.includes("network changed")) {
        errorMessage += "Network connection changed. Please check your wallet connection.";
      } else if (err.message.includes("Failed to get contract")) {
        errorMessage += "Smart contract connection failed. Please check your network connection.";
      } else if (err.message.includes("Failed to upload")) {
        errorMessage += "Will created successfully, but file upload failed. You can add documents later.";
      } else {
        errorMessage += `Error: ${err.message || "Unknown error occurred"}`;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-center mb-4">Please connect your wallet</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Create Digital Will</h2>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Inactivity Period (seconds)
            </label>
            <input
              type="number"
              value={inactivityPeriod}
              onChange={(e) => setInactivityPeriod(parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Beneficiaries
            </label>
            {beneficiaries.map((beneficiary, index) => (
              <div key={index} className="flex space-x-4 mb-4">
                <input
                  type="text"
                  placeholder="Beneficiary Address"
                  value={beneficiary.address}
                  onChange={(e) => updateBeneficiary(index, "address", e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
                <input
                  type="number"
                  placeholder="Share (%)"
                  value={beneficiary.share}
                  onChange={(e) => updateBeneficiary(index, "share", e.target.value)}
                  className="w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addBeneficiary}
              className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
            >
              + Add Beneficiary
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? "Creating..." : "Create Will"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateWill; 