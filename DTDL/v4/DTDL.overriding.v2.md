# Overriding extension

**Version 2**

**Usable in DTDL version 3 or 4**

Overriding is a DTDL language feature that enables a model property of a Property or a Telemetry to be overridden by a value in an instance of the model.
If a service supports the Overriding extension, it recognizes and understands the Override adjunct type and its `overrides` property if the Overriding context is specified.
Overriding may be used only in conjunction with the [Annotation](./DTDL.annotation.v2.md) feature extension.

## Overriding context

The context specifier for version 2 of the Overriding extension is "dtmi:dtdl:extension:overriding;2".

## Override adjunct type

The Override adjunct type can co-type a Property in DTDL version 3 or 4, but only if the Property is also co-typed ValueAnnotation.

The chart below lists the additional properties that may be part of an element that is co-typed Override.

| Property | Required | Data type | Limits | Description |
| --- | --- | --- | --- | --- |
| `overrides` | required | *IRI* | must match an extension property of the sibling element identified by the `annotates` property | Term or IRI of an extension property that is overridden. |

When a Property in a model is co-typed ValueAnnotation and Override, the value of the `annotates` property specifies the `name` of another Property or Telemetry within the `contents` of the same Interface, and the value of the `overrides` property specifies an extension property on this other Property or Telemetry.
This indicates that the ValueAnnotation/Override should be regarded as metadata for the element referenced by `annotates`, and further that this metadata overrides the value of the extension property indicated by `overrides`.

## Extension version constraint

The Overriding extension places a constraint on the version of the extension that defines property values that are overridden.
Specifically, the property-defining extension must be defined using the same version of DTDL that is used for definining the model that uses Overriding.
Ordinarily, it is acceptable to use a later version of an extension in a model defined in an earlier version of DTDL; however, this freedom is lost when using Overriding.

## Override examples

The following example shows an Interface with two `contents` elements.
The element named "currentTemp" has type Telemetry and co-type Temperature; this element provides a stream of temperature readings from the Sensor.
The semantic type Temperature is defined in the [QuantitativeTypes](./DTDL.quantitativeTypes.v2.md) feature extension.

The element named "currentTempUnit" has type Property and co-types ValueAnnotation and Override; this element provides a metadata value that overrides the `unit` property on the element named "currentTemp".
The adjunct type ValueAnnotation indicates that the Property provides metadata, and the value of property `annotates` indicates that the metadata applies to the element named "currentTemp".
The adjunct type Override indicates that the Property overrides a value of the annotated element, and the value of property `overrides` indicates that the overridden property is `unit`.

The `schema` of "currentTempUnit" is TemperatureUnit, which &mdash; like the Temperature type &mdash; is defined in the [QuantitativeTypes](./DTDL.quantitativeTypes.v2.md) feature extension.
Because "currentTempUnit" is overriding the `unit` property of "currentTemp", which has co-type Temperature, the `schema` of "currentTempUnit" must be approriate for the Temperature type.
The table in the [QuantitativeTypes](./DTDL.quantitativeTypes.v2.md) documentation indicates which unit type (e.g., TemperatureUnit) corresponds to each semantic type (e.g., Temperature).
This table also indicates the allowed unit values that can be specified in an instance of the model when overriding the `unit` property of the annotated element.

> Note that the Overriding extension is not dependent upon the QuantitativeTypes extension, although all current use cases for Overriding involve QuantitativeTypes.
The Overriding extension enables **any property** defined by **any extension** to be overridden by a Property.
The `schema` of the overriding Property must match the schema type of the overridden property, just as the `schema` of "currentTempUnit" matches the schema type of the "currentTemp" `unit` property in the following example.

```json
{
  "@context": [
    "dtmi:dtdl:context;4",
    "dtmi:dtdl:extension:quantitativeTypes;2",
    "dtmi:dtdl:extension:annotation;2",
    "dtmi:dtdl:extension:overriding;2"
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

To override the "currentTemp" `unit` property, an instance of this model specifies a value for "currentTempUnit".
The allowed values are indicated by the table in the [QuantitativeTypes](./DTDL.quantitativeTypes.v2.md) documentation.
The row for semantic type Temperature lists the unit values that may be specified in the instance, which are the same values that may be specified for the `unit` property in the model.
The instance might, for example, contain the following content:

```json
{
  "currentTempUnit": "degreeCelsius"
}
```

The presence of a "currentTempUnit" value in the instance indicates that the value "degreeFahrenheit" specified by the model's `unit` property no longer applies.
Instead, the value for the unit of "currentTemp" is "degreeCelsius" because this is specified in the instance, and the instance value overrides the model value.

As the following example shows, the Property or Telemetry whose property is overridden need not be defined directly in the same Interface as the Override.
When an Interface `extends` another Interface, the former can override a property of a `contents` element that is defined in the latter, because the `extends` property imports the Property or Telemetry into the former's `contents`.

```json
[
  {
    "@context": [
      "dtmi:dtdl:context;4",
      "dtmi:dtdl:extension:quantitativeTypes;2",
      "dtmi:dtdl:extension:overriding;2"
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
      "dtmi:dtdl:context;4",
      "dtmi:dtdl:extension:quantitativeTypes;2",
      "dtmi:dtdl:extension:annotation;2",
      "dtmi:dtdl:extension:overriding;2"
    ],
    "@id": "dtmi:com:example:Sensor;1",
    "@type": "Interface",
    "extends": "dtmi:com:example:BaseSensor;1",
    "contents": [
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
]
```

## Changes from Version 1

There are no changes from Version 1 of this extension, other than its compatibility with [DTDL v4](./DTDL.v4.md) in addition to [DTDL v3](../v3/DTDL.v3.md).

## Feature versions

The chart below lists the versions of the Overriding extension that are currently available.

| Extension | Context | DTDL versions |
| --- | --- | --- |
| [Overriding v1](../v3/DTDL.overriding.v1.md) | dtmi:dtdl:extension:overriding;1 | [3](../v3/DTDL.v3.md) |
| [Overriding v2](./DTDL.overriding.v2.md) | dtmi:dtdl:extension:overriding;2 | [3](../v3/DTDL.v3.md), [4](./DTDL.v4.md) |

