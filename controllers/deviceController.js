const config = require('../config');
const { generateFlightData, generateBaseStationData } = require('../utils/dataGenerator');

/**
 * 发送设备数据到客户端
 * @param {WebSocket} ws - WebSocket连接
 */
function sendDeviceData(ws) {
  // 设置随机事件触发
  setInterval(() => {
    // 随机决定是否发送事件性数据
    const shouldSendEvent = Math.random() > 0.8; // 20%的概率发送事件性数据
    
    if (shouldSendEvent) {
      // 随机选择设备类型
      const isFlightDevice = Math.random() > 0.5;
      
      if (isFlightDevice) {
        // 发送飞行设备事件性数据
        const data = generateFlightData(config.DATA_TYPES.FLIGHT_EVENT);
        ws.send(JSON.stringify(data));
      } else {
        // 发送基站设备事件性数据
        const data = generateBaseStationData(config.DATA_TYPES.BASE_STATION_EVENT);
        ws.send(JSON.stringify(data));
      }
    }
  }, config.DATA_INTERVAL * 5); // 事件性数据频率较低
  
  // 定时发送飞行设备定频数据
  setInterval(() => {
    const data = generateFlightData(config.DATA_TYPES.FLIGHT_PERIODIC);
    ws.send(JSON.stringify(data));
  }, config.DATA_INTERVAL);
  
  // 定时发送基站设备定频数据
  setInterval(() => {
    const data = generateBaseStationData(config.DATA_TYPES.BASE_STATION_PERIODIC);
    ws.send(JSON.stringify(data));
  }, config.DATA_INTERVAL * 2);
}

module.exports = {
  sendDeviceData
}; 