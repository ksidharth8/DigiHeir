import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { WillContract, WillABI } from "../contracts/Will";

interface Web3ContextType {
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  contract: WillContract | null;
  account: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const Web3Context = createContext<Web3ContextType>({
  provider: null,
  signer: null,
  contract: null,
  account: null,
  connect: async () => {},
  disconnect: () => {},
});

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<WillContract | null>(null);
  const [account, setAccount] = useState<string | null>(null);

  const connect = async () => {
    try {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const account = await signer.getAddress();

        const contract = new ethers.Contract(
          process.env.REACT_APP_CONTRACT_ADDRESS || "",
          WillABI,
          signer
        ) as WillContract;

        setProvider(provider);
        setSigner(signer);
        setContract(contract);
        setAccount(account);
      } else {
        alert("Please install MetaMask!");
      }
    } catch (error) {
      console.error("Error connecting to Web3:", error);
      alert("Failed to connect to Web3");
    }
  };

  const disconnect = () => {
    setProvider(null);
    setSigner(null);
    setContract(null);
    setAccount(null);
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setAccount(accounts[0]);
        }
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }
  }, []);

  return (
    <Web3Context.Provider value={{ provider, signer, contract, account, connect, disconnect }}>
      {children}
    </Web3Context.Provider>
  );
}; 