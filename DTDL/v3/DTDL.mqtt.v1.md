# Mqtt extension

**Version 1**

**Usable in DTDL version 3**

The DTDL Mqtt extension enables a model to specify properties for an Interface that are relevant to communication via the MQTT pub/sub protocol.
If a service supports the Mqtt extension, it recognizes and understands the Mqtt, Idempotent, and Indexed adjunct types and their defined properties if the Mqtt context is specified.

## Mqtt context

The context specifier for version 1 of the Mqtt extension is "dtmi:dtdl:extension:mqtt;1".

## Mqtt adjunct type

The Mqtt adjunct type can co-type an Interface in DTDL version 3.
The chart below lists the additional properties that may be part of an element that is co-typed Mqtt.

| Property | Required | Data type | Description |
| --- | --- | --- | --- |
| `commandTopic` | optional | *string* | MQTT topic pattern on which a Command request is published. |
| `payloadFormat` | required | [PayloadFormat](#payloadformat) | The format to use when serializing an instance to an MQTT payload. |
| `telemetryTopic` | optional | *string* | MQTT topic pattern on which a Telemetry or a collection of Telemetries is published. |

When an Interface in a model is co-typed Mqtt, values of the above properties indicate the serialization format and MQTT topic pattern used for any instance of Interface contents when conveyed via an MQTT message.

See the documentation on [Topic Structure](https://github.com/microsoft/mqtt-patterns/blob/main/docs/specs/topic-structure.md) for the appropriate format of MQTT topic pattern strings.

## Idempotent adjunct type

The Idempotent adjunct type can co-type a Command in DTDL version 3.
There are no additional properties conferred on an element that has co-type Idempotent.

When a Command in a model is co-typed Idempotent, a service that implements the Command is permitted to execute the Command multiple times for a single invocation of the Command.
In the absence of an Idempotent co-type, a service must ensure that each Command invocation results in no more than one execution of the Command, despite possible duplication of Command requests due to failure-induced or delay-induced retries.

See the documentation on [idempotency and cacheability](https://github.com/microsoft/mqtt-patterns/blob/main/docs/specs/cache.md#idempotency-and-cacheability).

## Cacheable adjunct type

The Cacheable adjunct type can co-type a Command in DTDL version 3.

The chart below lists the additional properties that may be part of an element that is co-typed Cacheable.

| Property | Required | Data type | Description |
| --- | --- | --- | --- |
| `ttl` | required | *duration* | Maximum duration for which a response to a Command instance may be reused as a response to other Command instances. |

When a Command in a model is co-typed Cacheable, a service that implements the Command is permitted to store the response value for a Command instance and subsequently to reuse the stored value as a response to another Command instance, as long as the Command request values for the two Command instances are identical, and as long as the specfied `ttl` (time to live) duration is not exceeded.

See the documentation on [idempotency and cacheability](https://github.com/microsoft/mqtt-patterns/blob/main/docs/cache.md#idempotency-and-cacheability).

## Indexed adjunct type

The Indexed adjunct type can co-type an EnumValue, a Field, or a Telemetry in DTDL version 3.

The chart below lists the additional properties that may be part of an element that is co-typed Indexed.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `index` | required | *integer* | must be >= 1; must be unique across all EnumValues, Fields, or Telemetries that are values of the same property | Index number to uniquely identify the serialized element within its parent container. |

Some serialization formats require index values for string EnumValues, Fields, and Telemetries.
The following section indicates which `payloadFormat` values necessitate using the Index adjunct type.
If an element is co-typed Indexed but the specified `payloadFormat` does not use indexes, the `index` property values are ignored.

## PayloadFormat

The following table lists the designators that are allowed as values for the `payloadFormat` property of an element that is co-typed Mqtt.

| Format designator | Serialization format | Indexing |
| --- | --- | --- |
| `avro` | [Apache AVRO](https://avro.apache.org/docs/) data serialization format | ignored |
| `cbor` | RFC 8949 Concise Binary Object Representation ([CBOR](https://cbor.io/)) data format | expected |
| `json` | ECMA-404 JavaScript Object Notation ([JSON](https://www.json.org/json-en.html)) data interchange syntax | ignored |
| `proto2` | Google [Protocol Buffers](https://protobuf.dev/) data interchange format, [version 2](https://protobuf.dev/programming-guides/proto2/) | expected |
| `proto3` | Google [Protocol Buffers](https://protobuf.dev/) data interchange format, [version 3](https://protobuf.dev/programming-guides/proto3/) | expected |
| `raw` | unserialized raw bytes | ignored |

Some implementations may not support all of the above payload formats, and/or they may restrict which formats can be used for which types of contents.

## Mqtt examples

The following example shows an Interface with four `contents` elements, two Telemetries and two Commands.
The Interface is co-typed Mqtt, and the `payloadFormat` is specified as JSON.

The "getSpeed" Command is co-typed Idempotent, so a single invocation of the Command might result in multiple executions due to message duplication in the network.
By contranst, the "setColor" Command is not co-typed Idempotent, so a single invocation must result in a single execution, despite any message duplication.

```json
{
  "@context": [
      "dtmi:dtdl:context;3",
      "dtmi:dtdl:extension:mqtt;1"
  ],
  "@id": "dtmi:example:TestVehicle;1",
  "@type": [ "Interface", "Mqtt" ],
  "telemetryTopic": "vehicles/{modelId}/{senderId}/telemetry",
  "commandTopic": "vehicles/{executorId}/command/{commandName}",
  "payloadFormat": "json",
  "contents": [
    {
      "@type": "Telemetry",
      "name": "distance",
      "schema": "double",
      "description": "The total distance from the origin."
    },
    {
      "@type": "Telemetry",
      "name": "color",
      "schema": "string",
      "description": "The color currently being applied."
    },
    {
      "@type": [ "Command", "Idempotent" ],
      "name": "getSpeed",
      "response": {
        "name": "mph",
        "schema": "integer"
      }
    },
    {
      "@type": "Command",
      "name": "setColor",
      "request": {
        "name": "newColor",
        "schema": "string"
      },
      "response": {
        "name": "oldColor",
        "schema": "string"
      }
    }
  ]
}
```

The following example is almost identical to the previous one, except the `payloadFormat` is specified as proto3 instead of JSON.
Because protobuf requires indexed fields, each Telemetry element is co-typed Indexed, and it specifies a unique (within the Interface) positive integer value for the `index` property.

```json
{
  "@context": [
      "dtmi:dtdl:context;3",
      "dtmi:dtdl:extension:mqtt;1"
  ],
  "@id": "dtmi:example:TestVehicle;1",
  "@type": [ "Interface", "Mqtt" ],
  "telemetryTopic": "vehicles/{modelId}/{senderId}/telemetry",
  "commandTopic": "vehicles/{executorId}/command/{commandName}",
  "payloadFormat": "proto3",
  "contents": [
    {
      "@type": [ "Telemetry", "Indexed" ],
      "name": "distance",
      "schema": "double",
      "description": "The total distance from the origin.",
      "index": 1
    },
    {
      "@type": [ "Telemetry", "Indexed" ],
      "name": "color",
      "schema": "string",
      "description": "The color currently being applied.",
      "index": 2
    },
    {
      "@type": [ "Command", "Idempotent" ],
      "name": "getSpeed",
      "response": {
        "name": "mph",
        "schema": "integer"
      }
    },
    {
      "@type": "Command",
      "name": "setColor",
      "request": {
        "name": "newColor",
        "schema": "string"
      },
      "response": {
        "name": "oldColor",
        "schema": "string"
      }
    }
  ]
}
```

## Feature versions

The chart below lists the versions of the Annotation extension that are currently available.

| Extension | Context | DTDL versions |
| --- | --- | --- |
| [MQTT v1](./DTDL.mqtt.v1.md) | dtmi:dtdl:extension:mqtt;1 | [3](./DTDL.v3.md) |

