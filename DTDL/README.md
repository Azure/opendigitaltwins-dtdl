# Digital Twin Definition Language
**Version 2**

## Contents
[CapabilityModel](#capabilitymodel)<br>
[Interface](#interface)<br>
[Telemetry](#telemetry)<br>
[Property](#property)<br>
[Command](#command)<br>
[Primitive Schemas](#primitive-schemas)<br>
[Array](#array)<br>
[Enum](#enum)<br>
[Map](#map)<br>
[Object](#object)<br>
[Interface Schemas](#interface-schemas)<br>
[Model Versioning](#model-versioning)<br>

## Introduction
This document specifies the Digital Twin Definition Language (DTDL), a language for describing models and interfaces for IoT digital twins. Digital twins are models of entities in the physical environment such as shipping containers, rooms, factory floors, and other entities that participate in IoT solutions. Broadly, modeling enables IoT solutions to provision, use, and configure IoT devices and logical entities from multiple sources in a single solution. Using DTDL to describe a digital twin's capabilities enables the IoT platform and IoT solutions to leverage the semantics of the entity.

## Digital Twin Definition Language

Digital twins are described using a variant of JSON called JSON-LD. JSON-LD is designed to be usable directly as JSON as well as usable in Resource Description Framework (RDF) systems. RDF is a widely adopted standard for describing resources in a distributed, extensible way. We chose JSON-LD because it is JSON and it is an easy-to-use language for RDF. Developers can use DTDL with no knowledge of RDF, but equally important, can take advantage of semantic annotations and RDF using the same entity definitions.

DTDL is made up of a set of metamodel classes (described in the rest of this document) that define the capabilities of digital twins. There are two top-level classes, `CapabilityModel` and `Interface`, that describe digital twins and the capabilities of digital twins, respectively. There are three metamodel classes that describe capabilities: `Telemetry`, `Property`, and `Command`. In addition, because data is a key element in IoT solutions, DTDL provides a data description language that is compatible with many popular serialization formats, including JSON and binary serialization formats. When a digital twin uses DTDL, it describes its capabilities using these metamodel classes (`Interfaces`, `Telemetry`, `Properties`, `Commands`, and data types) and often implements those capabilities using an SDK in terms of these metamodel classes.

Lastly, DTDL provides semantic type annotations of capabilities, so that analytics, machine learning, UIs, and other computation can reason about the semantics of the data, not just the schema of the data. For example, properties that are semantically annotated as "temperature" can be reasoned about as temperature (charted together, compared, converted to like units, etc.) instead of simply double data types.

When writing a digital twin definition, it's necessary to specify the version of DTDL being used. Because DTDL is based on JSON-LD, we use the JSON-LD context (the `@context` statement) to specify the version of DTDL being used.

## CapabilityModel
A `CapabilityModel` describes a device and defines the set of components that make up the device. A component is a logically related set of capabilities that are declared together in an interface. See the [Component](#component) section for more details.

A newer version of a capability model must include all the components declared by the previous version (although the version numbers of the interfaces in each component schema can be the same or greater than the version in the previous capability model version).

### CapabilityModel properties
| Property | Required | Data type | Limits | Version rules | Description |
| --- | --- | --- | --- | --- | --- |
| @id | required | [DT id](#digital-twin-identifier-format) | max 256 chars | version number can be incremented | An identifier for the capability model that follows the digital twin identity format. Two capability models with same identifier refer to the same capability model. |
| @type | required | IRI | | immutable | The type of capability model instance. This must refer to the `CapabilityModel` metamodel class. |
| @context | required | IRI | | immutable | The context to use when processing this capability model. For this version, it must be set to `http://azure.com/v2/contexts/Model.json` |
| implements | required | set of `Component`s | max 30 components | new components can be added; versions of existing components can be incremented; no components can be removed | A set of components. |
| comment | optional | string | 1-512 chars | mutable | A developer comment. |
| description | optional | string | 1-512 chars | mutable | A [localizable](#display-string-localization) description for human display. |
| displayName | optional | string | 1-64 chars | mutable | A [localizable](#display-string-localization) name for human display. |

### CapabilityModel examples
This `CapabilityModel` example shows a thermostat that implements two `Interface`s.
```json
{
    "@id": "urn:example.com:thermostat_T_1000:1",
    "@type": "CapabilityModel",
    "displayName": "Thermostat T-1000",
    "implements": [
        {
            "name": "thermostat",
            "schema": "urn:example:thermostat:1"
        },
        {
            "name": "urn_azure_DeviceManagement_DeviceInformation",
            "schema": "urn:azure:DeviceManagement:DeviceInformation:1"
        }
    ],
    "@context": "http://azure.com/v2/contexts/Model.json"
}
```
This example shows defining an `Interface` inline with a `CapabilityModel`.
```json
{
    "@id": "urn:example:thermostat_T_1000:1",
    "@type": "CapabilityModel",
    "displayName": "Thermostat T-1000",
    "implements": [
        {
            "name": "thermostat",
            "schema": {
                "@id": "urn:example:thermostat:1",
                "@type": "Interface",
                "displayName": "Thermostat",
                "contents": [
                ],
                "@context": "http://azure.com/v2/contexts/Model.json"
            }
        },
        {
            "name": "urn_azure_DeviceManagement_DeviceInformation",
            "schema": "urn:azure:DeviceManagement:DeviceInformation:1"
        }
    ],
    "@context": "http://azure.com/v2/contexts/Model.json"
}
```

### Component
A `Component` describes a part of a capability model. Components enable capability models to be made up of many interfaces and for those components to be named (to provide namespacing for interfaces).

#### Component properties
| Property | Required | Data type | Limits | Version rules | Description |
| --- | --- | --- | --- | --- | --- |
| name | required | string | 1-256 chars | immutable | The "programming" name of the component. The name must match this regular expression `^[a-zA-Z_][a-zA-Z0-9_]*$`. The name must be unique for all components in this capability model. |
| schema | required | `Interface` | | version number can be incremented | The component's type, which must be an interface. |
| @id | optional | [DT id](#digital-twin-identifier-format) | max 256 chars | version number can be incremented | The id of the capability model interface. If no @id is provided, the digital twin capability model processor assigns one. |
| comment | optional | string | 1-512 chars | mutable | A developer comment. |
| description | optional | string | 1-512 chars | mutable | A [localizable](#display-string-localization) description for human display. |
| displayName | optional | string | 1-64 chars | mutable | A [localizable](#display-string-localization) name for human display. |

## Interface
An `Interface` describes related capabilities that are implemented by a device or digital twin. Interfaces are reusable and can be reused across different capability models.

### Interface properties
| Property | Required | Data type | Limits | Version rules | Description |
| --- | --- | --- | --- | --- | --- |
| @id | required | [DT id](#digital-twin-identifier-format) | max 256 chars | version number can be incremented | An identifier for the interface that follows the digital twin identity format. Two interfaces with same identifier refer to the same interface. |
| @type | required | IRI | | immutable | The type of interface object. This must refer to the `Interface` metamodel class. |
| @context | required | IRI | | immutable | The context to use when processing this interface. For this version, it must be set to `http://azure.com/v2/contexts/Model.json` |
| comment | optional | string | 1-512 chars | mutable | A developer comment. |
| contents | optional | set of `Telemetry`, `Property`, or `Command` | max 300 contents | new contents can be added; versions of existing contents can be incremented; no contents can be removed | A set of objects that describe the capabilities (telemetry, property, and/or commands) of this interface. |
| description | optional | string | 1-512 chars | mutable | A [localizable](#display-string-localization) description for human display. |
| displayName | optional | string | 1-64 chars | mutable | A [localizable](#display-string-localization) name for human display. |
| schemas | optional | set of `Schema`s | | new schemas can be added; versions of existing schemas can be incremented; no schemas can be removed | A set of IRIs or objects that refer to the reusable schemas within this interface. |

### Interface examples
This `Interface` example shows a thermostat interface that implements one telemetry that reports the temperature measurement and one read/write property that controls the desired temperature.
```json
{
    "@id": "urn:example:thermostat:1",
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
    "@context": "http://azure.com/v2/contexts/Model.json"
}
```

## Telemetry
Telemetry describes the data emitted by a device or digital twin, whether the data is a regular stream of sensor readings or an occasional error or information message.

### Telemetry properties
| Property | Required | Data type | Limits | Version rules | Description |
| --- | --- | --- | --- | --- | --- |
| @type | required | IRI | | immutable | The type of telemetry object. This must refer to the `Telemetry` metamodel class. |
| name | required | string | 1-64 chars | immutable | The "programming" name of the telemetry. The name must match this regular expression `^[a-zA-Z_][a-zA-Z0-9_]*$`. The name must be unique for all contents in this interface. |
| schema | required | `Schema` | | immutable | The data type of the telemetry. |
| @id | optional | [DT id](#digital-twin-identifier-format) | max 256 chars | version number can be incremented | The ID of the telemetry description. If no @id is provided, the digital twin interface processor assigns one. |
| comment | optional | string | 1-512 chars | mutable | A developer comment. |
| description | optional | string | 1-512 chars | mutable | A [localizable](#display-string-localization) description for human display. |
| displayName | optional | string | 1-64 chars | mutable | A [localizable](#display-string-localization) name for human display. |
| displayUnit | optional | string | 1-64 chars | mutable | A [localizable](#display-string-localization) unit name for human display. |
| unit | optional | `Unit` | | mutable | The unit type of the telemetry. |

### Telemetry examples
```json
{
    "@type": "Telemetry",
    "name": "temp",
    "schema": "double"
}
```

## Property
A Property describes the read-only and read-write state of a device or digital twin. For example, a device serial number may be a read-only property and the temperature set point on a thermostat may be a read-write property.

### Property properties
| Property | Required | Data type | Limits | Version rules | Description |
| --- | --- | --- | --- | --- | --- |
| @type | required | IRI | | immutable | The type of property object. This must refer to the `Property` metamodel class. |
| name | required | string | 1-64 chars | immutable | The "programming" name of the property. The name must match this regular expression `^[a-zA-Z_][a-zA-Z0-9_]*$`. The name must be unique for all contents in this interface. |
| schema | required | `Schema` | | immutable | The data type of the property. The Array schema is not supported for properties. |
| @id | optional | [DT id](#digital-twin-identifier-format) | max 256 chars | version number can be incremented | The ID of the property description. If no @id is provided, the digital twin interface processor assigns one. |
| comment | optional | string | 1-512 chars | mutable | A developer comment. |
| description | optional | string | 1-512 chars | mutable | A [localizable](#display-string-localization) description for human display. |
| displayName | optional | string | 1-64 chars | mutable | A [localizable](#display-string-localization) name for human display. |
| displayUnit | optional | string | 1-64 chars | mutable | A [localizable](#display-string-localization) unit name for human display. |
| unit | optional | `Unit` | | mutable | The unit type of the telemetry. |
| writable | optional | boolean | | immutable | A boolean value that indicates whether the property is writable or not. The default value is false (read-only). |

### Property Examples
```json
{
    "@type": "Property",
    "name": "setPointTemp",
    "schema": "double",
    "writable": true
}
```

## Command
A command describes a function or operation that can be performed on a device or digital twin.

### Command properties
| Property | Required | Data type | Limits | Version rules | Description |
| --- | --- | --- | --- | --- | --- |
| @type | required | IRI | | immutable | The type of command object. This must refer to the `Command` metamodel class. |
| name | required | string | 1-64 chars | immutable | The "programming" name of the command. The name must match this regular expression `^[a-zA-Z_][a-zA-Z0-9_]*$`. The name must be unique for all contents in this interface. |
| @id | optional | [DT id](#digital-twin-identifier-format) | max 256 chars | version number can be incremented | The ID of the command description. If no @id is provided, the digital twin interface processor assigns one. |
| comment | optional | string | 1-512 chars | mutable | A developer comment. |
| description | optional | string | 1-512 chars | mutable | A [localizable](#display-string-localization) description for human display. |
| displayName | optional | string | 1-64 chars | mutable | A [localizable](#display-string-localization) name for human display. |
| commandType | optional | `CommandType` | | immutable | The type of command execution, either `synchronous` or `asynchronous`. The default value is `synchronous`. |
| request | optional | `CommandPayload` | | immutable | A description of the input to the command. |
| response | optional | `CommandPayload` | | immutable | A description of the output of the command. |

### Command examples
```json
{
    "@type": "Command",
    "name": "reboot",
    "commandType": "asynchronous",
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

### CommandType
Command types are defined for the command's `commandType` property.

| `commandType` value | Description |
| --- | --- |
| asynchronous | The command completes sometime after control returns to the caller. After the command completes, the result, and any outputs, are available. |
| synchronous | The command is complete when control returns to the caller. The result, and any outputs, are available immediately. This is the default value for `commandType`. |

### CommandPayload
A `CommandPayload` describes the inputs to or the outputs from a command.

#### CommandPayload properties
| Property | Required | Data type | Limits | Version rules | Description |
| --- | --- | --- | --- | --- | --- |
| name | required | string | 1-64 chars | immutable | The "programming" name of the field. The name must match this regular expression `^[a-zA-Z_][a-zA-Z0-9_]*$`. The name must be unique for all fields in this object. |
| schema | required | `Schema` | | immutable | The data type of the field. |
| @id | optional | [DT id](#digital-twin-identifier-format) | max 256 chars | version number can be incremented | The ID of the command payload. If no @id is provided, the digital twin interface processor assigns one. |
| comment | optional | string | 1-512 chars | mutable | A developer comment. |
| description | optional | string | 1-512 chars | mutable | A [localizable](#display-string-localization) description for human display. |
| displayName | optional | string | 1-64 chars | mutable | A [localizable](#display-string-localization) name for human display. |
| displayUnit | optional | string | 1-64 chars | mutable | A [localizable](#display-string-localization) unit name for human display. |
| unit | optional | `Unit` | | mutable | The unit type of the telemetry. |

## Schemas
Schemas describe the on-the-wire or serialized format of the data in a digital twin interface. A full set of primitive data types are provided, along with support for a variety of complex schemas in the forms of `Arrays`, `Enums`, `Maps`, and `Objects`. Schemas described using DTDL are compatible with popular serialization formats, including JSON, Avro, Protobuf, and others.

## Primitive schemas
A full set of primitive data types are provided and can be specified directly as the value in a schema statement in a digital twin interface.

| Digital twin primitive schema | Description |
| --- | --- |
| boolean | A boolean value. |
| date | A date in ISO 8601 format. |
| datetime | A date and time in ISO 8601 format. |
| double | An IEEE 8-byte floating point number. |
| duration | A duration in ISO 8601 format. |
| float | An IEEE 4-byte floating point number. |
| integer | A signed 4-byte integer. |
| long | A signed 8-byte integer. |
| string | A UTF8 string. |
| time | A time in ISO 8601 format. |

## Complex schemas
Complex schemas are designed for supporting complex data types made up of primitive data types. Currently the following complex schemas are provided: `Array`, `Enum`, `Map`, and `Object`. A complex schema can be specified directly as the value in a schema statement or described in the interface schemas set and referenced in the schema statement.

## Array
An Array describes an indexable data type where each element is of the same schema. The schema of an array element can itself be a primitive or complex schema.

### Array properties
| Property | Required | Data type | Limits | Version rules |Description |
| --- | --- | --- | --- | --- | --- |
| @type | required | IRI | | immutable | The type of array object. This must refer to the `Array` metamodel class. |
| elementSchema | required | `Schema` | | immutable | The data type of the array elements. |
| @id | optional | [DT id](#digital-twin-identifier-format) | max 256 chars | version number can be incremented | The ID of the array description. If no @id is provided, the digital twin interface processor assigns one. |
| comment | optional | string | 1-512 chars | mutable | A developer comment. |
| description | optional | string | 1-512 chars | mutable | A [localizable](#display-string-localization) description for human display. |
| displayName | optional | string | 1-64 chars | mutable | A [localizable](#display-string-localization) name for human display. |

### Array examples
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

## Enum
An Enum describes a data type with a set of named labels that map to values. The values in an enum can be either integers or strings, but the labels are always strings.

### Enum properties
| Property | Required | Data type | Limits | Version rules | Description |
| --- | --- | --- | --- | --- | --- |
| @type | required | IRI | | immutable | The type of enum object. This must refer to the `Enum` metamodel class. |
| enumValues | required | `EnumValue` | | immutable | A set of enum value and label mappings. |
| valueSchema | required | integer or string | | immutable | The data type for the enum values. All enum values must be of the same type. |
| @id | optional | [DT id](#digital-twin-identifier-format) | max 256 chars | version number can be incremented | The ID of the enum description. If no @id is provided, the digital twin interface processor assigns one. |
| comment | optional | string | 1-512 chars | mutable | A developer comment. |
| description | optional | string | 1-512 chars | mutable | A [localizable](#display-string-localization) description for human display. |
| displayName | optional | string | 1-64 chars | mutable | A [localizable](#display-string-localization) name for human display. |

### Enum examples
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

### EnumValue
An `EnumValue` describes an element of an enum.

### EnumValue properties
| Property | Required | Data type | Limits | Version rules | Description |
| --- | --- | --- | --- | --- | --- |
| name | required | string | 1-64 chars | immutable | The "programming" name of the enum value. The name must match this regular expression `^[a-zA-Z_][a-zA-Z0-9_]*$`. The name must be unique for all enum values in this enum. |
| enumValue | required | int or string | | immutable | The on-the-wire value that maps to the `EnumValue`. EnumValue may be either an integer or a string and must be unique for all enum values in this enum. |
| @id | optional | [DT id](#digital-twin-identifier-format) | max 256 chars | version number can be incremented | The ID of the enum description. If no @id is provided, the digital twin interface processor assigns one. |
| comment | optional | string | 1-512 chars | mutable | A developer comment. |
| description | optional | string | 1-512 chars | mutable | A [localizable](#display-string-localization) description for human display. |
| displayName | optional | string | 1-64 chars | mutable | A [localizable](#display-string-localization) name for human display. |

## Map
A `Map` describes a data type of key-value pairs where the values share the same schema. The key in a map must be a string. The values in a map can be any schema.

### Map properties
| Property | Required | Data type | Limits | Version rules | Description |
| --- | --- | --- | --- | --- | --- |
| @type | required | IRI | | immutable | The type of map object. This must refer to the `Map` metamodel class. |
| mapKey | required | `MapKey` | | immutable | A description of the keys in the map. |
| mapValue | required | `MapValue` | | immutable | A description of the values in the map. |
| @id | optional | [DT id](#digital-twin-identifier-format) | max 256 chars | version number can be incremented | The ID of the map description. If no @id is provided, the digital twin interface processor assigns one. |
| comment | optional | string | 1-512 chars | mutable | A developer comment. |
| description | optional | string | 1-512 chars | mutable | A [localizable](#display-string-localization) description for human display. |
| displayName | optional | string | 1-64 chars | mutable | A [localizable](#display-string-localization) name for human display. |

### Map examples
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

### MapKey
A `MapKey` describes the key in a map. The schema of a `MapKey` must be string.

### MapKey properties
| Property | Required | Data type | Limits | Version rules | Description |
| --- | --- | --- | --- | --- | --- |
| name | required | string | 1-64 chars | immutable | The "programming" name of the map key. The name must match this regular expression `^[a-zA-Z_][a-zA-Z0-9_]*$`. |
| schema | required | `Schema` | | immutable | The data type of the map key. Must be string. |
| @id | optional | [DT id](#digital-twin-identifier-format) | max 256 chars | version number can be incremented | The ID of the map key description. If no @id is provided, the digital twin interface processor assigns one. |
| comment | optional | string | 1-512 chars | mutable | A developer comment. |
| description | optional | string | 1-512 chars | mutable | A [localizable](#display-string-localization) description for human display. |
| displayName | optional | string | 1-64 chars | mutable | A [localizable](#display-string-localization) name for human display. |

### MapValue
A `MapValue` describes the values in a map.

### MapValue properties
| Property | Required | Data type | Limits | Version rules | Description |
| --- | --- | --- | --- | --- | --- |
| name | required | string | 1-64 chars | immutable | The "programming" name of the map value. The name must match this regular expression `^[a-zA-Z_][a-zA-Z0-9_]*$`. |
| schema | required | `Schema` | | immutable | The data type of the map value. |
| @id | optional | [DT id](#digital-twin-identifier-format) | max 256 chars | version number can be incremented | The ID of the map value description. If no @id is provided, the digital twin interface processor assigns one. |
| comment | optional | string | 1-512 chars | mutable | A developer comment. |
| description | optional | string | 1-512 chars | mutable | A [localizable](#display-string-localization) description for human display. |
| displayName | optional | string | 1-64 chars | mutable | A [localizable](#display-string-localization) name for human display. |
| displayUnit | optional | string | 1-64 chars | mutable | A [localizable](#display-string-localization) unit name for human display. |
| unit | optional | `Unit` | | mutable | The unit type of the map value. |

## Object
An `Object` describes a data type made up of named fields (like a struct in C). The fields in an object map can be primitive or complex schemas.

### Object properties
| Property | Required | Data type | Limits | Version rules | Description |
| --- | --- | --- | --- | --- | --- |
| @type | required | IRI | | immutable | The type of object. This must refer to the `Object` metamodel class. |
| fields | required | set of `Field`s | | immutable | A set of field descriptions, one for each field in the object. |
| @id | optional | [DT id](#digital-twin-identifier-format) | max 256 chars | version number can be incremented | The ID of the object description. If no @id is provided, the digital twin interface processor assigns one. |
| comment | optional | string | 1-512 chars | mutable | A developer comment. |
| description | optional | string | 1-512 chars | mutable | A [localizable](#display-string-localization) description for human display. |
| displayName | optional | string | 1-64 chars | mutable | A [localizable](#display-string-localization) name for human display. |

### Object examples
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

### Field
A `Field` describes a field in an object.

#### Field properties
| Property | Required | Data type | Limits | Version rules | Description |
| --- | --- | --- | --- | --- | --- |
| name | required | string | 1-64 chars | immutable | The "programming" name of the field. The name must match this regular expression `^[a-zA-Z_][a-zA-Z0-9_]*$`. The name must be unique for all fields in this object.|
| schema | required | `Schema` | | immutable | The data type of the field. |
| @id | optional | [DT id](#digital-twin-identifier-format) | max 256 chars | version number can be incremented | The ID of the field description. If no @id is provided, the digital twin interface processor assigns one. |
| comment | optional | string | 1-512 chars | mutable | A developer comment. |
| description | optional | string | 1-512 chars | mutable | A [localizable](#display-string-localization) description for human display. |
| displayName | optional | string | 1-64 chars | mutable | A [localizable](#display-string-localization) name for human display. |
| displayUnit | optional | string | 1-64 chars | mutable | A [localizable](#display-string-localization) unit name for human display. |
| unit | optional | `Unit` | | mutable | The unit type of the field. |

## Interface schemas
Within an interface definition, complex schemas may be defined for reusability across telemetry, properties, and commands. This is designed to promote readability and improved maintenance because schemas that are reused can be defined once (per interface). Interface schemas are defined in the schemas property of an interface. When an interface is defined within a capability model, any schemas defined in that interface may only be used in that interface, not across interfaces within the same capability model.

### Interface schema properties
| Property | Required | Data type | Limits | Version rules | Description |
| --- | --- | --- | --- | --- | --- |
| @id | required | [DT id](#digital-twin-identifier-format) | max 256 chars | version number can be incremented | The globally unique identifier for the schema. |
| @type | required | `Array`, `Enum`, `Map`, or `Object` | | immutable | The type of complex schema. This must refer to one of the complex schema metamodel classes (`Array`, `Enum`, `Map`, or `Object`). |
| comment | optional | string | 1-512 chars | mutable | A developer comment. |
| description | optional | string | 1-512 chars | mutable | A [localizable](#display-string-localization) description for human display. |
| displayName | optional | string | 1-64 chars | mutable | A [localizable](#display-string-localization) name for human display. |

### Interface schema examples
```json
{
    "@id": "urn:example:reusableTypeExample:1",
    "@type": "Interface",
    "contents": [
        {
            "@type": "Telemetry",
            "name": "accelerometer1",
            "schema": "urn:example:acceleration:1"
        },
        {
            "@type": "Telemetry",
            "name": "accelerometer2",
            "schema": "urn:example:acceleration:1"
        }
    ],
    "schemas": [
        {
            "@id": "urn:example:acceleration:1",
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
    "@context": "http://azure.com/v2/contexts/Model.json"
}
```

## Model versioning
In DTDL, capability models and interfaces are versioned by a single version number (positive integer) in the last segment of their identifiers. Once a version of a capability model or interface is finalized (published, used in production, etc.), its definition is immutable.

DTDL provides two ways to create new versions of capabilities models and interfaces.
1. Entirely new capability models and interfaces can be created to describe major changes, including breaking changes, such as removing a capability (telemetry, property, or command). Each major version has new identifier and starts its version number at 1.
2. New versions of capability models and interfaces can be created to describe minor changes, such as adding a new capability (telemetry, property, or command) or fixing a bug in a display name or description. Each minor version increments the version number of the capability model or interface.

In general, minor changes include adding new capabilities (telemetry, properties, and commands) or changing metadata, such as display names or descriptions. Changing capability names or schemas or removing capabilities is not allowed from version to version. The specific rules for versioning are described with each model element in this document.

### Model Versioning Examples
This example shows the kinds of changes that are allowed in new versions of an interface. In this example,
* The interface’s @id is updated to reflect the new version.
* The interface’s description is updated.
* The temp telemetry’s displayName and displayUnit are updated.
* A new humidity telemetry is added.
```json
{
    "@id": "urn:example:thermostat:1",
    "@type": "Interface",
    "displayName": "Thermostat",
    "description": "Thermostat that measures temperature.",
    "contents": [
        {
            "@type": "Telemetry",
            "name": "temp",
            "displayName": "Measured temp",
            "schema": "double",
            "displayUnit": "F"
        }
    ],
    "@context": "http://azure.com/v2/contexts/Model.json"
}
```
```json
{
    "@id": "urn:example:thermostat:2",
    "@type": "Interface",
    "displayName": "Thermostat",
    "description": "Thermostat that measures temperature and humidity.",
    "contents": [
        {
            "@type": "Telemetry",
            "name": "temp",
            "displayName": "Measured temperature",
            "schema": "double",
            "displayUnit": "Fahrenheit"
        },
        {
            "@type": "Telemetry",
            "name": "humidity",
            "schema": "integer"
        }
    ],
    "@context": "http://azure.com/v2/contexts/Model.json"
}
```

## Additional concerns

### Digital Twin identifier format
Identities for all digital twin model elements must follow the digital twin identifier format. The digital twin model element identifier format is a simple URN, summarized here.
* Identifiers must start with the string "urn:".
* Each segment may only contain the characters a-z, A-Z, 0-9, and underscore, conforming to this regular expression `^[a-zA-Z_][a-zA-Z0-9_]*$`.
* The only separator allowed is the colon character ':'.
* Identifiers are case sensitive.
* A valid identifier has at least four segments.
  1. The "urn" segment.
  2. A namespace segment. This segment may be made up of one or more segments.
  3. The name segment (second-to-last segment).
  4. The version segment (last segment).

Examples of digital twin model element identifiers.
```
urn:example:Thermostat:1
urn:iot:area51:dept42:Thruster:345
urn:contoso:AHU:dischargeAirTempSensor:6
```

### Display string localization
Some string properties in digital twins are meant for human display and, therefore, support localization. Localizable string in digital twin use JSON-LD's string internationalization support. Each localizable property (i.e. `displayName`, `displayUnit`, and `description`) is defined to be a JSON-LD language map (`"@container": "@language"`). The default language for digital twin documents is English. Localized string values are declared using their language code (as defined in [BCP47](https://tools.ietf.org/html/bcp47)). Because of the composable nature of JSON-LD graphs, localized strings can be prepared in a separate file and merged with an existing graph.

#### Localization examples
In this example, no language code is used for the `displayName` property, so the default language English is used.
```json
{
    "@id": "urn:example:thermostat:1",
    "@type": "Interface",
    "displayName": "Thermostat"
}
```
In this example, the `displayName` property is localized into multiple languages.
```json
{
    "@id": "urn:example:thermostat:1",
    "@type": "Interface",
    "displayName": {
        "en": "Thermostat",
        "it": "Termostato"
    }
}
```

### Context
When writing a digital twin definition, it’s necessary to specify the version of DTDL being used. Because DTDL is based on JSON-LD, we use the JSON-LD context (the `@context` statement) to specify the version of DTDL being used.

For this version of DTDL, the context is exactly `http://azure.com/v2/contexts/Model.json`.
