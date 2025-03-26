# Mqtt extension

**Version 3**

**Usable in DTDL version 3 or 4**

The DTDL Mqtt extension enables a model to specify properties for an Interface that are relevant to communication via the MQTT pub/sub protocol.
If a service supports the Mqtt extension, then when the Mqtt context is specified, the service recognizes and understands the Mqtt, Idempotent, Cacheable, Transparent, and Indexed adjunct types and their defined properties.
It also recognizes and understands the Result, NormalResult, ErrorResult, Error, and ErrorMessage adjunct types.

## Mqtt context

The context specifier for version 3 of the Mqtt extension is "dtmi:dtdl:extension:mqtt;3".

## Mqtt adjunct type

The Mqtt adjunct type can co-type an Interface in DTDL version 3 or 4.
The chart below lists the additional properties that may be part of an element that is co-typed Mqtt.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `cmdServiceGroupId` | optional | *string* | non-empty string of printable ASCII characters not including space, ", +, #, {, }, or / | The service group ID for subscribing to Command topics when shared subscriptions are wanted. |
| `commandTopic` | optional | *string* | slash-separated sequence of character-restricted labels and/or brace-enclosed tokens | MQTT topic pattern on which a Command request is published. |
| `payloadFormat` | required | *string* |  | The format to use when serializing an instance to an MQTT payload. |
| `telemetryTopic` | optional | *string* | slash-separated sequence of character-restricted labels and/or brace-enclosed tokens | MQTT topic pattern on which a Telemetry or a collection of Telemetries is published. |
| `telemServiceGroupId` | optional | *string* | non-empty string of printable ASCII characters not including space, ", +, #, {, }, or / | The service group ID for subscribing to Telemetry topics when shared subscriptions are wanted. |

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

The Idempotent adjunct type can co-type a Command in DTDL version 3 or 4.
There are no additional properties conferred on an element that has co-type Idempotent.

When a Command in a model is co-typed Idempotent, a service that implements the Command is permitted to execute the Command multiple times for a single invocation of the Command.
In the absence of an Idempotent co-type, a service must ensure that each Command invocation results in no more than one execution of the Command, despite possible duplication of Command requests due to failure-induced or delay-induced retries.

## Cacheable adjunct type

The Cacheable adjunct type can co-type a Command in DTDL version 3 or 4.

The chart below lists the additional properties that may be part of an element that is co-typed Cacheable.

| Property | Required | Data type | Description |
| --- | --- | --- | --- |
| `ttl` | required | *duration* | Maximum duration for which a response to a Command instance may be reused as a response to other Command instances. |

When a Command in a model is co-typed Cacheable, a service that implements the Command is permitted to store the response value for a Command instance and subsequently to reuse the stored value as a response to another Command instance, as long as the Command request values for the two Command instances are identical, and as long as the specfied `ttl` (time to live) duration is not exceeded.

## Transparent adjunct type

The Transparent adjunct type can co-type a CommandRequest or a CommandResponse in DTDL version 3 or 4, but only when the CommandRequest or CommandResponse has a `schema` property whose value is an Object.
There are no additional properties conferred on an element that has co-type Transparent.

Some serialization formats are unable to communicate simple scalar or array values directly.
Such formats require an outer layer of structure with named fields for each value.
For this reason, Command communication always includes an implied outer level of structure that represents the CommandRequest or CommandResponse containing the specified `schema`.

For the specefic case in which the `schema` of a CommandRequest or a CommandResponse is an Object, the outer layer of structure is redundant.
To eliminate this redundancy, the adjunct type Transparent can be applied to the CommandRequest or CommandResponse, indicating that the corresponding level of structure will not be represented in communicated instances of the CommandRequest or CommandResponse.
For example, a CommandRequest named "announcement" whose `schema` is an Object with two string fields might communicate a request as follows when using JSON serialization:

```json
{
  "announcement": {
    "text": "Hello, World!",
    "color": "green"
  }
}
```

However, when the Transparent adjunct type is applied to the CommandRequest, the outer JSON object and the property name "announcement" are omitted, yielding the following:

```json
{
  "text": "Hello, World!",
  "color": "green"
}
```

