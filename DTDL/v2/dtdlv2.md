# Digital Twins Definition Language (DTDL)

**Version 2**

This version of DTDL is used for [Azure Digital Twins](https://azure.microsoft.com/services/digital-twins/) and  [IoT Plug and Play](https://aka.ms/iotpnp).

> Note: If you are using IoT Plug and Play public preview in IoT Central, refer to [DTDL version 1 preview](../v1-preview/dtdlv1.md).


## Introduction

This document specifies the Digital Twins Definition Language (DTDL), a language for describing models for IoT Plug and Play devices, device digital twins, and logical digital twins. Broadly, modeling enables IoT solutions to provision, use, and configure digital twins of all kinds from multiple sources in a single solution. Using DTDL to describe any digital twin's abilities enables the IoT platform and IoT solutions to leverage the semantics of each digital twin.

## Changes from Public Preview 1

* Digital twin ID is now digital twin model identifier (DTMI).
* *InterfaceInstance* is renamed to *Component*.
* *CapabilityModel* is removed.
* The context is changed from *http://azureiot.com/v1/contexts/IoTModel.json* to *dtmi:dtdl:context;2*.
* Components are added.
* Relationships are added.
* Interface inheritance is added.
* Semantic type support is added.
* Character set for the `name` property is updated.
* The `unit` property is replaced with a semantic unit `unit` property.
* The property `displayUnit` is removed.
* The `commandType` property on `Command` is deprecated and its value is not used.

## Digital Twins Definition Language

Plug & Play devices, device digital twins, and logical digital twins are described using a variant of JSON called JSON-LD. JSON-LD is designed to be usable directly as JSON as well as usable in Resource Description Framework (RDF) systems. RDF is a widely adopted standard for describing resources in a distributed, extensible way. We chose JSON-LD because it is JSON and because it is an easy-to-use language for RDF. Developers can use DTDL with no knowledge of RDF, but equally important, can take advantage of semantic annotations and RDF using the same entity definitions.

The Digital Twins Definition Language (DTDL) is made up of a set of metamodel classes (described in the rest of this document) that are used to define the behavior of all digital twins (including devices). There are six metamodel classes that describe these behaviors: Interface, Telemetry, Property, Command, Relationship, and Component. In addition, because data is a key element in IoT solutions, the DTDL provides a data description language that is compatible with many popular serialization formats, including JSON and binary serialization formats. When a digital twin is modeled using the DTDL, its behaviors are defined using these metamodel classes (Interfaces, Telemetry, Properties, Commands, Relationships, Components, and data types) and it often implements those behaviors using an SDK in terms of these metamodel classes.

Lastly, the Digital Twins Definition Language provides semantic type annotations of behaviors, so that analytics, machine learning, UIs, and other computation can reason about the semantics of the data, not just the schema of the data. For example, properties that are semantically annotated as "temperature" can be reasoned about as temperature (charted together, compared, converted to like units, etc.) instead of simply double data types.

When writing a digital twin definition, it's necessary to specify the version of DTDL being used. Because DTDL is based on JSON-LD, we use the JSON-LD context (the `@context` statement) to specify the version of DTDL being used.

## Interface

An **Interface** describes the contents (Properties, Telemetries, Commands, Relationships, or Components) of any digital twin. Interfaces are reusable and can be reused as the schema for Components in another Interface.

The chart below lists the properties that may be part of an interface.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `@id` | required | [DTMI](#digital-twin-model-identifier-(dtmi)) | max 128 chars | A digital twin model identifier for the interface |
| `@type` | required | [IRI](#internationalized-resource-identifier) |  | This must be "Interface" |
| `@context` | required (at least once in the doc) | [IRI](#internationalized-resource-identifier) |  | The context to use when processing this interface. For this version, it must be set to "dtmi:dtdl:context;2" |
| `comment` | optional | *string* | 1-512 chars | A comment for model authors |
| `contents` | optional | set of Telemetry, Properties, Commands, Relationships, Components | max 300 contents | A set of objects that define the contents (Telemetry, Properties, Commands, Relationships, and/or Components) of this interface |
| `description` | optional | *string* | 1-512 chars | A localizable description for display |
| `displayName` | optional | *string* | 1-64 chars | A localizable name for display |
| `extends` | optional | set of interfaces | up to 2 interfaces per extends; max depth of 10 levels | A set of DTMIs that refer to interfaces this interface inherits from. Interfaces can inherit from multiple interfaces. |
| `schemas` | optional | set of schemas |  | A set of IRIs or objects that refer to the reusable schemas within this interface. |

#### Interface examples

The following interface example shows a thermostat device interface. The interface has one telemetry that reports the temperature measurement, and one read/write property that controls the desired temperature.

```json
{
    "@id": "dtmi:com:example:Thermostat;1",
    "@type": "Interface",
    "displayName": "Thermostat",
    "contents": [
        {
            "@type": "Telemetry",
            "name": "temp",
            "schema": "double"
        },
        {
            "@type": "Property",
            "name": "setPointTemp",
            "writable": true,
            "schema": "double"
        }
    ],
    "@context": "dtmi:dtdl:context;2"
}
```

The following interface example shows a *Phone* device that has two cameras as components, and the standard *DeviceInformation interface* as another component.

```json
{
    "@id": "dtmi:com:example:Phone;2",
    "@type": "Interface",
    "displayName": "Phone",
    "contents": [
        {
            "@type": "Component",
            "name": "frontCamera",
            "schema": "dtmi:com:example:Camera;3"
        },
        {
            "@type": "Component",
            "name": "backCamera",
            "schema": "dtmi:com:example:Camera;3"
        },
        {
            "@type": "Component",
            "name": "deviceInfo",
            "schema": "dtmi:azure:deviceManagement:DeviceInformation;2"
        }
    ],
    "@context": "dtmi:dtdl:context;2"
}
```

The following interface example shows a digital twin of a building that has a *name* property and a relationship to rooms contained in the building.

```json
{
    "@id": "dtmi:com:example:Building;1",
    "@type": "Interface",
    "displayName": "Building",
    "contents": [
        {
            "@type": "Property",
            "name": "name",
            "schema": "string",
            "writable": true
        },
        {
            "@type": "Relationship",
            "name": "contains",
            "target": "dtmi:com:example:Room;1"
        }
    ],
    "@context": "dtmi:dtdl:context;2"
}
```

The following interface example shows how interface inheritance can be used to create specialized interfaces from more general interfaces. In this example, the *ConferenceRoom* interface inherits from the *Room* interface. Through inheritance, the *ConferenceRoom* has two properties: the *occupied* property (from *Room*) and the *capacity* property (from *ConferenceRoom()).

```json
[
    {
        "@id": "dtmi:com:example:Room;1",
        "@type": "Interface",
        "contents": [
            {
                "@type": "Property",
                "name": "occupied",
                "schema": "boolean"
            }
        ],
        "@context": "dtmi:dtdl:context;2"
    },
    {
        "@id": "dtmi:com:example:ConferenceRoom;1",
        "@type": "Interface",
        "extends": "dtmi:com:example:Room;1",
        "contents": [
            {
                "@type": "Property",
                "name": "capacity",
                "schema": "integer"
            }
        ],
        "@context": "dtmi:dtdl:context;2"
    }
]
```

### Telemetry

Telemetry describes the data emitted by any digital twin, whether the data is a regular stream of sensor readings or a computed stream of data, such as occupancy, or an occasional error or information message.

The chart below lists the properties that telemetry may have.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `@type` | required | [IRI](#internationalized-resource-identifier) |  | This must be at least "Telemetry". It can also include a semantic type |
| `name` | required | *string* | 1-64 chars; unique for all contents in the interface | The "programming" name of the telemetry. The name may only contain the characters a-z, A-Z, 0-9, and underscore, and must match this regular expression `^[a-zA-Z](?:[a-zA-Z0-9_]*[a-zA-Z0-9])?$`. |
| `schema` | required | Schema | The data type of the Telemetry |
| `@id` | optional | [DTMI](#digital-twin-model-identifier-(dtmi)) | max 2048 chars | The ID of the telemetry. If no `@id` is provided, the digital twin interface processor will assign one. |
| `comment` | optional | *string* | 1-512 chars | A comment for model authors |
| `description` | optional | *string* | 1-512 chars | A localizable description for display |
| `displayName` | optional | *string* | 1-64 chars | A localizable name for display |
| `unit` | optional | Unit |  | The unit type of the Telemetry. A semantic type is required for the unit property to be available. |

#### Telemetry examples

The following example shows a simple telemetry definition of a temperature measurement, with the data type *double*.

```json
{
    "@type": "Telemetry",
    "name": "temp",
    "schema": "double"
}
```

The following example shows a telemetry definition with a *Temperature* semantic type and the `unit` property.

```json
{
    "@type": ["Telemetry", "Temperature"],
    "name": "temp",
    "schema": "double",
    "unit": "degreeCelsius"
}
```

### Property

A Property describes the read-only and read/write state of any digital twin. For example, a device serial number may be a read-only property, the desired temperature on a thermostat may be a read-write property; and the name of a room may be a read-write property.

Because digital twins are used in a distributed system, a Property not only describes the state of a digital twin, but also describes the synchronization of that state between different components that make up the distributed system. For example, the state of a digital twin might be written to by an application running in the cloud, but the digital twin itself is a device that only goes online once a day, so state information can only be synced and responded to when the device is online. Every digital twin property has synchronization information behind it that facilitates and captures the synchronization state between the digital twin and its backing store (since this synchronization information is the same for all properties, it is not included in the model definition).

The chart below lists the properties that a DTDL property may have.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `@type` | required | [IRI](#internationalized-resource-identifier) |  | This must at least be "Property". It can also include a semantic type. |
| `name` | required | *string* | 1-64 chars; unique for all contents in the interface | The "programming" name of the property. The name may only contain the characters a-z, A-Z, 0-9, and underscore, and must match this regular expression `^[a-zA-Z](?:[a-zA-Z0-9_]*[a-zA-Z0-9])?$`. |
| `schema` | required | Schema | may not be Array nor any complex schema that contains Array | The data type of the Property |
| `@id` | optional | [DTMI](#digital-twin-model-identifier-(dtmi)) | max 2048 chars | The ID of the property. If no `@id` is provided, the digital twin interface processor will assign one. |
| `comment` | optional | *string* | 1-512 chars | A comment for model authors |
| `description` | optional | *string* | 1-512 chars | A localizable description for display |
| `displayName` | optional | *string* | 1-64 chars | A localizable name for display |
| `unit` | optional | Unit |  | The unit type of the property. A semantic type is required for the unit property to be available. |
| `writable` | optional | *boolean* |  | A boolean value that indicates whether the property is writable by an external source, such as an application, or not. The default value is false (read-only). |

#### Property examples

The following example shows a property definition of a writable temperature set-point, with the data type *double*.

```json
{
    "@type": "Property",
    "name": "setPointTemp",
    "schema": "double",
    "writable": true
}
```

The following example shows a property definition with a *Temperature* semantic type and the `unit` property.

```json
{
    "@type": ["Property", "Temperature"],
    "name": "setPointTemp",
    "schema": "double",
    "unit": "degreeCelsius",
    "writable": true
}
```

### Command

A Command describes a function or operation that can be performed on any digital twin.

The chart below lists the properties that a command may have.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `@type` | required | [IRI](#internationalized-resource-identifier) |  | This must be "Command" |
| `name` | required | *string* | 1-64 chars; unique for all contents in the interface | The "programming" name of the command. The name may only contain the characters a-z, A-Z, 0-9, and underscore, and must match this regular expression `^[a-zA-Z](?:[a-zA-Z0-9_]*[a-zA-Z0-9])?$`. |
| `@id` | optional | [DTMI](#digital-twin-model-identifier-(dtmi)) | max 2048 chars | The ID of the command. If no `@id` is provided, the digital twin interface processor will assign one. |
| `comment` | optional | *string* | 1-512 chars | A comment for model authors |
| `description` | optional | *string* | 1-512 chars | A localizable description for display |
| `displayName` | optional | *string* | 1-64 chars | A localizable name for display |
| `commandType` | optional | Command-Type |  | This property is deprecated. Either value, synchronous or asynchronous, has the same meaning: a command that starts execution within a configurable time and that completes execution within a configurable time. |
| `request` | optional | Command-Payload |  | A description of the input to the Command |
| `response` | optional | Command-Payload |  | A description of the output of the Command |

#### Command examples

```json
{
    "@type": "Command",
    "name": "reboot",
    "request": {
        "name": "rebootTime",
        "displayName": "Reboot Time",
        "description": "Requested time to reboot the device.",
        "schema": "dateTime"
    },
    "response": {
        "name": "scheduledTime",
        "schema": "dateTime"
    }
}
```

#### CommandType

CommandType is deprecated. Either value, `synchronous` or `asynchronous`, has the same meaning: a command that starts execution within a configurable time and that completes execution within a configurable time.

#### CommandPayload

A CommandPayload describes the inputs to or the outputs from a Command.

The chart below lists the properties that CommandPayload may have.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `name` | required | *string* | 1-64 chars | The "programming" name of the payload. The name may only contain the characters a-z, A-Z, 0-9, and underscore, and must match this regular expression `^[a-zA-Z](?:[a-zA-Z0-9_]*[a-zA-Z0-9])?$`. |
| `schema` | required | Schema |  | The data type of the payload |
| `@id` | optional | [DTMI](#digital-twin-model-identifier-(dtmi)) | max 2048 chars | The ID of the command payload. If no `@id` is provided, the digital twin interface processor will assign one. |
| `comment` | optional | *string* | 1-512 chars | A comment for model authors |
| `description` | optional | *string* | 1-512 chars | A localizable description for display |
| `displayName` | optional | *string* | 1-64 chars | A localizable name for display |

### Relationship

A relationship describes a link to any other digital twin. For more details about relationships, see [Create digital twins and the twin graph](../Documentation/concepts-twins-graph.md).

The chart below lists the properties that a relationship may have.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `@type` | required | [IRI](#internationalized-resource-identifier) |  | This must be "Relationship" |
| `name` | required | *string* | 1-64 chars; unique for all contents in the interface | The "programming" name of the relationship. The name may only contain the characters a-z, A-Z, 0-9, and underscore, and must match this regular expression `^[a-zA-Z](?:[a-zA-Z0-9_]*[a-zA-Z0-9])?$`. |
| `@id` | optional | [DTMI](#digital-twin-model-identifier-(dtmi)) | max 2048 chars | The ID of the relationship description. If no `@id` is provided, the digital twin interface processor will assign one. |
| `comment` | optional | *string* | 1-512 chars | A comment for model authors |
| `description` | optional | *string* | 1-512 chars | A localizable description for display |
| `displayName` | optional | *string* | 1-64 chars | A localizable name for display |
| `maxMultiplicity` | optional | non-negative integer | must be > 1 and >= `min-Multiplicity` | The maximum multiplicity for the target of the relationship. The default value is infinite (there may be an unlimited number of relationship instances for this relationship). |
| `minMultiplicity` | optional | non-negative integer | must <= `max-Multiplicity` | The minimum multiplicity for the target of the relationship. The default value is 0 (this relationship is permitted to have no instances). During public preview, `minMultiplicity` must always be 0. |
| `properties` | optional | set of Property | max 300 properties | A set of Properties that define relationship-specific state |
| `target` | optional | Interface |  | An interface ID. The default value (when target is not specified) is that the target may be any interface. |
| `writable` | optional | *boolean* |  | A boolean value that indicates whether the relationship is writable or not. The default value is *false*, indicating the property is read-only. |

#### Relationship examples

The following example defines a relationship to be had with a *Floor* twin. In this example, there must be one and only one relationship instance to the floor.

```json
{
    "@type": "Relationship",
    "name": "floor",
    "minMultiplicity": 1,
    "maxMultiplicity": 1,
    "target": "dtmi:com:example:Floor;1"
}
```

The following example defines a general-purpose children relationship. In this example, there may be 0 to many children (because `minMultiplicity` and `maxMultiplicity` are not specified) of any interface type (because `target` is not specified).

```json
{
    "@type": "Relationship",
    "name": "children"
}
```

The following example defines a relationship with a property.

```json
{
    "@type": "Relationship",
    "name": "cleanedBy",
    "target": "dtmi:com:example:Cleaner;1",
    "properties": [
        {
            "@type": "Property",
            "name": "lastCleaned",
            "schema": "dateTime"
        }
    ]
}
```

### Component

Components enable interfaces to be composed of other interfaces. Components are different from relationships because they describe contents that are directly part of the interface. (A relationship describes a link between two interfaces.)

A component describes the inclusion of an interface into an interface "by value". This means that cycles in components are not allowed because the value of the component would be infinitely big.

The chart below lists the properties that a component may have.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `@type` | required | [IRI](#internationalized-resource-identifier) |  | This must be "Component" |
| `name` | required | *string* | 1-64 chars; unique for all contents in the interface | The "programming" name of the component. The name may only contain the characters a-z, A-Z, 0-9, and underscore, and must match this regular expression `^[a-zA-Z](?:[a-zA-Z0-9_]*[a-zA-Z0-9])?$`. |
| `schema` | required | Interface | cannot have a Component in a Component; cannot introduce a cycle of Components | The data type of the component |
| `@id` | optional | [DTMI](#digital-twin-model-identifier-(dtmi)) | max 2048 chars | The ID of the component. If no `@id` is provided, the digital twin interface processor will assign one. |
| `comment` | optional | *string* | 1-512 chars | A comment for model authors |
| `description` | optional | *string* | 1-512 chars | A localizable description for display |
| `displayName` | optional | *string* | 1-64 chars | A localizable name for display |

#### Component Examples

```json
{
    "@type": "Component",
    "name": "frontCamera",
    "schema": "dtmi:com:example:Camera;1"
}
```

## Schemas

Schemas are used to describe the on-the-wire or serialized format of the data in a digital twin interface. A full set of primitive data types are provided, along with support for a variety of complex schemas in the forms of Arrays, Enums, Maps, and Objects. Schemas described through digital twin's schema definition language are compatible with popular serialization formats, including JSON, Avro, and Protobuf.

### Primitive schemas

A full set of primitive data types are provided and can be specified directly as the value in a schema statement in a digital twin interface.

| Digital twin primitive schema | Description |
| --- | --- |
| `boolean` | A boolean value |
| `date` | A date in ISO 8601 format |
| `dateTime` | A date and time in ISO 8601 format |
| `double` | An IEEE 8-byte floating point |
| `duration` | A duration in ISO 8601 format |
| `float` | An IEEE 4-byte floating point |
| `integer` | A signed 4-byte integer |
| `long` | A signed 8-byte integer |
| `string` | A UTF8 string |
| `time` | A time in ISO 8601 format |

### Complex schemas

Complex schemas are designed for supporting complex data types made up of primitive data types. Currently the following complex schemas are provided: Array, Enum, Map, and Object. A complex schema can be specified directly as the value in a schema statement or described in the interface schemas set and referenced in the schema statement.

Complex schema definitions are recursive. An array's elementSchema may be an array, enum, map, or object. Likewise, a map's mapValue's schema may be an array, enum, map, or object and an object's field's schema may be an array, enum, map, or object. Currently, the maximum depth for arrays, maps, and objects is 5 levels of depth.

#### Array

An Array describes an indexable data type where each element is of the same schema. An Array elements' schema can itself be a primitive or complex schema.

The chart below lists the properties that an array may have.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `@type` | required | [IRI](#internationalized-resource-identifier) |  | This must be "Array" |
| `elementSchema` | required | Schema |  | The data type of the array elements |
| `@id` | optional | [DTMI](#digital-twin-model-identifier-(dtmi)) | max 2048 chars | The ID of the array. If no `@id` is provided, the digital twin interface processor will assign one. |
| `comment` | optional | *string* | 1-512 chars | A comment for model authors |
| `description` | optional | *string* | 1-512 chars | A localizable description for display |
| `displayName` | optional | *string* | 1-64 chars | A localizable name for display |

##### Array examples

```json
{
    "@type": "Telemetry",
    "name": "ledState",
    "schema": {
        "@type": "Array",
        "elementSchema": "boolean"
    }
}
```

#### Enum

An Enum describes a data type with a set of named labels that map to values. The values in an Enum can be either integers or strings, but the labels are always strings.

The chart below lists the properties that an Enum may have.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `@type` | required | [IRI](#internationalized-resource-identifier) |  | This must be "Enum" |
| `enumValues` | required | EnumValue |  | A set of enum value and label mappings |
| `valueSchema` | required | *integer* or *string* |  | The data type for the enum values. All enum values must be of the same type. |
| `@id` | optional | [DTMI](#digital-twin-model-identifier-(dtmi)) | max 2048 chars | The ID of the enum. If no `@id` is provided, the digital twin interface processor will assign one. |
| `comment` | optional | *string* | 1-512 chars | A comment for model authors |
| `description` | optional | *string* | 1-512 chars | A localizable description for display |
| `displayName` | optional | *string* | 1-64 chars | A localizable name for display |

##### Enum examples

```json
{
    "@type": "Telemetry",
    "name": "state",
    "schema": {
        "@type": "Enum",
        "valueSchema": "integer",
        "enumValues": [
            {
                "name": "offline",
                "displayName": "Offline",
                "enumValue": 1
            },
            {
                "name": "online",
                "displayName": "Online",
                "enumValue": 2
            }
        ]
    }
}
```

#### EnumValue

An EnumValue describes an element of an Enum.

The chart below lists the properties that an EnumValue may have.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `name` | required | *string* | 1-64 chars | The "programming" name of the enum value. The name must match this regular expression `^[a-zA-Z](?:[a-zA-Z0-9_]*[a-zA-Z0-9])?$`. The name must be unique for all enum values in this enum. |
| `enumValue` | required | *int* or *string* |  | The on-the-wire value that maps to the EnumValue. EnumValue may be either an integer or a string and must be unique for all enum values in this enum. |
| `@id` | optional | [DTMI](#digital-twin-model-identifier-(dtmi)) | max 2048 chars | The ID of the enum value. If no `@id` is provided, the digital twin interface processor will assign one. |
| `comment` | optional | *string* | 1-512 chars | A comment for model authors |
| `description` | optional | *string* | 1-512 chars | A localizable description for display |
| `displayName` | optional | *string* | 1-64 chars | A localizable name for display |

#### Map

A Map describes a data type of key-value pairs where the values share the same schema. The key in a Map must be a string. The values in a Map can be any schema.

The chart below lists the properties that a Map may have.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `@type` | required | [IRI](#internationalized-resource-identifier) |  | This must be "Map" |
| `mapKey` | required | MapKey |  | A description of the keys in the map |
| `mapValue` | required | MapValue |  | A description of the values in the map |
| `@id` | optional | [DTMI](#digital-twin-model-identifier-(dtmi)) | max 2048 chars | The ID of the map. If no `@id` is provided, the digital twin interface processor will assign one. |
| `comment` | optional | *string* | 1-512 chars | A comment for model authors |
| `description` | optional | *string* | 1-512 chars | A localizable description for display |
| `displayName` | optional | *string* | 1-64 chars | A localizable name for display |

##### Map examples
This example shows defining a map from a module name to a module state.
```json
{
    "@type": "Property",
    "name": "modules",
    "writable": true,
    "schema": {
        "@type": "Map",
        "mapKey": {
            "name": "moduleName",
            "schema": "string"
        },
        "mapValue": {
            "name": "moduleState",
            "schema": "string"
        }
    }
}
```
When JSON is used to serialize map data, this example shows the serialized map data for the map model definition above. Note that the map key name and map key value are not serialized; they are metadata.
```json
"modules": {
    "moduleA": "running",
    "moduleB": "stopped"
}
```
#### MapKey

A MapKey describes the key in a Map. The schema of a MapKey must be *string*.

The chart below lists the properties that a MapKey may have.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `name` | required | *string* | 1-64 chars | The "programming" name of the map's key. The name may only contain the characters a-z, A-Z, 0-9, and underscore, and must match this regular expression `^[a-zA-Z](?:[a-zA-Z0-9_]*[a-zA-Z0-9])?$`. |
| `schema` | required | Schema | must be *string* | The data type of the map's key |
| `@id` | optional | [DTMI](#digital-twin-model-identifier-(dtmi)) | max 2048 chars | The ID of the map key. If no `@id` is provided, the digital twin interface processor will assign one. |
| `comment` | optional | *string* | 1-512 chars | A comment for model authors |
| `description` | optional | *string* | 1-512 chars | A localizable description for display |
| `displayName` | optional | *string* | 1-64 chars | A localizable name for display |

#### MapValue

A MapValue describes the values in a Map.

The chart below lists the properties that a MapValue may have.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `name` | required | *string* | 1-64 chars | The "programming" name of the map's value. The name may only contain the characters a-z, A-Z, 0-9, and underscore, and must match this regular expression `^[a-zA-Z](?:[a-zA-Z0-9_]*[a-zA-Z0-9])?$`. |
| `schema` | required | Schema |  | The data type of the map's values |
| `@id` | optional | [DTMI](#digital-twin-model-identifier-(dtmi)) | max 2048 chars | The ID of the map value. If no `@id` is provided, the digital twin interface processor will assign one. |
| `comment` | optional | *string* | 1-512 chars | A comment for model authors |
| `description` | optional | *string* | 1-512 chars | A localizable description for display |
| `displayName` | optional | *string* | 1-64 chars | A localizable name for display |

#### Object

An Object describes a data type made up of named fields (like a struct in C). The fields in an Object map can be primitive or complex schemas.

The chart below lists the properties that an Object may have.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `@type` | required | [IRI](#internationalized-resource-identifier) |  | This must be "Object" |
| `fields` | required | set of Fields | max depth 5 levels | A set of field descriptions, one for each field in the Object |
| `@id` | optional | [DTMI](#digital-twin-model-identifier-(dtmi)) | max 2048 chars | The ID of the object. If no `@id` is provided, the digital twin interface processor will assign one. |
| `comment` | optional | *string* | 1-512 chars | A comment for model authors |
| `description` | optional | *string* | 1-512 chars | A localizable description for display |
| `displayName` | optional | *string* | 1-64 chars | A localizable name for display |

##### Object examples

```json
{
    "@type": "Telemetry",
    "name": "accelerometer",
    "schema": {
        "@type": "Object",
        "fields": [
            {
                "name": "x",
                "schema": "double"
            },
            {
                "name": "y",
                "schema": "double"
            },
            {
                "name": "z",
                "schema": "double"
            }
        ]
    }
}
```

#### Field

A Field describes a field in an Object.

The chart below lists the properties that a Field may have.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `name` | required | *string* | 1-64 chars; unique for all fields in the object | The "programming" name of the field. The name may only contain the characters a-z, A-Z, 0-9, and underscore, and must match this regular expression `^[a-zA-Z](?:[a-zA-Z0-9_]*[a-zA-Z0-9])?$`. |
| `schema` | required | Schema |  | The data type of the field |
| `@id` | optional | [DTMI](#digital-twin-model-identifier-(dtmi)) | max 2048 chars | The ID of the field. If no `@id` is provided, the digital twin interface processor will assign one. |
| `comment` | optional | *string* | 1-512 chars | A comment for model authors |
| `description` | optional | *string* | 1-512 chars | A localizable description for display |
| `displayName` | optional | *string* | 1-64 chars | A localizable name for display |

### Interface schemas

Within an interface definition, complex schemas may be defined for reusability across Telemetry, Properties, and Commands. This is designed to promote readability and improved maintenance because schemas that are reused can be defined once (per interface). Interface schemas are defined in the `schemas` property of an interface.

The chart below lists the properties that interface schemas may have.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `@id` | required | [DTMI](#digital-twin-model-identifier-(dtmi)) | max 2048 chars | The globally unique identifier for the schema |
| `@type` | required | Array, Enum, Map, Object |  | The type of complex schema. This must refer to one of the complex schema classes (Array, Enum, Map, or Object). |
| `comment` | optional | *string* | 1-512 chars | A comment for model authors |
| `description` | optional | *string* | 1-512 chars | A localizable description for display |
| `displayName` | optional | *string* | 1-64 chars | A localizable name for display |

#### Interface schema examples

```json
{
    "@id": "dtmi:com:example:ReusableTypeExample;1",
    "@type": "Interface",
    "contents": [
        {
            "@type": "Telemetry",
            "name": "accelerometer1",
            "schema": "dtmi:com:example:acceleration;1"
        },
        {
            "@type": "Telemetry",
            "name": "accelerometer2",
            "schema": "dtmi:com:example:acceleration;1"
        }
    ],
    "schemas": [
        {
            "@id": "dtmi:com:example:acceleration;1",
            "@type": "Object",
            "fields": [
                {
                    "name": "x",
                    "schema": "double"
                },
                {
                    "name": "y",
                    "schema": "double"
                },
                {
                    "name": "z",
                    "schema": "double"
                }
            ]
        }
    ],
    "@context": "dtmi:dtdl:context;2"
}
```

## Semantic Types

DTDL includes a set of standard semantic types that can be applied to Telemetries and Properties. When a Telemetry or Property is annotated with one of these semantic types, the unit property must be an instance of the corresponding unit type, and the schema type must be a numeric type (*double*, *float*, *integer*, or *long*).

Note that there is not a strict one-to-one correspondence between semantic types and unit types. For example, `Humidity` is expressed using `DensityUnit`, and `Luminosity` is expressed using `PowerUnit`.

The chart below lists standard semantic types, corresponding unit types, and available units for each unit type.

> [!NOTE]
> The `TimeSpan` semantic type should not be confused with the duration schema type. The duration schema is in ISO 8601 format; it is intended for calendar durations; and it does not play well with SI units. The semantic unit for `TimeSpan` is `TimeUnit`, which gives temporal semantics to a numeric schema type.

| Semantic type | Unit type | Unit |
| --- | --- | --- |
| `Acceleration` | `AccelerationUnit` | `metrePerSecondSquared` <br> `centimetrePerSecondSquared` <br> `gForce` |
| `Angle` | `AngleUnit` | `radian` <br> `degreeOfArc` <br> `minuteOfArc` <br> `secondOfArc` <br> `turn` |
| `AngularAcceleration` | `AngularAccelerationUnit` | `radianPerSecondSquared` |
| `AngularVelocity` | `AngularVelocityUnit` | `radianPerSecond` <br> `degreePerSecond` <br> `revolutionPerSecond` <br> `revolutionPerMinute` |
| `Area` | `AreaUnit` | `squareMetre` <br> `squareCentimetre` <br> `squareMillimetre` <br> `squareKilometre` <br> `hectare` <br> `squareFoot` <br> `squareInch` <br> `acre` |
| `Capacitance` | `CapacitanceUnit` | `farad` <br> `millifarad` <br> `microfarad` <br> `nanofarad` <br> `picofarad` |
| `Current` | `CurrentUnit` | `ampere` <br> `microampere` <br> `milliampere` |
| `DataRate` | `DataRateUnit` | `bitPerSecond` <br> `kibibitPerSecond` <br> `mebibitPerSecond` <br> `gibibitPerSecond` <br> `tebibitPerSecond` <br> `exbibitPerSecond` <br> `zebibitPerSecond` <br> `yobibitPerSecond` <br> `bytePerSecond` <br> `kibibytePerSecond` <br> `mebibytePerSecond` <br> `gibibytePerSecond` <br> `tebibytePerSecond` <br> `exbibytePerSecond` <br> `zebibytePerSecond` <br> `yobibytePerSecond` |
| `DataSize` | `DataSizeUnit` | `bit` <br> `kibibit` <br> `mebibit` <br> `gibibit` <br> `tebibit` <br> `exbibit` <br> `zebibit` <br> `yobibit` <br> `byte` <br> `kibibyte` <br> `mebibyte` <br> `gibibyte` <br> `tebibyte` <br> `exbibyte` <br> `zebibyte` <br> `yobibyte` |
| `Density` | `DensityUnit` | `kilogramPerCubicMetre` <br> `gramPerCubicMetre` |
| `Distance` | `LengthUnit` | `metre` <br> `centimetre` <br> `millimetre` <br> `micrometre` <br> `nanometre` <br> `kilometre` <br> `foot` <br> `inch` <br> `mile` <br> `nauticalMile` <br> `astronomicalUnit` |
| `ElectricCharge` | `ChargeUnit` | `coulomb` |
| `Energy` | `EnergyUnit` | `joule` <br> `kilojoule` <br> `megajoule` <br> `gigajoule` <br> `electronvolt` <br> `megaelectronvolt` <br> `kilowattHour` |
| `Force` | `ForceUnit` | `newton` <br> `pound` <br> `ounce` <br> `ton` |
| `Frequency` | `FrequencyUnit` | `hertz` <br> `kilohertz` <br> `megahertz` <br> `gigahertz` |
| `Humidity` | `DensityUnit` | `kilogramPerCubicMetre` <br> `gramPerCubicMetre` |
| `Illuminance` | `IlluminanceUnit` | `lux` <br> `footcandle` |
| `Inductance` | `InductanceUnit` | `henry` <br> `millihenry` <br> `microhenry` |
| `Latitude` | `AngleUnit` | `radian` <br> `degreeOfArc` <br> `minuteOfArc` <br> `secondOfArc` <br> `turn` |
| `Longitude` | `AngleUnit` | `radian` <br> `degreeOfArc` <br> `minuteOfArc` <br> `secondOfArc` <br> `turn` |
| `Length` | `LengthUnit` | `metre` <br> `centimetre` <br> `millimetre` <br> `micrometre` <br> `nanometre` <br> `kilometre` <br> `foot` <br> `inch` <br> `mile` <br> `nauticalMile` <br> `astronomicalUnit` |
| `Luminance` | `LuminanceUnit` | `candelaPerSquareMetre` |
| `Luminosity` | `PowerUnit` | `watt` <br> `microwatt` <br> `milliwatt` <br> `kilowatt` <br> `megawatt` <br> `gigawatt` <br> `horsepower` <br> `kilowattHourPerYear` |
| `LuminousFlux` | `LuminousFluxUnit` | `lumen` |
| `LuminousIntensity` | `LuminousIntensityUnit` | `candela` |
| `MagneticFlux` | `MagneticFluxUnit` | `weber` <br> `maxwell` |
| `MagneticInduction` | `MagneticInductionUnit` | `tesla` |
| `Mass` | `MassUnit` | `kilogram` <br> `gram` <br> `milligram` <br> `microgram` <br> `tonne` <br> `slug` |
| `MassFlowRate` | `MassFlowRateUnit` | `gramPerSecond` <br> `kilogramPerSecond` <br> `gramPerHour` <br> `kilogramPerHour` |
| `Power` | `PowerUnit` | `watt` <br> `microwatt` <br> `milliwatt` <br> `kilowatt` <br> `megawatt` <br> `gigawatt` <br> `horsepower` <br> `kilowattHourPerYear` |
| `Pressure` | `PressureUnit` | `pascal` <br> `kilopascal` <br> `bar` <br> `millibar` <br> `millimetresOfMercury` <br> `poundPerSquareInch` <br> `inchesOfMercury` <br> `inchesOfWater` |
| `RelativeHumidity` | *unitless* | unity percent |
| `Resistance` | `ResistanceUnit` | `ohm` <br> `milliohm` <br> `kiloohm` <br> `megaohm` |
| `SoundPressure` | `SoundPressureUnit` | `decibel` <br> `bel` |
| `Temperature` | `TemperatureUnit` | `kelvin` <br> `degreeCelsius` <br> `degreeFahrenheit` |
| `Thrust` | `ForceUnit` | `newton` <br> `pound` <br> `ounce` <br> `ton` |
| `TimeSpan` | `TimeUnit` | `second` <br> `millisecond` <br> `microsecond` <br> `nanosecond` <br> `minute` <br> `hour` <br> `day` <br> `year` |
| `Torque` | `TorqueUnit` | `newtonMetre` |
| `Velocity` | `VelocityUnit` | `metrePerSecond` <br> `centimetrePerSecond` <br> `kilometrePerSecond` <br> `metrePerHour` <br> `kilometrePerHour` <br> `milePerHour` <br> `milePerSecond` <br> `knot` |
| `Voltage` | `VoltageUnit` | `volt` <br> `millivolt` <br> `microvolt` <br> `kilovolt` <br> `megavolt` |
| `Volume` | `VolumeUnit` | `cubicMetre` <br> `cubicCentimetre` <br> `litre` <br> `millilitre` <br> `cubicFoot` <br> `cubicInch` <br> `fluidOunce` <br> `gallon` |
| `VolumeFlowRate` | `VolumeFlowRateUnit` | `litrePerSecond` <br> `millilitrePerSecond` <br> `litrePerHour` <br> `millilitrePerHour` |

## Model versioning

In DTDL, interfaces are versioned by a single version number (positive integer) in the last segment of their identifier. The use of the version number is up to the model author. In some cases, when the model author is working closely with the code that implements and/or consumes the model, any number of changes from version to version may be acceptable. In other cases, when the model author is publishing an interface to be implemented by multiple devices or digital twins or consumed by multiple consumers, compatible changes may be appropriate.

## Additional Concerns

### Conformance with JSON and JSON-LD

Unless stated otherwise in this document, the Digital Twins Definition Language conforms with the JSON and JSON-LD 1.1 specifications. This conformance includes things such as keywords, case sensitivity, terminology, etc. In particular, the JSON-LD spec states that all keys, keywords, and values in JSON-LD are case-sensitive.

### Digital Twin Model Identifier (DTMI)

All elements in digital twin models must have an identifier that is a **digital twin model identifier (DTMI)**. This includes interfaces, properties, telemetry, commands, relationships, components, complex schema objects, etc. This does not require that every model element have an explicit identifier, but any identifier assigned to a model element by a digital twin processor must follow this identifier format.

A DTMI has three components: scheme, path, and version. Scheme and path are separated by a colon (*:*), while path and version are separated by a semicolon (*;*). The format looks like this: `<scheme> : <path> ; <version>`.

The scheme is the string literal "dtmi" in lowercase. The path is a sequence of one or more segments, separated by colons. The version is a sequence of one or more digits.

Each path segment is a non-empty string containing only letters, digits, and underscores. The first character may not be a digit, and the last character may not be an underscore. Segments are thus representable as identifiers in all common programming languages.

Segments are partitioned into user segments and system segments. If a segment begins with an underscore, it is a system segment; if it begins with a letter, it is a user segment. If a DTMI contains at least one system segment, it is a system DTMI; otherwise, it is a user DTMI. System DTMIs may be referenced in non-system DTDL model documents, but they are not permitted as `@id` values of any elements defined in non-system models; only user DTMIs are permitted.

The version length is limited to nine digits, because the number 999,999,999 fits in a 32-bit signed integer value. The first digit may not be zero, so there is no ambiguity regarding whether version 1 matches version 01 since the latter is invalid.

Here is an example of a valid DTMI: `dtmi:foo_bar:_16:baz33:qux;12`.

The path contains four segments: *foo_bar*, *_16*, *baz33*, and *qux*. One of the segments (*_16*) is a system segment, and therefore the identifier is a system DTMI. The version is 12.

Equivalence of DTMIs is case-sensitive.

The maximum length of a DTMI is 4096 characters. The maximum length of a user DTMI is 2048 characters. The maximum length of a DTMI for an interface is 128 characters.

Developers are encouraged to take reasonable precautions against identifier collisions. At a minimum, this means not using DTMIs with very short lengths or only common terms, such as `dtmi:myDevice;1`.

Such identifiers are perfectly acceptable in sample documents but should never be used in definitions that are deployed in any fashion.

For any definition that is the property of an organization with a registered domain name, a suggested approach to generating identifiers is to use the reversed order of domain segments as initial path segments, followed by further segments that are expected to be collectively unique among definitions within the domain. For example, `dtmi:com:microsoft:azure:iot:demoSensor5;1`.

This practice will not eliminate the possibility of collisions, but it will limit accidental collisions to developers who are organizationally proximate. It will also simplify the process of identifying malicious definitions when there is a clear mismatch between the identifier and the account that uploaded the definition.

For a full definition of DTMI, please see the [DTMI repo on GitHub](https://github.com/Azure/digital-twin-model-identifier).

### Internationalized Resource Identifier
DTDL uses Internationalized Resource Identifiers (IRIs) to refer to DTDL language elements (such as type names) as well as model-defined elements (such as schemas). IRIs in DTDL are [JSON-LD IRIs](https://w3c.github.io/json-ld-syntax/#iris) and may be relative or absolute.

### Display string localization

Some string properties in models are meant for display and, therefore, support localization. Digital twin models use JSON-LD's string internationalization support for localization. Each localizable property (i.e. `displayName` and `description`) is defined to be a JSON-LD language map (`"@container": "@language"`). The default language for digital twin documents is English. Localized string values are declared using their language code (as defined in [BCP47](https://tools.ietf.org/html/bcp47) using the shortest ISO 639 code or the expanded language name with culture information (RFC4646)). Because of the composable nature of JSON-LD graphs, localized strings can be prepared in a separate file and merged with an existing graph.

#### Localization examples

In the following example, no language code is used for the localizable `displayName` property, so the default language English is used.

```json
{
    "@id": "dtmi:com:example:Thermostat;1",
    "@type": "Interface",
    "displayName": "Thermostat"
}
```

In the following example, the localizable `displayName` property is localized into multiple languages.

```json
{
    "@id": "dtmi:com:example:Thermostat;1",
    "@type": "Interface",
    "displayName": {
        "en": "Thermostat",
        "it": "Termostato"
    }
}
```

### Context

When writing a digital twin definition, it's necessary to specify the version of DTDL being used. Because DTDL is based on JSON-LD, you use the JSON-LD context (the `@context` statement) to specify the version of DTDL being used.

For this version of DTDL, the context is exactly *dtmi:dtdl:context;2*.

### References

* JSON-LD: JSON-LD 1.1 - https://json-ld.org/spec/latest/json-ld/
* Language codes: BCP47 - https://tools.ietf.org/html/bcp47
* RDF (Resource Description Framework): RDF Concepts and Abstract Syntax - http://www.w3.org/TR/2014/REC-rdf11-concepts-20140225/
* RDF Schema: RDF Schema 1.1 - http://www.w3.org/TR/rdf-schema/
