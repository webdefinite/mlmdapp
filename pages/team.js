import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
  FiUsers,
  FiTrendingUp,
  FiEye,
  FiCopy,
  FiShare2,
  FiSearch,
  FiDollarSign,
  FiLoader,
} from "react-icons/fi";
import {
  HiOutlineCube,
  HiOutlineChartBar,
  HiOutlineUserGroup,
  HiOutlineStar,
} from "react-icons/hi";
import { BiNetworkChart } from "react-icons/bi";
import toast from "react-hot-toast";
import Layout from "../components/Layout/Layout";
import StatsCard from "../components/Cards/StatsCard";
import {
  useUserData,
  useTeamData,
  useContractEvents,
  formatNumber,
  truncateAddress,
} from "../hooks/useContract";

const TeamPage = () => {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProgram, setFilterProgram] = useState("all");
  const [referralLink, setReferralLink] = useState("");

  const { userInfo, isRegistered } = useUserData(address);
  const { teamData, loading: teamLoading } = useTeamData(address);
  const { recentEvents } = useContractEvents(address);

  // Generate referral link
  useEffect(() => {
    if (address) {
      const baseUrl =
        typeof window !== "undefined" ? window.location.origin : "";
      setReferralLink(`${baseUrl}/?ref=${address}`);
    }
  }, [address]);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied to clipboard!");
  };

  const shareReferralLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join LinkTum Matrix",
          text: "Join me on LinkTum Matrix and start earning!",
          url: referralLink,
        });
      } catch (err) {
        copyReferralLink();
      }
    } else {
      copyReferralLink();
    }
  };

  const teamOverviewStats = [
    {
      title: "Direct Referrals",
      value: teamData.teamStats.directReferrals || 0,
      icon: FiUsers,
      color: "from-blue-500 to-cyan-600",
      change: `+${teamData.teamStats.thisMonthReferrals || 0} this month`,
    },
    {
      title: "Total Network",
      value: teamData.teamStats.totalNetwork || 0,
      icon: BiNetworkChart,
      color: "from-purple-500 to-pink-600",
      description: "All levels combined",
    },
    {
      title: "Team Earnings",
      value: `${formatNumber(
        teamData.teamStats.totalTeamEarnings || 0
      )} LINKTUM`,
      icon: FiDollarSign,
      color: "from-green-500 to-emerald-600",
      change: "+15.2%",
    },
    {
      title: "Active Members",
      value: `${teamData.teamStats.activeMembers || 0}/${
        teamData.teamStats.totalNetwork || 0
      }`,
      icon: HiOutlineStar,
      color: "from-orange-500 to-red-600",
      description: "Active this month",
    },
  ];

  console.log(teamData);

  const filteredMembers = teamData.directReferrals.filter((member) => {
    const matchesSearch =
      member.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.id.toString().includes(searchTerm);
    const matchesProgram =
      filterProgram === "all" ||
      (filterProgram === "x4" && member.x4Levels > 0) ||
      (filterProgram === "xxx" && member.xxxLevels > 0);
    return matchesSearch && matchesProgram;
  });

  // Format recent events for display
  const formatActivityText = (event) => {
    switch (event.type) {
      case "new_referral":
        return {
          title: "New Referral",
          description: `${truncateAddress(
            event.data.referral
          )} joined your team (ID: ${event.data.userId})`,
        };
      case "payment_received":
        return {
          title: "Payment Received",
          description: `+${formatNumber(event.data.amount)} LINKTUM from ${
            event.data.program === 1 ? "x4" : "xXx"
          } level ${event.data.level}`,
        };
      case "level_purchased":
        return {
          title: "Level Purchased",
          description: `Activated ${
            event.data.program === 1 ? "x4" : "xXx"
          } level ${event.data.level} for ${formatNumber(
            event.data.cost
          )} LINKTUM`,
        };
      case "matrix_completed":
        return {
          title: "Matrix Completed",
          description: `${event.data.program === 1 ? "x4" : "xXx"} level ${
            event.data.level
          } completed cycle ${event.data.cycles}`,
        };
      default:
        return {
          title: "Activity",
          description: "Unknown activity",
        };
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "new_referral":
        return FiUsers;
      case "payment_received":
        return FiDollarSign;
      case "level_purchased":
        return FiTrendingUp;
      case "matrix_completed":
        return FiTrendingUp;
      default:
        return FiEye;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "new_referral":
        return "from-blue-500 to-cyan-600";
      case "payment_received":
        return "from-green-500 to-emerald-600";
      case "level_purchased":
        return "from-purple-500 to-pink-600";
      case "matrix_completed":
        return "from-orange-500 to-red-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  // Loading state
  if (teamLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mx-auto flex items-center justify-center">
              <FiLoader className="w-8 h-8 text-white animate-spin" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Loading Team Data
              </h2>
              <p className="text-white/70">
                Fetching your referral network from the blockchain...
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Not connected state
  if (!isConnected) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mx-auto flex items-center justify-center">
              <HiOutlineUserGroup className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">
                Team Management
              </h1>
              <p className="text-white/70 text-lg max-w-md mx-auto">
                Connect your wallet to view your team and referral network
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Not registered state
  if (!isRegistered) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mx-auto flex items-center justify-center">
              <HiOutlineUserGroup className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">
                Team Management
              </h1>
              <p className="text-white/70 text-lg max-w-md mx-auto mb-8">
                Register to start building your team and earning from referrals
              </p>
              <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-600 transition-all">
                Register Now
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center space-x-4 mb-6 lg:mb-0">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <HiOutlineUserGroup className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Team Management</h1>
              <p className="text-white/70">
                Manage your referral network and team performance
              </p>
            </div>
          </div>

          {/* Referral Link Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <label className="block text-white/70 text-xs mb-1">
                  Your Referral Link
                </label>
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={copyReferralLink}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white p-2 rounded-lg transition-colors"
                  title="Copy Link"
                >
                  <FiCopy className="w-4 h-4" />
                </button>
                <button
                  onClick={shareReferralLink}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
                  title="Share Link"
                >
                  <FiShare2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Team Overview Stats */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Team Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamOverviewStats.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-2">
          <div className="flex space-x-2 overflow-x-auto">
            {[
              { id: "overview", label: "Overview", icon: FiEye },
              { id: "direct", label: "Direct Referrals", icon: FiUsers },
              { id: "activity", label: "Recent Activity", icon: FiTrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Team Activity */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
              <h3 className="text-white font-semibold text-lg mb-4">
                Recent Team Activity
              </h3>
              {teamData.directReferrals.length === 0 ? (
                <div className="text-center py-8">
                  <FiUsers className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60 text-sm">No team members yet</p>
                  <p className="text-white/40 text-xs mt-2">
                    Share your referral link to start building your team
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {teamData.directReferrals.slice(0, 5).map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {member.id}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium text-sm">
                          {truncateAddress(member.address)}
                        </div>
                        <div className="text-white/60 text-xs">
                          Joined {member.joinDate}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white text-sm font-semibold">
                          {/* {formatNumber(member.totalEarned)} */}
                          LINKTUM
                        </div>
                        <div className="text-white/60 text-xs">
                          x4: L{member.x4Levels} | xXx: L{member.xxxLevels}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Team Performance */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
              <h3 className="text-white font-semibold text-lg mb-4">
                Team Performance
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white/70">
                    Average Earnings per Member
                  </span>
                  <span className="text-white font-semibold">
                    {/* {formatNumber(teamData.teamStats.avgEarningsPerMember || 0)}{" "} */}
                    LINKTUM
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white/70">Team Growth (30 days)</span>
                  <span className="text-green-400 font-semibold">
                    +{teamData.teamStats.thisMonthReferrals || 0} members
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white/70">Active Rate</span>
                  <span className="text-white font-semibold">
                    {teamData.teamStats.totalNetwork > 0
                      ? Math.round(
                          (teamData.teamStats.activeMembers /
                            teamData.teamStats.totalNetwork) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white/70">Total Team Volume</span>
                  <span className="text-white font-semibold">
                    {/* {formatNumber(teamData.teamStats.totalTeamEarnings || 0)}{" "} */}
                    LINKTUM
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "direct" && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by address or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <select
                value={filterProgram}
                onChange={(e) => setFilterProgram(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all" className="bg-gray-800">
                  All Programs
                </option>
                <option value="x4" className="bg-gray-800">
                  x4 Active
                </option>
                <option value="xxx" className="bg-gray-800">
                  xXx Active
                </option>
              </select>
            </div>

            {/* Direct Referrals Table */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
              <div className="p-6 border-b border-white/20">
                <h3 className="text-white font-semibold text-lg">
                  Direct Referrals ({filteredMembers.length})
                </h3>
              </div>

              {filteredMembers.length === 0 ? (
                <div className="p-8 text-center">
                  <FiUsers className="w-16 h-16 text-white/40 mx-auto mb-4" />
                  <h4 className="text-white text-lg font-semibold mb-2">
                    No direct referrals yet
                  </h4>
                  <p className="text-white/60 text-sm mb-6">
                    Start sharing your referral link to build your team
                  </p>
                  <button
                    onClick={copyReferralLink}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
                  >
                    Copy Referral Link
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="text-left p-4 text-white/70 font-medium">
                          Member
                        </th>
                        <th className="text-left p-4 text-white/70 font-medium">
                          Join Date
                        </th>
                        <th className="text-left p-4 text-white/70 font-medium">
                          Earnings
                        </th>
                        <th className="text-left p-4 text-white/70 font-medium">
                          Levels
                        </th>
                        <th className="text-left p-4 text-white/70 font-medium">
                          Status
                        </th>
                        <th className="text-left p-4 text-white/70 font-medium">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMembers.map((member, index) => (
                        <tr
                          key={index}
                          className="border-t border-white/10 hover:bg-white/5 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-xs">
                                  {member.id}
                                </span>
                              </div>
                              <div>
                                <div className="text-white font-medium">
                                  {truncateAddress(member.address)}
                                </div>
                                <div className="text-white/60 text-xs">
                                  ID: {member.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-white">{member.joinDate}</div>
                            <div className="text-white/60 text-xs">
                              {Math.floor(
                                (new Date() - new Date(member.joinDate)) /
                                  (1000 * 60 * 60 * 24)
                              )}{" "}
                              days ago
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-white font-semibold">
                              {/* {formatNumber(member.totalEarned)}  */}
                              LINKTUM
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">
                                x4: L{member.x4Levels}
                              </span>
                              <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs">
                                xXx: L{member.xxxLevels}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                member.status === "active"
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {member.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <button className="text-blue-400 hover:text-blue-300 transition-colors">
                              <FiEye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-lg">
                Recent Activity
              </h3>
              <span className="text-white/60 text-sm">
                Live from blockchain
              </span>
            </div>

            {recentEvents.length === 0 ? (
              <div className="text-center py-8">
                <FiTrendingUp className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/60 text-sm">No recent activity</p>
                <p className="text-white/40 text-xs mt-2">
                  Activity will appear here as you and your team interact with
                  the platform
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentEvents.map((event, index) => {
                  const Icon = getActivityIcon(event.type);
                  const color = getActivityColor(event.type);
                  const { title, description } = formatActivityText(event);

                  return (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <div
                        className={`w-12 h-12 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium text-sm mb-1">
                          {title}
                        </h4>
                        <p className="text-white/70 text-xs">{description}</p>
                      </div>

                      <div className="text-white/60 text-xs flex-shrink-0">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {recentEvents.length > 0 && (
              <div className="mt-6 pt-4 border-t border-white/20 text-center">
                <p className="text-white/60 text-xs">
                  Showing latest {recentEvents.length} events • Updates
                  automatically
                </p>
              </div>
            )}
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-8 border border-blue-500/30 text-center">
          <HiOutlineUserGroup className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h3 className="text-white font-bold text-xl mb-2">Grow Your Team</h3>
          <p className="text-white/70 mb-6 max-w-md mx-auto">
            Share your referral link and start earning from your network. The
            more active your team, the more you earn!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={copyReferralLink}
              className="flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <FiCopy className="w-4 h-4" />
              <span>Copy Referral Link</span>
            </button>
            <button
              onClick={shareReferralLink}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
            >
              <FiShare2 className="w-4 h-4" />
              <span>Share Link</span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TeamPage;
