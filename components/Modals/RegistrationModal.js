import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import { FiX, FiUser, FiDollarSign, FiLoader } from "react-icons/fi";
import { HiOutlineCube, HiOutlineChartBar } from "react-icons/hi";
import toast from "react-hot-toast";
import {
  useMatrixActions,
  useTokenData,
  useMatrixContract,
  formatNumber,
} from "../../hooks/useContract";

const ADMIN = process.env.NEXT_PUBLIC_ADMIN;

const RegistrationModal = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { address } = useAccount();
  const [referrerAddress, setReferrerAddress] = useState("");
  const [step, setStep] = useState(1); // 1: Enter referrer, 2: Approve tokens, 3: Register

  const { register, approveToken, registerLoading, approveLoading } =
    useMatrixActions();
  const { tokenBalance, tokenAllowance, tokenSymbol } = useTokenData(address);
  const { levelCosts } = useMatrixContract();

  const registrationCost = levelCosts[0]
    ? (parseFloat(levelCosts[0]) / 10 ** 18) * 2
    : 10; // Level 1 cost * 2 programs
  const needsApproval = parseFloat(tokenAllowance) < registrationCost;

  // Check if using admin as referrer
  const isUsingAdmin = referrerAddress === ADMIN || !referrerAddress;

  // Get referrer from URL or use admin as fallback
  useEffect(() => {
    if (router.query.ref) {
      setReferrerAddress(router.query.ref);
    } else {
      setReferrerAddress(ADMIN);
    }
  }, [router.query.ref]);

  // Reset modal state when closed
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
    }
  }, [isOpen]);

  const handleApprove = async () => {
    try {
      await approveToken(registrationCost);
      setStep(3);
    } catch (error) {
      console.error("Approval failed:", error);
    }
  };

  const handleRegister = async () => {
    const finalReferrer = referrerAddress || ADMIN;

    try {
      await register(finalReferrer);
      onClose();
      toast.success("Registration successful! Welcome to LinkTum Matrix!");
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      // If no referrer is provided and we're showing the input, use admin
      if (!referrerAddress && !isUsingAdmin) {
        setReferrerAddress(ADMIN);
      }
      setStep(needsApproval ? 2 : 3);
    }
  };

  if (!isOpen) return null;

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
            <h2 className="text-2xl font-bold text-white">
              Join LinkTum Matrix
            </h2>
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
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
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
                          ? "bg-gradient-to-r from-purple-500 to-pink-500"
                          : "bg-white/20"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Referrer Address */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Only show referrer input if not using admin */}
              {!isUsingAdmin && (
                <div>
                  <label className="block text-white text-sm font-medium mb-3">
                    Referrer Address
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                    <input
                      type="text"
                      value={referrerAddress}
                      onChange={(e) => setReferrerAddress(e.target.value)}
                      placeholder="0x..."
                      className="w-full bg-white/10 border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-white/60 text-xs mt-2">
                    Enter the address of the person who referred you
                  </p>
                </div>
              )}

              {/* Show admin referrer info when using admin */}
              {isUsingAdmin && (
                <div className="bg-blue-500/20 border border-blue-500/40 rounded-lg p-4">
                  <h3 className="text-blue-200 font-medium mb-2">
                    Direct Registration
                  </h3>
                  <p className="text-blue-200/80 text-sm">
                    You're registering directly with the platform. You'r just
                    few click away.
                  </p>
                </div>
              )}

              <div className="bg-white/5 rounded-lg p-4 space-y-3">
                <h3 className="text-white font-medium">
                  Registration includes:
                </h3>
                <div className="flex items-center space-x-3">
                  <HiOutlineCube className="w-5 h-5 text-blue-400" />
                  <span className="text-white/80 text-sm">
                    x4 Matrix Level 1
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <HiOutlineChartBar className="w-5 h-5 text-purple-400" />
                  <span className="text-white/80 text-sm">
                    xXx Matrix Level 1
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/20">
                  <span className="text-white/70">Total Cost:</span>
                  <span className="text-white font-semibold">
                    {formatNumber(registrationCost)} {tokenSymbol}
                  </span>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
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
                  You need to approve the contract to spend your {tokenSymbol}{" "}
                  tokens
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Your Balance:</span>
                  <span className="text-white">
                    {formatNumber(tokenBalance)} {tokenSymbol}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Required:</span>
                  <span className="text-white font-semibold">
                    {formatNumber(registrationCost)} {tokenSymbol}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Current Allowance:</span>
                  <span className="text-white">
                    {formatNumber(tokenAllowance)} {tokenSymbol}
                  </span>
                </div>
              </div>

              {parseFloat(tokenBalance) < registrationCost && (
                <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-4">
                  <p className="text-red-200 text-sm">
                    Insufficient balance. You need{" "}
                    {formatNumber(registrationCost - parseFloat(tokenBalance))}{" "}
                    more {tokenSymbol} tokens.
                  </p>
                </div>
              )}

              <button
                onClick={handleApprove}
                disabled={
                  approveLoading || parseFloat(tokenBalance) < registrationCost
                }
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {approveLoading ? (
                  <>
                    <FiLoader className="w-5 h-5 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  `Approve ${formatNumber(registrationCost)} ${tokenSymbol}`
                )}
              </button>
            </div>
          )}

          {/* Step 3: Registration */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiOutlineCube className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white text-lg font-semibold mb-2">
                  Complete Registration
                </h3>
                <p className="text-white/70 text-sm">
                  You're ready to join the LinkTum Matrix!
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">
                    {isUsingAdmin ? "Registration Type:" : "Referrer:"}
                  </span>
                  <span className="text-white font-mono text-sm">
                    {isUsingAdmin
                      ? "Direct"
                      : `${referrerAddress.slice(
                          0,
                          6
                        )}...${referrerAddress.slice(-4)}`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Cost:</span>
                  <span className="text-white font-semibold">
                    {formatNumber(registrationCost)} {tokenSymbol}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Programs:</span>
                  <span className="text-white">x4 + xXx Level 1</span>
                </div>
              </div>

              <button
                onClick={handleRegister}
                disabled={registerLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {registerLoading ? (
                  <>
                    <FiLoader className="w-5 h-5 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Complete Registration"
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

export default RegistrationModal;
