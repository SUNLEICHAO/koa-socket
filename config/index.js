module.exports = {
  PORT: 29061,
  DATA_INTERVAL: 3000, // 数据推送间隔（毫秒）
  DEVICE_TYPES: {
    FLIGHT: 'flight', // 飞行设备
    BASE_STATION: 'baseStation' // 基站设备
  },
  DATA_TYPES: {
    FLIGHT_PERIODIC: 101, // 飞行设备属性定频上报
    BASE_STATION_PERIODIC: 102, // 基站设备属性定频上报
    FLIGHT_EVENT: 103, // 飞行设备属性事件性上报
    BASE_STATION_EVENT: 104 // 基站设备属性事件性上报
  }
};