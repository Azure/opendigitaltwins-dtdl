# Optionality extension

**PREVIEW DOCUMENTATION**

This document provides a preliminary description of a future version of DTDL.
Preview functionality is provided without a service level agreement, and is not recommended for production uses.
Any and all aspects of the language described herein are subject to change without notice until this version of DTDL becomes generally available.
There is no obligation of continued support for any feature, aspect, or syntactical construct that does not make the transition to general availability.
For more information, see [Supplemental Terms of Use for Microsoft Azure Previews](https://azure.microsoft.com/en-us/support/legal/preview-supplemental-terms/).

**Version 1**

**Usable in DTDL version 2 or 3**

Optionality is a DTDL language feature that enables a Command request to have a default value whenever the Command is issued without an explicit value for the request.
If a service supports the Optionality extension, it recognizes and understands the Optional adjunct type and its `defaultValue` property if the Optionality context is specified.

## Optionality context

The context specifier for version 1 of the Optionality extension is "dtmi:dtdl:extension:optionality;1".

## Optional adjunct type

The Optional adjunct type can co-type a CommandPayload in DTDL version 2 or a CommandRequest in DTDL version 3.

The chart below lists the additional properties that may be part of an element that is co-typed Optional.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `defaultValue` | required | *JSON* | must conform to the `schema` property of the element | The default value for the instance. |

When a Command request in a model is co-typed Optional, the service will assign the value of the `defaultValue` property to any Command request that does not explicitly specify a request value.

Devices are oblivious to the presence of a `defaultValue` property in the model, except indirectly when a service reads this value and includes it in a Command request that is sent to a device.
No special behavior from a device is expected or warranted for optionality to function.

## Optionality examples

The following example shows a Command named "reboot" with a `request` property that has type CommandRequest and co-type Optional.
The value of the `defaultValue` property is October 26, 1985, 1:24 AM PDT expressed in ISO 8601 format, which satisfies the syntax for a *dateTime*, thus conforming to the value of the CommandRequest `schema` property.

```json
{
    "@id": "dtmi:com:example:FluxCapacitor;1",
    "@type": "Interface",
    "contents": [
        {
            "@type": "Command",
            "name": "reboot",
            "request": {
                "@type": [ "CommandRequest", "Optional" ],
                "name": "rebootTime",
                "schema": "dateTime",
                "defaultValue": "1985-10-26T01:24:00-07:00"
            },
            "response": {
                "name": "scheduledTime",
                "schema": "dateTime"
            }
        }
    ],
    "@context": [
        "dtmi:dtdl:context;3",
        "",
        "dtmi:dtdl:extension:optionality;1"
    ]
}
```

Note that even though no `@type` is normally required for the `request` property on a Command, a co-type cannot be specified without also specifying a primary type, so the CommandRequest type is explicitly declared in this case.

## Complex default values

When the `schema` property of a Command request has a complex schema type, the value of the `defaultValue` property must be JSON that conforms to the complex schema definition, as shown in the following examples.

Array with `schema` of *string*:

```json
"defaultValue": [ "apple", "orange", "banana" ]
```

Enum with `valueSchema` of *integer*:

```json
"defaultValue": 2
```

Map with MapValue `schema` of *double*:

```json
"defaultValue": { "hello": 1.1, "goodbye": 2.2 }
```

Object with two `fields` elements named "foo" and "bar", with `schema` of *boolean* and *integer*, respectively:

```json
"defaultValue": { "foo": true, "bar": 14 }
```

The following example shows a Command named "move" with a request property that has type CommandRequest and co-type Optional.
The value of the `defaultValue` property is a JSON object that conforms to the nested definition of "movement" in the CommandRequest schema property.

```json
{
    "@id": "dtmi:com:example:Robot;1",
    "@type": "Interface",
    "contents": [
        {
            "@type": "Command",
            "name": "move",
            "request": {
                "@type": [ "CommandRequest", "Optional" ],
                "name": "movement",
                "schema": {
                    "@type": "Object",
                    "fields": [
                        {
                            "name": "direction",
                            "schema": {
                                "@type": "Enum",
                                "valueSchema": "string",
                                "enumValues": [
                                    {
                                        "name": "forward",
                                        "enumValue": "F"
                                    },
                                    {
                                        "name": "backward",
                                        "enumValue": "B"
                                    },
                                    {
                                        "name": "left",
                                        "enumValue": "L"
                                    },
                                    {
                                        "name": "right",
                                        "enumValue": "R"
                                    }
                                ]
                            }
                        },
                        {
                            "name": "velocity",
                            "schema": "integer"
                        },
                        {
                            "name": "zigzag",
                            "schema": "boolean"
                        }
                    ]
                },
                "defaultValue": {
                    "direction": "F",
                    "velocity": 3,
                    "zigzag": false
                }
            }
        }
    ],
    "@context": [
        "dtmi:dtdl:context;3",
        "",
        "dtmi:dtdl:extension:optionality;1"
    ]
}
```

## Feature versions

The chart below lists the versions of the Optionality extension that are currently available.

| Extension | Context | DTDL versions |
| --- | --- | --- |
| [Optionality v1](./DTDL.optionality.v1.md) | dtmi:dtdl:extension:optionality;1 | [3](./DTDL.v3.md) |

