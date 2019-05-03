# Digital Twin Definition Language
**Public Preview, Version 0.2.0**

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

## Introduction
This document specifies the Digital Twin Definition Language (DTDL), a language for describing models and interfaces for IoT digital twins. Digital twins are models of entities in the physical environment such as shipping containers, rooms, factory floors, and other entities that participate in IoT solutions. Broadly, modeling enables IoT solutions to provision, use, and configure IoT devices and logical entities from multiple sources in a single solution. Using DTDL to describe a digital twin's capabilities enables the IoT platform and IoT solutions to leverage the semantics of the entity.

## Digital Twin Definition Language
Digital twins are described using a variant of JSON called JSON-LD. JSON-LD is designed to be usable directly as JSON as well as usable in Resource Description Framework (RDF) systems. RDF is a widely adopted standard for describing resources in a distributed, extensible way. We chose JSON-LD because it is JSON and it is an easy-to-use language for RDF. Developers can use DTDL with no knowledge of RDF, but equally important, can take advantage of semantic annotations and RDF using the same entity definitions.

DTDL is made up of a set of metamodel classes (described in the rest of this document) that define the capabilities of digital twins. There are two top-level classes, `CapabilityModel` and `Interface`, that describe digital twins and the capabilities of digital twins, respectively. There are three metamodel classes that describe capabilities: `Telemetry`, `Property`, and `Command`. In addition, because data is a key element in IoT solutions, DTDL provides a data description language that is compatible with many popular serialization formats, including JSON and binary serialization formats. When a digital twin uses DTDL, it describes its capabilities using these metamodel classes (`Interfaces`, `Telemetry`, `Properties`, `Commands`, and data types) and often implements those capabilities using an SDK in terms of these metamodel classes.

Lastly, DTDL provides semantic type annotations of capabilities, so that analytics, machine learning, UIs, and other computation can reason about the semantics of the data, not just the schema of the data. For example, properties that are semantically annotated as "temperature" can be reasoned about as temperature (charted together, compared, converted to like units, etc.) instead of simply double data types.

When writing a digital twin definition, it's necessary to specify the version of DTDL being used. Because DTDL is based on JSON-LD, we use the JSON-LD context (the `@context` statement) to specify the version of DTDL being used.

## CapabilityModels and Interfaces
There are two top-level metamodel classes: `CapabilityModel` and `Interface`. Capability models describe a complete digital twin, such as a physical device or a space (such as a room). Often, capability models are associated with a product SKU, such as a "Tracker Tron 1000" asset tracker, while interfaces describe the related capabilities of a digital twin (its telemetry, properties, and commands). Interfaces are reusable and can be reused across different capability models. Capability models are often made up of multiple interfaces.

## CapabilityModel
A `CapabilityModel` describes a complete digital twin, such as a physical device or a space (such as a room) and defines the set of interfaces implemented by the digital twin. A capability model is an object with the type `CapabilityModel` (`"@type": "CapabilityModel"`).

Because a capability model definition includes the fully qualified identity of the interfaces that it implements (including the full three-part version number), when an interface is changed and is assigned a new version number (and therefore a new ID), the capability model does not automatically implement the changed interface. If it is intended that the capability model implement the changed interface, then the capability model must also be updated.

