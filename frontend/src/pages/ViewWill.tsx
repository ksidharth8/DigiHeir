import React, { useEffect, useState, useCallback } from "react";
import { useWeb3 } from "../context/Web3Context";
import { getFromIPFS } from "../services/ipfs";
import { ethers } from "ethers";

interface WillData {
  ipfsHash: string;
  lastActivity: Date;
  inactivityPeriod: number;
  exists: boolean;
}

interface BeneficiaryData {
  addr: string;
  share: number;
  exists: boolean;
}

const ViewWill: React.FC = () => {
  const { contract, account } = useWeb3();
  const [willData, setWillData] = useState<WillData | null>(null);
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryData[]>([]);
  const [document, setDocument] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWillData = useCallback(async () => {
    if (!contract || !account) return;

    try {
      setLoading(true);
      setError(null);

      const will = await contract.wills(account);
      if (will.exists) {
        setWillData({
          ipfsHash: will.ipfsHash,
          lastActivity: new Date(Number(will.lastActivity) * 1000),
          inactivityPeriod: Number(will.inactivityPeriod),
          exists: true,
        });

        // Load document from IPFS
        const doc = await getFromIPFS(will.ipfsHash);
        setDocument(doc);

        // Load beneficiaries
        const count = await contract.beneficiaryCount(account);
        const beneficiaryData: BeneficiaryData[] = [];
        
        for (let i = 0; i < Number(count); i++) {
          const beneficiary = await contract.beneficiaries(account, i.toString());
          if (beneficiary.exists) {
            beneficiaryData.push({
              addr: beneficiary.addr,
              share: Number(beneficiary.share),
              exists: true,
            });
          }
        }
        
        setBeneficiaries(beneficiaryData);
      }
    } catch (error) {
      console.error("Error loading will data:", error);
      setError("Failed to load will data");
    } finally {
      setLoading(false);
    }
  }, [contract, account]);

  useEffect(() => {
    if (contract && account) {
      loadWillData();
    }
  }, [contract, account, loadWillData]);

  const handleExecuteWill = async () => {
    if (!contract || !account) return;

    try {
      setLoading(true);
      setError(null);

      const tx = await contract.executeWill(account);
      await tx.wait();

      alert("Will executed successfully!");
      loadWillData();
    } catch (error) {
      console.error("Error executing will:", error);
      setError("Failed to execute will");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInactivityPeriod = async (newPeriod: number) => {
    if (!contract || !account) return;

    try {
      setLoading(true);
      setError(null);

      const tx = await contract.updateInactivityPeriod(newPeriod);
      await tx.wait();

      alert("Inactivity period updated successfully!");
      loadWillData();
    } catch (error) {
      console.error("Error updating inactivity period:", error);
      setError("Failed to update inactivity period");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-center mb-4">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!willData) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-center mb-4">No will found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Your Digital Will</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Document</h3>
            {document && (
              <div className="mt-2">
                <a
                  href={URL.createObjectURL(document)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  View Document
                </a>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">Last Activity</h3>
            <p className="mt-1 text-gray-600">
              {willData.lastActivity.toLocaleString()}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">Inactivity Period</h3>
            <div className="mt-2 flex items-center space-x-4">
              <p className="text-gray-600">
                {Math.floor(willData.inactivityPeriod / 86400)} days
              </p>
              <button
                onClick={() => handleUpdateInactivityPeriod(willData.inactivityPeriod * 2)}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Update
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">Beneficiaries</h3>
            <ul className="mt-2 space-y-2">
              {beneficiaries.map((beneficiary, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span className="text-gray-600">{beneficiary.addr}</span>
                  <span className="text-gray-900">{beneficiary.share}%</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4">
            <button
              onClick={handleExecuteWill}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Execute Will
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewWill; 