export const SkeletonLoader = ({ rows = 5, columns = 6 }) => {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-2 mb-2 p-3 bg-gray-200 rounded">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="h-6 bg-gray-300 rounded flex-1"
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
};