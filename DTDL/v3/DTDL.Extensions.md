# DTDL language extensions -- PREVIEW

The Digital Twins Definition Language (DTDL) is made up of a set of metamodel classes.
In addition to its native classes &mdash; Interface, Command, Component, Property, Relationship, and Telemetry &mdash; DTDL supports *language extensions* that define additional metamodel classes.
There are two categories of language extensions:
*Partner extensions* add types, properties, and elements that are relevant to a specific cloud service.
*Feature extensions* add non-core features to the DTDL language in a selectable manner.

Each extension commonly includes one or more *adjunct types*, which are types that can be added to the `@type` property of a DTDL element.
For example, a Property can be co-typed with the adjunct type Historized defined in the [Historization](./DTDL.historization.v1.md) feature extension:

```json
{
  "@context": [
      "dtmi:dtdl:context;3",
      "dtmi:dtdl:extension:historization;1"
  ],
  "@id": "dtmi:com:example:Thermometer;1",
  "@type": "Interface",
  "contents": [
    {
      "@type": [ "Property", "Historized" ],
      "name": "currentTemp",
      "schema": "double"
    }
  ]
}
```

Each language extension is identifed by a JSON-LD context specifier, which is a [DTMI](../../DTMI/README.md).
To use a language extension, a model's `@context` property includes the extension's context specifier in addition to the DTDL context specifier, as illustrated in the example above.
The order of context specifiers is important; different versions of DTDL may have different sets of extensions available, so it is necessary to first declare the DTDL version with a DTDL context specifier before declaring any language extensions via extension context specifiers.

Of particular note is the [QuantitativeTypes](./DTDL.quantitativeTypes.v1.md) extension.
DTDL v2 provides native support for semantic types and units, so the following example is valid.
The Telemetry named "currentTemp" is co-typed Temperature, and it has a `unit` property with value *degreeFahrenheit*.
Note that the only context specifier is the core DTDL v2 context, "dtmi:dtdl:context;2".

```json
{
  "@context": "dtmi:dtdl:context;2",
  "@id": "dtmi:com:example:Sensor;1",
  "@type": "Interface",
  "contents": [
    {
      "@type": [ "Telemetry", "Temperature" ],
      "name": "currentTemp",
      "schema": "double",
      "unit": "degreeFahrenheit"
    }
  ]
}
```

Begining with DTDL v3, semantic types and units are no longer included in the core DTDL language.
Instead, they are included in the [QuantitativeTypes](./DTDL.quantitativeTypes.v1.md) feature extension, enabling them to evolve more rapidly that the core language is expected to evolve.
The following example is the same as the above except the DTDL context has been upgraded from 2 to 3.
Conseqently, an additional context for the QuantitativeTypes extension is also specified.

```json
{
  "@context": [
      "dtmi:dtdl:context;3",
      "dtmi:dtdl:extension:quantitativeTypes;1"
  ],
  "@id": "dtmi:com:example:Sensor;1",
  "@type": "Interface",
  "contents": [
    {
      "@type": [ "Telemetry", "Temperature" ],
      "name": "currentTemp",
      "schema": "double",
      "unit": "degreeFahrenheit"
    }
  ]
}
```

## Available partner extensions

The chart below lists the partner extensions that are currently available.

| Extension | Description | DTDL versions |
| --- | --- | --- |
| [Iotcentral v2](../v2/DTDL.iotcentral.v2.md) | A set of semantic types and schema types used by IoT Central. | [2](../v2/DTDL.v2.md) |

## Available feature extensions

The chart below lists the feature extensions that are currently available.

| Extension | Description | DTDL versions |
| --- | --- | --- |
| [QuantitativeTypes v1](./DTDL.quantitativeTypes.v1.md) | A set of standard semantic types, unit types, and units. | [3](./DTDL.v3.md) |
| [Historization v1](./DTDL.historization.v1.md) | Record the historical sequence of values of a Property or Telemetry and the times at which values change. | [3](./DTDL.v3.md) |
| [Annotation v1](./DTDL.annotation.v1.md) | Add custom metadata to a Property or a Telemetry. | [3](./DTDL.v3.md) |
| [Overriding v1](./DTDL.overriding.v1.md) | Override a model property with an instance value. | [3](./DTDL.v3.md) |

## Service and tool support of language extensions

A service or tool is permitted to claim full support of DTDL as long as it understands the core language.
No service or tool is required to support any given language extension, and lack of extension support does not impinge on the claim of DTDL compatibility.
If a service or tool does not recognize an extension context specifier, it ignores the context definitions and any adjunct types and properties it does not recognize.
If a model employs a language extension that is understood by a service or tool, the model can be used in a different service or tool that does not understand the extension.
However, aspects of the model defined by the language extension will not be understood by the latter service or tool.

> Note: A service that does not understand an extension will not be able to determine whether the extension is used in a model correctly.
When using a language extension, always validate your model against a tool or service that recognizes the extension context; otherwise, errors in your model may go undetected.

