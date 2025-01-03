// Locker Status Enum
export const LockerStatus = Object.freeze({
  AVAILABLE: "Available",
  UNAVAILABLE: "Unavailable",
  IN_USE: "In Use",
  MAINTENANCE: "Maintenance",
})

// Locker Size Enum
export const LockerSize = Object.freeze({
  SMALL: "SMALL",
  MEDIUM: "MEDIUM",
  LARGE: "LARGE",
  X_L: "X_L",
  CUSTOM: "CUSTOM",
})

// Transaction Action Enum
export const ActionEnum = Object.freeze({
  RESERVED: "reserved",
  PICKED_UP: "picked up",
})

// Order Status Enum
export const OrderStatus = Object.freeze({
  PENDING: "pending",
  COMPLETED: "completed",
  CANCELED: "canceled",
  INPROGRESS: "in-progress",
})

// Shipment Type Enum
export const ShipmentType = Object.freeze({
  PICKUP: "pickup",
  DROP: "drop",
})

// Terminal Status Enum
export const TerminalStatus = Object.freeze({
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  MAINTENANCE: "Maintenance",
})

// Terminal Communication Type Enum
export const TerminalCommunicationType = Object.freeze({
  BLUETOOTH: "Bluetooth",
  WIFI: "WiFi",
  CELLULAR: "Cellular",
})

// Role enum type
export const Role = Object.freeze({
  SUPER_ADMIN: 0, // super-admin
  ADMIN: 1,       // admin
  MANAGER: 2,     // manager
  USER: 3,        // user
})
