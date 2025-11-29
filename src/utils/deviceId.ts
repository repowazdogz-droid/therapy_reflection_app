/**
 * Get or create a unique device identifier for rate limiting
 * Stores in localStorage for persistence across sessions
 */
const DEVICE_ID_KEY = "tra_device_id_v1";

export function getDeviceId(): string {
  if (typeof window === "undefined") {
    // Server-side: generate a temporary ID (shouldn't happen in this app)
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    
    if (!deviceId) {
      // Generate a new device ID
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    
    return deviceId;
  } catch (error) {
    // Fallback if localStorage is unavailable
    console.warn("localStorage unavailable, using session-based ID");
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

