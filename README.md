# Digital Twins Definition Language

The Digital Twins Definition Language (DTDL) is a language for describing models and interfaces for IoT digital twins. Digital twins are models of entities in the physical environment such as shipping containers, rooms, factory floors, or logical entities that participate in IoT solutions. Using DTDL to describe a digital twin's capabilities enables the IoT solutions to leverage the semantics of the entity.

DTDL is open to the community and Microsoft welcomes collaboration with customers, partners, and the industry. It is based on open W3C standards such as [JSON-LD](https://json-ld.org/) and [RDF](https://www.w3.org/RDF/) which allow for easier adoption across services and tooling.

## :dart: DTDL Versions

DTDL has evolved over time, resulting in the next versions:

|Version|Docs|Notes|
|---|---|---|
|v1-preview|[dtdlv1.md](./DTDL/v1-preview/dtdlv1.md)|Out of support|
|v2|[DTDL.v2.md](./DTDL/v2/DTDL.v2.md)|Supported in ADT, IoTCentral and IoT Plug and Play|
|v3|[DTDL.v3.md](./DTDL/v3/DTDL.v3.md)|Supported in ADT and IoT Plug and Play|
|v4|[DTDL.v4.md](./DTDL/v4/DTDL.v4.md)|Supported in Azure IoT Operations|

## :point_right: A Simple Example

The next interface describes a thermostat reporting temperature as degreeCelsius:

```json
{
  "@context": [
    "dtmi:dtdl:context;4",
    "dtmi:dtdl:extension:quantitativeTypes;2"
  ],
  "@id": "dtmi:com:example:Thermostat;1",
  "@type": "Interface",
  "displayName": "Thermostat",
  "description": "Reports current temperature.",
  "contents": [
    {
      "@type": [
        "Telemetry",
        "Temperature"
      ],
      "name": "temperature",
      "displayName" : "Temperature",
      "description" : "Temperature in degrees Celsius.",
      "schema": "double",
      "unit": "degreeCelsius"
    }
  ]
}
```

## :cloud: Services using DTDL

- [Azure Digital Twins](https://azure.microsoft.com/products/digital-twins/)
- [Azure IoT Plug and Play](https://aka.ms/iotpnp) 
- [Azure Device Models Repository](https://aka.ms/dmr) 
- [Azure IoT Central](https://azure.microsoft.com/products/iot-central)

## :hammer_and_wrench: Developer Tools for DTDL

- [DTDL Parser for .NET](https://aka.ms/dtdl-parser)
- [VSCode DTDL extension](https://aka.ms/dtdl-vscode)
- [Azure IoT Explorer](https://learn.microsoft.com/azure/iot-fundamentals/howto-use-iot-explorer)

## :book: Modeling Guides

- [IoT Plug and Play modeling guide](https://learn.microsoft.com/azure/iot-develop/concepts-modeling-guide)
- [ADT modeling guide](https://learn.microsoft.com/azure/digital-twins/concepts-models)
- [DTDL ontologies](https://learn.microsoft.com/azure/digital-twins/concepts-ontologies)
