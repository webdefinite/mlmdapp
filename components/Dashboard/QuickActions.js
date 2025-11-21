import { useState } from "react";
import Link from "next/link";
import {
  FiPlus,
  FiUpload,
  FiUsers,
  FiBarChart2,
  FiArrowRight,
} from "react-icons/fi";
import { HiOutlineCube, HiOutlineChartBar } from "react-icons/hi";
import LevelPurchaseModal from "../Modals/LevelPurchaseModal";

const QuickActions = () => {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);

  const openPurchaseModal = (program) => {
    setSelectedProgram(program);
    setShowPurchaseModal(true);
  };

  const actions = [
    {
      title: "Upgrade x4 Level",
      description: "Purchase next x4 matrix level",
      icon: HiOutlineCube,
      color: "from-blue-500 to-cyan-600",
      action: () => openPurchaseModal(1),
      type: "button",
    },
    {
      title: "Upgrade xXx Level",
      description: "Purchase next xXx matrix level",
      icon: HiOutlineChartBar,
      color: "from-purple-500 to-pink-600",
      action: () => openPurchaseModal(2),
      type: "button",
    },
    {
      title: "View Team",
      description: "See your referral network",
      icon: FiUsers,
      color: "from-green-500 to-emerald-600",
      action: "/team",
      type: "link",
    },
    {
      title: "Statistics",
      description: "View detailed analytics",
      icon: FiBarChart2,
      color: "from-orange-500 to-red-600",
      action: "/stats",
      type: "link",
    },
  ];

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {actions.map((action, index) => {
            const ActionComponent = action.type === "link" ? Link : "button";
            const actionProps =
              action.type === "link"
                ? { href: action.action }
                : { onClick: action.action };

            return (
              <ActionComponent
                key={index}
                {...actionProps}
                className="group bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 block"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <FiArrowRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-2">
                    {action.title}
                  </h3>
                  <p className="text-white/70 text-sm">{action.description}</p>
                </div>
              </ActionComponent>
            );
          })}
        </div>
      </div>

      <LevelPurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        program={selectedProgram}
      />
    </>
  );
};

export default QuickActions;
