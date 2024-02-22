# Mqtt extension

**Version 1**

**Usable in DTDL version 3**

The DTDL Mqtt extension enables a model to specify properties for an Interface that are relevant to communication via the MQTT pub/sub protocol.
If a service supports the Mqtt extension, it recognizes and understands the Mqtt, Idempotent, Cacheable, and Indexed adjunct types and their defined properties if the Mqtt context is specified.

## Mqtt context

The context specifier for version 1 of the Mqtt extension is "dtmi:dtdl:extension:mqtt;1".

## Mqtt adjunct type

The Mqtt adjunct type can co-type an Interface in DTDL version 3.
The chart below lists the additional properties that may be part of an element that is co-typed Mqtt.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `commandTopic` | optional | *string* | slash-separated sequence of character-restricted labels and/or brace-enclosed tokens | MQTT topic pattern on which a Command request is published. |
| `payloadFormat` | required | *string* |  | The format to use when serializing an instance to an MQTT payload. |
| `telemetryTopic` | optional | *string* | slash-separated sequence of character-restricted labels and/or brace-enclosed tokens | MQTT topic pattern on which a Telemetry or a collection of Telemetries is published. |

When an Interface in a model is co-typed Mqtt, values of the above properties indicate the serialization format and MQTT topic pattern used for any instance of Interface contents when conveyed via an MQTT message.

Note that the co-types on an Interface, and the additional properties added by these co-types, are not imported by an Interface that `extends` the Interface.
Therefore, the properties above apply only to the Interface to which they are directly applied, not to any extending Interfaces.

### Topic Pattern

MQTT topic pattern strings are restricted as follows.

* A topic pattern is a sequence of labels separated by `/`
* Each label is one of:
  * A string of printable ASCII characters not including space, `"`, `+`, `#`, `{`, `}`, or `/`, to be copied literally into the MQTT topic.
  * A string that indicates a replaceable token, to be replaced by an implementation-dependent value:
    * The string starts with `{`, ends with `}`, and contains an implementation-defined token
    * The token is a non-empty sequence of ASCII letters, optionally preceded by a prefix
    * The prefix is a non-empty sequence of ASCII letters followed by a `:`

* The first label must not start with `$`

## Idempotent adjunct type

The Idempotent adjunct type can co-type a Command in DTDL version 3.
There are no additional properties conferred on an element that has co-type Idempotent.

When a Command in a model is co-typed Idempotent, a service that implements the Command is permitted to execute the Command multiple times for a single invocation of the Command.
In the absence of an Idempotent co-type, a service must ensure that each Command invocation results in no more than one execution of the Command, despite possible duplication of Command requests due to failure-induced or delay-induced retries.

## Cacheable adjunct type

The Cacheable adjunct type can co-type a Command in DTDL version 3.

The chart below lists the additional properties that may be part of an element that is co-typed Cacheable.

| Property | Required | Data type | Description |
| --- | --- | --- | --- |
| `ttl` | required | *duration* | Maximum duration for which a response to a Command instance may be reused as a response to other Command instances. |

When a Command in a model is co-typed Cacheable, a service that implements the Command is permitted to store the response value for a Command instance and subsequently to reuse the stored value as a response to another Command instance, as long as the Command request values for the two Command instances are identical, and as long as the specfied `ttl` (time to live) duration is not exceeded.

## Indexed adjunct type

The Indexed adjunct type can co-type an EnumValue, a Field, or a Telemetry in DTDL version 3.

The chart below lists the additional properties that may be part of an element that is co-typed Indexed.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `index` | required | *integer* | must be >= 1; must be unique across all EnumValues, Fields, or Telemetries that are values of the same property | Index number to uniquely identify the serialized element within its parent container. |

Some serialization formats require index values for string EnumValues, Fields, and Telemetries.
Although index values can be generated automatically, the Indexed adjunct type is available for setting explicit index values when needed for cross-version compatibility or interoperation across different implementations.

## Mqtt examples

The following example shows an Interface with four `contents` elements, two Telemetries and two Commands.
The "getSpeed" Command is co-typed Idempotent, so a single invocation of the Command might result in multiple executions due to message duplication in the network.
By contranst, the "setColor" Command is not co-typed Idempotent, so a single invocation must result in a single execution, despite any message duplication.
The "getSpeed" Command is also co-typed Cacheable and has a "ttl" property with value "PT15S", which is a duration of 15 seconds expressed in [ISO 8601 Duration](https://en.wikipedia.org/wiki/ISO_8601#Durations) format.

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
  "payloadFormat": "Avro/1.11.0",
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
      "@type": [ "Command", "Idempotent", "Cacheable" ],
      "name": "getSpeed",
      "response": {
        "name": "mph",
        "schema": "integer"
      },
      "ttl": "PT15S"
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

The following example is identical to the previous one except for two changes.
First, the `payloadFormat` is specified as "Protobuf/3" instead of "Avro/1.11.0".
Second, each Telemetry element is co-typed Indexed, and it specifies a unique (within the Interface) positive integer value for the `index` property.

The Protobuf format uses field indices instead of names in its on-wire representation.
These indices can be generated automatically, but the example illustrates how the Indexed adjunct type can be used to set explicit index values if desired.

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
  "payloadFormat": "Protobuf/3",
  "contents": [
    {
      "@type": [ "Telemetry", "Indexed" ],
      "name": "distance",
      "schema": "double",
      "description": "The total distance from the origin.",
      "index": 3
    },
    {
      "@type": [ "Telemetry", "Indexed" ],
      "name": "color",
      "schema": "string",
      "description": "The color currently being applied.",
      "index": 2
    },
    {
      "@type": [ "Command", "Idempotent", "Cacheable" ],
      "name": "getSpeed",
      "response": {
        "name": "mph",
        "schema": "integer"
      },
      "ttl": "PT15S"
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

