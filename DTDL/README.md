# Digital Twin Definition Language

The Digital Twins Definition Language (DTDL) is a language for describing models and interfaces for IoT digital twins. Digital twins are models of entities in the physical environment such as shipping containers, rooms, factory floors, or logical entities that participate in IoT solutions. Using DTDL to describe a digital twin's capabilities enables the IoT platform and IoT solutions to leverage the semantics of the entity.

DTDL is open to the community and Microsoft welcomes collaboration with customers, partners, and the industry. It is based on open W3C standards such as JSON-LD and RDF which allow for easier adoption across services and tooling.

To converge DTDL across Azure IoT Hub, Azure IoT Central, Azure Digital Twins, and other Azure services, DTDL is introducing a set of breaking changes.

Azure IoT Hub and Azure IoT Central support for [IoT Plug & Play](#iot-plug-and-play) is using [DTDLv2](v2/dtdlv2.md). They are in the process of moving to version 2.

[Azure Digital Twins](https://azure.microsoft.com/en-us/services/digital-twins/) is using [DTDL version 2](v2/dtdlv2.md).

# IoT Plug and Play

IoT Plug and Play simplifies IoT by allowing solution developers to integrate devices without writing any embedded code. At the center of IoT Plug and Play is a schema that describes device capabilities. The schema is structured as a set of interfaces comprised of properties (attributes like firmware version, or settings like fan speed), telemetry (sensor readings such as temperature, or events such as alerts), and commands the device can receive (such as reboot). Interfaces can be reused across devices to facilitate collaboration and speed development.

IoT Plug and Play is open to the community and Microsoft welcomes collaboration with customers, partners, and the industry. There is no additional cost for using IoT Plug and Play and DTDL; standard rates for IoT Hub, IoT Central, and other Azure services will remain the same. 
