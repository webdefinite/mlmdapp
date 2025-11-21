import { useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import {
  FiMenu,
  FiX,
  FiHome,
  FiUsers,
  FiTrendingUp,
  FiSettings,
  FiLogOut,
  FiExternalLink,
} from "react-icons/fi";
import { MdAdminPanelSettings } from "react-icons/md";

import {
  HiOutlineCube,
  HiOutlineChartBar,
  HiOutlineUserGroup,
} from "react-icons/hi";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  useMatrixContract,
  useUserData,
  useTokenData,
} from "../../hooks/useContract";
import { truncateAddress, formatNumber } from "../../hooks/useContract";

// Import your ABI
const MATRIX_ABI =
  require("../../web3/artifacts/contracts/LinkTumMatrix.sol/LinkTumMatrix.json").abi;

const MATRIX_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_LINKTUM_MATRIX_CONTRACT;

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const router = useRouter();

  const { totalUsers, totalTurnover, contractActive } = useMatrixContract();
  const { userInfo, isRegistered } = useUserData(address);
  const { tokenBalance, tokenSymbol } = useTokenData(address);

  const navigation = [
    { name: "Dashboard", href: "/", icon: FiHome },
    { name: "Matrix x4", href: "/matrix/x4", icon: HiOutlineCube },
    { name: "Matrix xXx", href: "/matrix/xxx", icon: HiOutlineChartBar },
    { name: "My Team", href: "/team", icon: HiOutlineUserGroup },
    { name: "Statistics", href: "/stats", icon: FiTrendingUp },
  ];

  const isActive = (href) => router.pathname === href;

  // Contract data
  const { data: owner } = useReadContract({
    address: MATRIX_CONTRACT_ADDRESS,
    abi: MATRIX_ABI,
    functionName: "owner",
  });

  // Check if current user is the owner
  const isOwner =
    address && owner && address.toLowerCase() === owner.toLowerCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white/10 backdrop-blur-xl border-r border-white/20
        transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <HiOutlineCube className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-lg">
                {process.env.NEXT_PUBLIC_APP_NAME || "LinkTum Matrix"}
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:text-gray-300"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                  ${
                    isActive(item.href)
                      ? "bg-white/20 text-white border border-white/30"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }
                `}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}

            {isOwner && (
              <Link
                key={"ADMIN"}
                href={"/admin"}
                className={`
                  flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                  ${
                    isActive("/admin")
                      ? "bg-white/20 text-white border border-white/30"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }
                `}
              >
                <MdAdminPanelSettings className="mr-3 h-5 w-5" />
                Admin
              </Link>
            )}
          </nav>

          {/* User Info */}
          {isConnected && (
            <div className="p-4 border-t border-white/20">
              <div className="bg-white/10 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Balance</span>
                  <span className="text-white font-semibold">
                    {formatNumber(tokenBalance)} {tokenSymbol}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Status</span>
                  <span
                    className={`text-sm font-medium ${
                      isRegistered ? "text-green-400" : "text-yellow-400"
                    }`}
                  >
                    {isRegistered ? "Active" : "Not Registered"}
                  </span>
                </div>
                {isRegistered && userInfo.id && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-sm">ID</span>
                    <span className="text-white font-semibold">
                      #{userInfo.id?.toString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contract Stats */}
          <div className="p-4 border-t border-white/20">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">Total Users</span>
                <span className="text-white">{formatNumber(totalUsers)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">Total Volume</span>
                <span className="text-white">
                  {formatNumber(totalTurnover)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">Status</span>
                <div
                  className={`w-2 h-2 rounded-full ${
                    contractActive ? "bg-green-400" : "bg-red-400"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-16 items-center justify-between bg-white/10 backdrop-blur-xl border-b border-white/20 px-4 sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-white hover:text-gray-300"
          >
            <FiMenu className="w-6 h-6" />
          </button>

          <div className="flex items-center space-x-4">
            {/* Network indicator */}
            <div className="hidden sm:flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-white text-sm font-medium">
                {process.env.NEXT_PUBLIC_CHAIN_NAME}
              </span>
            </div>

            {/* Connect button */}
            <ConnectButton
              chainStatus="icon"
              accountStatus={{
                smallScreen: "avatar",
                largeScreen: "full",
              }}
            />

            {/* Block explorer link */}
            {process.env.NEXT_PUBLIC_BLOCK_EXPLORER && (
              <a
                href={process.env.NEXT_PUBLIC_BLOCK_EXPLORER}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors"
              >
                <FiExternalLink className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
