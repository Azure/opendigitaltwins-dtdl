# Onvif extension

The DTDL Onvif extension facilitates the translation of [ONVIF WSDL definitions](https://www.onvif.org/profiles/specifications/) into DTDL.
The request and response schemas defined in the ONVIF specification are deeply nested.
The higher limits provided by the Onvif extension permit the direct translation of WSDL definitions without the need for flattening.
In addition, the increased length limit on values of the DTDL "description" property permits directly copying WSDL descriptions without the need for abridging or summarizing.

## Revised global limits

## Revised property limits

The following tables itemize the types and properties whose limits are increased by the extension.

### Array

| Property | Description | Standard limits | Onvif limits |
| --- | --- | --- | --- |
| `description` | A localizable description for display. | max 512 characters | max 4096 characters |
| `elementSchema` | The data type of each element in the Array, which is an instance of Schema. | max depth of 8 levels | max depth of 24 levels |

### Command

| Property | Description | Standard limits | Onvif limits |
| --- | --- | --- | --- |
| `description` | A localizable description for display. | max 512 characters | max 4096 characters |

### CommandRequest

| Property | Description | Standard limits | Onvif limits |
| --- | --- | --- | --- |
| `description` | A localizable description for display. | max 512 characters | max 4096 characters |

### CommandResponse

| Property | Description | Standard limits | Onvif limits |
| --- | --- | --- | --- |
| `description` | A localizable description for display. | max 512 characters | max 4096 characters |

### Component

| Property | Description | Standard limits | Onvif limits |
| --- | --- | --- | --- |
| `description` | A localizable description for display. | max 512 characters | max 4096 characters |

### Enum

| Property | Description | Standard limits | Onvif limits |
| --- | --- | --- | --- |
| `description` | A localizable description for display. | max 512 characters | max 4096 characters |

### EnumValue

| Property | Description | Standard limits | Onvif limits |
| --- | --- | --- | --- |
| `description` | A localizable description for display. | max 512 characters | max 4096 characters |

### Field

| Property | Description | Standard limits | Onvif limits |
| --- | --- | --- | --- |
| `description` | A localizable description for display. | max 512 characters | max 4096 characters |
| `schema` | The data type of the element, which is an instance of Schema. | max depth of 8 levels when Field is the value of Object `fields` | max depth of 24 levels when Field is the value of Object `fields` |

### Interface

| Property | Description | Standard limits | Onvif limits |
| --- | --- | --- | --- |
| `description` | A localizable description for display. | max 512 characters | max 4096 characters |

### Map

| Property | Description | Standard limits | Onvif limits |
| --- | --- | --- | --- |
| `description` | A localizable description for display. | max 512 characters | max 4096 characters |

### MapKey

| Property | Description | Standard limits | Onvif limits |
| --- | --- | --- | --- |
| `description` | A localizable description for display. | max 512 characters | max 4096 characters |

### MapValue

| Property | Description | Standard limits | Onvif limits |
| --- | --- | --- | --- |
| `description` | A localizable description for display. | max 512 characters | max 4096 characters |
| `schema` | The data type of the element, which is an instance of Schema. | max depth of 8 levels when MapValue is the value of Map `mapValue` | max depth of 24 levels when MapValue is the value of Map `mapValue` |

### Object

| Property | Description | Standard limits | Onvif limits |
| --- | --- | --- | --- |
| `description` | A localizable description for display. | max 512 characters | max 4096 characters |

### Property

| Property | Description | Standard limits | Onvif limits |
| --- | --- | --- | --- |
| `description` | A localizable description for display. | max 512 characters | max 4096 characters |

### Relationship

| Property | Description | Standard limits | Onvif limits |
| --- | --- | --- | --- |
| `description` | A localizable description for display. | max 512 characters | max 4096 characters |

### Telemetry

| Property | Description | Standard limits | Onvif limits |
| --- | --- | --- | --- |
| `description` | A localizable description for display. | max 512 characters | max 4096 characters |

## Onvif examples

The following example is a highly abridged excerpt from a translation of the ONVIF standard into DTDL.
This model is valid despite having a nested schema whose depth exceeds the standard DTDL limit.

```json
{
  "@context": [
    "dtmi:dtdl:context;4#limitless",
    "dtmi:dtdl:limits:onvif;1"
  ],
  "@id": "dtmi:onvif:media;1",
  "@type": "Interface",
  "schemas": [
    {
      "@id": "dtmi:onvif:media:GetProfilesResponse;1",
      "@type": "Object",
      "fields": [
        {
          "name": "Profiles",
          "description": "List of profiles",
          "schema": {
            "@type": "Array",
            "elementSchema": "dtmi:onvif:media:Profile;1"
          }
        }
      ]
    },
    {
      "@id": "dtmi:onvif:media:Profile;1",
      "@type": "Object",
      "fields": [
        {
          "name": "MetadataConfiguration",
          "description": "Optional configuration of the metadata stream.",
          "schema": "dtmi:onvif:media:MetadataConfiguration;1"
        }
      ]
    },
    {
      "@id": "dtmi:onvif:media:MetadataConfiguration;1",
      "@type": "Object",
      "fields": [
        {
          "name": "AnalyticsEngineConfiguration",
          "schema": "dtmi:onvif:media:AnalyticsEngineConfiguration;1"
        }
      ]
    },
    {
      "@id": "dtmi:onvif:media:AnalyticsEngineConfiguration;1",
      "@type": "Object",
      "fields": [
        {
          "name": "AnalyticsModule",
          "schema": {
            "@type": "Array",
            "elementSchema": "dtmi:onvif:media:Config;1"
          }
        }
      ]
    },
    {
      "@id": "dtmi:onvif:media:Config;1",
      "@type": "Object",
      "fields": [
        {
          "name": "Parameters",
          "description": "List of configuration parameters as defined in the corresponding description.",
          "schema": "dtmi:onvif:media:ItemList;1"
        }
      ]
    },
    {
      "@id": "dtmi:onvif:media:ItemList;1",
      "@type": "Object",
      "fields": [
        {
          "name": "SimpleItem",
          "description": "Value name pair as defined by the corresponding description.",
          "schema": {
            "@type": "Array",
            "elementSchema": "dtmi:onvif:media:SimpleItem;1"
          }
        }
      ]
    },
    {
      "@id": "dtmi:onvif:media:SimpleItem;1",
      "@type": "Object",
      "fields": [
        {
          "name": "Name",
          "description": "Item name.",
          "schema": "string"
        },
        {
          "name": "Value",
          "description": "Item value. The type is defined in the corresponding description.",
          "schema": "string"
        }
      ]
    }
  ],
  "contents": [
    {
      "@type": "Command",
      "name": "GetProfiles",
      "response": {
        "name": "GetProfilesResponse",
        "schema": "dtmi:onvif:media:GetProfilesResponse;1"
      }
    }
  ]
}
```

