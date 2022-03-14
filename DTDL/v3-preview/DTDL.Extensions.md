# DTDL feature extensions

**PREVIEW DOCUMENTATION**

This document provides a preliminary description of a future version of DTDL.
Preview functionality is provided without a service level agreement, and is not recommended for production uses.
Any and all aspects of the language described herein are subject to change without notice until this version of DTDL becomes generally available.
There is no obligation of continued support for any feature, aspect, or syntactical construct that does not make the transition to general availability.
For more information, see [Supplemental Terms of Use for Microsoft Azure Previews](https://azure.microsoft.com/en-us/support/legal/preview-supplemental-terms/).

The Digital Twins Definition Language (DTDL) is made up of a set of metamodel classes.
In addition to its native classes &mdash; Interface, Command, Component, Property, Relationship, and Telemetry &mdash; DTDL supports *language extensions* that define additional metamodel classes.
There are several categories of extensions, such as those defined for specific services or for industry verticals.
The present document describes *feature extensions*, which add non-core features to the language in a selectable manner.

Each extension commonly includes one or more *adjunct types*, which are types that can be added to the `@type` property of a DTDL element.
For example, a Property can be co-typed with the adjunct type Historized defined in the [Historization](./DTDL.historization.v1.md) extension, which indicates that the historical sequence of values should be recorded:

```json
{
    "@context": [
        "dtmi:dtdl:context;3",
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

Each adjunct type may define one or more properties that are added to an element that is *co-typed* with the adjunct type.
For example, when a Property is co-typed with the adjunct type Initialized defined in the [Initialization](./DTDL.initialization.v1.md) extension, the required property `initialValue` is added to the Property.
This additional property can be assigned a value in the model in the same manner as native properties like `name` and `schema`, as shown in the following example:

```json
{
    "@context": [
        "dtmi:dtdl:context;3",
        "dtmi:dtdl:extension:initialization;1"
    ],
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
    ]
}
```

Each feature extension is identifed by a JSON-LD context specifier, which is a [DTMI](https://github.com/Azure/digital-twin-model-identifier).
To use a feature extension, a model's `@context` property includes the extension's context specifier in addition to the DTDL context specifier, as illustrated in the example above.
The order of context specifiers is important; different versions of DTDL may have different sets of extensions available, so it is necessary to first declare the DTDL version with a DTDL context specifier before declaring any language extensions via extension context specifiers.

> Note that the absence of an extension context does not invalidate the model.
For instance, if the context specifier "dtmi:dtdl:extension:initialization;1" were removed from the above example, the resulting model would still be valid.
This is because DTDL permits the use of undefined types and properties in models, and the co-type "Initialized" and the property "initialValue" are undefined without the extension context.
However, because these terms are undefined, a service that understands the Initialization feature would not provide the expected behavior when the defining context is not specified.

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

## Available feature extensions

The chart below lists the feature extensions that are currently available.

| Extension | Description | DTDL versions |
| --- | --- | --- |
| [QuantitativeTypes v1](./DTDL.quantitativeTypes.v1.md) | A set of standard semantic types, unit types, and units. | [3](./DTDL.v3.md) |
| [Historization v1](./DTDL.historization.v1.md) | Record the historical sequence of values of a Property or Telemetry and the times at which values change. | [2](../v2/dtdlv2.md), [3](./DTDL.v3.md) |
| [Annotation v1](./DTDL.annotation.v1.md) | Add custom metadata to a Property or a Telemetry. | [3](./DTDL.v3.md) |
| [Overriding v1](./DTDL.overriding.v1.md) | Override a model property with an instance value. | [3](./DTDL.v3.md) |
| [Initialization v1](./DTDL.initialization.v1.md) | Specify an initial value for a Property. | [2](../v2/dtdlv2.md), [3](./DTDL.v3.md) |
| [Optionality v1](./DTDL.optionality.v1.md) | Specify a default value for a Command request that is issued without an explicit request value. | [2](../v2/dtdlv2.md), [3](./DTDL.v3.md) |

## Service and tool support of language extensions

A service or tool is permitted to claim full support of DTDL as long as it understands the core language.
No service or tool is required to support any given language extension, and lack of extension support does not impinge on the claim of DTDL compatibility.
If a service or tool does not recognize an extension context specifier, it ignores the context definitions and any adjunct types and properties it does not recognize.
If a model employs a feature extension that is understood by a service or tool, the model can be used in a different service or tool that does not understand the extension.
However, aspects of the model defined by the feature extension will not be understood by the latter service or tool.

For example, the model above defines an initial value for a Property.
If a service does not recognize the [Initialization](./DTDL.initialization.v1.md) extension, the service will not set an initial value for the Property.
The model will continue to be valid, and it should continue to work correctly in the service in all ways that do not relate to the semantics of the feature extension that is not understood.

> Note: A service that does not understand an extension will not be able to determine whether the extension is used in a model correctly.
When using a language extension, always validate your model against a tool or service that recognizes the extension context; otherwise, errors in your model may go undetected.

