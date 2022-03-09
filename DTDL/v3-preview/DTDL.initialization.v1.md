# Initialization extension

**PREVIEW DOCUMENTATION**

This document provides a preliminary description of a future version of DTDL.
Preview functionality is provided without a service level agreement, and is not recommended for production uses.
Any and all aspects of the language described herein are subject to change without notice until this version of DTDL becomes generally available.
There is no obligation of continued support for any feature, aspect, or syntactical construct that does not make the transition to general availability.
For more information, see [Supplemental Terms of Use for Microsoft Azure Previews](https://azure.microsoft.com/en-us/support/legal/preview-supplemental-terms/).

**Version 1**

**Usable in DTDL version 2 or 3**

Initialization is a DTDL language feature for specifying an initial value for a Property.
If a service supports the Initialization extension, it recognizes and understands the Initialized adjunct type and its `initialValue` property if the Initialization context is specified.

## Initialization context

The context specifier for version 1 of the Initialization extension is "dtmi:dtdl:extension:initialization;1".

## Initialized adjunct type

The Initialized adjunct type can co-type a Property in DTDL version 2 or 3.

The chart below lists the additional properties that may be part of an element that is co-typed Initialized.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `initialValue` | required | *JSON* | must conform to the `schema` property of the element | The initial value for the instance. |

When a Property in a model is co-typed Initialized, the service will assign the value of the `initialValue` property to each instance of the Property in the service at the time the instance is created.

Devices are oblivious to the presence of an `initialValue` property in the model, except indirectly when a service reads this value and writes in into the Property instance in the device twin.
No special behavior from a device is expected or warranted for initialization to function.

## Initialization examples

The following example shows an Interface with a single `contents` element named "setPointTemp" that has type Property and co-type Initialized.
The value of the `initialValue` property is 62.6, which satisfies the syntax for a *double*, thus conforming to the value of the `schema` property.

```json
{
    "@id": "dtmi:com:example:Thermostat;1",
    "@type": "Interface",
    "contents": [
        {
            "@type": [ "Property", "Initialized" ],
            "name": "setPointTemp",
            "writable": true,
            "schema": "double",
            "initialValue": 62.6
        }
    ],
    "@context": [
        "dtmi:dtdl:context;2",
        "",
        "dtmi:dtdl:extension:initialization;1"
    ]
}
```

The following example shows a Relationship named "neighbor" with a single `properties` element named "proximity" that has type Property and co-type Initialized.
The value of the `initialValue` property is "unknown", which satisfies the syntax for a *string*, thus conforming to the value of the `schema` property.

```json
{
    "@id": "dtmi:com:example:Neighborhood;1",
    "@type": "Interface",
    "contents": [
        {
            "@type": "Relationship",
            "name": "neighbor",
            "properties": [
                {
                    "@type": [ "Property", "Initialized" ],
                    "name": "proximity",
                    "writable": true,
                    "schema": "string",
                    "initialValue": "unknown"
                }
            ]
        }
    ],
    "@context": [
        "dtmi:dtdl:context;2",
        "",
        "dtmi:dtdl:extension:initialization;1"
    ]
}
```

## Complex initial values

When the `schema` property of a Property has a complex schema type, the value of the `initialValue` property must be JSON that conforms to the complex schema definition, as shown in the following examples.

Array with `schema` of *string*:

```json
"initialValue": [ "apple", "orange", "banana" ]
```

Enum with `valueSchema` of *integer*:

```json
"initialValue": 2
```

Map with MapValue `schema` of *double*:

```json
"initialValue": { "hello": 1.1, "goodbye": 2.2 }
```

Object with two `fields` elements named "foo" and "bar", with `schema` of *boolean* and *integer*, respectively:

```json
"initialValue": { "foo": true, "bar": 14 }
```

## Feature versions

The chart below lists the versions of the Initialization extension that are currently available.

| Extension | Context | DTDL versions |
| --- | --- | --- |
| [Initialization v1](./DTDL.initialization.v1.md) | dtmi:dtdl:extension:initialization;1 | [3](./DTDL.v3.md) |

