import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { DashboardCard as DashboardCardType } from "../types";
import { Skeleton } from "./ui/Skeleton";

interface DashboardCardProps {
  card: DashboardCardType;
  loading?: boolean;
}

const iconMap = {
  users: Users,
  package: Package,
  "shopping-cart": ShoppingCart,
  "trending-up": TrendingUp,
  calendar: Calendar,
  "dollar-sign": DollarSign,
  "alert-circle": AlertCircle,
  "check-circle": CheckCircle,
};

const colorMap = {
  primary:
    "border-primary-500 bg-gradient-to-br from-primary-50 to-primary-100",
  success: "border-green-500 bg-gradient-to-br from-green-50 to-green-100",
  danger: "border-red-500 bg-gradient-to-br from-red-50 to-red-100",
  warning: "border-yellow-500 bg-gradient-to-br from-yellow-50 to-yellow-100",
  info: "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100",
};

const iconColorMap = {
  primary: "text-primary-500",
  success: "text-green-500",
  danger: "text-red-500",
  warning: "text-yellow-500",
  info: "text-blue-500",
};

export const DashboardCard: React.FC<DashboardCardProps> = ({
  card,
  loading,
}) => {
  const navigate = useNavigate();
  const IconComponent = iconMap[card.icon as keyof typeof iconMap] || Package;

  const handleClick = () => {
    if (card.link && card.link.startsWith("http")) {
      window.open(card.link, "_blank");
    } else if (card.link) {
      navigate(card.link);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-3 shadow-card-hover transition-all duration-300 cursor-pointer">
        <div className="flex items-center space-x-4">
          <Skeleton width={40} height={40} rounded />
          <div className="flex-1 space-y-2">
            <Skeleton width={70} height={16} />
            <Skeleton width={60} height={24} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-xl p-3 shadow-card-hover hover:shadow-card transition-all duration-300 cursor-pointer"
      onClick={handleClick}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center space-x-4">
        <div
          className={`p-2 rounded-full flex items-center justify-center ${
            iconColorMap[card.color]
          }`}
        >
          <IconComponent size={28} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-1 text-left">
            {card.title}
          </h3>
          <p className="text-xl font-bold text-gray-900 text-left digit">
            {typeof card.value === 'number' 
              ? card.value.toLocaleString() 
              : card.value
            }
          </p>
        </div>
      </div>
    </motion.div>
  );
};
