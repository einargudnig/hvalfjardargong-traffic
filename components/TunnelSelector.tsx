"use client";

import { useState, useEffect } from 'react';
import DirectionButton from './DirectionButton';
import TrafficReport from './TrafficReport';

const TunnelSelector = () => {
  const [selectedDirection, setSelectedDirection] = useState<string | null>(null);
  const [trafficStatus, setTrafficStatus] = useState({
    north: { status: 'unknown', score: 0 },
    south: { status: 'unknown', score: 0 },
  });
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [tunnelId, setTunnelId] = useState('00000000-0000-0000-0000-000000000001'); // Default to sample tunnel

  // Fetch tunnel info and traffic status on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real implementation, these would be API fetches
        // For now, we'll use mock data
        
        // Fetch traffic status
        const statusResponse = await fetch(`/api/traffic/status?tunnelId=${tunnelId}`);
        if (statusResponse.ok) {
          const data = await statusResponse.json();
          setTrafficStatus({
            north: data.north,
            south: data.south
          });
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
    
    // Set up refresh interval (every 60 seconds)
    const intervalId = setInterval(fetchData, 60000);
    
    return () => clearInterval(intervalId);
  }, [tunnelId, reportSuccess]);

  const handleDirectionSelect = (direction: string) => {
    setSelectedDirection(direction);
  };

  const handleReportTraffic = () => {
    setShowReportModal(true);
  };

  const handleReportSuccess = () => {
    setReportSuccess(true);
    setTimeout(() => setReportSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center text-lg mb-4">
        Select tunnel entrance:
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <DirectionButton 
          direction="north"
          status={trafficStatus.north.status}
          score={trafficStatus.north.score}
          isSelected={selectedDirection === 'north'}
          onSelect={handleDirectionSelect}
        />
        
        <DirectionButton 
          direction="south"
          status={trafficStatus.south.status}
          score={trafficStatus.south.score}
          isSelected={selectedDirection === 'south'}
          onSelect={handleDirectionSelect}
        />
      </div>

      {reportSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4" role="alert">
          <span className="block sm:inline">Traffic report submitted successfully!</span>
        </div>
      )}

      {selectedDirection && !showReportModal && (
        <div className="mt-6">
          <button 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={handleReportTraffic}
          >
            Report Traffic Backup
          </button>
        </div>
      )}
      
      {showReportModal && selectedDirection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md">
            <TrafficReport 
              tunnelId={tunnelId}
              direction={selectedDirection}
              onClose={() => setShowReportModal(false)}
              onSuccess={handleReportSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TunnelSelector;
