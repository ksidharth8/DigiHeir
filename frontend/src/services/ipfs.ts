import { create } from "ipfs-http-client";

const projectId = process.env.REACT_APP_INFURA_PROJECT_ID;
const projectSecret = process.env.REACT_APP_INFURA_PROJECT_SECRET;

// Create base64 encoded auth string
const auth = btoa(projectId + ":" + projectSecret);

const client = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: `Basic ${auth}`,
  },
});

export const uploadToIPFS = async (file: File): Promise<string> => {
  try {
    const added = await client.add(file);
    return added.path;
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw new Error("Failed to upload file to IPFS");
  }
};

export const getFromIPFS = async (hash: string): Promise<Blob> => {
  try {
    const stream = client.cat(hash);
    const chunks: Uint8Array[] = [];
    
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    
    return new Blob(chunks);
  } catch (error) {
    console.error("Error retrieving from IPFS:", error);
    throw new Error("Failed to retrieve file from IPFS");
  }
}; 