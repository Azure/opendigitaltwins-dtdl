# Historization extension

**Version 1**

**Usable in DTDL version 2 or 3**

Historization is a DTDL language feature for indicating that the historical sequence of values of a Property or a Telemetry should be recorded, as should the times at which the Property or Telemetry value changes.
If a service supports the Historization extension, it recognizes and understands the Historized adjunct type if the Historization context is specified.

## Historization context

The context specifier for version 1 of the Historization extension is "dtmi:dtdl:extension:historization;1".

## Historized adjunct type

The Historized adjunct type can co-type a Property or a Telemetry in DTDL version 2 or 3.
There are no properties associated with the Historized adjunct type.

When a Property or a Telemetry in a model is co-typed Historized, the service will persist the Historized Property or Telemetry values and make them available for querying and analytics.
The details of how Historized data is stored, indexed, queried, and accessed is beyond the scope of the DTDL language and of the Historization feature extension.
Within a DTDL model, the Historized adjunct type is merely a designator of which Properties and Telemetries are to be historized by the service.

## Historization examples

The following example shows an Interface with a single `contents` element named "setPointTemp" that has type Property and co-type Historized.

```json
{
  "@context": [
      "dtmi:dtdl:context;2",
      "dtmi:dtdl:extension:historization;1"
  ],
  "@id": "dtmi:com:example:Thermostat;1",
  "@type": "Interface",
  "contents": [
    {
      "@type": [ "Property", "Historized" ],
      "name": "setPointTemp",
      "writable": true,
      "schema": "double"
    }
  ]
}
```

Applying the Historized adjunct type does not preclude the application of other co-types, such as the Temperature semantic type, which adds the `unit` property to the Property:

```json
{
  "@context": [
      "dtmi:dtdl:context;2",
      "dtmi:dtdl:extension:historization;1"
  ],
  "@id": "dtmi:com:example:Thermostat;1",
  "@type": "Interface",
  "contents": [
    {
      "@type": [ "Property", "Temperature", "Historized" ],
      "name": "setPointTemp",
      "writable": true,
      "schema": "double",
      "unit": "degreeFahrenheit"
    }
  ]
}
```

## Feature versions

The chart below lists the versions of the Historization extension that are currently available.

| Extension | Context | DTDL versions |
| --- | --- | --- |
| [Historization v1](./DTDL.historization.v1.md) | dtmi:dtdl:extension:historization;1 | [2](./DTDL.v2.md), [3](./DTDL.v3.md) |

