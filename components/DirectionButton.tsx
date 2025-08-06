interface DirectionButtonProps {
  direction: string;
  status: string; // 'clear', 'traffic', or 'unknown'
  score: number;
  isSelected: boolean;
  onSelect: (direction: string) => void;
}

const DirectionButton = ({ 
  direction, 
  status, 
  score, 
  isSelected, 
  onSelect 
}: DirectionButtonProps) => {
  // Determine status color
  const getStatusColor = () => {
    switch(status) {
      case 'clear': return 'bg-green-100 border-green-500';
      case 'traffic': return 'bg-red-100 border-red-500';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getStatusText = () => {
    switch(status) {
      case 'clear': return 'No traffic reported';
      case 'traffic': return 'Traffic backup reported';
      default: return 'Unknown status';
    }
  };

  return (
    <button 
      className={`
        p-4 rounded-lg border-2 text-left
        ${getStatusColor()}
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        transition-all duration-200 ease-in-out
      `}
      onClick={() => onSelect(direction)}
    >
      <div className="flex justify-between items-center">
        <div className="text-xl font-bold capitalize">
          {direction} Entrance
        </div>
        <div className="text-sm font-medium">
          Score: {score.toFixed(1)}
        </div>
      </div>
      <div className="mt-2 text-sm">
        {getStatusText()}
      </div>
    </button>
  );
};

export default DirectionButton;
