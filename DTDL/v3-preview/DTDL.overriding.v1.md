# Overriding extension

**PREVIEW DOCUMENTATION**

This document provides a preliminary description of a future version of DTDL.
Preview functionality is provided without a service level agreement, and is not recommended for production uses.
Any and all aspects of the language described herein are subject to change without notice until this version of DTDL becomes generally available.
There is no obligation of continued support for any feature, aspect, or syntactical construct that does not make the transition to general availability.
For more information, see [Supplemental Terms of Use for Microsoft Azure Previews](https://azure.microsoft.com/en-us/support/legal/preview-supplemental-terms/).

**Version 1**

**Usable in DTDL version 3**

Overriding is a DTDL language feature that enables a model property of a Property or a Telemetry to be overridden by a value in an instance of the model.
If a service supports the Overriding extension, it recognizes and understands the Override adjunct type and its `overrides` property if the Overriding context is specified.
Overriding may be used only in conjunction with the [Annotation](./DTDL.annotation.v1.md) feature extension.

## Overriding context

The context specifier for version 1 of the Overriding extension is "dtmi:dtdl:extension:overriding;1".

## Override adjunct type

The Override adjunct type can co-type a Property in DTDL version 3, but only if the Property is also co-typed ValueAnnotation.

The chart below lists the additional properties that may be part of an element that is co-typed Override.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `overrides` | required | *IRI* | must match an extension property of the sibling element identified by the `annotates` property | Term or IRI of an extension property that is overridden. |

When a Property in a model is co-typed ValueAnnotation and Override, the value of the `annotates` property specifies the `name` of another Property or Telemetry within the `contents` of the same Interface, and the value of the `overrides` property specifies an extension property on this other Property or Telemetry.
This indicates that the ValueAnnotation/Override should be regarded as metadata for the element referenced by `annotates`, and further that this metadata overrides the value of the extension property indicated by `overrides`.

## Override examples

The following example shows an Interface with two `contents` elements.
The element named "currentTemp" has type Telemetry and co-type Temperature; this element provides a stream of temperature readings from the Sensor.

The element named "currentTempUnit" has type Property and co-types ValueAnnotation and Override; this element provides a metadata value that overrides the `unit` property on the element named "currentTemp".
The adjunct type ValueAnnotation indicates that the Property provides metadata, and the value of property `annotates` indicates that the metadata applies to the element named "currentTemp".
The adjunct type Override indicates that the Property overrides a value of the annotated element, and the value of property `overrides` indicates that the overridden property is `unit`.

The `schema` of "currentTempUnit" is TemperatureUnit.
This must match the schema type of the `unit` property defined by the extension type that co-types the annotated element.
Since "currentTemp" is co-typed with adjunct type Temperature, the schema type of `unit` is TemperatureUnit.

```json
{
    "@context": [
        "dtmi:dtdl:context;3",
        "dtmi:dtdl:extension:quantitativeTypes;1",
        "dtmi:dtdl:extension:annotation;1",
        "dtmi:dtdl:extension:overriding;1"
    ],
    "@id": "dtmi:com:example:Sensor;1",
    "@type": "Interface",
    "contents": [
        {
            "@type": [ "Telemetry", "Temperature" ],
            "name": "currentTemp",
            "schema": "double",
            "unit": "degreeFahrenheit"
        },
        {
            "@type": [ "Property", "ValueAnnotation", "Override" ],
            "name": "currentTempUnit",
            "annotates": "currentTemp",
            "overrides": "unit",
            "schema": "TemperatureUnit",
            "writable": true
        }
    ]
}
```

> Note: The value of `unit` in the model can be regarded as a default value that applies when there is no value of the Override Property instance in the service.
Therefore, a model should **not** use the Initialization feature to specify an initial value for an Override Property, as this would result in both initial and default declarations; this would be confusing to someone reading the model, especially if the initial and default values were different.
To enforce this practice, the Override and Initialized adjunct types are not permitted to co-type the same element.

## Feature versions

The chart below lists the versions of the Overriding extension that are currently available.

| Extension | Context | DTDL versions |
| --- | --- | --- |
| [Overriding v1](./DTDL.overriding.v1.md) | dtmi:dtdl:extension:overriding;1 | [3](./DTDL.v3.md) |

