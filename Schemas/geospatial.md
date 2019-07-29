# Geospatial Schema
**Preview**

## Introduction
We provide the geospatial schema to support telemetry and commands (properties not supported in this release) that work with geospatial locations. This schema definition is exactly the same as the GeoJSON geometry object, so when telemetry or command data are serialized to JSON, the structure matches GeoJSON geometries.

## Geospatial Telemetry Example
An interface for a digital twin that sends location telemetry can be modeled using the geospatial schema. In this example, the Tracker interface defines one telemetry message with the name "location" and the schema "geospatial".
```json
{
    "@id": "urn:example:Tracker:1",
    "@type": "Interface",
    "contents": [
        {
            "@type": "Telemetry",
            "name": "location",
            "schema": "geospatial"
        }
    ],
    "@context": "http://azureiot.com/v1/contexts/IoTModel.json"
}
```

When a digital twin implements the Tracker interface and sends telemetry using JSON serialization, the JSON payload for "location" is a GeoJSON geometry.
```json
{
    "location": {
        "type": "Point",
        "coordinates": [ 12.3456, 23.4567 ]
    }
}
```

## Geospatial Complex Schema Definition
The geospatial schema is defined in the Digital Twin Definition Language.
```json
{
    "@id": "Schemas/geospatial",
    "@type": "Object",
    "fields": [
        {
            "name": "type",
            "schema": "Schemas/geospatialType"
        },
        {
            "name": "coordinates",
            "comment": "Use coordinates when type is Point, MultiPoint, LineString, MultiLineString, Polygon, or MultiPolygon",
            "schema": {
                "@type": "Array",
                "elementSchema": "double"
            }
        },
        {
            "name": "geometries",
            "comment": "Use geometries when type is GeometryCollection",
            "schema": {
                "@type": "Array",
                "elementSchema": "Schemas/geospatial"
            }
        }
    ]
}
```
```json
{
    "@id": "Schemas/geospatialType",
    "@type": "Enum",
    "valueSchema": "string",
    "enumValues": [
        {
            "name": "point",
            "enumValue": "Point"
        },
        {
            "name": "multiPoint",
            "enumValue": "MultiPoint"
        },
        {
            "name": "lineString",
            "enumValue": "LineString"
        },
        {
            "name": "multiLineString",
            "enumValue": "MultiLineString"
        },
        {
            "name": "polygon",
            "enumValue": "Polygon"
        },
        {
            "name": "multiPolygon",
            "enumValue": "MultiPolygon"
        },
        {
            "name": "geometryCollection",
            "enumValue": "GeometryCollection"
        }
    ]
}
```
