import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [showReceipt, setShowReceipt] = useState(false);
  const [transactionType, setTransactionType] = useState("");
  const [transactionAmount, setTransactionAmount] = useState(1);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const performTransaction = async () => {
    try {
      if (atm) {
        let tx;
        if (transactionType === "deposit") {
          tx = await atm.deposit(transactionAmount);
        } else if (transactionType === "withdraw") {
          tx = await atm.withdraw(transactionAmount);
        }

        if (tx) {
          await tx.wait();
          getBalance();
          setShowReceipt(true);
        } else {
          console.error("Transaction failed");
          // Handle the error or display a message to the user
        }
      }
    } catch (error) {
      console.error("Error during transaction:", error);
      // Handle the error or display a message to the user
    }
  };

  const viewReceipt = () => {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleString();

    alert(
      `Digital Receipt\nAccount Holder: Sannu\nTransaction Type: ${transactionType}\nTransaction Amount: ${transactionAmount} ETH\nDate and Time: ${formattedDate}\nCurrent Balance: ${balance} ETH`
    );

    setShowReceipt(false);
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return (
        <button onClick={connectAccount}>
          Please connect your Metamask wallet
        </button>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance} ETH</p>
        <div>
          <label>
            Enter Amount:
            <input
              type="number"
              value={transactionAmount}
              onChange={(e) => setTransactionAmount(e.target.value)}
            />
          </label>
        </div>
        <button
          onClick={() => {
            setTransactionType("deposit");
            performTransaction();
          }}
        >
          Deposit
        </button>
        <button
          onClick={() => {
            setTransactionType("withdraw");
            performTransaction();
          }}
        >
          Withdraw
        </button>
        {showReceipt && (
          <div>
            <p>Transaction successful! Would you like to view the receipt?</p>
            <button onClick={viewReceipt}>Yes</button>
            <button onClick={() => setShowReceipt(false)}>No</button>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome Hemanth!</h1>
        <h2>have a nice day</h2>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
          background-color: #2c3e50; /* Dark background color */
          color: #ffffff; /* White text color */
        }
      `}</style>
    </main>
  );
}
