# Annotation extension

**PREVIEW DOCUMENTATION**

This document provides a preliminary description of a future version of DTDL.
Preview functionality is provided without a service level agreement, and is not recommended for production uses.
Any and all aspects of the language described herein are subject to change without notice until this version of DTDL becomes generally available.
There is no obligation of continued support for any feature, aspect, or syntactical construct that does not make the transition to general availability.
For more information, see [Supplemental Terms of Use for Microsoft Azure Previews](https://azure.microsoft.com/en-us/support/legal/preview-supplemental-terms/).

**Version 1**

**Usable in DTDL version 3**

Annotation is a DTDL language feature that enables a model to add custom metadata to a Property or a Telemetry.
If a service supports the Annotation extension, it recognizes and understands the ValueAnnotation adjunct type and its `annotates` property if the Annotation context is specified.

## Annotation context

The context specifier for version 1 of the Annotation extension is "dtmi:dtdl:extension:annotation;1".

## ValueAnnotation adjunct type

The ValueAnnotation adjunct type can co-type a Property or a Telemetry in DTDL version 3.

The chart below lists the additional properties that may be part of an element that is co-typed ValueAnnotation.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `annotates` | required | *string* | must match the `name` property of a sibling element | Name of a Property or Telemetry that is annotated. |

When a Property or a Telemetry in a model is co-typed ValueAnnotation, the value of the `annotates` property specifies the `name` of another Property or Telemetry within the `contents` of the same Interface.
This indicates that the ValueAnnotation should be regarded as metadata for the element referenced by `annotates`.

## ValueAnnotation examples

The following example shows an Interface with three `contents` elements.
The element named "currentTemp" has type Telemetry and co-type Temperature (from the [QuantitativeTypes](./DTDL.quantitativeTypes.v1.md) feature extension); this element provides a stream of temperature readings from the Sensor.

The element named "currentTempAccuracy" has type Telemetry and co-type ValueAnnotation; this element provides a stream of metadata regarding the accuracy of each temperature reading.
The adjunct type ValueAnnotation indicates that the Telemetry provides metadata, and the value of property `annotates` indicates that the metadata applies to the element named "currentTemp".
Because this is a Telemetry, its values can be streamed synchronously with the values of the "currentTemp" Telemetry that it is annotating.

The element named "currentTempNote" has type Property and co-type ValueAnnotation; this element provides a metadata string that describes the stream of temperature readings.
Because this is a Property, its value is not transmitted with every temperature reading, so this is appropriate for annotations that change infrequently.

```json
{
    "@context": [
        "dtmi:dtdl:context;3",
        "dtmi:dtdl:extension:quantitativeTypes;1",
        "dtmi:dtdl:extension:annotation;1"
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
            "@type": [ "Telemetry", "ValueAnnotation" ],
            "name": "currentTempAccuracy",
            "annotates": "currentTemp",
            "schema": "double"
        },
        {
            "@type": [ "Property", "ValueAnnotation" ],
            "name": "currentTempNote",
            "annotates": "currentTemp",
            "schema": "string",
            "writable": true
        }
    ]
}
```

Following is an example Telemetry payload for the above model:

```json
{
    "currentTemp": 62.6,
    "currentTempAccuracy": 4.0
}
```

When a Telemetry annotates another Telemetry, any given annotation value applies only to the annotated value in the same Telemetry payload.
In the above message, the "currentTempAccuracy" value 4.0 applies to the "currentTemp" value 62.6, not to any previous or subsequent value.
If a particular Telemetry message does not include an annotation value, the value in the payload is still valid data; it merely lacks an annotation.
If a particular message includes only an annotation but not an annotated value, the payload is valid but semantically meaningless.
Such annotations do not apply to the next value, to the previous value, to the stream of values up until this point, or to any other data values.

When a Property annotates a Telemetry, the annotation applies to the entire stream of Telemetry values for the duration of the annotating Property value.
When a Property annotates another Property, the annotation applies to the values with which it is concurrent.
A special case of using a Property for annotation is when the [Overriding](./DTDL.overriding.v1.md) feature extension is employed to override a model property with an instance value.

## Feature versions

The chart below lists the versions of the Annotation extension that are currently available.

| Extension | Context | DTDL versions |
| --- | --- | --- |
| [Annotation v1](./DTDL.annotation.v1.md) | dtmi:dtdl:extension:annotation;1 | [3](./DTDL.v3.md) |

