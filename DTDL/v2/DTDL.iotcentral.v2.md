# IoT Central extension

**Version 2**

**Usable in DTDL version 2**

The IoT Central language extension defines adjunct types and schema types that have relevance to the Azure IoT Central service.
The adjunct types defined by this extension are AccelerationVector, Event, Location, State, and VelocityVector.
The schema types defined by this extension are *geopoint* and *vector*.

## IoT Central context

The context specifier for version 2 of the IoT Central extension is "dtmi:iotcentral:context;2".

## State adjunct type

The State adjunct type can co-type a Property or a Telemetry in DTDL version 2.

The chart below lists constraints on properties of a Property or a Telemetry that is co-typed with the adjunct type State.

| Property | Limits |
| --- | --- |
| `schema` | must have type [Enum](#enum) |

### State examples

```json
{
  "@context": [
      "dtmi:dtdl:context;2",
      "dtmi:iotcentral:context;2"
  ],
  "@id": "dtmi:com:example:Monitor;1",
  "@type": "Interface",
  "contents": [
    {
      "@type": [ "Property", "State" ],
      "name": "pressureState",
      "schema": {
        "@type": "Enum",
        "valueSchema": "integer",
        "enumValues": [
          {
            "name": "safe",
            "enumValue": 1
          },
          {
            "name": "overload",
            "enumValue": 2
          }
        ]
      }
    }
  ]
}
```

## Event adjunct type

The Event adjunct type can co-type a Property or a Telemetry in DTDL version 2.

The chart below lists constraints on properties of an element that is co-typed Event.

| Property | Limits |
| --- | --- |
| `schema` | must be *double*, *float*, *integer*, *long*, or *string* |

### Event examples

```json
{
  "@context": [
      "dtmi:dtdl:context;2",
      "dtmi:iotcentral:context;2"
  ],
  "@id": "dtmi:com:example:Alarm;1",
  "@type": "Interface",
  "contents": [
    {
      "@type": [ "Telemetry", "Event" ],
      "name": "alert",
      "schema": "string"
    }
  ]
}
```

## Location adjunct type

The Location adjunct type can co-type a Property or a Telemetry in DTDL version 2.

The chart below lists constraints on properties of an element that is co-typed Location.

| Property | Limits |
| --- | --- |
| `schema` | must be *point*, *multiPoint*, *lineString*, *multiLineString*, *polygon*, *multiPolygon*, or *geopoint* |

### Location examples

```json
{
  "@context": [
      "dtmi:dtdl:context;2",
      "dtmi:iotcentral:context;2"
  ],
  "@id": "dtmi:com:example:Tracker;1",
  "@type": "Interface",
  "contents": [
    {
      "@type": [ "Telemetry", "Location" ],
      "name": "geofence",
      "schema": "polygon"
    }
  ]
}
```

## VelocityVector adjunct type

The VelocityVector adjunct type can co-type a Property or a Telemetry in DTDL version 2.

The chart below lists the additional properties that may be part of an element that is co-typed VelocityVector.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `unit` | optional | *VelocityUnit* |  | The unit type for data associated with the element. |

The chart below lists constraints on properties of an element that is co-typed VelocityVector.

| Property | Limits |
| --- | --- |
| `schema` | must be *vector* |

### VelocityVector examples

```json
{
  "@context": [
      "dtmi:dtdl:context;2",
      "dtmi:iotcentral:context;2"
  ],
  "@id": "dtmi:com:example:Speedometer;1",
  "@type": "Interface",
  "contents": [
    {
      "@type": [ "Telemetry", "VelocityVector" ],
      "name": "speed3D",
      "schema": "vector",
      "unit": "metrePerSecond"
    }
  ]
}
```

## AccelerationVector adjunct type

The AccelerationVector adjunct type can co-type a Property or a Telemetry in DTDL version 2.

The chart below lists the additional properties that may be part of an element that is co-typed AccelerationVector.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `unit` | optional | *AccelerationUnit* |  | The unit type for data associated with the element. |

The chart below lists constraints on properties of an element that is co-typed AccelerationVector.

| Property | Limits |
| --- | --- |
| `schema` | must be *vector* |

### AccelerationVector examples

```json
{
  "@context": [
      "dtmi:dtdl:context;2",
      "dtmi:iotcentral:context;2"
  ],
  "@id": "dtmi:com:example:Accelerometer;1",
  "@type": "Interface",
  "contents": [
    {
      "@type": [ "Telemetry", "AccelerationVector" ],
      "name": "accel3D",
      "schema": "vector",
      "unit": "metrePerSecondSquared"
    }
  ]
}
```

## IoT Central Schemas

The extension defines schema types that are usable in any version of DTDL.
The version restrictions described above apply only to co-types of adjunct types and not to uses of schema types in DTDL models.

| Schema term | Description | Schema IRI |
| --- | --- | --- |
| `geopoint` | Geospatial point | dtmi:iotcentral:schema:geopoint;2 |
| `vector` | Three-dimensional vector | dtmi:iotcentral:schema:vector;2 |

### Schema examples

```json
{
  "@context": [
      "dtmi:dtdl:context;2",
      "dtmi:iotcentral:context;2"
  ],
  "@id": "dtmi:com:example:Locator;1",
  "@type": "Interface",
  "contents": [
    {
      "@type": [ "Property" ],
      "name": "geoPos",
      "schema": "geopoint"
    },
    {
      "@type": [ "Property" ],
      "name": "latLonAlt",
      "schema": "vector"
    }
  ]
}
```

## Feature versions

The chart below lists the versions of the IoT Central extension that are currently available.

| Extension | Context | DTDL versions |
| --- | --- | --- |
| [Iotcentral v2](./DTDL.iotcentral.v2.md) | dtmi:iotcentral:context;2 | [2](./DTDL.v2.md) |

