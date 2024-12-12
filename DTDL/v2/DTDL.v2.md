# Digital Twins Definition Language (DTDL)

**Version 2**

This version of DTDL is used for [Azure Digital Twins](https://azure.microsoft.com/services/digital-twins/) and [IoT Plug and Play](https://aka.ms/iotpnp).

> Note: Since April 2023, DTDL v3 is the latest supported version in Azure products and services (except IoT Central)

## Table of Contents

* [Introduction](#introduction)
* [Digital Twins Definition Language](#digital-twins-definition-language)
* [Interface](#interface)
* [Telemetry](#telemetry)
* [Property](#property)
* [Command](#command)
* [Relationship](#relationship)
* [Component](#component)
* [Primitive schema](#primitive-schema)
* [Array](#array)
* [Enum](#enum)
* [Map](#map)
* [Object](#object)
* [Geospatial Schemas](#geospatial-schemas)
* [Interface schemas](#interface-schemas)
* [Semantic Type](#semantic-type)
* [Model Versioning](#model-versioning)
* [Additional concerns](#additional-concerns)
* [Language extensions](#language-extensions)
* [Changes from Version 1](#changes-from-version-1)
* [References](#references)

## Introduction

This document describes the Digital Twins Definition Language (DTDL), a language for describing digital twin models of smart devices, assets, spaces, and environments.
Broadly, modeling enables digital twin solutions to provision, use, and configure digital twins of all kinds from multiple sources in a single solution.
Using DTDL to describe any digital twin's abilities enables the platform and solutions to leverage the semantics of each digital twin.

## Digital Twins Definition Language

Digital twins for smart devices, assets, spaces, and environments are described using a variant of JSON called JSON-LD.
JSON-LD is designed to be usable directly as JSON as well as usable in Resource Description Framework (RDF) systems.
RDF is a widely adopted standard for describing resources in a distributed, extensible way.
We chose JSON-LD because it is JSON and because it is an easy-to-use language for RDF.
Developers can use DTDL with no knowledge of RDF, but equally important, can take advantage of semantic annotations and RDF using the same entity definitions.

The Digital Twins Definition Language (DTDL) is made up of a set of metamodel classes (described in the rest of this document) that are used to define the behavior of all digital twins (including devices).
The main metamodel classes that describe these behaviors are Interface, Command, Component, Property, Relationship, and Telemetry.
In addition, because data is a key element in digital twin solutions, DTDL provides a data description language that is compatible with popular serialization formats including JSON.
When a digital twin is modeled using the DTDL, its behaviors are defined using these metamodel classes (Interface, Command, Component, Property, Relationship, Telemetry, and data types) and it often implements those behaviors using an SDK in terms of these metamodel classes.

Lastly, the Digital Twins Definition Language provides semantic type annotations of behaviors, so that analytics, machine learning, UIs, and other computation can reason about the semantics of the data, not just the schema of the data.
For example, properties that are semantically annotated as "temperature" can be reasoned about as temperature (charted together, compared, converted to like units, etc.) instead of simply double data types.

When writing a digital twin definition, it's necessary to specify the version of DTDL being used.
Because DTDL is based on JSON-LD, we use the JSON-LD context (the `@context` statement) to specify the version of DTDL being used.
For DTDL version 2, the appropriate context specifier is "dtmi:dtdl:context;2".
See the [Context](#context) section for more details.

## Interface

An Interface describes the contents (Commands, Components, Properties, Relationships, and Telemetries) of any digital twin.
Interfaces are reusable and can be reused as the schema for Components in another Interface.

The chart below lists the properties that may be part of an Interface.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `@context` | required (at least once in the doc) | [IRI](#internationalized-resource-identifier) | max 2048 characters | The context to use when processing this Interface. For this version, it must be set to "dtmi:dtdl:context;2". |
| `@type` | required | [IRI](#internationalized-resource-identifier) |  | This must be "Interface". |
| `@id` | required | [DTMI](#digital-twin-model-identifier) | max 128 characters | An identifer for the Interface. |
| `comment` | optional | *string* | max 512 characters | A comment for model authors. |
| `contents` | optional | set of [Commands](#command), [Components](#component), [Properties](#property), [Relationships](#relationship), and [Telemetries](#telemetry) | max 300 Contents in set, including those imported via `extends` | A set of elements that define the contents of this Interface. |
| `description` | optional | localizable *string* | max 512 characters | A localizable description for display. |
| `displayName` | optional | localizable *string* | max 64 characters | A localizable name for display. |
| `extends` | optional | set of [Interfaces](#interface) | max 2 Interfaces in set; max depth of 10 levels | A set of DTMIs that refer to Interfaces from which this Interface inherits contents. Interfaces can inherit from multiple Interfaces. |
| `schemas` | optional | set of [Arrays](#array), [Enums](#enum), [Maps](#map), and [Objects](#object) |  | A set of complex schema objects that are reusable within this Interface. |

### Interface examples

The following Interface example shows a thermostat device Interface.
The Interface has one Telemetry that reports the temperature measurement, and one read/write Property that controls the desired temperature.

```json
{
  "@context": "dtmi:dtdl:context;2",
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
  ]
}
```

The following Interface example shows a *Phone* device that has two cameras as Components, and the *DeviceInformation* Interface as another Component.

> Note that for this model to be complete and valid, Interface definitions for "dtmi:com:example:Camera;3" and "dtmi:azure:deviceManagement:DeviceInformation;1" must be provided.

```json
{
  "@context": "dtmi:dtdl:context;2",
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
      "schema": "dtmi:azure:deviceManagement:DeviceInformation;1"
    }
  ]
}
```

The following Interface example shows a digital twin model of a building that has a *name* Property and a Relationship to rooms contained in the building.

> Note that unlike the example above, no definition is required for "dtmi:com:example:Room;1", because the datatype of the Relationship `target` property is DTMI, not Interface, so it has "by reference" semantics.

```json
{
  "@context": "dtmi:dtdl:context;2",
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
  ]
}
```

The following Interface example shows how Interface inheritance can be used to create specialized Interfaces from more general Interfaces by inheriting the `contents` of the latter.
In this example, the *ConferenceRoom* Interface inherits `contents` from the *Room* Interface.
Through inheritance, the *ConferenceRoom* has two Properties: the *occupied* Property (from *Room*) and the *capacity* Property (from *ConferenceRoom*).

```json
[
  {
    "@context": "dtmi:dtdl:context;2",
    "@id": "dtmi:com:example:Room;1",
    "@type": "Interface",
    "contents": [
      {
        "@type": "Property",
        "name": "occupied",
        "schema": "boolean"
      }
    ]
  },
  {
    "@context": "dtmi:dtdl:context;2",
    "@id": "dtmi:com:example:ConferenceRoom;1",
    "@type": "Interface",
    "extends": "dtmi:com:example:Room;1",
    "contents": [
      {
        "@type": "Property",
        "name": "capacity",
        "schema": "integer"
      }
    ]
  }
]
```

Inheritance designates a subtype/supertype relation between the Interfaces.
In the example above, Interface "dtmi:com:example:Room;1" is a supertype, and "dtmi:com:example:ConferenceRoom;1" is a subtype.
Tools and services may look at the value of the "extends" property to determine supertypes of the Interface, which may be used for additional validation or other service-specific purposes.

## Telemetry

Telemetry describes the data emitted by any digital twin, whether the data is a regular stream of sensor readings or a computed stream of data, such as occupancy, or an occasional alert or information message.

The chart below lists the properties that Telemetry may have.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `@type` | required | [IRI](#internationalized-resource-identifier) |  | This must at least be "Telemetry"; it can also include [a semantic type](#semantic-type). |
| `@id` | optional | [DTMI](#digital-twin-model-identifier) | max 2048 characters | An identifer for the Telemetry. If no @id is provided, one will be assigned automatically. |
| `comment` | optional | *string* | max 512 characters | A comment for model authors. |
| `description` | optional | localizable *string* | max 512 characters | A localizable description for display. |
| `displayName` | optional | localizable *string* | max 64 characters | A localizable name for display. |
| `name` | required | *string* | max 64 characters; contains only alphanumerics and underscore, starting with a letter, ending with alphanumeric; must be unique for all contents in Interface | The programming name of the element. |
| `schema` | required | [Schema](#schema) | must be *double*, *float*, *integer*, or *long* when a semantic type is present | The data type of the Telemetry, which is an instance of Schema. |
| `unit` | required when semantic type is present; disallowed otherwise | Unit |  | The unit type for data associated with the element. |

### Telemetry examples

The following example shows a simple Telemetry definition of a temperature measurement, with the data type *double*.

```json
{
  "@type": "Telemetry",
  "name": "temp",
  "schema": "double"
}
```

When JSON is used to serialize Telemetry data, this example shows the serialized Telemetry data for the Telemetry model definition above.

```json
"temp": 42.5
```

The following example shows a Telemetry definition with a *Temperature* semantic type and the `unit` property.

```json
{
  "@type": ["Telemetry", "Temperature"],
  "name": "temp",
  "schema": "double",
  "unit": "degreeCelsius"
}
```

## Property

A Property describes the read-only and read/write state of any digital twin.
For example, a device serial number may be a read-only Property; the desired temperature on a thermostat may be a read-write Property; and the name of a room may be a read-write Property.

Because digital twins are used in a distributed system, a Property not only describes the state of a digital twin, but also describes the synchronization of that state between different components that make up the distributed system.
For example, the state of a digital twin might be written to by an application running in the cloud, but the digital twin itself is a device that only goes online once a day, so state information can only be synced and responded to when the device is online.
Every digital twin Property has synchronization information behind it that facilitates and captures the synchronization state between the digital twin and its backing store (since this synchronization information is the same for all Properties, it is not included in the model definition).

The chart below lists the properties that a DTDL Property may have.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `@type` | required | [IRI](#internationalized-resource-identifier) |  | This must at least be "Property"; it can also include [a semantic type](#semantic-type). |
| `@id` | optional | [DTMI](#digital-twin-model-identifier) | max 2048 characters | An identifer for the Property. If no @id is provided, one will be assigned automatically. |
| `comment` | optional | *string* | max 512 characters | A comment for model authors. |
| `description` | optional | localizable *string* | max 512 characters | A localizable description for display. |
| `displayName` | optional | localizable *string* | max 64 characters | A localizable name for display. |
| `name` | required | *string* | max 64 characters; contains only alphanumerics and underscore, starting with a letter, ending with alphanumeric; must be unique for all contents in Interface; must be unique for all properties in Relationship | The programming name of the element. |
| `schema` | required | [Schema](#schema) | may not contain Array in hierarchy; must be *double*, *float*, *integer*, or *long* when a semantic type is present | The data type of the Property, which is an instance of Schema. |
| `writable` | optional | *boolean* |  | A boolean value that indicates whether the Property is writable or not. The default value is false, indicating the Property is read-only. |
| `unit` | required when semantic type is present; disallowed otherwise | Unit |  | The unit type for data associated with the element. |

### Property examples

The following example shows a Property definition of a writable temperature set-point, with the data type *double*.

```json
{
  "@type": "Property",
  "name": "setPointTemp",
  "schema": "double",
  "writable": true
}
```

The following example shows a Property definition with a *Temperature* semantic type and the `unit` property.

```json
{
  "@type": ["Property", "Temperature"],
  "name": "setPointTemp",
  "schema": "double",
  "unit": "degreeCelsius",
  "writable": true
}
```

## Command

A Command describes a function or operation that can be performed on any digital twin.

The chart below lists the properties that a DTDL Command may have.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `@type` | required | [IRI](#internationalized-resource-identifier) |  | This must be "Command". |
| `@id` | optional | [DTMI](#digital-twin-model-identifier) | max 2048 characters | An identifer for the Command. If no @id is provided, one will be assigned automatically. |
| `commandType` | optional | [CommandType](#commandtype) | must be *asynchronous* or *synchronous* | This property is deprecated. Either value, synchronous or asynchronous, has the same meaning: a command that starts execution within a configurable time and that completes execution within a configurable time. |
| `comment` | optional | *string* | max 512 characters | A comment for model authors. |
| `description` | optional | localizable *string* | max 512 characters | A localizable description for display. |
| `displayName` | optional | localizable *string* | max 64 characters | A localizable name for display. |
| `name` | required | *string* | max 64 characters; contains only alphanumerics and underscore, starting with a letter, ending with alphanumeric; must be unique for all contents in Interface | The programming name of the element. |
| `request` | optional | [CommandPayload](#commandpayload) |  | A description of the input to the Command. |
| `response` | optional | [CommandPayload](#commandpayload) |  | A description of the output of the Command. |

### Command examples

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

### CommandType

CommandType is deprecated.
Either value, `synchronous` or `asynchronous`, has the same meaning: a command that starts execution within a configurable time and that completes execution within a configurable time.

### CommandPayload

A CommandPayload describes the inputs to or the outputs from a Command.

The chart below lists the properties that CommandPayload may have.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `@type` | optional | [IRI](#internationalized-resource-identifier) |  | If provided, must be "CommandPayload". |
| `@id` | optional | [DTMI](#digital-twin-model-identifier) | max 2048 characters | An identifer for the CommandPayload. If no @id is provided, one will be assigned automatically. |
| `comment` | optional | *string* | max 512 characters | A comment for model authors. |
| `description` | optional | localizable *string* | max 512 characters | A localizable description for display. |
| `displayName` | optional | localizable *string* | max 64 characters | A localizable name for display. |
| `name` | required | *string* | max 64 characters; contains only alphanumerics and underscore, starting with a letter, ending with alphanumeric | The programming name of the element. |
| `schema` | required | [Schema](#schema) |  | The data type of the element, which is an instance of Schema. |

## Relationship

A Relationship describes a link to another digital twin and enables graphs of digital twins to be created.
A Relationship is different from a [Component](#component) because it describes a link to a separate digital twin.

The chart below lists the properties that a Relationship may have.

> Note that the datatype of the `target` property is DTMI, in contrast to the datatype of the `schema` property of Component, which is Interface.
A Component has "by value" semantics, so it is not valid unless its `schema` property identifies a valid Interface.
A Relationship has "by reference" semantics, so its validity does not depend on the identity of its `target` property (although a Relationship with a non-Interface `target` value will have minimal utility.)

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `@type` | required | [IRI](#internationalized-resource-identifier) |  | This must be "Relationship". |
| `@id` | optional | [DTMI](#digital-twin-model-identifier) | max 2048 characters | An identifer for the Relationship. If no @id is provided, one will be assigned automatically. |
| `comment` | optional | *string* | max 512 characters | A comment for model authors. |
| `description` | optional | localizable *string* | max 512 characters | A localizable description for display. |
| `displayName` | optional | localizable *string* | max 64 characters | A localizable name for display. |
| `maxMultiplicity` | optional | *integer* | must be >= 1; must be <= 500 | The maximum multiplicity for the target of the Relationship; defaults to the maximum allowable value. |
| `minMultiplicity` | optional | *integer* | must be = 0 | The minimum multiplicity for the target of the Relationship; defaults to the minimum allowable value. |
| `name` | required | *string* | max 64 characters; contains only alphanumerics and underscore, starting with a letter, ending with alphanumeric; must be unique for all contents in Interface | The programming name of the element. |
| `properties` | optional | set of [Properties](#property) | max 300 Properties in set | A set of Properties that define Relationship-specific state. |
| `target` | optional | [DTMI](#digital-twin-model-identifier) | max 2048 characters; must follow user DTMI syntax | An Interface identifier. If no target is specified, each instance target is permitted to be any Interface. |
| `writable` | optional | *boolean* |  | A boolean value that indicates whether the Relationship is writable or not. The default value is false, indicating the Relationship is read-only. |

### Relationship examples

The following example defines a Relationship to be had with a *Floor* twin.
In this example, there must be zero or one Relationship instances of floor.

```json
{
  "@type": "Relationship",
  "name": "floor",
  "minMultiplicity": 0,
  "maxMultiplicity": 1,
  "target": "dtmi:com:example:Floor;1"
}
```

The following example defines a general-purpose children Relationship.
In this example, there may be 0 to 500 children (because `minMultiplicity` and `maxMultiplicity` are not specified) of any Interface type (because `target` is not specified).

```json
{
  "@type": "Relationship",
  "name": "children"
}
```

The following example defines a Relationship with a Property.

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

## Component

Components enable Interfaces to be composed of other Interfaces.
A Component is different from a [Relationship](#relationship) because it describes contents that are directly part of the Interface, whereas a  Relationship describes a link between two Interfaces.

A Component describes the inclusion of an Interface into an Interface "by value".
This means that cycles in Components are not allowed because the value of the Component would be infinitely big.

In DTDL v2, a Component cannot contain another Component.

The chart below lists the properties that a Component may have.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `@type` | required | [IRI](#internationalized-resource-identifier) |  | This must be "Component". |
| `@id` | optional | [DTMI](#digital-twin-model-identifier) | max 2048 characters | An identifer for the Component. If no @id is provided, one will be assigned automatically. |
| `comment` | optional | *string* | max 512 characters | A comment for model authors. |
| `description` | optional | localizable *string* | max 512 characters | A localizable description for display. |
| `displayName` | optional | localizable *string* | max 64 characters | A localizable name for display. |
| `name` | required | *string* | max 64 characters; contains only alphanumerics and underscore, starting with a letter, ending with alphanumeric; must be unique for all contents in Interface | The programming name of the element. |
| `schema` | required | [Interface](#interface) | may not contain nested Component in hierarchy | The data type of the Component, which is an instance of Interface. |

### Component examples

```json
{
  "@type": "Component",
  "name": "frontCamera",
  "schema": "dtmi:com:example:Camera;3"
}
```

## Schema

Schemas are used to describe the on-the-wire or serialized format of the data in a Digital Twin Interface.
A full set of primitive data types are provided, along with support for a variety of complex schemas: Array, Enum, Map, and Object.
Schemas described through Digital Twin's schema definition language are compatible with popular serialization formats, including JSON, Avro, and Protobuf.

## Primitive schema

A full set of primitive data types are provided and can be specified directly as the value of a schema property in a Digital Twin model.

| Primitive schema | Description |
| --- | --- |
| `boolean` | a boolean value |
| `date` | a date in ISO 8601 format, per [RFC 3339](https://tools.ietf.org/html/rfc3339) |
| `dateTime` | a date and time in ISO 8601 format, per [RFC 3339](https://tools.ietf.org/html/rfc3339) |
| `double` | a finite numeric value that is expressible in IEEE 754 double-precision floating point format, conformant with the numeric range of xsd:double |
| `duration` | a duration in ISO 8601 format |
| `float` | a finite numeric value that is expressible in IEEE 754 single-precision floating point format, conformant with the numeric range of xsd:float |
| `integer` | a signed integral numeric value that is expressible in 4 bytes |
| `long` | a signed integral numeric value that is expressible in 8 bytes |
| `string` | a UTF8 string |
| `time` | a time in ISO 8601 format, per [RFC 3339](https://tools.ietf.org/html/rfc3339) |

## Complex schema

Complex schemas are designed for supporting complex data types made up of primitive data types.
In DTDL v2, the complex schemas are [Array](#array), [Enum](#enum), [Map](#map), and [Object](#object).
A complex schema can be specified directly as the value of a schema property or described in the Interface schemas set and referenced in a schema property.

Complex schema definitions are recursive but not self-referential.
An Array's elementSchema may be Array, Enum, Map, Object, or any of the [primitive schema](#primitive-schema) types.
However, the elementSchema must not refer to the Array itself or to another complex schema that refers to the Array.
The same is true for a Map's mapValue's schema and an Object's field's schema.
For DTDL v2, the maximum depth of nested complex schemas is 5 levels.

## Array

An Array describes an indexable data type where each element is of the same schema.
The schema for an Array's element can itself be a primitive or complex schema.

The chart below lists the properties that an Array may have.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `@type` | required | [IRI](#internationalized-resource-identifier) |  | This must be "Array". |
| `@id` | optional | [DTMI](#digital-twin-model-identifier) | max 2048 characters | An identifer for the Array. If no @id is provided, one will be assigned automatically. |
| `comment` | optional | *string* | max 512 characters | A comment for model authors. |
| `description` | optional | localizable *string* | max 512 characters | A localizable description for display. |
| `displayName` | optional | localizable *string* | max 64 characters | A localizable name for display. |
| `elementSchema` | required | [Schema](#schema) | max depth of 5 levels | The data type of each element in the Array, which is an instance of Schema. |

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

When JSON is used to serialize Array data, this example shows the serialized Array data for the Array model definition above.

```json
"ledState": [ true, true, false, true, false, true, true, false ]
```

## Enum

An Enum describes a data type with a set of named labels that map to values.
An Enum has integer or string values, and its labels are strings.

The chart below lists the properties that an Enum may have.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `@type` | required | [IRI](#internationalized-resource-identifier) |  | This must be "Enum". |
| `@id` | optional | [DTMI](#digital-twin-model-identifier) | max 2048 characters | An identifer for the Enum. If no @id is provided, one will be assigned automatically. |
| `comment` | optional | *string* | max 512 characters | A comment for model authors. |
| `description` | optional | localizable *string* | max 512 characters | A localizable description for display. |
| `displayName` | optional | localizable *string* | max 64 characters | A localizable name for display. |
| `enumValues` | required | set of [EnumValues](#enumvalue) | max 100 EnumValues in set | A set of name/value mappings for the Enum. |
| `valueSchema` | required | [primitive schema](#primitive-schema) | must be *integer* or *string* | The data type for the enumValues; all values must be of the same type. |

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

When JSON is used to serialize Enum data, this example shows the serialized Enum data for the Enum model definition above.

```json
"state": 2
```

### EnumValue

An EnumValue describes an element of an Enum.

The chart below lists the properties that an EnumValue may have.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `@type` | optional | [IRI](#internationalized-resource-identifier) |  | If provided, must be "EnumValue". |
| `@id` | optional | [DTMI](#digital-twin-model-identifier) | max 2048 characters | An identifer for the EnumValue. If no @id is provided, one will be assigned automatically. |
| `comment` | optional | *string* | max 512 characters | A comment for model authors. |
| `description` | optional | localizable *string* | max 512 characters | A localizable description for display. |
| `displayName` | optional | localizable *string* | max 64 characters | A localizable name for display. |
| `enumValue` | required | literal | must be unique for all enumValues in Enum | The on-the-wire value that maps to the EnumValue, which may be either an integer or a string. |
| `name` | required | *string* | max 64 characters; contains only alphanumerics and underscore, starting with a letter, ending with alphanumeric; must be unique for all enumValues in Enum | The programming name of the element. |

## Map

A Map describes a data type of key-value pairs where the values share the same schema.
The key in a Map must be a string.
The values in a Map can be any schema.

The chart below lists the properties that a Map may have.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `@type` | required | [IRI](#internationalized-resource-identifier) |  | This must be "Map". |
| `@id` | optional | [DTMI](#digital-twin-model-identifier) | max 2048 characters | An identifer for the Map. If no @id is provided, one will be assigned automatically. |
| `comment` | optional | *string* | max 512 characters | A comment for model authors. |
| `description` | optional | localizable *string* | max 512 characters | A localizable description for display. |
| `displayName` | optional | localizable *string* | max 64 characters | A localizable name for display. |
| `mapKey` | required | [MapKey](#mapkey) |  | A description of the keys in the Map. |
| `mapValue` | required | [MapValue](#mapvalue) |  | A description of the values in the Map. |

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

When JSON is used to serialize Map data, this example shows the serialized Map data for the Map model definition above.
Note that the mapKey name and mapValue name are not serialized; they are metadata.

```json
"modules": {
  "moduleA": "running",
  "moduleB": "stopped"
}
```

### MapKey

A MapKey describes the keys in a Map.
The schema of a MapKey must be *string*.

The chart below lists the properties that a MapKey may have.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `@type` | optional | [IRI](#internationalized-resource-identifier) |  | If provided, must be "MapKey". |
| `@id` | optional | [DTMI](#digital-twin-model-identifier) | max 2048 characters | An identifer for the MapKey. If no @id is provided, one will be assigned automatically. |
| `comment` | optional | *string* | max 512 characters | A comment for model authors. |
| `description` | optional | localizable *string* | max 512 characters | A localizable description for display. |
| `displayName` | optional | localizable *string* | max 64 characters | A localizable name for display. |
| `name` | required | *string* | max 64 characters; contains only alphanumerics and underscore, starting with a letter, ending with alphanumeric | The programming name of the element. |
| `schema` | required | [primitive schema](#primitive-schema) | must be *string* | The data type of the Map's key, which must be string. |

### MapValue

A MapValue describes the values in a Map.

The chart below lists the properties that a MapValue may have.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `@type` | optional | [IRI](#internationalized-resource-identifier) |  | If provided, must be "MapValue". |
| `@id` | optional | [DTMI](#digital-twin-model-identifier) | max 2048 characters | An identifer for the MapValue. If no @id is provided, one will be assigned automatically. |
| `comment` | optional | *string* | max 512 characters | A comment for model authors. |
| `description` | optional | localizable *string* | max 512 characters | A localizable description for display. |
| `displayName` | optional | localizable *string* | max 64 characters | A localizable name for display. |
| `name` | required | *string* | max 64 characters; contains only alphanumerics and underscore, starting with a letter, ending with alphanumeric | The programming name of the element. |
| `schema` | required | [Schema](#schema) | max depth of 5 levels when MapValue is the value of Map `mapValue` | The data type of the element, which is an instance of Schema. |

## Object

An Object describes a data type made up of named fields (like a struct in C).
The fields in an Object map can be primitive or complex schemas.

The chart below lists the properties that an Object may have.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `@type` | required | [IRI](#internationalized-resource-identifier) |  | This must be "Object". |
| `@id` | optional | [DTMI](#digital-twin-model-identifier) | max 2048 characters | An identifer for the Object. If no @id is provided, one will be assigned automatically. |
| `comment` | optional | *string* | max 512 characters | A comment for model authors. |
| `description` | optional | localizable *string* | max 512 characters | A localizable description for display. |
| `displayName` | optional | localizable *string* | max 64 characters | A localizable name for display. |
| `fields` | required | set of [Fields](#field) | max 30 Fields in set | A set of field descriptions, one for each field in the Object. |

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

When JSON is used to serialize Object data, this example shows the serialized Object data for the Object model definition above.

```json
"accelerometer": {
  "x": 12.7,
  "y": 5.5,
  "z": 19.1
}
```

### Field

A Field describes a field in an Object.

The chart below lists the properties that a Field may have.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `@type` | optional | [IRI](#internationalized-resource-identifier) |  | If provided, must be "Field". |
| `@id` | optional | [DTMI](#digital-twin-model-identifier) | max 2048 characters | An identifer for the Field. If no @id is provided, one will be assigned automatically. |
| `comment` | optional | *string* | max 512 characters | A comment for model authors. |
| `description` | optional | localizable *string* | max 512 characters | A localizable description for display. |
| `displayName` | optional | localizable *string* | max 64 characters | A localizable name for display. |
| `name` | required | *string* | max 64 characters; contains only alphanumerics and underscore, starting with a letter, ending with alphanumeric; must be unique for all fields in Object | The programming name of the element. |
| `schema` | required | [Schema](#schema) | max depth of 5 levels when Field is the value of Object `fields` | The data type of the element, which is an instance of Schema. |

## Geospatial Schemas

DTDL provides a set of geospatial schemas, based on [GeoJSON](https://geojson.org/), for modeling a variety of geographic data structures.

> NOTE: Because GeoJSON is array-based (coordinates are stored in an array) and DTDL v2 does not support Array in a [Property](#property) schema, geospatial types cannot be used in Property schemas, but can be used in [Telemetry](#telemetry) and [Command](#command) schemas.

| DTDL geospatial schema term | GeoJSON geometry type | DTDL geospatial schema IRI |
| --- | --- | --- |
| `lineString` | GeoJSON LineString | dtmi:standard:schema:geospatial:lineString;2 |
| `multiLineString` | GeoJSON MultiLineString | dtmi:standard:schema:geospatial:multiLineString;2 |
| `multiPoint` | GeoJSON MultiPoint | dtmi:standard:schema:geospatial:multiPoint;2 |
| `multiPolygon` | GeoJSON MultiPolygon | dtmi:standard:schema:geospatial:multiPolygon;2 |
| `point` | GeoJSON Point | dtmi:standard:schema:geospatial:point;2 |
| `polygon` | GeoJSON Polygon | dtmi:standard:schema:geospatial:polygon;2 |

### Geospatial schema examples

This example shows modeling the location of a device as Telemetry using the geospatial schema `point`.

```json
{
  "@type": "Telemetry",
  "name": "location",
  "schema": "point"
}
```

A Telemetry message sent by a particular device reporting its location would have the following structure in JSON (and equivalent structure in other serializations).

```json
{
  "location": {
    "type": "Point",
    "coordinates": [ 47.643742, -122.128014 ]
  }
}
```

## Interface schemas

Within an Interface definition, complex schemas may be defined for reusability across Telemetry, Properties, and Commands.
This is designed to promote readability and improved maintenance because schemas that are reused can be defined once (per Interface).
Interface schemas are defined in the `schemas` property of an Interface.

Note that an inheriting Interface cannot reuse schemas defined in the Interface it `extends`, nor can an Interface in a Component reuse schemas defined in the Interface that holds the Component.

The chart below lists the properties that Interface schemas may have.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `@type` | required | [IRI](#internationalized-resource-identifier) |  | This must be "Array", "Enum", "Map", or "Object". |
| `@id` | required | [DTMI](#digital-twin-model-identifier) | max 2048 characters | An identifer for the complex schema. |
| `comment` | optional | *string* | max 512 characters | A comment for model authors. |
| `description` | optional | localizable *string* | max 512 characters | A localizable description for display. |
| `displayName` | optional | localizable *string* | max 64 characters | A localizable name for display. |

### Interface schema examples

```json
{
  "@context": "dtmi:dtdl:context;2",
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
  ]
}
```

## Semantic Type

DTDL includes a set of standard semantic types that can be applied to Properties and Telemetries.
When a Property or Telemetry is annotated with one of these semantic types, the unit property must be an instance of the corresponding unit type, and the schema type must be a numeric type (*double*, *float*, *integer*, or *long*).

Note that there is not a strict one-to-one correspondence between semantic types and unit types.
For example, `Humidity` is expressed using `DensityUnit`, and `Luminosity` is expressed using `PowerUnit`.

The chart below lists standard semantic types, corresponding unit types, and available units for each unit type.

> Note:
The `TimeSpan` semantic type should not be confused with the `duration` schema type.
The `duration` schema is in ISO 8601 format; it is intended for calendar durations; and it does not play well with SI units.
The semantic unit for `TimeSpan` is `TimeUnit`, which gives temporal semantics to a numeric schema type.

| Semantic type | Unit type | Unit |
| --- | --- | --- |
| `Acceleration` | `AccelerationUnit` | `centimetrePerSecondSquared` <br> `gForce` <br> `metrePerSecondSquared` |
| `Angle` | `AngleUnit` | `degreeOfArc` <br> `minuteOfArc` <br> `radian` <br> `secondOfArc` <br> `turn` |
| `AngularAcceleration` | `AngularAccelerationUnit` | `radianPerSecondSquared` |
| `AngularVelocity` | `AngularVelocityUnit` | `degreePerSecond` <br> `radianPerSecond` <br> `revolutionPerMinute` <br> `revolutionPerSecond` |
| `Area` | `AreaUnit` | `acre` <br> `hectare` <br> `squareCentimetre` <br> `squareFoot` <br> `squareInch` <br> `squareKilometre` <br> `squareMetre` <br> `squareMillimetre` |
| `Capacitance` | `CapacitanceUnit` | `farad` <br> `microfarad` <br> `millifarad` <br> `nanofarad` <br> `picofarad` |
| `Current` | `CurrentUnit` | `ampere` <br> `microampere` <br> `milliampere` |
| `DataRate` | `DataRateUnit` | `bitPerSecond` <br> `bytePerSecond` <br> `exbibitPerSecond` <br> `exbibytePerSecond` <br> `gibibitPerSecond` <br> `gibibytePerSecond` <br> `kibibitPerSecond` <br> `kibibytePerSecond` <br> `mebibitPerSecond` <br> `mebibytePerSecond` <br> `tebibitPerSecond` <br> `tebibytePerSecond` <br> `yobibitPerSecond` <br> `yobibytePerSecond` <br> `zebibitPerSecond` <br> `zebibytePerSecond` |
| `DataSize` | `DataSizeUnit` | `bit` <br> `byte` <br> `exbibit` <br> `exbibyte` <br> `gibibit` <br> `gibibyte` <br> `kibibit` <br> `kibibyte` <br> `mebibit` <br> `mebibyte` <br> `tebibit` <br> `tebibyte` <br> `yobibit` <br> `yobibyte` <br> `zebibit` <br> `zebibyte` |
| `Density` | `DensityUnit` | `gramPerCubicMetre` <br> `kilogramPerCubicMetre` |
| `Distance` | `LengthUnit` | `astronomicalUnit` <br> `centimetre` <br> `foot` <br> `inch` <br> `kilometre` <br> `metre` <br> `micrometre` <br> `mile` <br> `millimetre` <br> `nanometre` <br> `nauticalMile` |
| `ElectricCharge` | `ChargeUnit` | `coulomb` |
| `Energy` | `EnergyUnit` | `electronvolt` <br> `gigajoule` <br> `joule` <br> `kilojoule` <br> `kilowattHour` <br> `megaelectronvolt` <br> `megajoule` |
| `Force` | `ForceUnit` | `newton` <br> `ounce` <br> `pound` <br> `ton` |
| `Frequency` | `FrequencyUnit` | `gigahertz` <br> `hertz` <br> `kilohertz` <br> `megahertz` |
| `Humidity` | `DensityUnit` | `gramPerCubicMetre` <br> `kilogramPerCubicMetre` |
| `Illuminance` | `IlluminanceUnit` | `footcandle` <br> `lux` |
| `Inductance` | `InductanceUnit` | `henry` <br> `microhenry` <br> `millihenry` |
| `Latitude` | `AngleUnit` | `degreeOfArc` <br> `minuteOfArc` <br> `radian` <br> `secondOfArc` <br> `turn` |
| `Length` | `LengthUnit` | `astronomicalUnit` <br> `centimetre` <br> `foot` <br> `inch` <br> `kilometre` <br> `metre` <br> `micrometre` <br> `mile` <br> `millimetre` <br> `nanometre` <br> `nauticalMile` |
| `Longitude` | `AngleUnit` | `degreeOfArc` <br> `minuteOfArc` <br> `radian` <br> `secondOfArc` <br> `turn` |
| `Luminance` | `LuminanceUnit` | `candelaPerSquareMetre` |
| `Luminosity` | `PowerUnit` | `gigawatt` <br> `horsepower` <br> `kilowatt` <br> `kilowattHourPerYear` <br> `megawatt` <br> `microwatt` <br> `milliwatt` <br> `watt` |
| `LuminousFlux` | `LuminousFluxUnit` | `lumen` |
| `LuminousIntensity` | `LuminousIntensityUnit` | `candela` |
| `MagneticFlux` | `MagneticFluxUnit` | `maxwell` <br> `weber` |
| `MagneticInduction` | `MagneticInductionUnit` | `tesla` |
| `Mass` | `MassUnit` | `gram` <br> `kilogram` <br> `microgram` <br> `milligram` <br> `slug` <br> `tonne` |
| `MassFlowRate` | `MassFlowRateUnit` | `gramPerHour` <br> `gramPerSecond` <br> `kilogramPerHour` <br> `kilogramPerSecond` |
| `Power` | `PowerUnit` | `gigawatt` <br> `horsepower` <br> `kilowatt` <br> `kilowattHourPerYear` <br> `megawatt` <br> `microwatt` <br> `milliwatt` <br> `watt` |
| `Pressure` | `PressureUnit` | `bar` <br> `inchesOfMercury` <br> `inchesOfWater` <br> `kilopascal` <br> `millibar` <br> `millimetresOfMercury` <br> `pascal` <br> `poundPerSquareInch` |
| `RelativeHumidity` | `Unitless` | `percent` <br> `unity` |
| `Resistance` | `ResistanceUnit` | `kiloohm` <br> `megaohm` <br> `milliohm` <br> `ohm` |
| `SoundPressure` | `SoundPressureUnit` | `bel` <br> `decibel` |
| `Temperature` | `TemperatureUnit` | `degreeCelsius` <br> `degreeFahrenheit` <br> `kelvin` |
| `Thrust` | `ForceUnit` | `newton` <br> `ounce` <br> `pound` <br> `ton` |
| `TimeSpan` | `TimeUnit` | `day` <br> `hour` <br> `microsecond` <br> `millisecond` <br> `minute` <br> `nanosecond` <br> `second` <br> `year` |
| `Torque` | `TorqueUnit` | `newtonMetre` |
| `Velocity` | `VelocityUnit` | `centimetrePerSecond` <br> `kilometrePerHour` <br> `kilometrePerSecond` <br> `knot` <br> `metrePerHour` <br> `metrePerSecond` <br> `milePerHour` <br> `milePerSecond` |
| `Voltage` | `VoltageUnit` | `kilovolt` <br> `megavolt` <br> `microvolt` <br> `millivolt` <br> `volt` |
| `Volume` | `VolumeUnit` | `cubicCentimetre` <br> `cubicFoot` <br> `cubicInch` <br> `cubicMetre` <br> `fluidOunce` <br> `gallon` <br> `litre` <br> `millilitre` |
| `VolumeFlowRate` | `VolumeFlowRateUnit` | `litrePerHour` <br> `litrePerSecond` <br> `millilitrePerHour` <br> `millilitrePerSecond` |

## Model Versioning

In DTDL, Interfaces are versioned by a single version number (positive integer) in the last segment of their identifier.
The use of the version number is up to the model author.

In some cases, when the model author is working closely with the code that implements and/or consumes the model, any number of changes from version to version may be acceptable.
In other cases, when the model author is publishing an Interface to be implemented by multiple devices or digital twins or consumed by multiple consumers, compatible changes may be appropriate.

## Additional concerns

### Conformance with JSON and JSON-LD

Unless stated otherwise in this document, the Digital Twins Definition Language conforms with the JSON and JSON-LD 1.1 specifications.
This conformance includes things such as keywords, case sensitivity, terminology, etc.
In particular, the JSON-LD spec states that all keys, keywords, and values in JSON-LD are case-sensitive.

### Digital Twin Model Identifier

All elements in digital twin models must have an identifier that is a **digital twin model identifier (DTMI)**.
This includes Interfaces, Properties, Telemetries, Commands, Relationships, Components, complex schema objects, etc.
This does not require that every model element have an explicit identifier, but any identifier assigned to a model element by a digital twin processor must follow this identifier format.

A DTMI has three components: scheme, path, and version.
Scheme and path are separated by a colon (*:*), while path and version are separated by a semicolon (*;*).
The format looks like this: `<scheme> : <path> ; <version>`.

The scheme is the string literal "dtmi" in lowercase.
The path is a sequence of one or more segments, separated by colons.
The version is a numeric value.

Each path segment is a non-empty string containing only letters, digits, and underscores.
The first character may not be a digit, and the last character may not be an underscore.
Segments are thus representable as identifiers in all common programming languages.

Segments are partitioned into user segments and system segments.
If a segment begins with an underscore, it is a system segment; if it begins with a letter, it is a user segment.
If a DTMI contains at least one system segment, it is a system DTMI; otherwise, it is a user DTMI.
System DTMIs are not permitted in DTDL model documents; only user DTMIs are permitted.

The version length is limited to nine digits, because the number 999,999,999 fits in a 32-bit signed integer value.
The first digit may not be zero, so there is no ambiguity regarding whether version 1 matches version 01 since the latter is invalid.

Here is an example of a valid DTMI: `dtmi:foo_bar:_16:baz33:qux;12`.

The path contains four segments: *foo_bar*, *_16*, *baz33*, and *qux*.
One of the segments (*_16*) is a system segment, and therefore the identifier is a system DTMI.
The version is 12.

Equivalence of DTMIs is case-sensitive.

The maximum length of a DTMI is 4096 characters.
The maximum length of a user DTMI is 2048 characters.
The maximum length of a DTMI for an Interface is 128 characters.

Developers are encouraged to take reasonable precautions against identifier collisions.
At a minimum, this means not using DTMIs with very short lengths or only common terms, such as `dtmi:myDevice;1`.

Such identifiers are perfectly acceptable in sample documents but should never be used in definitions that are deployed in any fashion.

For any definition that is the property of an organization with a registered domain name, a suggested approach to generating identifiers is to use the reversed order of domain segments as initial path segments, followed by further segments that are expected to be collectively unique among definitions within the domain.
For example, `dtmi:com:fabrikam:industrialProducts:airQualitySensor;1`.

It is also suggested that any identifers within an Interface (e.g. identifers for reusable schemas) should use a prefix from the identifier of the Interface.
For example, an identifier for an Array of double values defined within `dtmi:com:fabrikam:industrialProducts:airQualitySensor;1` might be `dtmi:com:fabrikam:industrialProducts:airQualitySensor:doubleArray;1`.

This practice will not eliminate the possibility of collisions, but it will limit accidental collisions to developers who are organizationally proximate.
It will also simplify the process of identifying malicious definitions when there is a clear mismatch between the identifier and the account that uploaded the definition.

Identifiers with the following prefixes are reserved by the DTDL language:

* `dtmi:dtdl:`
* `dtmi:standard:`

For a full definition of DTMI, please see the [DTMI spec](../../DTMI/README.md).

### Automatic Identifier Assignment

Every element in a DTDL model is identified by a DTMI.
If a DTMI is not indicated directly in the model via an "@id" property, an identifier is assigned automatically.
For reference in the subseqent description, consider the following model:

```json
{
  "@context": "dtmi:dtdl:context;2",
  "@id": "dtmi:com:example:anInterface;1",
  "@type": "Interface",
  "contents": [
    {
      "@id": "dtmi:com:example:aTelemetry;1",
      "@type": "Telemetry",
      "name": "currentDistance",
      "schema": {
        "@id": "dtmi:com:example:doubleArray;1",
        "@type": "Array",
        "elementSchema": "double"
      }
    }
  ]
}
```

The algorithm for determining ID values is as follows:

* If a model element has an "@id" property, this value is the ID of the element. For example, the ID of the Telemetry is "dtmi:com:example:aTelemetry;1", and the ID of the Array is "dtmi:com:example:doubleArray;1".
* If a model element does not have an "@id" property, its ID is generated from (a) its parent's ID, (b) the property connecting it to its parent, and optionally (c) its name.
* For properties that are singular, the algorithm takes the parent's DTMI and adds one segment before the version number which is the name of the property preceded by an underscore. So, if the Array above did not have the "@id" property, its ID would be "dtmi:com:example:aTelemetry:_schema;1".
* For properties that are plural, the algorithm takes the parent's DTMI and adds two segments before the version number. The first added segment is the name of the property preceded by an underscore; the second added segment is the value of the "name" property preceded by two underscores. So, if the Telemetry above did not have the "@id" property, its ID would be "dtmi:com:example:anInterface:_contents:__currentDistance;1".
* These rules apply recursively, so if neither the Telemetry nor the Array had an "@id" property, the ID of the Array would be "dtmi:com:example:anInterface:_contents:__currentDistance:_schema;1"

### Internationalized Resource Identifier

DTDL uses Internationalized Resource Identifiers (IRIs) to refer to DTDL language elements (such as type names) as well as model-defined elements (such as schemas).
IRIs in DTDL are [JSON-LD IRIs](https://w3c.github.io/json-ld-syntax/#iris) and may be relative or absolute.

### Display string localization

Some string properties in models are meant for display and, therefore, support localization.
Digital twin models use JSON-LD's string internationalization support for localization.
Each localizable property (e.g. `displayName` and `description`) is defined to be a JSON-LD language map (`"@container": "@language"`).
The keys of the language map must be language tag strings (see [BCP 47](https://www.rfc-editor.org/info/bcp47)).
[ISO 639](https://www.loc.gov/standards/iso639-2/php/code_list.php) provides a list of language tags.
The default language for DTDL documents is English.

#### Localization examples

In the following example, no language code is used for the localizable `displayName` property, so the default language English is used.

```json
{
  "@context": "dtmi:dtdl:context;2",
  "@id": "dtmi:com:example:Thermostat;1",
  "@type": "Interface",
  "displayName": "Thermostat"
}
```

In the following example, the localizable `displayName` property is localized into multiple languages.

```json
{
  "@context": "dtmi:dtdl:context;2",
  "@id": "dtmi:com:example:Thermostat;1",
  "@type": "Interface",
  "displayName": {
    "en": "Thermostat",
    "it": "Termostato"
  }
}
```

### Context

When writing a digital twin definition, it is necessary to specify the version of DTDL being used.
Because DTDL is based on JSON-LD, you use the JSON-LD context (the `@context` statement) to specify the version of DTDL being used.

For this version of DTDL, the context is exactly *dtmi:dtdl:context;2*.

Additional context specifiers may also be included, in particular to import definitions for [language extensions](#language-extensions) into the model.
However, the DTDL context must always be first in the ordered list of context specifiers, with any other contexts listed subsequently.

### Undefined co-types and properties

As described below, DTDL supports [language extensions](#language-extensions) that define *adjunct types*, which can be added as "co-types" to a DTDL element.
In keeping with the [RDF](https://www.w3.org/RDF/) "open world" model, DTDL also permits elements to have arbitrary, undefined types as co-types.
Furthermore, when an element has an undefined co-type, it is also permitted to have arbitrary, undefined properties with arbitrary values.
The following example shows a Property that is co-typed with the undefined type "Commercial" and has the undefined property "brand":

```json
{
  "@context": "dtmi:dtdl:context;2",
  "@id": "dtmi:com:example:Thermostat;1",
  "@type": "Interface",
  "contents": [
    {
      "@type": [ "Property", "Commercial" ],
      "name": "setPointTemp",
      "writable": true,
      "schema": "double",
      "brand": "Honeywell"
    }
  ]
}
```

Note that an undefined property is permitted only on an element that has an undefined co-type.
The co-type's unknown definition might plausibly add the property, so the presence of the property does not necessarily invalidate the model.
By contrast, if the undefined co-type "Commercial" were not present in the above example, the undefined property "brand" would be invalid, since this is not a defined property of DTDL type Property.

## Language extensions

DTDL also supports a selection of [language extensions](../v4/DTDL.Extensions.md), which offer additional functionality beyond what is provided by the core DTDL language.
The chart below lists the language extensions that are currently available for use with DTDL version 2.

| Extension | Category | Description |
| --- | --- | --- |
| [Iotcentral v2](./DTDL.iotcentral.v2.md) | partner | A set of semantic types and schema types used by IoT Central. |

## Changes from Version 1

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

## References

* JSON-LD: JSON-LD 1.1 - https://json-ld.org/spec/latest/json-ld/
* Language codes: BCP47 - https://www.rfc-editor.org/info/bcp47
* RDF (Resource Description Framework): RDF Concepts and Abstract Syntax - http://www.w3.org/TR/2014/REC-rdf11-concepts-20140225/
* RDF Schema: RDF Schema 1.1 - http://www.w3.org/TR/rdf-schema/

