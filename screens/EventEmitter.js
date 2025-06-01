class EventEmitter {
    constructor() {
      this.listeners = {};
    }
  
    addListener(eventName, callback) {
      if (!this.listeners[eventName]) {
        this.listeners[eventName] = [];
      }
      this.listeners[eventName].push(callback);
      
      return {
        remove: () => {
          this.listeners[eventName] = this.listeners[eventName]
            .filter(listener => listener !== callback);
        }
      };
    }
  
    emit(eventName, data) {
      if (this.listeners[eventName]) {
        this.listeners[eventName].forEach(callback => callback(data));
      }
    }
  }
  
  export default new EventEmitter();