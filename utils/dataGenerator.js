const { v4: uuidv4 } = require('uuid');
const config = require('../config');

// 飞行设备ID列表（模拟固定设备）
const flightDevices = [
  { id: 'flight-001', name: '无人机-A001' },
  { id: 'flight-002', name: '无人机-B002' },
  { id: 'flight-003', name: '无人机-C003' },
  { id: 'flight-004', name: '固定翼-D001' },
  { id: 'flight-005', name: '直升机-E001' }
];

// 基站设备ID列表（模拟固定设备）
const baseStationDevices = [
  { id: 'base-001', name: '基站-A001' },
  { id: 'base-002', name: '基站-B002' },
  { id: 'base-003', name: '基站-C003' }
];

/**
 * 生成飞行设备数据
 * @param {number} type - 数据类型
 * @returns {Object} 设备数据
 */
function generateFlightData(type) {
  // 随机选择一个飞行设备
  const device = flightDevices[Math.floor(Math.random() * flightDevices.length)];
  
  // 基本数据结构
  const data = {
    id: uuidv4(),
    timestamp: Date.now(),
    type,
    deviceId: device.id,
    deviceName: device.name,
    deviceType: config.DEVICE_TYPES.FLIGHT
  };
  
  // 根据不同类型生成不同的数据
  if (type === config.DATA_TYPES.FLIGHT_PERIODIC) {
    // 定频上报数据
    data.data = {
      altitude: Math.floor(Math.random() * 5000 + 1000), // 海拔高度 (m)
      speed: Math.floor(Math.random() * 300 + 50), // 速度 (km/h)
      battery: Math.floor(Math.random() * 100), // 电池电量 (%)
      gpsSignal: Math.floor(Math.random() * 5 + 1), // GPS信号强度 (1-5)
      position: {
        latitude: (Math.random() * 180 - 90).toFixed(6), // 纬度
        longitude: (Math.random() * 360 - 180).toFixed(6) // 经度
      },
      status: ['飞行中', '待机', '降落中', '充电中'][Math.floor(Math.random() * 4)]
    };
  } else if (type === config.DATA_TYPES.FLIGHT_EVENT) {
    // 事件性上报数据
    const eventTypes = [
      '低电量警告',
      'GPS信号丢失',
      '遇到恶劣天气',
      '任务完成',
      '碰撞警告',
      '设备故障'
    ];
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    data.data = {
      eventType,
      eventLevel: ['info', 'warning', 'error'][Math.floor(Math.random() * 3)],
      eventDescription: `飞行设备 ${device.name} 报告: ${eventType}`,
      position: {
        latitude: (Math.random() * 180 - 90).toFixed(6),
        longitude: (Math.random() * 360 - 180).toFixed(6)
      }
    };
  }
  
  return data;
}

/**
 * 生成基站设备数据
 * @param {number} type - 数据类型
 * @returns {Object} 设备数据
 */
function generateBaseStationData(type) {
  // 随机选择一个基站设备
  const device = baseStationDevices[Math.floor(Math.random() * baseStationDevices.length)];
  
  // 基本数据结构
  const data = {
    id: uuidv4(),
    timestamp: Date.now(),
    type,
    deviceId: device.id,
    deviceName: device.name,
    deviceType: config.DEVICE_TYPES.BASE_STATION
  };
  
  // 根据不同类型生成不同的数据
  if (type === config.DATA_TYPES.BASE_STATION_PERIODIC) {
    // 定频上报数据
    data.data = {
      signalStrength: Math.floor(Math.random() * 100), // 信号强度 (%)
      temperature: (Math.random() * 40 + 20).toFixed(1), // 温度 (°C)
      powerSupply: Math.floor(Math.random() * 100), // 电源状态 (%)
      connectedDevices: Math.floor(Math.random() * 10), // 连接的设备数量
      status: ['在线', '维护中', '部分服务中断'][Math.floor(Math.random() * 3)],
      position: {
        latitude: (Math.random() * 180 - 90).toFixed(6),
        longitude: (Math.random() * 360 - 180).toFixed(6)
      }
    };
  } else if (type === config.DATA_TYPES.BASE_STATION_EVENT) {
    // 事件性上报数据
    const eventTypes = [
      '电源中断',
      '信号干扰',
      '设备异常',
      '系统重启',
      '固件更新',
      '过热警告'
    ];
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    data.data = {
      eventType,
      eventLevel: ['info', 'warning', 'error'][Math.floor(Math.random() * 3)],
      eventDescription: `基站设备 ${device.name} 报告: ${eventType}`,
      position: {
        latitude: (Math.random() * 180 - 90).toFixed(6),
        longitude: (Math.random() * 360 - 180).toFixed(6)
      }
    };
  }
  
  return data;
}

module.exports = {
  generateFlightData,
  generateBaseStationData
}; 