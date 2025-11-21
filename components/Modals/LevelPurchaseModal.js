import { useState, useEffect, createElement } from "react";
import { useAccount } from "wagmi";
import { FiX, FiDollarSign, FiLoader, FiCheckCircle } from "react-icons/fi";
import { HiOutlineCube, HiOutlineChartBar } from "react-icons/hi";
import toast from "react-hot-toast";
import {
  useMatrixActions,
  useTokenData,
  useMatrixContract,
  useMatrixData,
  formatNumber,
  parseTokenAmount,
} from "../../hooks/useContract";

const LevelPurchaseModal = ({ isOpen, onClose, program }) => {
  const { address } = useAccount();
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [step, setStep] = useState(1); // 1: Select level, 2: Approve, 3: Purchase

  const { buyLevel, approveToken, buyLevelLoading, approveLoading } =
    useMatrixActions();
  const { tokenBalance, tokenAllowance, tokenSymbol } = useTokenData(address);
  const { levelCosts } = useMatrixContract();
  const { isLevelActive } = useMatrixData(address, program, selectedLevel);

  const programName = program === 1 ? "x4" : "xXx";
  const programIcon = program === 1 ? HiOutlineCube : HiOutlineChartBar;
  const programColor =
    program === 1 ? "from-blue-500 to-cyan-600" : "from-purple-500 to-pink-600";

  const levelCost = levelCosts[selectedLevel - 1]
    ? parseFloat(levelCosts[selectedLevel - 1]) / 10 ** 18
    : 0;
  const needsApproval = parseFloat(tokenAllowance) < levelCost;

  // Find next available level
  const getNextAvailableLevel = () => {
    for (let i = 1; i <= 12; i++) {
      // This would need to be checked against the contract
      // For now, we'll assume level 1 is available if not registered
      return i;
    }
    return 1;
  };

  useEffect(() => {
    if (isOpen && program) {
      setSelectedLevel(getNextAvailableLevel());
      setStep(1);
    }
  }, [isOpen, program]);

  const handleApprove = async () => {
    try {
      await approveToken(levelCost);
      setStep(3);
    } catch (error) {
      console.error("Approval failed:", error);
    }
  };

  const handlePurchase = async () => {
    try {
      await buyLevel(program, selectedLevel);
      onClose();
      toast.success(
        `${programName} Level ${selectedLevel} purchased successfully!`
      );
    } catch (error) {
      console.error("Purchase failed:", error);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(needsApproval ? 2 : 3);
    }
  };

  if (!isOpen || !program) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 bg-gradient-to-r ${programColor} rounded-lg flex items-center justify-center`}
              >
                {createElement(programIcon, {
                  className: "w-5 h-5 text-white",
                })}
              </div>
              <h2 className="text-2xl font-bold text-white">
                Upgrade {programName}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div
                    className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${
                      step >= stepNum
                        ? `bg-gradient-to-r ${programColor} text-white`
                        : "bg-white/20 text-white/60"
                    }
                  `}
                  >
                    {stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div
                      className={`w-8 h-0.5 mx-2 ${
                        step > stepNum
                          ? `bg-gradient-to-r ${programColor}`
                          : "bg-white/20"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Level Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-white text-sm font-medium mb-3">
                  Select Level
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(parseInt(e.target.value))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {[...Array(12)].map((_, i) => {
                    const level = i + 1;
                    const cost = levelCosts[i]
                      ? parseFloat(levelCosts[i]) / 10 ** 18
                      : 0;
                    return (
                      <option key={level} value={level} className="bg-gray-800">
                        Level {level} - {formatNumber(cost)} {tokenSymbol}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Level Info */}
              <div className="bg-white/5 rounded-lg p-4 space-y-3">
                <h3 className="text-white font-medium">
                  {programName} Level {selectedLevel}
                </h3>

                {program === 1 ? (
                  <div className="space-y-2">
                    <p className="text-white/80 text-sm">
                      Matrix Structure: 2x2 (6 positions)
                    </p>
                    <p className="text-white/80 text-sm">
                      • First line: 2 positions → Payment to upline
                    </p>
                    <p className="text-white/80 text-sm">
                      • Second line: 4 positions → Payment to you
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-white/80 text-sm">
                      Matrix Structure: 2+4+8 (14 positions)
                    </p>
                    <p className="text-white/80 text-sm">
                      • Line 1: 100% to upline
                    </p>
                    <p className="text-white/80 text-sm">
                      • Line 2: 30% to you, 70% to upline
                    </p>
                    <p className="text-white/80 text-sm">
                      • Line 3: 70% to you, 30% to upline
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-white/20">
                  <span className="text-white/70">Cost:</span>
                  <span className="text-white font-semibold">
                    {formatNumber(levelCost)} {tokenSymbol}
                  </span>
                </div>
              </div>

              {/* Warnings */}
              {isLevelActive && (
                <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <FiCheckCircle className="w-5 h-5 text-yellow-400" />
                    <p className="text-yellow-200 text-sm">
                      Level {selectedLevel} is already active
                    </p>
                  </div>
                </div>
              )}

              {parseFloat(tokenBalance) < levelCost && (
                <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-4">
                  <p className="text-red-200 text-sm">
                    Insufficient balance. You need{" "}
                    {formatNumber(levelCost - parseFloat(tokenBalance))} more{" "}
                    {tokenSymbol} tokens.
                  </p>
                </div>
              )}

              <button
                onClick={handleNext}
                disabled={isLevelActive || parseFloat(tokenBalance) < levelCost}
                className={`w-full bg-gradient-to-r ${programColor} text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Token Approval */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <FiDollarSign className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-white text-lg font-semibold mb-2">
                  Approve Tokens
                </h3>
                <p className="text-white/70 text-sm">
                  Approve the contract to spend your {tokenSymbol} tokens
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Level:</span>
                  <span className="text-white">
                    {programName} Level {selectedLevel}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Cost:</span>
                  <span className="text-white font-semibold">
                    {formatNumber(levelCost)} {tokenSymbol}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Your Balance:</span>
                  <span className="text-white">
                    {formatNumber(tokenBalance)} {tokenSymbol}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Current Allowance:</span>
                  <span className="text-white">
                    {formatNumber(tokenAllowance)} {tokenSymbol}
                  </span>
                </div>
              </div>

              <button
                onClick={handleApprove}
                disabled={approveLoading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {approveLoading ? (
                  <>
                    <FiLoader className="w-5 h-5 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  `Approve ${formatNumber(levelCost)} ${tokenSymbol}`
                )}
              </button>
            </div>
          )}

          {/* Step 3: Purchase */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${programColor} rounded-full flex items-center justify-center mx-auto mb-4`}
                >
                  {createElement(programIcon, {
                    className: "w-8 h-8 text-white",
                  })}
                </div>
                <h3 className="text-white text-lg font-semibold mb-2">
                  Purchase Level
                </h3>
                <p className="text-white/70 text-sm">
                  Ready to purchase {programName} Level {selectedLevel}
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Program:</span>
                  <span className="text-white font-semibold">
                    {programName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Level:</span>
                  <span className="text-white font-semibold">
                    {selectedLevel}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Cost:</span>
                  <span className="text-white font-semibold">
                    {formatNumber(levelCost)} {tokenSymbol}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePurchase}
                disabled={buyLevelLoading}
                className={`w-full bg-gradient-to-r ${programColor} text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
              >
                {buyLevelLoading ? (
                  <>
                    <FiLoader className="w-5 h-5 mr-2 animate-spin" />
                    Purchasing...
                  </>
                ) : (
                  `Purchase Level ${selectedLevel}`
                )}
              </button>
            </div>
          )}

          {/* Back button for steps 2-3 */}
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="w-full mt-3 text-white/70 hover:text-white transition-colors text-sm"
            >
              ← Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LevelPurchaseModal;