### CapabilityModel properties
| Property | Required | Data type | Description |
| --- | --- | --- | --- |
| @id | required | [DT id](#digital-twin-identity-format) | An identifier for the capability model that follows the digital twin identity format. Two capability models with same identifier refer to the same capability model. |
| @type | required | IRI | The type of capability model instance. This must refer to the `CapabilityModel` metamodel class. |
| @context | required | IRI | The context to use when processing this capability model. For this version, it must be set to `http://azureiot.com/v0/contexts/CapabilityModel.json` |
| implements | required | set of `Interface`s | A set of interfaces or interface ids. The set of interfaces listed is a minimum--the digital twin may implement additional interfaces not listed in the capability model. |
| comment | optional | string | A developer comment. |
| description | optional | string | A [localizable](#display-string-localization) description for human display. |
| displayName | optional | string | A [localizable](#display-string-localization) name for human display. |

### CapabilityModel examples
This `CapabilityModel` example shows a thermostat that implements two `Interface`s.
```json
{
    "@id": "http://example.com/thermostatDevice/1.0.0",
    "@type": "CapabilityModel",
    "displayName": "Thermostat T-1000",
    "implements": [
        "http://example.com/thermostat/1.0.0",
        "http://azureiot.com/interfaces/deviceInformation/1.1.3"
    ],
    "@context": "http://azureiot.com/v0/contexts/CapabilityModel.json"
}
```
This example shows defining an `Interface` inline with a `CapabilityModel`.
```json
{
    "@id": "http://example.com/thermostatDevice/1.0.0",
    "@type": "CapabilityModel",
    "displayName": "Thermostat T-1000",
    "implements": [
        {
            "@id": "http://example.com/thermostat/1.0.0",
            "@type": "Interface",
            "displayName": "Thermostat",
            "contents": [
            ],
        },
        "http://azureiot.com/interfaces/deviceInformation/1.1.3"
    ],
    "@context": [
        "http://azureiot.com/v0/contexts/CapabilityModel.json",
        "http://azureiot.com/v0/contexts/Interface.json"
    ]
}
```

## Interface
An `Interface` describes related capabilities that are implemented by a digital twin. Interfaces are reusable and can be reused across different capability models. An interface is an object with the type `Interface` (`"@type": "Interface"`).

### Interface properties
| Property | Required | Data type | Description |
| --- | --- | --- | --- |
| @id | required | [DT id](#digital-twin-identity-format) | An identifier for the interface that follows the digital twin identity format. Two interfaces with same identifier refer to the same interface. |
| @type | required | IRI | The type of interface object. This must refer to the `Interface` metamodel class. |
| @context | required | IRI | The context to use when processing this interface. For this version, it must be set to `http://azureiot.com/v0/contexts/Interface.json` |
| comment | optional | string | A developer comment. |
| contents | optional | set of `Telemetry`, `Property`, or `Command` | A set of objects that describe the capabilities (telemetry, property, and/or commands) of this interface. |
| description | optional | string | A [localizable](#display-string-localization) description for human display. |
| displayName | optional | string | A [localizable](#display-string-localization) name for human display. |
| schemas | optional | set of `Schema`s | A set of IRIs or objects that refer to the reusable schemas within this interface. |

### Interface examples
This `Interface` example shows a thermostat interface that implements one telemetry that reports the temperature measurement and one read/write property that controls the desired temperature.
```json
{
    "@id": "http://example.com/thermostat/1.0.0",
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
    "@context": "http://azureiot.com/v0/contexts/Interface.json"
}
```

## Capabilities
There are three types of capability: `Telemetry`, `Properties`, and `Commands`. Capabilities describe related sets of functionality, such as the capabilities that are needed in an asset tracker device or the capabilities that are needed in conference room. Capabilities are the inputs and outputs of the digital twin.

## Telemetry
Telemetry describes the data emitted by a device or entity, whether the data is a regular stream of sensor readings or an occasional error or information message. Telemetry is an object with the type `Telemetry` (`"@type": "Telemetry"`).

### Telemetry properties
| Property | Required | Data type | Description |
| --- | --- | --- | --- |
| @id | optional | IRI | The ID of the telemetry description. If no @id is provided, the digital twin interface processor assigns one. |
| @type | required | IRI | The type of telemetry object. This must refer to the `Telemetry` metamodel class. |
| name | required | string | The "programming" name of the telemetry. The name must match this regular expression `^[a-zA-Z_][a-zA-Z0-9_]*$`. The name must be unique for all contents in this interface. |
| schema | required | `Schema` | The data type of the telemetry. |
| comment | optional | string | A developer comment. |
| description | optional | string | A [localizable](#display-string-localization) description for human display. |
| displayName | optional | string | A [localizable](#display-string-localization) name for human display. |
| displayUnit | optional | string | A [localizable](#display-string-localization) unit name for human display. |
| unit | optional | `Unit` | The unit type of the telemetry. |

### Telemetry examples
```json
{
    "@type": "Telemetry",
    "name": "temp",
    "schema": "double"
}
```

## Property
A Property describes the read-only and read-write state of a digital twin. For example, a device serial number may be a read-only property and the temperature set point on a thermostat may be a read-write property. A property is an object with the type `Property` (`"@type": "Property"`).

### Property properties
| Property | Required | Data type | Description |
| --- | --- | --- | --- |
| @id | optional | IRI | The ID of the property description. If no @id is provided, the digital twin interface processor assigns one. |
| @type | required | IRI | The type of property object. This must refer to the `Property` metamodel class. |
| name | required | string | The "programming" name of the property. The name must match this regular expression `^[a-zA-Z_][a-zA-Z0-9_]*$`. The name must be unique for all contents in this interface. |
| schema | required | `Schema` | The data type of the property. |
| comment | optional | string | A developer comment. |
| description | optional | string | A [localizable](#display-string-localization) description for human display. |
| displayName | optional | string | A [localizable](#display-string-localization) name for human display. |
| displayUnit | optional | string | A [localizable](#display-string-localization) unit name for human display. |
| unit | optional | `Unit` | The unit type of the telemetry. |
| writable | optional | boolean | A boolean value that indicates whether the property is writable or not. The default value is false (read-only). |

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
A command describes a function or operation that can be performed on a digital twin. A command is an object with the type `Command` (`"@type": "Command"`).

### Command properties
| Property | Required | Data type | Description |
| --- | --- | --- | --- |
| @id | optional | IRI | The ID of the command description. If no @id is provided, the digital twin interface processor assigns one. |
| @type | required | IRI | The type of command object. This must refer to the `Command` metamodel class. |
| name | required | string | The "programming" name of the command. The name must match this regular expression `^[a-zA-Z_][a-zA-Z0-9_]*$`. The name must be unique for all contents in this interface. |
| comment | optional | string | A developer comment. |
| description | optional | string | A [localizable](#display-string-localization) description for human display. |
| displayName | optional | string | A [localizable](#display-string-localization) name for human display. |
| commandType | optional | `CommandType` | The type of command execution, either `synchronous` or `asynchronous`. The default value is `synchronous`. |
| request | optional | `CommandPayload` | A description of the input to the command. |
| response | optional | `CommandPayload` | A description of the output of the command. |

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
| Property | Required | Data type | Description |
| --- | --- | --- | --- |
| name | required | string | The "programming" name of the field. The name must match this regular expression `^[a-zA-Z_][a-zA-Z0-9_]*$`. The name must be unique for all fields in this object. |
| schema | required | `Schema` | The data type of the field. |
| comment | optional | string | A developer comment. |
| description | optional | string | A [localizable](#display-string-localization) description for human display. |
| displayName | optional | string | A [localizable](#display-string-localization) name for human display. |
| displayUnit | optional | string | A [localizable](#display-string-localization) unit name for human display. |
| unit | optional | `Unit` | The unit type of the telemetry. |

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
An Array describes an indexable data type where each element is of the same schema. The schema of an array element can itself be a primitive or complex schema. An array is an object with the type `Array` (`"@type": "Array"`).

### Array properties
| Property | Required | Data type | Description |
| --- | --- | --- | --- |
| @type | required | IRI | The type of array object. This must refer to the `Array` metamodel class. |
| elementSchema | required | `Schema` | The data type of the array elements. |
| comment | optional | string | A developer comment. |
| description | optional | string | A [localizable](#display-string-localization) description for human display. |
| displayName | optional | string | A [localizable](#display-string-localization) name for human display. |

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
An Enum describes a data type with a set of named labels that map to values. The values in an enum can be either integers or strings, but the labels are always strings. An enum is an object with the type `Enum` (`"@type": "Enum"`).

### Enum properties
| Property | Required | Data type | Description |
| --- | --- | --- | --- |
| @type | required | IRI | The type of enum object. This must refer to the `Enum` metamodel class. |
| enumValues | required | `EnumValue` | A set of enum value and label mappings. |
| comment | optional | string | A developer comment. |
| description | optional | string | A [localizable](#display-string-localization) description for human display. |
| displayName | optional | string | A [localizable](#display-string-localization) name for human display. |

### Enum examples
```json
{
    "@type": "Telemetry",
    "name": "state",
    "schema": {
        "@type": "Enum",
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
| Property | Required | Data type | Description |
| --- | --- | --- | --- |
| name | required | string | The "programming" name of the enum value. The name must match this regular expression `^[a-zA-Z_][a-zA-Z0-9_]*$`. The name must be unique for all enum values in this enum. |
| comment | optional | string | A developer comment. |
| description | optional | string | A [localizable](#display-string-localization) description for human display. |
| displayName | optional | string | A [localizable](#display-string-localization) name for human display. |
| value | required | int or string | The on-the-wire value that maps to the `EnumValue`. Value may be either an integer or a string and must be unique for all enum values in this enum. |

## Map
A `Map` describes a data type of key-value pairs where the values share the same schema. The key in a map must be a string. The values in a map can be any schema. A map is an object with the type `Map` (`"@type": "Map"`).

### Map properties
| Property | Required | Data type | Description |
| --- | --- | --- | --- |
| @type | required | IRI | The type of map object. This must refer to the `Map` metamodel class. |
| mapKey | required | `MapKey` | A description of the keys in the map. |
| mapValue | required | `MapValue` | A description of the values in the map. |
| comment | optional | string | A developer comment. |
| description | optional | string | A [localizable](#display-string-localization) description for human display. |
| displayName | optional | string | A [localizable](#display-string-localization) name for human display. |

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
| Property | Required | Data type | Description |
| --- | --- | --- | --- |
| name | required | string | The "programming" name of the map key. The name must match this regular expression `^[a-zA-Z_][a-zA-Z0-9_]*$`. |
| schema | required | `Schema` | The data type of the map key. Must be string. |
| comment | optional | string | A developer comment. |
| description | optional | string | A [localizable](#display-string-localization) description for human display. |
| displayName | optional | string | A [localizable](#display-string-localization) name for human display. |

### MapValue
A `MapValue` describes the values in a map.

### MapValue properties
| Property | Required | Data type | Description |
| --- | --- | --- | --- |
| name | required | string | The "programming" name of the map value. The name must match this regular expression `^[a-zA-Z_][a-zA-Z0-9_]*$`. |
| schema | required | `Schema` | The data type of the map value. |
| comment | optional | string | A developer comment. |
| description | optional | string | A [localizable](#display-string-localization) description for human display. |
| displayName | optional | string | A [localizable](#display-string-localization) name for human display. |
| displayUnit | optional | string | A [localizable](#display-string-localization) unit name for human display. |
| unit | optional | `Unit` | The unit type of the map value. |

## Object
An `Object` describes a data type made up of named fields (like a struct in C). The fields in an object map be primitive or complex schemas. An object is an object with the type `Object` (`"@type": "Object"`).

### Object properties
| Property | Required | Data type | Description |
| --- | --- | --- | --- |
| @type | required | IRI | The type of object. This must refer to the `Object` metamodel class. |
| fields | required | set of `Field`s | A set of field descriptions, one for each field in the object. |
| comment | optional | string | A developer comment. |
| description | optional | string | A [localizable](#display-string-localization) description for human display. |
| displayName | optional | string | A [localizable](#display-string-localization) name for human display. |

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
| Property | Required | Data type | Description |
| --- | --- | --- | --- |
| name | required | string | The "programming" name of the field. The name must match this regular expression `^[a-zA-Z_][a-zA-Z0-9_]*$`. The name must be unique for all fields in this object.|
| schema | required | `Schema` | The data type of the field. |
| comment | optional | string | A developer comment. |
| description | optional | string | A [localizable](#display-string-localization) description for human display. |
| displayName | optional | string | A [localizable](#display-string-localization) name for human display. |
| displayUnit | optional | string | A [localizable](#display-string-localization) unit name for human display. |
| unit | optional | `Unit` | The unit type of the field. |

## Interface schemas
Within an interface definition, complex schemas may be defined for reusability across telemetry, properties, and commands. This is designed to promote readability and improved maintenance because schemas that are reused can be defined once (per interface). Interface schemas are defined in the schemas property of an interface.

### Interface schema properties
| Property | Required | Data type | Description |
| --- | --- | --- | --- |
| @id | required | IRI | The globally unique identifier for the schema. |
| @type | required | `Array`, `Enum`, `Map`, or `Object` | The type of complex schema. This must refer to one of the complex schema metamodel classes (`Array`, `Enum`, `Map`, or `Object`). |
| mapKey | required | `MapKey` | A description of the keys in the map. |
| mapValue | required | `MapValue` | A description of the values in the map. |
| comment | optional | string | A developer comment. |
| description | optional | string | A [localizable](#display-string-localization) description for human display. |
| displayName | optional | string | A [localizable](#display-string-localization) name for human display. |

### Interface schema examples
```json
{
    "@id": "http://example.com/reusableTypeExample/1.0.0",
    "@type": "Interface",
    "contents": [
        {
            "@type": "Telemetry",
            "name": "accelerometer1",
            "schema": "http://example.com/acceleration"
        },
        {
            "@type": "Telemetry",
            "name": "accelerometer2",
            "schema": "http://example.com/acceleration"
        }
    ],
    "schemas": [
        {
            "@id": "http://example.com/acceleration",
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
    ]
}
```

## Additional concerns

### Digital Twin identity format
Identities for CapabilityModels and Interfaces must follow the digital twin identity format. The digital twin identity format is a three-part Internationalized Resource Identifier (IRI) made up of an IRI prefix, name, and semantic version number: `<IRI-prefix>/<name>/<version>`.
* The IRI prefix is any valid IRI scheme, authority, and path (no query or fragment components allowed).
* The name must match this regular expression `^[a-zA-Z_][a-zA-Z0-9_]*$`.
* The version must be a three-part semantic version number (major, minor, and patch only) that follows the semver.org versioning rules.
* The IRI does not need to resolve to an actual resource.

#### Digital Twin identity equality
Digital twin identities follow [the RDF spec for IRI equality](https://www.w3.org/TR/rdf11-concepts/#section-IRIs). RDF IRI equality is defined as: two IRIs are equal if and only if they are equivalent under Simple String Comparison according to [section 5.3.1](https://tools.ietf.org/html/rfc3987#section-5.3.1) of RFC3987. We make a variation on the Simple String Comparison to perform a case-insensitive comparison.

When comparing digital twin identities for equality, the case-insensitive Simple String Comparison algorithm must be used (a case-insensitive character-by-character comparison like stricmp). This means the following digital twin identities are considered to be different identities.
```
http://example.com/myInterface/1.2.3
http://example.com/./myInterface/1.2.3
http://example.com:80/myInterface/1.2.3
```
The following digital twin identities are considered to be the same identities.
```
http://example.com/myInterface/1.2.3
HTTP://example.com/myInterface/1.2.3
http://example.com/MYINTERFACE/1.2.3
```

#### Digital Twin identity examples
This example shows an IRI using an HTTP scheme.
```
http://example.com/myInterfaces/assetTracker/1.2.3
```
This example shows an IRI using a URN scheme.
```
urn:example:myInterfaces/assetTracker/1.2.3
```

### Display string localization
Some string properties in digital twins are meant for human display and, therefore, support localization. Localizable string in digital twin use JSON-LD's string internationalization support. Each localizable property (i.e. `displayName`, `displayUnit`, and `description`) is defined to be a JSON-LD language map (`"@container": "@language"`). The default language for digital twin documents is English. Localized string values are declared using their language code (as defined in [BCP47](https://tools.ietf.org/html/bcp47)). Because of the composable nature of JSON-LD graphs, localized strings can be prepared in a separate file and merged with an existing graph.

#### Localization examples
In this example, no language code is used for the `displayName` property, so the default language English is used.
```json
{
    "@id": "http://example.com/thermostat/1.0.0",
    "@type": "Interface",
    "displayName": "Thermostat"
}
```
In this example, the `displayName` property is localized into multiple languages.
```json
{
    "@id": "http://example.com/thermostat/1.0.0",
    "@type": "Interface",
    "displayName": {
        "en": "Thermostat",
        "it": "Termostato"
    }
}
```

### Context
When writing a digital twin definition, it’s necessary to specify the version of DTDL being used. Because DTDL is based on JSON-LD, we use the JSON-LD context (the `@context` statement) to specify the version of DTDL being used.

For this version of DTDL, the capability model context is exactly `http://azureiot.com/v0/contexts/CapabilityModel.json`.

For this version of DTDL, the interface context is exactly `http://azureiot.com/v0/contexts/Interface.json`.

