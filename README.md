# IoT Plug and Play

IoT Plug and Play simplifies IoT by allowing solution developers to integrate devices without writing any embedded code. At the center of IoT Plug and Play is a schema that describes device capabilities. We refer to this as a “Device Capability Model” which is a JSON-LD document.   It’s structured as a set of interfaces comprised of properties (attributes like firmware version, or settings like fan speed), telemetry (sensor readings such as temperature, or events such as alerts), and commands the device can receive (such as reboot).  Interfaces can be reused across Device Capability Models to facilitate collaboration and speed development.

We have unified the IoT Plug and Play schema with our upcoming [Digital Twin Definition Language](https://github.com/Azure/IoTPlugandPlay/tree/master/DTDL) (DTDL). IoT Plug and Play and the DTDL are open to the community and Microsoft welcomes collaboration with customers, partners, and the industry. They are based on open W3C standards such as JSON-LD and RDF which allow for easier adoption across services and tooling. Additionally, there is no additional cost for using IoT Plug and Play and DTDL; standard rates for IoT Hub, IoT Central, and other Azure services will remain the same. 

Learn more about the Digital Twin Definition Language [here](https://github.com/miagdp/Azure-IoT-PnP/tree/master/DTDL).

Browse IoT Plug and Play devices in the [Certified for Azure device catalog](https://catalog.azureiotsolutions.com/).

Contact [Microsoft](mailto:iotcert@microsoft.com) to learn more about building certified IoT Plug and Play devices.
