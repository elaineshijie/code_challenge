import React, { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  AlertTriangle,
  ArrowUpDown,
  X,
} from "lucide-react";
import { CurrencyIcon } from "./utils";

const CryptoSwapForm = () => {
  interface Currency {
    currency: string;
    price: number;
    date: string;
  }

  interface ToastProps {
    message: string;
    type: "info" | "error" | "success";
    visible: boolean;
  }

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [sellAmount, setSellAmount] = useState("");
  const [buyAmount, setBuyAmount] = useState("");
  const [sellCurrency, setSellCurrency] = useState("");
  const [buyCurrency, setBuyCurrency] = useState("");
  const [sellValue, setSellValue] = useState(0);
  const [buyValue, setBuyValue] = useState(0);
  const [priceImpact, setPriceImpact] = useState(0);
  const [activeTab, setActiveTab] = useState("Swap");
  const [sellDropdownOpen, setSellDropdownOpen] = useState(false);
  const [buyDropdownOpen, setBuyDropdownOpen] = useState(false);
  const [toast, setToast] = useState<ToastProps>({
    message: "",
    type: "info",
    visible: false,
  });

  const sellDropdownRef = useRef<HTMLDivElement>(null);
  const buyDropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside dropdowns to close them
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sellDropdownRef.current &&
        !sellDropdownRef.current.contains(event.target as Node)
      ) {
        setSellDropdownOpen(false);
      }
      if (
        buyDropdownRef.current &&
        !buyDropdownRef.current.contains(event.target as Node)
      ) {
        setBuyDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    let toastTimer: NodeJS.Timeout;
    if (toast.visible) {
      toastTimer = setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      }, 5000);
    }
    return () => {
      if (toastTimer) clearTimeout(toastTimer);
    };
  }, [toast.visible]);

  // Show toast notification
  const showToast = (
    message: string,
    type: "info" | "error" | "success" = "info"
  ) => {
    setToast({
      message,
      type,
      visible: true,
    });
  };

  // Dismiss toast
  const dismissToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  // Fetch currency data from the JSON endpoint
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulating data fetch - replace this URL with your actual JSON endpoint
        const response = await fetch(
          "https://interview.switcheo.com/prices.json"
        );
        const data = await response.json();
        setCurrencies(data);

        // Set default currencies
        if (data.length >= 2) {
          setSellCurrency(data[0].currency);
          setBuyCurrency(data[1].currency);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching currency data:", error);
        // Mock data for demo purposes
        const mockData = [
          { currency: "GROK3", price: 0.000085, date: "2025-02-26" },
          { currency: "ETH", price: 2505.89, date: "2025-02-26" },
          { currency: "BTC", price: 96540.12, date: "2025-02-26" },
          { currency: "USDT", price: 1.0, date: "2025-02-26" },
          { currency: "LINK", price: 16.8, date: "2025-02-26" },
        ];
        setCurrencies(mockData);
        setSellCurrency("GROK3");
        setBuyCurrency("ETH");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate conversion when inputs change
  useEffect(() => {
    if (!sellAmount || !sellCurrency || !buyCurrency) return;

    const sellCurrencyData = currencies.find(
      (c) => c.currency === sellCurrency
    );
    const buyCurrencyData = currencies.find((c) => c.currency === buyCurrency);

    if (sellCurrencyData && buyCurrencyData) {
      const sellTokenPrice = sellCurrencyData.price;
      const buyTokenPrice = buyCurrencyData.price;

      const sellAmountNum = parseFloat(sellAmount);
      const totalSellValueUSD = sellAmountNum * sellTokenPrice;
      setSellValue(totalSellValueUSD);

      // Calculate how much of the buy currency we can get
      const calculatedBuyAmount = totalSellValueUSD / buyTokenPrice;
      const calculatedBuyString = calculatedBuyAmount.toString();
      const decimalIndex = calculatedBuyString.indexOf(".");

      if (decimalIndex !== -1) {
        const decimalPlaces = calculatedBuyString.length - decimalIndex - 1;

        if (decimalPlaces > 3) {
          const convertedBuyAmount = calculatedBuyAmount.toFixed(3);
          setBuyAmount(convertedBuyAmount);
        } else {
          const convertedBuyAmount = calculatedBuyAmount.toString();
          setBuyAmount(convertedBuyAmount);
        }
      }
      setBuyValue(totalSellValueUSD);

      // Calculate price impact (simplified)
      // In a real app, this would use order book depth or liquidity pools
      const impact =
        sellAmountNum > 1000000 ? -98.29 : sellAmountNum > 100000 ? -5.2 : -0.3;
      setPriceImpact(impact);
    }
  }, [sellAmount, sellCurrency, buyCurrency, currencies]);

  // Handle input changes
  const handleSellAmountChange = (e) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^0-9.]/g, "");
    setSellAmount(numericValue);

    // Only perform calculation if we have a valid number
    if (numericValue && !isNaN(parseFloat(numericValue))) {
      const sellCurrencyData = currencies.find(
        (c) => c.currency === sellCurrency
      );
      const buyCurrencyData = currencies.find(
        (c) => c.currency === buyCurrency
      );

      if (sellCurrencyData && buyCurrencyData) {
        const sellAmountNum = parseFloat(numericValue);
        const totalSellValueUSD = sellAmountNum * sellCurrencyData.price;
        setSellValue(totalSellValueUSD);

        // Calculate how much of the buy currency we can get
        const calculatedBuyAmount = totalSellValueUSD / buyCurrencyData.price;
        setBuyAmount(calculatedBuyAmount.toFixed(5));
        setBuyValue(totalSellValueUSD);

        // Calculate price impact (simplified)
        const impact =
          sellAmountNum > 1000000
            ? -98.29
            : sellAmountNum > 100000
            ? -5.2
            : -0.3;
        setPriceImpact(impact);
      }
    } else {
      // If input is empty or invalid, reset related values
      setSellValue(0);
      setBuyAmount("");
      setBuyValue(0);
      setPriceImpact(0);
    }
  };

  const handleBuyAmountChange = (e) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^0-9.]/g, "");
    setBuyAmount(numericValue);

    // Only perform reverse calculation if we have a valid number
    if (numericValue && !isNaN(parseFloat(numericValue))) {
      // Reverse calculation (from buy to sell)
      const buyCurrencyData = currencies.find(
        (c) => c.currency === buyCurrency
      );
      const sellCurrencyData = currencies.find(
        (c) => c.currency === sellCurrency
      );

      if (buyCurrencyData && sellCurrencyData) {
        const buyAmountNum = parseFloat(numericValue);
        const totalBuyValueUSD = buyAmountNum * buyCurrencyData.price;
        setBuyValue(totalBuyValueUSD);

        const calculatedSellAmount = totalBuyValueUSD / sellCurrencyData.price;
        setSellAmount(calculatedSellAmount.toFixed(3));
        setSellValue(totalBuyValueUSD);
      }
    } else {
      // If input is empty or invalid, reset related values
      setBuyValue(0);
      setSellAmount("");
      setSellValue(0);
    }
  };

  // Switch currencies
  const handleSwapCurrencies = () => {
    const tempCurrency = sellCurrency;
    const tempAmount = sellAmount;

    setSellCurrency(buyCurrency);
    setBuyCurrency(tempCurrency);

    setSellAmount(buyAmount);
    setBuyAmount(tempAmount);
  };

  // Handle currency selection
  const handleSelectSellCurrency = (currency: string) => {
    if (currency === buyCurrency) {
      // If selecting the same currency as buy, swap them
      setBuyCurrency(sellCurrency);
    }
    setSellCurrency(currency);
    setSellDropdownOpen(false);
  };

  const handleSelectBuyCurrency = (currency: string) => {
    if (currency === sellCurrency) {
      // If selecting the same currency as sell, swap them
      setSellCurrency(buyCurrency);
    }
    setBuyCurrency(currency);
    setBuyDropdownOpen(false);
  };

  // Handle wallet connection
  const handleConnectWallet = () => {
    showToast(
      "Wallet connection is not available at the moment. Please try again later.",
      "info"
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 relative">
      {/* Toast notification */}
      {toast.visible && (
        <div
          className={`fixed bottom-10 right-4 left-4 z-50 rounded-lg shadow-lg px-4 py-3 flex items-center justify-between
          ${
            toast.type === "error"
              ? "bg-red-100 text-red-800"
              : toast.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          <div className="flex-1">{toast.message}</div>
          <button onClick={dismissToast} className="ml-3 flex-shrink-0">
            <X size={20} />
          </button>
        </div>
      )}

      {/* Navigation tabs */}
      <div className="flex mb-6 bg-gray-100 rounded-full p-1">
        {["Swap", "Limit", "Send", "Buy"].map((tab) => (
          <button
            key={tab}
            className={`flex-1 py-2 rounded-full text-center ${
              activeTab === tab
                ? "bg-white font-semibold shadow-sm"
                : "text-gray-500"
            }`}
            onClick={() => {
              setActiveTab(tab);
              showToast(`${tab} feature not available at the moment.`, "info");
            }}
          >
            {tab}
          </button>
        ))}
      </div>


      {/* Sell section */}
      <div className="bg-white rounded-3xl p-4 mb-2 border border-gray-100">
        <div className="text-gray-500 text-lg mb-2">Sell</div>
        <div className="flex items-center mb-2">
          <input
            type="text"
            value={sellAmount}
            onChange={handleSellAmountChange}
            className="text-4xl font-bold w-full bg-transparent outline-none"
            placeholder="0"
          />
          <div className="relative" ref={sellDropdownRef}>
            <button
              className="bg-gray-100 rounded-full py-2 px-4 flex items-center space-x-2 hover:shadow-md hover:cursor-pointer"
              onClick={() => setSellDropdownOpen(!sellDropdownOpen)}
            >
              {sellCurrency && (
                <>
                  <CurrencyIcon currency={sellCurrency} />
                  <span>{sellCurrency}</span>
                  <ChevronDown size={20} />
                </>
              )}
            </button>

            {/* Sell Currency Dropdown */}
            {sellDropdownOpen && (
              <div className="absolute -right-7 mt-2 w-48 bg-white rounded-xl shadow-lg z-50 py-2 border border-gray-100 max-h-64 overflow-y-auto">
                {currencies.map((curr) => (
                  <button
                    key={curr.currency}
                    className={`w-full text-left px-4 py-2 flex items-center space-x-2 hover:bg-gray-50 ${
                      curr.currency === sellCurrency ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handleSelectSellCurrency(curr.currency)}
                  >
                    <CurrencyIcon currency={curr.currency} />
                    <span>{curr.currency}</span>
                    {curr.currency === buyCurrency && (
                      <span className="text-xs text-gray-500 ml-auto">
                        (Buy)
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="text-gray-500">
          $
          {sellValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      </div>

      {/* Swap button */}
      <div className="flex justify-center -my-4 relative z-10">
        <button
          onClick={handleSwapCurrencies}
          className="bg-white rounded-full p-3 border border-gray-100 shadow-sm hover:cursor-pointer hover:bg-gray-50"
        >
          <ArrowUpDown size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Buy section */}
      <div className="bg-gray-50 rounded-3xl p-4 mt-2">
        <div className="text-gray-500 text-lg mb-2">Buy</div>
        <div className="flex items-center mb-2">
          <input
            type="text"
            value={buyAmount}
            onChange={handleBuyAmountChange}
            className="text-4xl font-bold w-full bg-transparent outline-none"
            placeholder="0"
          />
          <div className="relative" ref={buyDropdownRef}>
            <button
              className="bg-white rounded-full py-2 px-4 flex items-center space-x-2 hover:shadow-md hover:cursor-pointer"
              onClick={() => setBuyDropdownOpen(!buyDropdownOpen)}
            >
              {buyCurrency && (
                <>
                  <CurrencyIcon currency={buyCurrency} />
                  <span>{buyCurrency}</span>
                  <ChevronDown size={20} />
                </>
              )}
            </button>

            {/* Buy Currency Dropdown */}
            {buyDropdownOpen && (
              <div className="absolute -right-7 mt-2 w-48 bg-white rounded-xl shadow-lg z-50 py-2 border border-gray-100 max-h-64 overflow-y-auto">
                {currencies.map((curr) => (
                  <button
                    key={curr.currency}
                    className={`w-full text-left px-4 py-2 flex items-center space-x-2 hover:bg-gray-50 ${
                      curr.currency === buyCurrency ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handleSelectBuyCurrency(curr.currency)}
                  >
                    <CurrencyIcon currency={curr.currency} />
                    <span>{curr.currency}</span>
                    {curr.currency === sellCurrency && (
                      <span className="text-xs text-gray-500 ml-auto">
                        (Sell)
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="text-gray-500">
          $
          {buyValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      </div>

      {/* Connect wallet button */}
      <button
        className="w-full bg-purple-100 text-purple-500 font-semibold py-4 rounded-2xl mt-4 hover:bg-purple-200 transition-colors"
        onClick={handleConnectWallet}
      >
        Connect wallet
      </button>

      {/* Fee and price impact info */}
      <div className="flex justify-between mt-4 text-sm">
        <div className="flex items-center text-red-500">
          <AlertTriangle size={20} className="mr-1" />
          <span>Very high price impact ({priceImpact.toFixed(2)}%)</span>
        </div>
        <div className="flex items-center">
          <span>$0.30</span>
          <ChevronDown size={20} className="ml-1" />
        </div>
      </div>
    </div>
  );
};

export default CryptoSwapForm;
