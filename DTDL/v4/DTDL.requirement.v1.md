# Requirement extension

**Version 1**

**Usable in DTDL version 3 or 4**

Requirement is a DTDL language feature for indicating that an instance of a Field must have a value.
If a service supports the Requirement extension, it recognizes and understands the Required adjunct type if the Requirement context is specified.

## Requirement context

The context specifier for version 1 of the Requirement extension is "dtmi:dtdl:extension:requirement;1".

## Required adjunct type

The Required adjunct type can co-type a Field in DTDL version 3 or 4.
There are no properties associated with the Required adjunct type.

In the absence of a Required co-type, any field in an instance of a DTDL Object may be omitted.
Therefore, code-generated Object structures must always allow for empty fields in the Object representation.
Furthermore, code that uses an Object must always verify the presence of a value before reading a field, and &mdash; depending on the representation &mdash; code might require indirection to access the field value.

## Requirement examples

The following example shows an Interface whose `schemas` section defines an Object with two fields.
The Object represents a two-dimensional point, which semantically requires values for both its "x" and "y" fields.
However, since Object fields are optional, it would not be invalid for an instance of "dtmi:ex:Point2D;1" to lack values for one or both of its fields.

```json
{
  "@context": "dtmi:dtdl:context;3",
  "@id": "dtmi:com:example:Locator;1",
  "@type": "Interface",
  "schemas": [
    {
      "@id": "dtmi:ex:Point2D;1",
      "@type": "Object",
      "fields": [
        {
          "name": "x",
          "schema": "double"
        },
        {
          "name": "y",
          "schema": "double"
        }
      ]
    }
  ]
}
```

The following example enhances the above example by co-typing both fields with the adjunct type Required.
The material type of each field is Field, and this can be inferred from the parent's type (Object) and the property name ("fields").
However, when an adjunct type is added to an element, DTDL requires that the element also explicitly indicate its material type.
Therefore, each field lists both type Field and type Required.

```json
{
  "@context": [
    "dtmi:dtdl:context;3",
    "dtmi:dtdl:extension:requirement;1"
  ],
  "@id": "dtmi:com:example:Locator;1",
  "@type": "Interface",
  "schemas": [
    {
      "@id": "dtmi:ex:Point2D;1",
      "@type": "Object",
      "fields": [
        {
          "@type": [ "Field", "Required" ],
          "name": "x",
          "schema": "double"
        },
        {
          "@type": [ "Field", "Required" ],
          "name": "y",
          "schema": "double"
        }
      ]
    }
  ]
}
```

An instance of the above object must have values for both of its fields; otherwise, it would be invalid.
This requirement appropriatly expresses the semantics of a two-dimensional point.

## Feature versions

The chart below lists the versions of the Requirement extension that are currently available.

| Extension | Context | DTDL versions |
| --- | --- | --- |
| [Requirement v1](./DTDL.requirement.v1.md) | dtmi:dtdl:extension:requirement;1 | [3](../v3/DTDL.v3.md), [4](./DTDL.v4.md) |

