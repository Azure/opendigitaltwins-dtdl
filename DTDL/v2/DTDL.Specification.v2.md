# DTDL Language Specification

**Version 2**

## Table of Contents

* [Introduction](#introduction)
* [Terminology](#terminology)
* [Model completeness](#model-completeness)
* [DTDL element](#dtdl-element)
* [Limits and exclusions](#limits-and-exclusions)
* [Representational literal](#representational-literal)
* [Localizable string](#localizable-string)
* [Standard schemas](#standard-schemas)
* [Semantic types](#semantic-types)
* [Reserved strings](#reserved-strings)
* [Context](#context)
* [Digital Twin Model Identifier](#digital-twin-model-identifier)
* [Glossary](#glossary)

## Introduction

The document [Digital Twins Definition Language (DTDL)](./DTDL.v2.md) &mdash; herein referred to as the *DTDL Reference* &mdash; is a description of the DTDL language in a manner that is explanatory and illustrative.
In contrast, the present document is a strict specification of the DTDL language in a manner that is comprehensive and normative.
The present document is not intended to teach the DTDL language but rather to precisely delineate the language.
Unlike the DTDL Reference, the present document can be employed to assess whether a given collection of documents constitutes a valid DTDL model.
However, the format and content of this document are not conducive to learning the language or to understanding how to apply it to a modeling problem.

DTDL is a modeling language.
It is based on [JSON-LD](https://json-ld.org/spec/FCGS/json-ld/20180607/), which is a means for encoding [RDF](https://www.w3.org/RDF/) statements in [JSON](https://www.json.org/json-en.html) syntax.
DTDL can be understood and validated without knowing RDF or JSON-LD, and the present document specifies DTDL without reference to either of these other standards.
DTDL cannot be readily understood without a basic knowledge of JSON; however, JSON syntax is fortunately straightforward, in marked contrast to the size, complexity, and subtlety of JSON-LD.

Within this document, the key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED",  "MAY", and "OPTIONAL" are to be interpreted as described in IETF [RFC 2119](https://tools.ietf.org/search/rfc2119) as updated by [RFC 8174](https://tools.ietf.org/search/rfc8174), per [BCP 14](https://tools.ietf.org/search/bcp14).
Although these IETF documents make no distinction between the meaning of "MUST" and "SHALL", in the present document a violation of a "MUST" requirement indicates an **invalid** model, whereas a violation of a "SHALL" requirement indicates an **incomplete** model.
See [Model completeness](#model-completeness) for a description of this distinction.

## Terminology

This document defines DTDL terms with reference to JSON terminology.
In some cases, this overlaps with JSON-LD terminology, but there are several significant differences.
Following is a complete set of JSON terms with concise definitions:

* null &mdash; the literal `null`
* boolean &mdash; either of the literals `true` or `false`
* number &mdash; a signed decimal numeric value
* string &mdash; a double-quoted sequence of [Unicode](https://home.unicode.org/) characters
* array &mdash; a bracket-enclosed sequence of comma-separated JSON values
* object &mdash; a brace-enclosed sequence of comma-separated members
* member &mdash; a colon-separated ordered pair of a string and a JSON value
* value &mdash; an object OR array OR string OR number OR boolean OR null

For brevity and simplicity, the definitions above &mdash; particularly for number and string &mdash; are succinct to the point of imprecision.
See IETF [RFC 8259](https://tools.ietf.org/search/rfc8259) for more details on JSON syntax.
Note that the term "boolean" is never used in the JSON spec; the paired terms "true" and "false" are always used instead.
Another term not used in the JSON spec is "integer", which herein will mean an integral number expressible in 4 bytes.

In this document henceforth, each of the following terms &mdash; except when preceded by a qualifier such as "localizable" or "representational" &mdash; refers to the indicated component of JSON syntax: "null", "boolean", "number", "string", "array", "object", and "member".
The qualifier "JSON" may sometimes precede the term when helpful for clarity.

The term "value" has generic meaning, and so the term "JSON value" is used when it is important to specifically indicate the JSON syntax component in the itemization above.
With reference to arrays, the term "value" applies to each JSON value in an array.

With reference to members, the term "value" indicates the JSON value that is the second component in a member's ordered pair, and the term "name" indicates the string that is the first component in a member's ordered pair.
Each member in an object MUST have a name that is unique among all members in the object.
The phrase "*X* member" or "member *X*" will often be used as shorthand for "the member whose name is *X*".

In reference to a member, another term this document uses is "include".  A member *includes* JSON value *X* if either:

* the member's value is *X*, or
* the member's value is an array and *X* is a value in the array.

For example, in the following object, members "foo" and "bar" both include the JSON value 3:

```json
{
  "foo": 3,
  "bar": [ 1, 2, 3, 4 ]
}
```

Following are DTDL-specific terms used in the current document:

* model &mdash; a collection of zero or more JSON documents
* top-level object &mdash; an object closest to the root of a JSON document, specifically:
  * in a JSON document whose root value is an object: the root object
  * in a JSON document whose root value is an array of objects: each of the object values in the root array
  * in any other JSON document: undefined

* DTDL element &mdash; a JSON object that conforms to the definition of a [DTDL element](#dtdl-element)
* representational literal &mdash; a JSON string, number, boolean, or object that conforms to the definition of a [representational literal](#representational-literal)
* localizable string &mdash; a JSON string, object, or array that conforms to the definition of a [localizable string](#localizable-string)
* top-level element &mdash; synonym for "top-level object" if the object is a conformant DTDL element

The [DTDL Reference](./DTDL.v2.md) uses JSON-LD terminology, which has some unfortunate differences from the JSON terminology used herein.
Although the following terms are not used in the present document, the correspondence in this list may be helpful to anyone attempting to work with both DTDL language documents:

* property &mdash; analogous to JSON member
* node &mdash; analogous to JSON object
* IRI &mdash; analogous to JSON string with a particular set of constraints

## Model completeness

The rules in the present document can determine that a model is valid only if the model is complete.
To define model completeness, we must first introduce the concept of a dependent reference.
A *dependent reference* is a [DTMI](#digital-twin-model-identifier) string included in a member in place of a DTDL element.
When any DTDL element in a model has a member that includes a dependent reference, the model is *referentially incomplete* if it does not also contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference.
For example, in the following model, DTDL element "dtmi:example:derivedInterface;1" has a dependent reference to "dtmi:example:baseInterface;1", but the model is referentially complete because it also contains a DTDL element with "@id" of "dtmi:example:baseInterface;1":

```json
[
  {
    "@context": "dtmi:dtdl:context;2",
    "@id": "dtmi:example:derivedInterface;1",
    "@type": "Interface",
    "extends": "dtmi:example:baseInterface;1",
    "contents": [
      {
        "@type": "Telemetry",
        "name": "resolution",
        "schema": "integer"
      }
    ]
  },
  {
    "@context": "dtmi:dtdl:context;2",
    "@id": "dtmi:example:baseInterface;1",
    "@type": "Interface",
    "contents": [
      {
        "@type": "Telemetry",
        "name": "pixels",
        "schema": {
          "@id": "dtmi:example:boolArray;1",
          "@type": "Array",
          "elementSchema": "boolean"
        }
      }
    ]
  }
]
```

In contrast, a *non-dependent reference* is a [DTMI](#digital-twin-model-identifier) string included in a member that only takes DTMI string values.
The presence or absence of a non-dependent reference has no impact on model completeness.
For example, in the following model, DTDL element "dtmi:example:anInterface;1" has a non-dependent reference to "dtmi:foo:bar:baz;1" because DTDL element [Relationship](#relationship) member "target" takes only DTMI string values.
The model may therefore be complete even though no DTDL element with "@id" of "dtmi:foo:bar:baz;1" is present in the model:

```json
{
  "@context": "dtmi:dtdl:context;2",
  "@id": "dtmi:example:anInterface;1",
  "@type": "Interface",
  "contents": [
    {
      "@type": "Relationship",
      "name": "proximity",
      "target": "dtmi:foo:bar:baz;1"
    }
  ]
}
```

Furthermore, the identifiers in the [Context](#context) section of a model refer to DTDL language extensions that define additional types, properties, elements, and constraints beyond those defined in the core DTDL language.
A model is *contextually incomplete* if it specifies an extension context that has no available definition.
For example, the following model specfies extension context "dtmi:example:someExtensionContext;1".
If the definition of this extension is not known, the model is contextually incomplete:

```json
{
  "@context": [
      "dtmi:dtdl:context;2",
      "dtmi:example:someExtensionContext;1"
  ],
  "@id": "dtmi:example:someInterface;1",
  "@type": "Interface",
  "contents": [
    {
      "@type": [
        "Property",
        "Flavor"
      ],
      "name": "flavoring",
      "schema": "string"
    }
  ]
}
```

A model is *complete* if it is neither referentially incomplete nor contextually incomplete, such that all dependent references and all specified contexts have available definitions.
Only a complete model can be valid.



The validity of a referentially incomplete model is contingent on the dependently referenced portions of the model.
For example, the model above in which Interface "dtmi:example:derivedInterface;1" extends Interface "dtmi:example:baseInterface;1" would be invalid if the Telemetries in both Interfaces had the same name, which would not be apparent without the definition of "dtmi:example:baseInterface;1".
On the other hand, a referentially incomplete model may be invalid if it contains one or more violations that are apparent without observing the remaining portions of the model.

The validity of a contextually incomplete model depends on whether the model satisfies constraints defined by the specified extension.
For example, the model above that specfies extension context "dtmi:example:someExtensionContext;1" is invalid if the extension defines Flavor as a type that is not allowed to be co-typed with Property, which would not be apparent without the definition of "dtmi:example:someExtensionContext;1".
On the other hand, a contextually incomplete model may be invalid if it contains one or more violations that are apparent without assessing the unknown extension constraints.

Consequently, a DTDL model may be in one of four states:

* complete and invalid
* complete and valid
* incomplete and invalid
* incomplete with indeterminate validity

A service, tool, application, or library MAY exercise discretion regarding whether to accept or reject a model that is incomplete with indeterminate validity.
It might accept all such models, reject all such models, base its acceptance or rejection on specific aspects of a model, or offer configuration options to control this behavior.
Moreover, there is no obligation for consistency across models or over time.
However, it is RECOMMENDED that acceptance/rejection decisions should be deterministic, and it is further RECOMMENDED that these decisions not become increasingly strict over time, since this can lead to backward-compatibility issues.

For DTDL version 2 models, in the absence of considerations that motivate a different policy, it is RECOMMENDED that contextually incomplete models be accepted by default.

When a member includes a dependent reference, the DTDL element whose "@id" member has a matching value is said to be *referentially included* in the member that includes the dependent reference.
If no referentially included DTDL element is present in the model, the model is referentially incomplete.

In the sequel, when stating the requirement for a referentially included element to be present, the key word "SHALL" is used to indicate that this is needed for completeness.
This contrasts with the key words "MUST" and "REQUIRED", which are used to indicate requirements for validity rather than completeness.
The key word "SHALL" is also used when stating requirements that may be unverifiable in contextually incomplete models.

## DTDL element

A model is a forest of DTDL elements, each of which is a JSON object.
The root of each tree is known as a top-level element.
Each top-level element is a JSON object that is either the root of a JSON document or a value in a JSON array that is the root of a JSON document.
Every JSON document in a model [MUST](spec/Requirement-RootArrayOrObjV2.json) have a root value that is either an object or an array of objects.

Every DTDL element that is not a top-level element is included in some member of another DTDL element.
A DTDL element is known as the *structural parent* of every DTDL element that is included in one of its members.
Without the "structural" qualifier, the term "parent" has the following broader meaning:
A DTDL element is known as a *parent* of every DTDL element that is included or referentially included in one of its members.
Note that an element can have multiple parents, although at most one of these is its structural parent.

The inverse relation to "parent" is "child":
Each DTDL element that is included in a member is known as a *structural child* of the DTDL element that has the member.
Each DTDL element that is included or referentially included in a member is known as a *child* of a DTDL element that has the member.

The term "structural ancestor" transitively closes the "structural parent" relation: A DTDL element *X* is a *structural ancestor* of DTDL element *Y* if *X* is a structural parent of *Y* or if *X* is a structural ancestor of a structural parent of *Y*.
The inverse relation to "structural ancestor" is "structural descendant", which transitively closes the "structural child" relation: A DTDL element *Y* is a *structural descendant* of DTDL element *X* if *Y* is a structural child of *X* or if *Y* is a structural child of a structural descendant of *X*.

The term "ancestor" transitively closes the "parent" relation: A DTDL element *X* is an *ancestor* of DTDL element *Y* if *X* is a parent of *Y* or if *X* is an ancestor of a parent of *Y*.
The inverse relation to "ancestor" is "descendant", which transitively closes the "child" relation: A DTDL element *Y* is a *descendant* of DTDL element *X* if *Y* is a child of *X* or if *Y* is a child of a descendant of *X*.

A sequence of members that can be followed via inclusion or referential inclusion from DTDL element *X* to DTDL element *Y* is known as a *path* from *X* to *Y*.
In the example of a dependent reference above, there is a path from DTDL element "dtmi:example:derivedInterface;1" to DTDL element "dtmi:example:boolArray;1".

A DTDL element [MUST NOT](spec/Requirement-NoPathToSelfV2.json) have a path to itself, such as the path from "dtmi:example:selfReferencingInterface;1" to "dtmi:example:selfReferencingInterface;1" in the following invalid example:

```json
{
  "@context": "dtmi:dtdl:context;2",
  "@id": "dtmi:example:selfReferencingInterface;1",
  "@type": "Interface",
  "contents": [
    {
      "@type": "Component",
      "name": "me",
      "schema": "dtmi:example:selfReferencingInterface;1"
    }
  ]
}
```

Note that this restriction does not apply to non-dependent references because only dependent references result in referential inclusion; a non-dependent reference is not part of a path between DTDL elements.
Therefore, the model in the following example is valid:



```json
{
  "@context": "dtmi:dtdl:context;2",
  "@id": "dtmi:example:anInterface;1",
  "@type": "Interface",
  "contents": [
    {
      "@type": "Relationship",
      "name": "sameness",
      "target": "dtmi:example:anInterface;1"
    }
  ]
}
```

A DTDL element type can have a member that is specified to expand the set of elements that are referentially included in other members.
Specifically:

* An element is considered to be referentially included in the "contents" member of Interface *X* if it is included or referentially included in the "contents" member of some Interface *Y* that is included or referentially included in the "extends" member of Interface *X*, and this definition applies transitively.

### Partitions and referenceability

The elements of a DTDL model are subdivided into *partitions*.
Each partition is a specific collection of DTDL elements, grouped according to the following rules:

* Each top-level element is in a distinct partition from all other top-level elements.
* Each DTDL [Interface](#interface) element is in a distinct partition from all other Interface elements and top-level elements.
* A DTDL element that is not top-level and not an Interface is in the same partition as its structural parent element.

Top-level elements are more restrictive than DTDL elements that are nested within other elements.
A top-level element:

* [MUST](spec/Requirement-TopLevelRootableV2.json) conform to the definition of DTDL element [Interface](#interface).
* [MUST](spec/Requirement-TopLevelDtdlContextV2.json) have a "@context" member that includes string value "dtmi:dtdl:context;2".

A DTDL element is *referenceable* by another if it is an Interface, a top-level element, or an element in the same partition as the element that references it.
Stated more precisely:

* Every top-level element is referenceable by every other DTDL element in the model.
* Every Interface element is referenceable by every other DTDL element in the model.
* Every element that is not top-level and not an Interface is referenceable only by other DTDL elements in the same partition.

A member of a DTDL element [MUST NOT](spec/Requirement-DependencyReferenceableV2.json) include a dependent reference to any DTDL element that is not referenceable by the element that has the member.

The following subsections define elements that may be present in a DTDL model.
Each element specifies the members it must/may have and constraints on each member.
For optional members, the constraints apply only if the member is present in the element.

> Note that some members may be optional in general but required under certain circumstances.
Such circumstances are indicated in the member's constraints.

[Array](#array) | [Command](#command) | [CommandPayload](#commandpayload) | [Component](#component) | [Enum](#enum) | [EnumValue](#enumvalue) | [Field](#field) | [Interface](#interface) | [Map](#map) | [MapKey](#mapkey) | [MapValue](#mapvalue) | [Object](#object) | [Property](#property) | [Relationship](#relationship) | [Telemetry](#telemetry)

### Array

Example:

```json
{
  "@context": "dtmi:dtdl:context;2",
  "@id": "dtmi:example:alpha_gamma;1",
  "@type": "Interface",
  "schemas": {
    "@id": "dtmi:example:alpha_beta;1",
    "@type": "Array",
    "elementSchema": "boolean"
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassArrayRequiredPropertiesV2.json):

* @type
  * Value [MUST](spec/Requirement-ClassArrayTypeStringOrArrayV2.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassArrayTypeIncludesMaterialV2.json) include either string "Array" or string "dtmi:dtdl:class:Array;2".
  * [SHOULD NOT](spec/Recommendation-ClassArrayTypeIncludesTermAndDtmiV2.json) include both "Array" and "dtmi:dtdl:class:Array;2".
  * [SHOULD NOT](spec/Recommendation-ClassArrayTypeDuplicatesMaterialV2.json) include more than one instance of either "Array" or "dtmi:dtdl:class:Array;2".
  * String "Array" is [RECOMMENDED](spec/Recommendation-ClassArrayTypePreferTermToDtmiV2.json) over string "dtmi:dtdl:class:Array;2".
  * [SHALL NOT](spec/Completion-ClassArrayTypeIncludesIrrelevantDtmiOrTermV2.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "Array" or "dtmi:dtdl:class:Array;2", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassArrayTypeIncludesInvalidDtmiV2.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MAY](spec/Allowance-ClassArrayTypeIncludesNotDtmiNorTermV2.json) include any string that contains ":" but does not start with "dtmi:". If any such string is included, the element is considered to be *informally co-typed*.
  * [MAY](spec/Allowance-ClassArrayTypeIncludesUndefinedTermV2.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If any such string is included, the element is considered to be *informally co-typed*.
* elementSchema
  * Value [MUST](spec/Requirement-ClassArrayPropertyElementSchemaElementV2.json) be a DTDL element, a dependent reference to a DTDL element, a string from one of the rows in a [Standard schemas](#standard-schemas) table, a string defined by an extension referenced in the active context, or an array containing exactly one DTDL element, dependent reference to a DTDL element, string from one of the rows in a Standard schemas table, or string defined by an extension referenced in the active context.
  * If the value is a dependent reference or an array containing a dependent reference, the model [SHALL](spec/Completion-ClassArrayPropertyElementSchemaDependentReferenceV2.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * If present, an included or referentially included DTDL element [MUST](spec/Requirement-ClassArrayPropertyElementSchemaTypeConformanceV2.json) conform to the definition of DTDL element [Array](#array) or [Enum](#enum) or [Map](#map) or [Object](#object).
  * If a string from one of the rows in a Standard schemas table is included, a string from column "Term" is [RECOMMENDED](spec/Recommendation-ClassArrayPropertyElementSchemaPreferTermToDtmiV2.json) over a string from column "DTMI".
  * Considered with other DTDL elements, value is subject to any relevant restrictions in [Limits and exclusions](#limits-and-exclusions).
  * Member name [MAY](spec/Allowance-ClassArrayPropertyElementSchemaDtmiV2.json) be expressed as "dtmi:dtdl:property:elementSchema;2" instead of "elementSchema", but "elementSchema" is [RECOMMENDED](spec/Recommendation-ClassArrayPropertyElementSchemaTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassArrayPropertyElementSchemaTermAndDtmiV2.json) be expressed as both "elementSchema" and "dtmi:dtdl:property:elementSchema;2".

The following members are [OPTIONAL](spec/Allowance-ClassArrayOptionalPropertiesV2.json) unless otherwise noted:

* @context
  * [MUST](spec/Requirement-ClassArrayContextConformsV2.json) conform to the specified [context](#context) rules.
* @id
  * [REQUIRED](spec/Requirement-ClassArrayIdRequiredV2.json) when the Array element is included in Interface member "schemas".
  * Value [MUST](spec/Requirement-ClassArrayIdIsDtmiV2.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassArrayIdNotArrayV2.json) be an array.
  * Value [MUST](spec/Requirement-ClassArrayIdDuplicateV2.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassArrayPropertyCommentStringV2.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassArrayPropertyCommentStringLengthV2.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassArrayPropertyCommentDtmiV2.json) be expressed as "dtmi:dtdl:property:comment;2" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassArrayPropertyCommentTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassArrayPropertyCommentTermAndDtmiV2.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;2".
* description
  * Value [MUST](spec/Requirement-ClassArrayPropertyDescriptionLangStringV2.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassArrayPropertyDescriptionStringLengthV2.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassArrayPropertyDescriptionDtmiV2.json) be expressed as "dtmi:dtdl:property:description;2" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassArrayPropertyDescriptionTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassArrayPropertyDescriptionTermAndDtmiV2.json) be expressed as both "description" and "dtmi:dtdl:property:description;2".
* displayName
  * Value [MUST](spec/Requirement-ClassArrayPropertyDisplayNameLangStringV2.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassArrayPropertyDisplayNameStringLengthV2.json) be more than 64 characters in length.
  * Member name [MAY](spec/Allowance-ClassArrayPropertyDisplayNameDtmiV2.json) be expressed as "dtmi:dtdl:property:displayName;2" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassArrayPropertyDisplayNameTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassArrayPropertyDisplayNameTermAndDtmiV2.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;2".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* A member named "@graph" [MUST NOT](spec/Requirement-ClassArrayGraphKeywordV2.json) be present.
* Members with names starting with "@" other than "@context", "@id", and "@type" [SHOULD NOT](spec/Recommendation-ClassArrayInvalidKeywordsV2.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [MAY](spec/Allowance-ClassArrayPropertyIrrelevantDtmiOrTermV2.json) be present if the element is informally co-typed and if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table.
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassArrayPropertyFormallyIrrelevantDtmiOrTermV2.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "elementSchema", "dtmi:dtdl:property:comment;2", "dtmi:dtdl:property:description;2", "dtmi:dtdl:property:displayName;2", "dtmi:dtdl:property:elementSchema;2".
* A member [MAY](spec/Allowance-ClassArrayPropertyInvalidDtmiV2.json) be present if the element is informally co-typed and if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassArrayPropertyFormallyInvalidDtmiV2.json) be present if the element is not informally co-typed and the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MAY](spec/Allowance-ClassArrayPropertyNotDtmiNorTermV2.json) be present if the element is informally co-typed and if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [MUST NOT](spec/Requirement-ClassArrayPropertyFormallyNotDtmiNorTermV2.json) be present if the element is not informally co-typed and the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [MAY](spec/Allowance-ClassArrayPropertyUndefinedTermV2.json) be present if the element is informally co-typed and if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassArrayPropertyFormallyUndefinedTermV2.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### Command

Example:

```json
{
  "@context": "dtmi:dtdl:context;2",
  "@id": "dtmi:example:alpha_epsilon;1",
  "@type": "Interface",
  "contents": {
    "@type": "Command",
    "name": "alpha_delta"
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassCommandRequiredPropertiesV2.json):

* @type
  * Value [MUST](spec/Requirement-ClassCommandTypeStringOrArrayV2.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassCommandTypeIncludesMaterialV2.json) include either string "Command" or string "dtmi:dtdl:class:Command;2".
  * [SHOULD NOT](spec/Recommendation-ClassCommandTypeIncludesTermAndDtmiV2.json) include both "Command" and "dtmi:dtdl:class:Command;2".
  * [SHOULD NOT](spec/Recommendation-ClassCommandTypeDuplicatesMaterialV2.json) include more than one instance of either "Command" or "dtmi:dtdl:class:Command;2".
  * String "Command" is [RECOMMENDED](spec/Recommendation-ClassCommandTypePreferTermToDtmiV2.json) over string "dtmi:dtdl:class:Command;2".
  * [SHALL NOT](spec/Completion-ClassCommandTypeIncludesIrrelevantDtmiOrTermV2.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "Command" or "dtmi:dtdl:class:Command;2", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassCommandTypeIncludesInvalidDtmiV2.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MAY](spec/Allowance-ClassCommandTypeIncludesNotDtmiNorTermV2.json) include any string that contains ":" but does not start with "dtmi:". If any such string is included, the element is considered to be *informally co-typed*.
  * [MAY](spec/Allowance-ClassCommandTypeIncludesUndefinedTermV2.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If any such string is included, the element is considered to be *informally co-typed*.
* name
  * Value [MUST](spec/Requirement-ClassCommandPropertyNameStringV2.json) be a [representational string](#representational-string) or an array containing exactly one representational string.
  * String value [MUST NOT](spec/Requirement-ClassCommandPropertyNameStringLengthV2.json) be more than 64 characters in length.
  * String value [MUST](spec/Requirement-ClassCommandPropertyNamePatternV2.json) match regular expression `^[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?$`.
  * String value [MUST](spec/Requirement-ClassCommandPropertyNameUniqueAmongInterfaceContentsV2.json) be unique among the included values of "name" members of all elements included or referentially included in the "contents" member of any parent [Interface](#interface) element.
  * Member name [MAY](spec/Allowance-ClassCommandPropertyNameDtmiV2.json) be expressed as "dtmi:dtdl:property:name;2" instead of "name", but "name" is [RECOMMENDED](spec/Recommendation-ClassCommandPropertyNameTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandPropertyNameTermAndDtmiV2.json) be expressed as both "name" and "dtmi:dtdl:property:name;2".

The following members are [OPTIONAL](spec/Allowance-ClassCommandOptionalPropertiesV2.json):

* @context
  * [MUST](spec/Requirement-ClassCommandContextConformsV2.json) conform to the specified [context](#context) rules.
* @id
  * Value [MUST](spec/Requirement-ClassCommandIdIsDtmiV2.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassCommandIdNotArrayV2.json) be an array.
  * Value [MUST](spec/Requirement-ClassCommandIdDuplicateV2.json) be unique among the values of all "@id" members of all elements in the model.
* commandType
  * [SHOULD NOT](spec/Recommendation-ClassCommandPropertyCommandTypeDeprecatedV2.json) be present in the element; this member is deprecated.
  * Value [MUST](spec/Requirement-ClassCommandPropertyCommandTypeSpecificValuesV2.json) be "asynchronous", "synchronous", "dtmi:dtdl:instance:CommandType:asynchronous;2", "dtmi:dtdl:instance:CommandType:synchronous;2", or an array containing no more than one of these string values.
  * Member name [MAY](spec/Allowance-ClassCommandPropertyCommandTypeDtmiV2.json) be expressed as "dtmi:dtdl:property:commandType;2" instead of "commandType", but "commandType" is [RECOMMENDED](spec/Recommendation-ClassCommandPropertyCommandTypeTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandPropertyCommandTypeTermAndDtmiV2.json) be expressed as both "commandType" and "dtmi:dtdl:property:commandType;2".
* comment
  * Value [MUST](spec/Requirement-ClassCommandPropertyCommentStringV2.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassCommandPropertyCommentStringLengthV2.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassCommandPropertyCommentDtmiV2.json) be expressed as "dtmi:dtdl:property:comment;2" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassCommandPropertyCommentTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandPropertyCommentTermAndDtmiV2.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;2".
* description
  * Value [MUST](spec/Requirement-ClassCommandPropertyDescriptionLangStringV2.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassCommandPropertyDescriptionStringLengthV2.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassCommandPropertyDescriptionDtmiV2.json) be expressed as "dtmi:dtdl:property:description;2" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassCommandPropertyDescriptionTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandPropertyDescriptionTermAndDtmiV2.json) be expressed as both "description" and "dtmi:dtdl:property:description;2".
* displayName
  * Value [MUST](spec/Requirement-ClassCommandPropertyDisplayNameLangStringV2.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassCommandPropertyDisplayNameStringLengthV2.json) be more than 64 characters in length.
  * Member name [MAY](spec/Allowance-ClassCommandPropertyDisplayNameDtmiV2.json) be expressed as "dtmi:dtdl:property:displayName;2" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassCommandPropertyDisplayNameTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandPropertyDisplayNameTermAndDtmiV2.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;2".
* request
  * Value [MUST](spec/Requirement-ClassCommandPropertyRequestElementV2.json) be a DTDL element, a dependent reference to DTDL element, or an array containing no more than one DTDL element or dependent reference to a DTDL element.
  * If the value is a dependent reference or an array containing a dependent reference, the model [SHALL](spec/Completion-ClassCommandPropertyRequestDependentReferenceV2.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * If present, included or referentially included DTDL element [MUST](spec/Requirement-ClassCommandPropertyRequestTypeConformanceV2.json) conform to the definition of DTDL element [CommandPayload](#commandpayload).
  * Member name [MAY](spec/Allowance-ClassCommandPropertyRequestDtmiV2.json) be expressed as "dtmi:dtdl:property:request;2" instead of "request", but "request" is [RECOMMENDED](spec/Recommendation-ClassCommandPropertyRequestTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandPropertyRequestTermAndDtmiV2.json) be expressed as both "request" and "dtmi:dtdl:property:request;2".
* response
  * Value [MUST](spec/Requirement-ClassCommandPropertyResponseElementV2.json) be a DTDL element, a dependent reference to DTDL element, or an array containing no more than one DTDL element or dependent reference to a DTDL element.
  * If the value is a dependent reference or an array containing a dependent reference, the model [SHALL](spec/Completion-ClassCommandPropertyResponseDependentReferenceV2.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * If present, included or referentially included DTDL element [MUST](spec/Requirement-ClassCommandPropertyResponseTypeConformanceV2.json) conform to the definition of DTDL element [CommandPayload](#commandpayload).
  * Member name [MAY](spec/Allowance-ClassCommandPropertyResponseDtmiV2.json) be expressed as "dtmi:dtdl:property:response;2" instead of "response", but "response" is [RECOMMENDED](spec/Recommendation-ClassCommandPropertyResponseTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandPropertyResponseTermAndDtmiV2.json) be expressed as both "response" and "dtmi:dtdl:property:response;2".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* A member named "@graph" [MUST NOT](spec/Requirement-ClassCommandGraphKeywordV2.json) be present.
* Members with names starting with "@" other than "@context", "@id", and "@type" [SHOULD NOT](spec/Recommendation-ClassCommandInvalidKeywordsV2.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [MAY](spec/Allowance-ClassCommandPropertyIrrelevantDtmiOrTermV2.json) be present if the element is informally co-typed and if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table.
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassCommandPropertyFormallyIrrelevantDtmiOrTermV2.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "commandType", "comment", "description", "displayName", "name", "request", "response", "dtmi:dtdl:property:commandType;2", "dtmi:dtdl:property:comment;2", "dtmi:dtdl:property:description;2", "dtmi:dtdl:property:displayName;2", "dtmi:dtdl:property:name;2", "dtmi:dtdl:property:request;2", "dtmi:dtdl:property:response;2".
* A member [MAY](spec/Allowance-ClassCommandPropertyInvalidDtmiV2.json) be present if the element is informally co-typed and if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassCommandPropertyFormallyInvalidDtmiV2.json) be present if the element is not informally co-typed and the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MAY](spec/Allowance-ClassCommandPropertyNotDtmiNorTermV2.json) be present if the element is informally co-typed and if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [MUST NOT](spec/Requirement-ClassCommandPropertyFormallyNotDtmiNorTermV2.json) be present if the element is not informally co-typed and the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [MAY](spec/Allowance-ClassCommandPropertyUndefinedTermV2.json) be present if the element is informally co-typed and if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassCommandPropertyFormallyUndefinedTermV2.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### CommandPayload

Example:

```json
{
  "@context": "dtmi:dtdl:context;2",
  "@id": "dtmi:example:alpha_kappa;1",
  "@type": "Interface",
  "contents": {
    "@type": "Command",
    "name": "alpha_iota",
    "request": {
      "name": "alpha_theta",
      "schema": "date"
    }
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassCommandPayloadRequiredPropertiesV2.json):

* name
  * Value [MUST](spec/Requirement-ClassCommandPayloadPropertyNameStringV2.json) be a [representational string](#representational-string) or an array containing exactly one representational string.
  * String value [MUST NOT](spec/Requirement-ClassCommandPayloadPropertyNameStringLengthV2.json) be more than 64 characters in length.
  * String value [MUST](spec/Requirement-ClassCommandPayloadPropertyNamePatternV2.json) match regular expression `^[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?$`.
  * Member name [MAY](spec/Allowance-ClassCommandPayloadPropertyNameDtmiV2.json) be expressed as "dtmi:dtdl:property:name;2" instead of "name", but "name" is [RECOMMENDED](spec/Recommendation-ClassCommandPayloadPropertyNameTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandPayloadPropertyNameTermAndDtmiV2.json) be expressed as both "name" and "dtmi:dtdl:property:name;2".
* schema
  * Value [MUST](spec/Requirement-ClassCommandPayloadPropertySchemaElementV2.json) be a DTDL element, a dependent reference to a DTDL element, a string from one of the rows in a [Standard schemas](#standard-schemas) table, a string defined by an extension referenced in the active context, or an array containing exactly one DTDL element, dependent reference to a DTDL element, string from one of the rows in a Standard schemas table, or string defined by an extension referenced in the active context.
  * If the value is a dependent reference or an array containing a dependent reference, the model [SHALL](spec/Completion-ClassCommandPayloadPropertySchemaDependentReferenceV2.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * If present, an included or referentially included DTDL element [MUST](spec/Requirement-ClassCommandPayloadPropertySchemaTypeConformanceV2.json) conform to the definition of DTDL element [Array](#array) or [Enum](#enum) or [Map](#map) or [Object](#object).
  * If a string from one of the rows in a Standard schemas table is included, a string from column "Term" is [RECOMMENDED](spec/Recommendation-ClassCommandPayloadPropertySchemaPreferTermToDtmiV2.json) over a string from column "DTMI".
  * Member name [MAY](spec/Allowance-ClassCommandPayloadPropertySchemaDtmiV2.json) be expressed as "dtmi:dtdl:property:schema;2" instead of "schema", but "schema" is [RECOMMENDED](spec/Recommendation-ClassCommandPayloadPropertySchemaTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandPayloadPropertySchemaTermAndDtmiV2.json) be expressed as both "schema" and "dtmi:dtdl:property:schema;2".

The following members are [OPTIONAL](spec/Allowance-ClassCommandPayloadOptionalPropertiesV2.json):

* @context
  * [MUST](spec/Requirement-ClassCommandPayloadContextConformsV2.json) conform to the specified [context](#context) rules.
* @type
  * Value [MUST](spec/Requirement-ClassCommandPayloadTypeStringOrArrayV2.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassCommandPayloadTypeIncludesMaterialV2.json) include either string "CommandPayload" or string "dtmi:dtdl:class:CommandPayload;2".
  * [SHOULD NOT](spec/Recommendation-ClassCommandPayloadTypeIncludesTermAndDtmiV2.json) include both "CommandPayload" and "dtmi:dtdl:class:CommandPayload;2".
  * [SHOULD NOT](spec/Recommendation-ClassCommandPayloadTypeDuplicatesMaterialV2.json) include more than one instance of either "CommandPayload" or "dtmi:dtdl:class:CommandPayload;2".
  * String "CommandPayload" is [RECOMMENDED](spec/Recommendation-ClassCommandPayloadTypePreferTermToDtmiV2.json) over string "dtmi:dtdl:class:CommandPayload;2".
  * [SHALL NOT](spec/Completion-ClassCommandPayloadTypeIncludesIrrelevantDtmiOrTermV2.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "CommandPayload" or "dtmi:dtdl:class:CommandPayload;2", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassCommandPayloadTypeIncludesInvalidDtmiV2.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MAY](spec/Allowance-ClassCommandPayloadTypeIncludesNotDtmiNorTermV2.json) include any string that contains ":" but does not start with "dtmi:". If any such string is included, the element is considered to be *informally co-typed*.
  * [MAY](spec/Allowance-ClassCommandPayloadTypeIncludesUndefinedTermV2.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If any such string is included, the element is considered to be *informally co-typed*.
* @id
  * Value [MUST](spec/Requirement-ClassCommandPayloadIdIsDtmiV2.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassCommandPayloadIdNotArrayV2.json) be an array.
  * Value [MUST](spec/Requirement-ClassCommandPayloadIdDuplicateV2.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassCommandPayloadPropertyCommentStringV2.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassCommandPayloadPropertyCommentStringLengthV2.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassCommandPayloadPropertyCommentDtmiV2.json) be expressed as "dtmi:dtdl:property:comment;2" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassCommandPayloadPropertyCommentTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandPayloadPropertyCommentTermAndDtmiV2.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;2".
* description
  * Value [MUST](spec/Requirement-ClassCommandPayloadPropertyDescriptionLangStringV2.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassCommandPayloadPropertyDescriptionStringLengthV2.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassCommandPayloadPropertyDescriptionDtmiV2.json) be expressed as "dtmi:dtdl:property:description;2" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassCommandPayloadPropertyDescriptionTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandPayloadPropertyDescriptionTermAndDtmiV2.json) be expressed as both "description" and "dtmi:dtdl:property:description;2".
* displayName
  * Value [MUST](spec/Requirement-ClassCommandPayloadPropertyDisplayNameLangStringV2.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassCommandPayloadPropertyDisplayNameStringLengthV2.json) be more than 64 characters in length.
  * Member name [MAY](spec/Allowance-ClassCommandPayloadPropertyDisplayNameDtmiV2.json) be expressed as "dtmi:dtdl:property:displayName;2" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassCommandPayloadPropertyDisplayNameTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandPayloadPropertyDisplayNameTermAndDtmiV2.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;2".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* A member named "@graph" [MUST NOT](spec/Requirement-ClassCommandPayloadGraphKeywordV2.json) be present.
* Members with names starting with "@" other than "@context", "@id", and "@type" [SHOULD NOT](spec/Recommendation-ClassCommandPayloadInvalidKeywordsV2.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [MAY](spec/Allowance-ClassCommandPayloadPropertyIrrelevantDtmiOrTermV2.json) be present if the element is informally co-typed and if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table.
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassCommandPayloadPropertyFormallyIrrelevantDtmiOrTermV2.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "name", "schema", "dtmi:dtdl:property:comment;2", "dtmi:dtdl:property:description;2", "dtmi:dtdl:property:displayName;2", "dtmi:dtdl:property:name;2", "dtmi:dtdl:property:schema;2".
* A member [MAY](spec/Allowance-ClassCommandPayloadPropertyInvalidDtmiV2.json) be present if the element is informally co-typed and if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassCommandPayloadPropertyFormallyInvalidDtmiV2.json) be present if the element is not informally co-typed and the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MAY](spec/Allowance-ClassCommandPayloadPropertyNotDtmiNorTermV2.json) be present if the element is informally co-typed and if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [MUST NOT](spec/Requirement-ClassCommandPayloadPropertyFormallyNotDtmiNorTermV2.json) be present if the element is not informally co-typed and the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [MAY](spec/Allowance-ClassCommandPayloadPropertyUndefinedTermV2.json) be present if the element is informally co-typed and if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassCommandPayloadPropertyFormallyUndefinedTermV2.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### Component

Example:

```json
{
  "@context": "dtmi:dtdl:context;2",
  "@id": "dtmi:example:alpha_nu;1",
  "@type": "Interface",
  "contents": {
    "@type": "Component",
    "name": "alpha_lambda",
    "schema": {
      "@id": "dtmi:example:alpha_mu;1",
      "@type": "Interface"
    }
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassComponentRequiredPropertiesV2.json):

* @type
  * Value [MUST](spec/Requirement-ClassComponentTypeStringOrArrayV2.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassComponentTypeIncludesMaterialV2.json) include either string "Component" or string "dtmi:dtdl:class:Component;2".
  * [SHOULD NOT](spec/Recommendation-ClassComponentTypeIncludesTermAndDtmiV2.json) include both "Component" and "dtmi:dtdl:class:Component;2".
  * [SHOULD NOT](spec/Recommendation-ClassComponentTypeDuplicatesMaterialV2.json) include more than one instance of either "Component" or "dtmi:dtdl:class:Component;2".
  * String "Component" is [RECOMMENDED](spec/Recommendation-ClassComponentTypePreferTermToDtmiV2.json) over string "dtmi:dtdl:class:Component;2".
  * [SHALL NOT](spec/Completion-ClassComponentTypeIncludesIrrelevantDtmiOrTermV2.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "Component" or "dtmi:dtdl:class:Component;2", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassComponentTypeIncludesInvalidDtmiV2.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MAY](spec/Allowance-ClassComponentTypeIncludesNotDtmiNorTermV2.json) include any string that contains ":" but does not start with "dtmi:". If any such string is included, the element is considered to be *informally co-typed*.
  * [MAY](spec/Allowance-ClassComponentTypeIncludesUndefinedTermV2.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If any such string is included, the element is considered to be *informally co-typed*.
* name
  * Value [MUST](spec/Requirement-ClassComponentPropertyNameStringV2.json) be a [representational string](#representational-string) or an array containing exactly one representational string.
  * String value [MUST NOT](spec/Requirement-ClassComponentPropertyNameStringLengthV2.json) be more than 64 characters in length.
  * String value [MUST](spec/Requirement-ClassComponentPropertyNamePatternV2.json) match regular expression `^[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?$`.
  * String value [MUST](spec/Requirement-ClassComponentPropertyNameUniqueAmongInterfaceContentsV2.json) be unique among the included values of "name" members of all elements included or referentially included in the "contents" member of any parent [Interface](#interface) element.
  * Member name [MAY](spec/Allowance-ClassComponentPropertyNameDtmiV2.json) be expressed as "dtmi:dtdl:property:name;2" instead of "name", but "name" is [RECOMMENDED](spec/Recommendation-ClassComponentPropertyNameTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassComponentPropertyNameTermAndDtmiV2.json) be expressed as both "name" and "dtmi:dtdl:property:name;2".
* schema
  * Value [MUST](spec/Requirement-ClassComponentPropertySchemaElementV2.json) be a DTDL element, a dependent reference to DTDL element, or an array containing exactly one DTDL element or dependent reference to a DTDL element.
  * If the value is a dependent reference or an array containing a dependent reference, the model [SHALL](spec/Completion-ClassComponentPropertySchemaDependentReferenceV2.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * The included or referentially included DTDL element [MUST](spec/Requirement-ClassComponentPropertySchemaTypeConformanceV2.json) conform to the definition of DTDL element [Interface](#interface).
  * Considered with other DTDL elements, value is subject to any relevant restrictions in [Limits and exclusions](#limits-and-exclusions).
  * Member name [MAY](spec/Allowance-ClassComponentPropertySchemaDtmiV2.json) be expressed as "dtmi:dtdl:property:schema;2" instead of "schema", but "schema" is [RECOMMENDED](spec/Recommendation-ClassComponentPropertySchemaTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassComponentPropertySchemaTermAndDtmiV2.json) be expressed as both "schema" and "dtmi:dtdl:property:schema;2".

The following members are [OPTIONAL](spec/Allowance-ClassComponentOptionalPropertiesV2.json):

* @context
  * [MUST](spec/Requirement-ClassComponentContextConformsV2.json) conform to the specified [context](#context) rules.
* @id
  * Value [MUST](spec/Requirement-ClassComponentIdIsDtmiV2.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassComponentIdNotArrayV2.json) be an array.
  * Value [MUST](spec/Requirement-ClassComponentIdDuplicateV2.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassComponentPropertyCommentStringV2.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassComponentPropertyCommentStringLengthV2.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassComponentPropertyCommentDtmiV2.json) be expressed as "dtmi:dtdl:property:comment;2" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassComponentPropertyCommentTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassComponentPropertyCommentTermAndDtmiV2.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;2".
* description
  * Value [MUST](spec/Requirement-ClassComponentPropertyDescriptionLangStringV2.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassComponentPropertyDescriptionStringLengthV2.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassComponentPropertyDescriptionDtmiV2.json) be expressed as "dtmi:dtdl:property:description;2" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassComponentPropertyDescriptionTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassComponentPropertyDescriptionTermAndDtmiV2.json) be expressed as both "description" and "dtmi:dtdl:property:description;2".
* displayName
  * Value [MUST](spec/Requirement-ClassComponentPropertyDisplayNameLangStringV2.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassComponentPropertyDisplayNameStringLengthV2.json) be more than 64 characters in length.
  * Member name [MAY](spec/Allowance-ClassComponentPropertyDisplayNameDtmiV2.json) be expressed as "dtmi:dtdl:property:displayName;2" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassComponentPropertyDisplayNameTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassComponentPropertyDisplayNameTermAndDtmiV2.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;2".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* A member named "@graph" [MUST NOT](spec/Requirement-ClassComponentGraphKeywordV2.json) be present.
* Members with names starting with "@" other than "@context", "@id", and "@type" [SHOULD NOT](spec/Recommendation-ClassComponentInvalidKeywordsV2.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [MAY](spec/Allowance-ClassComponentPropertyIrrelevantDtmiOrTermV2.json) be present if the element is informally co-typed and if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table.
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassComponentPropertyFormallyIrrelevantDtmiOrTermV2.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "name", "schema", "dtmi:dtdl:property:comment;2", "dtmi:dtdl:property:description;2", "dtmi:dtdl:property:displayName;2", "dtmi:dtdl:property:name;2", "dtmi:dtdl:property:schema;2".
* A member [MAY](spec/Allowance-ClassComponentPropertyInvalidDtmiV2.json) be present if the element is informally co-typed and if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassComponentPropertyFormallyInvalidDtmiV2.json) be present if the element is not informally co-typed and the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MAY](spec/Allowance-ClassComponentPropertyNotDtmiNorTermV2.json) be present if the element is informally co-typed and if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [MUST NOT](spec/Requirement-ClassComponentPropertyFormallyNotDtmiNorTermV2.json) be present if the element is not informally co-typed and the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [MAY](spec/Allowance-ClassComponentPropertyUndefinedTermV2.json) be present if the element is informally co-typed and if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassComponentPropertyFormallyUndefinedTermV2.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### Enum

Example:

```json
{
  "@context": "dtmi:dtdl:context;2",
  "@id": "dtmi:example:alpha_sigma;1",
  "@type": "Interface",
  "schemas": {
    "@id": "dtmi:example:alpha_pi;1",
    "@type": "Enum",
    "enumValues": [
      {
        "enumValue": 2,
        "name": "alpha_rho"
      }
    ],
    "valueSchema": "integer"
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassEnumRequiredPropertiesV2.json):

* @type
  * Value [MUST](spec/Requirement-ClassEnumTypeStringOrArrayV2.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassEnumTypeIncludesMaterialV2.json) include either string "Enum" or string "dtmi:dtdl:class:Enum;2".
  * [SHOULD NOT](spec/Recommendation-ClassEnumTypeIncludesTermAndDtmiV2.json) include both "Enum" and "dtmi:dtdl:class:Enum;2".
  * [SHOULD NOT](spec/Recommendation-ClassEnumTypeDuplicatesMaterialV2.json) include more than one instance of either "Enum" or "dtmi:dtdl:class:Enum;2".
  * String "Enum" is [RECOMMENDED](spec/Recommendation-ClassEnumTypePreferTermToDtmiV2.json) over string "dtmi:dtdl:class:Enum;2".
  * [SHALL NOT](spec/Completion-ClassEnumTypeIncludesIrrelevantDtmiOrTermV2.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "Enum" or "dtmi:dtdl:class:Enum;2", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassEnumTypeIncludesInvalidDtmiV2.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MAY](spec/Allowance-ClassEnumTypeIncludesNotDtmiNorTermV2.json) include any string that contains ":" but does not start with "dtmi:". If any such string is included, the element is considered to be *informally co-typed*.
  * [MAY](spec/Allowance-ClassEnumTypeIncludesUndefinedTermV2.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If any such string is included, the element is considered to be *informally co-typed*.
* enumValues
  * Value [MUST](spec/Requirement-ClassEnumPropertyEnumValuesElementV2.json) be a DTDL element, a dependent reference to DTDL element, or an array of DTDL elements and dependent references to DTDL elements.
  * For each included dependent reference, the model [SHALL](spec/Completion-ClassEnumPropertyEnumValuesDependentReferenceV2.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * Each included or referentially included DTDL element [MUST](spec/Requirement-ClassEnumPropertyEnumValuesTypeConformanceV2.json) conform to the definition of DTDL element [EnumValue](#enumvalue).
  * [MUST](spec/Requirement-ClassEnumPropertyEnumValuesMinCountV2.json) include or referentially include at least one DTDL element.
  * [MUST NOT](spec/Requirement-ClassEnumPropertyEnumValuesMaxCountV2.json) include or referentially include more than 100 DTDL elements.
  * Member name [MAY](spec/Allowance-ClassEnumPropertyEnumValuesDtmiV2.json) be expressed as "dtmi:dtdl:property:enumValues;2" instead of "enumValues", but "enumValues" is [RECOMMENDED](spec/Recommendation-ClassEnumPropertyEnumValuesTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassEnumPropertyEnumValuesTermAndDtmiV2.json) be expressed as both "enumValues" and "dtmi:dtdl:property:enumValues;2".
* valueSchema
  * Value [MUST](spec/Requirement-ClassEnumPropertyValueSchemaSpecificValuesV2.json) be "integer", "string", "dtmi:dtdl:instance:Schema:integer;2", "dtmi:dtdl:instance:Schema:string;2", or an array containing exactly one of these string values.
  * Value "integer" is [RECOMMENDED](spec/Recommendation-ClassEnumPropertyValueSchemaValueIntegerPreferToDtmiV2.json) over value dtmi:dtdl:instance:Schema:integer;2.
  * Value "string" is [RECOMMENDED](spec/Recommendation-ClassEnumPropertyValueSchemaValueStringPreferToDtmiV2.json) over value dtmi:dtdl:instance:Schema:string;2.
  * Member name [MAY](spec/Allowance-ClassEnumPropertyValueSchemaDtmiV2.json) be expressed as "dtmi:dtdl:property:valueSchema;2" instead of "valueSchema", but "valueSchema" is [RECOMMENDED](spec/Recommendation-ClassEnumPropertyValueSchemaTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassEnumPropertyValueSchemaTermAndDtmiV2.json) be expressed as both "valueSchema" and "dtmi:dtdl:property:valueSchema;2".

The following members are [OPTIONAL](spec/Allowance-ClassEnumOptionalPropertiesV2.json) unless otherwise noted:

* @context
  * [MUST](spec/Requirement-ClassEnumContextConformsV2.json) conform to the specified [context](#context) rules.
* @id
  * [REQUIRED](spec/Requirement-ClassEnumIdRequiredV2.json) when the Enum element is included in Interface member "schemas".
  * Value [MUST](spec/Requirement-ClassEnumIdIsDtmiV2.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassEnumIdNotArrayV2.json) be an array.
  * Value [MUST](spec/Requirement-ClassEnumIdDuplicateV2.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassEnumPropertyCommentStringV2.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassEnumPropertyCommentStringLengthV2.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassEnumPropertyCommentDtmiV2.json) be expressed as "dtmi:dtdl:property:comment;2" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassEnumPropertyCommentTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassEnumPropertyCommentTermAndDtmiV2.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;2".
* description
  * Value [MUST](spec/Requirement-ClassEnumPropertyDescriptionLangStringV2.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassEnumPropertyDescriptionStringLengthV2.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassEnumPropertyDescriptionDtmiV2.json) be expressed as "dtmi:dtdl:property:description;2" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassEnumPropertyDescriptionTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassEnumPropertyDescriptionTermAndDtmiV2.json) be expressed as both "description" and "dtmi:dtdl:property:description;2".
* displayName
  * Value [MUST](spec/Requirement-ClassEnumPropertyDisplayNameLangStringV2.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassEnumPropertyDisplayNameStringLengthV2.json) be more than 64 characters in length.
  * Member name [MAY](spec/Allowance-ClassEnumPropertyDisplayNameDtmiV2.json) be expressed as "dtmi:dtdl:property:displayName;2" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassEnumPropertyDisplayNameTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassEnumPropertyDisplayNameTermAndDtmiV2.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;2".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* A member named "@graph" [MUST NOT](spec/Requirement-ClassEnumGraphKeywordV2.json) be present.
* Members with names starting with "@" other than "@context", "@id", and "@type" [SHOULD NOT](spec/Recommendation-ClassEnumInvalidKeywordsV2.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [MAY](spec/Allowance-ClassEnumPropertyIrrelevantDtmiOrTermV2.json) be present if the element is informally co-typed and if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table.
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassEnumPropertyFormallyIrrelevantDtmiOrTermV2.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "enumValues", "valueSchema", "dtmi:dtdl:property:comment;2", "dtmi:dtdl:property:description;2", "dtmi:dtdl:property:displayName;2", "dtmi:dtdl:property:enumValues;2", "dtmi:dtdl:property:valueSchema;2".
* A member [MAY](spec/Allowance-ClassEnumPropertyInvalidDtmiV2.json) be present if the element is informally co-typed and if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassEnumPropertyFormallyInvalidDtmiV2.json) be present if the element is not informally co-typed and the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MAY](spec/Allowance-ClassEnumPropertyNotDtmiNorTermV2.json) be present if the element is informally co-typed and if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [MUST NOT](spec/Requirement-ClassEnumPropertyFormallyNotDtmiNorTermV2.json) be present if the element is not informally co-typed and the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [MAY](spec/Allowance-ClassEnumPropertyUndefinedTermV2.json) be present if the element is informally co-typed and if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassEnumPropertyFormallyUndefinedTermV2.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### EnumValue

Example:

```json
{
  "@context": "dtmi:dtdl:context;2",
  "@id": "dtmi:example:alpha_chi;1",
  "@type": "Interface",
  "schemas": {
    "@id": "dtmi:example:alpha_phi;1",
    "@type": "Enum",
    "valueSchema": "integer",
    "enumValues": {
      "enumValue": 4,
      "name": "alpha_upsilon"
    }
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassEnumValueRequiredPropertiesV2.json):

* enumValue
  * Value [MUST](spec/Requirement-ClassEnumValuePropertyEnumValueIntegerV2.json) be a [representational integer](#representational-integer) or an array containing exactly one representational integer if any parent [Enum](#enum) element has a "valueSchema" member that includes "integer" or "dtmi:dtdl:instance:Schema:integer;2".
  * Value [MUST](spec/Requirement-ClassEnumValuePropertyEnumValueStringV2.json) be a [representational string](#representational-string) or an array containing exactly one representational string if any parent [Enum](#enum) element has a "valueSchema" member that includes "string" or "dtmi:dtdl:instance:Schema:string;2".
  * Literal value [MUST](spec/Requirement-ClassEnumValuePropertyEnumValueUniqueAmongEnumEnumValuesV2.json) be unique among the included values of "enumValue" members of all elements included or referentially included in the "enumValues" member of any parent [Enum](#enum) element.
  * Member name [MAY](spec/Allowance-ClassEnumValuePropertyEnumValueDtmiV2.json) be expressed as "dtmi:dtdl:property:enumValue;2" instead of "enumValue", but "enumValue" is [RECOMMENDED](spec/Recommendation-ClassEnumValuePropertyEnumValueTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassEnumValuePropertyEnumValueTermAndDtmiV2.json) be expressed as both "enumValue" and "dtmi:dtdl:property:enumValue;2".
* name
  * Value [MUST](spec/Requirement-ClassEnumValuePropertyNameStringV2.json) be a [representational string](#representational-string) or an array containing exactly one representational string.
  * String value [MUST NOT](spec/Requirement-ClassEnumValuePropertyNameStringLengthV2.json) be more than 64 characters in length.
  * String value [MUST](spec/Requirement-ClassEnumValuePropertyNamePatternV2.json) match regular expression `^[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?$`.
  * String value [MUST](spec/Requirement-ClassEnumValuePropertyNameUniqueAmongEnumEnumValuesV2.json) be unique among the included values of "name" members of all elements included or referentially included in the "enumValues" member of any parent [Enum](#enum) element.
  * Member name [MAY](spec/Allowance-ClassEnumValuePropertyNameDtmiV2.json) be expressed as "dtmi:dtdl:property:name;2" instead of "name", but "name" is [RECOMMENDED](spec/Recommendation-ClassEnumValuePropertyNameTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassEnumValuePropertyNameTermAndDtmiV2.json) be expressed as both "name" and "dtmi:dtdl:property:name;2".

The following members are [OPTIONAL](spec/Allowance-ClassEnumValueOptionalPropertiesV2.json):

* @context
  * [MUST](spec/Requirement-ClassEnumValueContextConformsV2.json) conform to the specified [context](#context) rules.
* @type
  * Value [MUST](spec/Requirement-ClassEnumValueTypeStringOrArrayV2.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassEnumValueTypeIncludesMaterialV2.json) include either string "EnumValue" or string "dtmi:dtdl:class:EnumValue;2".
  * [SHOULD NOT](spec/Recommendation-ClassEnumValueTypeIncludesTermAndDtmiV2.json) include both "EnumValue" and "dtmi:dtdl:class:EnumValue;2".
  * [SHOULD NOT](spec/Recommendation-ClassEnumValueTypeDuplicatesMaterialV2.json) include more than one instance of either "EnumValue" or "dtmi:dtdl:class:EnumValue;2".
  * String "EnumValue" is [RECOMMENDED](spec/Recommendation-ClassEnumValueTypePreferTermToDtmiV2.json) over string "dtmi:dtdl:class:EnumValue;2".
  * [SHALL NOT](spec/Completion-ClassEnumValueTypeIncludesIrrelevantDtmiOrTermV2.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "EnumValue" or "dtmi:dtdl:class:EnumValue;2", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassEnumValueTypeIncludesInvalidDtmiV2.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MAY](spec/Allowance-ClassEnumValueTypeIncludesNotDtmiNorTermV2.json) include any string that contains ":" but does not start with "dtmi:". If any such string is included, the element is considered to be *informally co-typed*.
  * [MAY](spec/Allowance-ClassEnumValueTypeIncludesUndefinedTermV2.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If any such string is included, the element is considered to be *informally co-typed*.
* @id
  * Value [MUST](spec/Requirement-ClassEnumValueIdIsDtmiV2.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassEnumValueIdNotArrayV2.json) be an array.
  * Value [MUST](spec/Requirement-ClassEnumValueIdDuplicateV2.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassEnumValuePropertyCommentStringV2.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassEnumValuePropertyCommentStringLengthV2.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassEnumValuePropertyCommentDtmiV2.json) be expressed as "dtmi:dtdl:property:comment;2" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassEnumValuePropertyCommentTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassEnumValuePropertyCommentTermAndDtmiV2.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;2".
* description
  * Value [MUST](spec/Requirement-ClassEnumValuePropertyDescriptionLangStringV2.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassEnumValuePropertyDescriptionStringLengthV2.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassEnumValuePropertyDescriptionDtmiV2.json) be expressed as "dtmi:dtdl:property:description;2" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassEnumValuePropertyDescriptionTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassEnumValuePropertyDescriptionTermAndDtmiV2.json) be expressed as both "description" and "dtmi:dtdl:property:description;2".
* displayName
  * Value [MUST](spec/Requirement-ClassEnumValuePropertyDisplayNameLangStringV2.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassEnumValuePropertyDisplayNameStringLengthV2.json) be more than 64 characters in length.
  * Member name [MAY](spec/Allowance-ClassEnumValuePropertyDisplayNameDtmiV2.json) be expressed as "dtmi:dtdl:property:displayName;2" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassEnumValuePropertyDisplayNameTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassEnumValuePropertyDisplayNameTermAndDtmiV2.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;2".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* A member named "@graph" [MUST NOT](spec/Requirement-ClassEnumValueGraphKeywordV2.json) be present.
* Members with names starting with "@" other than "@context", "@id", and "@type" [SHOULD NOT](spec/Recommendation-ClassEnumValueInvalidKeywordsV2.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [MAY](spec/Allowance-ClassEnumValuePropertyIrrelevantDtmiOrTermV2.json) be present if the element is informally co-typed and if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table.
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassEnumValuePropertyFormallyIrrelevantDtmiOrTermV2.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "enumValue", "name", "dtmi:dtdl:property:comment;2", "dtmi:dtdl:property:description;2", "dtmi:dtdl:property:displayName;2", "dtmi:dtdl:property:enumValue;2", "dtmi:dtdl:property:name;2".
* A member [MAY](spec/Allowance-ClassEnumValuePropertyInvalidDtmiV2.json) be present if the element is informally co-typed and if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassEnumValuePropertyFormallyInvalidDtmiV2.json) be present if the element is not informally co-typed and the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MAY](spec/Allowance-ClassEnumValuePropertyNotDtmiNorTermV2.json) be present if the element is informally co-typed and if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [MUST NOT](spec/Requirement-ClassEnumValuePropertyFormallyNotDtmiNorTermV2.json) be present if the element is not informally co-typed and the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [MAY](spec/Allowance-ClassEnumValuePropertyUndefinedTermV2.json) be present if the element is informally co-typed and if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassEnumValuePropertyFormallyUndefinedTermV2.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### Field

Example:

```json
{
  "@context": "dtmi:dtdl:context;2",
  "@id": "dtmi:example:alpha_fuddle;1",
  "@type": "Interface",
  "schemas": {
    "@id": "dtmi:example:alpha_humpf;1",
    "@type": "Object",
    "fields": {
      "name": "alpha_um",
      "schema": "dateTime"
    }
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassFieldRequiredPropertiesV2.json):

* name
  * Value [MUST](spec/Requirement-ClassFieldPropertyNameStringV2.json) be a [representational string](#representational-string) or an array containing exactly one representational string.
  * String value [MUST NOT](spec/Requirement-ClassFieldPropertyNameStringLengthV2.json) be more than 64 characters in length.
  * String value [MUST](spec/Requirement-ClassFieldPropertyNamePatternV2.json) match regular expression `^[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?$`.
  * String value [MUST](spec/Requirement-ClassFieldPropertyNameUniqueAmongObjectFieldsV2.json) be unique among the included values of "name" members of all elements included or referentially included in the "fields" member of any parent [Object](#object) element.
  * Member name [MAY](spec/Allowance-ClassFieldPropertyNameDtmiV2.json) be expressed as "dtmi:dtdl:property:name;2" instead of "name", but "name" is [RECOMMENDED](spec/Recommendation-ClassFieldPropertyNameTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassFieldPropertyNameTermAndDtmiV2.json) be expressed as both "name" and "dtmi:dtdl:property:name;2".
* schema
  * Value [MUST](spec/Requirement-ClassFieldPropertySchemaElementV2.json) be a DTDL element, a dependent reference to a DTDL element, a string from one of the rows in a [Standard schemas](#standard-schemas) table, a string defined by an extension referenced in the active context, or an array containing exactly one DTDL element, dependent reference to a DTDL element, string from one of the rows in a Standard schemas table, or string defined by an extension referenced in the active context.
  * If the value is a dependent reference or an array containing a dependent reference, the model [SHALL](spec/Completion-ClassFieldPropertySchemaDependentReferenceV2.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * If present, an included or referentially included DTDL element [MUST](spec/Requirement-ClassFieldPropertySchemaTypeConformanceV2.json) conform to the definition of DTDL element [Array](#array) or [Enum](#enum) or [Map](#map) or [Object](#object).
  * If a string from one of the rows in a Standard schemas table is included, a string from column "Term" is [RECOMMENDED](spec/Recommendation-ClassFieldPropertySchemaPreferTermToDtmiV2.json) over a string from column "DTMI".
  * Considered with other DTDL elements, value is subject to any relevant restrictions in [Limits and exclusions](#limits-and-exclusions).
  * Member name [MAY](spec/Allowance-ClassFieldPropertySchemaDtmiV2.json) be expressed as "dtmi:dtdl:property:schema;2" instead of "schema", but "schema" is [RECOMMENDED](spec/Recommendation-ClassFieldPropertySchemaTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassFieldPropertySchemaTermAndDtmiV2.json) be expressed as both "schema" and "dtmi:dtdl:property:schema;2".

The following members are [OPTIONAL](spec/Allowance-ClassFieldOptionalPropertiesV2.json):

* @context
  * [MUST](spec/Requirement-ClassFieldContextConformsV2.json) conform to the specified [context](#context) rules.
* @type
  * Value [MUST](spec/Requirement-ClassFieldTypeStringOrArrayV2.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassFieldTypeIncludesMaterialV2.json) include either string "Field" or string "dtmi:dtdl:class:Field;2".
  * [SHOULD NOT](spec/Recommendation-ClassFieldTypeIncludesTermAndDtmiV2.json) include both "Field" and "dtmi:dtdl:class:Field;2".
  * [SHOULD NOT](spec/Recommendation-ClassFieldTypeDuplicatesMaterialV2.json) include more than one instance of either "Field" or "dtmi:dtdl:class:Field;2".
  * String "Field" is [RECOMMENDED](spec/Recommendation-ClassFieldTypePreferTermToDtmiV2.json) over string "dtmi:dtdl:class:Field;2".
  * [SHALL NOT](spec/Completion-ClassFieldTypeIncludesIrrelevantDtmiOrTermV2.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "Field" or "dtmi:dtdl:class:Field;2", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassFieldTypeIncludesInvalidDtmiV2.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MAY](spec/Allowance-ClassFieldTypeIncludesNotDtmiNorTermV2.json) include any string that contains ":" but does not start with "dtmi:". If any such string is included, the element is considered to be *informally co-typed*.
  * [MAY](spec/Allowance-ClassFieldTypeIncludesUndefinedTermV2.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If any such string is included, the element is considered to be *informally co-typed*.
* @id
  * Value [MUST](spec/Requirement-ClassFieldIdIsDtmiV2.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassFieldIdNotArrayV2.json) be an array.
  * Value [MUST](spec/Requirement-ClassFieldIdDuplicateV2.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassFieldPropertyCommentStringV2.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassFieldPropertyCommentStringLengthV2.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassFieldPropertyCommentDtmiV2.json) be expressed as "dtmi:dtdl:property:comment;2" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassFieldPropertyCommentTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassFieldPropertyCommentTermAndDtmiV2.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;2".
* description
  * Value [MUST](spec/Requirement-ClassFieldPropertyDescriptionLangStringV2.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassFieldPropertyDescriptionStringLengthV2.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassFieldPropertyDescriptionDtmiV2.json) be expressed as "dtmi:dtdl:property:description;2" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassFieldPropertyDescriptionTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassFieldPropertyDescriptionTermAndDtmiV2.json) be expressed as both "description" and "dtmi:dtdl:property:description;2".
* displayName
  * Value [MUST](spec/Requirement-ClassFieldPropertyDisplayNameLangStringV2.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassFieldPropertyDisplayNameStringLengthV2.json) be more than 64 characters in length.
  * Member name [MAY](spec/Allowance-ClassFieldPropertyDisplayNameDtmiV2.json) be expressed as "dtmi:dtdl:property:displayName;2" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassFieldPropertyDisplayNameTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassFieldPropertyDisplayNameTermAndDtmiV2.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;2".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* A member named "@graph" [MUST NOT](spec/Requirement-ClassFieldGraphKeywordV2.json) be present.
* Members with names starting with "@" other than "@context", "@id", and "@type" [SHOULD NOT](spec/Recommendation-ClassFieldInvalidKeywordsV2.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [MAY](spec/Allowance-ClassFieldPropertyIrrelevantDtmiOrTermV2.json) be present if the element is informally co-typed and if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table.
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassFieldPropertyFormallyIrrelevantDtmiOrTermV2.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "name", "schema", "dtmi:dtdl:property:comment;2", "dtmi:dtdl:property:description;2", "dtmi:dtdl:property:displayName;2", "dtmi:dtdl:property:name;2", "dtmi:dtdl:property:schema;2".
* A member [MAY](spec/Allowance-ClassFieldPropertyInvalidDtmiV2.json) be present if the element is informally co-typed and if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassFieldPropertyFormallyInvalidDtmiV2.json) be present if the element is not informally co-typed and the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MAY](spec/Allowance-ClassFieldPropertyNotDtmiNorTermV2.json) be present if the element is informally co-typed and if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [MUST NOT](spec/Requirement-ClassFieldPropertyFormallyNotDtmiNorTermV2.json) be present if the element is not informally co-typed and the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [MAY](spec/Allowance-ClassFieldPropertyUndefinedTermV2.json) be present if the element is informally co-typed and if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassFieldPropertyFormallyUndefinedTermV2.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### Interface

Example:

```json
{
  "@context": "dtmi:dtdl:context;2",
  "@id": "dtmi:example:alpha_snee;1",
  "@type": "Interface"
}
```

The following members are [REQUIRED](spec/Requirement-ClassInterfaceRequiredPropertiesV2.json):

* @type
  * Value [MUST](spec/Requirement-ClassInterfaceTypeStringOrArrayV2.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassInterfaceTypeIncludesMaterialV2.json) include either string "Interface" or string "dtmi:dtdl:class:Interface;2".
  * [SHOULD NOT](spec/Recommendation-ClassInterfaceTypeIncludesTermAndDtmiV2.json) include both "Interface" and "dtmi:dtdl:class:Interface;2".
  * [SHOULD NOT](spec/Recommendation-ClassInterfaceTypeDuplicatesMaterialV2.json) include more than one instance of either "Interface" or "dtmi:dtdl:class:Interface;2".
  * String "Interface" is [RECOMMENDED](spec/Recommendation-ClassInterfaceTypePreferTermToDtmiV2.json) over string "dtmi:dtdl:class:Interface;2".
  * [SHALL NOT](spec/Completion-ClassInterfaceTypeIncludesIrrelevantDtmiOrTermV2.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "Interface" or "dtmi:dtdl:class:Interface;2", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassInterfaceTypeIncludesInvalidDtmiV2.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MAY](spec/Allowance-ClassInterfaceTypeIncludesNotDtmiNorTermV2.json) include any string that contains ":" but does not start with "dtmi:". If any such string is included, the element is considered to be *informally co-typed*.
  * [MAY](spec/Allowance-ClassInterfaceTypeIncludesUndefinedTermV2.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If any such string is included, the element is considered to be *informally co-typed*.
* @id
  * Value [MUST](spec/Requirement-ClassInterfaceIdIsDtmiV2.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassInterfaceIdNotArrayV2.json) be an array.
  * Value [MUST](spec/Requirement-ClassInterfaceIdDuplicateV2.json) be unique among the values of all "@id" members of all elements in the model.
  * Length of value string [MUST NOT](spec/Requirement-ClassInterfaceIdLongV2.json) exceed 128 characters.

The following members are [OPTIONAL](spec/Allowance-ClassInterfaceOptionalPropertiesV2.json) unless otherwise noted:

* @context
  * [REQUIRED](spec/Requirement-ClassInterfaceContextAtTopLevelV2.json) when the Interface element is a top-level element.
  * [MUST](spec/Requirement-ClassInterfaceContextDtdlTopLevelV2.json) include value "dtmi:dtdl:context;2" when the Interface element is a top-level element.
  * [MUST](spec/Requirement-ClassInterfaceContextConformsV2.json) conform to the specified [context](#context) rules.
* comment
  * Value [MUST](spec/Requirement-ClassInterfacePropertyCommentStringV2.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassInterfacePropertyCommentStringLengthV2.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassInterfacePropertyCommentDtmiV2.json) be expressed as "dtmi:dtdl:property:comment;2" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassInterfacePropertyCommentTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassInterfacePropertyCommentTermAndDtmiV2.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;2".
* contents
  * Value [MUST](spec/Requirement-ClassInterfacePropertyContentsElementV2.json) be a DTDL element, a dependent reference to DTDL element, or an array of DTDL elements and dependent references to DTDL elements.
  * For each included dependent reference, the model [SHALL](spec/Completion-ClassInterfacePropertyContentsDependentReferenceV2.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * Each included or referentially included DTDL element [MUST](spec/Requirement-ClassInterfacePropertyContentsTypeConformanceV2.json) conform to the definition of DTDL element [Command](#command) or [Component](#component) or [Property](#property) or [Relationship](#relationship) or [Telemetry](#telemetry).
  * [MUST NOT](spec/Requirement-ClassInterfacePropertyContentsMaxCountV2.json) include or referentially include more than 300 DTDL elements.
  * Member name [MAY](spec/Allowance-ClassInterfacePropertyContentsDtmiV2.json) be expressed as "dtmi:dtdl:property:contents;2" instead of "contents", but "contents" is [RECOMMENDED](spec/Recommendation-ClassInterfacePropertyContentsTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassInterfacePropertyContentsTermAndDtmiV2.json) be expressed as both "contents" and "dtmi:dtdl:property:contents;2".
* description
  * Value [MUST](spec/Requirement-ClassInterfacePropertyDescriptionLangStringV2.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassInterfacePropertyDescriptionStringLengthV2.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassInterfacePropertyDescriptionDtmiV2.json) be expressed as "dtmi:dtdl:property:description;2" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassInterfacePropertyDescriptionTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassInterfacePropertyDescriptionTermAndDtmiV2.json) be expressed as both "description" and "dtmi:dtdl:property:description;2".
* displayName
  * Value [MUST](spec/Requirement-ClassInterfacePropertyDisplayNameLangStringV2.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassInterfacePropertyDisplayNameStringLengthV2.json) be more than 64 characters in length.
  * Member name [MAY](spec/Allowance-ClassInterfacePropertyDisplayNameDtmiV2.json) be expressed as "dtmi:dtdl:property:displayName;2" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassInterfacePropertyDisplayNameTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassInterfacePropertyDisplayNameTermAndDtmiV2.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;2".
* extends
  * Value [MUST](spec/Requirement-ClassInterfacePropertyExtendsElementV2.json) be a DTDL element, a dependent reference to DTDL element, or an array of DTDL elements and dependent references to DTDL elements.
  * For each included dependent reference, the model [SHALL](spec/Completion-ClassInterfacePropertyExtendsDependentReferenceV2.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * Each included or referentially included DTDL element [MUST](spec/Requirement-ClassInterfacePropertyExtendsTypeConformanceV2.json) conform to the definition of DTDL element [Interface](#interface).
  * [MUST NOT](spec/Requirement-ClassInterfacePropertyExtendsMaxCountV2.json) include or referentially include more than 2 DTDL elements.
  * Considered with other DTDL elements, value is subject to any relevant restrictions in [Limits and exclusions](#limits-and-exclusions).
  * Member name [MAY](spec/Allowance-ClassInterfacePropertyExtendsDtmiV2.json) be expressed as "dtmi:dtdl:property:extends;2" instead of "extends", but "extends" is [RECOMMENDED](spec/Recommendation-ClassInterfacePropertyExtendsTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassInterfacePropertyExtendsTermAndDtmiV2.json) be expressed as both "extends" and "dtmi:dtdl:property:extends;2".
* schemas
  * Value [MUST](spec/Requirement-ClassInterfacePropertySchemasElementV2.json) be a DTDL element, a dependent reference to DTDL element, or an array of DTDL elements and dependent references to DTDL elements.
  * For each included dependent reference, the model [SHALL](spec/Completion-ClassInterfacePropertySchemasDependentReferenceV2.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * Each included or referentially included DTDL element [MUST](spec/Requirement-ClassInterfacePropertySchemasTypeConformanceV2.json) conform to the definition of DTDL element [Array](#array) or [Enum](#enum) or [Map](#map) or [Object](#object).
  * Member name [MAY](spec/Allowance-ClassInterfacePropertySchemasDtmiV2.json) be expressed as "dtmi:dtdl:property:schemas;2" instead of "schemas", but "schemas" is [RECOMMENDED](spec/Recommendation-ClassInterfacePropertySchemasTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassInterfacePropertySchemasTermAndDtmiV2.json) be expressed as both "schemas" and "dtmi:dtdl:property:schemas;2".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* A member named "@graph" [MUST NOT](spec/Requirement-ClassInterfaceGraphKeywordV2.json) be present.
* Members with names starting with "@" other than "@context", "@id", and "@type" [SHOULD NOT](spec/Recommendation-ClassInterfaceInvalidKeywordsV2.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [MAY](spec/Allowance-ClassInterfacePropertyIrrelevantDtmiOrTermV2.json) be present if the element is informally co-typed and if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table.
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassInterfacePropertyFormallyIrrelevantDtmiOrTermV2.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "contents", "description", "displayName", "extends", "schemas", "dtmi:dtdl:property:comment;2", "dtmi:dtdl:property:contents;2", "dtmi:dtdl:property:description;2", "dtmi:dtdl:property:displayName;2", "dtmi:dtdl:property:extends;2", "dtmi:dtdl:property:schemas;2".
* A member [MAY](spec/Allowance-ClassInterfacePropertyInvalidDtmiV2.json) be present if the element is informally co-typed and if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassInterfacePropertyFormallyInvalidDtmiV2.json) be present if the element is not informally co-typed and the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MAY](spec/Allowance-ClassInterfacePropertyNotDtmiNorTermV2.json) be present if the element is informally co-typed and if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [MUST NOT](spec/Requirement-ClassInterfacePropertyFormallyNotDtmiNorTermV2.json) be present if the element is not informally co-typed and the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [MAY](spec/Allowance-ClassInterfacePropertyUndefinedTermV2.json) be present if the element is informally co-typed and if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassInterfacePropertyFormallyUndefinedTermV2.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### Map

Example:

```json
{
  "@context": "dtmi:dtdl:context;2",
  "@id": "dtmi:example:alpha_floob;1",
  "@type": "Interface",
  "schemas": {
    "@id": "dtmi:example:alpha_quan;1",
    "@type": "Map",
    "mapKey": {
      "name": "alpha_thnad",
      "schema": "string"
    },
    "mapValue": {
      "name": "alpha_spazz",
      "schema": "double"
    }
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassMapRequiredPropertiesV2.json):

* @type
  * Value [MUST](spec/Requirement-ClassMapTypeStringOrArrayV2.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassMapTypeIncludesMaterialV2.json) include either string "Map" or string "dtmi:dtdl:class:Map;2".
  * [SHOULD NOT](spec/Recommendation-ClassMapTypeIncludesTermAndDtmiV2.json) include both "Map" and "dtmi:dtdl:class:Map;2".
  * [SHOULD NOT](spec/Recommendation-ClassMapTypeDuplicatesMaterialV2.json) include more than one instance of either "Map" or "dtmi:dtdl:class:Map;2".
  * String "Map" is [RECOMMENDED](spec/Recommendation-ClassMapTypePreferTermToDtmiV2.json) over string "dtmi:dtdl:class:Map;2".
  * [SHALL NOT](spec/Completion-ClassMapTypeIncludesIrrelevantDtmiOrTermV2.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "Map" or "dtmi:dtdl:class:Map;2", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassMapTypeIncludesInvalidDtmiV2.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MAY](spec/Allowance-ClassMapTypeIncludesNotDtmiNorTermV2.json) include any string that contains ":" but does not start with "dtmi:". If any such string is included, the element is considered to be *informally co-typed*.
  * [MAY](spec/Allowance-ClassMapTypeIncludesUndefinedTermV2.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If any such string is included, the element is considered to be *informally co-typed*.
* mapKey
  * Value [MUST](spec/Requirement-ClassMapPropertyMapKeyElementV2.json) be a DTDL element, a dependent reference to DTDL element, or an array containing exactly one DTDL element or dependent reference to a DTDL element.
  * If the value is a dependent reference or an array containing a dependent reference, the model [SHALL](spec/Completion-ClassMapPropertyMapKeyDependentReferenceV2.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * The included or referentially included DTDL element [MUST](spec/Requirement-ClassMapPropertyMapKeyTypeConformanceV2.json) conform to the definition of DTDL element [MapKey](#mapkey).
  * Member name [MAY](spec/Allowance-ClassMapPropertyMapKeyDtmiV2.json) be expressed as "dtmi:dtdl:property:mapKey;2" instead of "mapKey", but "mapKey" is [RECOMMENDED](spec/Recommendation-ClassMapPropertyMapKeyTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapPropertyMapKeyTermAndDtmiV2.json) be expressed as both "mapKey" and "dtmi:dtdl:property:mapKey;2".
* mapValue
  * Value [MUST](spec/Requirement-ClassMapPropertyMapValueElementV2.json) be a DTDL element, a dependent reference to DTDL element, or an array containing exactly one DTDL element or dependent reference to a DTDL element.
  * If the value is a dependent reference or an array containing a dependent reference, the model [SHALL](spec/Completion-ClassMapPropertyMapValueDependentReferenceV2.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * The included or referentially included DTDL element [MUST](spec/Requirement-ClassMapPropertyMapValueTypeConformanceV2.json) conform to the definition of DTDL element [MapValue](#mapvalue).
  * Member name [MAY](spec/Allowance-ClassMapPropertyMapValueDtmiV2.json) be expressed as "dtmi:dtdl:property:mapValue;2" instead of "mapValue", but "mapValue" is [RECOMMENDED](spec/Recommendation-ClassMapPropertyMapValueTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapPropertyMapValueTermAndDtmiV2.json) be expressed as both "mapValue" and "dtmi:dtdl:property:mapValue;2".

The following members are [OPTIONAL](spec/Allowance-ClassMapOptionalPropertiesV2.json) unless otherwise noted:

* @context
  * [MUST](spec/Requirement-ClassMapContextConformsV2.json) conform to the specified [context](#context) rules.
* @id
  * [REQUIRED](spec/Requirement-ClassMapIdRequiredV2.json) when the Map element is included in Interface member "schemas".
  * Value [MUST](spec/Requirement-ClassMapIdIsDtmiV2.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassMapIdNotArrayV2.json) be an array.
  * Value [MUST](spec/Requirement-ClassMapIdDuplicateV2.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassMapPropertyCommentStringV2.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassMapPropertyCommentStringLengthV2.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassMapPropertyCommentDtmiV2.json) be expressed as "dtmi:dtdl:property:comment;2" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassMapPropertyCommentTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapPropertyCommentTermAndDtmiV2.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;2".
* description
  * Value [MUST](spec/Requirement-ClassMapPropertyDescriptionLangStringV2.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassMapPropertyDescriptionStringLengthV2.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassMapPropertyDescriptionDtmiV2.json) be expressed as "dtmi:dtdl:property:description;2" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassMapPropertyDescriptionTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapPropertyDescriptionTermAndDtmiV2.json) be expressed as both "description" and "dtmi:dtdl:property:description;2".
* displayName
  * Value [MUST](spec/Requirement-ClassMapPropertyDisplayNameLangStringV2.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassMapPropertyDisplayNameStringLengthV2.json) be more than 64 characters in length.
  * Member name [MAY](spec/Allowance-ClassMapPropertyDisplayNameDtmiV2.json) be expressed as "dtmi:dtdl:property:displayName;2" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassMapPropertyDisplayNameTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapPropertyDisplayNameTermAndDtmiV2.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;2".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* A member named "@graph" [MUST NOT](spec/Requirement-ClassMapGraphKeywordV2.json) be present.
* Members with names starting with "@" other than "@context", "@id", and "@type" [SHOULD NOT](spec/Recommendation-ClassMapInvalidKeywordsV2.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [MAY](spec/Allowance-ClassMapPropertyIrrelevantDtmiOrTermV2.json) be present if the element is informally co-typed and if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table.
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassMapPropertyFormallyIrrelevantDtmiOrTermV2.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "mapKey", "mapValue", "dtmi:dtdl:property:comment;2", "dtmi:dtdl:property:description;2", "dtmi:dtdl:property:displayName;2", "dtmi:dtdl:property:mapKey;2", "dtmi:dtdl:property:mapValue;2".
* A member [MAY](spec/Allowance-ClassMapPropertyInvalidDtmiV2.json) be present if the element is informally co-typed and if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassMapPropertyFormallyInvalidDtmiV2.json) be present if the element is not informally co-typed and the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MAY](spec/Allowance-ClassMapPropertyNotDtmiNorTermV2.json) be present if the element is informally co-typed and if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [MUST NOT](spec/Requirement-ClassMapPropertyFormallyNotDtmiNorTermV2.json) be present if the element is not informally co-typed and the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [MAY](spec/Allowance-ClassMapPropertyUndefinedTermV2.json) be present if the element is informally co-typed and if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassMapPropertyFormallyUndefinedTermV2.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### MapKey

Example:

```json
{
  "@context": "dtmi:dtdl:context;2",
  "@id": "dtmi:example:alpha_itch;1",
  "@type": "Interface",
  "schemas": {
    "@id": "dtmi:example:alpha_jogg;1",
    "@type": "Map",
    "mapValue": {
      "name": "alpha_flunn",
      "schema": "duration"
    },
    "mapKey": {
      "name": "alpha_zatz",
      "schema": "string"
    }
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassMapKeyRequiredPropertiesV2.json):

* name
  * Value [MUST](spec/Requirement-ClassMapKeyPropertyNameStringV2.json) be a [representational string](#representational-string) or an array containing exactly one representational string.
  * String value [MUST NOT](spec/Requirement-ClassMapKeyPropertyNameStringLengthV2.json) be more than 64 characters in length.
  * String value [MUST](spec/Requirement-ClassMapKeyPropertyNamePatternV2.json) match regular expression `^[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?$`.
  * Member name [MAY](spec/Allowance-ClassMapKeyPropertyNameDtmiV2.json) be expressed as "dtmi:dtdl:property:name;2" instead of "name", but "name" is [RECOMMENDED](spec/Recommendation-ClassMapKeyPropertyNameTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapKeyPropertyNameTermAndDtmiV2.json) be expressed as both "name" and "dtmi:dtdl:property:name;2".
* schema
  * Value [MUST](spec/Requirement-ClassMapKeyPropertySchemaSpecificValuesV2.json) be "string", "dtmi:dtdl:instance:Schema:string;2", or an array containing exactly one of these string values.
  * Value "string" is [RECOMMENDED](spec/Recommendation-ClassMapKeyPropertySchemaValueStringPreferToDtmiV2.json) over value dtmi:dtdl:instance:Schema:string;2.
  * Considered with other DTDL elements, value is subject to any relevant restrictions in [Limits and exclusions](#limits-and-exclusions).
  * Member name [MAY](spec/Allowance-ClassMapKeyPropertySchemaDtmiV2.json) be expressed as "dtmi:dtdl:property:schema;2" instead of "schema", but "schema" is [RECOMMENDED](spec/Recommendation-ClassMapKeyPropertySchemaTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapKeyPropertySchemaTermAndDtmiV2.json) be expressed as both "schema" and "dtmi:dtdl:property:schema;2".

The following members are [OPTIONAL](spec/Allowance-ClassMapKeyOptionalPropertiesV2.json):

* @context
  * [MUST](spec/Requirement-ClassMapKeyContextConformsV2.json) conform to the specified [context](#context) rules.
* @type
  * Value [MUST](spec/Requirement-ClassMapKeyTypeStringOrArrayV2.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassMapKeyTypeIncludesMaterialV2.json) include either string "MapKey" or string "dtmi:dtdl:class:MapKey;2".
  * [SHOULD NOT](spec/Recommendation-ClassMapKeyTypeIncludesTermAndDtmiV2.json) include both "MapKey" and "dtmi:dtdl:class:MapKey;2".
  * [SHOULD NOT](spec/Recommendation-ClassMapKeyTypeDuplicatesMaterialV2.json) include more than one instance of either "MapKey" or "dtmi:dtdl:class:MapKey;2".
  * String "MapKey" is [RECOMMENDED](spec/Recommendation-ClassMapKeyTypePreferTermToDtmiV2.json) over string "dtmi:dtdl:class:MapKey;2".
  * [SHALL NOT](spec/Completion-ClassMapKeyTypeIncludesIrrelevantDtmiOrTermV2.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "MapKey" or "dtmi:dtdl:class:MapKey;2", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassMapKeyTypeIncludesInvalidDtmiV2.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MAY](spec/Allowance-ClassMapKeyTypeIncludesNotDtmiNorTermV2.json) include any string that contains ":" but does not start with "dtmi:". If any such string is included, the element is considered to be *informally co-typed*.
  * [MAY](spec/Allowance-ClassMapKeyTypeIncludesUndefinedTermV2.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If any such string is included, the element is considered to be *informally co-typed*.
* @id
  * Value [MUST](spec/Requirement-ClassMapKeyIdIsDtmiV2.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassMapKeyIdNotArrayV2.json) be an array.
  * Value [MUST](spec/Requirement-ClassMapKeyIdDuplicateV2.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassMapKeyPropertyCommentStringV2.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassMapKeyPropertyCommentStringLengthV2.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassMapKeyPropertyCommentDtmiV2.json) be expressed as "dtmi:dtdl:property:comment;2" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassMapKeyPropertyCommentTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapKeyPropertyCommentTermAndDtmiV2.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;2".
* description
  * Value [MUST](spec/Requirement-ClassMapKeyPropertyDescriptionLangStringV2.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassMapKeyPropertyDescriptionStringLengthV2.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassMapKeyPropertyDescriptionDtmiV2.json) be expressed as "dtmi:dtdl:property:description;2" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassMapKeyPropertyDescriptionTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapKeyPropertyDescriptionTermAndDtmiV2.json) be expressed as both "description" and "dtmi:dtdl:property:description;2".
* displayName
  * Value [MUST](spec/Requirement-ClassMapKeyPropertyDisplayNameLangStringV2.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassMapKeyPropertyDisplayNameStringLengthV2.json) be more than 64 characters in length.
  * Member name [MAY](spec/Allowance-ClassMapKeyPropertyDisplayNameDtmiV2.json) be expressed as "dtmi:dtdl:property:displayName;2" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassMapKeyPropertyDisplayNameTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapKeyPropertyDisplayNameTermAndDtmiV2.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;2".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* A member named "@graph" [MUST NOT](spec/Requirement-ClassMapKeyGraphKeywordV2.json) be present.
* Members with names starting with "@" other than "@context", "@id", and "@type" [SHOULD NOT](spec/Recommendation-ClassMapKeyInvalidKeywordsV2.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [MAY](spec/Allowance-ClassMapKeyPropertyIrrelevantDtmiOrTermV2.json) be present if the element is informally co-typed and if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table.
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassMapKeyPropertyFormallyIrrelevantDtmiOrTermV2.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "name", "schema", "dtmi:dtdl:property:comment;2", "dtmi:dtdl:property:description;2", "dtmi:dtdl:property:displayName;2", "dtmi:dtdl:property:name;2", "dtmi:dtdl:property:schema;2".
* A member [MAY](spec/Allowance-ClassMapKeyPropertyInvalidDtmiV2.json) be present if the element is informally co-typed and if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassMapKeyPropertyFormallyInvalidDtmiV2.json) be present if the element is not informally co-typed and the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MAY](spec/Allowance-ClassMapKeyPropertyNotDtmiNorTermV2.json) be present if the element is informally co-typed and if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [MUST NOT](spec/Requirement-ClassMapKeyPropertyFormallyNotDtmiNorTermV2.json) be present if the element is not informally co-typed and the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [MAY](spec/Allowance-ClassMapKeyPropertyUndefinedTermV2.json) be present if the element is informally co-typed and if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassMapKeyPropertyFormallyUndefinedTermV2.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### MapValue

Example:

```json
{
  "@context": "dtmi:dtdl:context;2",
  "@id": "dtmi:example:beta_alpha;1",
  "@type": "Interface",
  "schemas": {
    "@id": "dtmi:example:alpha_vroo;1",
    "@type": "Map",
    "mapKey": {
      "name": "alpha_hi",
      "schema": "string"
    },
    "mapValue": {
      "name": "alpha_yekk",
      "schema": "float"
    }
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassMapValueRequiredPropertiesV2.json):

* name
  * Value [MUST](spec/Requirement-ClassMapValuePropertyNameStringV2.json) be a [representational string](#representational-string) or an array containing exactly one representational string.
  * String value [MUST NOT](spec/Requirement-ClassMapValuePropertyNameStringLengthV2.json) be more than 64 characters in length.
  * String value [MUST](spec/Requirement-ClassMapValuePropertyNamePatternV2.json) match regular expression `^[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?$`.
  * Member name [MAY](spec/Allowance-ClassMapValuePropertyNameDtmiV2.json) be expressed as "dtmi:dtdl:property:name;2" instead of "name", but "name" is [RECOMMENDED](spec/Recommendation-ClassMapValuePropertyNameTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapValuePropertyNameTermAndDtmiV2.json) be expressed as both "name" and "dtmi:dtdl:property:name;2".
* schema
  * Value [MUST](spec/Requirement-ClassMapValuePropertySchemaElementV2.json) be a DTDL element, a dependent reference to a DTDL element, a string from one of the rows in a [Standard schemas](#standard-schemas) table, a string defined by an extension referenced in the active context, or an array containing exactly one DTDL element, dependent reference to a DTDL element, string from one of the rows in a Standard schemas table, or string defined by an extension referenced in the active context.
  * If the value is a dependent reference or an array containing a dependent reference, the model [SHALL](spec/Completion-ClassMapValuePropertySchemaDependentReferenceV2.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * If present, an included or referentially included DTDL element [MUST](spec/Requirement-ClassMapValuePropertySchemaTypeConformanceV2.json) conform to the definition of DTDL element [Array](#array) or [Enum](#enum) or [Map](#map) or [Object](#object).
  * If a string from one of the rows in a Standard schemas table is included, a string from column "Term" is [RECOMMENDED](spec/Recommendation-ClassMapValuePropertySchemaPreferTermToDtmiV2.json) over a string from column "DTMI".
  * Considered with other DTDL elements, value is subject to any relevant restrictions in [Limits and exclusions](#limits-and-exclusions).
  * Member name [MAY](spec/Allowance-ClassMapValuePropertySchemaDtmiV2.json) be expressed as "dtmi:dtdl:property:schema;2" instead of "schema", but "schema" is [RECOMMENDED](spec/Recommendation-ClassMapValuePropertySchemaTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapValuePropertySchemaTermAndDtmiV2.json) be expressed as both "schema" and "dtmi:dtdl:property:schema;2".

The following members are [OPTIONAL](spec/Allowance-ClassMapValueOptionalPropertiesV2.json):

* @context
  * [MUST](spec/Requirement-ClassMapValueContextConformsV2.json) conform to the specified [context](#context) rules.
* @type
  * Value [MUST](spec/Requirement-ClassMapValueTypeStringOrArrayV2.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassMapValueTypeIncludesMaterialV2.json) include either string "MapValue" or string "dtmi:dtdl:class:MapValue;2".
  * [SHOULD NOT](spec/Recommendation-ClassMapValueTypeIncludesTermAndDtmiV2.json) include both "MapValue" and "dtmi:dtdl:class:MapValue;2".
  * [SHOULD NOT](spec/Recommendation-ClassMapValueTypeDuplicatesMaterialV2.json) include more than one instance of either "MapValue" or "dtmi:dtdl:class:MapValue;2".
  * String "MapValue" is [RECOMMENDED](spec/Recommendation-ClassMapValueTypePreferTermToDtmiV2.json) over string "dtmi:dtdl:class:MapValue;2".
  * [SHALL NOT](spec/Completion-ClassMapValueTypeIncludesIrrelevantDtmiOrTermV2.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "MapValue" or "dtmi:dtdl:class:MapValue;2", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassMapValueTypeIncludesInvalidDtmiV2.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MAY](spec/Allowance-ClassMapValueTypeIncludesNotDtmiNorTermV2.json) include any string that contains ":" but does not start with "dtmi:". If any such string is included, the element is considered to be *informally co-typed*.
  * [MAY](spec/Allowance-ClassMapValueTypeIncludesUndefinedTermV2.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If any such string is included, the element is considered to be *informally co-typed*.
* @id
  * Value [MUST](spec/Requirement-ClassMapValueIdIsDtmiV2.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassMapValueIdNotArrayV2.json) be an array.
  * Value [MUST](spec/Requirement-ClassMapValueIdDuplicateV2.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassMapValuePropertyCommentStringV2.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassMapValuePropertyCommentStringLengthV2.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassMapValuePropertyCommentDtmiV2.json) be expressed as "dtmi:dtdl:property:comment;2" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassMapValuePropertyCommentTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapValuePropertyCommentTermAndDtmiV2.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;2".
* description
  * Value [MUST](spec/Requirement-ClassMapValuePropertyDescriptionLangStringV2.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassMapValuePropertyDescriptionStringLengthV2.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassMapValuePropertyDescriptionDtmiV2.json) be expressed as "dtmi:dtdl:property:description;2" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassMapValuePropertyDescriptionTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapValuePropertyDescriptionTermAndDtmiV2.json) be expressed as both "description" and "dtmi:dtdl:property:description;2".
* displayName
  * Value [MUST](spec/Requirement-ClassMapValuePropertyDisplayNameLangStringV2.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassMapValuePropertyDisplayNameStringLengthV2.json) be more than 64 characters in length.
  * Member name [MAY](spec/Allowance-ClassMapValuePropertyDisplayNameDtmiV2.json) be expressed as "dtmi:dtdl:property:displayName;2" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassMapValuePropertyDisplayNameTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapValuePropertyDisplayNameTermAndDtmiV2.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;2".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* A member named "@graph" [MUST NOT](spec/Requirement-ClassMapValueGraphKeywordV2.json) be present.
* Members with names starting with "@" other than "@context", "@id", and "@type" [SHOULD NOT](spec/Recommendation-ClassMapValueInvalidKeywordsV2.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [MAY](spec/Allowance-ClassMapValuePropertyIrrelevantDtmiOrTermV2.json) be present if the element is informally co-typed and if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table.
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassMapValuePropertyFormallyIrrelevantDtmiOrTermV2.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "name", "schema", "dtmi:dtdl:property:comment;2", "dtmi:dtdl:property:description;2", "dtmi:dtdl:property:displayName;2", "dtmi:dtdl:property:name;2", "dtmi:dtdl:property:schema;2".
* A member [MAY](spec/Allowance-ClassMapValuePropertyInvalidDtmiV2.json) be present if the element is informally co-typed and if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassMapValuePropertyFormallyInvalidDtmiV2.json) be present if the element is not informally co-typed and the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MAY](spec/Allowance-ClassMapValuePropertyNotDtmiNorTermV2.json) be present if the element is informally co-typed and if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [MUST NOT](spec/Requirement-ClassMapValuePropertyFormallyNotDtmiNorTermV2.json) be present if the element is not informally co-typed and the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [MAY](spec/Allowance-ClassMapValuePropertyUndefinedTermV2.json) be present if the element is informally co-typed and if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassMapValuePropertyFormallyUndefinedTermV2.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### Object

Example:

```json
{
  "@context": "dtmi:dtdl:context;2",
  "@id": "dtmi:example:beta_delta;1",
  "@type": "Interface",
  "schemas": {
    "@id": "dtmi:example:beta_beta;1",
    "@type": "Object",
    "fields": [
      {
        "name": "beta_gamma",
        "schema": "integer"
      }
    ]
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassObjectRequiredPropertiesV2.json):

* @type
  * Value [MUST](spec/Requirement-ClassObjectTypeStringOrArrayV2.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassObjectTypeIncludesMaterialV2.json) include either string "Object" or string "dtmi:dtdl:class:Object;2".
  * [SHOULD NOT](spec/Recommendation-ClassObjectTypeIncludesTermAndDtmiV2.json) include both "Object" and "dtmi:dtdl:class:Object;2".
  * [SHOULD NOT](spec/Recommendation-ClassObjectTypeDuplicatesMaterialV2.json) include more than one instance of either "Object" or "dtmi:dtdl:class:Object;2".
  * String "Object" is [RECOMMENDED](spec/Recommendation-ClassObjectTypePreferTermToDtmiV2.json) over string "dtmi:dtdl:class:Object;2".
  * [SHALL NOT](spec/Completion-ClassObjectTypeIncludesIrrelevantDtmiOrTermV2.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "Object" or "dtmi:dtdl:class:Object;2", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassObjectTypeIncludesInvalidDtmiV2.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MAY](spec/Allowance-ClassObjectTypeIncludesNotDtmiNorTermV2.json) include any string that contains ":" but does not start with "dtmi:". If any such string is included, the element is considered to be *informally co-typed*.
  * [MAY](spec/Allowance-ClassObjectTypeIncludesUndefinedTermV2.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If any such string is included, the element is considered to be *informally co-typed*.
* fields
  * Value [MUST](spec/Requirement-ClassObjectPropertyFieldsElementV2.json) be a DTDL element, a dependent reference to DTDL element, or an array of DTDL elements and dependent references to DTDL elements.
  * For each included dependent reference, the model [SHALL](spec/Completion-ClassObjectPropertyFieldsDependentReferenceV2.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * Each included or referentially included DTDL element [MUST](spec/Requirement-ClassObjectPropertyFieldsTypeConformanceV2.json) conform to the definition of DTDL element [Field](#field).
  * [MUST](spec/Requirement-ClassObjectPropertyFieldsMinCountV2.json) include or referentially include at least one DTDL element.
  * [MUST NOT](spec/Requirement-ClassObjectPropertyFieldsMaxCountV2.json) include or referentially include more than 30 DTDL elements.
  * Member name [MAY](spec/Allowance-ClassObjectPropertyFieldsDtmiV2.json) be expressed as "dtmi:dtdl:property:fields;2" instead of "fields", but "fields" is [RECOMMENDED](spec/Recommendation-ClassObjectPropertyFieldsTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassObjectPropertyFieldsTermAndDtmiV2.json) be expressed as both "fields" and "dtmi:dtdl:property:fields;2".

The following members are [OPTIONAL](spec/Allowance-ClassObjectOptionalPropertiesV2.json) unless otherwise noted:

* @context
  * [MUST](spec/Requirement-ClassObjectContextConformsV2.json) conform to the specified [context](#context) rules.
* @id
  * [REQUIRED](spec/Requirement-ClassObjectIdRequiredV2.json) when the Object element is included in Interface member "schemas".
  * Value [MUST](spec/Requirement-ClassObjectIdIsDtmiV2.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassObjectIdNotArrayV2.json) be an array.
  * Value [MUST](spec/Requirement-ClassObjectIdDuplicateV2.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassObjectPropertyCommentStringV2.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassObjectPropertyCommentStringLengthV2.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassObjectPropertyCommentDtmiV2.json) be expressed as "dtmi:dtdl:property:comment;2" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassObjectPropertyCommentTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassObjectPropertyCommentTermAndDtmiV2.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;2".
* description
  * Value [MUST](spec/Requirement-ClassObjectPropertyDescriptionLangStringV2.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassObjectPropertyDescriptionStringLengthV2.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassObjectPropertyDescriptionDtmiV2.json) be expressed as "dtmi:dtdl:property:description;2" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassObjectPropertyDescriptionTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassObjectPropertyDescriptionTermAndDtmiV2.json) be expressed as both "description" and "dtmi:dtdl:property:description;2".
* displayName
  * Value [MUST](spec/Requirement-ClassObjectPropertyDisplayNameLangStringV2.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassObjectPropertyDisplayNameStringLengthV2.json) be more than 64 characters in length.
  * Member name [MAY](spec/Allowance-ClassObjectPropertyDisplayNameDtmiV2.json) be expressed as "dtmi:dtdl:property:displayName;2" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassObjectPropertyDisplayNameTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassObjectPropertyDisplayNameTermAndDtmiV2.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;2".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* A member named "@graph" [MUST NOT](spec/Requirement-ClassObjectGraphKeywordV2.json) be present.
* Members with names starting with "@" other than "@context", "@id", and "@type" [SHOULD NOT](spec/Recommendation-ClassObjectInvalidKeywordsV2.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [MAY](spec/Allowance-ClassObjectPropertyIrrelevantDtmiOrTermV2.json) be present if the element is informally co-typed and if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table.
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassObjectPropertyFormallyIrrelevantDtmiOrTermV2.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "fields", "dtmi:dtdl:property:comment;2", "dtmi:dtdl:property:description;2", "dtmi:dtdl:property:displayName;2", "dtmi:dtdl:property:fields;2".
* A member [MAY](spec/Allowance-ClassObjectPropertyInvalidDtmiV2.json) be present if the element is informally co-typed and if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassObjectPropertyFormallyInvalidDtmiV2.json) be present if the element is not informally co-typed and the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MAY](spec/Allowance-ClassObjectPropertyNotDtmiNorTermV2.json) be present if the element is informally co-typed and if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [MUST NOT](spec/Requirement-ClassObjectPropertyFormallyNotDtmiNorTermV2.json) be present if the element is not informally co-typed and the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [MAY](spec/Allowance-ClassObjectPropertyUndefinedTermV2.json) be present if the element is informally co-typed and if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassObjectPropertyFormallyUndefinedTermV2.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### Property

Example:

```json
{
  "@context": "dtmi:dtdl:context;2",
  "@id": "dtmi:example:beta_zeta;1",
  "@type": "Interface",
  "contents": {
    "@type": "Property",
    "name": "beta_epsilon",
    "schema": "long"
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassPropertyRequiredPropertiesV2.json):

* @type
  * Value [MUST](spec/Requirement-ClassPropertyTypeStringOrArrayV2.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassPropertyTypeIncludesMaterialV2.json) include either string "Property" or string "dtmi:dtdl:class:Property;2".
  * [SHOULD NOT](spec/Recommendation-ClassPropertyTypeIncludesTermAndDtmiV2.json) include both "Property" and "dtmi:dtdl:class:Property;2".
  * [SHOULD NOT](spec/Recommendation-ClassPropertyTypeDuplicatesMaterialV2.json) include more than one instance of either "Property" or "dtmi:dtdl:class:Property;2".
  * String "Property" is [RECOMMENDED](spec/Recommendation-ClassPropertyTypePreferTermToDtmiV2.json) over string "dtmi:dtdl:class:Property;2".
  * [MAY](spec/Allowance-ClassPropertyTypeIncludesSemanticTypeV2.json) include a string in column "Type term" or column "Type DTMI" from one of the rows in the [Semantic types](#semantic-types) table.
  * [MUST NOT](spec/Requirement-ClassPropertyMultipleSemanticTypesV2.json) include strings from more than one row in the [Semantic types](#semantic-types) table.
  * [SHOULD NOT](spec/Recommendation-ClassPropertySemanticTypeTermAndDtmiV2.json) include strings from both column "Type term" and column "Type DTMI" in the [Semantic types](#semantic-types) table.
  * [SHOULD NOT](spec/Recommendation-ClassPropertyDuplicateSemanticTypesV2.json) include more than one instance of a string in column "Type term" or column "Type DTMI" from one of the rows in the [Semantic types](#semantic-types) table.
  * In the [Semantic types](#semantic-types) table, strings in column "Type term" are [RECOMMENDED](spec/Recommendation-ClassPropertySemanticTypePreferTermToDtmiV2.json) over strings in column "Type DTMI".
  * [SHALL NOT](spec/Completion-ClassPropertyTypeIncludesIrrelevantDtmiOrTermV2.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "Property" or "dtmi:dtdl:class:Property;2" or a string from the [Semantic types](#semantic-types) table, except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassPropertyTypeIncludesInvalidDtmiV2.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MAY](spec/Allowance-ClassPropertyTypeIncludesNotDtmiNorTermV2.json) include any string that contains ":" but does not start with "dtmi:". If any such string is included, the element is considered to be *informally co-typed*.
  * [MAY](spec/Allowance-ClassPropertyTypeIncludesUndefinedTermV2.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If any such string is included, the element is considered to be *informally co-typed*.
* name
  * Value [MUST](spec/Requirement-ClassPropertyPropertyNameStringV2.json) be a [representational string](#representational-string) or an array containing exactly one representational string.
  * String value [MUST NOT](spec/Requirement-ClassPropertyPropertyNameStringLengthV2.json) be more than 64 characters in length.
  * String value [MUST](spec/Requirement-ClassPropertyPropertyNamePatternV2.json) match regular expression `^[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?$`.
  * String value [MUST](spec/Requirement-ClassPropertyPropertyNameUniqueAmongInterfaceContentsV2.json) be unique among the included values of "name" members of all elements included or referentially included in the "contents" member of any parent [Interface](#interface) element.
  * String value [MUST](spec/Requirement-ClassPropertyPropertyNameUniqueAmongRelationshipPropertiesV2.json) be unique among the included values of "name" members of all elements included or referentially included in the "properties" member of any parent [Relationship](#relationship) element.
  * Member name [MAY](spec/Allowance-ClassPropertyPropertyNameDtmiV2.json) be expressed as "dtmi:dtdl:property:name;2" instead of "name", but "name" is [RECOMMENDED](spec/Recommendation-ClassPropertyPropertyNameTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassPropertyPropertyNameTermAndDtmiV2.json) be expressed as both "name" and "dtmi:dtdl:property:name;2".
* schema
  * Value [MUST](spec/Requirement-ClassPropertyPropertySchemaElementV2.json) be a DTDL element, a dependent reference to a DTDL element, a string from one of the rows in a [Standard schemas](#standard-schemas) table, a string defined by an extension referenced in the active context, or an array containing exactly one DTDL element, dependent reference to a DTDL element, string from one of the rows in a Standard schemas table, or string defined by an extension referenced in the active context.
  * If the value is a dependent reference or an array containing a dependent reference, the model [SHALL](spec/Completion-ClassPropertyPropertySchemaDependentReferenceV2.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * If present, an included or referentially included DTDL element [MUST](spec/Requirement-ClassPropertyPropertySchemaTypeConformanceV2.json) conform to the definition of DTDL element [Enum](#enum) or [Map](#map) or [Object](#object).
  * If a string from one of the rows in a Standard schemas table is included, a string from column "Term" is [RECOMMENDED](spec/Recommendation-ClassPropertyPropertySchemaPreferTermToDtmiV2.json) over a string from column "DTMI".
  * Value [MUST NOT](spec/Requirement-ClassPropertyPropertySchemaImpliedExclusionV2.json) include any string from the [Geospatial schemas](#geospatial-schemas) table.
  * [MAY](spec/Requirement-ClassPropertyCotypeRequiresPropertySchemaValueV2.json) include a string in column "Type term" or column "Type DTMI" from one of the rows in the [Semantic types](#semantic-types) table.
  * If there is an "@type" member that includes any string in column "Type term" or column "Type DTMI" of the [Semantic types](#semantic-types) table, the included value of member "schema" [MUST](spec/Requirement-ClassPropertyCotypeRequiresPropertySchemaValueV2.json) be in the following set: "double", "float", "integer", "long", "dtmi:dtdl:instance:Schema:double;2", "dtmi:dtdl:instance:Schema:float;2", "dtmi:dtdl:instance:Schema:integer;2", "dtmi:dtdl:instance:Schema:long;2".
  * Considered with other DTDL elements, value is subject to any relevant restrictions in [Limits and exclusions](#limits-and-exclusions).
  * Member name [MAY](spec/Allowance-ClassPropertyPropertySchemaDtmiV2.json) be expressed as "dtmi:dtdl:property:schema;2" instead of "schema", but "schema" is [RECOMMENDED](spec/Recommendation-ClassPropertyPropertySchemaTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassPropertyPropertySchemaTermAndDtmiV2.json) be expressed as both "schema" and "dtmi:dtdl:property:schema;2".

The following members are [OPTIONAL](spec/Allowance-ClassPropertyOptionalPropertiesV2.json):

* @context
  * [MUST](spec/Requirement-ClassPropertyContextConformsV2.json) conform to the specified [context](#context) rules.
* @id
  * Value [MUST](spec/Requirement-ClassPropertyIdIsDtmiV2.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassPropertyIdNotArrayV2.json) be an array.
  * Value [MUST](spec/Requirement-ClassPropertyIdDuplicateV2.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassPropertyPropertyCommentStringV2.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassPropertyPropertyCommentStringLengthV2.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassPropertyPropertyCommentDtmiV2.json) be expressed as "dtmi:dtdl:property:comment;2" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassPropertyPropertyCommentTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassPropertyPropertyCommentTermAndDtmiV2.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;2".
* description
  * Value [MUST](spec/Requirement-ClassPropertyPropertyDescriptionLangStringV2.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassPropertyPropertyDescriptionStringLengthV2.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassPropertyPropertyDescriptionDtmiV2.json) be expressed as "dtmi:dtdl:property:description;2" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassPropertyPropertyDescriptionTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassPropertyPropertyDescriptionTermAndDtmiV2.json) be expressed as both "description" and "dtmi:dtdl:property:description;2".
* displayName
  * Value [MUST](spec/Requirement-ClassPropertyPropertyDisplayNameLangStringV2.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassPropertyPropertyDisplayNameStringLengthV2.json) be more than 64 characters in length.
  * Member name [MAY](spec/Allowance-ClassPropertyPropertyDisplayNameDtmiV2.json) be expressed as "dtmi:dtdl:property:displayName;2" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassPropertyPropertyDisplayNameTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassPropertyPropertyDisplayNameTermAndDtmiV2.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;2".
* writable
  * Value [MUST](spec/Requirement-ClassPropertyPropertyWritableBooleanV2.json) be a [representational boolean](#representational-boolean) or an array containing no more than one representational boolean.
  * Member name [MAY](spec/Allowance-ClassPropertyPropertyWritableDtmiV2.json) be expressed as "dtmi:dtdl:property:writable;2" instead of "writable", but "writable" is [RECOMMENDED](spec/Recommendation-ClassPropertyPropertyWritableTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassPropertyPropertyWritableTermAndDtmiV2.json) be expressed as both "writable" and "dtmi:dtdl:property:writable;2".

All members other than those explitly listed above are forbidden, permitted, or mandated according to the following rules:

* A member named "@graph" [MUST NOT](spec/Requirement-ClassPropertyGraphKeywordV2.json) be present.
* Members with names starting with "@" other than "@context", "@id", and "@type" [SHOULD NOT](spec/Recommendation-ClassPropertyInvalidKeywordsV2.json) be present.
* If there is an "@type" member that includes any string in column "Type term" or column "Type DTMI" of the [Semantic types](#semantic-types) table, then:
  * Member "unit" [MUST](spec/Requirement-ClassPropertyCotypePropertyPresentV2.json) be present and have a value that is a string or an array containing a single string.
  * The string value of member "unit" [MUST](spec/Requirement-ClassPropertyCotypePropertyValueFromTableV2.json) be a value in column "Unit term" or column "Unit DTMI" of the [Semantic types](#semantic-types) table.
  * In the [Semantic types](#semantic-types) table, strings in column "Unit term" are [RECOMMENDED](spec/Recommendation-ClassPropertyCotypePropertyValuePreferTermToDtmiV2.json) over strings in column "Unit DTMI".
  * The string in the [Semantic types](#semantic-types) table that is included in the "@type" member [MUST](spec/Requirement-ClassPropertyCotypePropertyValueMatchesCotypeV2.json) be in the same row of the Semantic types table as the string value of the "unit" member.
  * Member name [MAY](spec/Allowance-ClassPropertyCotypePropertyDtmiV2.json) be expressed as "dtmi:dtdl:property:unit;2" instead of "unit", but "unit" is [RECOMMENDED](spec/Recommendation-ClassPropertyCotypePropertyTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassPropertyCotypePropertyTermAndDtmiV2.json) be expressed as both "unit" and "dtmi:dtdl:property:unit;2".
* Except as explicitly designated by an extension referenced in the active context, a member [MAY](spec/Allowance-ClassPropertyPropertyIrrelevantDtmiOrTermV2.json) be present if the element is informally co-typed and if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table but not listed in column "Type term" or column "Type DTMI" of the [Semantic types](#semantic-types) table.
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassPropertyPropertyFormallyIrrelevantDtmiOrTermV2.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table but not listed in column "Type term" or column "Type DTMI" of the [Semantic types](#semantic-types) table, unless its name is in the following list: "comment", "description", "displayName", "name", "schema", "writable", "unit", "dtmi:dtdl:property:comment;2", "dtmi:dtdl:property:description;2", "dtmi:dtdl:property:displayName;2", "dtmi:dtdl:property:name;2", "dtmi:dtdl:property:schema;2", "dtmi:dtdl:property:writable;2", "dtmi:dtdl:property:unit;2".
* A member [MAY](spec/Allowance-ClassPropertyPropertyInvalidDtmiV2.json) be present if the element is informally co-typed and if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassPropertyPropertyFormallyInvalidDtmiV2.json) be present if the element is not informally co-typed and the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MAY](spec/Allowance-ClassPropertyPropertyNotDtmiNorTermV2.json) be present if the element is informally co-typed and if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [MUST NOT](spec/Requirement-ClassPropertyPropertyFormallyNotDtmiNorTermV2.json) be present if the element is not informally co-typed and the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [MAY](spec/Allowance-ClassPropertyPropertyUndefinedTermV2.json) be present if the element is informally co-typed and if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassPropertyPropertyFormallyUndefinedTermV2.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### Relationship

Example:

```json
{
  "@context": "dtmi:dtdl:context;2",
  "@id": "dtmi:example:beta_mu;1",
  "@type": "Interface",
  "contents": {
    "@type": "Relationship",
    "name": "beta_lambda"
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassRelationshipRequiredPropertiesV2.json):

* @type
  * Value [MUST](spec/Requirement-ClassRelationshipTypeStringOrArrayV2.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassRelationshipTypeIncludesMaterialV2.json) include either string "Relationship" or string "dtmi:dtdl:class:Relationship;2".
  * [SHOULD NOT](spec/Recommendation-ClassRelationshipTypeIncludesTermAndDtmiV2.json) include both "Relationship" and "dtmi:dtdl:class:Relationship;2".
  * [SHOULD NOT](spec/Recommendation-ClassRelationshipTypeDuplicatesMaterialV2.json) include more than one instance of either "Relationship" or "dtmi:dtdl:class:Relationship;2".
  * String "Relationship" is [RECOMMENDED](spec/Recommendation-ClassRelationshipTypePreferTermToDtmiV2.json) over string "dtmi:dtdl:class:Relationship;2".
  * [SHALL NOT](spec/Completion-ClassRelationshipTypeIncludesIrrelevantDtmiOrTermV2.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "Relationship" or "dtmi:dtdl:class:Relationship;2", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassRelationshipTypeIncludesInvalidDtmiV2.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MAY](spec/Allowance-ClassRelationshipTypeIncludesNotDtmiNorTermV2.json) include any string that contains ":" but does not start with "dtmi:". If any such string is included, the element is considered to be *informally co-typed*.
  * [MAY](spec/Allowance-ClassRelationshipTypeIncludesUndefinedTermV2.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If any such string is included, the element is considered to be *informally co-typed*.
* name
  * Value [MUST](spec/Requirement-ClassRelationshipPropertyNameStringV2.json) be a [representational string](#representational-string) or an array containing exactly one representational string.
  * String value [MUST NOT](spec/Requirement-ClassRelationshipPropertyNameStringLengthV2.json) be more than 64 characters in length.
  * String value [MUST](spec/Requirement-ClassRelationshipPropertyNamePatternV2.json) match regular expression `^[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?$`.
  * String value [MUST](spec/Requirement-ClassRelationshipPropertyNameUniqueAmongInterfaceContentsV2.json) be unique among the included values of "name" members of all elements included or referentially included in the "contents" member of any parent [Interface](#interface) element.
  * Member name [MAY](spec/Allowance-ClassRelationshipPropertyNameDtmiV2.json) be expressed as "dtmi:dtdl:property:name;2" instead of "name", but "name" is [RECOMMENDED](spec/Recommendation-ClassRelationshipPropertyNameTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassRelationshipPropertyNameTermAndDtmiV2.json) be expressed as both "name" and "dtmi:dtdl:property:name;2".

The following members are [OPTIONAL](spec/Allowance-ClassRelationshipOptionalPropertiesV2.json):

* @context
  * [MUST](spec/Requirement-ClassRelationshipContextConformsV2.json) conform to the specified [context](#context) rules.
* @id
  * Value [MUST](spec/Requirement-ClassRelationshipIdIsDtmiV2.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassRelationshipIdNotArrayV2.json) be an array.
  * Value [MUST](spec/Requirement-ClassRelationshipIdDuplicateV2.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassRelationshipPropertyCommentStringV2.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassRelationshipPropertyCommentStringLengthV2.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassRelationshipPropertyCommentDtmiV2.json) be expressed as "dtmi:dtdl:property:comment;2" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassRelationshipPropertyCommentTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassRelationshipPropertyCommentTermAndDtmiV2.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;2".
* description
  * Value [MUST](spec/Requirement-ClassRelationshipPropertyDescriptionLangStringV2.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassRelationshipPropertyDescriptionStringLengthV2.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassRelationshipPropertyDescriptionDtmiV2.json) be expressed as "dtmi:dtdl:property:description;2" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassRelationshipPropertyDescriptionTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassRelationshipPropertyDescriptionTermAndDtmiV2.json) be expressed as both "description" and "dtmi:dtdl:property:description;2".
* displayName
  * Value [MUST](spec/Requirement-ClassRelationshipPropertyDisplayNameLangStringV2.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassRelationshipPropertyDisplayNameStringLengthV2.json) be more than 64 characters in length.
  * Member name [MAY](spec/Allowance-ClassRelationshipPropertyDisplayNameDtmiV2.json) be expressed as "dtmi:dtdl:property:displayName;2" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassRelationshipPropertyDisplayNameTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassRelationshipPropertyDisplayNameTermAndDtmiV2.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;2".
* maxMultiplicity
  * Value [MUST](spec/Requirement-ClassRelationshipPropertyMaxMultiplicityIntegerV2.json) be a [representational integer](#representational-integer) or an array containing no more than one representational integer.
  * If present, integer value [MUST NOT](spec/Requirement-ClassRelationshipPropertyMaxMultiplicityMinValueV2.json) be less than 1.
  * If present, integer value [MUST NOT](spec/Requirement-ClassRelationshipPropertyMaxMultiplicityMaxValueV2.json) be greater than 500.
  * Member name [MAY](spec/Allowance-ClassRelationshipPropertyMaxMultiplicityDtmiV2.json) be expressed as "dtmi:dtdl:property:maxMultiplicity;2" instead of "maxMultiplicity", but "maxMultiplicity" is [RECOMMENDED](spec/Recommendation-ClassRelationshipPropertyMaxMultiplicityTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassRelationshipPropertyMaxMultiplicityTermAndDtmiV2.json) be expressed as both "maxMultiplicity" and "dtmi:dtdl:property:maxMultiplicity;2".
* minMultiplicity
  * Value [MUST](spec/Requirement-ClassRelationshipPropertyMinMultiplicityIntegerV2.json) be a [representational integer](#representational-integer) or an array containing no more than one representational integer.
  * If present, integer value [MUST](spec/Requirement-ClassRelationshipPropertyMinMultiplicityExactValueV2.json) be 0.
  * Member name [MAY](spec/Allowance-ClassRelationshipPropertyMinMultiplicityDtmiV2.json) be expressed as "dtmi:dtdl:property:minMultiplicity;2" instead of "minMultiplicity", but "minMultiplicity" is [RECOMMENDED](spec/Recommendation-ClassRelationshipPropertyMinMultiplicityTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassRelationshipPropertyMinMultiplicityTermAndDtmiV2.json) be expressed as both "minMultiplicity" and "dtmi:dtdl:property:minMultiplicity;2".
* properties
  * Value [MUST](spec/Requirement-ClassRelationshipPropertyPropertiesElementV2.json) be a DTDL element, a dependent reference to DTDL element, or an array of DTDL elements and dependent references to DTDL elements.
  * For each included dependent reference, the model [SHALL](spec/Completion-ClassRelationshipPropertyPropertiesDependentReferenceV2.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * Each included or referentially included DTDL element [MUST](spec/Requirement-ClassRelationshipPropertyPropertiesTypeConformanceV2.json) conform to the definition of DTDL element [Property](#property).
  * [MUST NOT](spec/Requirement-ClassRelationshipPropertyPropertiesMaxCountV2.json) include or referentially include more than 300 DTDL elements.
  * Member name [MAY](spec/Allowance-ClassRelationshipPropertyPropertiesDtmiV2.json) be expressed as "dtmi:dtdl:property:properties;2" instead of "properties", but "properties" is [RECOMMENDED](spec/Recommendation-ClassRelationshipPropertyPropertiesTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassRelationshipPropertyPropertiesTermAndDtmiV2.json) be expressed as both "properties" and "dtmi:dtdl:property:properties;2".
* target
  * Value [MUST](spec/Requirement-ClassRelationshipPropertyTargetIsDtmiV2.json) be a DTMI or an array containing no more than one DTMI.
  * Note that any included DTMI is a non-dependent reference.
  * Member name [MAY](spec/Allowance-ClassRelationshipPropertyTargetDtmiV2.json) be expressed as "dtmi:dtdl:property:target;2" instead of "target", but "target" is [RECOMMENDED](spec/Recommendation-ClassRelationshipPropertyTargetTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassRelationshipPropertyTargetTermAndDtmiV2.json) be expressed as both "target" and "dtmi:dtdl:property:target;2".
* writable
  * Value [MUST](spec/Requirement-ClassRelationshipPropertyWritableBooleanV2.json) be a [representational boolean](#representational-boolean) or an array containing no more than one representational boolean.
  * Member name [MAY](spec/Allowance-ClassRelationshipPropertyWritableDtmiV2.json) be expressed as "dtmi:dtdl:property:writable;2" instead of "writable", but "writable" is [RECOMMENDED](spec/Recommendation-ClassRelationshipPropertyWritableTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassRelationshipPropertyWritableTermAndDtmiV2.json) be expressed as both "writable" and "dtmi:dtdl:property:writable;2".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* A member named "@graph" [MUST NOT](spec/Requirement-ClassRelationshipGraphKeywordV2.json) be present.
* Members with names starting with "@" other than "@context", "@id", and "@type" [SHOULD NOT](spec/Recommendation-ClassRelationshipInvalidKeywordsV2.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [MAY](spec/Allowance-ClassRelationshipPropertyIrrelevantDtmiOrTermV2.json) be present if the element is informally co-typed and if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table.
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassRelationshipPropertyFormallyIrrelevantDtmiOrTermV2.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "maxMultiplicity", "minMultiplicity", "name", "properties", "target", "writable", "dtmi:dtdl:property:comment;2", "dtmi:dtdl:property:description;2", "dtmi:dtdl:property:displayName;2", "dtmi:dtdl:property:maxMultiplicity;2", "dtmi:dtdl:property:minMultiplicity;2", "dtmi:dtdl:property:name;2", "dtmi:dtdl:property:properties;2", "dtmi:dtdl:property:target;2", "dtmi:dtdl:property:writable;2".
* A member [MAY](spec/Allowance-ClassRelationshipPropertyInvalidDtmiV2.json) be present if the element is informally co-typed and if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassRelationshipPropertyFormallyInvalidDtmiV2.json) be present if the element is not informally co-typed and the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MAY](spec/Allowance-ClassRelationshipPropertyNotDtmiNorTermV2.json) be present if the element is informally co-typed and if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [MUST NOT](spec/Requirement-ClassRelationshipPropertyFormallyNotDtmiNorTermV2.json) be present if the element is not informally co-typed and the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [MAY](spec/Allowance-ClassRelationshipPropertyUndefinedTermV2.json) be present if the element is informally co-typed and if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassRelationshipPropertyFormallyUndefinedTermV2.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### Telemetry

Example:

```json
{
  "@context": "dtmi:dtdl:context;2",
  "@id": "dtmi:example:beta_pi;1",
  "@type": "Interface",
  "contents": {
    "@type": "Telemetry",
    "name": "beta_omicron",
    "schema": "string"
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassTelemetryRequiredPropertiesV2.json):

* @type
  * Value [MUST](spec/Requirement-ClassTelemetryTypeStringOrArrayV2.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassTelemetryTypeIncludesMaterialV2.json) include either string "Telemetry" or string "dtmi:dtdl:class:Telemetry;2".
  * [SHOULD NOT](spec/Recommendation-ClassTelemetryTypeIncludesTermAndDtmiV2.json) include both "Telemetry" and "dtmi:dtdl:class:Telemetry;2".
  * [SHOULD NOT](spec/Recommendation-ClassTelemetryTypeDuplicatesMaterialV2.json) include more than one instance of either "Telemetry" or "dtmi:dtdl:class:Telemetry;2".
  * String "Telemetry" is [RECOMMENDED](spec/Recommendation-ClassTelemetryTypePreferTermToDtmiV2.json) over string "dtmi:dtdl:class:Telemetry;2".
  * [MAY](spec/Allowance-ClassTelemetryTypeIncludesSemanticTypeV2.json) include a string in column "Type term" or column "Type DTMI" from one of the rows in the [Semantic types](#semantic-types) table.
  * [MUST NOT](spec/Requirement-ClassTelemetryMultipleSemanticTypesV2.json) include strings from more than one row in the [Semantic types](#semantic-types) table.
  * [SHOULD NOT](spec/Recommendation-ClassTelemetrySemanticTypeTermAndDtmiV2.json) include strings from both column "Type term" and column "Type DTMI" in the [Semantic types](#semantic-types) table.
  * [SHOULD NOT](spec/Recommendation-ClassTelemetryDuplicateSemanticTypesV2.json) include more than one instance of a string in column "Type term" or column "Type DTMI" from one of the rows in the [Semantic types](#semantic-types) table.
  * In the [Semantic types](#semantic-types) table, strings in column "Type term" are [RECOMMENDED](spec/Recommendation-ClassTelemetrySemanticTypePreferTermToDtmiV2.json) over strings in column "Type DTMI".
  * [SHALL NOT](spec/Completion-ClassTelemetryTypeIncludesIrrelevantDtmiOrTermV2.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "Telemetry" or "dtmi:dtdl:class:Telemetry;2" or a string from the [Semantic types](#semantic-types) table, except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassTelemetryTypeIncludesInvalidDtmiV2.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MAY](spec/Allowance-ClassTelemetryTypeIncludesNotDtmiNorTermV2.json) include any string that contains ":" but does not start with "dtmi:". If any such string is included, the element is considered to be *informally co-typed*.
  * [MAY](spec/Allowance-ClassTelemetryTypeIncludesUndefinedTermV2.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If any such string is included, the element is considered to be *informally co-typed*.
* name
  * Value [MUST](spec/Requirement-ClassTelemetryPropertyNameStringV2.json) be a [representational string](#representational-string) or an array containing exactly one representational string.
  * String value [MUST NOT](spec/Requirement-ClassTelemetryPropertyNameStringLengthV2.json) be more than 64 characters in length.
  * String value [MUST](spec/Requirement-ClassTelemetryPropertyNamePatternV2.json) match regular expression `^[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?$`.
  * String value [MUST](spec/Requirement-ClassTelemetryPropertyNameUniqueAmongInterfaceContentsV2.json) be unique among the included values of "name" members of all elements included or referentially included in the "contents" member of any parent [Interface](#interface) element.
  * Member name [MAY](spec/Allowance-ClassTelemetryPropertyNameDtmiV2.json) be expressed as "dtmi:dtdl:property:name;2" instead of "name", but "name" is [RECOMMENDED](spec/Recommendation-ClassTelemetryPropertyNameTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassTelemetryPropertyNameTermAndDtmiV2.json) be expressed as both "name" and "dtmi:dtdl:property:name;2".
* schema
  * Value [MUST](spec/Requirement-ClassTelemetryPropertySchemaElementV2.json) be a DTDL element, a dependent reference to a DTDL element, a string from one of the rows in a [Standard schemas](#standard-schemas) table, a string defined by an extension referenced in the active context, or an array containing exactly one DTDL element, dependent reference to a DTDL element, string from one of the rows in a Standard schemas table, or string defined by an extension referenced in the active context.
  * If the value is a dependent reference or an array containing a dependent reference, the model [SHALL](spec/Completion-ClassTelemetryPropertySchemaDependentReferenceV2.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * If present, an included or referentially included DTDL element [MUST](spec/Requirement-ClassTelemetryPropertySchemaTypeConformanceV2.json) conform to the definition of DTDL element [Array](#array) or [Enum](#enum) or [Map](#map) or [Object](#object).
  * If a string from one of the rows in a Standard schemas table is included, a string from column "Term" is [RECOMMENDED](spec/Recommendation-ClassTelemetryPropertySchemaPreferTermToDtmiV2.json) over a string from column "DTMI".
  * [MAY](spec/Requirement-ClassTelemetryCotypeRequiresPropertySchemaValueV2.json) include a string in column "Type term" or column "Type DTMI" from one of the rows in the [Semantic types](#semantic-types) table.
  * If there is an "@type" member that includes any string in column "Type term" or column "Type DTMI" of the [Semantic types](#semantic-types) table, the included value of member "schema" [MUST](spec/Requirement-ClassTelemetryCotypeRequiresPropertySchemaValueV2.json) be in the following set: "double", "float", "integer", "long", "dtmi:dtdl:instance:Schema:double;2", "dtmi:dtdl:instance:Schema:float;2", "dtmi:dtdl:instance:Schema:integer;2", "dtmi:dtdl:instance:Schema:long;2".
  * Member name [MAY](spec/Allowance-ClassTelemetryPropertySchemaDtmiV2.json) be expressed as "dtmi:dtdl:property:schema;2" instead of "schema", but "schema" is [RECOMMENDED](spec/Recommendation-ClassTelemetryPropertySchemaTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassTelemetryPropertySchemaTermAndDtmiV2.json) be expressed as both "schema" and "dtmi:dtdl:property:schema;2".

The following members are [OPTIONAL](spec/Allowance-ClassTelemetryOptionalPropertiesV2.json):

* @context
  * [MUST](spec/Requirement-ClassTelemetryContextConformsV2.json) conform to the specified [context](#context) rules.
* @id
  * Value [MUST](spec/Requirement-ClassTelemetryIdIsDtmiV2.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassTelemetryIdNotArrayV2.json) be an array.
  * Value [MUST](spec/Requirement-ClassTelemetryIdDuplicateV2.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassTelemetryPropertyCommentStringV2.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassTelemetryPropertyCommentStringLengthV2.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassTelemetryPropertyCommentDtmiV2.json) be expressed as "dtmi:dtdl:property:comment;2" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassTelemetryPropertyCommentTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassTelemetryPropertyCommentTermAndDtmiV2.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;2".
* description
  * Value [MUST](spec/Requirement-ClassTelemetryPropertyDescriptionLangStringV2.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassTelemetryPropertyDescriptionStringLengthV2.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassTelemetryPropertyDescriptionDtmiV2.json) be expressed as "dtmi:dtdl:property:description;2" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassTelemetryPropertyDescriptionTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassTelemetryPropertyDescriptionTermAndDtmiV2.json) be expressed as both "description" and "dtmi:dtdl:property:description;2".
* displayName
  * Value [MUST](spec/Requirement-ClassTelemetryPropertyDisplayNameLangStringV2.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassTelemetryPropertyDisplayNameStringLengthV2.json) be more than 64 characters in length.
  * Member name [MAY](spec/Allowance-ClassTelemetryPropertyDisplayNameDtmiV2.json) be expressed as "dtmi:dtdl:property:displayName;2" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassTelemetryPropertyDisplayNameTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassTelemetryPropertyDisplayNameTermAndDtmiV2.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;2".

All members other than those explitly listed above are forbidden, permitted, or mandated according to the following rules:

* A member named "@graph" [MUST NOT](spec/Requirement-ClassTelemetryGraphKeywordV2.json) be present.
* Members with names starting with "@" other than "@context", "@id", and "@type" [SHOULD NOT](spec/Recommendation-ClassTelemetryInvalidKeywordsV2.json) be present.
* If there is an "@type" member that includes any string in column "Type term" or column "Type DTMI" of the [Semantic types](#semantic-types) table, then:
  * Member "unit" [MUST](spec/Requirement-ClassTelemetryCotypePropertyPresentV2.json) be present and have a value that is a string or an array containing a single string.
  * The string value of member "unit" [MUST](spec/Requirement-ClassTelemetryCotypePropertyValueFromTableV2.json) be a value in column "Unit term" or column "Unit DTMI" of the [Semantic types](#semantic-types) table.
  * In the [Semantic types](#semantic-types) table, strings in column "Unit term" are [RECOMMENDED](spec/Recommendation-ClassTelemetryCotypePropertyValuePreferTermToDtmiV2.json) over strings in column "Unit DTMI".
  * The string in the [Semantic types](#semantic-types) table that is included in the "@type" member [MUST](spec/Requirement-ClassTelemetryCotypePropertyValueMatchesCotypeV2.json) be in the same row of the Semantic types table as the string value of the "unit" member.
  * Member name [MAY](spec/Allowance-ClassTelemetryCotypePropertyDtmiV2.json) be expressed as "dtmi:dtdl:property:unit;2" instead of "unit", but "unit" is [RECOMMENDED](spec/Recommendation-ClassTelemetryCotypePropertyTermV2.json).
  * Member name [MUST NOT](spec/Requirement-ClassTelemetryCotypePropertyTermAndDtmiV2.json) be expressed as both "unit" and "dtmi:dtdl:property:unit;2".
* Except as explicitly designated by an extension referenced in the active context, a member [MAY](spec/Allowance-ClassTelemetryPropertyIrrelevantDtmiOrTermV2.json) be present if the element is informally co-typed and if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table but not listed in column "Type term" or column "Type DTMI" of the [Semantic types](#semantic-types) table.
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassTelemetryPropertyFormallyIrrelevantDtmiOrTermV2.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table but not listed in column "Type term" or column "Type DTMI" of the [Semantic types](#semantic-types) table, unless its name is in the following list: "comment", "description", "displayName", "name", "schema", "unit", "dtmi:dtdl:property:comment;2", "dtmi:dtdl:property:description;2", "dtmi:dtdl:property:displayName;2", "dtmi:dtdl:property:name;2", "dtmi:dtdl:property:schema;2", "dtmi:dtdl:property:unit;2".
* A member [MAY](spec/Allowance-ClassTelemetryPropertyInvalidDtmiV2.json) be present if the element is informally co-typed and if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassTelemetryPropertyFormallyInvalidDtmiV2.json) be present if the element is not informally co-typed and the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MAY](spec/Allowance-ClassTelemetryPropertyNotDtmiNorTermV2.json) be present if the element is informally co-typed and if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [MUST NOT](spec/Requirement-ClassTelemetryPropertyFormallyNotDtmiNorTermV2.json) be present if the element is not informally co-typed and the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [MAY](spec/Allowance-ClassTelemetryPropertyUndefinedTermV2.json) be present if the element is informally co-typed and if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassTelemetryPropertyFormallyUndefinedTermV2.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

## Limits and exclusions

In addition to the direct requirements on members of various [DTDL elements](#dtdl-element), there are restrictions on the element hierarchies formed via inclusion and referential inclusion.
Specifically:

* There [MUST NOT](spec/Requirement-ClassArrayPropertiesElementSchemaSchemaMaxDepthV2.json) be more than 5 "elementSchema" or "schema" members in any path from a DTDL [Array](#array) element to another DTDL element.
* There [MUST NOT](spec/Requirement-ClassComponentPropertiesSchemaContentsExcludeComponentV2.json) be a path of "schema" or "contents" members from any DTDL [Component](#component) element to any DTDL [Component](#component) element.
* There [MUST NOT](spec/Requirement-ClassInterfacePropertiesExtendsMaxDepthV2.json) be more than 10 members in any path of "extends" members from a DTDL [Interface](#interface) element to another DTDL element.
* There [MUST NOT](spec/Requirement-ClassMapPropertiesElementSchemaSchemaMaxDepthV2.json) be more than 5 "elementSchema" or "schema" members in any path from a DTDL [Map](#map) element to another DTDL element.
* There [MUST NOT](spec/Requirement-ClassObjectPropertiesElementSchemaSchemaMaxDepthV2.json) be more than 5 "elementSchema" or "schema" members in any path from a DTDL [Object](#object) element to another DTDL element.
* A DTDL [Property](#property) element [MUST NOT](spec/Requirement-ClassPropertyPropertiesSchemaExcludeArrayV2.json) be an ancestor of any DTDL element with a "schema" member that includes or referentially includes a DTDL [Array](#array) element.
* A DTDL [Property](#property) element [MUST NOT](spec/Requirement-ClassPropertyPropertiesSchemaExcludeArrayImplicantV2.json) be an ancestor of any DTDL element with a "schema" member that includes any string from the [Geospatial schemas](#geospatial-schemas) table.

## Representational literal

A representational literal is a JSON value that represents a literal value.
The representation can be in the form of a bare literal, an untyped value object, or a typed value object.
When a member includes a representational literal, the member is also considered to include the literal value itself.

### Representational string

To be a conformant *representational string*, a JSON value [MUST](spec/Requirement-RepresentationalStringOrObjectV2.json) be either a string or an object.

* If the representational string is a string, the string value itself is considered to be the value of the representational string.
* If the representational string is an object, the following constraints and conditions apply:
  * Every member in the object [MUST](spec/Requirement-RepresentationalStringOnlyKeywordsV2.json) have a name that starts with "@".
  * The object [MUST](spec/Requirement-RepresentationalStringHasValueV2.json) have a member with name "@value".
  * The value of member "@value" [MUST](spec/Requirement-RepresentationalStringValueStringV2.json) be a string.
  * The object [SHOULD](spec/Recommendation-RepresentationalStringHasTypeV2.json) have a member with name "@type".
  * If present, member "@type" [MUST](spec/Requirement-RepresentationalStringTypeStringV2.json) have value "xsd:string" or "http://www.w3.org/2001/XMLSchema#string".
  * The object [SHOULD NOT](spec/Recommendation-RepresentationalStringOnlyValueAndTypeV2.json) have any member with name other than "@value" or "@type".
  * The object [MUST NOT](spec/Requirement-RepresentationalStringNoIdContextGraphV2.json) have a member with name "@id" or "@context" or "@graph".
  * The string value of member "@value" is considered to be the value of the representational string.

For example, in the following object, members "foo", "bar", and "baz" all have values that are representational strings with string value "hello":

```json
{
    "foo": "hello",
    "bar": {
        "@value": "hello"
    },
    "baz": {
        "@value": "hello",
        "@type": "xsd:string"
    }
}
```

### Representational integer

To be a conformant *representational integer*, a JSON value [MUST](spec/Requirement-RepresentationalIntegerOrObjectV2.json) be either an integer or an object.

* If the representational integer is an integer, the integer value itself is considered to be the value of the representational integer.
* If the representational integer is an object, the following constraints and conditions apply:
  * Every member in the object [MUST](spec/Requirement-RepresentationalIntegerOnlyKeywordsV2.json) have a name that starts with "@".
  * The object [MUST](spec/Requirement-RepresentationalIntegerHasValueV2.json) have a member with name "@value".
  * The value of member "@value" [MUST](spec/Requirement-RepresentationalIntegerValueIntegerV2.json) be an integer.
  * The object [SHOULD](spec/Recommendation-RepresentationalIntegerHasTypeV2.json) have a member with name "@type".
  * If present, member "@type" [MUST](spec/Requirement-RepresentationalIntegerTypeIntegerV2.json) have value "xsd:integer" or "http://www.w3.org/2001/XMLSchema#integer".
  * The object [SHOULD NOT](spec/Recommendation-RepresentationalIntegerOnlyValueAndTypeV2.json) have any member with name other than "@value" or "@type".
  * The object [MUST NOT](spec/Requirement-RepresentationalIntegerNoIdContextGraphV2.json) have a member with name "@id" or "@context" or "@graph".
  * The integer value of member "@value" is considered to be the value of the representational integer.

For example, in the following object, members "foo", "bar", and "baz" all have values that are representational integers with integer value 3:

```json
{
    "foo": 3,
    "bar": {
        "@value": 3
    },
    "baz": {
        "@value": 3,
        "@type": "xsd:integer"
    }
}
```

### Representational boolean

To be a conformant *representational boolean*, a JSON value [MUST](spec/Requirement-RepresentationalBooleanOrObjectV2.json) be either a boolean or an object.

* If the representational boolean is a boolean, the boolean value itself is considered to be the value of the representational boolean.
* If the representational boolean is an object, the following constraints and conditions apply:
  * Every member in the object [MUST](spec/Requirement-RepresentationalBooleanOnlyKeywordsV2.json) have a name that starts with "@".
  * The object [MUST](spec/Requirement-RepresentationalBooleanHasValueV2.json) have a member with name "@value".
  * The value of member "@value" [MUST](spec/Requirement-RepresentationalBooleanValueBooleanV2.json) be a boolean.
  * The object [SHOULD](spec/Recommendation-RepresentationalBooleanHasTypeV2.json) have a member with name "@type".
  * If present, member "@type" [MUST](spec/Requirement-RepresentationalBooleanTypeBooleanV2.json) have value "xsd:boolean" or "http://www.w3.org/2001/XMLSchema#boolean".
  * The object [SHOULD NOT](spec/Recommendation-RepresentationalBooleanOnlyValueAndTypeV2.json) have any member with name other than "@value" or "@type".
  * The object [MUST NOT](spec/Requirement-RepresentationalBooleanNoIdContextGraphV2.json) have a member with name "@id" or "@context" or "@graph".
  * The boolean value of member "@value" is considered to be the value of the representational boolean.

For example, in the following object, members "foo", "bar", and "baz" all have values that are representational booleans with boolean value true:

```json
{
    "foo": true,
    "bar": {
        "@value": true
    },
    "baz": {
        "@value": true,
        "@type": "xsd:boolean"
    }
}
```

## Localizable string

A localizable string is a JSON value that can express a semantic string in multiple languages using one of three structural forms:
The JSON value can be a string, an array of strings and language-tagged value objects, or a language map object.

To be a conformant *localizable string*, a JSON value [MUST](spec/Requirement-LocalizableStringOrArrayOrObjectV2.json) be a string, an array, or an object.

If the localizable string is an array, the following constraints and conditions apply:

* Each value in the array [MUST](spec/Requirement-LocalizableStringArrayElementStringOrObjectV2.json) be either a string or an object.
* For each value in the array that is an object, the following constraints and conditions apply:
  * Every member in the object [MUST](spec/Requirement-LocalizableStringArrayElementOnlyKeywordsV2.json) have a name that starts with "@".
  * The object [MUST](spec/Requirement-LocalizableStringArrayElementHasValueV2.json) have a member with name "@value".
  * The value of member "@value" [MUST](spec/Requirement-LocalizableStringArrayElementValueStringV2.json) be a string.
  * The object [SHOULD](spec/Recommendation-LocalizableStringArrayElementHasLanguageV2.json) have a member with name "@language".
  * If present, member "@language" [MUST](spec/Requirement-LocalizableStringArrayElementLanguageValueRegexV2.json) have a string value that matches regular expression `^[a-z]{2,4}(-[A-Z][a-z]{3})?(-([A-Z]{2}|[0-9]{3}))?$`.
  * If present, member "@language" [MUST NOT](spec/Requirement-LocalizableStringArrayElementLanguageValueUniqueV2.json) have a value that matches the value of the "@language" member of any other object in the array.
  * The object [SHOULD NOT](spec/Recommendation-LocalizableStringArrayElementOnlyValueAndLanguageV2.json) have any member with name other than "@value" or "@language".
  * The object [MUST NOT](spec/Requirement-LocalizableStringArrayElementNoIdContextGraphV2.json) have a member with name "@id" or "@context" or "@graph".

* The array [MUST NOT](spec/Requirement-LocalizableStringArrayOnlyOneDefaultV2.json) contain more than one of the following values:
  * A string value
  * An object value with no "@language" member
  * An object value with an "@language" member whose value is "en"

The following example illustrates string and array forms of localizable strings.
In this object, members "alpha", "beta", "gamma", and "delta" all have values that are localizable strings with value "hello" for language code "en-US":

```json
{
    "alpha": "hello",
    "beta": [
        "hello"
    ],
    "gamma": [
        {
            "@value": "hello"
        }
    ],
    "delta": [
        {
            "@value": "hello",
            "@language": "en-US"
        }
    ]
}
```

If the localizable string is an object, the following constraints and conditions apply:

* The name of each member [MUST](spec/Requirement-LocalizableStringObjectMemberNameRegexV2.json) match regular expression `^[a-z]{2,4}(-[A-Z][a-z]{3})?(-([A-Z]{2}|[0-9]{3}))?$`.
* Each member in the object [MUST](spec/Requirement-LocalizableStringObjectMemberValueStringV2.json) have a value that is a string.

The following example illustrates object and array forms of localizable strings.
In this object, members "foo" and "bar" both have values that are localizable strings with value "hello" for language code "en-US" and value "hola" for language code "es-ES":

```json
{
  "foo": {
    "en-US": "hello",
    "es-ES": "hola"
  },
  "bar": [
    {
      "@value": "hello",
      "@language": "en-US"
    },
    {
      "@value": "hola",
      "@language": "es-ES"
    }
  ]
}
```

Note that JSON objects are used in two different ways depending on whether the object is nested in an array.
An object in a localizable string array is a *language-tagged value* object; it has a required "@value" member and an optional "@language" member.
A localizable string object not in an array is a *language map* object; it has members with names that are language codes.

In the following object, members "wrong" and "bad" both have values that are **invalid** localizable strings:

```json
{
  "wrong": [
    {
      "en-US": "hello",
      "es-ES": "hola"
    }
  ],
  "bad": {
    "@value": "hello",
    "@language": "en-US"
  }
}
```

* The value of "wrong" is an array, so each object value therein must be a language-tagged value object, not a language map.
  * The object is missing required member "@value".
  * The object has members with names that do not start with "@".

* The value of "bad" is not an array, so the object value must be a language map, not a language-tagged value object.
  * The names of the two members, "@value" and "@language", do not match regular expression `^[a-z]{2,4}(-[A-Z][a-z]{3})?(-([A-Z]{2}|[0-9]{3}))?$`.

## Standard schemas

### Primitive schemas

When a DTDL element member is designated to permit a string from one of the rows in a Standard schemas table, a string value from either column of any row of the following table [MAY](spec/Allowance-ValuePrimitiveSchemaV2.json) be used for a value included by the member, unless a restriction described in [Limits and exclusions](#limits-and-exclusions) precludes a Primitive schemas value.
When selecting for a DTDL element member a string value from the following table, a string from column "Term" is [RECOMMENDED](spec/Recommendation-ValuePrimitiveSchemaTermV2.json) over a string from column "DTMI".

| Term | DTMI |
| --- | --- |
| "boolean" | "dtmi:dtdl:instance:Schema:boolean;2" |
| "date" | "dtmi:dtdl:instance:Schema:date;2" |
| "dateTime" | "dtmi:dtdl:instance:Schema:dateTime;2" |
| "double" | "dtmi:dtdl:instance:Schema:double;2" |
| "duration" | "dtmi:dtdl:instance:Schema:duration;2" |
| "float" | "dtmi:dtdl:instance:Schema:float;2" |
| "integer" | "dtmi:dtdl:instance:Schema:integer;2" |
| "long" | "dtmi:dtdl:instance:Schema:long;2" |
| "string" | "dtmi:dtdl:instance:Schema:string;2" |
| "time" | "dtmi:dtdl:instance:Schema:time;2" |

### Geospatial schemas

When a DTDL element member is designated to permit a string from one of the rows in a Standard schemas table, a string value from either column of any row of the following table [MAY](spec/Allowance-ValueGeospatialSchemaV2.json) be used for a value included by the member, unless a restriction described in [Limits and exclusions](#limits-and-exclusions) precludes a Geospatial schemas value.
When selecting for a DTDL element member a string value from the following table, a string from column "Term" is [RECOMMENDED](spec/Recommendation-ValueGeospatialSchemaTermV2.json) over a string from column "DTMI".

| Term | DTMI |
| --- | --- |
| "lineString" | "dtmi:standard:schema:geospatial:lineString;2" |
| "multiLineString" | "dtmi:standard:schema:geospatial:multiLineString;2" |
| "multiPoint" | "dtmi:standard:schema:geospatial:multiPoint;2" |
| "multiPolygon" | "dtmi:standard:schema:geospatial:multiPolygon;2" |
| "point" | "dtmi:standard:schema:geospatial:point;2" |
| "polygon" | "dtmi:standard:schema:geospatial:polygon;2" |

## Semantic types

The following table itemizes strings that in some circumstances may be used as DTDL element member names or "@type" values.
The particular circumstances that allow these strings are explicitly designated with reference to this "Semantic types" table.

| Type term | Type DTMI | Unit term | Unit DTMI |
| --- | --- | --- | --- |
| "Acceleration" | "dtmi:standard:class:Acceleration;2" | "centimetrePerSecondSquared" | "dtmi:standard:unit:centimetrePerSecondSquared;2" |
| "Acceleration" | "dtmi:standard:class:Acceleration;2" | "gForce" | "dtmi:standard:unit:gForce;2" |
| "Acceleration" | "dtmi:standard:class:Acceleration;2" | "metrePerSecondSquared" | "dtmi:standard:unit:metrePerSecondSquared;2" |
| "Angle" | "dtmi:standard:class:Angle;2" | "degreeOfArc" | "dtmi:standard:unit:degreeOfArc;2" |
| "Angle" | "dtmi:standard:class:Angle;2" | "minuteOfArc" | "dtmi:standard:unit:minuteOfArc;2" |
| "Angle" | "dtmi:standard:class:Angle;2" | "radian" | "dtmi:standard:unit:radian;2" |
| "Angle" | "dtmi:standard:class:Angle;2" | "secondOfArc" | "dtmi:standard:unit:secondOfArc;2" |
| "Angle" | "dtmi:standard:class:Angle;2" | "turn" | "dtmi:standard:unit:turn;2" |
| "AngularAcceleration" | "dtmi:standard:class:AngularAcceleration;2" | "radianPerSecondSquared" | "dtmi:standard:unit:radianPerSecondSquared;2" |
| "AngularVelocity" | "dtmi:standard:class:AngularVelocity;2" | "degreePerSecond" | "dtmi:standard:unit:degreePerSecond;2" |
| "AngularVelocity" | "dtmi:standard:class:AngularVelocity;2" | "radianPerSecond" | "dtmi:standard:unit:radianPerSecond;2" |
| "AngularVelocity" | "dtmi:standard:class:AngularVelocity;2" | "revolutionPerMinute" | "dtmi:standard:unit:revolutionPerMinute;2" |
| "AngularVelocity" | "dtmi:standard:class:AngularVelocity;2" | "revolutionPerSecond" | "dtmi:standard:unit:revolutionPerSecond;2" |
| "Area" | "dtmi:standard:class:Area;2" | "acre" | "dtmi:standard:unit:acre;2" |
| "Area" | "dtmi:standard:class:Area;2" | "hectare" | "dtmi:standard:unit:hectare;2" |
| "Area" | "dtmi:standard:class:Area;2" | "squareCentimetre" | "dtmi:standard:unit:squareCentimetre;2" |
| "Area" | "dtmi:standard:class:Area;2" | "squareFoot" | "dtmi:standard:unit:squareFoot;2" |
| "Area" | "dtmi:standard:class:Area;2" | "squareInch" | "dtmi:standard:unit:squareInch;2" |
| "Area" | "dtmi:standard:class:Area;2" | "squareKilometre" | "dtmi:standard:unit:squareKilometre;2" |
| "Area" | "dtmi:standard:class:Area;2" | "squareMetre" | "dtmi:standard:unit:squareMetre;2" |
| "Area" | "dtmi:standard:class:Area;2" | "squareMillimetre" | "dtmi:standard:unit:squareMillimetre;2" |
| "Capacitance" | "dtmi:standard:class:Capacitance;2" | "farad" | "dtmi:standard:unit:farad;2" |
| "Capacitance" | "dtmi:standard:class:Capacitance;2" | "microfarad" | "dtmi:standard:unit:microfarad;2" |
| "Capacitance" | "dtmi:standard:class:Capacitance;2" | "millifarad" | "dtmi:standard:unit:millifarad;2" |
| "Capacitance" | "dtmi:standard:class:Capacitance;2" | "nanofarad" | "dtmi:standard:unit:nanofarad;2" |
| "Capacitance" | "dtmi:standard:class:Capacitance;2" | "picofarad" | "dtmi:standard:unit:picofarad;2" |
| "Current" | "dtmi:standard:class:Current;2" | "ampere" | "dtmi:standard:unit:ampere;2" |
| "Current" | "dtmi:standard:class:Current;2" | "microampere" | "dtmi:standard:unit:microampere;2" |
| "Current" | "dtmi:standard:class:Current;2" | "milliampere" | "dtmi:standard:unit:milliampere;2" |
| "DataRate" | "dtmi:standard:class:DataRate;2" | "bitPerSecond" | "dtmi:standard:unit:bitPerSecond;2" |
| "DataRate" | "dtmi:standard:class:DataRate;2" | "bytePerSecond" | "dtmi:standard:unit:bytePerSecond;2" |
| "DataRate" | "dtmi:standard:class:DataRate;2" | "exbibitPerSecond" | "dtmi:standard:unit:exbibitPerSecond;2" |
| "DataRate" | "dtmi:standard:class:DataRate;2" | "exbibytePerSecond" | "dtmi:standard:unit:exbibytePerSecond;2" |
| "DataRate" | "dtmi:standard:class:DataRate;2" | "gibibitPerSecond" | "dtmi:standard:unit:gibibitPerSecond;2" |
| "DataRate" | "dtmi:standard:class:DataRate;2" | "gibibytePerSecond" | "dtmi:standard:unit:gibibytePerSecond;2" |
| "DataRate" | "dtmi:standard:class:DataRate;2" | "kibibitPerSecond" | "dtmi:standard:unit:kibibitPerSecond;2" |
| "DataRate" | "dtmi:standard:class:DataRate;2" | "kibibytePerSecond" | "dtmi:standard:unit:kibibytePerSecond;2" |
| "DataRate" | "dtmi:standard:class:DataRate;2" | "mebibitPerSecond" | "dtmi:standard:unit:mebibitPerSecond;2" |
| "DataRate" | "dtmi:standard:class:DataRate;2" | "mebibytePerSecond" | "dtmi:standard:unit:mebibytePerSecond;2" |
| "DataRate" | "dtmi:standard:class:DataRate;2" | "tebibitPerSecond" | "dtmi:standard:unit:tebibitPerSecond;2" |
| "DataRate" | "dtmi:standard:class:DataRate;2" | "tebibytePerSecond" | "dtmi:standard:unit:tebibytePerSecond;2" |
| "DataRate" | "dtmi:standard:class:DataRate;2" | "yobibitPerSecond" | "dtmi:standard:unit:yobibitPerSecond;2" |
| "DataRate" | "dtmi:standard:class:DataRate;2" | "yobibytePerSecond" | "dtmi:standard:unit:yobibytePerSecond;2" |
| "DataRate" | "dtmi:standard:class:DataRate;2" | "zebibitPerSecond" | "dtmi:standard:unit:zebibitPerSecond;2" |
| "DataRate" | "dtmi:standard:class:DataRate;2" | "zebibytePerSecond" | "dtmi:standard:unit:zebibytePerSecond;2" |
| "DataSize" | "dtmi:standard:class:DataSize;2" | "bit" | "dtmi:standard:unit:bit;2" |
| "DataSize" | "dtmi:standard:class:DataSize;2" | "byte" | "dtmi:standard:unit:byte;2" |
| "DataSize" | "dtmi:standard:class:DataSize;2" | "exbibit" | "dtmi:standard:unit:exbibit;2" |
| "DataSize" | "dtmi:standard:class:DataSize;2" | "exbibyte" | "dtmi:standard:unit:exbibyte;2" |
| "DataSize" | "dtmi:standard:class:DataSize;2" | "gibibit" | "dtmi:standard:unit:gibibit;2" |
| "DataSize" | "dtmi:standard:class:DataSize;2" | "gibibyte" | "dtmi:standard:unit:gibibyte;2" |
| "DataSize" | "dtmi:standard:class:DataSize;2" | "kibibit" | "dtmi:standard:unit:kibibit;2" |
| "DataSize" | "dtmi:standard:class:DataSize;2" | "kibibyte" | "dtmi:standard:unit:kibibyte;2" |
| "DataSize" | "dtmi:standard:class:DataSize;2" | "mebibit" | "dtmi:standard:unit:mebibit;2" |
| "DataSize" | "dtmi:standard:class:DataSize;2" | "mebibyte" | "dtmi:standard:unit:mebibyte;2" |
| "DataSize" | "dtmi:standard:class:DataSize;2" | "tebibit" | "dtmi:standard:unit:tebibit;2" |
| "DataSize" | "dtmi:standard:class:DataSize;2" | "tebibyte" | "dtmi:standard:unit:tebibyte;2" |
| "DataSize" | "dtmi:standard:class:DataSize;2" | "yobibit" | "dtmi:standard:unit:yobibit;2" |
| "DataSize" | "dtmi:standard:class:DataSize;2" | "yobibyte" | "dtmi:standard:unit:yobibyte;2" |
| "DataSize" | "dtmi:standard:class:DataSize;2" | "zebibit" | "dtmi:standard:unit:zebibit;2" |
| "DataSize" | "dtmi:standard:class:DataSize;2" | "zebibyte" | "dtmi:standard:unit:zebibyte;2" |
| "Density" | "dtmi:standard:class:Density;2" | "gramPerCubicMetre" | "dtmi:standard:unit:gramPerCubicMetre;2" |
| "Density" | "dtmi:standard:class:Density;2" | "kilogramPerCubicMetre" | "dtmi:standard:unit:kilogramPerCubicMetre;2" |
| "Distance" | "dtmi:standard:class:Distance;2" | "astronomicalUnit" | "dtmi:standard:unit:astronomicalUnit;2" |
| "Distance" | "dtmi:standard:class:Distance;2" | "centimetre" | "dtmi:standard:unit:centimetre;2" |
| "Distance" | "dtmi:standard:class:Distance;2" | "foot" | "dtmi:standard:unit:foot;2" |
| "Distance" | "dtmi:standard:class:Distance;2" | "inch" | "dtmi:standard:unit:inch;2" |
| "Distance" | "dtmi:standard:class:Distance;2" | "kilometre" | "dtmi:standard:unit:kilometre;2" |
| "Distance" | "dtmi:standard:class:Distance;2" | "metre" | "dtmi:standard:unit:metre;2" |
| "Distance" | "dtmi:standard:class:Distance;2" | "micrometre" | "dtmi:standard:unit:micrometre;2" |
| "Distance" | "dtmi:standard:class:Distance;2" | "mile" | "dtmi:standard:unit:mile;2" |
| "Distance" | "dtmi:standard:class:Distance;2" | "millimetre" | "dtmi:standard:unit:millimetre;2" |
| "Distance" | "dtmi:standard:class:Distance;2" | "nanometre" | "dtmi:standard:unit:nanometre;2" |
| "Distance" | "dtmi:standard:class:Distance;2" | "nauticalMile" | "dtmi:standard:unit:nauticalMile;2" |
| "ElectricCharge" | "dtmi:standard:class:ElectricCharge;2" | "coulomb" | "dtmi:standard:unit:coulomb;2" |
| "Energy" | "dtmi:standard:class:Energy;2" | "electronvolt" | "dtmi:standard:unit:electronvolt;2" |
| "Energy" | "dtmi:standard:class:Energy;2" | "gigajoule" | "dtmi:standard:unit:gigajoule;2" |
| "Energy" | "dtmi:standard:class:Energy;2" | "joule" | "dtmi:standard:unit:joule;2" |
| "Energy" | "dtmi:standard:class:Energy;2" | "kilojoule" | "dtmi:standard:unit:kilojoule;2" |
| "Energy" | "dtmi:standard:class:Energy;2" | "kilowattHour" | "dtmi:standard:unit:kilowattHour;2" |
| "Energy" | "dtmi:standard:class:Energy;2" | "megaelectronvolt" | "dtmi:standard:unit:megaelectronvolt;2" |
| "Energy" | "dtmi:standard:class:Energy;2" | "megajoule" | "dtmi:standard:unit:megajoule;2" |
| "Force" | "dtmi:standard:class:Force;2" | "newton" | "dtmi:standard:unit:newton;2" |
| "Force" | "dtmi:standard:class:Force;2" | "ounce" | "dtmi:standard:unit:ounce;2" |
| "Force" | "dtmi:standard:class:Force;2" | "pound" | "dtmi:standard:unit:pound;2" |
| "Force" | "dtmi:standard:class:Force;2" | "ton" | "dtmi:standard:unit:ton;2" |
| "Frequency" | "dtmi:standard:class:Frequency;2" | "gigahertz" | "dtmi:standard:unit:gigahertz;2" |
| "Frequency" | "dtmi:standard:class:Frequency;2" | "hertz" | "dtmi:standard:unit:hertz;2" |
| "Frequency" | "dtmi:standard:class:Frequency;2" | "kilohertz" | "dtmi:standard:unit:kilohertz;2" |
| "Frequency" | "dtmi:standard:class:Frequency;2" | "megahertz" | "dtmi:standard:unit:megahertz;2" |
| "Humidity" | "dtmi:standard:class:Humidity;2" | "gramPerCubicMetre" | "dtmi:standard:unit:gramPerCubicMetre;2" |
| "Humidity" | "dtmi:standard:class:Humidity;2" | "kilogramPerCubicMetre" | "dtmi:standard:unit:kilogramPerCubicMetre;2" |
| "Illuminance" | "dtmi:standard:class:Illuminance;2" | "footcandle" | "dtmi:standard:unit:footcandle;2" |
| "Illuminance" | "dtmi:standard:class:Illuminance;2" | "lux" | "dtmi:standard:unit:lux;2" |
| "Inductance" | "dtmi:standard:class:Inductance;2" | "henry" | "dtmi:standard:unit:henry;2" |
| "Inductance" | "dtmi:standard:class:Inductance;2" | "microhenry" | "dtmi:standard:unit:microhenry;2" |
| "Inductance" | "dtmi:standard:class:Inductance;2" | "millihenry" | "dtmi:standard:unit:millihenry;2" |
| "Latitude" | "dtmi:standard:class:Latitude;2" | "degreeOfArc" | "dtmi:standard:unit:degreeOfArc;2" |
| "Latitude" | "dtmi:standard:class:Latitude;2" | "minuteOfArc" | "dtmi:standard:unit:minuteOfArc;2" |
| "Latitude" | "dtmi:standard:class:Latitude;2" | "radian" | "dtmi:standard:unit:radian;2" |
| "Latitude" | "dtmi:standard:class:Latitude;2" | "secondOfArc" | "dtmi:standard:unit:secondOfArc;2" |
| "Latitude" | "dtmi:standard:class:Latitude;2" | "turn" | "dtmi:standard:unit:turn;2" |
| "Length" | "dtmi:standard:class:Length;2" | "astronomicalUnit" | "dtmi:standard:unit:astronomicalUnit;2" |
| "Length" | "dtmi:standard:class:Length;2" | "centimetre" | "dtmi:standard:unit:centimetre;2" |
| "Length" | "dtmi:standard:class:Length;2" | "foot" | "dtmi:standard:unit:foot;2" |
| "Length" | "dtmi:standard:class:Length;2" | "inch" | "dtmi:standard:unit:inch;2" |
| "Length" | "dtmi:standard:class:Length;2" | "kilometre" | "dtmi:standard:unit:kilometre;2" |
| "Length" | "dtmi:standard:class:Length;2" | "metre" | "dtmi:standard:unit:metre;2" |
| "Length" | "dtmi:standard:class:Length;2" | "micrometre" | "dtmi:standard:unit:micrometre;2" |
| "Length" | "dtmi:standard:class:Length;2" | "mile" | "dtmi:standard:unit:mile;2" |
| "Length" | "dtmi:standard:class:Length;2" | "millimetre" | "dtmi:standard:unit:millimetre;2" |
| "Length" | "dtmi:standard:class:Length;2" | "nanometre" | "dtmi:standard:unit:nanometre;2" |
| "Length" | "dtmi:standard:class:Length;2" | "nauticalMile" | "dtmi:standard:unit:nauticalMile;2" |
| "Longitude" | "dtmi:standard:class:Longitude;2" | "degreeOfArc" | "dtmi:standard:unit:degreeOfArc;2" |
| "Longitude" | "dtmi:standard:class:Longitude;2" | "minuteOfArc" | "dtmi:standard:unit:minuteOfArc;2" |
| "Longitude" | "dtmi:standard:class:Longitude;2" | "radian" | "dtmi:standard:unit:radian;2" |
| "Longitude" | "dtmi:standard:class:Longitude;2" | "secondOfArc" | "dtmi:standard:unit:secondOfArc;2" |
| "Longitude" | "dtmi:standard:class:Longitude;2" | "turn" | "dtmi:standard:unit:turn;2" |
| "Luminance" | "dtmi:standard:class:Luminance;2" | "candelaPerSquareMetre" | "dtmi:standard:unit:candelaPerSquareMetre;2" |
| "Luminosity" | "dtmi:standard:class:Luminosity;2" | "gigawatt" | "dtmi:standard:unit:gigawatt;2" |
| "Luminosity" | "dtmi:standard:class:Luminosity;2" | "horsepower" | "dtmi:standard:unit:horsepower;2" |
| "Luminosity" | "dtmi:standard:class:Luminosity;2" | "kilowatt" | "dtmi:standard:unit:kilowatt;2" |
| "Luminosity" | "dtmi:standard:class:Luminosity;2" | "kilowattHourPerYear" | "dtmi:standard:unit:kilowattHourPerYear;2" |
| "Luminosity" | "dtmi:standard:class:Luminosity;2" | "megawatt" | "dtmi:standard:unit:megawatt;2" |
| "Luminosity" | "dtmi:standard:class:Luminosity;2" | "microwatt" | "dtmi:standard:unit:microwatt;2" |
| "Luminosity" | "dtmi:standard:class:Luminosity;2" | "milliwatt" | "dtmi:standard:unit:milliwatt;2" |
| "Luminosity" | "dtmi:standard:class:Luminosity;2" | "watt" | "dtmi:standard:unit:watt;2" |
| "LuminousFlux" | "dtmi:standard:class:LuminousFlux;2" | "lumen" | "dtmi:standard:unit:lumen;2" |
| "LuminousIntensity" | "dtmi:standard:class:LuminousIntensity;2" | "candela" | "dtmi:standard:unit:candela;2" |
| "MagneticFlux" | "dtmi:standard:class:MagneticFlux;2" | "maxwell" | "dtmi:standard:unit:maxwell;2" |
| "MagneticFlux" | "dtmi:standard:class:MagneticFlux;2" | "weber" | "dtmi:standard:unit:weber;2" |
| "MagneticInduction" | "dtmi:standard:class:MagneticInduction;2" | "tesla" | "dtmi:standard:unit:tesla;2" |
| "Mass" | "dtmi:standard:class:Mass;2" | "gram" | "dtmi:standard:unit:gram;2" |
| "Mass" | "dtmi:standard:class:Mass;2" | "kilogram" | "dtmi:standard:unit:kilogram;2" |
| "Mass" | "dtmi:standard:class:Mass;2" | "microgram" | "dtmi:standard:unit:microgram;2" |
| "Mass" | "dtmi:standard:class:Mass;2" | "milligram" | "dtmi:standard:unit:milligram;2" |
| "Mass" | "dtmi:standard:class:Mass;2" | "slug" | "dtmi:standard:unit:slug;2" |
| "Mass" | "dtmi:standard:class:Mass;2" | "tonne" | "dtmi:standard:unit:tonne;2" |
| "MassFlowRate" | "dtmi:standard:class:MassFlowRate;2" | "gramPerHour" | "dtmi:standard:unit:gramPerHour;2" |
| "MassFlowRate" | "dtmi:standard:class:MassFlowRate;2" | "gramPerSecond" | "dtmi:standard:unit:gramPerSecond;2" |
| "MassFlowRate" | "dtmi:standard:class:MassFlowRate;2" | "kilogramPerHour" | "dtmi:standard:unit:kilogramPerHour;2" |
| "MassFlowRate" | "dtmi:standard:class:MassFlowRate;2" | "kilogramPerSecond" | "dtmi:standard:unit:kilogramPerSecond;2" |
| "Power" | "dtmi:standard:class:Power;2" | "gigawatt" | "dtmi:standard:unit:gigawatt;2" |
| "Power" | "dtmi:standard:class:Power;2" | "horsepower" | "dtmi:standard:unit:horsepower;2" |
| "Power" | "dtmi:standard:class:Power;2" | "kilowatt" | "dtmi:standard:unit:kilowatt;2" |
| "Power" | "dtmi:standard:class:Power;2" | "kilowattHourPerYear" | "dtmi:standard:unit:kilowattHourPerYear;2" |
| "Power" | "dtmi:standard:class:Power;2" | "megawatt" | "dtmi:standard:unit:megawatt;2" |
| "Power" | "dtmi:standard:class:Power;2" | "microwatt" | "dtmi:standard:unit:microwatt;2" |
| "Power" | "dtmi:standard:class:Power;2" | "milliwatt" | "dtmi:standard:unit:milliwatt;2" |
| "Power" | "dtmi:standard:class:Power;2" | "watt" | "dtmi:standard:unit:watt;2" |
| "Pressure" | "dtmi:standard:class:Pressure;2" | "bar" | "dtmi:standard:unit:bar;2" |
| "Pressure" | "dtmi:standard:class:Pressure;2" | "inchesOfMercury" | "dtmi:standard:unit:inchesOfMercury;2" |
| "Pressure" | "dtmi:standard:class:Pressure;2" | "inchesOfWater" | "dtmi:standard:unit:inchesOfWater;2" |
| "Pressure" | "dtmi:standard:class:Pressure;2" | "kilopascal" | "dtmi:standard:unit:kilopascal;2" |
| "Pressure" | "dtmi:standard:class:Pressure;2" | "millibar" | "dtmi:standard:unit:millibar;2" |
| "Pressure" | "dtmi:standard:class:Pressure;2" | "millimetresOfMercury" | "dtmi:standard:unit:millimetresOfMercury;2" |
| "Pressure" | "dtmi:standard:class:Pressure;2" | "pascal" | "dtmi:standard:unit:pascal;2" |
| "Pressure" | "dtmi:standard:class:Pressure;2" | "poundPerSquareInch" | "dtmi:standard:unit:poundPerSquareInch;2" |
| "RelativeHumidity" | "dtmi:standard:class:RelativeHumidity;2" | "percent" | "dtmi:standard:unit:percent;2" |
| "RelativeHumidity" | "dtmi:standard:class:RelativeHumidity;2" | "unity" | "dtmi:standard:unit:unity;2" |
| "Resistance" | "dtmi:standard:class:Resistance;2" | "kiloohm" | "dtmi:standard:unit:kiloohm;2" |
| "Resistance" | "dtmi:standard:class:Resistance;2" | "megaohm" | "dtmi:standard:unit:megaohm;2" |
| "Resistance" | "dtmi:standard:class:Resistance;2" | "milliohm" | "dtmi:standard:unit:milliohm;2" |
| "Resistance" | "dtmi:standard:class:Resistance;2" | "ohm" | "dtmi:standard:unit:ohm;2" |
| "SoundPressure" | "dtmi:standard:class:SoundPressure;2" | "bel" | "dtmi:standard:unit:bel;2" |
| "SoundPressure" | "dtmi:standard:class:SoundPressure;2" | "decibel" | "dtmi:standard:unit:decibel;2" |
| "Temperature" | "dtmi:standard:class:Temperature;2" | "degreeCelsius" | "dtmi:standard:unit:degreeCelsius;2" |
| "Temperature" | "dtmi:standard:class:Temperature;2" | "degreeFahrenheit" | "dtmi:standard:unit:degreeFahrenheit;2" |
| "Temperature" | "dtmi:standard:class:Temperature;2" | "kelvin" | "dtmi:standard:unit:kelvin;2" |
| "Thrust" | "dtmi:standard:class:Thrust;2" | "newton" | "dtmi:standard:unit:newton;2" |
| "Thrust" | "dtmi:standard:class:Thrust;2" | "ounce" | "dtmi:standard:unit:ounce;2" |
| "Thrust" | "dtmi:standard:class:Thrust;2" | "pound" | "dtmi:standard:unit:pound;2" |
| "Thrust" | "dtmi:standard:class:Thrust;2" | "ton" | "dtmi:standard:unit:ton;2" |
| "TimeSpan" | "dtmi:standard:class:TimeSpan;2" | "day" | "dtmi:standard:unit:day;2" |
| "TimeSpan" | "dtmi:standard:class:TimeSpan;2" | "hour" | "dtmi:standard:unit:hour;2" |
| "TimeSpan" | "dtmi:standard:class:TimeSpan;2" | "microsecond" | "dtmi:standard:unit:microsecond;2" |
| "TimeSpan" | "dtmi:standard:class:TimeSpan;2" | "millisecond" | "dtmi:standard:unit:millisecond;2" |
| "TimeSpan" | "dtmi:standard:class:TimeSpan;2" | "minute" | "dtmi:standard:unit:minute;2" |
| "TimeSpan" | "dtmi:standard:class:TimeSpan;2" | "nanosecond" | "dtmi:standard:unit:nanosecond;2" |
| "TimeSpan" | "dtmi:standard:class:TimeSpan;2" | "second" | "dtmi:standard:unit:second;2" |
| "TimeSpan" | "dtmi:standard:class:TimeSpan;2" | "year" | "dtmi:standard:unit:year;2" |
| "Torque" | "dtmi:standard:class:Torque;2" | "newtonMetre" | "dtmi:standard:unit:newtonMetre;2" |
| "Velocity" | "dtmi:standard:class:Velocity;2" | "centimetrePerSecond" | "dtmi:standard:unit:centimetrePerSecond;2" |
| "Velocity" | "dtmi:standard:class:Velocity;2" | "kilometrePerHour" | "dtmi:standard:unit:kilometrePerHour;2" |
| "Velocity" | "dtmi:standard:class:Velocity;2" | "kilometrePerSecond" | "dtmi:standard:unit:kilometrePerSecond;2" |
| "Velocity" | "dtmi:standard:class:Velocity;2" | "knot" | "dtmi:standard:unit:knot;2" |
| "Velocity" | "dtmi:standard:class:Velocity;2" | "metrePerHour" | "dtmi:standard:unit:metrePerHour;2" |
| "Velocity" | "dtmi:standard:class:Velocity;2" | "metrePerSecond" | "dtmi:standard:unit:metrePerSecond;2" |
| "Velocity" | "dtmi:standard:class:Velocity;2" | "milePerHour" | "dtmi:standard:unit:milePerHour;2" |
| "Velocity" | "dtmi:standard:class:Velocity;2" | "milePerSecond" | "dtmi:standard:unit:milePerSecond;2" |
| "Voltage" | "dtmi:standard:class:Voltage;2" | "kilovolt" | "dtmi:standard:unit:kilovolt;2" |
| "Voltage" | "dtmi:standard:class:Voltage;2" | "megavolt" | "dtmi:standard:unit:megavolt;2" |
| "Voltage" | "dtmi:standard:class:Voltage;2" | "microvolt" | "dtmi:standard:unit:microvolt;2" |
| "Voltage" | "dtmi:standard:class:Voltage;2" | "millivolt" | "dtmi:standard:unit:millivolt;2" |
| "Voltage" | "dtmi:standard:class:Voltage;2" | "volt" | "dtmi:standard:unit:volt;2" |
| "Volume" | "dtmi:standard:class:Volume;2" | "cubicCentimetre" | "dtmi:standard:unit:cubicCentimetre;2" |
| "Volume" | "dtmi:standard:class:Volume;2" | "cubicFoot" | "dtmi:standard:unit:cubicFoot;2" |
| "Volume" | "dtmi:standard:class:Volume;2" | "cubicInch" | "dtmi:standard:unit:cubicInch;2" |
| "Volume" | "dtmi:standard:class:Volume;2" | "cubicMetre" | "dtmi:standard:unit:cubicMetre;2" |
| "Volume" | "dtmi:standard:class:Volume;2" | "fluidOunce" | "dtmi:standard:unit:fluidOunce;2" |
| "Volume" | "dtmi:standard:class:Volume;2" | "gallon" | "dtmi:standard:unit:gallon;2" |
| "Volume" | "dtmi:standard:class:Volume;2" | "litre" | "dtmi:standard:unit:litre;2" |
| "Volume" | "dtmi:standard:class:Volume;2" | "millilitre" | "dtmi:standard:unit:millilitre;2" |
| "VolumeFlowRate" | "dtmi:standard:class:VolumeFlowRate;2" | "litrePerHour" | "dtmi:standard:unit:litrePerHour;2" |
| "VolumeFlowRate" | "dtmi:standard:class:VolumeFlowRate;2" | "litrePerSecond" | "dtmi:standard:unit:litrePerSecond;2" |
| "VolumeFlowRate" | "dtmi:standard:class:VolumeFlowRate;2" | "millilitrePerHour" | "dtmi:standard:unit:millilitrePerHour;2" |
| "VolumeFlowRate" | "dtmi:standard:class:VolumeFlowRate;2" | "millilitrePerSecond" | "dtmi:standard:unit:millilitrePerSecond;2" |

## Reserved strings

The following table itemizes strings that must not be used in some circumstances that otherwise permit a wide range of string values.
The particular circumstances that disallow these strings are explicitly designated with reference to this "Reserved strings" table.

| Term | DTMI |
| --- | --- |
| "Acceleration" | "dtmi:standard:class:Acceleration;2" |
| "AccelerationUnit" | "dtmi:standard:class:AccelerationUnit;2" |
| "acre" | "dtmi:standard:unit:acre;2" |
| "ampere" | "dtmi:standard:unit:ampere;2" |
| "Angle" | "dtmi:standard:class:Angle;2" |
| "AngleUnit" | "dtmi:standard:class:AngleUnit;2" |
| "AngularAcceleration" | "dtmi:standard:class:AngularAcceleration;2" |
| "AngularAccelerationUnit" | "dtmi:standard:class:AngularAccelerationUnit;2" |
| "AngularVelocity" | "dtmi:standard:class:AngularVelocity;2" |
| "AngularVelocityUnit" | "dtmi:standard:class:AngularVelocityUnit;2" |
| "Area" | "dtmi:standard:class:Area;2" |
| "AreaUnit" | "dtmi:standard:class:AreaUnit;2" |
| "Array" | "dtmi:dtdl:class:Array;2" |
| "astronomicalUnit" | "dtmi:standard:unit:astronomicalUnit;2" |
| "asynchronous" | "dtmi:dtdl:instance:CommandType:asynchronous;2" |
| "atto" | "dtmi:standard:unitprefix:atto;2" |
| "bar" | "dtmi:standard:unit:bar;2" |
| "baseUnit" | "dtmi:dtdl:property:baseUnit;2" |
| "bel" | "dtmi:standard:unit:bel;2" |
| "BinaryPrefix" | "dtmi:standard:class:BinaryPrefix;2" |
| "BinaryUnit" | "dtmi:standard:class:BinaryUnit;2" |
| "bit" | "dtmi:standard:unit:bit;2" |
| "bitPerSecond" | "dtmi:standard:unit:bitPerSecond;2" |
| "boolean" | "dtmi:dtdl:instance:Schema:boolean;2" |
| "Boolean" | "dtmi:dtdl:class:Boolean;2" |
| "bottomUnit" | "dtmi:dtdl:property:bottomUnit;2" |
| "byte" | "dtmi:standard:unit:byte;2" |
| "bytePerSecond" | "dtmi:standard:unit:bytePerSecond;2" |
| "candela" | "dtmi:standard:unit:candela;2" |
| "candelaPerSquareMetre" | "dtmi:standard:unit:candelaPerSquareMetre;2" |
| "Capacitance" | "dtmi:standard:class:Capacitance;2" |
| "CapacitanceUnit" | "dtmi:standard:class:CapacitanceUnit;2" |
| "centi" | "dtmi:standard:unitprefix:centi;2" |
| "centimetre" | "dtmi:standard:unit:centimetre;2" |
| "centimetrePerSecond" | "dtmi:standard:unit:centimetrePerSecond;2" |
| "centimetrePerSecondSquared" | "dtmi:standard:unit:centimetrePerSecondSquared;2" |
| "ChargeUnit" | "dtmi:standard:class:ChargeUnit;2" |
| "Command" | "dtmi:dtdl:class:Command;2" |
| "CommandPayload" | "dtmi:dtdl:class:CommandPayload;2" |
| "commandType" | "dtmi:dtdl:property:commandType;2" |
| "CommandType" | "dtmi:dtdl:class:CommandType;2" |
| "comment" | "dtmi:dtdl:property:comment;2" |
| "ComplexSchema" | "dtmi:dtdl:class:ComplexSchema;2" |
| "Component" | "dtmi:dtdl:class:Component;2" |
| "Content" | "dtmi:dtdl:class:Content;2" |
| "contents" | "dtmi:dtdl:property:contents;2" |
| "coulomb" | "dtmi:standard:unit:coulomb;2" |
| "cubicCentimetre" | "dtmi:standard:unit:cubicCentimetre;2" |
| "cubicFoot" | "dtmi:standard:unit:cubicFoot;2" |
| "cubicInch" | "dtmi:standard:unit:cubicInch;2" |
| "cubicMetre" | "dtmi:standard:unit:cubicMetre;2" |
| "Current" | "dtmi:standard:class:Current;2" |
| "CurrentUnit" | "dtmi:standard:class:CurrentUnit;2" |
| "DataRate" | "dtmi:standard:class:DataRate;2" |
| "DataRateUnit" | "dtmi:standard:class:DataRateUnit;2" |
| "DataSize" | "dtmi:standard:class:DataSize;2" |
| "DataSizeUnit" | "dtmi:standard:class:DataSizeUnit;2" |
| "date" | "dtmi:dtdl:instance:Schema:date;2" |
| "Date" | "dtmi:dtdl:class:Date;2" |
| "dateTime" | "dtmi:dtdl:instance:Schema:dateTime;2" |
| "DateTime" | "dtmi:dtdl:class:DateTime;2" |
| "day" | "dtmi:standard:unit:day;2" |
| "deci" | "dtmi:standard:unitprefix:deci;2" |
| "decibel" | "dtmi:standard:unit:decibel;2" |
| "DecimalPrefix" | "dtmi:standard:class:DecimalPrefix;2" |
| "DecimalUnit" | "dtmi:standard:class:DecimalUnit;2" |
| "degreeCelsius" | "dtmi:standard:unit:degreeCelsius;2" |
| "degreeFahrenheit" | "dtmi:standard:unit:degreeFahrenheit;2" |
| "degreeOfArc" | "dtmi:standard:unit:degreeOfArc;2" |
| "degreePerSecond" | "dtmi:standard:unit:degreePerSecond;2" |
| "deka" | "dtmi:standard:unitprefix:deka;2" |
| "Density" | "dtmi:standard:class:Density;2" |
| "DensityUnit" | "dtmi:standard:class:DensityUnit;2" |
| "description" | "dtmi:dtdl:property:description;2" |
| "displayName" | "dtmi:dtdl:property:displayName;2" |
| "Distance" | "dtmi:standard:class:Distance;2" |
| "double" | "dtmi:dtdl:instance:Schema:double;2" |
| "Double" | "dtmi:dtdl:class:Double;2" |
| "duration" | "dtmi:dtdl:instance:Schema:duration;2" |
| "Duration" | "dtmi:dtdl:class:Duration;2" |
| "ElectricCharge" | "dtmi:standard:class:ElectricCharge;2" |
| "electronvolt" | "dtmi:standard:unit:electronvolt;2" |
| "elementSchema" | "dtmi:dtdl:property:elementSchema;2" |
| "Energy" | "dtmi:standard:class:Energy;2" |
| "EnergyUnit" | "dtmi:standard:class:EnergyUnit;2" |
| "Entity" | "dtmi:dtdl:class:Entity;2" |
| "Enum" | "dtmi:dtdl:class:Enum;2" |
| "enumValue" | "dtmi:dtdl:property:enumValue;2" |
| "EnumValue" | "dtmi:dtdl:class:EnumValue;2" |
| "enumValues" | "dtmi:dtdl:property:enumValues;2" |
| "exa" | "dtmi:standard:unitprefix:exa;2" |
| "exbi" | "dtmi:standard:unitprefix:exbi;2" |
| "exbibit" | "dtmi:standard:unit:exbibit;2" |
| "exbibitPerSecond" | "dtmi:standard:unit:exbibitPerSecond;2" |
| "exbibyte" | "dtmi:standard:unit:exbibyte;2" |
| "exbibytePerSecond" | "dtmi:standard:unit:exbibytePerSecond;2" |
| "exponent" | "dtmi:dtdl:property:exponent;2" |
| "extends" | "dtmi:dtdl:property:extends;2" |
| "farad" | "dtmi:standard:unit:farad;2" |
| "femto" | "dtmi:standard:unitprefix:femto;2" |
| "Field" | "dtmi:dtdl:class:Field;2" |
| "fields" | "dtmi:dtdl:property:fields;2" |
| "float" | "dtmi:dtdl:instance:Schema:float;2" |
| "Float" | "dtmi:dtdl:class:Float;2" |
| "fluidOunce" | "dtmi:standard:unit:fluidOunce;2" |
| "foot" | "dtmi:standard:unit:foot;2" |
| "footcandle" | "dtmi:standard:unit:footcandle;2" |
| "Force" | "dtmi:standard:class:Force;2" |
| "ForceUnit" | "dtmi:standard:class:ForceUnit;2" |
| "Frequency" | "dtmi:standard:class:Frequency;2" |
| "FrequencyUnit" | "dtmi:standard:class:FrequencyUnit;2" |
| "gallon" | "dtmi:standard:unit:gallon;2" |
| "gForce" | "dtmi:standard:unit:gForce;2" |
| "gibi" | "dtmi:standard:unitprefix:gibi;2" |
| "gibibit" | "dtmi:standard:unit:gibibit;2" |
| "gibibitPerSecond" | "dtmi:standard:unit:gibibitPerSecond;2" |
| "gibibyte" | "dtmi:standard:unit:gibibyte;2" |
| "gibibytePerSecond" | "dtmi:standard:unit:gibibytePerSecond;2" |
| "giga" | "dtmi:standard:unitprefix:giga;2" |
| "gigahertz" | "dtmi:standard:unit:gigahertz;2" |
| "gigajoule" | "dtmi:standard:unit:gigajoule;2" |
| "gigawatt" | "dtmi:standard:unit:gigawatt;2" |
| "gram" | "dtmi:standard:unit:gram;2" |
| "gramPerCubicMetre" | "dtmi:standard:unit:gramPerCubicMetre;2" |
| "gramPerHour" | "dtmi:standard:unit:gramPerHour;2" |
| "gramPerSecond" | "dtmi:standard:unit:gramPerSecond;2" |
| "hectare" | "dtmi:standard:unit:hectare;2" |
| "hecto" | "dtmi:standard:unitprefix:hecto;2" |
| "henry" | "dtmi:standard:unit:henry;2" |
| "hertz" | "dtmi:standard:unit:hertz;2" |
| "horsepower" | "dtmi:standard:unit:horsepower;2" |
| "hour" | "dtmi:standard:unit:hour;2" |
| "Humidity" | "dtmi:standard:class:Humidity;2" |
| "Illuminance" | "dtmi:standard:class:Illuminance;2" |
| "IlluminanceUnit" | "dtmi:standard:class:IlluminanceUnit;2" |
| "inch" | "dtmi:standard:unit:inch;2" |
| "inchesOfMercury" | "dtmi:standard:unit:inchesOfMercury;2" |
| "inchesOfWater" | "dtmi:standard:unit:inchesOfWater;2" |
| "Inductance" | "dtmi:standard:class:Inductance;2" |
| "InductanceUnit" | "dtmi:standard:class:InductanceUnit;2" |
| "integer" | "dtmi:dtdl:instance:Schema:integer;2" |
| "Integer" | "dtmi:dtdl:class:Integer;2" |
| "Interface" | "dtmi:dtdl:class:Interface;2" |
| "joule" | "dtmi:standard:unit:joule;2" |
| "kelvin" | "dtmi:standard:unit:kelvin;2" |
| "kibi" | "dtmi:standard:unitprefix:kibi;2" |
| "kibibit" | "dtmi:standard:unit:kibibit;2" |
| "kibibitPerSecond" | "dtmi:standard:unit:kibibitPerSecond;2" |
| "kibibyte" | "dtmi:standard:unit:kibibyte;2" |
| "kibibytePerSecond" | "dtmi:standard:unit:kibibytePerSecond;2" |
| "kilo" | "dtmi:standard:unitprefix:kilo;2" |
| "kilogram" | "dtmi:standard:unit:kilogram;2" |
| "kilogramPerCubicMetre" | "dtmi:standard:unit:kilogramPerCubicMetre;2" |
| "kilogramPerHour" | "dtmi:standard:unit:kilogramPerHour;2" |
| "kilogramPerSecond" | "dtmi:standard:unit:kilogramPerSecond;2" |
| "kilohertz" | "dtmi:standard:unit:kilohertz;2" |
| "kilojoule" | "dtmi:standard:unit:kilojoule;2" |
| "kilometre" | "dtmi:standard:unit:kilometre;2" |
| "kilometrePerHour" | "dtmi:standard:unit:kilometrePerHour;2" |
| "kilometrePerSecond" | "dtmi:standard:unit:kilometrePerSecond;2" |
| "kiloohm" | "dtmi:standard:unit:kiloohm;2" |
| "kilopascal" | "dtmi:standard:unit:kilopascal;2" |
| "kilovolt" | "dtmi:standard:unit:kilovolt;2" |
| "kilowatt" | "dtmi:standard:unit:kilowatt;2" |
| "kilowattHour" | "dtmi:standard:unit:kilowattHour;2" |
| "kilowattHourPerYear" | "dtmi:standard:unit:kilowattHourPerYear;2" |
| "knot" | "dtmi:standard:unit:knot;2" |
| "languageMajorVersion" | "dtmi:dtdl:property:languageMajorVersion;2" |
| "Latitude" | "dtmi:standard:class:Latitude;2" |
| "Length" | "dtmi:standard:class:Length;2" |
| "LengthUnit" | "dtmi:standard:class:LengthUnit;2" |
| "lineString" | "dtmi:standard:schema:geospatial:lineString;2" |
| "litre" | "dtmi:standard:unit:litre;2" |
| "litrePerHour" | "dtmi:standard:unit:litrePerHour;2" |
| "litrePerSecond" | "dtmi:standard:unit:litrePerSecond;2" |
| "long" | "dtmi:dtdl:instance:Schema:long;2" |
| "Long" | "dtmi:dtdl:class:Long;2" |
| "Longitude" | "dtmi:standard:class:Longitude;2" |
| "lumen" | "dtmi:standard:unit:lumen;2" |
| "Luminance" | "dtmi:standard:class:Luminance;2" |
| "LuminanceUnit" | "dtmi:standard:class:LuminanceUnit;2" |
| "Luminosity" | "dtmi:standard:class:Luminosity;2" |
| "LuminousFlux" | "dtmi:standard:class:LuminousFlux;2" |
| "LuminousFluxUnit" | "dtmi:standard:class:LuminousFluxUnit;2" |
| "LuminousIntensity" | "dtmi:standard:class:LuminousIntensity;2" |
| "LuminousIntensityUnit" | "dtmi:standard:class:LuminousIntensityUnit;2" |
| "lux" | "dtmi:standard:unit:lux;2" |
| "MagneticFlux" | "dtmi:standard:class:MagneticFlux;2" |
| "MagneticFluxUnit" | "dtmi:standard:class:MagneticFluxUnit;2" |
| "MagneticInduction" | "dtmi:standard:class:MagneticInduction;2" |
| "MagneticInductionUnit" | "dtmi:standard:class:MagneticInductionUnit;2" |
| "Map" | "dtmi:dtdl:class:Map;2" |
| "mapKey" | "dtmi:dtdl:property:mapKey;2" |
| "MapKey" | "dtmi:dtdl:class:MapKey;2" |
| "mapValue" | "dtmi:dtdl:property:mapValue;2" |
| "MapValue" | "dtmi:dtdl:class:MapValue;2" |
| "Mass" | "dtmi:standard:class:Mass;2" |
| "MassFlowRate" | "dtmi:standard:class:MassFlowRate;2" |
| "MassFlowRateUnit" | "dtmi:standard:class:MassFlowRateUnit;2" |
| "MassUnit" | "dtmi:standard:class:MassUnit;2" |
| "maxMultiplicity" | "dtmi:dtdl:property:maxMultiplicity;2" |
| "maxwell" | "dtmi:standard:unit:maxwell;2" |
| "mebi" | "dtmi:standard:unitprefix:mebi;2" |
| "mebibit" | "dtmi:standard:unit:mebibit;2" |
| "mebibitPerSecond" | "dtmi:standard:unit:mebibitPerSecond;2" |
| "mebibyte" | "dtmi:standard:unit:mebibyte;2" |
| "mebibytePerSecond" | "dtmi:standard:unit:mebibytePerSecond;2" |
| "mega" | "dtmi:standard:unitprefix:mega;2" |
| "megaelectronvolt" | "dtmi:standard:unit:megaelectronvolt;2" |
| "megahertz" | "dtmi:standard:unit:megahertz;2" |
| "megajoule" | "dtmi:standard:unit:megajoule;2" |
| "megaohm" | "dtmi:standard:unit:megaohm;2" |
| "megavolt" | "dtmi:standard:unit:megavolt;2" |
| "megawatt" | "dtmi:standard:unit:megawatt;2" |
| "metre" | "dtmi:standard:unit:metre;2" |
| "metrePerHour" | "dtmi:standard:unit:metrePerHour;2" |
| "metrePerSecond" | "dtmi:standard:unit:metrePerSecond;2" |
| "metrePerSecondSquared" | "dtmi:standard:unit:metrePerSecondSquared;2" |
| "micro" | "dtmi:standard:unitprefix:micro;2" |
| "microampere" | "dtmi:standard:unit:microampere;2" |
| "microfarad" | "dtmi:standard:unit:microfarad;2" |
| "microgram" | "dtmi:standard:unit:microgram;2" |
| "microhenry" | "dtmi:standard:unit:microhenry;2" |
| "micrometre" | "dtmi:standard:unit:micrometre;2" |
| "microsecond" | "dtmi:standard:unit:microsecond;2" |
| "microvolt" | "dtmi:standard:unit:microvolt;2" |
| "microwatt" | "dtmi:standard:unit:microwatt;2" |
| "mile" | "dtmi:standard:unit:mile;2" |
| "milePerHour" | "dtmi:standard:unit:milePerHour;2" |
| "milePerSecond" | "dtmi:standard:unit:milePerSecond;2" |
| "milli" | "dtmi:standard:unitprefix:milli;2" |
| "milliampere" | "dtmi:standard:unit:milliampere;2" |
| "millibar" | "dtmi:standard:unit:millibar;2" |
| "millifarad" | "dtmi:standard:unit:millifarad;2" |
| "milligram" | "dtmi:standard:unit:milligram;2" |
| "millihenry" | "dtmi:standard:unit:millihenry;2" |
| "millilitre" | "dtmi:standard:unit:millilitre;2" |
| "millilitrePerHour" | "dtmi:standard:unit:millilitrePerHour;2" |
| "millilitrePerSecond" | "dtmi:standard:unit:millilitrePerSecond;2" |
| "millimetre" | "dtmi:standard:unit:millimetre;2" |
| "millimetresOfMercury" | "dtmi:standard:unit:millimetresOfMercury;2" |
| "milliohm" | "dtmi:standard:unit:milliohm;2" |
| "millisecond" | "dtmi:standard:unit:millisecond;2" |
| "millivolt" | "dtmi:standard:unit:millivolt;2" |
| "milliwatt" | "dtmi:standard:unit:milliwatt;2" |
| "minMultiplicity" | "dtmi:dtdl:property:minMultiplicity;2" |
| "minute" | "dtmi:standard:unit:minute;2" |
| "minuteOfArc" | "dtmi:standard:unit:minuteOfArc;2" |
| "multiLineString" | "dtmi:standard:schema:geospatial:multiLineString;2" |
| "multiPoint" | "dtmi:standard:schema:geospatial:multiPoint;2" |
| "multiPolygon" | "dtmi:standard:schema:geospatial:multiPolygon;2" |
| "name" | "dtmi:dtdl:property:name;2" |
| "NamedEntity" | "dtmi:dtdl:class:NamedEntity;2" |
| "nano" | "dtmi:standard:unitprefix:nano;2" |
| "nanofarad" | "dtmi:standard:unit:nanofarad;2" |
| "nanometre" | "dtmi:standard:unit:nanometre;2" |
| "nanosecond" | "dtmi:standard:unit:nanosecond;2" |
| "nauticalMile" | "dtmi:standard:unit:nauticalMile;2" |
| "newton" | "dtmi:standard:unit:newton;2" |
| "newtonMetre" | "dtmi:standard:unit:newtonMetre;2" |
| "NumericSchema" | "dtmi:dtdl:class:NumericSchema;2" |
| "Object" | "dtmi:dtdl:class:Object;2" |
| "ohm" | "dtmi:standard:unit:ohm;2" |
| "ounce" | "dtmi:standard:unit:ounce;2" |
| "pascal" | "dtmi:standard:unit:pascal;2" |
| "pebi" | "dtmi:standard:unitprefix:pebi;2" |
| "percent" | "dtmi:standard:unit:percent;2" |
| "peta" | "dtmi:standard:unitprefix:peta;2" |
| "pico" | "dtmi:standard:unitprefix:pico;2" |
| "picofarad" | "dtmi:standard:unit:picofarad;2" |
| "point" | "dtmi:standard:schema:geospatial:point;2" |
| "polygon" | "dtmi:standard:schema:geospatial:polygon;2" |
| "pound" | "dtmi:standard:unit:pound;2" |
| "poundPerSquareInch" | "dtmi:standard:unit:poundPerSquareInch;2" |
| "Power" | "dtmi:standard:class:Power;2" |
| "PowerUnit" | "dtmi:standard:class:PowerUnit;2" |
| "prefix" | "dtmi:dtdl:property:prefix;2" |
| "Pressure" | "dtmi:standard:class:Pressure;2" |
| "PressureUnit" | "dtmi:standard:class:PressureUnit;2" |
| "PrimitiveSchema" | "dtmi:dtdl:class:PrimitiveSchema;2" |
| "properties" | "dtmi:dtdl:property:properties;2" |
| "Property" | "dtmi:dtdl:class:Property;2" |
| "QuantitativeType" | "dtmi:standard:class:QuantitativeType;2" |
| "radian" | "dtmi:standard:unit:radian;2" |
| "radianPerSecond" | "dtmi:standard:unit:radianPerSecond;2" |
| "radianPerSecondSquared" | "dtmi:standard:unit:radianPerSecondSquared;2" |
| "RatioUnit" | "dtmi:standard:class:RatioUnit;2" |
| "Relationship" | "dtmi:dtdl:class:Relationship;2" |
| "RelativeHumidity" | "dtmi:standard:class:RelativeHumidity;2" |
| "request" | "dtmi:dtdl:property:request;2" |
| "Resistance" | "dtmi:standard:class:Resistance;2" |
| "ResistanceUnit" | "dtmi:standard:class:ResistanceUnit;2" |
| "response" | "dtmi:dtdl:property:response;2" |
| "revolutionPerMinute" | "dtmi:standard:unit:revolutionPerMinute;2" |
| "revolutionPerSecond" | "dtmi:standard:unit:revolutionPerSecond;2" |
| "schema" | "dtmi:dtdl:property:schema;2" |
| "Schema" | "dtmi:dtdl:class:Schema;2" |
| "SchemaField" | "dtmi:dtdl:class:SchemaField;2" |
| "schemas" | "dtmi:dtdl:property:schemas;2" |
| "second" | "dtmi:standard:unit:second;2" |
| "secondOfArc" | "dtmi:standard:unit:secondOfArc;2" |
| "SemanticType" | "dtmi:dtdl:class:SemanticType;2" |
| "SemanticUnit" | "dtmi:dtdl:class:SemanticUnit;2" |
| "slug" | "dtmi:standard:unit:slug;2" |
| "SoundPressure" | "dtmi:standard:class:SoundPressure;2" |
| "SoundPressureUnit" | "dtmi:standard:class:SoundPressureUnit;2" |
| "squareCentimetre" | "dtmi:standard:unit:squareCentimetre;2" |
| "squareFoot" | "dtmi:standard:unit:squareFoot;2" |
| "squareInch" | "dtmi:standard:unit:squareInch;2" |
| "squareKilometre" | "dtmi:standard:unit:squareKilometre;2" |
| "squareMetre" | "dtmi:standard:unit:squareMetre;2" |
| "squareMillimetre" | "dtmi:standard:unit:squareMillimetre;2" |
| "string" | "dtmi:dtdl:instance:Schema:string;2" |
| "String" | "dtmi:dtdl:class:String;2" |
| "symbol" | "dtmi:dtdl:property:symbol;2" |
| "synchronous" | "dtmi:dtdl:instance:CommandType:synchronous;2" |
| "target" | "dtmi:dtdl:property:target;2" |
| "tebi" | "dtmi:standard:unitprefix:tebi;2" |
| "tebibit" | "dtmi:standard:unit:tebibit;2" |
| "tebibitPerSecond" | "dtmi:standard:unit:tebibitPerSecond;2" |
| "tebibyte" | "dtmi:standard:unit:tebibyte;2" |
| "tebibytePerSecond" | "dtmi:standard:unit:tebibytePerSecond;2" |
| "Telemetry" | "dtmi:dtdl:class:Telemetry;2" |
| "Temperature" | "dtmi:standard:class:Temperature;2" |
| "TemperatureUnit" | "dtmi:standard:class:TemperatureUnit;2" |
| "TemporalSchema" | "dtmi:dtdl:class:TemporalSchema;2" |
| "tera" | "dtmi:standard:unitprefix:tera;2" |
| "tesla" | "dtmi:standard:unit:tesla;2" |
| "Thrust" | "dtmi:standard:class:Thrust;2" |
| "time" | "dtmi:dtdl:instance:Schema:time;2" |
| "Time" | "dtmi:dtdl:class:Time;2" |
| "TimeSpan" | "dtmi:standard:class:TimeSpan;2" |
| "TimeUnit" | "dtmi:standard:class:TimeUnit;2" |
| "ton" | "dtmi:standard:unit:ton;2" |
| "tonne" | "dtmi:standard:unit:tonne;2" |
| "topUnit" | "dtmi:dtdl:property:topUnit;2" |
| "Torque" | "dtmi:standard:class:Torque;2" |
| "TorqueUnit" | "dtmi:standard:class:TorqueUnit;2" |
| "turn" | "dtmi:standard:unit:turn;2" |
| "unit" | "dtmi:dtdl:property:unit;2" |
| "Unit" | "dtmi:dtdl:class:Unit;2" |
| "UnitAttribute" | "dtmi:dtdl:class:UnitAttribute;2" |
| "Unitless" | "dtmi:standard:class:Unitless;2" |
| "unity" | "dtmi:standard:unit:unity;2" |
| "valueSchema" | "dtmi:dtdl:property:valueSchema;2" |
| "Velocity" | "dtmi:standard:class:Velocity;2" |
| "VelocityUnit" | "dtmi:standard:class:VelocityUnit;2" |
| "volt" | "dtmi:standard:unit:volt;2" |
| "Voltage" | "dtmi:standard:class:Voltage;2" |
| "VoltageUnit" | "dtmi:standard:class:VoltageUnit;2" |
| "Volume" | "dtmi:standard:class:Volume;2" |
| "VolumeFlowRate" | "dtmi:standard:class:VolumeFlowRate;2" |
| "VolumeFlowRateUnit" | "dtmi:standard:class:VolumeFlowRateUnit;2" |
| "VolumeUnit" | "dtmi:standard:class:VolumeUnit;2" |
| "watt" | "dtmi:standard:unit:watt;2" |
| "weber" | "dtmi:standard:unit:weber;2" |
| "writable" | "dtmi:dtdl:property:writable;2" |
| "year" | "dtmi:standard:unit:year;2" |
| "yobi" | "dtmi:standard:unitprefix:yobi;2" |
| "yobibit" | "dtmi:standard:unit:yobibit;2" |
| "yobibitPerSecond" | "dtmi:standard:unit:yobibitPerSecond;2" |
| "yobibyte" | "dtmi:standard:unit:yobibyte;2" |
| "yobibytePerSecond" | "dtmi:standard:unit:yobibytePerSecond;2" |
| "yocto" | "dtmi:standard:unitprefix:yocto;2" |
| "yotta" | "dtmi:standard:unitprefix:yotta;2" |
| "zebi" | "dtmi:standard:unitprefix:zebi;2" |
| "zebibit" | "dtmi:standard:unit:zebibit;2" |
| "zebibitPerSecond" | "dtmi:standard:unit:zebibitPerSecond;2" |
| "zebibyte" | "dtmi:standard:unit:zebibyte;2" |
| "zebibytePerSecond" | "dtmi:standard:unit:zebibytePerSecond;2" |
| "zepto" | "dtmi:standard:unitprefix:zepto;2" |
| "zetta" | "dtmi:standard:unitprefix:zetta;2" |

## Context

Every [DTDL element](#dtdl-element) may have &mdash; and every top-level element **must** have &mdash; a "@context" member.
The following constraints and conditions apply to every DTDL v2 "@context" member:

* Member value [MUST](spec/Requirement-ContextStringOrArrayCentralV2.json) be a string or an array of strings.
* Each included string value [MUST](spec/Requirement-ContextDtmiWithVersionCentralV2.json) conform to the [Digital Twin Model Identifier](#digital-twin-model-identifier) syntax.
* Each included string value other than "dtmi:dtdl:context;2" [SHALL](spec/Completion-ContextDefinedLanguageExtensionCentralV2.json) refer to a defined DTDL language extension.
* Member [MUST](spec/Requirement-TopLevelDtdlContextV2.json) include string value "dtmi:dtdl:context;2" if member is in a top-level element.
* If present, string value "dtmi:dtdl:context;2" [MUST](spec/Requirement-ContextDtdlFirstOrOnlyLessExceptionV2.json) be the only value or the first value in the array, with the following permitted but discouraged exception: If string value "dtmi:iotcentral:context;2" is present in the array, it may precede string value "dtmi:dtdl:context;2"; however, it [SHOULD NOT](spec/Recommendation-ContextDtdlFirstOrOnlyExceptionV2.json) .
* Member [SHOULD NOT](spec/Recommendation-ContextUniqueValuesV2.json) include more than one instance of any given string value.

The *de-versioned* value of a DTMI is the portion of the string value to the left of the semicolon.
For example, the de-versioned value of "dtmi:ex:foo;3" is "dtmi:ex:foo".

When a DTDL element contains a "@context" member, the values of this member are combined with the values of "@context" members of DTDL elements higher in the element hierarchy.
The result of this combination is known as the "active context" for this DTDL element and for any DTDL element that is a structural descendant, down to &mdash; but not including or surpassing &mdash; any element that introduces another "@context" member and thereby generates a new active context.
In other words, the *active context* of a DTDL element is the combination of included string values from any "@context" members of the DTDL element and every structural ancestor of the DTDL element.

The rules for combining "@context" values into an active context are as follows:

* For any de-versioned value that is represented only once among all "@context" values in the current element and all structural ancestors, the corresponding DTMI value is included in the active context.
* For any de-versioned value that is represented more than once among all "@context" values in the current element and all structural ancestors, the corresponding DTMI value from the "@context" member lowest in the hierarchy is included in the active context.
* If any "@context" member includes more than one DTMI with the same de-versioned value, the last of these in the array of member values is used for generating the active context.

For example, in the following model, the active context for the DTDL Inteface and Command elements is the set { "dtmi:dtdl:context;2", "dtmi:ex:foo;2" }.
The active context of the DTDL Relationship element is the set { "dtmi:dtdl:context;2", "dtmi:ex:foo;1" }, because value "dtmi:ex:foo;1" occurs lower in the hierarchy than value "dtmi:ex:foo;2" and later in the array of strings than value "dtmi:ex:foo;3":

```json
{
  "@context": [
      "dtmi:dtdl:context;2",
      "dtmi:ex:foo;2"
  ],
  "@id": "dtmi:ex:anInterface;1",
  "@type": "Interface",
  "contents": [
    {
      "@type": "Command",
      "name": "setDistance"
    },
    {
      "@context": [ "dtmi:ex:foo;3", "dtmi:ex:foo;1" ],
      "@type": "Relationship",
      "name": "proximity"
    }
  ]
}
```

## Digital Twin Model Identifier

A digital twin model identifier (DTMI) is a value that conforms to the following constraints:

* It [MUST](spec/Requirement-DtmiIsStringV2.json) be a string.
* It [MUST](spec/Requirement-DtmiRegexRequiredScalarVersionV2.json) conform to the regular expression `^dtmi:[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?(?::[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?)*;[1-9][0-9]{0,8}$`.
* When used as the value of an "@id" member, it [MUST NOT](spec/Requirement-DtmiReservedPrefixesV2.json) begin with any of the following prefixes:
  * "dtmi:dtdl:"
  * "dtmi:standard:"

> Note:
In other documents, the format above is referred to as a "user DTMI", and the term "DTMI" is used to mean a more general format that includes both *user* and *system* DTMI formats.
DTDL models permit only the above format, so the more general format is not defined herein.

## Glossary

* active context &mdash; the combination of included string values from any "@context" members of the DTDL element and every structural ancestor of the DTDL element (see [Context](#context))
* ancestor &mdash; transitively closes the "parent" relation: A DTDL element *X* is an *ancestor* of DTDL element *Y* if *X* is a parent of *Y* or if *X* is an ancestor of a parent of *Y*. (see [DTDL element](#dtdl-element))
* ancestor, structural &mdash; see "structural ancestor"
* array &mdash; a bracket-enclosed sequence of comma-separated JSON values (see [Terminology](#terminology))
* array value &mdash; each JSON value in an array (see [Terminology](#terminology))
* boolean &mdash; either of the literals `true` or `false` (see [Terminology](#terminology))
* child &mdash; Each DTDL element that is included or referentially included in a member is known as a *child* of a DTDL element that has the member. (see [DTDL element](#dtdl-element))
* child, structural &mdash; see "structural child"
* co-typed, informally &mdash; see "informally co-typed"
* complete &mdash; A model is *complete* if it is neither referentially incomplete nor contextually incomplete, such that all dependent references and all specified contexts have available definitions. (see [Model completeness](#model-completeness))
* context, active &mdash; see "active context"
* contextually incomplete &mdash; A model is *contextually incomplete* if it specifies an extension context that has no available definition. (see [Model completeness](#model-completeness))
* de-versioned DTMI &mdash; The *de-versioned* value of a DTMI is the portion of the string value to the left of the semicolon. (see [Context](#context))
* dependent reference &mdash; a DTMI string included in a member in place of a DTDL element (see [Model completeness](#model-completeness))
* descendant &mdash; transitively closes the "child" relation: A DTDL element *Y* is a *descendant* of DTDL element *X* if *Y* is a child of *X* or if *Y* is a child of a descendant of *X*. (see [DTDL element](#dtdl-element))
* descendant, structural &mdash; see "structural descendant"
* DTDL element &mdash; a JSON object that conforms to the definition of a DTDL element (see [DTDL element](#dtdl-element))
* DTMI &mdash; digital twin model identifier (see [Digital Twin Model Identifier](#digital-twin-model-identifier))
* DTMI, de-versioned &mdash; see "de-versioned DTMI"
* include &mdash; A member *includes* JSON value *X* if either the member's value is *X*, or the member's value is an array and *X* is a value in the array. When a member includes a representational literal, the member is also considered to include the literal value itself. (see [Terminology](#terminology), [Representational literal](#representational-literal))
* include, referentially &mdash; see "referentially include"
* incomplete, contextually &mdash; see "contextually incomplete"
* incomplete, referentially &mdash; see "referentially incomplete"
* informally co-typed &mdash; An element is considered to be *informally co-typed* if it has an "@type" member that includes a value that is neither required nor listed in the Semantic types table nor defined by an extension referenced in the active context. An element that is informally co-typed is permitted to have additional members beyond those explicitly defined for the element type. (see [DTDL element](#dtdl-element))
* integer &mdash; an integral number expressible in 4 bytes (see [Terminology](#terminology))
* JSON value &mdash; an object OR array OR string OR number OR boolean OR null (see [Terminology](#terminology))
* language map &mdash; A localizable string object not in an array is a *language map* object; it has members with names that are language codes. (see [Localizable string](#localizable-string))
* language-tagged value &mdash; An object in a localizable string array is a *language-tagged value* object; it has a required "@value" member and an optional "@language" member. (see [Localizable string](#localizable-string))
* localizable string &mdash; a JSON value that can express a semantic string in multiple languages using one of three structural forms: a string, an array of strings and language-tagged value objects, or a language map object (see [Localizable string](#localizable-string))
* member &mdash; a colon-separated ordered pair of a string and a JSON value (see [Terminology](#terminology))
* member name &mdash; the string that is the first component in a member's ordered pair (see [Terminology](#terminology))
* member value &mdash; the JSON value that is the second component in a member's ordered pair (see [Terminology](#terminology))
* model &mdash; a collection of zero or more JSON documents (see [Terminology](#terminology))
* name, member &mdash; see "member name"
* non-dependent reference &mdash; a DTMI string included in a member that only takes DTMI string values (see [Model completeness](#model-completeness))
* null &mdash; the literal `null` (see [Terminology](#terminology))
* number &mdash; a signed decimal numeric value (see [Terminology](#terminology))
* object &mdash; a brace-enclosed sequence of comma-separated members (see [Terminology](#terminology))
* parent &mdash; A DTDL element is known as a *parent* of every DTDL element that is included or referentially included in one of its members. (see [DTDL element](#dtdl-element))
* parent, structural &mdash; see "structural parent"
* partition &mdash; a specific collection of DTDL elements (see [DTDL element](#dtdl-element))
* path from X to Y &mdash; sequence of members that can be followed via inclusion or referential inclusion from DTDL element *X* to DTDL element *Y* (see [DTDL element](#dtdl-element))
* reference, dependent &mdash; see "dependent reference"
* reference, non-dependent &mdash; see "non-dependent reference"
* referenceable element &mdash; an Interface, a top-level element, or an element in the same partition as the element that references it (see [DTDL element](#dtdl-element))
* referentially include &mdash; When a member includes a dependent reference, the DTDL element whose "@id" member has a matching value is said to be *referentially included* in the member that includes the dependent reference. A DTDL element type can have a member that is specified to expand the set of elements that are referentially included in other members. (see [Model completeness](#model-completeness), [DTDL element](#dtdl-element))
* referentially incomplete &mdash; When any DTDL element in a model has a member that includes a dependent reference, the model is *referentially incomplete* if it does not also contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference. (see [Model completeness](#model-completeness))
* representational literal &mdash; a JSON value that represents a literal value in the form of a bare literal, an untyped value object, or a typed value object (see [Representational literal](#representational-literal))
* string &mdash; a double-quoted sequence of Unicode characters (see [Terminology](#terminology))
* string, localizable &mdash; see "localizable string"
* structural ancestor &mdash; transitively closes the "structural parent" relation: A DTDL element *X* is a *structural ancestor* of DTDL element *Y* if *X* is a structural parent of *Y* or if *X* is a structural ancestor of a structural parent of *Y*. (see [DTDL element](#dtdl-element))
* structural child &mdash; Each DTDL element that is included in a member is known as a *structural child* of the DTDL element that has the member. (see [DTDL element](#dtdl-element))
* structural descendant &mdash; transitively closes the "structural child" relation: A DTDL element *Y* is a *structural descendant* of DTDL element *X* if *Y* is a structural child of *X* or if *Y* is a structural child of a structural descendant of *X*. (see [DTDL element](#dtdl-element))
* structural parent &mdash; A DTDL element is known as the *structural parent* of every DTDL element that is included in one of its members. (see [DTDL element](#dtdl-element))
* top-level element &mdash; synonym for "top-level object" if the object is a conformant DTDL element (see [Terminology](#terminology))
* top-level object &mdash; an object closest to the root of a JSON document (see [Terminology](#terminology))
* value, array &mdash; see "array value"
* value, language-tagged &mdash; see "language-tagged value"
* value, member &mdash; see "member value"
* vaue, JSON &mdash; see "JSON value"