See the [Transparent example](#transparent-example) below for DTDL models to which the above instances conform.

## Indexed adjunct type

The Indexed adjunct type can co-type an EnumValue, a Field, or a Telemetry in DTDL version 3 or 4.

The chart below lists the additional properties that may be part of an element that is co-typed Indexed.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `index` | required | *integer* | must be >= 1; must be unique across all EnumValues, Fields, or Telemetries that are values of the same property | Index number to uniquely identify the serialized element within its parent container. |

Some serialization formats require index values for string EnumValues, Fields, and Telemetries.
Although index values can be generated automatically, the Indexed adjunct type is available for setting explicit index values when needed for cross-version compatibility or interoperation across different implementations.

## Result, NormalResult, and ErrorResult adjunct types

The Result adjunct type can co-type an Object in DTDL version 3 or 4, but each element in the `fields` property of the Object must be co-typed NormalResult or ErrorResult.

The NormalResult adjunct type can co-type a Field in DTDL version 3 or 4, but only within the `fields` property of an element that is co-typed Result.
Within the values of a `fields` property, no more than one element may be co-typed NormalResult.

The ErrorResult adjunct type can co-type a Field in DTDL version 3 or 4, but only within the `fields` property of an element that is co-typed Result, and only when the Field has a `schema` property whose value is an Object that is co-typed [Error](#error-and-errormessage-adjunct-types).
Within the values of a `fields` property, no more than one element may be co-typed ErrorResult.

These three adjunct types work together to define DTDL Command responses that can convey user-level errors.
As the [example below](#result-example) illustrates, an Object co-typed Result can be used as the schema of a Command response.
The two Fields therein define types for the normal and exceptional results of the Command.
Code-generation systems can recognize these cotypes and generate code that employs programming-language-appropriate mechanisms for indicating error results.

When a Result Object is transmitted on the wire, at most one of its NormalResult and ErrorResult fields may have a value because a single result cannot be both normal and exceptional.
Therefore, the NormalResult and ErrorResult adjunct types are not permitted to be co-co-typed with the Required adjunct type from the [Requirement](./DTDL.requirement.v1.md) extension.

## Error and ErrorMessage adjunct types

The Error adjunct type can co-type an Object in DTDL version 3 or 4.

The ErrorMessage adjunct type can co-type a Field in DTDL version 3 or 4, but only within the `fields` property of an element that is co-typed Error, and only when the Field has a `schema` property whose value is *string*.
Within the values of a `fields` property, no more than one element may be co-typed ErrorMessage.

These two adjunct types work together to define a type that expresses error information.
As the [example below](#error-example) illustrates, an Object co-typed Error can contain a Field co-typed ErrorMessage.
Code-generation systems can recognize these cotypes and generate code that employs programming-language-appropriate mechanisms for encapsulating error information and relaying an error message.

The Error adjunct type may be applied to arbitrary Objects, but it is required as a co-type of an Object that is the `schema` of an [ErrorResult](#result-normalresult-and-errorresult-adjunct-types) Field.

## Mqtt examples

The following example shows an Interface with four `contents` elements, two Telemetries and two Commands.
The "getSpeed" Command is co-typed Idempotent, so a single invocation of the Command might result in multiple executions due to message duplication in the network.
By contranst, the "setColor" Command is not co-typed Idempotent, so a single invocation must result in a single execution, despite any message duplication.
The "getSpeed" Command is also co-typed Cacheable and has a "ttl" property with value "PT15S", which is a duration of 15 seconds expressed in [ISO 8601 Duration](https://en.wikipedia.org/wiki/ISO_8601#Durations) format.

```json
{
  "@context": [
    "dtmi:dtdl:context;3",
    "dtmi:dtdl:extension:mqtt;3"
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

### Indexed example

The following example is identical to the previous one except for two changes.
First, the `payloadFormat` is specified as "Protobuf/3" instead of "Avro/1.11.0".
Second, each Telemetry element is co-typed Indexed, and it specifies a unique (within the Interface) positive integer value for the `index` property.

The Protobuf format uses field indices instead of names in its on-wire representation.
These indices can be generated automatically, but the example illustrates how the Indexed adjunct type can be used to set explicit index values if desired.

```json
{
  "@context": [
    "dtmi:dtdl:context;3",
    "dtmi:dtdl:extension:mqtt;3"
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

### Transparent example

The following example shows an Interface with a Command whose `request` value has a `schema` value that is an Object, which yields instances like the first one shown [above](#transparent-adjunct-type).

```json
{
  "@context": [
    "dtmi:dtdl:context;3",
    "dtmi:dtdl:extension:mqtt;3"
  ],
  "@id": "dtmi:example:Display;1",
  "@type": [ "Interface", "Mqtt" ],
  "payloadFormat": "Json/ecma/404",
  "commandTopic": "samples/command/{commandName}",
  "contents": [
    {
      "@type": "Command",
      "name": "display",
      "request": {
        "name": "announcement",
        "schema": {
          "@type": "Object",
          "fields": [
            {
              "name": "text",
              "schema": "string"
            },
            {
              "name": "color",
              "schema": "string"
            }
          ]
        }
      }
    }
  ]
}
```

The following example enhances the above example by co-typing the request with the adjunct type Transparent.
Although the type of the `request` property is always CommandRequest and can therefore be inferred, the presence of an adjunct type requires the material type to be declared explicitly.
Therefore, the request lists both type CommandRequest and type Transparent.

```json
{
  "@context": [
    "dtmi:dtdl:context;3",
    "dtmi:dtdl:extension:mqtt;3"
  ],
  "@id": "dtmi:example:Display;1",
  "@type": [ "Interface", "Mqtt" ],
  "payloadFormat": "Json/ecma/404",
  "commandTopic": "samples/command/{commandName}",
  "contents": [
    {
      "@type": "Command",
      "name": "display",
      "request": {
        "@type": [ "CommandRequest", "Transparent" ],
        "name": "announcement",
        "schema": {
          "@type": "Object",
          "fields": [
            {
              "name": "text",
              "schema": "string"
            },
            {
              "name": "color",
              "schema": "string"
            }
          ]
        }
      }
    }
  ]
}
```

An instance of the above request omits the outer layer of structure, such as the second instance shown [above](#transparent-adjunct-type).

The following example is not valid becuse the `schema` of the request is "string", but the adjunct type Transparent can only be applied to a CommandRequest or a CommandResponse whose `schema` is an Object.

```json
{
  "@context": [
    "dtmi:dtdl:context;3",
    "dtmi:dtdl:extension:mqtt;3"
  ],
  "@id": "dtmi:example:Display;1",
  "@type": [ "Interface", "Mqtt" ],
  "payloadFormat": "Json/ecma/404",
  "commandTopic": "samples/command/{commandName}",
  "contents": [
    {
      "@type": "Command",
      "name": "display",
      "request": {
        "@type": [ "CommandRequest", "Transparent" ],
        "name": "announcement",
        "schema": "string"
      }
    }
  ]
}
```

### Result example

The following Interface example defines an "increment" Command with a response schema of an Object that is co-typed Result.
The Field with co-type NormalResult has a schema that is an integer value named "counterValue", which is the result that will be returned in the response under normal circumstances.
The Field with co-type ErrorResult has a schema defined by reference named "incrementError", which is the result that will be returned in the response under exceptional circumstances.

> Note that for this model to be complete and valid, a definition for "dtmi:com:example:CounterCollection:CounterError;1" must be provided.
The subsequent example shows an appropriate definition.

```json
{
  "@context": [
    "dtmi:dtdl:context;3",
    "dtmi:dtdl:extension:mqtt;3"
  ],
  "@id": "dtmi:com:example:CounterCollection;1",
  "@type": [ "Interface", "Mqtt" ],
  "commandTopic": "rpc/command-samples/{executorId}/{commandName}",
  "payloadFormat": "Json/ecma/404",
  "contents": [
    {
      "@type": "Command",
      "name": "increment",
      "request": {
        "name": "counterName",
        "schema": "string"
      },
      "response": {
        "name": "incrementResponse",
        "schema": {
          "@type": [ "Object", "Result" ],
          "fields": [
            {
              "@type": [ "Field", "NormalResult" ],
              "name": "counterValue",
              "schema": "integer"
            },
            {
              "@type": [ "Field", "ErrorResult" ],
              "name": "incrementError",
              "schema": "dtmi:com:example:CounterCollection:CounterError;1"
            }
          ]
        }
      }
    }
  ]
}
```

### Error example

The following example defines an Object that is co-typed Error, indicating that this Object conveys error information.
The Field with co-type ErrorMessage has a schema that is a string value named "explanation"; the adjunct type indicates that this field represents an error message.
The Field named "condition" has no co-type; it is arbitrarily designed error information of the modeler's choosing.

A code-generation system could use a programming-language-appropriate error type to encapsulate the information in this Object.
The generator might further use language-appropriate means to convey the information in the "explanation" Field as an error message.

```json
{
  "@id": "dtmi:com:example:CounterCollection:CounterError;1",
  "@type": [ "Object", "Error" ],
  "fields": [
    {
      "@type": [ "Field", "ErrorMessage" ],
      "name": "explanation",
      "schema": "string"
    },
    {
      "name": "condition",
      "schema": {
        "@type": "Enum",
        "valueSchema": "integer",
        "enumValues": [
          {
            "name": "counterNotFound",
            "enumValue": 1
          },
          {
            "name": "counterOverflow",
            "enumValue": 2
          }
        ]
      }
    }
  ]
}
```

## Changes from Version 2

* The [Result, NormalResult, and ErrorResult](#result-normalresult-and-errorresult-adjunct-types) adjunct types have been added.
* The [Error and ErrorMessage](#error-and-errormessage-adjunct-types) adjunct types have been added.

## Feature versions

The chart below lists the versions of the Mqtt extension that are currently available.

| Extension | Context | DTDL versions |
| --- | --- | --- |
| [MQTT v1](../v3/DTDL.mqtt.v1.md) | dtmi:dtdl:extension:mqtt;1 | [3](../v3/DTDL.v3.md) |
| [MQTT v2](./DTDL.mqtt.v2.md) | dtmi:dtdl:extension:mqtt;2 | [3](../v3/DTDL.v3.md), [4](./DTDL.v4.md) |
| [MQTT v3](./DTDL.mqtt.v3.md) | dtmi:dtdl:extension:mqtt;3 | [3](../v3/DTDL.v3.md), [4](./DTDL.v4.md) |

