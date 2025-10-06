import io from 'socket.io-client';

class WebSocketManager {
  constructor() {
    // Singleton pattern - ensure only one instance
    if (WebSocketManager.instance) {
      console.log('🔄 WebSocketManager: Returning existing singleton instance');
      return WebSocketManager.instance;
    }
    
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.connectionUrl = 'http://57.159.24.214:4500';
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // 1 second

    console.log('🔧 WebSocketManager: Creating new singleton instance');
    WebSocketManager.instance = this;
  }

  /**
   * Connect to WebSocket server
   * @param {string} url - WebSocket server URL (optional)
   * @param {Object} options - Connection options (optional)
   * @param {boolean} forceReconnect - Force reconnect even if already connected (optional)
   */
  connect(url = null, options = {}, forceReconnect = false) {
    const connectionUrl = url || this.connectionUrl;
    
    console.log('🔌 WebSocketManager: Attempting to connect to:', connectionUrl);
    
    // If already connected and not forcing reconnect, return true
    if (this.isConnected && !forceReconnect) {
      console.log('✅ WebSocketManager: Already connected, skipping connection attempt');
      return Promise.resolve(true);
    }
    
    // Disconnect existing socket if present
    if (this.socket) {
      console.log('🔄 WebSocketManager: Disconnecting existing socket');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }

    try {
      this.socket = io(connectionUrl, {
        transports: ['websocket', 'polling'],
        auth:{
          "token": "mobile_app"
        },
        timeout: 10000, // 10 second timeout
        ...options
      });

      this.setupEventListeners();
      
      return new Promise((resolve) => {
        this.socket.on('connect', () => {
          console.log('✅ WebSocketManager: Connected successfully with ID:', this.socket.id);
          this.isConnected = true;
          this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
          this.triggerEvent('connect');
          resolve(true);
        });

        this.socket.on('connect_error', (error) => {
          console.error('❌ WebSocketManager: Connection error:', error.message);
          this.isConnected = false;
          this.triggerEvent('connect_error', error);
          
          // Attempt reconnection if under max attempts
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 WebSocketManager: Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            setTimeout(() => {
              this.connect(connectionUrl, options, true); // Force reconnect on error
            }, this.reconnectDelay * this.reconnectAttempts);
          } else {
            console.error('❌ WebSocketManager: Max reconnection attempts reached');
          }
          
          resolve(false);
        });
      });
    } catch (error) {
      console.error('❌ WebSocketManager: Failed to create socket connection:', error);
      return Promise.resolve(false);
    }
  }

  /**
   * Setup default event listeners
   */
  setupEventListeners() {
    if (!this.socket) {
      console.warn('⚠️ WebSocketManager: Cannot setup listeners - socket not initialized');
      return;
    }

    console.log('🔧 WebSocketManager: Setting up event listeners');

    // Connection events
    this.socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocketManager: Disconnected:', reason);
      this.isConnected = false;
      this.triggerEvent('disconnect', reason);
    });

    this.socket.on('reconnect', () => {
      console.log('🔄 WebSocketManager: Reconnected successfully');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.triggerEvent('reconnect');
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 WebSocketManager: Reconnection attempt ${attemptNumber}`);
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('❌ WebSocketManager: Reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ WebSocketManager: Reconnection failed after all attempts');
    });

    // Authentication events
    this.socket.on('authenticated', (data) => {
      console.log('✅ WebSocketManager: Authenticated:', data);
      this.triggerEvent('authenticated', data);
    });

    // Chat-specific events
    this.socket.on('donna-message', (data) => {
      console.log('📨 WebSocketManager: Received Donna message:', data);
      this.triggerEvent('donna-message', data);
    });


    // Generic event listener for debugging
    this.socket.onAny((eventName, ...args) => {
      console.log(`📡 WebSocketManager: Generic event received: '${eventName}'`, args);
      this.triggerEvent(eventName, ...args);
    });
  }

  /**
   * Emit event to server
   * @param {string} event - Event name
   * @param {*} data - Event data (optional)
   * @param {Function} callback - Callback function (optional)
   */
  emit(event, data, callback) {
    if (!event) {
      console.warn('⚠️ WebSocketManager.emit: Called with undefined event!');
      return;
    }
    
    if (!this.socket) {
      console.warn(`⚠️ WebSocketManager.emit('${event}'): Socket not initialized`);
      return;
    }
    
    if (!this.isConnected) {
      console.warn(`⚠️ WebSocketManager.emit('${event}'): Socket not connected`);
      return;
    }


    
    try {
      // Handle different emit patterns
      if (typeof data === 'function') {
        // Pattern: emit(event, callback)
        this.socket.emit(event, data);
      } else if (callback && typeof callback === 'function') {
        // Pattern: emit(event, data, callback)
        if (data === null || data === undefined) {
          // If data is null, don't send it - just send event and callback
          console.log(`📤 WebSocketManager: Emitting event with no payload and callback '${event}'`);
          this.socket.emit(event, callback);
        } else {
        console.log(`📤 WebSocketManager: Emitting event with payload and callback '${event}'`, data);
          this.socket.emit(event, data, callback);
        }
      } else {
        // Pattern: emit(event, data) or emit(event)
        if (data === null || data === undefined) {
          // If data is null, don't send it - just send the event
          console.log(`📤 WebSocketManager: Emitting event with no payload '${event}'`);
          this.socket.emit(event);
        } else {
          console.log(`📤 WebSocketManager: Emitting event with payload '${event}'`, data);
          this.socket.emit(event, data);
        }
      }
    } catch (error) {
      console.error(`❌ WebSocketManager.emit('${event}'): Error emitting event:`, error);
    }
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!event || typeof callback !== 'function') {
      console.warn('⚠️ WebSocketManager.on: Invalid parameters provided');
      return;
    }

    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    // Check if this exact callback is already registered to prevent duplicates
    if (this.listeners.get(event).has(callback)) {
      console.warn(`⚠️ WebSocketManager: Listener for event '${event}' already exists, skipping duplicate`);
      return;
    }
    
    this.listeners.get(event).add(callback);
    console.log(`🔧 WebSocketManager: Added listener for event '${event}' (total: ${this.listeners.get(event).size})`);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function (optional - if not provided, removes ALL listeners for the event)
   */
  off(event, callback) {
    if (!event) {
      console.warn('⚠️ WebSocketManager.off: Invalid event name provided');
      return;
    }

    if (this.listeners.has(event)) {
      if (callback && typeof callback === 'function') {
        const wasDeleted = this.listeners.get(event).delete(callback);
        if (wasDeleted) {
          console.log(`🔧 WebSocketManager: Removed specific listener for event '${event}' (remaining: ${this.listeners.get(event).size})`);
        } else {
          console.warn(`⚠️ WebSocketManager: Specific listener for event '${event}' not found to remove`);
        }
      } else {
        // If no callback provided, remove ALL listeners for this event
        const count = this.listeners.get(event).size;
        this.listeners.get(event).clear();
        console.log(`🧹 WebSocketManager: Removed ALL ${count} listeners for event '${event}'`);
      }
    } else {
      console.warn(`⚠️ WebSocketManager: No listeners found for event '${event}' to remove`);
    }
  }

  /**
   * Trigger event for all listeners
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  triggerEvent(event, data) {
    if (this.listeners.has(event)) {
      console.log(`🔔 WebSocketManager: Triggering event '${event}' for ${this.listeners.get(event).size} listeners`);
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ WebSocketManager: Error in event listener for '${event}':`, error);
        }
      });
    } else {
      console.log(`📡 WebSocketManager: Event '${event}' triggered but no listeners registered`);
    }
  }

  /**
   * Ensure connection is established (connect if not already connected)
   * @returns {Promise<boolean>} Connection status
   */
  async ensureConnection() {
    if (this.isConnected) {
      console.log('✅ WebSocketManager: Already connected, no action needed');
      return true;
    }
    
    console.log('🔌 WebSocketManager: Not connected, attempting to connect...');
    return await this.connect();
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    console.log('🔌 WebSocketManager: Disconnecting...');
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
      console.log('✅ WebSocketManager: Disconnected successfully');
    } else {
      console.log('ℹ️ WebSocketManager: No active connection to disconnect');
    }
  }

  /**
   * Get connection status
   * @returns {Object} Connection status information
   */
  getConnectionStatus() {
    const status = {
      isConnected: this.isConnected,
      socketId: this.socket?.id,
      url: this.connectionUrl,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    };
    console.log('📊 WebSocketManager: Connection status:', status);
    return status;
  }

  /**
   * Get socket instance
   * @returns {Socket} Socket.io instance
   */
  getSocket() {
    return this.socket;
  }

  /**
   * Check if connected
   * @returns {boolean} Connection status
   */
  getIsConnected() {
    return this.isConnected;
  }

  /**
   * Set connection URL
   * @param {string} url - New connection URL
   */
  setConnectionUrl(url) {
    console.log(`🔧 WebSocketManager: Setting connection URL to: ${url}`);
    this.connectionUrl = url;
  }

  /**
   * Get connection URL
   * @returns {string} Current connection URL
   */
  getConnectionUrl() {
    return this.connectionUrl;
  }

  /**
   * Debug method to show all current listeners
   * @returns {Object} Current listeners map
   */
  debugListeners() {
    const listeners = {};
    this.listeners.forEach((callbacks, event) => {
      listeners[event] = callbacks.size;
    });
    console.log('🔍 WebSocketManager: Current listeners:', listeners);
    return listeners;
  }
}

// Export singleton instance
const webSocketManager = new WebSocketManager();
export default webSocketManager;
