import { Package } from 'lucide-react';

export const EmptyState = ({ 
  icon: Icon = Package, 
  title = 'No data found', 
  description = 'Try adjusting your search or filters',
  action = null 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Icon size={48} className="text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600 mb-6">{description}</p>
      {action && action}
    </div>
  );
};