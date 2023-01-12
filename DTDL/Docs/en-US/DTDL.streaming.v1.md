# Streaming extension

**Version 1**

**Usable in DTDL version 2 or 3**

Streaming is a DTDL language feature for indicating that a Property may be stored with reduced durability guarantees, thereby lowering storage cost and increasing data ingestion.
If a service supports the Streaming extension, it recognizes and understands the Streaming adjunct type if the Streaming context is specified.

## Streaming context

The context specifier for version 1 of the Streaming extension is "dtmi:dtdl:extension:streaming;1".

## Streaming adjunct type

The Streaming adjunct type can co-type a Property in DTDL version 2 or 3.
There are no properties associated with the Streaming adjunct type; however, the value of the `writable` property must not be `true`.

## Streaming examples

The following example shows an Interface for a GasTurbine has two `contents` elements with type Property.
The Property named "flowRate" is continuously updated, so it has co-type Streaming to indicate a lower requirement for storage durability.
The Property "serialNumber" is never updated after the initial value is set, so it requires higher storage durability.

```json
{
  "@context": [
      "dtmi:dtdl:context;2",
      "dtmi:dtdl:extension:streaming;1"
  ],
   "@id":"dtmi:com:example:GasTurbine;1",
   "@type":"Interface",
   "displayName":"GasTurbine",
   "contents":[
      {
         "@type":"Property",
         "name":"serialNumber",
         "schema":"string"
      },
      {
         "@type":["Property", "Streaming"],
         "name":"flowRate",
         "schema":"double"
      }
   ]
}
```

## Feature versions

The chart below lists the versions of the Streaming extension that are currently available.

| Extension | Context | DTDL versions |
| --- | --- | --- |
| [Streaming v1](./DTDL.streaming.v1.md) | dtmi:dtdl:extension:streaming;1 | [2](./DTDL.v2.md), [3](./DTDL.v3.md) |

