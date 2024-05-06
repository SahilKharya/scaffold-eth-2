/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from 'react';
import type { NextPage } from "next";
import { notification } from "~~/utils/scaffold-eth";
import { ipfsClient } from "../../utils/ipfs/ipfsClient";


const IpfsUpload: NextPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [description, setDescription] = useState('');
  const [mint_to, setMint_to] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);
  const [minting, setMinting] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [name, setName] = useState("")

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setFile(file);
      setMessage("File is ready to upload.");
    } else {
      setMessage("No file selected.");
    }
  };

  const uploadFileToIPFS = async () => {
    if (!file) {
      setMessage("No file selected to upload.");
      return;
    }

    setMessage("Uploading to IPFS...");
    const notificationId = notification.loading("Uploading to IPFS...");

    try {
      const added = await ipfsClient.add(file);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setImageUrl(url);
      notification.remove(notificationId);
      notification.success("Uploaded to IPFS");
      setMessage("File successfully uploaded to IPFS!");
    } catch (error) {
      notification.remove(notificationId);
      notification.error("Error uploading to IPFS");
      setMessage(`Error uploading file: ${error.message}`);
    }
  };

  const mintNFT = async (event) => {
    event.preventDefault();
    const notificationId = notification.loading("Minting NFT...");

    const metadataObj = { name, description, image: imageUrl, attributes: [] };
    const metadataJson = JSON.stringify(metadataObj);

    try {
      const { cid, path } = await ipfsClient.add(metadataJson);
      const tokenURI = path;
      await mintImage(tokenURI);
      notification.remove(notificationId);
      notification.success("Minted IPFS");
    } catch (error) {
      console.error("Minting Error:", error);
      notification.remove(notificationId);
      notification.success("Failed to mint NFT.");
    }
    setIsWaiting(false);
  };

  const mintImage = async (tokenURI) => {
    try {
      setMinting(true);
      const txResponse = await nftContract.safeMint(mint_to, tokenURI);
      await txResponse.wait();
      alert('NFT minted successfully!');
    } catch (error) {
      console.error('Failed to mint NFT:', error);
      alert('Minting failed. See the console for more details.');
    } finally {
      setMinting(false);
    }
  };

  return (
    <>
      <div className='form'>
        {!imageUrl ? (
          <div>
            <h1>IPFS uploader</h1>

            <input type="file" accept="image/*" onChange={handleFileChange} />
            <button onClick={uploadFileToIPFS}>Upload to IPFS</button>
            <p>{message}</p>
            {imageUrl && <p>File URL: <a href={imageUrl} target="_blank" rel="noopener noreferrer">{imageUrl}</a></p>}
          </div>

        ) : (
          <div className="form">
            <h1>NFT Minting Form</h1>
            <form onSubmit={mintNFT}>
              <label htmlFor="name">NFT Name:</label>
              <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />

              <label htmlFor="description">NFT Description:</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />

              <label htmlFor="imageUri">Image URL:</label>
              <p>{imageUrl}</p>

              <label htmlFor="mint_to">Eth Address to mint:</label>
              <input type="text" id="mint_to" value={mint_to} onChange={(e) => setMint_to(e.target.value)} required />

              <button type="submit" disabled={minting}>
                {minting ? 'Minting...' : 'Mint NFT'}
              </button>

              {metadata && (
                <div>
                  <h3>Generated Metadata:</h3>
                  <p>{metadata}</p>
                </div>
              )}
            </form>
          </div>
        )}

        <div className="image">
          {!isWaiting && imageUrl ? (
            <img src={imageUrl} alt="Uploaded image" />
          ) : isWaiting ? (
            <div className="image__placeholder">
              {/* <Spinner animation="border" /> */}
              <p>{message}</p>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>

    </>
  );
};

export default IpfsUpload;