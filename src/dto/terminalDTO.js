// src/dtos/TerminalDTO.js
export default class TerminalDTO {
    constructor({
      name,
      status,
      latitude,
      longitude,
      address,
      basePrice,
      password,
      additionalPrices,
      lockers,
      bluetoothMacId,
      dropPaymentRequired,
      faceIdRequired,
      supportedCountries,
      paymentInfo,
      hardwareCommunication,
    }) {
      this.name = name;
      this.status = status;
      this.latitude = latitude;
      this.longitude = longitude;
      this.address = address;
      this.basePrice = basePrice;
      this.password = password;
      this.additionalPrices = additionalPrices;
      this.lockers = lockers;
      this.bluetoothMacId = bluetoothMacId;
      this.dropPaymentRequired = dropPaymentRequired;
      this.faceIdRequired = faceIdRequired;
      this.supportedCountries = supportedCountries;
      this.paymentInfo = paymentInfo;
      this.hardwareCommunication = hardwareCommunication;
    }
  }
  