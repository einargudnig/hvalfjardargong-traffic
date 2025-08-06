"use client";

import { useState, useEffect } from 'react';
import { getCurrentPosition } from '@/lib/geolocation';
import { getUserId, hasReportedRecently, recordReport } from '@/lib/userTracking';

interface TrafficReportProps {
  tunnelId: string;
  direction: string;
  onClose: () => void;
  onSuccess: () => void;
}

const TrafficReport = ({ 
  tunnelId, 
  direction, 
  onClose, 
  onSuccess 
}: TrafficReportProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [hasCheckedLocation, setHasCheckedLocation] = useState(false);
  const [canReport, setCanReport] = useState(true);

  // Check if user can report (not reported recently)
  useEffect(() => {
    const recentlyReported = hasReportedRecently(tunnelId, direction);
    setCanReport(!recentlyReported);
  }, [tunnelId, direction]);

  // Get current position
  useEffect(() => {
    const getPosition = async () => {
      try {
        const pos = await getCurrentPosition();
        setPosition(pos);
        setHasCheckedLocation(true);
      } catch (error) {
        console.error('Error getting position:', error);
        setError('Unable to get your location. Please enable location access and try again.');
        setHasCheckedLocation(true);
      }
    };

    getPosition();
  }, []);

  const handleSubmit = async () => {
    if (!position || !canReport) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const userId = getUserId();
      const { latitude, longitude } = position.coords;
      
      const response = await fetch('/api/traffic/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tunnelId,
          direction,
          userId,
          hasTraffic: true,
          coordinates: {
            lat: latitude,
            lng: longitude,
          },
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit traffic report');
      }
      
      // Record the report in localStorage to prevent spam
      recordReport(tunnelId, direction);
      
      // Show success message and close
      onSuccess();
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error submitting report:', error);
      setError('Failed to submit traffic report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hasCheckedLocation) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Checking your location...</h3>
        <div className="animate-pulse flex justify-center">
          <div className="h-8 w-8 bg-blue-400 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Error</h3>
        <p className="text-red-500">{error}</p>
        <div className="mt-4 flex justify-end">
          <button
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!canReport) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Report Limit Reached</h3>
        <p>You've recently reported traffic for this tunnel direction. Please wait before submitting another report.</p>
        <div className="mt-4 flex justify-end">
          <button
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">
        Report Traffic for {direction.charAt(0).toUpperCase() + direction.slice(1)} Entrance
      </h3>
      
      <p className="mb-4">
        Confirm that there is currently a traffic backup at this tunnel entrance.
      </p>
      
      <div className="flex space-x-4 justify-end mt-6">
        <button
          className="px-4 py-2 bg-gray-300 rounded"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        
        <button
          className={`px-4 py-2 rounded text-white ${
            isSubmitting ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
          }`}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Confirm Traffic Backup'}
        </button>
      </div>
    </div>
  );
};

export default TrafficReport;
