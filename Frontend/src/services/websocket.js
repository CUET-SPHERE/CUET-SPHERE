// WebSocket service for real-time updates using STOMP
class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.connected = false;
    this.subscriptions = new Map();
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        // Create SockJS connection
        const socket = new SockJS('http://localhost:5454/ws');
        
        // Create STOMP client
        this.stompClient = Stomp.over(socket);
        
        // Disable STOMP debug logging
        this.stompClient.debug = null;
        
        // Connect to STOMP
        this.stompClient.connect({}, 
          (frame) => {
            console.log('Connected to WebSocket:', frame);
            this.connected = true;
            // Wait a bit more for connection to be fully established
            setTimeout(() => resolve(), 200);
          },
          (error) => {
            console.error('WebSocket connection error:', error);
            this.connected = false;
            reject(error);
          }
        );
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.stompClient && this.connected) {
      this.stompClient.disconnect();
      this.connected = false;
      this.subscriptions.clear();
    }
  }

  subscribeToNotices(batch, department, callback) {
    if (!this.connected || !this.stompClient) {
      console.warn('WebSocket not connected');
      return null;
    }

    try {
      const destination = `/topic/notices/${batch}/${department}`;
      const subscription = this.stompClient.subscribe(destination, (message) => {
        try {
          const notice = JSON.parse(message.body);
          callback(notice);
        } catch (error) {
          console.error('Error parsing notice message:', error);
        }
      });

      this.subscriptions.set(`notices_${batch}_${department}`, subscription);
      return subscription;
    } catch (error) {
      console.error('Error subscribing to notices:', error);
      return null;
    }
  }

  subscribeToAllNotices(callback) {
    if (!this.connected || !this.stompClient) {
      console.warn('WebSocket not connected');
      return null;
    }

    try {
      const destination = '/topic/notices';
      const subscription = this.stompClient.subscribe(destination, (message) => {
        try {
          const notice = JSON.parse(message.body);
          callback(notice);
        } catch (error) {
          console.error('Error parsing notice message:', error);
        }
      });

      this.subscriptions.set('notices_all', subscription);
      return subscription;
    } catch (error) {
      console.error('Error subscribing to all notices:', error);
      return null;
    }
  }

  unsubscribe(subscriptionKey) {
    const subscription = this.subscriptions.get(subscriptionKey);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionKey);
    }
  }

  isConnected() {
    return this.connected;
  }
}

// Export singleton instance
const webSocketService = new WebSocketService();
export default webSocketService;
