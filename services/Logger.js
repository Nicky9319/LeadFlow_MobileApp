/**
 * Comprehensive logging service for Donna Mobile App
 * Provides structured logging for different components and flows
 */

class Logger {
  constructor() {
    // Singleton pattern
    if (Logger.instance) {
      return Logger.instance;
    }

    this.logLevels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3,
      TRACE: 4
    };

    this.currentLogLevel = this.logLevels.INFO; // Default log level
    this.enableConsoleLogs = true;
    this.enableFileLogs = false; // For future file logging implementation
    this.logHistory = [];
    this.maxLogHistory = 1000;

    Logger.instance = this;
  }

  /**
   * Set log level
   * @param {string} level - Log level ('ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE')
   */
  setLogLevel(level) {
    if (this.logLevels[level] !== undefined) {
      this.currentLogLevel = this.logLevels[level];
      this.info('Logger', `Log level set to: ${level}`);
    } else {
      this.warn('Logger', `Invalid log level: ${level}`);
    }
  }

  /**
   * Enable/disable console logging
   * @param {boolean} enabled - Whether to enable console logs
   */
  setConsoleLogging(enabled) {
    this.enableConsoleLogs = enabled;
    this.info('Logger', `Console logging ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get current timestamp
   * @returns {string} Formatted timestamp
   */
  getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Add log entry to history
   * @param {Object} logEntry - Log entry object
   */
  addToHistory(logEntry) {
    this.logHistory.push(logEntry);
    
    // Keep only the last maxLogHistory entries
    if (this.logHistory.length > this.maxLogHistory) {
      this.logHistory = this.logHistory.slice(-this.maxLogHistory);
    }
  }

  /**
   * Format log message
   * @param {string} level - Log level
   * @param {string} component - Component name
   * @param {string} message - Log message
   * @param {*} data - Additional data
   * @returns {Object} Formatted log entry
   */
  formatLogEntry(level, component, message, data = null) {
    const timestamp = this.getTimestamp();
    const logEntry = {
      timestamp,
      level,
      component,
      message,
      data
    };

    this.addToHistory(logEntry);
    return logEntry;
  }

  /**
   * Output log to console
   * @param {Object} logEntry - Log entry object
   */
  outputToConsole(logEntry) {
    if (!this.enableConsoleLogs) return;

    const { timestamp, level, component, message, data } = logEntry;
    const timeStr = new Date(timestamp).toLocaleTimeString();
    
    // Choose emoji based on log level
    const emojis = {
      ERROR: '❌',
      WARN: '⚠️',
      INFO: 'ℹ️',
      DEBUG: '🔍',
      TRACE: '🔎'
    };

    const emoji = emojis[level] || '📝';
    const prefix = `${emoji} [${timeStr}] [${level}] [${component}]`;
    
    if (data) {
      console.log(`${prefix}: ${message}`, data);
    } else {
      console.log(`${prefix}: ${message}`);
    }
  }

  /**
   * Log error message
   * @param {string} component - Component name
   * @param {string} message - Error message
   * @param {*} data - Additional error data
   */
  error(component, message, data = null) {
    if (this.currentLogLevel >= this.logLevels.ERROR) {
      const logEntry = this.formatLogEntry('ERROR', component, message, data);
      this.outputToConsole(logEntry);
    }
  }

  /**
   * Log warning message
   * @param {string} component - Component name
   * @param {string} message - Warning message
   * @param {*} data - Additional warning data
   */
  warn(component, message, data = null) {
    if (this.currentLogLevel >= this.logLevels.WARN) {
      const logEntry = this.formatLogEntry('WARN', component, message, data);
      this.outputToConsole(logEntry);
    }
  }

  /**
   * Log info message
   * @param {string} component - Component name
   * @param {string} message - Info message
   * @param {*} data - Additional info data
   */
  info(component, message, data = null) {
    if (this.currentLogLevel >= this.logLevels.INFO) {
      const logEntry = this.formatLogEntry('INFO', component, message, data);
      this.outputToConsole(logEntry);
    }
  }

  /**
   * Log debug message
   * @param {string} component - Component name
   * @param {string} message - Debug message
   * @param {*} data - Additional debug data
   */
  debug(component, message, data = null) {
    if (this.currentLogLevel >= this.logLevels.DEBUG) {
      const logEntry = this.formatLogEntry('DEBUG', component, message, data);
      this.outputToConsole(logEntry);
    }
  }

  /**
   * Log trace message
   * @param {string} component - Component name
   * @param {string} message - Trace message
   * @param {*} data - Additional trace data
   */
  trace(component, message, data = null) {
    if (this.currentLogLevel >= this.logLevels.TRACE) {
      const logEntry = this.formatLogEntry('TRACE', component, message, data);
      this.outputToConsole(logEntry);
    }
  }

  /**
   * Log chat-specific events
   * @param {string} event - Chat event type
   * @param {string} message - Event message
   * @param {*} data - Event data
   */
  chatEvent(event, message, data = null) {
    this.info('Chat', `${event}: ${message}`, data);
  }

  /**
   * Log WebSocket events
   * @param {string} event - WebSocket event type
   * @param {string} message - Event message
   * @param {*} data - Event data
   */
  websocketEvent(event, message, data = null) {
    this.info('WebSocket', `${event}: ${message}`, data);
  }

  /**
   * Log Redux actions
   * @param {string} action - Action type
   * @param {string} message - Action message
   * @param {*} payload - Action payload
   */
  reduxAction(action, message, payload = null) {
    this.debug('Redux', `${action}: ${message}`, payload);
  }

  /**
   * Log component lifecycle events
   * @param {string} component - Component name
   * @param {string} lifecycle - Lifecycle event (mount, update, unmount)
   * @param {*} data - Additional data
   */
  componentLifecycle(component, lifecycle, data = null) {
    this.trace('Component', `${component} ${lifecycle}`, data);
  }

  /**
   * Log API calls
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {*} data - Request/response data
   */
  apiCall(endpoint, method, data = null) {
    this.info('API', `${method} ${endpoint}`, data);
  }

  /**
   * Log performance metrics
   * @param {string} metric - Metric name
   * @param {number} value - Metric value
   * @param {string} unit - Unit of measurement
   */
  performance(metric, value, unit = 'ms') {
    this.debug('Performance', `${metric}: ${value}${unit}`);
  }

  /**
   * Get log history
   * @param {number} limit - Number of recent logs to return
   * @returns {Array} Array of log entries
   */
  getLogHistory(limit = 100) {
    return this.logHistory.slice(-limit);
  }

  /**
   * Clear log history
   */
  clearLogHistory() {
    this.logHistory = [];
    this.info('Logger', 'Log history cleared');
  }

  /**
   * Export logs as JSON
   * @returns {string} JSON string of log history
   */
  exportLogs() {
    return JSON.stringify(this.logHistory, null, 2);
  }

  /**
   * Get log statistics
   * @returns {Object} Log statistics
   */
  getLogStats() {
    const stats = {
      total: this.logHistory.length,
      byLevel: {},
      byComponent: {}
    };

    this.logHistory.forEach(log => {
      // Count by level
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
      
      // Count by component
      stats.byComponent[log.component] = (stats.byComponent[log.component] || 0) + 1;
    });

    return stats;
  }
}

// Export singleton instance
const logger = new Logger();
export default logger;
