# DTDL Language Specification

**Version 4**

## Table of Contents

* [Introduction](#introduction)
* [Terminology](#terminology)
* [Model completeness](#model-completeness)
* [DTDL element](#dtdl-element)
* [Limits and exclusions](#limits-and-exclusions)
* [Representational literal](#representational-literal)
* [Localizable string](#localizable-string)
* [Standard schemas](#standard-schemas)
* [Reserved strings](#reserved-strings)
* [Context](#context)
* [Digital Twin Model Identifier](#digital-twin-model-identifier)
* [Glossary](#glossary)

## Introduction

The document [Digital Twins Definition Language (DTDL)](./DTDL.v4.md) &mdash; herein referred to as the *DTDL Reference* &mdash; is a description of the DTDL language in a manner that is explanatory and illustrative.
In contrast, the present document is a strict specification of the DTDL language in a manner that is comprehensive and normative.
The present document is not intended to teach the DTDL language but rather to precisely delineate the language.
Unlike the DTDL Reference, the present document can be employed to assess whether a given collection of documents constitutes a valid DTDL model.
However, the format and content of this document are not conducive to learning the language or to understanding how to apply it to a modeling problem.

DTDL is a modeling language.
It is based on [JSON-LD](https://json-ld.org/spec/FCGS/json-ld/20180607/), which is a means for encoding [RDF](https://www.w3.org/RDF/) statements in [JSON](https://www.json.org/json-en.html) syntax.
DTDL can be understood and validated without knowing RDF or JSON-LD, and the present document specifies DTDL without reference to either of these other standards.
DTDL cannot be readily understood without a basic knowledge of JSON; however, JSON syntax is fortunately straightforward, in marked contrast to the size, complexity, and subtlety of JSON-LD.

Within this document, the key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED",  "MAY", and "OPTIONAL" are to be interpreted as described in IETF [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) as updated by [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174), per [BCP 14](https://www.rfc-editor.org/info/bcp14).
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
See IETF [RFC 8259](https://www.rfc-editor.org/rfc/rfc8259) for more details on JSON syntax.
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

The [DTDL Reference](./DTDL.v4.md) uses JSON-LD terminology, which has some unfortunate differences from the JSON terminology used herein.
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
    "@context": "dtmi:dtdl:context;4",
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
    "@context": "dtmi:dtdl:context;4",
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
  "@context": "dtmi:dtdl:context;4",
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
    "dtmi:dtdl:context;4",
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

For DTDL version 4 models, in the absence of considerations that motivate a different policy, it is RECOMMENDED that contextually incomplete models be rejected by default.

When a member includes a dependent reference, the DTDL element whose "@id" member has a matching value is said to be *referentially included* in the member that includes the dependent reference.
If no referentially included DTDL element is present in the model, the model is referentially incomplete.

In the sequel, when stating the requirement for a referentially included element to be present, the key word "SHALL" is used to indicate that this is needed for completeness.
This contrasts with the key words "MUST" and "REQUIRED", which are used to indicate requirements for validity rather than completeness.
The key word "SHALL" is also used when stating requirements that may be unverifiable in contextually incomplete models.

## DTDL element

A model is a forest of DTDL elements, each of which is a JSON object.
The root of each tree is known as a top-level element.
Each top-level element is a JSON object that is either the root of a JSON document or a value in a JSON array that is the root of a JSON document.
Every JSON document in a model [MUST](spec/Requirement-RootArrayOrObjV4.json) have a root value that is either an object or an array of objects.

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

Except as specifically noted otherwise (see [Limits and exclusions](#limits-and-exclusions)), a DTDL element [MUST NOT](spec/Requirement-NoPathToSelfV4.json) have a path to itself, such as the path from "dtmi:example:selfReferencingInterface;1" to "dtmi:example:selfReferencingInterface;1" in the following invalid example:

```json
{
  "@context": "dtmi:dtdl:context;4",
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
  "@context": "dtmi:dtdl:context;4",
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

* [MUST](spec/Requirement-TopLevelRootableV4.json) conform to the definition of DTDL element [Interface](#interface).
* [MUST](spec/Requirement-TopLevelDtdlContextOrLimitlessV4.json) have a "@context" member that includes string value "dtmi:dtdl:context;4" or "dtmi:dtdl:context;4#limitless".

A DTDL element is *referenceable* by another if it is an Interface, a top-level element, or an element in the same partition as the element that references it.
Stated more precisely:

* Every top-level element is referenceable by every other DTDL element in the model.
* Every Interface element is referenceable by every other DTDL element in the model.
* Every element that is not top-level and not an Interface is referenceable only by other DTDL elements in the same partition.

A member of a DTDL element [MUST NOT](spec/Requirement-DependencyReferenceableV4.json) include a dependent reference to any DTDL element that is not referenceable by the element that has the member.

The following subsections define elements that may be present in a DTDL model.
Each element specifies the members it must/may have and constraints on each member.
For optional members, the constraints apply only if the member is present in the element.

> Note that some members may be optional in general but required under certain circumstances.
Such circumstances are indicated in the member's constraints.

[Array](#array) | [Command](#command) | [CommandRequest](#commandrequest) | [CommandResponse](#commandresponse) | [Component](#component) | [Enum](#enum) | [EnumValue](#enumvalue) | [Field](#field) | [Interface](#interface) | [Map](#map) | [MapKey](#mapkey) | [MapValue](#mapvalue) | [Object](#object) | [Property](#property) | [Relationship](#relationship) | [Telemetry](#telemetry)

### Array

Example:

```json
{
  "@context": "dtmi:dtdl:context;4",
  "@id": "dtmi:example:delta_epsilon;1",
  "@type": "Interface",
  "schemas": {
    "@id": "dtmi:example:delta_delta;1",
    "@type": "Array",
    "elementSchema": "boolean"
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassArrayRequiredPropertiesV4.json):

* @type
  * Value [MUST](spec/Requirement-ClassArrayTypeStringOrArrayV4.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassArrayTypeIncludesMaterialV4.json) include either string "Array" or string "dtmi:dtdl:class:Array;4".
  * [SHOULD NOT](spec/Recommendation-ClassArrayTypeIncludesTermAndDtmiV4.json) include both "Array" and "dtmi:dtdl:class:Array;4".
  * [SHOULD NOT](spec/Recommendation-ClassArrayTypeDuplicatesMaterialV4.json) include more than one instance of either "Array" or "dtmi:dtdl:class:Array;4".
  * String "Array" is [RECOMMENDED](spec/Recommendation-ClassArrayTypePreferTermToDtmiV4.json) over string "dtmi:dtdl:class:Array;4".
  * [SHALL NOT](spec/Completion-ClassArrayTypeIncludesIrrelevantDtmiOrTermV4.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "Array" or "dtmi:dtdl:class:Array;4", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassArrayTypeIncludesInvalidDtmiV4.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MUST NOT](spec/Requirement-ClassArrayTypeIncludesNotDtmiNorTermV4.json) include any string that contains ":" but does not start with "dtmi:".
  * [SHALL NOT](spec/Completion-ClassArrayTypeIncludesUndefinedTermV4.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
* elementSchema
  * Value [MUST](spec/Requirement-ClassArrayPropertyElementSchemaElementV4.json) be a DTDL element, a dependent reference to a DTDL element, a string from one of the rows in a [Standard schemas](#standard-schemas) table, a string defined by an extension referenced in the active context, or an array containing exactly one DTDL element, dependent reference to a DTDL element, string from one of the rows in a Standard schemas table, or string defined by an extension referenced in the active context.
  * If the value is a dependent reference or an array containing a dependent reference, the model [SHALL](spec/Completion-ClassArrayPropertyElementSchemaDependentReferenceV4.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * If present, an included or referentially included DTDL element [MUST](spec/Requirement-ClassArrayPropertyElementSchemaTypeConformanceV4.json) conform to the definition of DTDL element [Array](#array) or [Enum](#enum) or [Map](#map) or [Object](#object) or DTDLv3 element [Array](../v3/DTDL.Specification.v3.md#array) or [Enum](../v3/DTDL.Specification.v3.md#enum) or [Map](../v3/DTDL.Specification.v3.md#map) or [Object](../v3/DTDL.Specification.v3.md#object) or DTDLv2 element [Array](../v2/DTDL.Specification.v2.md#array) or [Enum](../v2/DTDL.Specification.v2.md#enum) or [Map](../v2/DTDL.Specification.v2.md#map) or [Object](../v2/DTDL.Specification.v2.md#object).
  * If a string from one of the rows in a Standard schemas table is included, a string from column "Term" is [RECOMMENDED](spec/Recommendation-ClassArrayPropertyElementSchemaPreferTermToDtmiV4.json) over a string from column "DTMI".
  * Considered with other DTDL elements, value is subject to any relevant restrictions in [Limits and exclusions](#limits-and-exclusions).
  * Member name [MAY](spec/Allowance-ClassArrayPropertyElementSchemaDtmiV4.json) be expressed as "dtmi:dtdl:property:elementSchema;4" instead of "elementSchema", but "elementSchema" is [RECOMMENDED](spec/Recommendation-ClassArrayPropertyElementSchemaTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassArrayPropertyElementSchemaTermAndDtmiV4.json) be expressed as both "elementSchema" and "dtmi:dtdl:property:elementSchema;4".

The following members are [OPTIONAL](spec/Allowance-ClassArrayOptionalPropertiesV4.json) unless otherwise noted:

* @context
  * [MUST](spec/Requirement-ClassArrayContextConformsV4.json) conform to the specified [context](#context) rules.
* @id
  * [REQUIRED](spec/Requirement-ClassArrayIdRequiredV4.json) when the Array element is included in Interface member "schemas".
  * Value [MUST](spec/Requirement-ClassArrayIdIsDtmiV4.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassArrayIdNotArrayV4.json) be an array.
  * Value [MUST](spec/Requirement-ClassArrayIdDuplicateV4.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassArrayPropertyCommentStringV4.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassArrayPropertyCommentStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassArrayPropertyCommentDtmiV4.json) be expressed as "dtmi:dtdl:property:comment;4" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassArrayPropertyCommentTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassArrayPropertyCommentTermAndDtmiV4.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;4".
* description
  * Value [MUST](spec/Requirement-ClassArrayPropertyDescriptionLangStringV4.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassArrayPropertyDescriptionStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassArrayPropertyDescriptionDtmiV4.json) be expressed as "dtmi:dtdl:property:description;4" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassArrayPropertyDescriptionTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassArrayPropertyDescriptionTermAndDtmiV4.json) be expressed as both "description" and "dtmi:dtdl:property:description;4".
* displayName
  * Value [MUST](spec/Requirement-ClassArrayPropertyDisplayNameLangStringV4.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassArrayPropertyDisplayNameStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassArrayPropertyDisplayNameDtmiV4.json) be expressed as "dtmi:dtdl:property:displayName;4" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassArrayPropertyDisplayNameTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassArrayPropertyDisplayNameTermAndDtmiV4.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;4".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* Members with names starting with "@" other than "@context", "@id", and "@type" [MUST NOT](spec/Requirement-ClassArrayInvalidKeywordsV4.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [SHALL NOT](spec/Completion-ClassArrayPropertyIrrelevantDtmiOrTermV4.json) be present if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "elementSchema", "dtmi:dtdl:property:comment;4", "dtmi:dtdl:property:description;4", "dtmi:dtdl:property:displayName;4", "dtmi:dtdl:property:elementSchema;4".
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassArrayPropertyFormallyIrrelevantDtmiOrTermV4.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "elementSchema", "dtmi:dtdl:property:comment;4", "dtmi:dtdl:property:description;4", "dtmi:dtdl:property:displayName;4", "dtmi:dtdl:property:elementSchema;4".
* A member [MUST NOT](spec/Requirement-ClassArrayPropertyInvalidDtmiV4.json) be present if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassArrayPropertyNotDtmiNorTermV4.json) be present if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [SHALL NOT](spec/Completion-ClassArrayPropertyUndefinedTermV4.json) be present if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassArrayPropertyFormallyUndefinedTermV4.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### Command

Example:

```json
{
  "@context": "dtmi:dtdl:context;4",
  "@id": "dtmi:example:delta_eta;1",
  "@type": "Interface",
  "contents": {
    "@type": "Command",
    "name": "delta_zeta"
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassCommandRequiredPropertiesV4.json):

* @type
  * Value [MUST](spec/Requirement-ClassCommandTypeStringOrArrayV4.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassCommandTypeIncludesMaterialV4.json) include either string "Command" or string "dtmi:dtdl:class:Command;4".
  * [SHOULD NOT](spec/Recommendation-ClassCommandTypeIncludesTermAndDtmiV4.json) include both "Command" and "dtmi:dtdl:class:Command;4".
  * [SHOULD NOT](spec/Recommendation-ClassCommandTypeDuplicatesMaterialV4.json) include more than one instance of either "Command" or "dtmi:dtdl:class:Command;4".
  * String "Command" is [RECOMMENDED](spec/Recommendation-ClassCommandTypePreferTermToDtmiV4.json) over string "dtmi:dtdl:class:Command;4".
  * [SHALL NOT](spec/Completion-ClassCommandTypeIncludesIrrelevantDtmiOrTermV4.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "Command" or "dtmi:dtdl:class:Command;4", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassCommandTypeIncludesInvalidDtmiV4.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MUST NOT](spec/Requirement-ClassCommandTypeIncludesNotDtmiNorTermV4.json) include any string that contains ":" but does not start with "dtmi:".
  * [SHALL NOT](spec/Completion-ClassCommandTypeIncludesUndefinedTermV4.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
* name
  * Value [MUST](spec/Requirement-ClassCommandPropertyNameStringV4.json) be a [representational string](#representational-string) or an array containing exactly one representational string.
  * String value [MUST NOT](spec/Requirement-ClassCommandPropertyNameStringLengthV4.json) be more than 512 characters in length.
  * String value [MUST](spec/Requirement-ClassCommandPropertyNamePatternV4.json) match regular expression `^[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?$`.
  * String value [MUST](spec/Requirement-ClassCommandPropertyNameUniqueAmongInterfaceContentsV4.json) be unique among the included values of "name" members of all elements included or referentially included in the "contents" member of any parent [Interface](#interface) element.
  * Member name [MAY](spec/Allowance-ClassCommandPropertyNameDtmiV4.json) be expressed as "dtmi:dtdl:property:name;4" instead of "name", but "name" is [RECOMMENDED](spec/Recommendation-ClassCommandPropertyNameTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandPropertyNameTermAndDtmiV4.json) be expressed as both "name" and "dtmi:dtdl:property:name;4".

The following members are [OPTIONAL](spec/Allowance-ClassCommandOptionalPropertiesV4.json):

* @context
  * [MUST](spec/Requirement-ClassCommandContextConformsV4.json) conform to the specified [context](#context) rules.
* @id
  * Value [MUST](spec/Requirement-ClassCommandIdIsDtmiV4.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassCommandIdNotArrayV4.json) be an array.
  * Value [MUST](spec/Requirement-ClassCommandIdDuplicateV4.json) be unique among the values of all "@id" members of all elements in the model.
* commandType
  * [SHOULD NOT](spec/Recommendation-ClassCommandPropertyCommandTypeDeprecatedV4.json) be present in the element; this member is deprecated.
  * Value [MUST](spec/Requirement-ClassCommandPropertyCommandTypeSpecificValuesV4.json) be "asynchronous", "synchronous", "dtmi:dtdl:instance:CommandType:asynchronous;4", "dtmi:dtdl:instance:CommandType:synchronous;4", or an array containing no more than one of these string values.
  * Member name [MAY](spec/Allowance-ClassCommandPropertyCommandTypeDtmiV4.json) be expressed as "dtmi:dtdl:property:commandType;4" instead of "commandType", but "commandType" is [RECOMMENDED](spec/Recommendation-ClassCommandPropertyCommandTypeTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandPropertyCommandTypeTermAndDtmiV4.json) be expressed as both "commandType" and "dtmi:dtdl:property:commandType;4".
* comment
  * Value [MUST](spec/Requirement-ClassCommandPropertyCommentStringV4.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassCommandPropertyCommentStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassCommandPropertyCommentDtmiV4.json) be expressed as "dtmi:dtdl:property:comment;4" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassCommandPropertyCommentTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandPropertyCommentTermAndDtmiV4.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;4".
* description
  * Value [MUST](spec/Requirement-ClassCommandPropertyDescriptionLangStringV4.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassCommandPropertyDescriptionStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassCommandPropertyDescriptionDtmiV4.json) be expressed as "dtmi:dtdl:property:description;4" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassCommandPropertyDescriptionTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandPropertyDescriptionTermAndDtmiV4.json) be expressed as both "description" and "dtmi:dtdl:property:description;4".
* displayName
  * Value [MUST](spec/Requirement-ClassCommandPropertyDisplayNameLangStringV4.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassCommandPropertyDisplayNameStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassCommandPropertyDisplayNameDtmiV4.json) be expressed as "dtmi:dtdl:property:displayName;4" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassCommandPropertyDisplayNameTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandPropertyDisplayNameTermAndDtmiV4.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;4".
* request
  * Value [MUST](spec/Requirement-ClassCommandPropertyRequestElementV4.json) be a DTDL element, a dependent reference to DTDL element, or an array containing no more than one DTDL element or dependent reference to a DTDL element.
  * If the value is a dependent reference or an array containing a dependent reference, the model [SHALL](spec/Completion-ClassCommandPropertyRequestDependentReferenceV4.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * If present, included or referentially included DTDL element [MUST](spec/Requirement-ClassCommandPropertyRequestTypeConformanceV4.json) conform to the definition of DTDL element [CommandRequest](#commandrequest).
  * Member name [MAY](spec/Allowance-ClassCommandPropertyRequestDtmiV4.json) be expressed as "dtmi:dtdl:property:request;4" instead of "request", but "request" is [RECOMMENDED](spec/Recommendation-ClassCommandPropertyRequestTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandPropertyRequestTermAndDtmiV4.json) be expressed as both "request" and "dtmi:dtdl:property:request;4".
* response
  * Value [MUST](spec/Requirement-ClassCommandPropertyResponseElementV4.json) be a DTDL element, a dependent reference to DTDL element, or an array containing no more than one DTDL element or dependent reference to a DTDL element.
  * If the value is a dependent reference or an array containing a dependent reference, the model [SHALL](spec/Completion-ClassCommandPropertyResponseDependentReferenceV4.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * If present, included or referentially included DTDL element [MUST](spec/Requirement-ClassCommandPropertyResponseTypeConformanceV4.json) conform to the definition of DTDL element [CommandResponse](#commandresponse).
  * Member name [MAY](spec/Allowance-ClassCommandPropertyResponseDtmiV4.json) be expressed as "dtmi:dtdl:property:response;4" instead of "response", but "response" is [RECOMMENDED](spec/Recommendation-ClassCommandPropertyResponseTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandPropertyResponseTermAndDtmiV4.json) be expressed as both "response" and "dtmi:dtdl:property:response;4".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* Members with names starting with "@" other than "@context", "@id", and "@type" [MUST NOT](spec/Requirement-ClassCommandInvalidKeywordsV4.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [SHALL NOT](spec/Completion-ClassCommandPropertyIrrelevantDtmiOrTermV4.json) be present if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "commandType", "comment", "description", "displayName", "name", "request", "response", "dtmi:dtdl:property:commandType;4", "dtmi:dtdl:property:comment;4", "dtmi:dtdl:property:description;4", "dtmi:dtdl:property:displayName;4", "dtmi:dtdl:property:name;4", "dtmi:dtdl:property:request;4", "dtmi:dtdl:property:response;4".
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassCommandPropertyFormallyIrrelevantDtmiOrTermV4.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "commandType", "comment", "description", "displayName", "name", "request", "response", "dtmi:dtdl:property:commandType;4", "dtmi:dtdl:property:comment;4", "dtmi:dtdl:property:description;4", "dtmi:dtdl:property:displayName;4", "dtmi:dtdl:property:name;4", "dtmi:dtdl:property:request;4", "dtmi:dtdl:property:response;4".
* A member [MUST NOT](spec/Requirement-ClassCommandPropertyInvalidDtmiV4.json) be present if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassCommandPropertyNotDtmiNorTermV4.json) be present if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [SHALL NOT](spec/Completion-ClassCommandPropertyUndefinedTermV4.json) be present if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassCommandPropertyFormallyUndefinedTermV4.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### CommandRequest

Example:

```json
{
  "@context": "dtmi:dtdl:context;4",
  "@id": "dtmi:example:delta_mu;1",
  "@type": "Interface",
  "contents": {
    "@type": "Command",
    "name": "delta_lambda",
    "request": {
      "name": "delta_kappa",
      "schema": "byte"
    }
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassCommandRequestRequiredPropertiesV4.json):

* name
  * Value [MUST](spec/Requirement-ClassCommandRequestPropertyNameStringV4.json) be a [representational string](#representational-string) or an array containing exactly one representational string.
  * String value [MUST NOT](spec/Requirement-ClassCommandRequestPropertyNameStringLengthV4.json) be more than 512 characters in length.
  * String value [MUST](spec/Requirement-ClassCommandRequestPropertyNamePatternV4.json) match regular expression `^[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?$`.
  * Member name [MAY](spec/Allowance-ClassCommandRequestPropertyNameDtmiV4.json) be expressed as "dtmi:dtdl:property:name;4" instead of "name", but "name" is [RECOMMENDED](spec/Recommendation-ClassCommandRequestPropertyNameTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandRequestPropertyNameTermAndDtmiV4.json) be expressed as both "name" and "dtmi:dtdl:property:name;4".
* schema
  * Value [MUST](spec/Requirement-ClassCommandRequestPropertySchemaElementV4.json) be a DTDL element, a dependent reference to a DTDL element, a string from one of the rows in a [Standard schemas](#standard-schemas) table, a string defined by an extension referenced in the active context, or an array containing exactly one DTDL element, dependent reference to a DTDL element, string from one of the rows in a Standard schemas table, or string defined by an extension referenced in the active context.
  * If the value is a dependent reference or an array containing a dependent reference, the model [SHALL](spec/Completion-ClassCommandRequestPropertySchemaDependentReferenceV4.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * If present, an included or referentially included DTDL element [MUST](spec/Requirement-ClassCommandRequestPropertySchemaTypeConformanceV4.json) conform to the definition of DTDL element [Array](#array) or [Enum](#enum) or [Map](#map) or [Object](#object) or DTDLv3 element [Array](../v3/DTDL.Specification.v3.md#array) or [Enum](../v3/DTDL.Specification.v3.md#enum) or [Map](../v3/DTDL.Specification.v3.md#map) or [Object](../v3/DTDL.Specification.v3.md#object) or DTDLv2 element [Array](../v2/DTDL.Specification.v2.md#array) or [Enum](../v2/DTDL.Specification.v2.md#enum) or [Map](../v2/DTDL.Specification.v2.md#map) or [Object](../v2/DTDL.Specification.v2.md#object).
  * If a string from one of the rows in a Standard schemas table is included, a string from column "Term" is [RECOMMENDED](spec/Recommendation-ClassCommandRequestPropertySchemaPreferTermToDtmiV4.json) over a string from column "DTMI".
  * Member name [MAY](spec/Allowance-ClassCommandRequestPropertySchemaDtmiV4.json) be expressed as "dtmi:dtdl:property:schema;4" instead of "schema", but "schema" is [RECOMMENDED](spec/Recommendation-ClassCommandRequestPropertySchemaTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandRequestPropertySchemaTermAndDtmiV4.json) be expressed as both "schema" and "dtmi:dtdl:property:schema;4".

The following members are [OPTIONAL](spec/Allowance-ClassCommandRequestOptionalPropertiesV4.json):

* @context
  * [MUST](spec/Requirement-ClassCommandRequestContextConformsV4.json) conform to the specified [context](#context) rules.
* @type
  * Value [MUST](spec/Requirement-ClassCommandRequestTypeStringOrArrayV4.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassCommandRequestTypeIncludesMaterialV4.json) include either string "CommandRequest" or string "dtmi:dtdl:class:CommandRequest;4".
  * [SHOULD NOT](spec/Recommendation-ClassCommandRequestTypeIncludesTermAndDtmiV4.json) include both "CommandRequest" and "dtmi:dtdl:class:CommandRequest;4".
  * [SHOULD NOT](spec/Recommendation-ClassCommandRequestTypeDuplicatesMaterialV4.json) include more than one instance of either "CommandRequest" or "dtmi:dtdl:class:CommandRequest;4".
  * String "CommandRequest" is [RECOMMENDED](spec/Recommendation-ClassCommandRequestTypePreferTermToDtmiV4.json) over string "dtmi:dtdl:class:CommandRequest;4".
  * [SHALL NOT](spec/Completion-ClassCommandRequestTypeIncludesIrrelevantDtmiOrTermV4.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "CommandRequest" or "dtmi:dtdl:class:CommandRequest;4", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassCommandRequestTypeIncludesInvalidDtmiV4.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MUST NOT](spec/Requirement-ClassCommandRequestTypeIncludesNotDtmiNorTermV4.json) include any string that contains ":" but does not start with "dtmi:".
  * [SHALL NOT](spec/Completion-ClassCommandRequestTypeIncludesUndefinedTermV4.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
* @id
  * Value [MUST](spec/Requirement-ClassCommandRequestIdIsDtmiV4.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassCommandRequestIdNotArrayV4.json) be an array.
  * Value [MUST](spec/Requirement-ClassCommandRequestIdDuplicateV4.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassCommandRequestPropertyCommentStringV4.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassCommandRequestPropertyCommentStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassCommandRequestPropertyCommentDtmiV4.json) be expressed as "dtmi:dtdl:property:comment;4" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassCommandRequestPropertyCommentTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandRequestPropertyCommentTermAndDtmiV4.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;4".
* description
  * Value [MUST](spec/Requirement-ClassCommandRequestPropertyDescriptionLangStringV4.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassCommandRequestPropertyDescriptionStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassCommandRequestPropertyDescriptionDtmiV4.json) be expressed as "dtmi:dtdl:property:description;4" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassCommandRequestPropertyDescriptionTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandRequestPropertyDescriptionTermAndDtmiV4.json) be expressed as both "description" and "dtmi:dtdl:property:description;4".
* displayName
  * Value [MUST](spec/Requirement-ClassCommandRequestPropertyDisplayNameLangStringV4.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassCommandRequestPropertyDisplayNameStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassCommandRequestPropertyDisplayNameDtmiV4.json) be expressed as "dtmi:dtdl:property:displayName;4" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassCommandRequestPropertyDisplayNameTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandRequestPropertyDisplayNameTermAndDtmiV4.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;4".
* nullable
  * Value [MUST](spec/Requirement-ClassCommandRequestPropertyNullableBooleanV4.json) be a [representational boolean](#representational-boolean) or an array containing no more than one representational boolean.
  * Member name [MAY](spec/Allowance-ClassCommandRequestPropertyNullableDtmiV4.json) be expressed as "dtmi:dtdl:property:nullable;4" instead of "nullable", but "nullable" is [RECOMMENDED](spec/Recommendation-ClassCommandRequestPropertyNullableTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandRequestPropertyNullableTermAndDtmiV4.json) be expressed as both "nullable" and "dtmi:dtdl:property:nullable;4".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* Members with names starting with "@" other than "@context", "@id", and "@type" [MUST NOT](spec/Requirement-ClassCommandRequestInvalidKeywordsV4.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [SHALL NOT](spec/Completion-ClassCommandRequestPropertyIrrelevantDtmiOrTermV4.json) be present if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "name", "nullable", "schema", "dtmi:dtdl:property:comment;4", "dtmi:dtdl:property:description;4", "dtmi:dtdl:property:displayName;4", "dtmi:dtdl:property:name;4", "dtmi:dtdl:property:nullable;4", "dtmi:dtdl:property:schema;4".
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassCommandRequestPropertyFormallyIrrelevantDtmiOrTermV4.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "name", "nullable", "schema", "dtmi:dtdl:property:comment;4", "dtmi:dtdl:property:description;4", "dtmi:dtdl:property:displayName;4", "dtmi:dtdl:property:name;4", "dtmi:dtdl:property:nullable;4", "dtmi:dtdl:property:schema;4".
* A member [MUST NOT](spec/Requirement-ClassCommandRequestPropertyInvalidDtmiV4.json) be present if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassCommandRequestPropertyNotDtmiNorTermV4.json) be present if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [SHALL NOT](spec/Completion-ClassCommandRequestPropertyUndefinedTermV4.json) be present if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassCommandRequestPropertyFormallyUndefinedTermV4.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### CommandResponse

Example:

```json
{
  "@context": "dtmi:dtdl:context;4",
  "@id": "dtmi:example:delta_omicron;1",
  "@type": "Interface",
  "contents": {
    "@type": "Command",
    "name": "delta_xi",
    "response": {
      "name": "delta_nu",
      "schema": "bytes"
    }
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassCommandResponseRequiredPropertiesV4.json):

* name
  * Value [MUST](spec/Requirement-ClassCommandResponsePropertyNameStringV4.json) be a [representational string](#representational-string) or an array containing exactly one representational string.
  * String value [MUST NOT](spec/Requirement-ClassCommandResponsePropertyNameStringLengthV4.json) be more than 512 characters in length.
  * String value [MUST](spec/Requirement-ClassCommandResponsePropertyNamePatternV4.json) match regular expression `^[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?$`.
  * Member name [MAY](spec/Allowance-ClassCommandResponsePropertyNameDtmiV4.json) be expressed as "dtmi:dtdl:property:name;4" instead of "name", but "name" is [RECOMMENDED](spec/Recommendation-ClassCommandResponsePropertyNameTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandResponsePropertyNameTermAndDtmiV4.json) be expressed as both "name" and "dtmi:dtdl:property:name;4".
* schema
  * Value [MUST](spec/Requirement-ClassCommandResponsePropertySchemaElementV4.json) be a DTDL element, a dependent reference to a DTDL element, a string from one of the rows in a [Standard schemas](#standard-schemas) table, a string defined by an extension referenced in the active context, or an array containing exactly one DTDL element, dependent reference to a DTDL element, string from one of the rows in a Standard schemas table, or string defined by an extension referenced in the active context.
  * If the value is a dependent reference or an array containing a dependent reference, the model [SHALL](spec/Completion-ClassCommandResponsePropertySchemaDependentReferenceV4.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * If present, an included or referentially included DTDL element [MUST](spec/Requirement-ClassCommandResponsePropertySchemaTypeConformanceV4.json) conform to the definition of DTDL element [Array](#array) or [Enum](#enum) or [Map](#map) or [Object](#object) or DTDLv3 element [Array](../v3/DTDL.Specification.v3.md#array) or [Enum](../v3/DTDL.Specification.v3.md#enum) or [Map](../v3/DTDL.Specification.v3.md#map) or [Object](../v3/DTDL.Specification.v3.md#object) or DTDLv2 element [Array](../v2/DTDL.Specification.v2.md#array) or [Enum](../v2/DTDL.Specification.v2.md#enum) or [Map](../v2/DTDL.Specification.v2.md#map) or [Object](../v2/DTDL.Specification.v2.md#object).
  * If a string from one of the rows in a Standard schemas table is included, a string from column "Term" is [RECOMMENDED](spec/Recommendation-ClassCommandResponsePropertySchemaPreferTermToDtmiV4.json) over a string from column "DTMI".
  * Member name [MAY](spec/Allowance-ClassCommandResponsePropertySchemaDtmiV4.json) be expressed as "dtmi:dtdl:property:schema;4" instead of "schema", but "schema" is [RECOMMENDED](spec/Recommendation-ClassCommandResponsePropertySchemaTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandResponsePropertySchemaTermAndDtmiV4.json) be expressed as both "schema" and "dtmi:dtdl:property:schema;4".

The following members are [OPTIONAL](spec/Allowance-ClassCommandResponseOptionalPropertiesV4.json):

* @context
  * [MUST](spec/Requirement-ClassCommandResponseContextConformsV4.json) conform to the specified [context](#context) rules.
* @type
  * Value [MUST](spec/Requirement-ClassCommandResponseTypeStringOrArrayV4.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassCommandResponseTypeIncludesMaterialV4.json) include either string "CommandResponse" or string "dtmi:dtdl:class:CommandResponse;4".
  * [SHOULD NOT](spec/Recommendation-ClassCommandResponseTypeIncludesTermAndDtmiV4.json) include both "CommandResponse" and "dtmi:dtdl:class:CommandResponse;4".
  * [SHOULD NOT](spec/Recommendation-ClassCommandResponseTypeDuplicatesMaterialV4.json) include more than one instance of either "CommandResponse" or "dtmi:dtdl:class:CommandResponse;4".
  * String "CommandResponse" is [RECOMMENDED](spec/Recommendation-ClassCommandResponseTypePreferTermToDtmiV4.json) over string "dtmi:dtdl:class:CommandResponse;4".
  * [SHALL NOT](spec/Completion-ClassCommandResponseTypeIncludesIrrelevantDtmiOrTermV4.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "CommandResponse" or "dtmi:dtdl:class:CommandResponse;4", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassCommandResponseTypeIncludesInvalidDtmiV4.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MUST NOT](spec/Requirement-ClassCommandResponseTypeIncludesNotDtmiNorTermV4.json) include any string that contains ":" but does not start with "dtmi:".
  * [SHALL NOT](spec/Completion-ClassCommandResponseTypeIncludesUndefinedTermV4.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
* @id
  * Value [MUST](spec/Requirement-ClassCommandResponseIdIsDtmiV4.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassCommandResponseIdNotArrayV4.json) be an array.
  * Value [MUST](spec/Requirement-ClassCommandResponseIdDuplicateV4.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassCommandResponsePropertyCommentStringV4.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassCommandResponsePropertyCommentStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassCommandResponsePropertyCommentDtmiV4.json) be expressed as "dtmi:dtdl:property:comment;4" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassCommandResponsePropertyCommentTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandResponsePropertyCommentTermAndDtmiV4.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;4".
* description
  * Value [MUST](spec/Requirement-ClassCommandResponsePropertyDescriptionLangStringV4.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassCommandResponsePropertyDescriptionStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassCommandResponsePropertyDescriptionDtmiV4.json) be expressed as "dtmi:dtdl:property:description;4" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassCommandResponsePropertyDescriptionTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandResponsePropertyDescriptionTermAndDtmiV4.json) be expressed as both "description" and "dtmi:dtdl:property:description;4".
* displayName
  * Value [MUST](spec/Requirement-ClassCommandResponsePropertyDisplayNameLangStringV4.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassCommandResponsePropertyDisplayNameStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassCommandResponsePropertyDisplayNameDtmiV4.json) be expressed as "dtmi:dtdl:property:displayName;4" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassCommandResponsePropertyDisplayNameTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandResponsePropertyDisplayNameTermAndDtmiV4.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;4".
* nullable
  * Value [MUST](spec/Requirement-ClassCommandResponsePropertyNullableBooleanV4.json) be a [representational boolean](#representational-boolean) or an array containing no more than one representational boolean.
  * Member name [MAY](spec/Allowance-ClassCommandResponsePropertyNullableDtmiV4.json) be expressed as "dtmi:dtdl:property:nullable;4" instead of "nullable", but "nullable" is [RECOMMENDED](spec/Recommendation-ClassCommandResponsePropertyNullableTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandResponsePropertyNullableTermAndDtmiV4.json) be expressed as both "nullable" and "dtmi:dtdl:property:nullable;4".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* Members with names starting with "@" other than "@context", "@id", and "@type" [MUST NOT](spec/Requirement-ClassCommandResponseInvalidKeywordsV4.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [SHALL NOT](spec/Completion-ClassCommandResponsePropertyIrrelevantDtmiOrTermV4.json) be present if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "name", "nullable", "schema", "dtmi:dtdl:property:comment;4", "dtmi:dtdl:property:description;4", "dtmi:dtdl:property:displayName;4", "dtmi:dtdl:property:name;4", "dtmi:dtdl:property:nullable;4", "dtmi:dtdl:property:schema;4".
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassCommandResponsePropertyFormallyIrrelevantDtmiOrTermV4.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "name", "nullable", "schema", "dtmi:dtdl:property:comment;4", "dtmi:dtdl:property:description;4", "dtmi:dtdl:property:displayName;4", "dtmi:dtdl:property:name;4", "dtmi:dtdl:property:nullable;4", "dtmi:dtdl:property:schema;4".
* A member [MUST NOT](spec/Requirement-ClassCommandResponsePropertyInvalidDtmiV4.json) be present if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassCommandResponsePropertyNotDtmiNorTermV4.json) be present if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [SHALL NOT](spec/Completion-ClassCommandResponsePropertyUndefinedTermV4.json) be present if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassCommandResponsePropertyFormallyUndefinedTermV4.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### Component

Example:

```json
{
  "@context": "dtmi:dtdl:context;4",
  "@id": "dtmi:example:delta_sigma;1",
  "@type": "Interface",
  "contents": {
    "@type": "Component",
    "name": "delta_pi",
    "schema": {
      "@id": "dtmi:example:delta_rho;1",
      "@type": "Interface"
    }
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassComponentRequiredPropertiesV4.json):

* @type
  * Value [MUST](spec/Requirement-ClassComponentTypeStringOrArrayV4.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassComponentTypeIncludesMaterialV4.json) include either string "Component" or string "dtmi:dtdl:class:Component;4".
  * [SHOULD NOT](spec/Recommendation-ClassComponentTypeIncludesTermAndDtmiV4.json) include both "Component" and "dtmi:dtdl:class:Component;4".
  * [SHOULD NOT](spec/Recommendation-ClassComponentTypeDuplicatesMaterialV4.json) include more than one instance of either "Component" or "dtmi:dtdl:class:Component;4".
  * String "Component" is [RECOMMENDED](spec/Recommendation-ClassComponentTypePreferTermToDtmiV4.json) over string "dtmi:dtdl:class:Component;4".
  * [SHALL NOT](spec/Completion-ClassComponentTypeIncludesIrrelevantDtmiOrTermV4.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "Component" or "dtmi:dtdl:class:Component;4", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassComponentTypeIncludesInvalidDtmiV4.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MUST NOT](spec/Requirement-ClassComponentTypeIncludesNotDtmiNorTermV4.json) include any string that contains ":" but does not start with "dtmi:".
  * [SHALL NOT](spec/Completion-ClassComponentTypeIncludesUndefinedTermV4.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
* name
  * Value [MUST](spec/Requirement-ClassComponentPropertyNameStringV4.json) be a [representational string](#representational-string) or an array containing exactly one representational string.
  * String value [MUST NOT](spec/Requirement-ClassComponentPropertyNameStringLengthV4.json) be more than 512 characters in length.
  * String value [MUST](spec/Requirement-ClassComponentPropertyNamePatternV4.json) match regular expression `^[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?$`.
  * String value [MUST](spec/Requirement-ClassComponentPropertyNameUniqueAmongInterfaceContentsV4.json) be unique among the included values of "name" members of all elements included or referentially included in the "contents" member of any parent [Interface](#interface) element.
  * Member name [MAY](spec/Allowance-ClassComponentPropertyNameDtmiV4.json) be expressed as "dtmi:dtdl:property:name;4" instead of "name", but "name" is [RECOMMENDED](spec/Recommendation-ClassComponentPropertyNameTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassComponentPropertyNameTermAndDtmiV4.json) be expressed as both "name" and "dtmi:dtdl:property:name;4".
* schema
  * Value [MUST](spec/Requirement-ClassComponentPropertySchemaElementV4.json) be a DTDL element, a dependent reference to DTDL element, or an array containing exactly one DTDL element or dependent reference to a DTDL element.
  * If the value is a dependent reference or an array containing a dependent reference, the model [SHALL](spec/Completion-ClassComponentPropertySchemaDependentReferenceV4.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * The included or referentially included DTDL element [MUST](spec/Requirement-ClassComponentPropertySchemaTypeConformanceV4.json) conform to the definition of DTDL element [Interface](#interface) or DTDLv3 element [Interface](../v3/DTDL.Specification.v3.md#interface) or DTDLv2 element [Interface](../v2/DTDL.Specification.v2.md#interface).
  * Considered with other DTDL elements, value is subject to any relevant restrictions in [Limits and exclusions](#limits-and-exclusions).
  * Member name [MAY](spec/Allowance-ClassComponentPropertySchemaDtmiV4.json) be expressed as "dtmi:dtdl:property:schema;4" instead of "schema", but "schema" is [RECOMMENDED](spec/Recommendation-ClassComponentPropertySchemaTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassComponentPropertySchemaTermAndDtmiV4.json) be expressed as both "schema" and "dtmi:dtdl:property:schema;4".

The following members are [OPTIONAL](spec/Allowance-ClassComponentOptionalPropertiesV4.json):

* @context
  * [MUST](spec/Requirement-ClassComponentContextConformsV4.json) conform to the specified [context](#context) rules.
* @id
  * Value [MUST](spec/Requirement-ClassComponentIdIsDtmiV4.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassComponentIdNotArrayV4.json) be an array.
  * Value [MUST](spec/Requirement-ClassComponentIdDuplicateV4.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassComponentPropertyCommentStringV4.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassComponentPropertyCommentStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassComponentPropertyCommentDtmiV4.json) be expressed as "dtmi:dtdl:property:comment;4" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassComponentPropertyCommentTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassComponentPropertyCommentTermAndDtmiV4.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;4".
* description
  * Value [MUST](spec/Requirement-ClassComponentPropertyDescriptionLangStringV4.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassComponentPropertyDescriptionStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassComponentPropertyDescriptionDtmiV4.json) be expressed as "dtmi:dtdl:property:description;4" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassComponentPropertyDescriptionTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassComponentPropertyDescriptionTermAndDtmiV4.json) be expressed as both "description" and "dtmi:dtdl:property:description;4".
* displayName
  * Value [MUST](spec/Requirement-ClassComponentPropertyDisplayNameLangStringV4.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassComponentPropertyDisplayNameStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassComponentPropertyDisplayNameDtmiV4.json) be expressed as "dtmi:dtdl:property:displayName;4" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassComponentPropertyDisplayNameTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassComponentPropertyDisplayNameTermAndDtmiV4.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;4".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* Members with names starting with "@" other than "@context", "@id", and "@type" [MUST NOT](spec/Requirement-ClassComponentInvalidKeywordsV4.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [SHALL NOT](spec/Completion-ClassComponentPropertyIrrelevantDtmiOrTermV4.json) be present if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "name", "schema", "dtmi:dtdl:property:comment;4", "dtmi:dtdl:property:description;4", "dtmi:dtdl:property:displayName;4", "dtmi:dtdl:property:name;4", "dtmi:dtdl:property:schema;4".
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassComponentPropertyFormallyIrrelevantDtmiOrTermV4.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "name", "schema", "dtmi:dtdl:property:comment;4", "dtmi:dtdl:property:description;4", "dtmi:dtdl:property:displayName;4", "dtmi:dtdl:property:name;4", "dtmi:dtdl:property:schema;4".
* A member [MUST NOT](spec/Requirement-ClassComponentPropertyInvalidDtmiV4.json) be present if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassComponentPropertyNotDtmiNorTermV4.json) be present if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [SHALL NOT](spec/Completion-ClassComponentPropertyUndefinedTermV4.json) be present if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassComponentPropertyFormallyUndefinedTermV4.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### Enum

Example:

```json
{
  "@context": "dtmi:dtdl:context;4",
  "@id": "dtmi:example:delta_chi;1",
  "@type": "Interface",
  "schemas": {
    "@id": "dtmi:example:delta_phi;1",
    "@type": "Enum",
    "valueSchema": "integer"
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassEnumRequiredPropertiesV4.json):

* @type
  * Value [MUST](spec/Requirement-ClassEnumTypeStringOrArrayV4.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassEnumTypeIncludesMaterialV4.json) include either string "Enum" or string "dtmi:dtdl:class:Enum;4".
  * [SHOULD NOT](spec/Recommendation-ClassEnumTypeIncludesTermAndDtmiV4.json) include both "Enum" and "dtmi:dtdl:class:Enum;4".
  * [SHOULD NOT](spec/Recommendation-ClassEnumTypeDuplicatesMaterialV4.json) include more than one instance of either "Enum" or "dtmi:dtdl:class:Enum;4".
  * String "Enum" is [RECOMMENDED](spec/Recommendation-ClassEnumTypePreferTermToDtmiV4.json) over string "dtmi:dtdl:class:Enum;4".
  * [SHALL NOT](spec/Completion-ClassEnumTypeIncludesIrrelevantDtmiOrTermV4.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "Enum" or "dtmi:dtdl:class:Enum;4", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassEnumTypeIncludesInvalidDtmiV4.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MUST NOT](spec/Requirement-ClassEnumTypeIncludesNotDtmiNorTermV4.json) include any string that contains ":" but does not start with "dtmi:".
  * [SHALL NOT](spec/Completion-ClassEnumTypeIncludesUndefinedTermV4.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
* valueSchema
  * Value [MUST](spec/Requirement-ClassEnumPropertyValueSchemaSpecificValuesV4.json) be "integer", "string", "dtmi:dtdl:instance:Schema:integer;4", "dtmi:dtdl:instance:Schema:integer;3", "dtmi:dtdl:instance:Schema:integer;2", "dtmi:dtdl:instance:Schema:string;4", "dtmi:dtdl:instance:Schema:string;3", "dtmi:dtdl:instance:Schema:string;2", or an array containing exactly one of these string values.
  * Value "integer" is [RECOMMENDED](spec/Recommendation-ClassEnumPropertyValueSchemaValueIntegerPreferToDtmiV4.json) over value dtmi:dtdl:instance:Schema:integer;4.
  * Value "string" is [RECOMMENDED](spec/Recommendation-ClassEnumPropertyValueSchemaValueStringPreferToDtmiV4.json) over value dtmi:dtdl:instance:Schema:string;4.
  * Member name [MAY](spec/Allowance-ClassEnumPropertyValueSchemaDtmiV4.json) be expressed as "dtmi:dtdl:property:valueSchema;4" instead of "valueSchema", but "valueSchema" is [RECOMMENDED](spec/Recommendation-ClassEnumPropertyValueSchemaTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassEnumPropertyValueSchemaTermAndDtmiV4.json) be expressed as both "valueSchema" and "dtmi:dtdl:property:valueSchema;4".

The following members are [OPTIONAL](spec/Allowance-ClassEnumOptionalPropertiesV4.json) unless otherwise noted:

* @context
  * [MUST](spec/Requirement-ClassEnumContextConformsV4.json) conform to the specified [context](#context) rules.
* @id
  * [REQUIRED](spec/Requirement-ClassEnumIdRequiredV4.json) when the Enum element is included in Interface member "schemas".
  * Value [MUST](spec/Requirement-ClassEnumIdIsDtmiV4.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassEnumIdNotArrayV4.json) be an array.
  * Value [MUST](spec/Requirement-ClassEnumIdDuplicateV4.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassEnumPropertyCommentStringV4.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassEnumPropertyCommentStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassEnumPropertyCommentDtmiV4.json) be expressed as "dtmi:dtdl:property:comment;4" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassEnumPropertyCommentTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassEnumPropertyCommentTermAndDtmiV4.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;4".
* description
  * Value [MUST](spec/Requirement-ClassEnumPropertyDescriptionLangStringV4.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassEnumPropertyDescriptionStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassEnumPropertyDescriptionDtmiV4.json) be expressed as "dtmi:dtdl:property:description;4" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassEnumPropertyDescriptionTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassEnumPropertyDescriptionTermAndDtmiV4.json) be expressed as both "description" and "dtmi:dtdl:property:description;4".
* displayName
  * Value [MUST](spec/Requirement-ClassEnumPropertyDisplayNameLangStringV4.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassEnumPropertyDisplayNameStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassEnumPropertyDisplayNameDtmiV4.json) be expressed as "dtmi:dtdl:property:displayName;4" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassEnumPropertyDisplayNameTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassEnumPropertyDisplayNameTermAndDtmiV4.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;4".
* enumValues
  * Value [MUST](spec/Requirement-ClassEnumPropertyEnumValuesElementV4.json) be a DTDL element, a dependent reference to DTDL element, or an array of DTDL elements and dependent references to DTDL elements.
  * For each included dependent reference, the model [SHALL](spec/Completion-ClassEnumPropertyEnumValuesDependentReferenceV4.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * Each included or referentially included DTDL element [MUST](spec/Requirement-ClassEnumPropertyEnumValuesTypeConformanceV4.json) conform to the definition of DTDL element [EnumValue](#enumvalue).
  * Member name [MAY](spec/Allowance-ClassEnumPropertyEnumValuesDtmiV4.json) be expressed as "dtmi:dtdl:property:enumValues;4" instead of "enumValues", but "enumValues" is [RECOMMENDED](spec/Recommendation-ClassEnumPropertyEnumValuesTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassEnumPropertyEnumValuesTermAndDtmiV4.json) be expressed as both "enumValues" and "dtmi:dtdl:property:enumValues;4".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* Members with names starting with "@" other than "@context", "@id", and "@type" [MUST NOT](spec/Requirement-ClassEnumInvalidKeywordsV4.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [SHALL NOT](spec/Completion-ClassEnumPropertyIrrelevantDtmiOrTermV4.json) be present if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "enumValues", "valueSchema", "dtmi:dtdl:property:comment;4", "dtmi:dtdl:property:description;4", "dtmi:dtdl:property:displayName;4", "dtmi:dtdl:property:enumValues;4", "dtmi:dtdl:property:valueSchema;4".
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassEnumPropertyFormallyIrrelevantDtmiOrTermV4.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "enumValues", "valueSchema", "dtmi:dtdl:property:comment;4", "dtmi:dtdl:property:description;4", "dtmi:dtdl:property:displayName;4", "dtmi:dtdl:property:enumValues;4", "dtmi:dtdl:property:valueSchema;4".
* A member [MUST NOT](spec/Requirement-ClassEnumPropertyInvalidDtmiV4.json) be present if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassEnumPropertyNotDtmiNorTermV4.json) be present if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [SHALL NOT](spec/Completion-ClassEnumPropertyUndefinedTermV4.json) be present if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassEnumPropertyFormallyUndefinedTermV4.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### EnumValue

Example:

```json
{
  "@context": "dtmi:dtdl:context;4",
  "@id": "dtmi:example:delta_wum;1",
  "@type": "Interface",
  "schemas": {
    "@id": "dtmi:example:delta_yuzz;1",
    "@type": "Enum",
    "valueSchema": "integer",
    "enumValues": {
      "enumValue": 18,
      "name": "delta_omega"
    }
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassEnumValueRequiredPropertiesV4.json):

* enumValue
  * Value [MUST](spec/Requirement-ClassEnumValuePropertyEnumValueIntegerV4.json) be a [representational integer](#representational-integer) or an array containing exactly one representational integer if any parent [Enum](#enum) element has a "valueSchema" member that includes "integer" or "dtmi:dtdl:instance:Schema:integer;4".
  * Value [MUST](spec/Requirement-ClassEnumValuePropertyEnumValueStringV4.json) be a [representational string](#representational-string) or an array containing exactly one representational string if any parent [Enum](#enum) element has a "valueSchema" member that includes "string" or "dtmi:dtdl:instance:Schema:string;4".
  * Literal value [MUST](spec/Requirement-ClassEnumValuePropertyEnumValueUniqueAmongEnumEnumValuesV4.json) be unique among the included values of "enumValue" members of all elements included or referentially included in the "enumValues" member of any parent [Enum](#enum) element.
  * Member name [MAY](spec/Allowance-ClassEnumValuePropertyEnumValueDtmiV4.json) be expressed as "dtmi:dtdl:property:enumValue;4" instead of "enumValue", but "enumValue" is [RECOMMENDED](spec/Recommendation-ClassEnumValuePropertyEnumValueTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassEnumValuePropertyEnumValueTermAndDtmiV4.json) be expressed as both "enumValue" and "dtmi:dtdl:property:enumValue;4".
* name
  * Value [MUST](spec/Requirement-ClassEnumValuePropertyNameStringV4.json) be a [representational string](#representational-string) or an array containing exactly one representational string.
  * String value [MUST NOT](spec/Requirement-ClassEnumValuePropertyNameStringLengthV4.json) be more than 512 characters in length.
  * String value [MUST](spec/Requirement-ClassEnumValuePropertyNamePatternV4.json) match regular expression `^[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?$`.
  * String value [MUST](spec/Requirement-ClassEnumValuePropertyNameUniqueAmongEnumEnumValuesV4.json) be unique among the included values of "name" members of all elements included or referentially included in the "enumValues" member of any parent [Enum](#enum) element.
  * Member name [MAY](spec/Allowance-ClassEnumValuePropertyNameDtmiV4.json) be expressed as "dtmi:dtdl:property:name;4" instead of "name", but "name" is [RECOMMENDED](spec/Recommendation-ClassEnumValuePropertyNameTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassEnumValuePropertyNameTermAndDtmiV4.json) be expressed as both "name" and "dtmi:dtdl:property:name;4".

The following members are [OPTIONAL](spec/Allowance-ClassEnumValueOptionalPropertiesV4.json):

* @context
  * [MUST](spec/Requirement-ClassEnumValueContextConformsV4.json) conform to the specified [context](#context) rules.
* @type
  * Value [MUST](spec/Requirement-ClassEnumValueTypeStringOrArrayV4.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassEnumValueTypeIncludesMaterialV4.json) include either string "EnumValue" or string "dtmi:dtdl:class:EnumValue;4".
  * [SHOULD NOT](spec/Recommendation-ClassEnumValueTypeIncludesTermAndDtmiV4.json) include both "EnumValue" and "dtmi:dtdl:class:EnumValue;4".
  * [SHOULD NOT](spec/Recommendation-ClassEnumValueTypeDuplicatesMaterialV4.json) include more than one instance of either "EnumValue" or "dtmi:dtdl:class:EnumValue;4".
  * String "EnumValue" is [RECOMMENDED](spec/Recommendation-ClassEnumValueTypePreferTermToDtmiV4.json) over string "dtmi:dtdl:class:EnumValue;4".
  * [SHALL NOT](spec/Completion-ClassEnumValueTypeIncludesIrrelevantDtmiOrTermV4.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "EnumValue" or "dtmi:dtdl:class:EnumValue;4", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassEnumValueTypeIncludesInvalidDtmiV4.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MUST NOT](spec/Requirement-ClassEnumValueTypeIncludesNotDtmiNorTermV4.json) include any string that contains ":" but does not start with "dtmi:".
  * [SHALL NOT](spec/Completion-ClassEnumValueTypeIncludesUndefinedTermV4.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
* @id
  * Value [MUST](spec/Requirement-ClassEnumValueIdIsDtmiV4.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassEnumValueIdNotArrayV4.json) be an array.
  * Value [MUST](spec/Requirement-ClassEnumValueIdDuplicateV4.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassEnumValuePropertyCommentStringV4.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassEnumValuePropertyCommentStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassEnumValuePropertyCommentDtmiV4.json) be expressed as "dtmi:dtdl:property:comment;4" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassEnumValuePropertyCommentTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassEnumValuePropertyCommentTermAndDtmiV4.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;4".
* description
  * Value [MUST](spec/Requirement-ClassEnumValuePropertyDescriptionLangStringV4.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassEnumValuePropertyDescriptionStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassEnumValuePropertyDescriptionDtmiV4.json) be expressed as "dtmi:dtdl:property:description;4" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassEnumValuePropertyDescriptionTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassEnumValuePropertyDescriptionTermAndDtmiV4.json) be expressed as both "description" and "dtmi:dtdl:property:description;4".
* displayName
  * Value [MUST](spec/Requirement-ClassEnumValuePropertyDisplayNameLangStringV4.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassEnumValuePropertyDisplayNameStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassEnumValuePropertyDisplayNameDtmiV4.json) be expressed as "dtmi:dtdl:property:displayName;4" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassEnumValuePropertyDisplayNameTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassEnumValuePropertyDisplayNameTermAndDtmiV4.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;4".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* Members with names starting with "@" other than "@context", "@id", and "@type" [MUST NOT](spec/Requirement-ClassEnumValueInvalidKeywordsV4.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [SHALL NOT](spec/Completion-ClassEnumValuePropertyIrrelevantDtmiOrTermV4.json) be present if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "enumValue", "name", "dtmi:dtdl:property:comment;4", "dtmi:dtdl:property:description;4", "dtmi:dtdl:property:displayName;4", "dtmi:dtdl:property:enumValue;4", "dtmi:dtdl:property:name;4".
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassEnumValuePropertyFormallyIrrelevantDtmiOrTermV4.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "enumValue", "name", "dtmi:dtdl:property:comment;4", "dtmi:dtdl:property:description;4", "dtmi:dtdl:property:displayName;4", "dtmi:dtdl:property:enumValue;4", "dtmi:dtdl:property:name;4".
* A member [MUST NOT](spec/Requirement-ClassEnumValuePropertyInvalidDtmiV4.json) be present if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassEnumValuePropertyNotDtmiNorTermV4.json) be present if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [SHALL NOT](spec/Completion-ClassEnumValuePropertyUndefinedTermV4.json) be present if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassEnumValuePropertyFormallyUndefinedTermV4.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### Field

Example:

```json
{
  "@context": "dtmi:dtdl:context;4",
  "@id": "dtmi:example:delta_quan;1",
  "@type": "Interface",
  "schemas": {
    "@id": "dtmi:example:delta_snee;1",
    "@type": "Object",
    "fields": {
      "name": "delta_nuh",
      "schema": "date"
    }
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassFieldRequiredPropertiesV4.json):

* name
  * Value [MUST](spec/Requirement-ClassFieldPropertyNameStringV4.json) be a [representational string](#representational-string) or an array containing exactly one representational string.
  * String value [MUST NOT](spec/Requirement-ClassFieldPropertyNameStringLengthV4.json) be more than 512 characters in length.
  * String value [MUST](spec/Requirement-ClassFieldPropertyNamePatternV4.json) match regular expression `^[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?$`.
  * String value [MUST](spec/Requirement-ClassFieldPropertyNameUniqueAmongObjectFieldsV4.json) be unique among the included values of "name" members of all elements included or referentially included in the "fields" member of any parent [Object](#object) element.
  * Member name [MAY](spec/Allowance-ClassFieldPropertyNameDtmiV4.json) be expressed as "dtmi:dtdl:property:name;4" instead of "name", but "name" is [RECOMMENDED](spec/Recommendation-ClassFieldPropertyNameTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassFieldPropertyNameTermAndDtmiV4.json) be expressed as both "name" and "dtmi:dtdl:property:name;4".
* schema
  * Value [MUST](spec/Requirement-ClassFieldPropertySchemaElementV4.json) be a DTDL element, a dependent reference to a DTDL element, a string from one of the rows in a [Standard schemas](#standard-schemas) table, a string defined by an extension referenced in the active context, or an array containing exactly one DTDL element, dependent reference to a DTDL element, string from one of the rows in a Standard schemas table, or string defined by an extension referenced in the active context.
  * If the value is a dependent reference or an array containing a dependent reference, the model [SHALL](spec/Completion-ClassFieldPropertySchemaDependentReferenceV4.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * If present, an included or referentially included DTDL element [MUST](spec/Requirement-ClassFieldPropertySchemaTypeConformanceV4.json) conform to the definition of DTDL element [Array](#array) or [Enum](#enum) or [Map](#map) or [Object](#object) or DTDLv3 element [Array](../v3/DTDL.Specification.v3.md#array) or [Enum](../v3/DTDL.Specification.v3.md#enum) or [Map](../v3/DTDL.Specification.v3.md#map) or [Object](../v3/DTDL.Specification.v3.md#object) or DTDLv2 element [Array](../v2/DTDL.Specification.v2.md#array) or [Enum](../v2/DTDL.Specification.v2.md#enum) or [Map](../v2/DTDL.Specification.v2.md#map) or [Object](../v2/DTDL.Specification.v2.md#object).
  * If a string from one of the rows in a Standard schemas table is included, a string from column "Term" is [RECOMMENDED](spec/Recommendation-ClassFieldPropertySchemaPreferTermToDtmiV4.json) over a string from column "DTMI".
  * Considered with other DTDL elements, value is subject to any relevant restrictions in [Limits and exclusions](#limits-and-exclusions).
  * Member name [MAY](spec/Allowance-ClassFieldPropertySchemaDtmiV4.json) be expressed as "dtmi:dtdl:property:schema;4" instead of "schema", but "schema" is [RECOMMENDED](spec/Recommendation-ClassFieldPropertySchemaTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassFieldPropertySchemaTermAndDtmiV4.json) be expressed as both "schema" and "dtmi:dtdl:property:schema;4".

The following members are [OPTIONAL](spec/Allowance-ClassFieldOptionalPropertiesV4.json):

* @context
  * [MUST](spec/Requirement-ClassFieldContextConformsV4.json) conform to the specified [context](#context) rules.
* @type
  * Value [MUST](spec/Requirement-ClassFieldTypeStringOrArrayV4.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassFieldTypeIncludesMaterialV4.json) include either string "Field" or string "dtmi:dtdl:class:Field;4".
  * [SHOULD NOT](spec/Recommendation-ClassFieldTypeIncludesTermAndDtmiV4.json) include both "Field" and "dtmi:dtdl:class:Field;4".
  * [SHOULD NOT](spec/Recommendation-ClassFieldTypeDuplicatesMaterialV4.json) include more than one instance of either "Field" or "dtmi:dtdl:class:Field;4".
  * String "Field" is [RECOMMENDED](spec/Recommendation-ClassFieldTypePreferTermToDtmiV4.json) over string "dtmi:dtdl:class:Field;4".
  * [SHALL NOT](spec/Completion-ClassFieldTypeIncludesIrrelevantDtmiOrTermV4.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "Field" or "dtmi:dtdl:class:Field;4", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassFieldTypeIncludesInvalidDtmiV4.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MUST NOT](spec/Requirement-ClassFieldTypeIncludesNotDtmiNorTermV4.json) include any string that contains ":" but does not start with "dtmi:".
  * [SHALL NOT](spec/Completion-ClassFieldTypeIncludesUndefinedTermV4.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
* @id
  * Value [MUST](spec/Requirement-ClassFieldIdIsDtmiV4.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassFieldIdNotArrayV4.json) be an array.
  * Value [MUST](spec/Requirement-ClassFieldIdDuplicateV4.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassFieldPropertyCommentStringV4.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassFieldPropertyCommentStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassFieldPropertyCommentDtmiV4.json) be expressed as "dtmi:dtdl:property:comment;4" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassFieldPropertyCommentTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassFieldPropertyCommentTermAndDtmiV4.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;4".
* description
  * Value [MUST](spec/Requirement-ClassFieldPropertyDescriptionLangStringV4.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassFieldPropertyDescriptionStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassFieldPropertyDescriptionDtmiV4.json) be expressed as "dtmi:dtdl:property:description;4" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassFieldPropertyDescriptionTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassFieldPropertyDescriptionTermAndDtmiV4.json) be expressed as both "description" and "dtmi:dtdl:property:description;4".
* displayName
  * Value [MUST](spec/Requirement-ClassFieldPropertyDisplayNameLangStringV4.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassFieldPropertyDisplayNameStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassFieldPropertyDisplayNameDtmiV4.json) be expressed as "dtmi:dtdl:property:displayName;4" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassFieldPropertyDisplayNameTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassFieldPropertyDisplayNameTermAndDtmiV4.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;4".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* Members with names starting with "@" other than "@context", "@id", and "@type" [MUST NOT](spec/Requirement-ClassFieldInvalidKeywordsV4.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [SHALL NOT](spec/Completion-ClassFieldPropertyIrrelevantDtmiOrTermV4.json) be present if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "name", "schema", "dtmi:dtdl:property:comment;4", "dtmi:dtdl:property:description;4", "dtmi:dtdl:property:displayName;4", "dtmi:dtdl:property:name;4", "dtmi:dtdl:property:schema;4".
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassFieldPropertyFormallyIrrelevantDtmiOrTermV4.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "name", "schema", "dtmi:dtdl:property:comment;4", "dtmi:dtdl:property:description;4", "dtmi:dtdl:property:displayName;4", "dtmi:dtdl:property:name;4", "dtmi:dtdl:property:schema;4".
* A member [MUST NOT](spec/Requirement-ClassFieldPropertyInvalidDtmiV4.json) be present if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassFieldPropertyNotDtmiNorTermV4.json) be present if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [SHALL NOT](spec/Completion-ClassFieldPropertyUndefinedTermV4.json) be present if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassFieldPropertyFormallyUndefinedTermV4.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### Interface

Example:

```json
{
  "@context": "dtmi:dtdl:context;4",
  "@id": "dtmi:example:delta_floob;1",
  "@type": "Interface"
}
```

The following members are [REQUIRED](spec/Requirement-ClassInterfaceRequiredPropertiesV4.json):

* @type
  * Value [MUST](spec/Requirement-ClassInterfaceTypeStringOrArrayV4.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassInterfaceTypeIncludesMaterialV4.json) include either string "Interface" or string "dtmi:dtdl:class:Interface;4".
  * [SHOULD NOT](spec/Recommendation-ClassInterfaceTypeIncludesTermAndDtmiV4.json) include both "Interface" and "dtmi:dtdl:class:Interface;4".
  * [SHOULD NOT](spec/Recommendation-ClassInterfaceTypeDuplicatesMaterialV4.json) include more than one instance of either "Interface" or "dtmi:dtdl:class:Interface;4".
  * String "Interface" is [RECOMMENDED](spec/Recommendation-ClassInterfaceTypePreferTermToDtmiV4.json) over string "dtmi:dtdl:class:Interface;4".
  * [SHALL NOT](spec/Completion-ClassInterfaceTypeIncludesIrrelevantDtmiOrTermV4.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "Interface" or "dtmi:dtdl:class:Interface;4", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassInterfaceTypeIncludesInvalidDtmiV4.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MUST NOT](spec/Requirement-ClassInterfaceTypeIncludesNotDtmiNorTermV4.json) include any string that contains ":" but does not start with "dtmi:".
  * [SHALL NOT](spec/Completion-ClassInterfaceTypeIncludesUndefinedTermV4.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
* @id
  * Value [MUST](spec/Requirement-ClassInterfaceIdIsDtmiV4.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassInterfaceIdNotArrayV4.json) be an array.
  * Value [MUST](spec/Requirement-ClassInterfaceIdDuplicateV4.json) be unique among the values of all "@id" members of all elements in the model.
  * Length of value string [MUST NOT](spec/Requirement-ClassInterfaceIdLongV4.json) exceed 128 characters.

The following members are [OPTIONAL](spec/Allowance-ClassInterfaceOptionalPropertiesV4.json) unless otherwise noted:

* @context
  * [REQUIRED](spec/Requirement-ClassInterfaceContextAtTopLevelV4.json) when the Interface element is a top-level element.
  * [MUST](spec/Requirement-ClassInterfaceContextDtdlTopLevelV4.json) include value "dtmi:dtdl:context;4" when the Interface element is a top-level element.
  * [MUST](spec/Requirement-ClassInterfaceContextConformsV4.json) conform to the specified [context](#context) rules.
* comment
  * Value [MUST](spec/Requirement-ClassInterfacePropertyCommentStringV4.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassInterfacePropertyCommentStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassInterfacePropertyCommentDtmiV4.json) be expressed as "dtmi:dtdl:property:comment;4" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassInterfacePropertyCommentTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassInterfacePropertyCommentTermAndDtmiV4.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;4".
* contents
  * Value [MUST](spec/Requirement-ClassInterfacePropertyContentsElementV4.json) be a DTDL element, a dependent reference to DTDL element, or an array of DTDL elements and dependent references to DTDL elements.
  * For each included dependent reference, the model [SHALL](spec/Completion-ClassInterfacePropertyContentsDependentReferenceV4.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * Each included or referentially included DTDL element [MUST](spec/Requirement-ClassInterfacePropertyContentsTypeConformanceV4.json) conform to the definition of DTDL element [Command](#command) or [Component](#component) or [Property](#property) or [Relationship](#relationship) or [Telemetry](#telemetry) or DTDLv3 element [Command](../v3/DTDL.Specification.v3.md#command) or [Component](../v3/DTDL.Specification.v3.md#component) or [Property](../v3/DTDL.Specification.v3.md#property) or [Relationship](../v3/DTDL.Specification.v3.md#relationship) or [Telemetry](../v3/DTDL.Specification.v3.md#telemetry) or DTDLv2 element [Command](../v2/DTDL.Specification.v2.md#command) or [Component](../v2/DTDL.Specification.v2.md#component) or [Property](../v2/DTDL.Specification.v2.md#property) or [Relationship](../v2/DTDL.Specification.v2.md#relationship) or [Telemetry](../v2/DTDL.Specification.v2.md#telemetry).
  * Considered with other DTDL elements, value is subject to any relevant restrictions in [Limits and exclusions](#limits-and-exclusions).
  * Member name [MAY](spec/Allowance-ClassInterfacePropertyContentsDtmiV4.json) be expressed as "dtmi:dtdl:property:contents;4" instead of "contents", but "contents" is [RECOMMENDED](spec/Recommendation-ClassInterfacePropertyContentsTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassInterfacePropertyContentsTermAndDtmiV4.json) be expressed as both "contents" and "dtmi:dtdl:property:contents;4".
* description
  * Value [MUST](spec/Requirement-ClassInterfacePropertyDescriptionLangStringV4.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassInterfacePropertyDescriptionStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassInterfacePropertyDescriptionDtmiV4.json) be expressed as "dtmi:dtdl:property:description;4" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassInterfacePropertyDescriptionTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassInterfacePropertyDescriptionTermAndDtmiV4.json) be expressed as both "description" and "dtmi:dtdl:property:description;4".
* displayName
  * Value [MUST](spec/Requirement-ClassInterfacePropertyDisplayNameLangStringV4.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassInterfacePropertyDisplayNameStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassInterfacePropertyDisplayNameDtmiV4.json) be expressed as "dtmi:dtdl:property:displayName;4" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassInterfacePropertyDisplayNameTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassInterfacePropertyDisplayNameTermAndDtmiV4.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;4".
* extends
  * Value [MUST](spec/Requirement-ClassInterfacePropertyExtendsElementV4.json) be a DTDL element, a dependent reference to DTDL element, or an array of DTDL elements and dependent references to DTDL elements.
  * For each included dependent reference, the model [SHALL](spec/Completion-ClassInterfacePropertyExtendsDependentReferenceV4.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * Each included or referentially included DTDL element [MUST](spec/Requirement-ClassInterfacePropertyExtendsTypeConformanceV4.json) conform to the definition of DTDL element [Interface](#interface) or DTDLv3 element [Interface](../v3/DTDL.Specification.v3.md#interface) or DTDLv2 element [Interface](../v2/DTDL.Specification.v2.md#interface).
  * Considered with other DTDL elements, value is subject to any relevant restrictions in [Limits and exclusions](#limits-and-exclusions).
  * Member name [MAY](spec/Allowance-ClassInterfacePropertyExtendsDtmiV4.json) be expressed as "dtmi:dtdl:property:extends;4" instead of "extends", but "extends" is [RECOMMENDED](spec/Recommendation-ClassInterfacePropertyExtendsTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassInterfacePropertyExtendsTermAndDtmiV4.json) be expressed as both "extends" and "dtmi:dtdl:property:extends;4".
* schemas
  * Value [MUST](spec/Requirement-ClassInterfacePropertySchemasElementV4.json) be a DTDL element, a dependent reference to DTDL element, or an array of DTDL elements and dependent references to DTDL elements.
  * For each included dependent reference, the model [SHALL](spec/Completion-ClassInterfacePropertySchemasDependentReferenceV4.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * Each included or referentially included DTDL element [MUST](spec/Requirement-ClassInterfacePropertySchemasTypeConformanceV4.json) conform to the definition of DTDL element [Array](#array) or [Enum](#enum) or [Map](#map) or [Object](#object).
  * Member name [MAY](spec/Allowance-ClassInterfacePropertySchemasDtmiV4.json) be expressed as "dtmi:dtdl:property:schemas;4" instead of "schemas", but "schemas" is [RECOMMENDED](spec/Recommendation-ClassInterfacePropertySchemasTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassInterfacePropertySchemasTermAndDtmiV4.json) be expressed as both "schemas" and "dtmi:dtdl:property:schemas;4".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* Members with names starting with "@" other than "@context", "@id", and "@type" [MUST NOT](spec/Requirement-ClassInterfaceInvalidKeywordsV4.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [SHALL NOT](spec/Completion-ClassInterfacePropertyIrrelevantDtmiOrTermV4.json) be present if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "contents", "description", "displayName", "extends", "schemas", "dtmi:dtdl:property:comment;4", "dtmi:dtdl:property:contents;4", "dtmi:dtdl:property:description;4", "dtmi:dtdl:property:displayName;4", "dtmi:dtdl:property:extends;4", "dtmi:dtdl:property:schemas;4".
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassInterfacePropertyFormallyIrrelevantDtmiOrTermV4.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "contents", "description", "displayName", "extends", "schemas", "dtmi:dtdl:property:comment;4", "dtmi:dtdl:property:contents;4", "dtmi:dtdl:property:description;4", "dtmi:dtdl:property:displayName;4", "dtmi:dtdl:property:extends;4", "dtmi:dtdl:property:schemas;4".
* A member [MUST NOT](spec/Requirement-ClassInterfacePropertyInvalidDtmiV4.json) be present if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassInterfacePropertyNotDtmiNorTermV4.json) be present if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [SHALL NOT](spec/Completion-ClassInterfacePropertyUndefinedTermV4.json) be present if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassInterfacePropertyFormallyUndefinedTermV4.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### Map

Example:

```json
{
  "@context": "dtmi:dtdl:context;4",
  "@id": "dtmi:example:delta_itch;1",
  "@type": "Interface",
  "schemas": {
    "@id": "dtmi:example:delta_zatz;1",
    "@type": "Map",
    "mapKey": {
      "name": "delta_jogg",
      "schema": "string"
    },
    "mapValue": {
      "name": "delta_flunn",
      "schema": "dateTime"
    }
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassMapRequiredPropertiesV4.json):

* @type
  * Value [MUST](spec/Requirement-ClassMapTypeStringOrArrayV4.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassMapTypeIncludesMaterialV4.json) include either string "Map" or string "dtmi:dtdl:class:Map;4".
  * [SHOULD NOT](spec/Recommendation-ClassMapTypeIncludesTermAndDtmiV4.json) include both "Map" and "dtmi:dtdl:class:Map;4".
  * [SHOULD NOT](spec/Recommendation-ClassMapTypeDuplicatesMaterialV4.json) include more than one instance of either "Map" or "dtmi:dtdl:class:Map;4".
  * String "Map" is [RECOMMENDED](spec/Recommendation-ClassMapTypePreferTermToDtmiV4.json) over string "dtmi:dtdl:class:Map;4".
  * [SHALL NOT](spec/Completion-ClassMapTypeIncludesIrrelevantDtmiOrTermV4.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "Map" or "dtmi:dtdl:class:Map;4", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassMapTypeIncludesInvalidDtmiV4.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MUST NOT](spec/Requirement-ClassMapTypeIncludesNotDtmiNorTermV4.json) include any string that contains ":" but does not start with "dtmi:".
  * [SHALL NOT](spec/Completion-ClassMapTypeIncludesUndefinedTermV4.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
* mapKey
  * Value [MUST](spec/Requirement-ClassMapPropertyMapKeyElementV4.json) be a DTDL element, a dependent reference to DTDL element, or an array containing exactly one DTDL element or dependent reference to a DTDL element.
  * If the value is a dependent reference or an array containing a dependent reference, the model [SHALL](spec/Completion-ClassMapPropertyMapKeyDependentReferenceV4.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * The included or referentially included DTDL element [MUST](spec/Requirement-ClassMapPropertyMapKeyTypeConformanceV4.json) conform to the definition of DTDL element [MapKey](#mapkey).
  * Member name [MAY](spec/Allowance-ClassMapPropertyMapKeyDtmiV4.json) be expressed as "dtmi:dtdl:property:mapKey;4" instead of "mapKey", but "mapKey" is [RECOMMENDED](spec/Recommendation-ClassMapPropertyMapKeyTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapPropertyMapKeyTermAndDtmiV4.json) be expressed as both "mapKey" and "dtmi:dtdl:property:mapKey;4".
* mapValue
  * Value [MUST](spec/Requirement-ClassMapPropertyMapValueElementV4.json) be a DTDL element, a dependent reference to DTDL element, or an array containing exactly one DTDL element or dependent reference to a DTDL element.
  * If the value is a dependent reference or an array containing a dependent reference, the model [SHALL](spec/Completion-ClassMapPropertyMapValueDependentReferenceV4.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * The included or referentially included DTDL element [MUST](spec/Requirement-ClassMapPropertyMapValueTypeConformanceV4.json) conform to the definition of DTDL element [MapValue](#mapvalue).
  * Member name [MAY](spec/Allowance-ClassMapPropertyMapValueDtmiV4.json) be expressed as "dtmi:dtdl:property:mapValue;4" instead of "mapValue", but "mapValue" is [RECOMMENDED](spec/Recommendation-ClassMapPropertyMapValueTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapPropertyMapValueTermAndDtmiV4.json) be expressed as both "mapValue" and "dtmi:dtdl:property:mapValue;4".

The following members are [OPTIONAL](spec/Allowance-ClassMapOptionalPropertiesV4.json) unless otherwise noted:

* @context
  * [MUST](spec/Requirement-ClassMapContextConformsV4.json) conform to the specified [context](#context) rules.
* @id
  * [REQUIRED](spec/Requirement-ClassMapIdRequiredV4.json) when the Map element is included in Interface member "schemas".
  * Value [MUST](spec/Requirement-ClassMapIdIsDtmiV4.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassMapIdNotArrayV4.json) be an array.
  * Value [MUST](spec/Requirement-ClassMapIdDuplicateV4.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassMapPropertyCommentStringV4.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassMapPropertyCommentStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassMapPropertyCommentDtmiV4.json) be expressed as "dtmi:dtdl:property:comment;4" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassMapPropertyCommentTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapPropertyCommentTermAndDtmiV4.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;4".
* description
  * Value [MUST](spec/Requirement-ClassMapPropertyDescriptionLangStringV4.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassMapPropertyDescriptionStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassMapPropertyDescriptionDtmiV4.json) be expressed as "dtmi:dtdl:property:description;4" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassMapPropertyDescriptionTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapPropertyDescriptionTermAndDtmiV4.json) be expressed as both "description" and "dtmi:dtdl:property:description;4".
* displayName
  * Value [MUST](spec/Requirement-ClassMapPropertyDisplayNameLangStringV4.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassMapPropertyDisplayNameStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassMapPropertyDisplayNameDtmiV4.json) be expressed as "dtmi:dtdl:property:displayName;4" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassMapPropertyDisplayNameTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapPropertyDisplayNameTermAndDtmiV4.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;4".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* Members with names starting with "@" other than "@context", "@id", and "@type" [MUST NOT](spec/Requirement-ClassMapInvalidKeywordsV4.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [SHALL NOT](spec/Completion-ClassMapPropertyIrrelevantDtmiOrTermV4.json) be present if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "mapKey", "mapValue", "dtmi:dtdl:property:comment;4", "dtmi:dtdl:property:description;4", "dtmi:dtdl:property:displayName;4", "dtmi:dtdl:property:mapKey;4", "dtmi:dtdl:property:mapValue;4".
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassMapPropertyFormallyIrrelevantDtmiOrTermV4.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "mapKey", "mapValue", "dtmi:dtdl:property:comment;4", "dtmi:dtdl:property:description;4", "dtmi:dtdl:property:displayName;4", "dtmi:dtdl:property:mapKey;4", "dtmi:dtdl:property:mapValue;4".
* A member [MUST NOT](spec/Requirement-ClassMapPropertyInvalidDtmiV4.json) be present if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassMapPropertyNotDtmiNorTermV4.json) be present if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [SHALL NOT](spec/Completion-ClassMapPropertyUndefinedTermV4.json) be present if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassMapPropertyFormallyUndefinedTermV4.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### MapKey

Example:

```json
{
  "@context": "dtmi:dtdl:context;4",
  "@id": "dtmi:example:epsilon_alpha;1",
  "@type": "Interface",
  "schemas": {
    "@id": "dtmi:example:delta_vroo;1",
    "@type": "Map",
    "mapValue": {
      "name": "delta_hi",
      "schema": "decimal"
    },
    "mapKey": {
      "name": "delta_yekk",
      "schema": "string"
    }
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassMapKeyRequiredPropertiesV4.json):

* name
  * Value [MUST](spec/Requirement-ClassMapKeyPropertyNameStringV4.json) be a [representational string](#representational-string) or an array containing exactly one representational string.
  * String value [MUST NOT](spec/Requirement-ClassMapKeyPropertyNameStringLengthV4.json) be more than 512 characters in length.
  * String value [MUST](spec/Requirement-ClassMapKeyPropertyNamePatternV4.json) match regular expression `^[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?$`.
  * Member name [MAY](spec/Allowance-ClassMapKeyPropertyNameDtmiV4.json) be expressed as "dtmi:dtdl:property:name;4" instead of "name", but "name" is [RECOMMENDED](spec/Recommendation-ClassMapKeyPropertyNameTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapKeyPropertyNameTermAndDtmiV4.json) be expressed as both "name" and "dtmi:dtdl:property:name;4".
* schema
  * Value [MUST](spec/Requirement-ClassMapKeyPropertySchemaSpecificValuesV4.json) be "string", "dtmi:dtdl:instance:Schema:string;4", "dtmi:dtdl:instance:Schema:string;3", "dtmi:dtdl:instance:Schema:string;2", or an array containing exactly one of these string values.
  * Value "string" is [RECOMMENDED](spec/Recommendation-ClassMapKeyPropertySchemaValueStringPreferToDtmiV4.json) over value dtmi:dtdl:instance:Schema:string;4.
  * Considered with other DTDL elements, value is subject to any relevant restrictions in [Limits and exclusions](#limits-and-exclusions).
  * Member name [MAY](spec/Allowance-ClassMapKeyPropertySchemaDtmiV4.json) be expressed as "dtmi:dtdl:property:schema;4" instead of "schema", but "schema" is [RECOMMENDED](spec/Recommendation-ClassMapKeyPropertySchemaTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapKeyPropertySchemaTermAndDtmiV4.json) be expressed as both "schema" and "dtmi:dtdl:property:schema;4".

The following members are [OPTIONAL](spec/Allowance-ClassMapKeyOptionalPropertiesV4.json):

* @context
  * [MUST](spec/Requirement-ClassMapKeyContextConformsV4.json) conform to the specified [context](#context) rules.
* @type
  * Value [MUST](spec/Requirement-ClassMapKeyTypeStringOrArrayV4.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassMapKeyTypeIncludesMaterialV4.json) include either string "MapKey" or string "dtmi:dtdl:class:MapKey;4".
  * [SHOULD NOT](spec/Recommendation-ClassMapKeyTypeIncludesTermAndDtmiV4.json) include both "MapKey" and "dtmi:dtdl:class:MapKey;4".
  * [SHOULD NOT](spec/Recommendation-ClassMapKeyTypeDuplicatesMaterialV4.json) include more than one instance of either "MapKey" or "dtmi:dtdl:class:MapKey;4".
  * String "MapKey" is [RECOMMENDED](spec/Recommendation-ClassMapKeyTypePreferTermToDtmiV4.json) over string "dtmi:dtdl:class:MapKey;4".
  * [SHALL NOT](spec/Completion-ClassMapKeyTypeIncludesIrrelevantDtmiOrTermV4.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "MapKey" or "dtmi:dtdl:class:MapKey;4", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassMapKeyTypeIncludesInvalidDtmiV4.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MUST NOT](spec/Requirement-ClassMapKeyTypeIncludesNotDtmiNorTermV4.json) include any string that contains ":" but does not start with "dtmi:".
  * [SHALL NOT](spec/Completion-ClassMapKeyTypeIncludesUndefinedTermV4.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
* @id
  * Value [MUST](spec/Requirement-ClassMapKeyIdIsDtmiV4.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassMapKeyIdNotArrayV4.json) be an array.
  * Value [MUST](spec/Requirement-ClassMapKeyIdDuplicateV4.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassMapKeyPropertyCommentStringV4.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassMapKeyPropertyCommentStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassMapKeyPropertyCommentDtmiV4.json) be expressed as "dtmi:dtdl:property:comment;4" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassMapKeyPropertyCommentTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapKeyPropertyCommentTermAndDtmiV4.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;4".
* description
  * Value [MUST](spec/Requirement-ClassMapKeyPropertyDescriptionLangStringV4.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassMapKeyPropertyDescriptionStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassMapKeyPropertyDescriptionDtmiV4.json) be expressed as "dtmi:dtdl:property:description;4" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassMapKeyPropertyDescriptionTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapKeyPropertyDescriptionTermAndDtmiV4.json) be expressed as both "description" and "dtmi:dtdl:property:description;4".
* displayName
  * Value [MUST](spec/Requirement-ClassMapKeyPropertyDisplayNameLangStringV4.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassMapKeyPropertyDisplayNameStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassMapKeyPropertyDisplayNameDtmiV4.json) be expressed as "dtmi:dtdl:property:displayName;4" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassMapKeyPropertyDisplayNameTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapKeyPropertyDisplayNameTermAndDtmiV4.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;4".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* Members with names starting with "@" other than "@context", "@id", and "@type" [MUST NOT](spec/Requirement-ClassMapKeyInvalidKeywordsV4.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [SHALL NOT](spec/Completion-ClassMapKeyPropertyIrrelevantDtmiOrTermV4.json) be present if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "name", "schema", "dtmi:dtdl:property:comment;4", "dtmi:dtdl:property:description;4", "dtmi:dtdl:property:displayName;4", "dtmi:dtdl:property:name;4", "dtmi:dtdl:property:schema;4".
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassMapKeyPropertyFormallyIrrelevantDtmiOrTermV4.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "name", "schema", "dtmi:dtdl:property:comment;4", "dtmi:dtdl:property:description;4", "dtmi:dtdl:property:displayName;4", "dtmi:dtdl:property:name;4", "dtmi:dtdl:property:schema;4".
* A member [MUST NOT](spec/Requirement-ClassMapKeyPropertyInvalidDtmiV4.json) be present if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassMapKeyPropertyNotDtmiNorTermV4.json) be present if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [SHALL NOT](spec/Completion-ClassMapKeyPropertyUndefinedTermV4.json) be present if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassMapKeyPropertyFormallyUndefinedTermV4.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### MapValue

Example:

```json
{
  "@context": "dtmi:dtdl:context;4",
  "@id": "dtmi:example:epsilon_epsilon;1",
  "@type": "Interface",
  "schemas": {
    "@id": "dtmi:example:epsilon_gamma;1",
    "@type": "Map",
    "mapKey": {
      "name": "epsilon_delta",
      "schema": "string"
    },
    "mapValue": {
      "name": "epsilon_beta",
      "schema": "double"
    }
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassMapValueRequiredPropertiesV4.json):

* name
  * Value [MUST](spec/Requirement-ClassMapValuePropertyNameStringV4.json) be a [representational string](#representational-string) or an array containing exactly one representational string.
  * String value [MUST NOT](spec/Requirement-ClassMapValuePropertyNameStringLengthV4.json) be more than 512 characters in length.
  * String value [MUST](spec/Requirement-ClassMapValuePropertyNamePatternV4.json) match regular expression `^[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?$`.
  * Member name [MAY](spec/Allowance-ClassMapValuePropertyNameDtmiV4.json) be expressed as "dtmi:dtdl:property:name;4" instead of "name", but "name" is [RECOMMENDED](spec/Recommendation-ClassMapValuePropertyNameTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapValuePropertyNameTermAndDtmiV4.json) be expressed as both "name" and "dtmi:dtdl:property:name;4".
* schema
  * Value [MUST](spec/Requirement-ClassMapValuePropertySchemaElementV4.json) be a DTDL element, a dependent reference to a DTDL element, a string from one of the rows in a [Standard schemas](#standard-schemas) table, a string defined by an extension referenced in the active context, or an array containing exactly one DTDL element, dependent reference to a DTDL element, string from one of the rows in a Standard schemas table, or string defined by an extension referenced in the active context.
  * If the value is a dependent reference or an array containing a dependent reference, the model [SHALL](spec/Completion-ClassMapValuePropertySchemaDependentReferenceV4.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * If present, an included or referentially included DTDL element [MUST](spec/Requirement-ClassMapValuePropertySchemaTypeConformanceV4.json) conform to the definition of DTDL element [Array](#array) or [Enum](#enum) or [Map](#map) or [Object](#object) or DTDLv3 element [Array](../v3/DTDL.Specification.v3.md#array) or [Enum](../v3/DTDL.Specification.v3.md#enum) or [Map](../v3/DTDL.Specification.v3.md#map) or [Object](../v3/DTDL.Specification.v3.md#object) or DTDLv2 element [Array](../v2/DTDL.Specification.v2.md#array) or [Enum](../v2/DTDL.Specification.v2.md#enum) or [Map](../v2/DTDL.Specification.v2.md#map) or [Object](../v2/DTDL.Specification.v2.md#object).
  * If a string from one of the rows in a Standard schemas table is included, a string from column "Term" is [RECOMMENDED](spec/Recommendation-ClassMapValuePropertySchemaPreferTermToDtmiV4.json) over a string from column "DTMI".
  * Considered with other DTDL elements, value is subject to any relevant restrictions in [Limits and exclusions](#limits-and-exclusions).
  * Member name [MAY](spec/Allowance-ClassMapValuePropertySchemaDtmiV4.json) be expressed as "dtmi:dtdl:property:schema;4" instead of "schema", but "schema" is [RECOMMENDED](spec/Recommendation-ClassMapValuePropertySchemaTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapValuePropertySchemaTermAndDtmiV4.json) be expressed as both "schema" and "dtmi:dtdl:property:schema;4".

The following members are [OPTIONAL](spec/Allowance-ClassMapValueOptionalPropertiesV4.json):

* @context
  * [MUST](spec/Requirement-ClassMapValueContextConformsV4.json) conform to the specified [context](#context) rules.
* @type
  * Value [MUST](spec/Requirement-ClassMapValueTypeStringOrArrayV4.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassMapValueTypeIncludesMaterialV4.json) include either string "MapValue" or string "dtmi:dtdl:class:MapValue;4".
  * [SHOULD NOT](spec/Recommendation-ClassMapValueTypeIncludesTermAndDtmiV4.json) include both "MapValue" and "dtmi:dtdl:class:MapValue;4".
  * [SHOULD NOT](spec/Recommendation-ClassMapValueTypeDuplicatesMaterialV4.json) include more than one instance of either "MapValue" or "dtmi:dtdl:class:MapValue;4".
  * String "MapValue" is [RECOMMENDED](spec/Recommendation-ClassMapValueTypePreferTermToDtmiV4.json) over string "dtmi:dtdl:class:MapValue;4".
  * [SHALL NOT](spec/Completion-ClassMapValueTypeIncludesIrrelevantDtmiOrTermV4.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "MapValue" or "dtmi:dtdl:class:MapValue;4", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassMapValueTypeIncludesInvalidDtmiV4.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MUST NOT](spec/Requirement-ClassMapValueTypeIncludesNotDtmiNorTermV4.json) include any string that contains ":" but does not start with "dtmi:".
  * [SHALL NOT](spec/Completion-ClassMapValueTypeIncludesUndefinedTermV4.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
* @id
  * Value [MUST](spec/Requirement-ClassMapValueIdIsDtmiV4.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassMapValueIdNotArrayV4.json) be an array.
  * Value [MUST](spec/Requirement-ClassMapValueIdDuplicateV4.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassMapValuePropertyCommentStringV4.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassMapValuePropertyCommentStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassMapValuePropertyCommentDtmiV4.json) be expressed as "dtmi:dtdl:property:comment;4" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassMapValuePropertyCommentTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapValuePropertyCommentTermAndDtmiV4.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;4".
* description
  * Value [MUST](spec/Requirement-ClassMapValuePropertyDescriptionLangStringV4.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassMapValuePropertyDescriptionStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassMapValuePropertyDescriptionDtmiV4.json) be expressed as "dtmi:dtdl:property:description;4" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassMapValuePropertyDescriptionTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapValuePropertyDescriptionTermAndDtmiV4.json) be expressed as both "description" and "dtmi:dtdl:property:description;4".
* displayName
  * Value [MUST](spec/Requirement-ClassMapValuePropertyDisplayNameLangStringV4.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassMapValuePropertyDisplayNameStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassMapValuePropertyDisplayNameDtmiV4.json) be expressed as "dtmi:dtdl:property:displayName;4" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassMapValuePropertyDisplayNameTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapValuePropertyDisplayNameTermAndDtmiV4.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;4".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* Members with names starting with "@" other than "@context", "@id", and "@type" [MUST NOT](spec/Requirement-ClassMapValueInvalidKeywordsV4.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [SHALL NOT](spec/Completion-ClassMapValuePropertyIrrelevantDtmiOrTermV4.json) be present if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "name", "schema", "dtmi:dtdl:property:comment;4", "dtmi:dtdl:property:description;4", "dtmi:dtdl:property:displayName;4", "dtmi:dtdl:property:name;4", "dtmi:dtdl:property:schema;4".
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassMapValuePropertyFormallyIrrelevantDtmiOrTermV4.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "name", "schema", "dtmi:dtdl:property:comment;4", "dtmi:dtdl:property:description;4", "dtmi:dtdl:property:displayName;4", "dtmi:dtdl:property:name;4", "dtmi:dtdl:property:schema;4".
* A member [MUST NOT](spec/Requirement-ClassMapValuePropertyInvalidDtmiV4.json) be present if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassMapValuePropertyNotDtmiNorTermV4.json) be present if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [SHALL NOT](spec/Completion-ClassMapValuePropertyUndefinedTermV4.json) be present if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassMapValuePropertyFormallyUndefinedTermV4.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### Object

Example:

```json
{
  "@context": "dtmi:dtdl:context;4",
  "@id": "dtmi:example:epsilon_eta;1",
  "@type": "Interface",
  "schemas": {
    "@id": "dtmi:example:epsilon_zeta;1",
    "@type": "Object"
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassObjectRequiredPropertiesV4.json):

* @type
  * Value [MUST](spec/Requirement-ClassObjectTypeStringOrArrayV4.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassObjectTypeIncludesMaterialV4.json) include either string "Object" or string "dtmi:dtdl:class:Object;4".
  * [SHOULD NOT](spec/Recommendation-ClassObjectTypeIncludesTermAndDtmiV4.json) include both "Object" and "dtmi:dtdl:class:Object;4".
  * [SHOULD NOT](spec/Recommendation-ClassObjectTypeDuplicatesMaterialV4.json) include more than one instance of either "Object" or "dtmi:dtdl:class:Object;4".
  * String "Object" is [RECOMMENDED](spec/Recommendation-ClassObjectTypePreferTermToDtmiV4.json) over string "dtmi:dtdl:class:Object;4".
  * [SHALL NOT](spec/Completion-ClassObjectTypeIncludesIrrelevantDtmiOrTermV4.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "Object" or "dtmi:dtdl:class:Object;4", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassObjectTypeIncludesInvalidDtmiV4.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MUST NOT](spec/Requirement-ClassObjectTypeIncludesNotDtmiNorTermV4.json) include any string that contains ":" but does not start with "dtmi:".
  * [SHALL NOT](spec/Completion-ClassObjectTypeIncludesUndefinedTermV4.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.

The following members are [OPTIONAL](spec/Allowance-ClassObjectOptionalPropertiesV4.json) unless otherwise noted:

* @context
  * [MUST](spec/Requirement-ClassObjectContextConformsV4.json) conform to the specified [context](#context) rules.
* @id
  * [REQUIRED](spec/Requirement-ClassObjectIdRequiredV4.json) when the Object element is included in Interface member "schemas".
  * Value [MUST](spec/Requirement-ClassObjectIdIsDtmiV4.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassObjectIdNotArrayV4.json) be an array.
  * Value [MUST](spec/Requirement-ClassObjectIdDuplicateV4.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassObjectPropertyCommentStringV4.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassObjectPropertyCommentStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassObjectPropertyCommentDtmiV4.json) be expressed as "dtmi:dtdl:property:comment;4" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassObjectPropertyCommentTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassObjectPropertyCommentTermAndDtmiV4.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;4".
* description
  * Value [MUST](spec/Requirement-ClassObjectPropertyDescriptionLangStringV4.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassObjectPropertyDescriptionStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassObjectPropertyDescriptionDtmiV4.json) be expressed as "dtmi:dtdl:property:description;4" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassObjectPropertyDescriptionTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassObjectPropertyDescriptionTermAndDtmiV4.json) be expressed as both "description" and "dtmi:dtdl:property:description;4".
* displayName
  * Value [MUST](spec/Requirement-ClassObjectPropertyDisplayNameLangStringV4.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassObjectPropertyDisplayNameStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassObjectPropertyDisplayNameDtmiV4.json) be expressed as "dtmi:dtdl:property:displayName;4" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassObjectPropertyDisplayNameTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassObjectPropertyDisplayNameTermAndDtmiV4.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;4".
* fields
  * Value [MUST](spec/Requirement-ClassObjectPropertyFieldsElementV4.json) be a DTDL element, a dependent reference to DTDL element, or an array of DTDL elements and dependent references to DTDL elements.
  * For each included dependent reference, the model [SHALL](spec/Completion-ClassObjectPropertyFieldsDependentReferenceV4.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * Each included or referentially included DTDL element [MUST](spec/Requirement-ClassObjectPropertyFieldsTypeConformanceV4.json) conform to the definition of DTDL element [Field](#field).
  * Member name [MAY](spec/Allowance-ClassObjectPropertyFieldsDtmiV4.json) be expressed as "dtmi:dtdl:property:fields;4" instead of "fields", but "fields" is [RECOMMENDED](spec/Recommendation-ClassObjectPropertyFieldsTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassObjectPropertyFieldsTermAndDtmiV4.json) be expressed as both "fields" and "dtmi:dtdl:property:fields;4".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* Members with names starting with "@" other than "@context", "@id", and "@type" [MUST NOT](spec/Requirement-ClassObjectInvalidKeywordsV4.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [SHALL NOT](spec/Completion-ClassObjectPropertyIrrelevantDtmiOrTermV4.json) be present if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "fields", "dtmi:dtdl:property:comment;4", "dtmi:dtdl:property:description;4", "dtmi:dtdl:property:displayName;4", "dtmi:dtdl:property:fields;4".
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassObjectPropertyFormallyIrrelevantDtmiOrTermV4.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "fields", "dtmi:dtdl:property:comment;4", "dtmi:dtdl:property:description;4", "dtmi:dtdl:property:displayName;4", "dtmi:dtdl:property:fields;4".
* A member [MUST NOT](spec/Requirement-ClassObjectPropertyInvalidDtmiV4.json) be present if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassObjectPropertyNotDtmiNorTermV4.json) be present if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [SHALL NOT](spec/Completion-ClassObjectPropertyUndefinedTermV4.json) be present if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassObjectPropertyFormallyUndefinedTermV4.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### Property

Example:

```json
{
  "@context": "dtmi:dtdl:context;4",
  "@id": "dtmi:example:epsilon_iota;1",
  "@type": "Interface",
  "contents": {
    "@type": "Property",
    "name": "epsilon_theta",
    "schema": "duration"
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassPropertyRequiredPropertiesV4.json):

* @type
  * Value [MUST](spec/Requirement-ClassPropertyTypeStringOrArrayV4.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassPropertyTypeIncludesMaterialV4.json) include either string "Property" or string "dtmi:dtdl:class:Property;4".
  * [SHOULD NOT](spec/Recommendation-ClassPropertyTypeIncludesTermAndDtmiV4.json) include both "Property" and "dtmi:dtdl:class:Property;4".
  * [SHOULD NOT](spec/Recommendation-ClassPropertyTypeDuplicatesMaterialV4.json) include more than one instance of either "Property" or "dtmi:dtdl:class:Property;4".
  * String "Property" is [RECOMMENDED](spec/Recommendation-ClassPropertyTypePreferTermToDtmiV4.json) over string "dtmi:dtdl:class:Property;4".
  * [SHALL NOT](spec/Completion-ClassPropertyTypeIncludesIrrelevantDtmiOrTermV4.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "Property" or "dtmi:dtdl:class:Property;4", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassPropertyTypeIncludesInvalidDtmiV4.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MUST NOT](spec/Requirement-ClassPropertyTypeIncludesNotDtmiNorTermV4.json) include any string that contains ":" but does not start with "dtmi:".
  * [SHALL NOT](spec/Completion-ClassPropertyTypeIncludesUndefinedTermV4.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
* name
  * Value [MUST](spec/Requirement-ClassPropertyPropertyNameStringV4.json) be a [representational string](#representational-string) or an array containing exactly one representational string.
  * String value [MUST NOT](spec/Requirement-ClassPropertyPropertyNameStringLengthV4.json) be more than 512 characters in length.
  * String value [MUST](spec/Requirement-ClassPropertyPropertyNamePatternV4.json) match regular expression `^[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?$`.
  * String value [MUST](spec/Requirement-ClassPropertyPropertyNameUniqueAmongInterfaceContentsV4.json) be unique among the included values of "name" members of all elements included or referentially included in the "contents" member of any parent [Interface](#interface) element.
  * String value [MUST](spec/Requirement-ClassPropertyPropertyNameUniqueAmongRelationshipPropertiesV4.json) be unique among the included values of "name" members of all elements included or referentially included in the "properties" member of any parent [Relationship](#relationship) element.
  * Member name [MAY](spec/Allowance-ClassPropertyPropertyNameDtmiV4.json) be expressed as "dtmi:dtdl:property:name;4" instead of "name", but "name" is [RECOMMENDED](spec/Recommendation-ClassPropertyPropertyNameTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassPropertyPropertyNameTermAndDtmiV4.json) be expressed as both "name" and "dtmi:dtdl:property:name;4".
* schema
  * Value [MUST](spec/Requirement-ClassPropertyPropertySchemaElementV4.json) be a DTDL element, a dependent reference to a DTDL element, a string from one of the rows in a [Standard schemas](#standard-schemas) table, a string defined by an extension referenced in the active context, or an array containing exactly one DTDL element, dependent reference to a DTDL element, string from one of the rows in a Standard schemas table, or string defined by an extension referenced in the active context.
  * If the value is a dependent reference or an array containing a dependent reference, the model [SHALL](spec/Completion-ClassPropertyPropertySchemaDependentReferenceV4.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * If present, an included or referentially included DTDL element [MUST](spec/Requirement-ClassPropertyPropertySchemaTypeConformanceV4.json) conform to the definition of DTDL element [Array](#array) or [Enum](#enum) or [Map](#map) or [Object](#object) or DTDLv3 element [Array](../v3/DTDL.Specification.v3.md#array) or [Enum](../v3/DTDL.Specification.v3.md#enum) or [Map](../v3/DTDL.Specification.v3.md#map) or [Object](../v3/DTDL.Specification.v3.md#object) or DTDLv2 element [Array](../v2/DTDL.Specification.v2.md#array) or [Enum](../v2/DTDL.Specification.v2.md#enum) or [Map](../v2/DTDL.Specification.v2.md#map) or [Object](../v2/DTDL.Specification.v2.md#object).
  * If a string from one of the rows in a Standard schemas table is included, a string from column "Term" is [RECOMMENDED](spec/Recommendation-ClassPropertyPropertySchemaPreferTermToDtmiV4.json) over a string from column "DTMI".
  * Member name [MAY](spec/Allowance-ClassPropertyPropertySchemaDtmiV4.json) be expressed as "dtmi:dtdl:property:schema;4" instead of "schema", but "schema" is [RECOMMENDED](spec/Recommendation-ClassPropertyPropertySchemaTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassPropertyPropertySchemaTermAndDtmiV4.json) be expressed as both "schema" and "dtmi:dtdl:property:schema;4".

The following members are [OPTIONAL](spec/Allowance-ClassPropertyOptionalPropertiesV4.json):

* @context
  * [MUST](spec/Requirement-ClassPropertyContextConformsV4.json) conform to the specified [context](#context) rules.
* @id
  * Value [MUST](spec/Requirement-ClassPropertyIdIsDtmiV4.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassPropertyIdNotArrayV4.json) be an array.
  * Value [MUST](spec/Requirement-ClassPropertyIdDuplicateV4.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassPropertyPropertyCommentStringV4.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassPropertyPropertyCommentStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassPropertyPropertyCommentDtmiV4.json) be expressed as "dtmi:dtdl:property:comment;4" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassPropertyPropertyCommentTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassPropertyPropertyCommentTermAndDtmiV4.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;4".
* description
  * Value [MUST](spec/Requirement-ClassPropertyPropertyDescriptionLangStringV4.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassPropertyPropertyDescriptionStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassPropertyPropertyDescriptionDtmiV4.json) be expressed as "dtmi:dtdl:property:description;4" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassPropertyPropertyDescriptionTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassPropertyPropertyDescriptionTermAndDtmiV4.json) be expressed as both "description" and "dtmi:dtdl:property:description;4".
* displayName
  * Value [MUST](spec/Requirement-ClassPropertyPropertyDisplayNameLangStringV4.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassPropertyPropertyDisplayNameStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassPropertyPropertyDisplayNameDtmiV4.json) be expressed as "dtmi:dtdl:property:displayName;4" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassPropertyPropertyDisplayNameTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassPropertyPropertyDisplayNameTermAndDtmiV4.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;4".
* writable
  * Value [MUST](spec/Requirement-ClassPropertyPropertyWritableBooleanV4.json) be a [representational boolean](#representational-boolean) or an array containing no more than one representational boolean.
  * Member name [MAY](spec/Allowance-ClassPropertyPropertyWritableDtmiV4.json) be expressed as "dtmi:dtdl:property:writable;4" instead of "writable", but "writable" is [RECOMMENDED](spec/Recommendation-ClassPropertyPropertyWritableTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassPropertyPropertyWritableTermAndDtmiV4.json) be expressed as both "writable" and "dtmi:dtdl:property:writable;4".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* Members with names starting with "@" other than "@context", "@id", and "@type" [MUST NOT](spec/Requirement-ClassPropertyInvalidKeywordsV4.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [SHALL NOT](spec/Completion-ClassPropertyPropertyIrrelevantDtmiOrTermV4.json) be present if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "name", "schema", "writable", "dtmi:dtdl:property:comment;4", "dtmi:dtdl:property:description;4", "dtmi:dtdl:property:displayName;4", "dtmi:dtdl:property:name;4", "dtmi:dtdl:property:schema;4", "dtmi:dtdl:property:writable;4".
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassPropertyPropertyFormallyIrrelevantDtmiOrTermV4.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "name", "schema", "writable", "dtmi:dtdl:property:comment;4", "dtmi:dtdl:property:description;4", "dtmi:dtdl:property:displayName;4", "dtmi:dtdl:property:name;4", "dtmi:dtdl:property:schema;4", "dtmi:dtdl:property:writable;4".
* A member [MUST NOT](spec/Requirement-ClassPropertyPropertyInvalidDtmiV4.json) be present if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassPropertyPropertyNotDtmiNorTermV4.json) be present if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [SHALL NOT](spec/Completion-ClassPropertyPropertyUndefinedTermV4.json) be present if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassPropertyPropertyFormallyUndefinedTermV4.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### Relationship

Example:

```json
{
  "@context": "dtmi:dtdl:context;4",
  "@id": "dtmi:example:epsilon_omicron;1",
  "@type": "Interface",
  "contents": {
    "@type": "Relationship",
    "name": "epsilon_xi"
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassRelationshipRequiredPropertiesV4.json):

* @type
  * Value [MUST](spec/Requirement-ClassRelationshipTypeStringOrArrayV4.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassRelationshipTypeIncludesMaterialV4.json) include either string "Relationship" or string "dtmi:dtdl:class:Relationship;4".
  * [SHOULD NOT](spec/Recommendation-ClassRelationshipTypeIncludesTermAndDtmiV4.json) include both "Relationship" and "dtmi:dtdl:class:Relationship;4".
  * [SHOULD NOT](spec/Recommendation-ClassRelationshipTypeDuplicatesMaterialV4.json) include more than one instance of either "Relationship" or "dtmi:dtdl:class:Relationship;4".
  * String "Relationship" is [RECOMMENDED](spec/Recommendation-ClassRelationshipTypePreferTermToDtmiV4.json) over string "dtmi:dtdl:class:Relationship;4".
  * [SHALL NOT](spec/Completion-ClassRelationshipTypeIncludesIrrelevantDtmiOrTermV4.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "Relationship" or "dtmi:dtdl:class:Relationship;4", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassRelationshipTypeIncludesInvalidDtmiV4.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MUST NOT](spec/Requirement-ClassRelationshipTypeIncludesNotDtmiNorTermV4.json) include any string that contains ":" but does not start with "dtmi:".
  * [SHALL NOT](spec/Completion-ClassRelationshipTypeIncludesUndefinedTermV4.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
* name
  * Value [MUST](spec/Requirement-ClassRelationshipPropertyNameStringV4.json) be a [representational string](#representational-string) or an array containing exactly one representational string.
  * String value [MUST NOT](spec/Requirement-ClassRelationshipPropertyNameStringLengthV4.json) be more than 512 characters in length.
  * String value [MUST](spec/Requirement-ClassRelationshipPropertyNamePatternV4.json) match regular expression `^[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?$`.
  * String value [MUST](spec/Requirement-ClassRelationshipPropertyNameUniqueAmongInterfaceContentsV4.json) be unique among the included values of "name" members of all elements included or referentially included in the "contents" member of any parent [Interface](#interface) element.
  * Member name [MAY](spec/Allowance-ClassRelationshipPropertyNameDtmiV4.json) be expressed as "dtmi:dtdl:property:name;4" instead of "name", but "name" is [RECOMMENDED](spec/Recommendation-ClassRelationshipPropertyNameTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassRelationshipPropertyNameTermAndDtmiV4.json) be expressed as both "name" and "dtmi:dtdl:property:name;4".

The following members are [OPTIONAL](spec/Allowance-ClassRelationshipOptionalPropertiesV4.json):

* @context
  * [MUST](spec/Requirement-ClassRelationshipContextConformsV4.json) conform to the specified [context](#context) rules.
* @id
  * Value [MUST](spec/Requirement-ClassRelationshipIdIsDtmiV4.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassRelationshipIdNotArrayV4.json) be an array.
  * Value [MUST](spec/Requirement-ClassRelationshipIdDuplicateV4.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassRelationshipPropertyCommentStringV4.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassRelationshipPropertyCommentStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassRelationshipPropertyCommentDtmiV4.json) be expressed as "dtmi:dtdl:property:comment;4" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassRelationshipPropertyCommentTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassRelationshipPropertyCommentTermAndDtmiV4.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;4".
* description
  * Value [MUST](spec/Requirement-ClassRelationshipPropertyDescriptionLangStringV4.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassRelationshipPropertyDescriptionStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassRelationshipPropertyDescriptionDtmiV4.json) be expressed as "dtmi:dtdl:property:description;4" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassRelationshipPropertyDescriptionTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassRelationshipPropertyDescriptionTermAndDtmiV4.json) be expressed as both "description" and "dtmi:dtdl:property:description;4".
* displayName
  * Value [MUST](spec/Requirement-ClassRelationshipPropertyDisplayNameLangStringV4.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassRelationshipPropertyDisplayNameStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassRelationshipPropertyDisplayNameDtmiV4.json) be expressed as "dtmi:dtdl:property:displayName;4" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassRelationshipPropertyDisplayNameTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassRelationshipPropertyDisplayNameTermAndDtmiV4.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;4".
* maxMultiplicity
  * Value [MUST](spec/Requirement-ClassRelationshipPropertyMaxMultiplicityIntegerV4.json) be a [representational integer](#representational-integer) or an array containing no more than one representational integer.
  * If present, integer value [MUST NOT](spec/Requirement-ClassRelationshipPropertyMaxMultiplicityMinValueV4.json) be less than 1.
  * Member name [MAY](spec/Allowance-ClassRelationshipPropertyMaxMultiplicityDtmiV4.json) be expressed as "dtmi:dtdl:property:maxMultiplicity;4" instead of "maxMultiplicity", but "maxMultiplicity" is [RECOMMENDED](spec/Recommendation-ClassRelationshipPropertyMaxMultiplicityTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassRelationshipPropertyMaxMultiplicityTermAndDtmiV4.json) be expressed as both "maxMultiplicity" and "dtmi:dtdl:property:maxMultiplicity;4".
* minMultiplicity
  * Value [MUST](spec/Requirement-ClassRelationshipPropertyMinMultiplicityIntegerV4.json) be a [representational integer](#representational-integer) or an array containing no more than one representational integer.
  * If present, integer value [MUST](spec/Requirement-ClassRelationshipPropertyMinMultiplicityExactValueV4.json) be 0.
  * Member name [MAY](spec/Allowance-ClassRelationshipPropertyMinMultiplicityDtmiV4.json) be expressed as "dtmi:dtdl:property:minMultiplicity;4" instead of "minMultiplicity", but "minMultiplicity" is [RECOMMENDED](spec/Recommendation-ClassRelationshipPropertyMinMultiplicityTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassRelationshipPropertyMinMultiplicityTermAndDtmiV4.json) be expressed as both "minMultiplicity" and "dtmi:dtdl:property:minMultiplicity;4".
* properties
  * Value [MUST](spec/Requirement-ClassRelationshipPropertyPropertiesElementV4.json) be a DTDL element, a dependent reference to DTDL element, or an array of DTDL elements and dependent references to DTDL elements.
  * For each included dependent reference, the model [SHALL](spec/Completion-ClassRelationshipPropertyPropertiesDependentReferenceV4.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * Each included or referentially included DTDL element [MUST](spec/Requirement-ClassRelationshipPropertyPropertiesTypeConformanceV4.json) conform to the definition of DTDL element [Property](#property) or DTDLv3 element [Property](../v3/DTDL.Specification.v3.md#property) or DTDLv2 element [Property](../v2/DTDL.Specification.v2.md#property).
  * Member name [MAY](spec/Allowance-ClassRelationshipPropertyPropertiesDtmiV4.json) be expressed as "dtmi:dtdl:property:properties;4" instead of "properties", but "properties" is [RECOMMENDED](spec/Recommendation-ClassRelationshipPropertyPropertiesTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassRelationshipPropertyPropertiesTermAndDtmiV4.json) be expressed as both "properties" and "dtmi:dtdl:property:properties;4".
* target
  * Value [MUST](spec/Requirement-ClassRelationshipPropertyTargetIsDtmiV4.json) be a DTMI or an array containing no more than one DTMI.
  * Note that any included DTMI is a non-dependent reference.
  * Member name [MAY](spec/Allowance-ClassRelationshipPropertyTargetDtmiV4.json) be expressed as "dtmi:dtdl:property:target;4" instead of "target", but "target" is [RECOMMENDED](spec/Recommendation-ClassRelationshipPropertyTargetTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassRelationshipPropertyTargetTermAndDtmiV4.json) be expressed as both "target" and "dtmi:dtdl:property:target;4".
* writable
  * Value [MUST](spec/Requirement-ClassRelationshipPropertyWritableBooleanV4.json) be a [representational boolean](#representational-boolean) or an array containing no more than one representational boolean.
  * Member name [MAY](spec/Allowance-ClassRelationshipPropertyWritableDtmiV4.json) be expressed as "dtmi:dtdl:property:writable;4" instead of "writable", but "writable" is [RECOMMENDED](spec/Recommendation-ClassRelationshipPropertyWritableTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassRelationshipPropertyWritableTermAndDtmiV4.json) be expressed as both "writable" and "dtmi:dtdl:property:writable;4".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* Members with names starting with "@" other than "@context", "@id", and "@type" [MUST NOT](spec/Requirement-ClassRelationshipInvalidKeywordsV4.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [SHALL NOT](spec/Completion-ClassRelationshipPropertyIrrelevantDtmiOrTermV4.json) be present if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "maxMultiplicity", "minMultiplicity", "name", "properties", "target", "writable", "dtmi:dtdl:property:comment;4", "dtmi:dtdl:property:description;4", "dtmi:dtdl:property:displayName;4", "dtmi:dtdl:property:maxMultiplicity;4", "dtmi:dtdl:property:minMultiplicity;4", "dtmi:dtdl:property:name;4", "dtmi:dtdl:property:properties;4", "dtmi:dtdl:property:target;4", "dtmi:dtdl:property:writable;4".
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassRelationshipPropertyFormallyIrrelevantDtmiOrTermV4.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "maxMultiplicity", "minMultiplicity", "name", "properties", "target", "writable", "dtmi:dtdl:property:comment;4", "dtmi:dtdl:property:description;4", "dtmi:dtdl:property:displayName;4", "dtmi:dtdl:property:maxMultiplicity;4", "dtmi:dtdl:property:minMultiplicity;4", "dtmi:dtdl:property:name;4", "dtmi:dtdl:property:properties;4", "dtmi:dtdl:property:target;4", "dtmi:dtdl:property:writable;4".
* A member [MUST NOT](spec/Requirement-ClassRelationshipPropertyInvalidDtmiV4.json) be present if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassRelationshipPropertyNotDtmiNorTermV4.json) be present if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [SHALL NOT](spec/Completion-ClassRelationshipPropertyUndefinedTermV4.json) be present if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassRelationshipPropertyFormallyUndefinedTermV4.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### Telemetry

Example:

```json
{
  "@context": "dtmi:dtdl:context;4",
  "@id": "dtmi:example:epsilon_tau;1",
  "@type": "Interface",
  "contents": {
    "@type": "Telemetry",
    "name": "epsilon_sigma",
    "schema": "float"
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassTelemetryRequiredPropertiesV4.json):

* @type
  * Value [MUST](spec/Requirement-ClassTelemetryTypeStringOrArrayV4.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassTelemetryTypeIncludesMaterialV4.json) include either string "Telemetry" or string "dtmi:dtdl:class:Telemetry;4".
  * [SHOULD NOT](spec/Recommendation-ClassTelemetryTypeIncludesTermAndDtmiV4.json) include both "Telemetry" and "dtmi:dtdl:class:Telemetry;4".
  * [SHOULD NOT](spec/Recommendation-ClassTelemetryTypeDuplicatesMaterialV4.json) include more than one instance of either "Telemetry" or "dtmi:dtdl:class:Telemetry;4".
  * String "Telemetry" is [RECOMMENDED](spec/Recommendation-ClassTelemetryTypePreferTermToDtmiV4.json) over string "dtmi:dtdl:class:Telemetry;4".
  * [SHALL NOT](spec/Completion-ClassTelemetryTypeIncludesIrrelevantDtmiOrTermV4.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "Telemetry" or "dtmi:dtdl:class:Telemetry;4", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassTelemetryTypeIncludesInvalidDtmiV4.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MUST NOT](spec/Requirement-ClassTelemetryTypeIncludesNotDtmiNorTermV4.json) include any string that contains ":" but does not start with "dtmi:".
  * [SHALL NOT](spec/Completion-ClassTelemetryTypeIncludesUndefinedTermV4.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
* name
  * Value [MUST](spec/Requirement-ClassTelemetryPropertyNameStringV4.json) be a [representational string](#representational-string) or an array containing exactly one representational string.
  * String value [MUST NOT](spec/Requirement-ClassTelemetryPropertyNameStringLengthV4.json) be more than 512 characters in length.
  * String value [MUST](spec/Requirement-ClassTelemetryPropertyNamePatternV4.json) match regular expression `^[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?$`.
  * String value [MUST](spec/Requirement-ClassTelemetryPropertyNameUniqueAmongInterfaceContentsV4.json) be unique among the included values of "name" members of all elements included or referentially included in the "contents" member of any parent [Interface](#interface) element.
  * Member name [MAY](spec/Allowance-ClassTelemetryPropertyNameDtmiV4.json) be expressed as "dtmi:dtdl:property:name;4" instead of "name", but "name" is [RECOMMENDED](spec/Recommendation-ClassTelemetryPropertyNameTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassTelemetryPropertyNameTermAndDtmiV4.json) be expressed as both "name" and "dtmi:dtdl:property:name;4".
* schema
  * Value [MUST](spec/Requirement-ClassTelemetryPropertySchemaElementV4.json) be a DTDL element, a dependent reference to a DTDL element, a string from one of the rows in a [Standard schemas](#standard-schemas) table, a string defined by an extension referenced in the active context, or an array containing exactly one DTDL element, dependent reference to a DTDL element, string from one of the rows in a Standard schemas table, or string defined by an extension referenced in the active context.
  * If the value is a dependent reference or an array containing a dependent reference, the model [SHALL](spec/Completion-ClassTelemetryPropertySchemaDependentReferenceV4.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * If present, an included or referentially included DTDL element [MUST](spec/Requirement-ClassTelemetryPropertySchemaTypeConformanceV4.json) conform to the definition of DTDL element [Array](#array) or [Enum](#enum) or [Map](#map) or [Object](#object) or DTDLv3 element [Array](../v3/DTDL.Specification.v3.md#array) or [Enum](../v3/DTDL.Specification.v3.md#enum) or [Map](../v3/DTDL.Specification.v3.md#map) or [Object](../v3/DTDL.Specification.v3.md#object) or DTDLv2 element [Array](../v2/DTDL.Specification.v2.md#array) or [Enum](../v2/DTDL.Specification.v2.md#enum) or [Map](../v2/DTDL.Specification.v2.md#map) or [Object](../v2/DTDL.Specification.v2.md#object).
  * If a string from one of the rows in a Standard schemas table is included, a string from column "Term" is [RECOMMENDED](spec/Recommendation-ClassTelemetryPropertySchemaPreferTermToDtmiV4.json) over a string from column "DTMI".
  * Member name [MAY](spec/Allowance-ClassTelemetryPropertySchemaDtmiV4.json) be expressed as "dtmi:dtdl:property:schema;4" instead of "schema", but "schema" is [RECOMMENDED](spec/Recommendation-ClassTelemetryPropertySchemaTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassTelemetryPropertySchemaTermAndDtmiV4.json) be expressed as both "schema" and "dtmi:dtdl:property:schema;4".

The following members are [OPTIONAL](spec/Allowance-ClassTelemetryOptionalPropertiesV4.json):

* @context
  * [MUST](spec/Requirement-ClassTelemetryContextConformsV4.json) conform to the specified [context](#context) rules.
* @id
  * Value [MUST](spec/Requirement-ClassTelemetryIdIsDtmiV4.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassTelemetryIdNotArrayV4.json) be an array.
  * Value [MUST](spec/Requirement-ClassTelemetryIdDuplicateV4.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassTelemetryPropertyCommentStringV4.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassTelemetryPropertyCommentStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassTelemetryPropertyCommentDtmiV4.json) be expressed as "dtmi:dtdl:property:comment;4" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassTelemetryPropertyCommentTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassTelemetryPropertyCommentTermAndDtmiV4.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;4".
* description
  * Value [MUST](spec/Requirement-ClassTelemetryPropertyDescriptionLangStringV4.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassTelemetryPropertyDescriptionStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassTelemetryPropertyDescriptionDtmiV4.json) be expressed as "dtmi:dtdl:property:description;4" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassTelemetryPropertyDescriptionTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassTelemetryPropertyDescriptionTermAndDtmiV4.json) be expressed as both "description" and "dtmi:dtdl:property:description;4".
* displayName
  * Value [MUST](spec/Requirement-ClassTelemetryPropertyDisplayNameLangStringV4.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassTelemetryPropertyDisplayNameStringLengthV4.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassTelemetryPropertyDisplayNameDtmiV4.json) be expressed as "dtmi:dtdl:property:displayName;4" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassTelemetryPropertyDisplayNameTermV4.json).
  * Member name [MUST NOT](spec/Requirement-ClassTelemetryPropertyDisplayNameTermAndDtmiV4.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;4".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* Members with names starting with "@" other than "@context", "@id", and "@type" [MUST NOT](spec/Requirement-ClassTelemetryInvalidKeywordsV4.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [SHALL NOT](spec/Completion-ClassTelemetryPropertyIrrelevantDtmiOrTermV4.json) be present if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "name", "schema", "dtmi:dtdl:property:comment;4", "dtmi:dtdl:property:description;4", "dtmi:dtdl:property:displayName;4", "dtmi:dtdl:property:name;4", "dtmi:dtdl:property:schema;4".
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassTelemetryPropertyFormallyIrrelevantDtmiOrTermV4.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "name", "schema", "dtmi:dtdl:property:comment;4", "dtmi:dtdl:property:description;4", "dtmi:dtdl:property:displayName;4", "dtmi:dtdl:property:name;4", "dtmi:dtdl:property:schema;4".
* A member [MUST NOT](spec/Requirement-ClassTelemetryPropertyInvalidDtmiV4.json) be present if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassTelemetryPropertyNotDtmiNorTermV4.json) be present if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [SHALL NOT](spec/Completion-ClassTelemetryPropertyUndefinedTermV4.json) be present if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassTelemetryPropertyFormallyUndefinedTermV4.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

## Limits and exclusions

In addition to the direct requirements on members of various [DTDL elements](#dtdl-element), there are restrictions on the element hierarchies formed via inclusion and referential inclusion.
There are also some exceptions to the rule that a DTDL element must not have a path to itself.
Specifically:

* There [MUST NOT](spec/Requirement-ClassArrayPropertiesElementSchemaSchemaMaxDepthV4.json) be more than 8 "elementSchema" or "schema" members in any path from a DTDL [Array](#array) element to another DTDL element.
* There [MAY](spec/Allowance-ClassArrayPropertiesElementSchemaSchemaSelfReferenceV4.json) be a path from a DTDL [Array](#array) element wherein some "elementSchema" or "schema" member referentially includes the DTDL Array element where the path begins.
* There [MUST NOT](spec/Requirement-ClassComponentPropertiesSchemaContentsExcludeComponentV4.json) be a path of "schema" or "contents" members from any DTDL [Component](#component) element to any DTDL [Component](#component) element.
* In the union of all paths of "extends" members rooted at a given DTDL [Interface](#interface) element, the total count of all values among all such members [MUST NOT](spec/Requirement-ClassInterfacePropertiesExtendsMaxCountV4.json) exceed 1024 values.
* There [MUST NOT](spec/Requirement-ClassInterfacePropertiesExtendsMaxDepthV4.json) be more than 12 members in any path of "extends" members from a DTDL [Interface](#interface) element to another DTDL element.
* There [MUST NOT](spec/Requirement-ClassInterfacePropertiesExtendsSelfReferenceV4.json) be a path of "extends" members from a DTDL [Interface](#interface) element to the DTDL Interface element where the path begins.
* In the union of all paths of "contents" or "fields" or "enumValues" or "request" or "response" or "properties" or "schema" or "elementSchema" or "mapValue" members rooted at a given DTDL [Interface](#interface) element, including those imported via "extends", the total count of all values among all such members MUST NOT exceed 100000 values.
* There [MUST NOT](spec/Requirement-ClassMapPropertiesElementSchemaSchemaMaxDepthV4.json) be more than 8 "elementSchema" or "schema" members in any path from a DTDL [Map](#map) element to another DTDL element.
* There [MAY](spec/Allowance-ClassMapPropertiesElementSchemaSchemaSelfReferenceV4.json) be a path from a DTDL [Map](#map) element wherein some "elementSchema" or "schema" member referentially includes the DTDL Map element where the path begins.
* There [MUST NOT](spec/Requirement-ClassObjectPropertiesElementSchemaSchemaMaxDepthV4.json) be more than 8 "elementSchema" or "schema" members in any path from a DTDL [Object](#object) element to another DTDL element.
* There [MAY](spec/Allowance-ClassObjectPropertiesElementSchemaSchemaSelfReferenceV4.json) be a path from a DTDL [Object](#object) element wherein some "elementSchema" or "schema" member referentially includes the DTDL Object element where the path begins.

The JSON text of each Interface definition is limited to 1 MiByte.
This is the total number of bytes inclusive of the opening and closing curly braces for each Interface definition.
This limit does not include the text of any descendant Interface.

## Representational literal

A representational literal is a JSON value that represents a literal value.
The representation can be in the form of a bare literal, an untyped value object, or a typed value object.
When a member includes a representational literal, the member is also considered to include the literal value itself.

### Representational string

To be a conformant *representational string*, a JSON value [MUST](spec/Requirement-RepresentationalStringOrObjectV4.json) be either a string or an object.

* If the representational string is a string, the string value itself is considered to be the value of the representational string.
* If the representational string is an object, the following constraints and conditions apply:
  * Every member in the object [MUST](spec/Requirement-RepresentationalStringOnlyKeywordsV4.json) have a name that starts with "@".
  * The object [MUST](spec/Requirement-RepresentationalStringHasValueV4.json) have a member with name "@value".
  * The value of member "@value" [MUST](spec/Requirement-RepresentationalStringValueStringV4.json) be a string.
  * The object [SHOULD](spec/Recommendation-RepresentationalStringHasTypeV4.json) have a member with name "@type".
  * If present, member "@type" [MUST](spec/Requirement-RepresentationalStringTypeStringV4.json) have value "xsd:string" or "http://www.w3.org/2001/XMLSchema#string".
  * The object [MUST NOT](spec/Requirement-RepresentationalStringOnlyValueAndTypeV4.json) have any member with name other than "@value" or "@type".
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

To be a conformant *representational integer*, a JSON value [MUST](spec/Requirement-RepresentationalIntegerOrObjectV4.json) be either an integer or an object.

* If the representational integer is an integer, the integer value itself is considered to be the value of the representational integer.
* If the representational integer is an object, the following constraints and conditions apply:
  * Every member in the object [MUST](spec/Requirement-RepresentationalIntegerOnlyKeywordsV4.json) have a name that starts with "@".
  * The object [MUST](spec/Requirement-RepresentationalIntegerHasValueV4.json) have a member with name "@value".
  * The value of member "@value" [MUST](spec/Requirement-RepresentationalIntegerValueIntegerV4.json) be an integer.
  * The object [SHOULD](spec/Recommendation-RepresentationalIntegerHasTypeV4.json) have a member with name "@type".
  * If present, member "@type" [MUST](spec/Requirement-RepresentationalIntegerTypeIntegerV4.json) have value "xsd:integer" or "http://www.w3.org/2001/XMLSchema#integer".
  * The object [MUST NOT](spec/Requirement-RepresentationalIntegerOnlyValueAndTypeV4.json) have any member with name other than "@value" or "@type".
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

To be a conformant *representational boolean*, a JSON value [MUST](spec/Requirement-RepresentationalBooleanOrObjectV4.json) be either a boolean or an object.

* If the representational boolean is a boolean, the boolean value itself is considered to be the value of the representational boolean.
* If the representational boolean is an object, the following constraints and conditions apply:
  * Every member in the object [MUST](spec/Requirement-RepresentationalBooleanOnlyKeywordsV4.json) have a name that starts with "@".
  * The object [MUST](spec/Requirement-RepresentationalBooleanHasValueV4.json) have a member with name "@value".
  * The value of member "@value" [MUST](spec/Requirement-RepresentationalBooleanValueBooleanV4.json) be a boolean.
  * The object [SHOULD](spec/Recommendation-RepresentationalBooleanHasTypeV4.json) have a member with name "@type".
  * If present, member "@type" [MUST](spec/Requirement-RepresentationalBooleanTypeBooleanV4.json) have value "xsd:boolean" or "http://www.w3.org/2001/XMLSchema#boolean".
  * The object [MUST NOT](spec/Requirement-RepresentationalBooleanOnlyValueAndTypeV4.json) have any member with name other than "@value" or "@type".
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

To be a conformant *localizable string*, a JSON value [MUST](spec/Requirement-LocalizableStringOrArrayOrObjectV4.json) be a string, an array, or an object.

If the localizable string is an array, the following constraints and conditions apply:

* Each value in the array [MUST](spec/Requirement-LocalizableStringArrayElementStringOrObjectV4.json) be either a string or an object.
* For each value in the array that is an object, the following constraints and conditions apply:
  * Every member in the object [MUST](spec/Requirement-LocalizableStringArrayElementOnlyKeywordsV4.json) have a name that starts with "@".
  * The object [MUST](spec/Requirement-LocalizableStringArrayElementHasValueV4.json) have a member with name "@value".
  * The value of member "@value" [MUST](spec/Requirement-LocalizableStringArrayElementValueStringV4.json) be a string.
  * The object [SHOULD](spec/Recommendation-LocalizableStringArrayElementHasLanguageV4.json) have a member with name "@language".
  * If present, member "@language" [MUST](spec/Requirement-LocalizableStringArrayElementLanguageValueRegexV4.json) have a string value that matches regular expression `^[a-z]{2,4}(-[A-Z][a-z]{3})?(-([A-Z]{2}|[0-9]{3}))?$`.
  * If present, member "@language" [MUST NOT](spec/Requirement-LocalizableStringArrayElementLanguageValueUniqueV4.json) have a value that matches the value of the "@language" member of any other object in the array.
  * The object [MUST NOT](spec/Requirement-LocalizableStringArrayElementOnlyValueAndLanguageV4.json) have any member with name other than "@value" or "@language".

* The array [MUST NOT](spec/Requirement-LocalizableStringArrayOnlyOneDefaultV4.json) contain more than one of the following values:
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

* The name of each member [MUST](spec/Requirement-LocalizableStringObjectMemberNameRegexV4.json) match regular expression `^[a-z]{2,4}(-[A-Z][a-z]{3})?(-([A-Z]{2}|[0-9]{3}))?$`.
* Each member in the object [MUST](spec/Requirement-LocalizableStringObjectMemberValueStringV4.json) have a value that is a string.

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

When a DTDL element member is designated to permit a string from one of the rows in a Standard schemas table, a string value from either column of any row of the following table [MAY](spec/Allowance-ValuePrimitiveSchemaV4.json) be used for a value included by the member, unless a restriction described in [Limits and exclusions](#limits-and-exclusions) precludes a Primitive schemas value.
When selecting for a DTDL element member a string value from the following table, a string from column "Term" is [RECOMMENDED](spec/Recommendation-ValuePrimitiveSchemaTermV4.json) over a string from column "DTMI".

| Term | DTMI |
| --- | --- |
| "boolean" | "dtmi:dtdl:instance:Schema:boolean;4" |
| "byte" | "dtmi:dtdl:instance:Schema:byte;4" |
| "bytes" | "dtmi:dtdl:instance:Schema:bytes;4" |
| "date" | "dtmi:dtdl:instance:Schema:date;4" |
| "dateTime" | "dtmi:dtdl:instance:Schema:dateTime;4" |
| "decimal" | "dtmi:dtdl:instance:Schema:decimal;4" |
| "double" | "dtmi:dtdl:instance:Schema:double;4" |
| "duration" | "dtmi:dtdl:instance:Schema:duration;4" |
| "float" | "dtmi:dtdl:instance:Schema:float;4" |
| "integer" | "dtmi:dtdl:instance:Schema:integer;4" |
| "long" | "dtmi:dtdl:instance:Schema:long;4" |
| "short" | "dtmi:dtdl:instance:Schema:short;4" |
| "string" | "dtmi:dtdl:instance:Schema:string;4" |
| "time" | "dtmi:dtdl:instance:Schema:time;4" |
| "unsignedByte" | "dtmi:dtdl:instance:Schema:unsignedByte;4" |
| "unsignedInteger" | "dtmi:dtdl:instance:Schema:unsignedInteger;4" |
| "unsignedLong" | "dtmi:dtdl:instance:Schema:unsignedLong;4" |
| "unsignedShort" | "dtmi:dtdl:instance:Schema:unsignedShort;4" |
| "uuid" | "dtmi:dtdl:instance:Schema:uuid;4" |

### Geospatial schemas

When a DTDL element member is designated to permit a string from one of the rows in a Standard schemas table, a string value from either column of any row of the following table [MAY](spec/Allowance-ValueGeospatialSchemaV4.json) be used for a value included by the member, unless a restriction described in [Limits and exclusions](#limits-and-exclusions) precludes a Geospatial schemas value.
When selecting for a DTDL element member a string value from the following table, a string from column "Term" is [RECOMMENDED](spec/Recommendation-ValueGeospatialSchemaTermV4.json) over a string from column "DTMI".

| Term | DTMI |
| --- | --- |
| "lineString" | "dtmi:standard:schema:geospatial:lineString;4" |
| "multiLineString" | "dtmi:standard:schema:geospatial:multiLineString;4" |
| "multiPoint" | "dtmi:standard:schema:geospatial:multiPoint;4" |
| "multiPolygon" | "dtmi:standard:schema:geospatial:multiPolygon;4" |
| "point" | "dtmi:standard:schema:geospatial:point;4" |
| "polygon" | "dtmi:standard:schema:geospatial:polygon;4" |

## Reserved strings

The following table itemizes strings that must not be used in some circumstances that otherwise permit a wide range of string values.
The particular circumstances that disallow these strings are explicitly designated with reference to this "Reserved strings" table.

| Term | DTMI |
| --- | --- |
| "AdjunctType" | "dtmi:dtdl:class:AdjunctType;4" |
| "Alias" | "dtmi:dtdl:class:Alias;4" |
| "aliasFor" | "dtmi:dtdl:property:aliasFor;4" |
| "Array" | "dtmi:dtdl:class:Array;4" |
| "asynchronous" | "dtmi:dtdl:instance:CommandType:asynchronous;4" |
| "boolean" | "dtmi:dtdl:instance:Schema:boolean;4" |
| "Boolean" | "dtmi:dtdl:class:Boolean;4" |
| "byte" | "dtmi:dtdl:instance:Schema:byte;4" |
| "Byte" | "dtmi:dtdl:class:Byte;4" |
| "bytes" | "dtmi:dtdl:instance:Schema:bytes;4" |
| "Bytes" | "dtmi:dtdl:class:Bytes;4" |
| "Command" | "dtmi:dtdl:class:Command;4" |
| "CommandPayload" | "dtmi:dtdl:class:CommandPayload;4" |
| "CommandRequest" | "dtmi:dtdl:class:CommandRequest;4" |
| "CommandResponse" | "dtmi:dtdl:class:CommandResponse;4" |
| "commandType" | "dtmi:dtdl:property:commandType;4" |
| "CommandType" | "dtmi:dtdl:class:CommandType;4" |
| "comment" | "dtmi:dtdl:property:comment;4" |
| "ComplexSchema" | "dtmi:dtdl:class:ComplexSchema;4" |
| "Component" | "dtmi:dtdl:class:Component;4" |
| "Content" | "dtmi:dtdl:class:Content;4" |
| "contents" | "dtmi:dtdl:property:contents;4" |
| "date" | "dtmi:dtdl:instance:Schema:date;4" |
| "Date" | "dtmi:dtdl:class:Date;4" |
| "dateTime" | "dtmi:dtdl:instance:Schema:dateTime;4" |
| "DateTime" | "dtmi:dtdl:class:DateTime;4" |
| "decimal" | "dtmi:dtdl:instance:Schema:decimal;4" |
| "Decimal" | "dtmi:dtdl:class:Decimal;4" |
| "description" | "dtmi:dtdl:property:description;4" |
| "displayName" | "dtmi:dtdl:property:displayName;4" |
| "double" | "dtmi:dtdl:instance:Schema:double;4" |
| "Double" | "dtmi:dtdl:class:Double;4" |
| "DtdlExtension" | "dtmi:dtdl:meta:DtdlExtension;4" |
| "duration" | "dtmi:dtdl:instance:Schema:duration;4" |
| "Duration" | "dtmi:dtdl:class:Duration;4" |
| "elementSchema" | "dtmi:dtdl:property:elementSchema;4" |
| "Entity" | "dtmi:dtdl:class:Entity;4" |
| "Enum" | "dtmi:dtdl:class:Enum;4" |
| "enumValue" | "dtmi:dtdl:property:enumValue;4" |
| "EnumValue" | "dtmi:dtdl:class:EnumValue;4" |
| "enumValues" | "dtmi:dtdl:property:enumValues;4" |
| "exponent" | "dtmi:dtdl:property:exponent;4" |
| "extends" | "dtmi:dtdl:property:extends;4" |
| "Field" | "dtmi:dtdl:class:Field;4" |
| "fields" | "dtmi:dtdl:property:fields;4" |
| "float" | "dtmi:dtdl:instance:Schema:float;4" |
| "Float" | "dtmi:dtdl:class:Float;4" |
| "integer" | "dtmi:dtdl:instance:Schema:integer;4" |
| "Integer" | "dtmi:dtdl:class:Integer;4" |
| "Interface" | "dtmi:dtdl:class:Interface;4" |
| "languageMajorVersion" | "dtmi:dtdl:property:languageMajorVersion;4" |
| "LatentType" | "dtmi:dtdl:class:LatentType;4" |
| "lineString" | "dtmi:standard:schema:geospatial:lineString;4" |
| "long" | "dtmi:dtdl:instance:Schema:long;4" |
| "Long" | "dtmi:dtdl:class:Long;4" |
| "Map" | "dtmi:dtdl:class:Map;4" |
| "mapKey" | "dtmi:dtdl:property:mapKey;4" |
| "MapKey" | "dtmi:dtdl:class:MapKey;4" |
| "mapValue" | "dtmi:dtdl:property:mapValue;4" |
| "MapValue" | "dtmi:dtdl:class:MapValue;4" |
| "maxMultiplicity" | "dtmi:dtdl:property:maxMultiplicity;4" |
| "metamodel" | "dtmi:dtdl:meta:metamodel;4" |
| "minMultiplicity" | "dtmi:dtdl:property:minMultiplicity;4" |
| "model" | "dtmi:dtdl:meta:model;4" |
| "multiLineString" | "dtmi:standard:schema:geospatial:multiLineString;4" |
| "multiPoint" | "dtmi:standard:schema:geospatial:multiPoint;4" |
| "multiPolygon" | "dtmi:standard:schema:geospatial:multiPolygon;4" |
| "name" | "dtmi:dtdl:property:name;4" |
| "NamedEntity" | "dtmi:dtdl:class:NamedEntity;4" |
| "NamedLatentType" | "dtmi:dtdl:class:NamedLatentType;4" |
| "nullable" | "dtmi:dtdl:property:nullable;4" |
| "NumericSchema" | "dtmi:dtdl:class:NumericSchema;4" |
| "Object" | "dtmi:dtdl:class:Object;4" |
| "point" | "dtmi:standard:schema:geospatial:point;4" |
| "polygon" | "dtmi:standard:schema:geospatial:polygon;4" |
| "PrimitiveSchema" | "dtmi:dtdl:class:PrimitiveSchema;4" |
| "properties" | "dtmi:dtdl:property:properties;4" |
| "Property" | "dtmi:dtdl:class:Property;4" |
| "Relationship" | "dtmi:dtdl:class:Relationship;4" |
| "request" | "dtmi:dtdl:property:request;4" |
| "response" | "dtmi:dtdl:property:response;4" |
| "scaledDecimal" | "dtmi:standard:schema:scaledDecimal;4" |
| "schema" | "dtmi:dtdl:property:schema;4" |
| "Schema" | "dtmi:dtdl:class:Schema;4" |
| "SchemaField" | "dtmi:dtdl:class:SchemaField;4" |
| "schemas" | "dtmi:dtdl:property:schemas;4" |
| "SemanticType" | "dtmi:dtdl:class:SemanticType;4" |
| "SemanticUnit" | "dtmi:dtdl:class:SemanticUnit;4" |
| "short" | "dtmi:dtdl:instance:Schema:short;4" |
| "Short" | "dtmi:dtdl:class:Short;4" |
| "string" | "dtmi:dtdl:instance:Schema:string;4" |
| "String" | "dtmi:dtdl:class:String;4" |
| "symbol" | "dtmi:dtdl:property:symbol;4" |
| "synchronous" | "dtmi:dtdl:instance:CommandType:synchronous;4" |
| "target" | "dtmi:dtdl:property:target;4" |
| "Telemetry" | "dtmi:dtdl:class:Telemetry;4" |
| "TemporalSchema" | "dtmi:dtdl:class:TemporalSchema;4" |
| "time" | "dtmi:dtdl:instance:Schema:time;4" |
| "Time" | "dtmi:dtdl:class:Time;4" |
| "Unit" | "dtmi:dtdl:class:Unit;4" |
| "UnitAttribute" | "dtmi:dtdl:class:UnitAttribute;4" |
| "unsignedByte" | "dtmi:dtdl:instance:Schema:unsignedByte;4" |
| "UnsignedByte" | "dtmi:dtdl:class:UnsignedByte;4" |
| "unsignedInteger" | "dtmi:dtdl:instance:Schema:unsignedInteger;4" |
| "UnsignedInteger" | "dtmi:dtdl:class:UnsignedInteger;4" |
| "unsignedLong" | "dtmi:dtdl:instance:Schema:unsignedLong;4" |
| "UnsignedLong" | "dtmi:dtdl:class:UnsignedLong;4" |
| "unsignedShort" | "dtmi:dtdl:instance:Schema:unsignedShort;4" |
| "UnsignedShort" | "dtmi:dtdl:class:UnsignedShort;4" |
| "uuid" | "dtmi:dtdl:instance:Schema:uuid;4" |
| "Uuid" | "dtmi:dtdl:class:Uuid;4" |
| "valueSchema" | "dtmi:dtdl:property:valueSchema;4" |
| "writable" | "dtmi:dtdl:property:writable;4" |

## Context

Every [DTDL element](#dtdl-element) may have &mdash; and every top-level element **must** have &mdash; a "@context" member.
The following constraints and conditions apply to every DTDL v4 "@context" member:

* Member value [MUST](spec/Requirement-ContextStringOrArrayQuantV4.json) be a string or an array.
* If member value is an array, all elements [MUST](spec/Requirement-ContextArrayAllStringsV4.json) be strings.
* Each included string value [MUST](spec/Requirement-ContextDtmiWithVersionQuantV4.json) conform to the [Digital Twin Model Identifier](#digital-twin-model-identifier) syntax, and it [MUST](spec/Requirement-ContextDtmiWithVersionQuantV4.json) contain a version number.
* Each included string value that does not begin with "dtmi:dtdl:context;" [SHALL](spec/Completion-ContextDefinedLanguageExtensionQuantV4.json) refer to a defined DTDL language extension.
* Member [MUST](spec/Requirement-TopLevelDtdlContextOrLimitlessV4.json) include string value "dtmi:dtdl:context;4" or "dtmi:dtdl:context;4#limitless" if member is in a top-level element.
* If present, string value "dtmi:dtdl:context;4" [MUST](spec/Requirement-ContextDtdlPrecedesOrOnlyV4.json) be the only value or must precede in the array any values that do not begin with "dtmi:dtdl:context;".
* If present, string value "dtmi:dtdl:context;4#limitless" [MUST](spec/Requirement-LimitlessContextPrecedesV4.json) precede in the array any values that do not begin with "dtmi:dtdl:context;".
* If present, string value "dtmi:dtdl:context;4#limitless" [MUST](spec/Requirement-LimitlessContextFollowedByLimitsV4.json) immediately precede in the array either the value "dtmi:dtdl:context;4#limits" or the value "dtmi:dtdl:context;4" or a value that refers to a defined DTDL language extension that specifies modeling limits for DTDL v4.
* If present, string value "dtmi:dtdl:context;4#limits" [MUST](spec/Requirement-CoreLimitsFollowsLimitlessV4.json) be immediately preceded in the array by the value "dtmi:dtdl:context;4#limitless".
* If present, an included string value that refers to a defined DTDL language extension that specifies modeling limits [MUST](spec/Requirement-ExtensionLimitsFollowsLimitlessV4.json) be immediately preceded in the array by the value "dtmi:dtdl:context;4#limitless".
* If present, string value "dtmi:dtdl:context;4" may be preceded in the array by one or more values that also begin with "dtmi:dtdl:context;" but [SHOULD NOT](spec/Recommendation-ContextDtdlOnlyOneV4.json).
* If present, string value "dtmi:dtdl:context;4#limitless" may be preceded in the array by one or more values that also begin with "dtmi:dtdl:context;" but [SHOULD NOT](spec/Recommendation-ContextDtdlLimitlessOnlyOneV4.json).
* Member [SHOULD NOT](spec/Recommendation-ContextUniqueValuesV4.json) include more than one instance of any given string value.

The *de-versioned* value of a DTMI is the portion of the string value to the left of the semicolon.
For example, the de-versioned value of "dtmi:ex:foo;3" is "dtmi:ex:foo".

Given this definition, the following constraint also applies to the values of a "@context" member:

* Member [SHOULD NOT](spec/Recommendation-ContextRepeatsDeversionedValueV4.json) include multiple string values that have the same de-versioned value.

For example, a "@context" member should not include both "dtmi:ex:foo;2" is "dtmi:ex:foo;5", because they both have de-versioned value "dtmi:ex:foo".

Some members of some DTDL elements are permitted to have values that conform to definitions from prior versions of DTDL.
In the following example, DTDL element "dtmi:example:laterInterface;1" has member "contents" which in turn has member "schema" whose value is a dependent reference to "dtmi:example:earlierInterface;1".
Each element contains a "@context" member that indicates the version of DTDL in which the element definition is written:

```json
[
  {
    "@context": "dtmi:dtdl:context;3",
    "@id": "dtmi:example:laterInterface;1",
    "@type": "Interface",
    "contents": [
      {
        "@type": "Component",
        "name": "subunit",
        "schema": "dtmi:example:earlierInterface;1"
      }
    ]
  },
  {
    "@context": "dtmi:dtdl:context;2",
    "@id": "dtmi:example:earlierInterface;1",
    "@type": "Interface",
    "contents": [
      {
        "@type": "Property",
        "name": "data",
        "schema": "integer"
      }
    ]
  }
]
```

The following example is equivalent to the previous example, but the DTDL element "dtmi:example:earlierInterface;1" is not defined at the top level.
Instead, it is defined inline as the value of member "schema" of member "contents" of DTDL element "dtmi:example:laterInterface;1".
The nested element contains a "@context" member with a DTDL v2 context specifier, indicating that the definitions and rules of DTDL v2 apply:

```json
{
  "@context": "dtmi:dtdl:context;3",
  "@id": "dtmi:example:laterInterface;1",
  "@type": "Interface",
  "contents": [
    {
      "@type": "Component",
      "name": "subunit",
      "schema": {
        "@context": "dtmi:dtdl:context;2",
        "@id": "dtmi:example:earlierInterface;1",
        "@type": "Interface",
        "contents": [
          {
            "@type": "Property",
            "name": "data",
            "schema": "integer"
          }
        ]
      }
    }
  ]
}
```

When a DTDL element contains a "@context" member, the values of this member are combined with the values of "@context" members of DTDL elements higher in the element hierarchy.
The result of this combination is known as the "active context" for this DTDL element and for any DTDL element that is a structural descendant, down to &mdash; but not including or surpassing &mdash; any element that introduces another "@context" member and thereby generates a new active context.
In other words, the *active context* of a DTDL element is the combination of included string values from any "@context" members of the DTDL element and every structural ancestor of the DTDL element.

The rules for combining "@context" values into an active context are as follows:

* For any de-versioned value that is represented only once among all "@context" values in the current element and all structural ancestors, the corresponding DTMI value is included in the active context.
* For any de-versioned value that is represented more than once among all "@context" values in the current element and all structural ancestors, the corresponding DTMI value from the "@context" member lowest in the hierarchy is included in the active context.
* If any "@context" member includes more than one DTMI with the same de-versioned value, the last of these in the array of member values is used for generating the active context.

For example, in the following model, the active context for the DTDL Inteface and Command elements is the set { "dtmi:dtdl:context;4", "dtmi:ex:foo;2" }.
The active context of the DTDL Relationship element is the set { "dtmi:dtdl:context;4", "dtmi:ex:foo;1" }, because value "dtmi:ex:foo;1" occurs lower in the hierarchy than value "dtmi:ex:foo;2" and later in the array of strings than value "dtmi:ex:foo;3":

```json
{
  "@context": [
    "dtmi:dtdl:context;4",
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

* It [MUST](spec/Requirement-DtmiIsStringV4.json) be a string.
* It [MUST](spec/Requirement-DtmiRegexV4.json) conform to the regular expression `^dtmi:[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?(?::[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?)*(?:;[1-9][0-9]{0,8}(?:\\.[1-9][0-9]{0,5})?)?$`.
* When used as the value of an "@id" member, it [MUST NOT](spec/Requirement-DtmiReservedPrefixesV4.json) begin with any of the following prefixes:
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
* informally co-typed &mdash; An element is considered to be *informally co-typed* if it has an "@type" member that includes a value that is neither required nor defined by an extension referenced in the active context. An element that is informally co-typed is permitted to have additional members beyond those explicitly defined for the element type. (see [DTDL element](#dtdl-element))
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

