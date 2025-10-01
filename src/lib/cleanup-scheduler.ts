// Simple cleanup scheduler for development
// In production, use a proper cron job service or Firebase Functions

let cleanupInterval: NodeJS.Timeout | null = null;

export function startCleanupScheduler() {
  if (cleanupInterval) {
    console.log('Cleanup scheduler already running');
    return;
  }
  
  console.log('Starting cleanup scheduler - will run every hour');
  
  // Run cleanup every hour
  cleanupInterval = setInterval(async () => {
    try {
      console.log('Running scheduled cleanup...');
      
      // Call the cleanup API
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/cleanup/expired-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Scheduled cleanup completed:', result);
      } else {
        console.error('Cleanup API failed:', response.statusText);
      }
    } catch (error) {
      console.error('Scheduled cleanup error:', error);
    }
  }, 60 * 60 * 1000); // 1 hour
}

export function stopCleanupScheduler() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    console.log('Cleanup scheduler stopped');
  }
}

// Auto-start in development
if (process.env.NODE_ENV === 'development') {
  startCleanupScheduler();
}
