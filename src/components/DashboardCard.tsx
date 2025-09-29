import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { DashboardCard as DashboardCardType } from '../types';
import { Skeleton } from './ui/Skeleton';

interface DashboardCardProps {
  card: DashboardCardType;
  loading?: boolean;
}

const iconMap = {
  users: Users,
  package: Package,
  'shopping-cart': ShoppingCart,
  'trending-up': TrendingUp,
  calendar: Calendar,
  'dollar-sign': DollarSign,
  'alert-circle': AlertCircle,
  'check-circle': CheckCircle,
};

const colorMap = {
  primary: 'border-primary-500 bg-gradient-to-br from-primary-50 to-primary-100',
  success: 'border-green-500 bg-gradient-to-br from-green-50 to-green-100',
  danger: 'border-red-500 bg-gradient-to-br from-red-50 to-red-100',
  warning: 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-yellow-100',
  info: 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100',
};

const iconColorMap = {
  primary: 'text-primary-500',
  success: 'text-green-500',
  danger: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

export const DashboardCard: React.FC<DashboardCardProps> = ({ card, loading }) => {
  const navigate = useNavigate();
  const IconComponent = iconMap[card.icon as keyof typeof iconMap] || Package;

  const handleClick = () => {
    if (card.link.startsWith('http')) {
      window.open(card.link, '_blank');
    } else {
      navigate(card.link);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-card">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton width={48} height={48} rounded />
          <Skeleton width={120} height={20} />
          <Skeleton width={80} height={32} />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-xl p-6 shadow-card hover:shadow-card-hover 
        transition-all duration-300 cursor-pointer border-l-4
        ${colorMap[card.color]}
      `}
      onClick={handleClick}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div className={`p-3 rounded-full bg-white shadow-sm ${iconColorMap[card.color]}`}>
          <IconComponent size={32} />
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
            {card.title}
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {typeof card.value === 'number' 
              ? card.value.toLocaleString() 
              : card.value
            }
          </p>
        </div>

        {card.description && (
          <p className="text-xs text-gray-500 mt-2">{card.description}</p>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-80 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>View Details</span>
          <ArrowRight size={16} />
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-20 transition-opacity duration-300 transform -skew-x-12" />
    </motion.div>
  );
};