# Annotation extension -- PREVIEW

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

The element named "currentTempLastCalibrated" has type Property and co-type ValueAnnotation; this element provides a metadata date value that indicates the date on which the temperature sensor was most recently calibrated.
Because this is a Property, its value is not transmitted with every temperature reading, so this is appropriate for annotations that change infrequently.
Moreover, because Telemetry messages and Property updates are not synchronized, it is generally not possible to precisely correlate a change in Property value with a particular point in the time series of Telemetry values.
So, for the present example, "currentTemp" Telemetry values reported on the date indicated by the "currentTempLastCalibrated" Property might or might not reflect the most recent calibration.

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
      "name": "currentTempLastCalibrated",
      "annotates": "currentTemp",
      "schema": "date",
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

When a Property annotates a Telemetry, the annotation applies to the entire stream of Telemetry values:
When the annotating Property value is updated, the new value applies to all Telemetry values sent after the update occurs and before the Property value is updated again; however, as mentioned above, the temporal correlation between Property updates and Telemetry values is quite loose, so care should be exercised in drawing inferences around the time a Property is changed.
When a Property annotates another Property, if both Properties are read concurrently, the value of the annotating Property applies to the value of the annotated Property.

As the following example shows, the Property or Telemetry that is annotated need not be defined directly in the same Interface as the ValueAnnotation.
When an Interface `extends` another Interface, the former can annotate a `contents` element that is defined in the latter, because the `extends` property imports the Property or Telemetry into the former's `contents`.

```json
[
  {
    "@context": [
      "dtmi:dtdl:context;3",
      "dtmi:dtdl:extension:quantitativeTypes;1"
    ],
    "@id": "dtmi:com:example:BaseSensor;1",
    "@type": "Interface",
    "contents": [
      {
        "@type": [ "Telemetry", "Temperature" ],
        "name": "currentTemp",
        "schema": "double",
        "unit": "degreeFahrenheit"
      }
    ]
  },
  {
    "@context": [
        "dtmi:dtdl:context;3",
        "dtmi:dtdl:extension:quantitativeTypes;1",
        "dtmi:dtdl:extension:annotation;1"
    ],
    "@id": "dtmi:com:example:Sensor;1",
    "@type": "Interface",
    "extends": "dtmi:com:example:BaseSensor;1",
    "contents": [
      {
        "@type": [ "Telemetry", "ValueAnnotation" ],
        "name": "currentTempAccuracy",
        "annotates": "currentTemp",
        "schema": "double"
      },
      {
        "@type": [ "Property", "ValueAnnotation" ],
        "name": "currentTempLastCalibrated",
        "annotates": "currentTemp",
        "schema": "date",
        "writable": true
      }
    ]
  }
]
```

## Feature versions

The chart below lists the versions of the Annotation extension that are currently available.

| Extension | Context | DTDL versions |
| --- | --- | --- |
| [Annotation v1](./DTDL.annotation.v1.md) | dtmi:dtdl:extension:annotation;1 | [3](./DTDL.v3.md) |

