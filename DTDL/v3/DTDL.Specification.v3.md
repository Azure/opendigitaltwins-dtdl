# DTDL Language Specification -- PREVIEW

**Version 3**

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

The document [Digital Twins Definition Language (DTDL)](./DTDL.v3.md) &mdash; herein referred to as the *DTDL Reference* &mdash; is a description of the DTDL language in a manner that is explanatory and illustrative.
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

The [DTDL Reference](./DTDL.v3.md) uses JSON-LD terminology, which has some unfortunate differences from the JSON terminology used herein.
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
    "@context": "dtmi:dtdl:context;3",
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
    "@context": "dtmi:dtdl:context;3",
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
  "@context": "dtmi:dtdl:context;3",
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
      "dtmi:dtdl:context;3",
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
However, it is RECOMMENDED that acceptance/rejection decisions should be deterministic, and it is further RECOMMENDED that these decisions not become increasingingly strict over time, since this can lead to backward-compatibility issues.

When a member includes a dependent reference, the DTDL element whose "@id" member has a matching value is said to be *referentially included* in the member that includes the dependent reference.
If no referentially included DTDL element is present in the model, the model is referentially incomplete.

In the sequel, when stating the requirement for a referentially included element to be present, the key word "SHALL" is used to indicate that this is needed for completeness.
This contrasts with the key words "MUST" and "REQUIRED", which are used to indicate requirements for validity rather than completeness.
The key word "SHALL" is also used when stating requirements that may be unverifiable in contextually incomplete models.

## DTDL element

A model is a forest of DTDL elements, each of which is a JSON object.
The root of each tree is known as a top-level element.
Each top-level element is a JSON object that is either the root of a JSON document or a value in a JSON array that is the root of a JSON document.
Every JSON document in a model [MUST](spec/Requirement-RootArrayOrObjV3.json) have a root value that is either an object or an array of objects.

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

A DTDL element [MUST NOT](spec/Requirement-NoPathToSelfV3.json) have a path to itself, such as the path from "dtmi:example:selfReferencingInterface;1" to "dtmi:example:selfReferencingInterface;1" in the following invalid example:

```json
{
  "@context": "dtmi:dtdl:context;3",
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
  "@context": "dtmi:dtdl:context;3",
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

* [MUST](spec/Requirement-TopLevelRootableV3.json) conform to the definition of DTDL element [Interface](#interface).
* [MUST](spec/Requirement-TopLevelDtdlContextV3.json) have a "@context" member that includes string value "dtmi:dtdl:context;3".

A DTDL element is *referenceable* by another if it is an Interface, a top-level element, or an element in the same partition as the element that references it.
Stated more precisely:

* Every top-level element is referenceable by every other DTDL element in the model.
* Every Interface element is referenceable by every other DTDL element in the model.
* Every element that is not top-level and not an Interface is referenceable only by other DTDL elements in the same partition.

A member of a DTDL element [MUST NOT](spec/Requirement-DependencyReferenceableV3.json) include a dependent reference to any DTDL element that is not referenceable by the element that has the member.

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
  "@context": "dtmi:dtdl:context;3",
  "@id": "dtmi:example:beta_upsilon;1",
  "@type": "Interface",
  "schemas": {
    "@id": "dtmi:example:beta_tau;1",
    "@type": "Array",
    "elementSchema": "boolean"
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassArrayRequiredPropertiesV3.json):

* @type
  * Value [MUST](spec/Requirement-ClassArrayTypeStringOrArrayV3.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassArrayTypeIncludesMaterialV3.json) include either string "Array" or string "dtmi:dtdl:class:Array;3".
  * [SHOULD NOT](spec/Recommendation-ClassArrayTypeIncludesTermAndDtmiV3.json) include both "Array" and "dtmi:dtdl:class:Array;3".
  * [SHOULD NOT](spec/Recommendation-ClassArrayTypeDuplicatesMaterialV3.json) include more than one instance of either "Array" or "dtmi:dtdl:class:Array;3".
  * String "Array" is [RECOMMENDED](spec/Recommendation-ClassArrayTypePreferTermToDtmiV3.json) over string "dtmi:dtdl:class:Array;3".
  * [SHALL NOT](spec/Completion-ClassArrayTypeIncludesIrrelevantDtmiOrTermV3.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "Array" or "dtmi:dtdl:class:Array;3", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassArrayTypeIncludesInvalidDtmiV3.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MUST NOT](spec/Requirement-ClassArrayTypeIncludesNotDtmiNorTermV3.json) include any string that contains ":" but does not start with "dtmi:".
  * [SHALL NOT](spec/Completion-ClassArrayTypeIncludesUndefinedTermV3.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
* elementSchema
  * Value [MUST](spec/Requirement-ClassArrayPropertyElementSchemaElementV3.json) be a DTDL element, a dependent reference to a DTDL element, a string from one of the rows in a [Standard schemas](#standard-schemas) table, a string defined by an extension referenced in the active context, or an array containing exactly one DTDL element, dependent reference to a DTDL element, string from one of the rows in a Standard schemas table, or string defined by an extension referenced in the active context.
  * If the value is a dependent reference or an array containing a dependent reference, the model [SHALL](spec/Completion-ClassArrayPropertyElementSchemaDependentReferenceV3.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * If present, an included or referentially included DTDL element [MUST](spec/Requirement-ClassArrayPropertyElementSchemaTypeConformanceV3.json) conform to the definition of DTDL element [Array](#array) or [Enum](#enum) or [Map](#map) or [Object](#object) or DTDLv2 element [Array](../v2/DTDL.Specification.v2.md#array) or [Enum](../v2/DTDL.Specification.v2.md#enum) or [Map](../v2/DTDL.Specification.v2.md#map) or [Object](../v2/DTDL.Specification.v2.md#object).
  * If a string from one of the rows in a Standard schemas table is included, a string from column "Term" is [RECOMMENDED](spec/Recommendation-ClassArrayPropertyElementSchemaPreferTermToDtmiV3.json) over a string from column "DTMI".
  * Considered with other DTDL elements, value is subject to any relevant restrictions in [Limits and exclusions](#limits-and-exclusions).
  * Member name [MAY](spec/Allowance-ClassArrayPropertyElementSchemaDtmiV3.json) be expressed as "dtmi:dtdl:property:elementSchema;3" instead of "elementSchema", but "elementSchema" is [RECOMMENDED](spec/Recommendation-ClassArrayPropertyElementSchemaTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassArrayPropertyElementSchemaTermAndDtmiV3.json) be expressed as both "elementSchema" and "dtmi:dtdl:property:elementSchema;3".

The following members are [OPTIONAL](spec/Allowance-ClassArrayOptionalPropertiesV3.json) unless otherwise noted:

* @context
  * [MUST](spec/Requirement-ClassArrayContextConformsV3.json) conform to the specified [context](#context) rules.
* @id
  * [REQUIRED](spec/Requirement-ClassArrayIdRequiredV3.json) when the Array element is included in Interface member "schemas".
  * Value [MUST](spec/Requirement-ClassArrayIdIsDtmiV3.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassArrayIdNotArrayV3.json) be an array.
  * Value [MUST](spec/Requirement-ClassArrayIdDuplicateV3.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassArrayPropertyCommentStringV3.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassArrayPropertyCommentStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassArrayPropertyCommentDtmiV3.json) be expressed as "dtmi:dtdl:property:comment;3" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassArrayPropertyCommentTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassArrayPropertyCommentTermAndDtmiV3.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;3".
* description
  * Value [MUST](spec/Requirement-ClassArrayPropertyDescriptionLangStringV3.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassArrayPropertyDescriptionStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassArrayPropertyDescriptionDtmiV3.json) be expressed as "dtmi:dtdl:property:description;3" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassArrayPropertyDescriptionTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassArrayPropertyDescriptionTermAndDtmiV3.json) be expressed as both "description" and "dtmi:dtdl:property:description;3".
* displayName
  * Value [MUST](spec/Requirement-ClassArrayPropertyDisplayNameLangStringV3.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassArrayPropertyDisplayNameStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassArrayPropertyDisplayNameDtmiV3.json) be expressed as "dtmi:dtdl:property:displayName;3" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassArrayPropertyDisplayNameTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassArrayPropertyDisplayNameTermAndDtmiV3.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;3".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* Members with names starting with "@" other than "@context", "@id", and "@type" [MUST NOT](spec/Requirement-ClassArrayInvalidKeywordsV3.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [SHALL NOT](spec/Completion-ClassArrayPropertyIrrelevantDtmiOrTermV3.json) be present if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "elementSchema", "dtmi:dtdl:property:comment;3", "dtmi:dtdl:property:description;3", "dtmi:dtdl:property:displayName;3", "dtmi:dtdl:property:elementSchema;3".
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassArrayPropertyFormallyIrrelevantDtmiOrTermV3.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "elementSchema", "dtmi:dtdl:property:comment;3", "dtmi:dtdl:property:description;3", "dtmi:dtdl:property:displayName;3", "dtmi:dtdl:property:elementSchema;3".
* A member [MUST NOT](spec/Requirement-ClassArrayPropertyInvalidDtmiV3.json) be present if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassArrayPropertyNotDtmiNorTermV3.json) be present if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [SHALL NOT](spec/Completion-ClassArrayPropertyUndefinedTermV3.json) be present if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassArrayPropertyFormallyUndefinedTermV3.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### Command

Example:

```json
{
  "@context": "dtmi:dtdl:context;3",
  "@id": "dtmi:example:beta_chi;1",
  "@type": "Interface",
  "contents": {
    "@type": "Command",
    "name": "beta_phi"
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassCommandRequiredPropertiesV3.json):

* @type
  * Value [MUST](spec/Requirement-ClassCommandTypeStringOrArrayV3.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassCommandTypeIncludesMaterialV3.json) include either string "Command" or string "dtmi:dtdl:class:Command;3".
  * [SHOULD NOT](spec/Recommendation-ClassCommandTypeIncludesTermAndDtmiV3.json) include both "Command" and "dtmi:dtdl:class:Command;3".
  * [SHOULD NOT](spec/Recommendation-ClassCommandTypeDuplicatesMaterialV3.json) include more than one instance of either "Command" or "dtmi:dtdl:class:Command;3".
  * String "Command" is [RECOMMENDED](spec/Recommendation-ClassCommandTypePreferTermToDtmiV3.json) over string "dtmi:dtdl:class:Command;3".
  * [SHALL NOT](spec/Completion-ClassCommandTypeIncludesIrrelevantDtmiOrTermV3.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "Command" or "dtmi:dtdl:class:Command;3", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassCommandTypeIncludesInvalidDtmiV3.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MUST NOT](spec/Requirement-ClassCommandTypeIncludesNotDtmiNorTermV3.json) include any string that contains ":" but does not start with "dtmi:".
  * [SHALL NOT](spec/Completion-ClassCommandTypeIncludesUndefinedTermV3.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
* name
  * Value [MUST](spec/Requirement-ClassCommandPropertyNameStringV3.json) be a [representational string](#representational-string) or an array containing exactly one representational string.
  * String value [MUST NOT](spec/Requirement-ClassCommandPropertyNameStringLengthV3.json) be more than 512 characters in length.
  * String value [MUST](spec/Requirement-ClassCommandPropertyNamePatternV3.json) match regular expression `^[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?$`.
  * String value [MUST](spec/Requirement-ClassCommandPropertyNameUniqueAmongInterfaceContentsV3.json) be unique among the included values of "name" members of all elements included or referentially included in the "contents" member of any parent [Interface](#interface) element.
  * Member name [MAY](spec/Allowance-ClassCommandPropertyNameDtmiV3.json) be expressed as "dtmi:dtdl:property:name;3" instead of "name", but "name" is [RECOMMENDED](spec/Recommendation-ClassCommandPropertyNameTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandPropertyNameTermAndDtmiV3.json) be expressed as both "name" and "dtmi:dtdl:property:name;3".

The following members are [OPTIONAL](spec/Allowance-ClassCommandOptionalPropertiesV3.json):

* @context
  * [MUST](spec/Requirement-ClassCommandContextConformsV3.json) conform to the specified [context](#context) rules.
* @id
  * Value [MUST](spec/Requirement-ClassCommandIdIsDtmiV3.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassCommandIdNotArrayV3.json) be an array.
  * Value [MUST](spec/Requirement-ClassCommandIdDuplicateV3.json) be unique among the values of all "@id" members of all elements in the model.
* commandType
  * [SHOULD NOT](spec/Recommendation-ClassCommandPropertyCommandTypeDeprecatedV3.json) be present in the element; this member is deprecated.
  * Value [MUST](spec/Requirement-ClassCommandPropertyCommandTypeSpecificValuesV3.json) be "asynchronous", "synchronous", "dtmi:dtdl:instance:CommandType:asynchronous;3", "dtmi:dtdl:instance:CommandType:synchronous;3", or an array containing no more than one of these string values.
  * Member name [MAY](spec/Allowance-ClassCommandPropertyCommandTypeDtmiV3.json) be expressed as "dtmi:dtdl:property:commandType;3" instead of "commandType", but "commandType" is [RECOMMENDED](spec/Recommendation-ClassCommandPropertyCommandTypeTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandPropertyCommandTypeTermAndDtmiV3.json) be expressed as both "commandType" and "dtmi:dtdl:property:commandType;3".
* comment
  * Value [MUST](spec/Requirement-ClassCommandPropertyCommentStringV3.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassCommandPropertyCommentStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassCommandPropertyCommentDtmiV3.json) be expressed as "dtmi:dtdl:property:comment;3" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassCommandPropertyCommentTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandPropertyCommentTermAndDtmiV3.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;3".
* description
  * Value [MUST](spec/Requirement-ClassCommandPropertyDescriptionLangStringV3.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassCommandPropertyDescriptionStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassCommandPropertyDescriptionDtmiV3.json) be expressed as "dtmi:dtdl:property:description;3" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassCommandPropertyDescriptionTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandPropertyDescriptionTermAndDtmiV3.json) be expressed as both "description" and "dtmi:dtdl:property:description;3".
* displayName
  * Value [MUST](spec/Requirement-ClassCommandPropertyDisplayNameLangStringV3.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassCommandPropertyDisplayNameStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassCommandPropertyDisplayNameDtmiV3.json) be expressed as "dtmi:dtdl:property:displayName;3" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassCommandPropertyDisplayNameTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandPropertyDisplayNameTermAndDtmiV3.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;3".
* request
  * Value [MUST](spec/Requirement-ClassCommandPropertyRequestElementV3.json) be a DTDL element, a dependent reference to DTDL element, or an array containing no more than one DTDL element or dependent reference to a DTDL element.
  * If the value is a dependent reference or an array containing a dependent reference, the model [SHALL](spec/Completion-ClassCommandPropertyRequestDependentReferenceV3.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * If present, included or referentially included DTDL element [MUST](spec/Requirement-ClassCommandPropertyRequestTypeConformanceV3.json) conform to the definition of DTDL element [CommandRequest](#commandrequest).
  * Member name [MAY](spec/Allowance-ClassCommandPropertyRequestDtmiV3.json) be expressed as "dtmi:dtdl:property:request;3" instead of "request", but "request" is [RECOMMENDED](spec/Recommendation-ClassCommandPropertyRequestTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandPropertyRequestTermAndDtmiV3.json) be expressed as both "request" and "dtmi:dtdl:property:request;3".
* response
  * Value [MUST](spec/Requirement-ClassCommandPropertyResponseElementV3.json) be a DTDL element, a dependent reference to DTDL element, or an array containing no more than one DTDL element or dependent reference to a DTDL element.
  * If the value is a dependent reference or an array containing a dependent reference, the model [SHALL](spec/Completion-ClassCommandPropertyResponseDependentReferenceV3.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * If present, included or referentially included DTDL element [MUST](spec/Requirement-ClassCommandPropertyResponseTypeConformanceV3.json) conform to the definition of DTDL element [CommandResponse](#commandresponse).
  * Member name [MAY](spec/Allowance-ClassCommandPropertyResponseDtmiV3.json) be expressed as "dtmi:dtdl:property:response;3" instead of "response", but "response" is [RECOMMENDED](spec/Recommendation-ClassCommandPropertyResponseTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandPropertyResponseTermAndDtmiV3.json) be expressed as both "response" and "dtmi:dtdl:property:response;3".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* Members with names starting with "@" other than "@context", "@id", and "@type" [MUST NOT](spec/Requirement-ClassCommandInvalidKeywordsV3.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [SHALL NOT](spec/Completion-ClassCommandPropertyIrrelevantDtmiOrTermV3.json) be present if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "commandType", "comment", "description", "displayName", "name", "request", "response", "dtmi:dtdl:property:commandType;3", "dtmi:dtdl:property:comment;3", "dtmi:dtdl:property:description;3", "dtmi:dtdl:property:displayName;3", "dtmi:dtdl:property:name;3", "dtmi:dtdl:property:request;3", "dtmi:dtdl:property:response;3".
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassCommandPropertyFormallyIrrelevantDtmiOrTermV3.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "commandType", "comment", "description", "displayName", "name", "request", "response", "dtmi:dtdl:property:commandType;3", "dtmi:dtdl:property:comment;3", "dtmi:dtdl:property:description;3", "dtmi:dtdl:property:displayName;3", "dtmi:dtdl:property:name;3", "dtmi:dtdl:property:request;3", "dtmi:dtdl:property:response;3".
* A member [MUST NOT](spec/Requirement-ClassCommandPropertyInvalidDtmiV3.json) be present if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassCommandPropertyNotDtmiNorTermV3.json) be present if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [SHALL NOT](spec/Completion-ClassCommandPropertyUndefinedTermV3.json) be present if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassCommandPropertyFormallyUndefinedTermV3.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### CommandRequest

Example:

```json
{
  "@context": "dtmi:dtdl:context;3",
  "@id": "dtmi:example:beta_um;1",
  "@type": "Interface",
  "contents": {
    "@type": "Command",
    "name": "beta_wum",
    "request": {
      "name": "beta_yuzz",
      "schema": "date"
    }
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassCommandRequestRequiredPropertiesV3.json):

* name
  * Value [MUST](spec/Requirement-ClassCommandRequestPropertyNameStringV3.json) be a [representational string](#representational-string) or an array containing exactly one representational string.
  * String value [MUST NOT](spec/Requirement-ClassCommandRequestPropertyNameStringLengthV3.json) be more than 512 characters in length.
  * String value [MUST](spec/Requirement-ClassCommandRequestPropertyNamePatternV3.json) match regular expression `^[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?$`.
  * Member name [MAY](spec/Allowance-ClassCommandRequestPropertyNameDtmiV3.json) be expressed as "dtmi:dtdl:property:name;3" instead of "name", but "name" is [RECOMMENDED](spec/Recommendation-ClassCommandRequestPropertyNameTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandRequestPropertyNameTermAndDtmiV3.json) be expressed as both "name" and "dtmi:dtdl:property:name;3".
* schema
  * Value [MUST](spec/Requirement-ClassCommandRequestPropertySchemaElementV3.json) be a DTDL element, a dependent reference to a DTDL element, a string from one of the rows in a [Standard schemas](#standard-schemas) table, a string defined by an extension referenced in the active context, or an array containing exactly one DTDL element, dependent reference to a DTDL element, string from one of the rows in a Standard schemas table, or string defined by an extension referenced in the active context.
  * If the value is a dependent reference or an array containing a dependent reference, the model [SHALL](spec/Completion-ClassCommandRequestPropertySchemaDependentReferenceV3.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * If present, an included or referentially included DTDL element [MUST](spec/Requirement-ClassCommandRequestPropertySchemaTypeConformanceV3.json) conform to the definition of DTDL element [Array](#array) or [Enum](#enum) or [Map](#map) or [Object](#object) or DTDLv2 element [Array](../v2/DTDL.Specification.v2.md#array) or [Enum](../v2/DTDL.Specification.v2.md#enum) or [Map](../v2/DTDL.Specification.v2.md#map) or [Object](../v2/DTDL.Specification.v2.md#object).
  * If a string from one of the rows in a Standard schemas table is included, a string from column "Term" is [RECOMMENDED](spec/Recommendation-ClassCommandRequestPropertySchemaPreferTermToDtmiV3.json) over a string from column "DTMI".
  * Member name [MAY](spec/Allowance-ClassCommandRequestPropertySchemaDtmiV3.json) be expressed as "dtmi:dtdl:property:schema;3" instead of "schema", but "schema" is [RECOMMENDED](spec/Recommendation-ClassCommandRequestPropertySchemaTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandRequestPropertySchemaTermAndDtmiV3.json) be expressed as both "schema" and "dtmi:dtdl:property:schema;3".

The following members are [OPTIONAL](spec/Allowance-ClassCommandRequestOptionalPropertiesV3.json):

* @context
  * [MUST](spec/Requirement-ClassCommandRequestContextConformsV3.json) conform to the specified [context](#context) rules.
* @type
  * Value [MUST](spec/Requirement-ClassCommandRequestTypeStringOrArrayV3.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassCommandRequestTypeIncludesMaterialV3.json) include either string "CommandRequest" or string "dtmi:dtdl:class:CommandRequest;3".
  * [SHOULD NOT](spec/Recommendation-ClassCommandRequestTypeIncludesTermAndDtmiV3.json) include both "CommandRequest" and "dtmi:dtdl:class:CommandRequest;3".
  * [SHOULD NOT](spec/Recommendation-ClassCommandRequestTypeDuplicatesMaterialV3.json) include more than one instance of either "CommandRequest" or "dtmi:dtdl:class:CommandRequest;3".
  * String "CommandRequest" is [RECOMMENDED](spec/Recommendation-ClassCommandRequestTypePreferTermToDtmiV3.json) over string "dtmi:dtdl:class:CommandRequest;3".
  * [SHALL NOT](spec/Completion-ClassCommandRequestTypeIncludesIrrelevantDtmiOrTermV3.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "CommandRequest" or "dtmi:dtdl:class:CommandRequest;3", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassCommandRequestTypeIncludesInvalidDtmiV3.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MUST NOT](spec/Requirement-ClassCommandRequestTypeIncludesNotDtmiNorTermV3.json) include any string that contains ":" but does not start with "dtmi:".
  * [SHALL NOT](spec/Completion-ClassCommandRequestTypeIncludesUndefinedTermV3.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
* @id
  * Value [MUST](spec/Requirement-ClassCommandRequestIdIsDtmiV3.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassCommandRequestIdNotArrayV3.json) be an array.
  * Value [MUST](spec/Requirement-ClassCommandRequestIdDuplicateV3.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassCommandRequestPropertyCommentStringV3.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassCommandRequestPropertyCommentStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassCommandRequestPropertyCommentDtmiV3.json) be expressed as "dtmi:dtdl:property:comment;3" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassCommandRequestPropertyCommentTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandRequestPropertyCommentTermAndDtmiV3.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;3".
* description
  * Value [MUST](spec/Requirement-ClassCommandRequestPropertyDescriptionLangStringV3.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassCommandRequestPropertyDescriptionStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassCommandRequestPropertyDescriptionDtmiV3.json) be expressed as "dtmi:dtdl:property:description;3" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassCommandRequestPropertyDescriptionTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandRequestPropertyDescriptionTermAndDtmiV3.json) be expressed as both "description" and "dtmi:dtdl:property:description;3".
* displayName
  * Value [MUST](spec/Requirement-ClassCommandRequestPropertyDisplayNameLangStringV3.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassCommandRequestPropertyDisplayNameStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassCommandRequestPropertyDisplayNameDtmiV3.json) be expressed as "dtmi:dtdl:property:displayName;3" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassCommandRequestPropertyDisplayNameTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandRequestPropertyDisplayNameTermAndDtmiV3.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;3".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* Members with names starting with "@" other than "@context", "@id", and "@type" [MUST NOT](spec/Requirement-ClassCommandRequestInvalidKeywordsV3.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [SHALL NOT](spec/Completion-ClassCommandRequestPropertyIrrelevantDtmiOrTermV3.json) be present if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "name", "schema", "dtmi:dtdl:property:comment;3", "dtmi:dtdl:property:description;3", "dtmi:dtdl:property:displayName;3", "dtmi:dtdl:property:name;3", "dtmi:dtdl:property:schema;3".
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassCommandRequestPropertyFormallyIrrelevantDtmiOrTermV3.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "name", "schema", "dtmi:dtdl:property:comment;3", "dtmi:dtdl:property:description;3", "dtmi:dtdl:property:displayName;3", "dtmi:dtdl:property:name;3", "dtmi:dtdl:property:schema;3".
* A member [MUST NOT](spec/Requirement-ClassCommandRequestPropertyInvalidDtmiV3.json) be present if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassCommandRequestPropertyNotDtmiNorTermV3.json) be present if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [SHALL NOT](spec/Completion-ClassCommandRequestPropertyUndefinedTermV3.json) be present if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassCommandRequestPropertyFormallyUndefinedTermV3.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### CommandResponse

Example:

```json
{
  "@context": "dtmi:dtdl:context;3",
  "@id": "dtmi:example:beta_glikk;1",
  "@type": "Interface",
  "contents": {
    "@type": "Command",
    "name": "beta_fuddle",
    "response": {
      "name": "beta_humpf",
      "schema": "dateTime"
    }
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassCommandResponseRequiredPropertiesV3.json):

* name
  * Value [MUST](spec/Requirement-ClassCommandResponsePropertyNameStringV3.json) be a [representational string](#representational-string) or an array containing exactly one representational string.
  * String value [MUST NOT](spec/Requirement-ClassCommandResponsePropertyNameStringLengthV3.json) be more than 512 characters in length.
  * String value [MUST](spec/Requirement-ClassCommandResponsePropertyNamePatternV3.json) match regular expression `^[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?$`.
  * Member name [MAY](spec/Allowance-ClassCommandResponsePropertyNameDtmiV3.json) be expressed as "dtmi:dtdl:property:name;3" instead of "name", but "name" is [RECOMMENDED](spec/Recommendation-ClassCommandResponsePropertyNameTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandResponsePropertyNameTermAndDtmiV3.json) be expressed as both "name" and "dtmi:dtdl:property:name;3".
* schema
  * Value [MUST](spec/Requirement-ClassCommandResponsePropertySchemaElementV3.json) be a DTDL element, a dependent reference to a DTDL element, a string from one of the rows in a [Standard schemas](#standard-schemas) table, a string defined by an extension referenced in the active context, or an array containing exactly one DTDL element, dependent reference to a DTDL element, string from one of the rows in a Standard schemas table, or string defined by an extension referenced in the active context.
  * If the value is a dependent reference or an array containing a dependent reference, the model [SHALL](spec/Completion-ClassCommandResponsePropertySchemaDependentReferenceV3.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * If present, an included or referentially included DTDL element [MUST](spec/Requirement-ClassCommandResponsePropertySchemaTypeConformanceV3.json) conform to the definition of DTDL element [Array](#array) or [Enum](#enum) or [Map](#map) or [Object](#object) or DTDLv2 element [Array](../v2/DTDL.Specification.v2.md#array) or [Enum](../v2/DTDL.Specification.v2.md#enum) or [Map](../v2/DTDL.Specification.v2.md#map) or [Object](../v2/DTDL.Specification.v2.md#object).
  * If a string from one of the rows in a Standard schemas table is included, a string from column "Term" is [RECOMMENDED](spec/Recommendation-ClassCommandResponsePropertySchemaPreferTermToDtmiV3.json) over a string from column "DTMI".
  * Member name [MAY](spec/Allowance-ClassCommandResponsePropertySchemaDtmiV3.json) be expressed as "dtmi:dtdl:property:schema;3" instead of "schema", but "schema" is [RECOMMENDED](spec/Recommendation-ClassCommandResponsePropertySchemaTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandResponsePropertySchemaTermAndDtmiV3.json) be expressed as both "schema" and "dtmi:dtdl:property:schema;3".

The following members are [OPTIONAL](spec/Allowance-ClassCommandResponseOptionalPropertiesV3.json):

* @context
  * [MUST](spec/Requirement-ClassCommandResponseContextConformsV3.json) conform to the specified [context](#context) rules.
* @type
  * Value [MUST](spec/Requirement-ClassCommandResponseTypeStringOrArrayV3.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassCommandResponseTypeIncludesMaterialV3.json) include either string "CommandResponse" or string "dtmi:dtdl:class:CommandResponse;3".
  * [SHOULD NOT](spec/Recommendation-ClassCommandResponseTypeIncludesTermAndDtmiV3.json) include both "CommandResponse" and "dtmi:dtdl:class:CommandResponse;3".
  * [SHOULD NOT](spec/Recommendation-ClassCommandResponseTypeDuplicatesMaterialV3.json) include more than one instance of either "CommandResponse" or "dtmi:dtdl:class:CommandResponse;3".
  * String "CommandResponse" is [RECOMMENDED](spec/Recommendation-ClassCommandResponseTypePreferTermToDtmiV3.json) over string "dtmi:dtdl:class:CommandResponse;3".
  * [SHALL NOT](spec/Completion-ClassCommandResponseTypeIncludesIrrelevantDtmiOrTermV3.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "CommandResponse" or "dtmi:dtdl:class:CommandResponse;3", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassCommandResponseTypeIncludesInvalidDtmiV3.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MUST NOT](spec/Requirement-ClassCommandResponseTypeIncludesNotDtmiNorTermV3.json) include any string that contains ":" but does not start with "dtmi:".
  * [SHALL NOT](spec/Completion-ClassCommandResponseTypeIncludesUndefinedTermV3.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
* @id
  * Value [MUST](spec/Requirement-ClassCommandResponseIdIsDtmiV3.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassCommandResponseIdNotArrayV3.json) be an array.
  * Value [MUST](spec/Requirement-ClassCommandResponseIdDuplicateV3.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassCommandResponsePropertyCommentStringV3.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassCommandResponsePropertyCommentStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassCommandResponsePropertyCommentDtmiV3.json) be expressed as "dtmi:dtdl:property:comment;3" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassCommandResponsePropertyCommentTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandResponsePropertyCommentTermAndDtmiV3.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;3".
* description
  * Value [MUST](spec/Requirement-ClassCommandResponsePropertyDescriptionLangStringV3.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassCommandResponsePropertyDescriptionStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassCommandResponsePropertyDescriptionDtmiV3.json) be expressed as "dtmi:dtdl:property:description;3" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassCommandResponsePropertyDescriptionTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandResponsePropertyDescriptionTermAndDtmiV3.json) be expressed as both "description" and "dtmi:dtdl:property:description;3".
* displayName
  * Value [MUST](spec/Requirement-ClassCommandResponsePropertyDisplayNameLangStringV3.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassCommandResponsePropertyDisplayNameStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassCommandResponsePropertyDisplayNameDtmiV3.json) be expressed as "dtmi:dtdl:property:displayName;3" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassCommandResponsePropertyDisplayNameTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassCommandResponsePropertyDisplayNameTermAndDtmiV3.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;3".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* Members with names starting with "@" other than "@context", "@id", and "@type" [MUST NOT](spec/Requirement-ClassCommandResponseInvalidKeywordsV3.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [SHALL NOT](spec/Completion-ClassCommandResponsePropertyIrrelevantDtmiOrTermV3.json) be present if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "name", "schema", "dtmi:dtdl:property:comment;3", "dtmi:dtdl:property:description;3", "dtmi:dtdl:property:displayName;3", "dtmi:dtdl:property:name;3", "dtmi:dtdl:property:schema;3".
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassCommandResponsePropertyFormallyIrrelevantDtmiOrTermV3.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "name", "schema", "dtmi:dtdl:property:comment;3", "dtmi:dtdl:property:description;3", "dtmi:dtdl:property:displayName;3", "dtmi:dtdl:property:name;3", "dtmi:dtdl:property:schema;3".
* A member [MUST NOT](spec/Requirement-ClassCommandResponsePropertyInvalidDtmiV3.json) be present if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassCommandResponsePropertyNotDtmiNorTermV3.json) be present if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [SHALL NOT](spec/Completion-ClassCommandResponsePropertyUndefinedTermV3.json) be present if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassCommandResponsePropertyFormallyUndefinedTermV3.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### Component

Example:

```json
{
  "@context": "dtmi:dtdl:context;3",
  "@id": "dtmi:example:beta_quan;1",
  "@type": "Interface",
  "contents": {
    "@type": "Component",
    "name": "beta_nuh",
    "schema": {
      "@id": "dtmi:example:beta_snee;1",
      "@type": "Interface"
    }
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassComponentRequiredPropertiesV3.json):

* @type
  * Value [MUST](spec/Requirement-ClassComponentTypeStringOrArrayV3.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassComponentTypeIncludesMaterialV3.json) include either string "Component" or string "dtmi:dtdl:class:Component;3".
  * [SHOULD NOT](spec/Recommendation-ClassComponentTypeIncludesTermAndDtmiV3.json) include both "Component" and "dtmi:dtdl:class:Component;3".
  * [SHOULD NOT](spec/Recommendation-ClassComponentTypeDuplicatesMaterialV3.json) include more than one instance of either "Component" or "dtmi:dtdl:class:Component;3".
  * String "Component" is [RECOMMENDED](spec/Recommendation-ClassComponentTypePreferTermToDtmiV3.json) over string "dtmi:dtdl:class:Component;3".
  * [SHALL NOT](spec/Completion-ClassComponentTypeIncludesIrrelevantDtmiOrTermV3.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "Component" or "dtmi:dtdl:class:Component;3", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassComponentTypeIncludesInvalidDtmiV3.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MUST NOT](spec/Requirement-ClassComponentTypeIncludesNotDtmiNorTermV3.json) include any string that contains ":" but does not start with "dtmi:".
  * [SHALL NOT](spec/Completion-ClassComponentTypeIncludesUndefinedTermV3.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
* name
  * Value [MUST](spec/Requirement-ClassComponentPropertyNameStringV3.json) be a [representational string](#representational-string) or an array containing exactly one representational string.
  * String value [MUST NOT](spec/Requirement-ClassComponentPropertyNameStringLengthV3.json) be more than 512 characters in length.
  * String value [MUST](spec/Requirement-ClassComponentPropertyNamePatternV3.json) match regular expression `^[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?$`.
  * String value [MUST](spec/Requirement-ClassComponentPropertyNameUniqueAmongInterfaceContentsV3.json) be unique among the included values of "name" members of all elements included or referentially included in the "contents" member of any parent [Interface](#interface) element.
  * Member name [MAY](spec/Allowance-ClassComponentPropertyNameDtmiV3.json) be expressed as "dtmi:dtdl:property:name;3" instead of "name", but "name" is [RECOMMENDED](spec/Recommendation-ClassComponentPropertyNameTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassComponentPropertyNameTermAndDtmiV3.json) be expressed as both "name" and "dtmi:dtdl:property:name;3".
* schema
  * Value [MUST](spec/Requirement-ClassComponentPropertySchemaElementV3.json) be a DTDL element, a dependent reference to DTDL element, or an array containing exactly one DTDL element or dependent reference to a DTDL element.
  * If the value is a dependent reference or an array containing a dependent reference, the model [SHALL](spec/Completion-ClassComponentPropertySchemaDependentReferenceV3.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * The included or referentially included DTDL element [MUST](spec/Requirement-ClassComponentPropertySchemaTypeConformanceV3.json) conform to the definition of DTDL element [Interface](#interface) or DTDLv2 element [Interface](../v2/DTDL.Specification.v2.md#interface).
  * Considered with other DTDL elements, value is subject to any relevant restrictions in [Limits and exclusions](#limits-and-exclusions).
  * Member name [MAY](spec/Allowance-ClassComponentPropertySchemaDtmiV3.json) be expressed as "dtmi:dtdl:property:schema;3" instead of "schema", but "schema" is [RECOMMENDED](spec/Recommendation-ClassComponentPropertySchemaTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassComponentPropertySchemaTermAndDtmiV3.json) be expressed as both "schema" and "dtmi:dtdl:property:schema;3".

The following members are [OPTIONAL](spec/Allowance-ClassComponentOptionalPropertiesV3.json):

* @context
  * [MUST](spec/Requirement-ClassComponentContextConformsV3.json) conform to the specified [context](#context) rules.
* @id
  * Value [MUST](spec/Requirement-ClassComponentIdIsDtmiV3.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassComponentIdNotArrayV3.json) be an array.
  * Value [MUST](spec/Requirement-ClassComponentIdDuplicateV3.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassComponentPropertyCommentStringV3.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassComponentPropertyCommentStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassComponentPropertyCommentDtmiV3.json) be expressed as "dtmi:dtdl:property:comment;3" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassComponentPropertyCommentTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassComponentPropertyCommentTermAndDtmiV3.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;3".
* description
  * Value [MUST](spec/Requirement-ClassComponentPropertyDescriptionLangStringV3.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassComponentPropertyDescriptionStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassComponentPropertyDescriptionDtmiV3.json) be expressed as "dtmi:dtdl:property:description;3" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassComponentPropertyDescriptionTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassComponentPropertyDescriptionTermAndDtmiV3.json) be expressed as both "description" and "dtmi:dtdl:property:description;3".
* displayName
  * Value [MUST](spec/Requirement-ClassComponentPropertyDisplayNameLangStringV3.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassComponentPropertyDisplayNameStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassComponentPropertyDisplayNameDtmiV3.json) be expressed as "dtmi:dtdl:property:displayName;3" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassComponentPropertyDisplayNameTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassComponentPropertyDisplayNameTermAndDtmiV3.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;3".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* Members with names starting with "@" other than "@context", "@id", and "@type" [MUST NOT](spec/Requirement-ClassComponentInvalidKeywordsV3.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [SHALL NOT](spec/Completion-ClassComponentPropertyIrrelevantDtmiOrTermV3.json) be present if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "name", "schema", "dtmi:dtdl:property:comment;3", "dtmi:dtdl:property:description;3", "dtmi:dtdl:property:displayName;3", "dtmi:dtdl:property:name;3", "dtmi:dtdl:property:schema;3".
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassComponentPropertyFormallyIrrelevantDtmiOrTermV3.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "name", "schema", "dtmi:dtdl:property:comment;3", "dtmi:dtdl:property:description;3", "dtmi:dtdl:property:displayName;3", "dtmi:dtdl:property:name;3", "dtmi:dtdl:property:schema;3".
* A member [MUST NOT](spec/Requirement-ClassComponentPropertyInvalidDtmiV3.json) be present if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassComponentPropertyNotDtmiNorTermV3.json) be present if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [SHALL NOT](spec/Completion-ClassComponentPropertyUndefinedTermV3.json) be present if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassComponentPropertyFormallyUndefinedTermV3.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### Enum

Example:

```json
{
  "@context": "dtmi:dtdl:context;3",
  "@id": "dtmi:example:beta_zatz;1",
  "@type": "Interface",
  "schemas": {
    "@id": "dtmi:example:beta_floob;1",
    "@type": "Enum",
    "valueSchema": "integer"
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassEnumRequiredPropertiesV3.json):

* @type
  * Value [MUST](spec/Requirement-ClassEnumTypeStringOrArrayV3.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassEnumTypeIncludesMaterialV3.json) include either string "Enum" or string "dtmi:dtdl:class:Enum;3".
  * [SHOULD NOT](spec/Recommendation-ClassEnumTypeIncludesTermAndDtmiV3.json) include both "Enum" and "dtmi:dtdl:class:Enum;3".
  * [SHOULD NOT](spec/Recommendation-ClassEnumTypeDuplicatesMaterialV3.json) include more than one instance of either "Enum" or "dtmi:dtdl:class:Enum;3".
  * String "Enum" is [RECOMMENDED](spec/Recommendation-ClassEnumTypePreferTermToDtmiV3.json) over string "dtmi:dtdl:class:Enum;3".
  * [SHALL NOT](spec/Completion-ClassEnumTypeIncludesIrrelevantDtmiOrTermV3.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "Enum" or "dtmi:dtdl:class:Enum;3", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassEnumTypeIncludesInvalidDtmiV3.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MUST NOT](spec/Requirement-ClassEnumTypeIncludesNotDtmiNorTermV3.json) include any string that contains ":" but does not start with "dtmi:".
  * [SHALL NOT](spec/Completion-ClassEnumTypeIncludesUndefinedTermV3.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
* valueSchema
  * Value [MUST](spec/Requirement-ClassEnumPropertyValueSchemaSpecificValuesV3.json) be "integer", "string", "dtmi:dtdl:instance:Schema:integer;3", "dtmi:dtdl:instance:Schema:integer;2", "dtmi:dtdl:instance:Schema:string;3", "dtmi:dtdl:instance:Schema:string;2", or an array containing exactly one of these string values.
  * Value "integer" is [RECOMMENDED](spec/Recommendation-ClassEnumPropertyValueSchemaValueIntegerPreferToDtmiV3.json) over value dtmi:dtdl:instance:Schema:integer;3.
  * Value "string" is [RECOMMENDED](spec/Recommendation-ClassEnumPropertyValueSchemaValueStringPreferToDtmiV3.json) over value dtmi:dtdl:instance:Schema:string;3.
  * Member name [MAY](spec/Allowance-ClassEnumPropertyValueSchemaDtmiV3.json) be expressed as "dtmi:dtdl:property:valueSchema;3" instead of "valueSchema", but "valueSchema" is [RECOMMENDED](spec/Recommendation-ClassEnumPropertyValueSchemaTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassEnumPropertyValueSchemaTermAndDtmiV3.json) be expressed as both "valueSchema" and "dtmi:dtdl:property:valueSchema;3".

The following members are [OPTIONAL](spec/Allowance-ClassEnumOptionalPropertiesV3.json) unless otherwise noted:

* @context
  * [MUST](spec/Requirement-ClassEnumContextConformsV3.json) conform to the specified [context](#context) rules.
* @id
  * [REQUIRED](spec/Requirement-ClassEnumIdRequiredV3.json) when the Enum element is included in Interface member "schemas".
  * Value [MUST](spec/Requirement-ClassEnumIdIsDtmiV3.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassEnumIdNotArrayV3.json) be an array.
  * Value [MUST](spec/Requirement-ClassEnumIdDuplicateV3.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassEnumPropertyCommentStringV3.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassEnumPropertyCommentStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassEnumPropertyCommentDtmiV3.json) be expressed as "dtmi:dtdl:property:comment;3" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassEnumPropertyCommentTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassEnumPropertyCommentTermAndDtmiV3.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;3".
* description
  * Value [MUST](spec/Requirement-ClassEnumPropertyDescriptionLangStringV3.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassEnumPropertyDescriptionStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassEnumPropertyDescriptionDtmiV3.json) be expressed as "dtmi:dtdl:property:description;3" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassEnumPropertyDescriptionTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassEnumPropertyDescriptionTermAndDtmiV3.json) be expressed as both "description" and "dtmi:dtdl:property:description;3".
* displayName
  * Value [MUST](spec/Requirement-ClassEnumPropertyDisplayNameLangStringV3.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassEnumPropertyDisplayNameStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassEnumPropertyDisplayNameDtmiV3.json) be expressed as "dtmi:dtdl:property:displayName;3" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassEnumPropertyDisplayNameTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassEnumPropertyDisplayNameTermAndDtmiV3.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;3".
* enumValues
  * Value [MUST](spec/Requirement-ClassEnumPropertyEnumValuesElementV3.json) be a DTDL element, a dependent reference to DTDL element, or an array of DTDL elements and dependent references to DTDL elements.
  * For each included dependent reference, the model [SHALL](spec/Completion-ClassEnumPropertyEnumValuesDependentReferenceV3.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * Each included or referentially included DTDL element [MUST](spec/Requirement-ClassEnumPropertyEnumValuesTypeConformanceV3.json) conform to the definition of DTDL element [EnumValue](#enumvalue).
  * Member name [MAY](spec/Allowance-ClassEnumPropertyEnumValuesDtmiV3.json) be expressed as "dtmi:dtdl:property:enumValues;3" instead of "enumValues", but "enumValues" is [RECOMMENDED](spec/Recommendation-ClassEnumPropertyEnumValuesTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassEnumPropertyEnumValuesTermAndDtmiV3.json) be expressed as both "enumValues" and "dtmi:dtdl:property:enumValues;3".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* Members with names starting with "@" other than "@context", "@id", and "@type" [MUST NOT](spec/Requirement-ClassEnumInvalidKeywordsV3.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [SHALL NOT](spec/Completion-ClassEnumPropertyIrrelevantDtmiOrTermV3.json) be present if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "enumValues", "valueSchema", "dtmi:dtdl:property:comment;3", "dtmi:dtdl:property:description;3", "dtmi:dtdl:property:displayName;3", "dtmi:dtdl:property:enumValues;3", "dtmi:dtdl:property:valueSchema;3".
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassEnumPropertyFormallyIrrelevantDtmiOrTermV3.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "enumValues", "valueSchema", "dtmi:dtdl:property:comment;3", "dtmi:dtdl:property:description;3", "dtmi:dtdl:property:displayName;3", "dtmi:dtdl:property:enumValues;3", "dtmi:dtdl:property:valueSchema;3".
* A member [MUST NOT](spec/Requirement-ClassEnumPropertyInvalidDtmiV3.json) be present if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassEnumPropertyNotDtmiNorTermV3.json) be present if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [SHALL NOT](spec/Completion-ClassEnumPropertyUndefinedTermV3.json) be present if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassEnumPropertyFormallyUndefinedTermV3.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### EnumValue

Example:

```json
{
  "@context": "dtmi:dtdl:context;3",
  "@id": "dtmi:example:beta_yekk;1",
  "@type": "Interface",
  "schemas": {
    "@id": "dtmi:example:beta_itch;1",
    "@type": "Enum",
    "valueSchema": "integer",
    "enumValues": {
      "enumValue": 11,
      "name": "beta_flunn"
    }
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassEnumValueRequiredPropertiesV3.json):

* enumValue
  * Value [MUST](spec/Requirement-ClassEnumValuePropertyEnumValueIntegerV3.json) be a [representational integer](#representational-integer) or an array containing exactly one representational integer if any parent [Enum](#enum) element has a "valueSchema" member that includes "integer" or "dtmi:dtdl:instance:Schema:integer;3".
  * Value [MUST](spec/Requirement-ClassEnumValuePropertyEnumValueStringV3.json) be a [representational string](#representational-string) or an array containing exactly one representational string if any parent [Enum](#enum) element has a "valueSchema" member that includes "string" or "dtmi:dtdl:instance:Schema:string;3".
  * Literal value [MUST](spec/Requirement-ClassEnumValuePropertyEnumValueUniqueAmongEnumEnumValuesV3.json) be unique among the included values of "enumValue" members of all elements included or referentially included in the "enumValues" member of any parent [Enum](#enum) element.
  * Member name [MAY](spec/Allowance-ClassEnumValuePropertyEnumValueDtmiV3.json) be expressed as "dtmi:dtdl:property:enumValue;3" instead of "enumValue", but "enumValue" is [RECOMMENDED](spec/Recommendation-ClassEnumValuePropertyEnumValueTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassEnumValuePropertyEnumValueTermAndDtmiV3.json) be expressed as both "enumValue" and "dtmi:dtdl:property:enumValue;3".
* name
  * Value [MUST](spec/Requirement-ClassEnumValuePropertyNameStringV3.json) be a [representational string](#representational-string) or an array containing exactly one representational string.
  * String value [MUST NOT](spec/Requirement-ClassEnumValuePropertyNameStringLengthV3.json) be more than 512 characters in length.
  * String value [MUST](spec/Requirement-ClassEnumValuePropertyNamePatternV3.json) match regular expression `^[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?$`.
  * String value [MUST](spec/Requirement-ClassEnumValuePropertyNameUniqueAmongEnumEnumValuesV3.json) be unique among the included values of "name" members of all elements included or referentially included in the "enumValues" member of any parent [Enum](#enum) element.
  * Member name [MAY](spec/Allowance-ClassEnumValuePropertyNameDtmiV3.json) be expressed as "dtmi:dtdl:property:name;3" instead of "name", but "name" is [RECOMMENDED](spec/Recommendation-ClassEnumValuePropertyNameTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassEnumValuePropertyNameTermAndDtmiV3.json) be expressed as both "name" and "dtmi:dtdl:property:name;3".

The following members are [OPTIONAL](spec/Allowance-ClassEnumValueOptionalPropertiesV3.json):

* @context
  * [MUST](spec/Requirement-ClassEnumValueContextConformsV3.json) conform to the specified [context](#context) rules.
* @type
  * Value [MUST](spec/Requirement-ClassEnumValueTypeStringOrArrayV3.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassEnumValueTypeIncludesMaterialV3.json) include either string "EnumValue" or string "dtmi:dtdl:class:EnumValue;3".
  * [SHOULD NOT](spec/Recommendation-ClassEnumValueTypeIncludesTermAndDtmiV3.json) include both "EnumValue" and "dtmi:dtdl:class:EnumValue;3".
  * [SHOULD NOT](spec/Recommendation-ClassEnumValueTypeDuplicatesMaterialV3.json) include more than one instance of either "EnumValue" or "dtmi:dtdl:class:EnumValue;3".
  * String "EnumValue" is [RECOMMENDED](spec/Recommendation-ClassEnumValueTypePreferTermToDtmiV3.json) over string "dtmi:dtdl:class:EnumValue;3".
  * [SHALL NOT](spec/Completion-ClassEnumValueTypeIncludesIrrelevantDtmiOrTermV3.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "EnumValue" or "dtmi:dtdl:class:EnumValue;3", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassEnumValueTypeIncludesInvalidDtmiV3.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MUST NOT](spec/Requirement-ClassEnumValueTypeIncludesNotDtmiNorTermV3.json) include any string that contains ":" but does not start with "dtmi:".
  * [SHALL NOT](spec/Completion-ClassEnumValueTypeIncludesUndefinedTermV3.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
* @id
  * Value [MUST](spec/Requirement-ClassEnumValueIdIsDtmiV3.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassEnumValueIdNotArrayV3.json) be an array.
  * Value [MUST](spec/Requirement-ClassEnumValueIdDuplicateV3.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassEnumValuePropertyCommentStringV3.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassEnumValuePropertyCommentStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassEnumValuePropertyCommentDtmiV3.json) be expressed as "dtmi:dtdl:property:comment;3" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassEnumValuePropertyCommentTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassEnumValuePropertyCommentTermAndDtmiV3.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;3".
* description
  * Value [MUST](spec/Requirement-ClassEnumValuePropertyDescriptionLangStringV3.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassEnumValuePropertyDescriptionStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassEnumValuePropertyDescriptionDtmiV3.json) be expressed as "dtmi:dtdl:property:description;3" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassEnumValuePropertyDescriptionTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassEnumValuePropertyDescriptionTermAndDtmiV3.json) be expressed as both "description" and "dtmi:dtdl:property:description;3".
* displayName
  * Value [MUST](spec/Requirement-ClassEnumValuePropertyDisplayNameLangStringV3.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassEnumValuePropertyDisplayNameStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassEnumValuePropertyDisplayNameDtmiV3.json) be expressed as "dtmi:dtdl:property:displayName;3" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassEnumValuePropertyDisplayNameTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassEnumValuePropertyDisplayNameTermAndDtmiV3.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;3".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* Members with names starting with "@" other than "@context", "@id", and "@type" [MUST NOT](spec/Requirement-ClassEnumValueInvalidKeywordsV3.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [SHALL NOT](spec/Completion-ClassEnumValuePropertyIrrelevantDtmiOrTermV3.json) be present if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "enumValue", "name", "dtmi:dtdl:property:comment;3", "dtmi:dtdl:property:description;3", "dtmi:dtdl:property:displayName;3", "dtmi:dtdl:property:enumValue;3", "dtmi:dtdl:property:name;3".
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassEnumValuePropertyFormallyIrrelevantDtmiOrTermV3.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "enumValue", "name", "dtmi:dtdl:property:comment;3", "dtmi:dtdl:property:description;3", "dtmi:dtdl:property:displayName;3", "dtmi:dtdl:property:enumValue;3", "dtmi:dtdl:property:name;3".
* A member [MUST NOT](spec/Requirement-ClassEnumValuePropertyInvalidDtmiV3.json) be present if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassEnumValuePropertyNotDtmiNorTermV3.json) be present if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [SHALL NOT](spec/Completion-ClassEnumValuePropertyUndefinedTermV3.json) be present if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassEnumValuePropertyFormallyUndefinedTermV3.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### Field

Example:

```json
{
  "@context": "dtmi:dtdl:context;3",
  "@id": "dtmi:example:gamma_epsilon;1",
  "@type": "Interface",
  "schemas": {
    "@id": "dtmi:example:gamma_delta;1",
    "@type": "Object",
    "fields": {
      "name": "gamma_gamma",
      "schema": "double"
    }
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassFieldRequiredPropertiesV3.json):

* name
  * Value [MUST](spec/Requirement-ClassFieldPropertyNameStringV3.json) be a [representational string](#representational-string) or an array containing exactly one representational string.
  * String value [MUST NOT](spec/Requirement-ClassFieldPropertyNameStringLengthV3.json) be more than 512 characters in length.
  * String value [MUST](spec/Requirement-ClassFieldPropertyNamePatternV3.json) match regular expression `^[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?$`.
  * String value [MUST](spec/Requirement-ClassFieldPropertyNameUniqueAmongObjectFieldsV3.json) be unique among the included values of "name" members of all elements included or referentially included in the "fields" member of any parent [Object](#object) element.
  * Member name [MAY](spec/Allowance-ClassFieldPropertyNameDtmiV3.json) be expressed as "dtmi:dtdl:property:name;3" instead of "name", but "name" is [RECOMMENDED](spec/Recommendation-ClassFieldPropertyNameTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassFieldPropertyNameTermAndDtmiV3.json) be expressed as both "name" and "dtmi:dtdl:property:name;3".
* schema
  * Value [MUST](spec/Requirement-ClassFieldPropertySchemaElementV3.json) be a DTDL element, a dependent reference to a DTDL element, a string from one of the rows in a [Standard schemas](#standard-schemas) table, a string defined by an extension referenced in the active context, or an array containing exactly one DTDL element, dependent reference to a DTDL element, string from one of the rows in a Standard schemas table, or string defined by an extension referenced in the active context.
  * If the value is a dependent reference or an array containing a dependent reference, the model [SHALL](spec/Completion-ClassFieldPropertySchemaDependentReferenceV3.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * If present, an included or referentially included DTDL element [MUST](spec/Requirement-ClassFieldPropertySchemaTypeConformanceV3.json) conform to the definition of DTDL element [Array](#array) or [Enum](#enum) or [Map](#map) or [Object](#object) or DTDLv2 element [Array](../v2/DTDL.Specification.v2.md#array) or [Enum](../v2/DTDL.Specification.v2.md#enum) or [Map](../v2/DTDL.Specification.v2.md#map) or [Object](../v2/DTDL.Specification.v2.md#object).
  * If a string from one of the rows in a Standard schemas table is included, a string from column "Term" is [RECOMMENDED](spec/Recommendation-ClassFieldPropertySchemaPreferTermToDtmiV3.json) over a string from column "DTMI".
  * Considered with other DTDL elements, value is subject to any relevant restrictions in [Limits and exclusions](#limits-and-exclusions).
  * Member name [MAY](spec/Allowance-ClassFieldPropertySchemaDtmiV3.json) be expressed as "dtmi:dtdl:property:schema;3" instead of "schema", but "schema" is [RECOMMENDED](spec/Recommendation-ClassFieldPropertySchemaTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassFieldPropertySchemaTermAndDtmiV3.json) be expressed as both "schema" and "dtmi:dtdl:property:schema;3".

The following members are [OPTIONAL](spec/Allowance-ClassFieldOptionalPropertiesV3.json):

* @context
  * [MUST](spec/Requirement-ClassFieldContextConformsV3.json) conform to the specified [context](#context) rules.
* @type
  * Value [MUST](spec/Requirement-ClassFieldTypeStringOrArrayV3.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassFieldTypeIncludesMaterialV3.json) include either string "Field" or string "dtmi:dtdl:class:Field;3".
  * [SHOULD NOT](spec/Recommendation-ClassFieldTypeIncludesTermAndDtmiV3.json) include both "Field" and "dtmi:dtdl:class:Field;3".
  * [SHOULD NOT](spec/Recommendation-ClassFieldTypeDuplicatesMaterialV3.json) include more than one instance of either "Field" or "dtmi:dtdl:class:Field;3".
  * String "Field" is [RECOMMENDED](spec/Recommendation-ClassFieldTypePreferTermToDtmiV3.json) over string "dtmi:dtdl:class:Field;3".
  * [SHALL NOT](spec/Completion-ClassFieldTypeIncludesIrrelevantDtmiOrTermV3.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "Field" or "dtmi:dtdl:class:Field;3", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassFieldTypeIncludesInvalidDtmiV3.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MUST NOT](spec/Requirement-ClassFieldTypeIncludesNotDtmiNorTermV3.json) include any string that contains ":" but does not start with "dtmi:".
  * [SHALL NOT](spec/Completion-ClassFieldTypeIncludesUndefinedTermV3.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
* @id
  * Value [MUST](spec/Requirement-ClassFieldIdIsDtmiV3.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassFieldIdNotArrayV3.json) be an array.
  * Value [MUST](spec/Requirement-ClassFieldIdDuplicateV3.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassFieldPropertyCommentStringV3.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassFieldPropertyCommentStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassFieldPropertyCommentDtmiV3.json) be expressed as "dtmi:dtdl:property:comment;3" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassFieldPropertyCommentTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassFieldPropertyCommentTermAndDtmiV3.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;3".
* description
  * Value [MUST](spec/Requirement-ClassFieldPropertyDescriptionLangStringV3.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassFieldPropertyDescriptionStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassFieldPropertyDescriptionDtmiV3.json) be expressed as "dtmi:dtdl:property:description;3" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassFieldPropertyDescriptionTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassFieldPropertyDescriptionTermAndDtmiV3.json) be expressed as both "description" and "dtmi:dtdl:property:description;3".
* displayName
  * Value [MUST](spec/Requirement-ClassFieldPropertyDisplayNameLangStringV3.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassFieldPropertyDisplayNameStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassFieldPropertyDisplayNameDtmiV3.json) be expressed as "dtmi:dtdl:property:displayName;3" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassFieldPropertyDisplayNameTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassFieldPropertyDisplayNameTermAndDtmiV3.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;3".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* Members with names starting with "@" other than "@context", "@id", and "@type" [MUST NOT](spec/Requirement-ClassFieldInvalidKeywordsV3.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [SHALL NOT](spec/Completion-ClassFieldPropertyIrrelevantDtmiOrTermV3.json) be present if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "name", "schema", "dtmi:dtdl:property:comment;3", "dtmi:dtdl:property:description;3", "dtmi:dtdl:property:displayName;3", "dtmi:dtdl:property:name;3", "dtmi:dtdl:property:schema;3".
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassFieldPropertyFormallyIrrelevantDtmiOrTermV3.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "name", "schema", "dtmi:dtdl:property:comment;3", "dtmi:dtdl:property:description;3", "dtmi:dtdl:property:displayName;3", "dtmi:dtdl:property:name;3", "dtmi:dtdl:property:schema;3".
* A member [MUST NOT](spec/Requirement-ClassFieldPropertyInvalidDtmiV3.json) be present if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassFieldPropertyNotDtmiNorTermV3.json) be present if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [SHALL NOT](spec/Completion-ClassFieldPropertyUndefinedTermV3.json) be present if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassFieldPropertyFormallyUndefinedTermV3.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### Interface

Example:

```json
{
  "@context": "dtmi:dtdl:context;3",
  "@id": "dtmi:example:gamma_theta;1",
  "@type": "Interface"
}
```

The following members are [REQUIRED](spec/Requirement-ClassInterfaceRequiredPropertiesV3.json):

* @type
  * Value [MUST](spec/Requirement-ClassInterfaceTypeStringOrArrayV3.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassInterfaceTypeIncludesMaterialV3.json) include either string "Interface" or string "dtmi:dtdl:class:Interface;3".
  * [SHOULD NOT](spec/Recommendation-ClassInterfaceTypeIncludesTermAndDtmiV3.json) include both "Interface" and "dtmi:dtdl:class:Interface;3".
  * [SHOULD NOT](spec/Recommendation-ClassInterfaceTypeDuplicatesMaterialV3.json) include more than one instance of either "Interface" or "dtmi:dtdl:class:Interface;3".
  * String "Interface" is [RECOMMENDED](spec/Recommendation-ClassInterfaceTypePreferTermToDtmiV3.json) over string "dtmi:dtdl:class:Interface;3".
  * [SHALL NOT](spec/Completion-ClassInterfaceTypeIncludesIrrelevantDtmiOrTermV3.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "Interface" or "dtmi:dtdl:class:Interface;3", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassInterfaceTypeIncludesInvalidDtmiV3.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MUST NOT](spec/Requirement-ClassInterfaceTypeIncludesNotDtmiNorTermV3.json) include any string that contains ":" but does not start with "dtmi:".
  * [SHALL NOT](spec/Completion-ClassInterfaceTypeIncludesUndefinedTermV3.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
* @id
  * Value [MUST](spec/Requirement-ClassInterfaceIdIsDtmiV3.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassInterfaceIdNotArrayV3.json) be an array.
  * Value [MUST](spec/Requirement-ClassInterfaceIdDuplicateV3.json) be unique among the values of all "@id" members of all elements in the model.
  * Length of value string [MUST NOT](spec/Requirement-ClassInterfaceIdLongV3.json) exceed 128 characters.

The following members are [OPTIONAL](spec/Allowance-ClassInterfaceOptionalPropertiesV3.json) unless otherwise noted:

* @context
  * [REQUIRED](spec/Requirement-ClassInterfaceContextAtTopLevelV3.json) when the Interface element is a top-level element.
  * [MUST](spec/Requirement-ClassInterfaceContextDtdlTopLevelV3.json) include value "dtmi:dtdl:context;3" when the Interface element is a top-level element.
  * [MUST](spec/Requirement-ClassInterfaceContextConformsV3.json) conform to the specified [context](#context) rules.
* comment
  * Value [MUST](spec/Requirement-ClassInterfacePropertyCommentStringV3.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassInterfacePropertyCommentStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassInterfacePropertyCommentDtmiV3.json) be expressed as "dtmi:dtdl:property:comment;3" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassInterfacePropertyCommentTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassInterfacePropertyCommentTermAndDtmiV3.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;3".
* contents
  * Value [MUST](spec/Requirement-ClassInterfacePropertyContentsElementV3.json) be a DTDL element, a dependent reference to DTDL element, or an array of DTDL elements and dependent references to DTDL elements.
  * For each included dependent reference, the model [SHALL](spec/Completion-ClassInterfacePropertyContentsDependentReferenceV3.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * Each included or referentially included DTDL element [MUST](spec/Requirement-ClassInterfacePropertyContentsTypeConformanceV3.json) conform to the definition of DTDL element [Command](#command) or [Component](#component) or [Property](#property) or [Relationship](#relationship) or [Telemetry](#telemetry) or DTDLv2 element [Command](../v2/DTDL.Specification.v2.md#command) or [Component](../v2/DTDL.Specification.v2.md#component) or [Property](../v2/DTDL.Specification.v2.md#property) or [Relationship](../v2/DTDL.Specification.v2.md#relationship) or [Telemetry](../v2/DTDL.Specification.v2.md#telemetry).
  * Considered with other DTDL elements, value is subject to any relevant restrictions in [Limits and exclusions](#limits-and-exclusions).
  * Member name [MAY](spec/Allowance-ClassInterfacePropertyContentsDtmiV3.json) be expressed as "dtmi:dtdl:property:contents;3" instead of "contents", but "contents" is [RECOMMENDED](spec/Recommendation-ClassInterfacePropertyContentsTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassInterfacePropertyContentsTermAndDtmiV3.json) be expressed as both "contents" and "dtmi:dtdl:property:contents;3".
* description
  * Value [MUST](spec/Requirement-ClassInterfacePropertyDescriptionLangStringV3.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassInterfacePropertyDescriptionStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassInterfacePropertyDescriptionDtmiV3.json) be expressed as "dtmi:dtdl:property:description;3" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassInterfacePropertyDescriptionTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassInterfacePropertyDescriptionTermAndDtmiV3.json) be expressed as both "description" and "dtmi:dtdl:property:description;3".
* displayName
  * Value [MUST](spec/Requirement-ClassInterfacePropertyDisplayNameLangStringV3.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassInterfacePropertyDisplayNameStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassInterfacePropertyDisplayNameDtmiV3.json) be expressed as "dtmi:dtdl:property:displayName;3" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassInterfacePropertyDisplayNameTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassInterfacePropertyDisplayNameTermAndDtmiV3.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;3".
* extends
  * Value [MUST](spec/Requirement-ClassInterfacePropertyExtendsElementV3.json) be a DTDL element, a dependent reference to DTDL element, or an array of DTDL elements and dependent references to DTDL elements.
  * For each included dependent reference, the model [SHALL](spec/Completion-ClassInterfacePropertyExtendsDependentReferenceV3.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * Each included or referentially included DTDL element [MUST](spec/Requirement-ClassInterfacePropertyExtendsTypeConformanceV3.json) conform to the definition of DTDL element [Interface](#interface) or DTDLv2 element [Interface](../v2/DTDL.Specification.v2.md#interface).
  * Considered with other DTDL elements, value is subject to any relevant restrictions in [Limits and exclusions](#limits-and-exclusions).
  * Member name [MAY](spec/Allowance-ClassInterfacePropertyExtendsDtmiV3.json) be expressed as "dtmi:dtdl:property:extends;3" instead of "extends", but "extends" is [RECOMMENDED](spec/Recommendation-ClassInterfacePropertyExtendsTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassInterfacePropertyExtendsTermAndDtmiV3.json) be expressed as both "extends" and "dtmi:dtdl:property:extends;3".
* schemas
  * Value [MUST](spec/Requirement-ClassInterfacePropertySchemasElementV3.json) be a DTDL element, a dependent reference to DTDL element, or an array of DTDL elements and dependent references to DTDL elements.
  * For each included dependent reference, the model [SHALL](spec/Completion-ClassInterfacePropertySchemasDependentReferenceV3.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * Each included or referentially included DTDL element [MUST](spec/Requirement-ClassInterfacePropertySchemasTypeConformanceV3.json) conform to the definition of DTDL element [Array](#array) or [Enum](#enum) or [Map](#map) or [Object](#object).
  * Member name [MAY](spec/Allowance-ClassInterfacePropertySchemasDtmiV3.json) be expressed as "dtmi:dtdl:property:schemas;3" instead of "schemas", but "schemas" is [RECOMMENDED](spec/Recommendation-ClassInterfacePropertySchemasTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassInterfacePropertySchemasTermAndDtmiV3.json) be expressed as both "schemas" and "dtmi:dtdl:property:schemas;3".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* Members with names starting with "@" other than "@context", "@id", and "@type" [MUST NOT](spec/Requirement-ClassInterfaceInvalidKeywordsV3.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [SHALL NOT](spec/Completion-ClassInterfacePropertyIrrelevantDtmiOrTermV3.json) be present if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "contents", "description", "displayName", "extends", "schemas", "dtmi:dtdl:property:comment;3", "dtmi:dtdl:property:contents;3", "dtmi:dtdl:property:description;3", "dtmi:dtdl:property:displayName;3", "dtmi:dtdl:property:extends;3", "dtmi:dtdl:property:schemas;3".
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassInterfacePropertyFormallyIrrelevantDtmiOrTermV3.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "contents", "description", "displayName", "extends", "schemas", "dtmi:dtdl:property:comment;3", "dtmi:dtdl:property:contents;3", "dtmi:dtdl:property:description;3", "dtmi:dtdl:property:displayName;3", "dtmi:dtdl:property:extends;3", "dtmi:dtdl:property:schemas;3".
* A member [MUST NOT](spec/Requirement-ClassInterfacePropertyInvalidDtmiV3.json) be present if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassInterfacePropertyNotDtmiNorTermV3.json) be present if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [SHALL NOT](spec/Completion-ClassInterfacePropertyUndefinedTermV3.json) be present if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassInterfacePropertyFormallyUndefinedTermV3.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### Map

Example:

```json
{
  "@context": "dtmi:dtdl:context;3",
  "@id": "dtmi:example:gamma_mu;1",
  "@type": "Interface",
  "schemas": {
    "@id": "dtmi:example:gamma_iota;1",
    "@type": "Map",
    "mapKey": {
      "name": "gamma_kappa",
      "schema": "string"
    },
    "mapValue": {
      "name": "gamma_lambda",
      "schema": "duration"
    }
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassMapRequiredPropertiesV3.json):

* @type
  * Value [MUST](spec/Requirement-ClassMapTypeStringOrArrayV3.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassMapTypeIncludesMaterialV3.json) include either string "Map" or string "dtmi:dtdl:class:Map;3".
  * [SHOULD NOT](spec/Recommendation-ClassMapTypeIncludesTermAndDtmiV3.json) include both "Map" and "dtmi:dtdl:class:Map;3".
  * [SHOULD NOT](spec/Recommendation-ClassMapTypeDuplicatesMaterialV3.json) include more than one instance of either "Map" or "dtmi:dtdl:class:Map;3".
  * String "Map" is [RECOMMENDED](spec/Recommendation-ClassMapTypePreferTermToDtmiV3.json) over string "dtmi:dtdl:class:Map;3".
  * [SHALL NOT](spec/Completion-ClassMapTypeIncludesIrrelevantDtmiOrTermV3.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "Map" or "dtmi:dtdl:class:Map;3", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassMapTypeIncludesInvalidDtmiV3.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MUST NOT](spec/Requirement-ClassMapTypeIncludesNotDtmiNorTermV3.json) include any string that contains ":" but does not start with "dtmi:".
  * [SHALL NOT](spec/Completion-ClassMapTypeIncludesUndefinedTermV3.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
* mapKey
  * Value [MUST](spec/Requirement-ClassMapPropertyMapKeyElementV3.json) be a DTDL element, a dependent reference to DTDL element, or an array containing exactly one DTDL element or dependent reference to a DTDL element.
  * If the value is a dependent reference or an array containing a dependent reference, the model [SHALL](spec/Completion-ClassMapPropertyMapKeyDependentReferenceV3.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * The included or referentially included DTDL element [MUST](spec/Requirement-ClassMapPropertyMapKeyTypeConformanceV3.json) conform to the definition of DTDL element [MapKey](#mapkey).
  * Member name [MAY](spec/Allowance-ClassMapPropertyMapKeyDtmiV3.json) be expressed as "dtmi:dtdl:property:mapKey;3" instead of "mapKey", but "mapKey" is [RECOMMENDED](spec/Recommendation-ClassMapPropertyMapKeyTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapPropertyMapKeyTermAndDtmiV3.json) be expressed as both "mapKey" and "dtmi:dtdl:property:mapKey;3".
* mapValue
  * Value [MUST](spec/Requirement-ClassMapPropertyMapValueElementV3.json) be a DTDL element, a dependent reference to DTDL element, or an array containing exactly one DTDL element or dependent reference to a DTDL element.
  * If the value is a dependent reference or an array containing a dependent reference, the model [SHALL](spec/Completion-ClassMapPropertyMapValueDependentReferenceV3.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * The included or referentially included DTDL element [MUST](spec/Requirement-ClassMapPropertyMapValueTypeConformanceV3.json) conform to the definition of DTDL element [MapValue](#mapvalue).
  * Member name [MAY](spec/Allowance-ClassMapPropertyMapValueDtmiV3.json) be expressed as "dtmi:dtdl:property:mapValue;3" instead of "mapValue", but "mapValue" is [RECOMMENDED](spec/Recommendation-ClassMapPropertyMapValueTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapPropertyMapValueTermAndDtmiV3.json) be expressed as both "mapValue" and "dtmi:dtdl:property:mapValue;3".

The following members are [OPTIONAL](spec/Allowance-ClassMapOptionalPropertiesV3.json) unless otherwise noted:

* @context
  * [MUST](spec/Requirement-ClassMapContextConformsV3.json) conform to the specified [context](#context) rules.
* @id
  * [REQUIRED](spec/Requirement-ClassMapIdRequiredV3.json) when the Map element is included in Interface member "schemas".
  * Value [MUST](spec/Requirement-ClassMapIdIsDtmiV3.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassMapIdNotArrayV3.json) be an array.
  * Value [MUST](spec/Requirement-ClassMapIdDuplicateV3.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassMapPropertyCommentStringV3.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassMapPropertyCommentStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassMapPropertyCommentDtmiV3.json) be expressed as "dtmi:dtdl:property:comment;3" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassMapPropertyCommentTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapPropertyCommentTermAndDtmiV3.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;3".
* description
  * Value [MUST](spec/Requirement-ClassMapPropertyDescriptionLangStringV3.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassMapPropertyDescriptionStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassMapPropertyDescriptionDtmiV3.json) be expressed as "dtmi:dtdl:property:description;3" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassMapPropertyDescriptionTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapPropertyDescriptionTermAndDtmiV3.json) be expressed as both "description" and "dtmi:dtdl:property:description;3".
* displayName
  * Value [MUST](spec/Requirement-ClassMapPropertyDisplayNameLangStringV3.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassMapPropertyDisplayNameStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassMapPropertyDisplayNameDtmiV3.json) be expressed as "dtmi:dtdl:property:displayName;3" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassMapPropertyDisplayNameTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapPropertyDisplayNameTermAndDtmiV3.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;3".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* Members with names starting with "@" other than "@context", "@id", and "@type" [MUST NOT](spec/Requirement-ClassMapInvalidKeywordsV3.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [SHALL NOT](spec/Completion-ClassMapPropertyIrrelevantDtmiOrTermV3.json) be present if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "mapKey", "mapValue", "dtmi:dtdl:property:comment;3", "dtmi:dtdl:property:description;3", "dtmi:dtdl:property:displayName;3", "dtmi:dtdl:property:mapKey;3", "dtmi:dtdl:property:mapValue;3".
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassMapPropertyFormallyIrrelevantDtmiOrTermV3.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "mapKey", "mapValue", "dtmi:dtdl:property:comment;3", "dtmi:dtdl:property:description;3", "dtmi:dtdl:property:displayName;3", "dtmi:dtdl:property:mapKey;3", "dtmi:dtdl:property:mapValue;3".
* A member [MUST NOT](spec/Requirement-ClassMapPropertyInvalidDtmiV3.json) be present if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassMapPropertyNotDtmiNorTermV3.json) be present if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [SHALL NOT](spec/Completion-ClassMapPropertyUndefinedTermV3.json) be present if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassMapPropertyFormallyUndefinedTermV3.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### MapKey

Example:

```json
{
  "@context": "dtmi:dtdl:context;3",
  "@id": "dtmi:example:gamma_pi;1",
  "@type": "Interface",
  "schemas": {
    "@id": "dtmi:example:gamma_xi;1",
    "@type": "Map",
    "mapValue": {
      "name": "gamma_omicron",
      "schema": "float"
    },
    "mapKey": {
      "name": "gamma_nu",
      "schema": "string"
    }
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassMapKeyRequiredPropertiesV3.json):

* name
  * Value [MUST](spec/Requirement-ClassMapKeyPropertyNameStringV3.json) be a [representational string](#representational-string) or an array containing exactly one representational string.
  * String value [MUST NOT](spec/Requirement-ClassMapKeyPropertyNameStringLengthV3.json) be more than 512 characters in length.
  * String value [MUST](spec/Requirement-ClassMapKeyPropertyNamePatternV3.json) match regular expression `^[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?$`.
  * Member name [MAY](spec/Allowance-ClassMapKeyPropertyNameDtmiV3.json) be expressed as "dtmi:dtdl:property:name;3" instead of "name", but "name" is [RECOMMENDED](spec/Recommendation-ClassMapKeyPropertyNameTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapKeyPropertyNameTermAndDtmiV3.json) be expressed as both "name" and "dtmi:dtdl:property:name;3".
* schema
  * Value [MUST](spec/Requirement-ClassMapKeyPropertySchemaSpecificValuesV3.json) be "string", "dtmi:dtdl:instance:Schema:string;3", "dtmi:dtdl:instance:Schema:string;2", or an array containing exactly one of these string values.
  * Value "string" is [RECOMMENDED](spec/Recommendation-ClassMapKeyPropertySchemaValueStringPreferToDtmiV3.json) over value dtmi:dtdl:instance:Schema:string;3.
  * Considered with other DTDL elements, value is subject to any relevant restrictions in [Limits and exclusions](#limits-and-exclusions).
  * Member name [MAY](spec/Allowance-ClassMapKeyPropertySchemaDtmiV3.json) be expressed as "dtmi:dtdl:property:schema;3" instead of "schema", but "schema" is [RECOMMENDED](spec/Recommendation-ClassMapKeyPropertySchemaTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapKeyPropertySchemaTermAndDtmiV3.json) be expressed as both "schema" and "dtmi:dtdl:property:schema;3".

The following members are [OPTIONAL](spec/Allowance-ClassMapKeyOptionalPropertiesV3.json):

* @context
  * [MUST](spec/Requirement-ClassMapKeyContextConformsV3.json) conform to the specified [context](#context) rules.
* @type
  * Value [MUST](spec/Requirement-ClassMapKeyTypeStringOrArrayV3.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassMapKeyTypeIncludesMaterialV3.json) include either string "MapKey" or string "dtmi:dtdl:class:MapKey;3".
  * [SHOULD NOT](spec/Recommendation-ClassMapKeyTypeIncludesTermAndDtmiV3.json) include both "MapKey" and "dtmi:dtdl:class:MapKey;3".
  * [SHOULD NOT](spec/Recommendation-ClassMapKeyTypeDuplicatesMaterialV3.json) include more than one instance of either "MapKey" or "dtmi:dtdl:class:MapKey;3".
  * String "MapKey" is [RECOMMENDED](spec/Recommendation-ClassMapKeyTypePreferTermToDtmiV3.json) over string "dtmi:dtdl:class:MapKey;3".
  * [SHALL NOT](spec/Completion-ClassMapKeyTypeIncludesIrrelevantDtmiOrTermV3.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "MapKey" or "dtmi:dtdl:class:MapKey;3", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassMapKeyTypeIncludesInvalidDtmiV3.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MUST NOT](spec/Requirement-ClassMapKeyTypeIncludesNotDtmiNorTermV3.json) include any string that contains ":" but does not start with "dtmi:".
  * [SHALL NOT](spec/Completion-ClassMapKeyTypeIncludesUndefinedTermV3.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
* @id
  * Value [MUST](spec/Requirement-ClassMapKeyIdIsDtmiV3.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassMapKeyIdNotArrayV3.json) be an array.
  * Value [MUST](spec/Requirement-ClassMapKeyIdDuplicateV3.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassMapKeyPropertyCommentStringV3.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassMapKeyPropertyCommentStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassMapKeyPropertyCommentDtmiV3.json) be expressed as "dtmi:dtdl:property:comment;3" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassMapKeyPropertyCommentTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapKeyPropertyCommentTermAndDtmiV3.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;3".
* description
  * Value [MUST](spec/Requirement-ClassMapKeyPropertyDescriptionLangStringV3.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassMapKeyPropertyDescriptionStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassMapKeyPropertyDescriptionDtmiV3.json) be expressed as "dtmi:dtdl:property:description;3" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassMapKeyPropertyDescriptionTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapKeyPropertyDescriptionTermAndDtmiV3.json) be expressed as both "description" and "dtmi:dtdl:property:description;3".
* displayName
  * Value [MUST](spec/Requirement-ClassMapKeyPropertyDisplayNameLangStringV3.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassMapKeyPropertyDisplayNameStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassMapKeyPropertyDisplayNameDtmiV3.json) be expressed as "dtmi:dtdl:property:displayName;3" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassMapKeyPropertyDisplayNameTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapKeyPropertyDisplayNameTermAndDtmiV3.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;3".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* Members with names starting with "@" other than "@context", "@id", and "@type" [MUST NOT](spec/Requirement-ClassMapKeyInvalidKeywordsV3.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [SHALL NOT](spec/Completion-ClassMapKeyPropertyIrrelevantDtmiOrTermV3.json) be present if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "name", "schema", "dtmi:dtdl:property:comment;3", "dtmi:dtdl:property:description;3", "dtmi:dtdl:property:displayName;3", "dtmi:dtdl:property:name;3", "dtmi:dtdl:property:schema;3".
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassMapKeyPropertyFormallyIrrelevantDtmiOrTermV3.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "name", "schema", "dtmi:dtdl:property:comment;3", "dtmi:dtdl:property:description;3", "dtmi:dtdl:property:displayName;3", "dtmi:dtdl:property:name;3", "dtmi:dtdl:property:schema;3".
* A member [MUST NOT](spec/Requirement-ClassMapKeyPropertyInvalidDtmiV3.json) be present if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassMapKeyPropertyNotDtmiNorTermV3.json) be present if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [SHALL NOT](spec/Completion-ClassMapKeyPropertyUndefinedTermV3.json) be present if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassMapKeyPropertyFormallyUndefinedTermV3.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### MapValue

Example:

```json
{
  "@context": "dtmi:dtdl:context;3",
  "@id": "dtmi:example:gamma_upsilon;1",
  "@type": "Interface",
  "schemas": {
    "@id": "dtmi:example:gamma_sigma;1",
    "@type": "Map",
    "mapKey": {
      "name": "gamma_tau",
      "schema": "string"
    },
    "mapValue": {
      "name": "gamma_rho",
      "schema": "integer"
    }
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassMapValueRequiredPropertiesV3.json):

* name
  * Value [MUST](spec/Requirement-ClassMapValuePropertyNameStringV3.json) be a [representational string](#representational-string) or an array containing exactly one representational string.
  * String value [MUST NOT](spec/Requirement-ClassMapValuePropertyNameStringLengthV3.json) be more than 512 characters in length.
  * String value [MUST](spec/Requirement-ClassMapValuePropertyNamePatternV3.json) match regular expression `^[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?$`.
  * Member name [MAY](spec/Allowance-ClassMapValuePropertyNameDtmiV3.json) be expressed as "dtmi:dtdl:property:name;3" instead of "name", but "name" is [RECOMMENDED](spec/Recommendation-ClassMapValuePropertyNameTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapValuePropertyNameTermAndDtmiV3.json) be expressed as both "name" and "dtmi:dtdl:property:name;3".
* schema
  * Value [MUST](spec/Requirement-ClassMapValuePropertySchemaElementV3.json) be a DTDL element, a dependent reference to a DTDL element, a string from one of the rows in a [Standard schemas](#standard-schemas) table, a string defined by an extension referenced in the active context, or an array containing exactly one DTDL element, dependent reference to a DTDL element, string from one of the rows in a Standard schemas table, or string defined by an extension referenced in the active context.
  * If the value is a dependent reference or an array containing a dependent reference, the model [SHALL](spec/Completion-ClassMapValuePropertySchemaDependentReferenceV3.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * If present, an included or referentially included DTDL element [MUST](spec/Requirement-ClassMapValuePropertySchemaTypeConformanceV3.json) conform to the definition of DTDL element [Array](#array) or [Enum](#enum) or [Map](#map) or [Object](#object) or DTDLv2 element [Array](../v2/DTDL.Specification.v2.md#array) or [Enum](../v2/DTDL.Specification.v2.md#enum) or [Map](../v2/DTDL.Specification.v2.md#map) or [Object](../v2/DTDL.Specification.v2.md#object).
  * If a string from one of the rows in a Standard schemas table is included, a string from column "Term" is [RECOMMENDED](spec/Recommendation-ClassMapValuePropertySchemaPreferTermToDtmiV3.json) over a string from column "DTMI".
  * Considered with other DTDL elements, value is subject to any relevant restrictions in [Limits and exclusions](#limits-and-exclusions).
  * Member name [MAY](spec/Allowance-ClassMapValuePropertySchemaDtmiV3.json) be expressed as "dtmi:dtdl:property:schema;3" instead of "schema", but "schema" is [RECOMMENDED](spec/Recommendation-ClassMapValuePropertySchemaTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapValuePropertySchemaTermAndDtmiV3.json) be expressed as both "schema" and "dtmi:dtdl:property:schema;3".

The following members are [OPTIONAL](spec/Allowance-ClassMapValueOptionalPropertiesV3.json):

* @context
  * [MUST](spec/Requirement-ClassMapValueContextConformsV3.json) conform to the specified [context](#context) rules.
* @type
  * Value [MUST](spec/Requirement-ClassMapValueTypeStringOrArrayV3.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassMapValueTypeIncludesMaterialV3.json) include either string "MapValue" or string "dtmi:dtdl:class:MapValue;3".
  * [SHOULD NOT](spec/Recommendation-ClassMapValueTypeIncludesTermAndDtmiV3.json) include both "MapValue" and "dtmi:dtdl:class:MapValue;3".
  * [SHOULD NOT](spec/Recommendation-ClassMapValueTypeDuplicatesMaterialV3.json) include more than one instance of either "MapValue" or "dtmi:dtdl:class:MapValue;3".
  * String "MapValue" is [RECOMMENDED](spec/Recommendation-ClassMapValueTypePreferTermToDtmiV3.json) over string "dtmi:dtdl:class:MapValue;3".
  * [SHALL NOT](spec/Completion-ClassMapValueTypeIncludesIrrelevantDtmiOrTermV3.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "MapValue" or "dtmi:dtdl:class:MapValue;3", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassMapValueTypeIncludesInvalidDtmiV3.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MUST NOT](spec/Requirement-ClassMapValueTypeIncludesNotDtmiNorTermV3.json) include any string that contains ":" but does not start with "dtmi:".
  * [SHALL NOT](spec/Completion-ClassMapValueTypeIncludesUndefinedTermV3.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
* @id
  * Value [MUST](spec/Requirement-ClassMapValueIdIsDtmiV3.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassMapValueIdNotArrayV3.json) be an array.
  * Value [MUST](spec/Requirement-ClassMapValueIdDuplicateV3.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassMapValuePropertyCommentStringV3.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassMapValuePropertyCommentStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassMapValuePropertyCommentDtmiV3.json) be expressed as "dtmi:dtdl:property:comment;3" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassMapValuePropertyCommentTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapValuePropertyCommentTermAndDtmiV3.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;3".
* description
  * Value [MUST](spec/Requirement-ClassMapValuePropertyDescriptionLangStringV3.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassMapValuePropertyDescriptionStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassMapValuePropertyDescriptionDtmiV3.json) be expressed as "dtmi:dtdl:property:description;3" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassMapValuePropertyDescriptionTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapValuePropertyDescriptionTermAndDtmiV3.json) be expressed as both "description" and "dtmi:dtdl:property:description;3".
* displayName
  * Value [MUST](spec/Requirement-ClassMapValuePropertyDisplayNameLangStringV3.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassMapValuePropertyDisplayNameStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassMapValuePropertyDisplayNameDtmiV3.json) be expressed as "dtmi:dtdl:property:displayName;3" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassMapValuePropertyDisplayNameTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassMapValuePropertyDisplayNameTermAndDtmiV3.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;3".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* Members with names starting with "@" other than "@context", "@id", and "@type" [MUST NOT](spec/Requirement-ClassMapValueInvalidKeywordsV3.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [SHALL NOT](spec/Completion-ClassMapValuePropertyIrrelevantDtmiOrTermV3.json) be present if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "name", "schema", "dtmi:dtdl:property:comment;3", "dtmi:dtdl:property:description;3", "dtmi:dtdl:property:displayName;3", "dtmi:dtdl:property:name;3", "dtmi:dtdl:property:schema;3".
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassMapValuePropertyFormallyIrrelevantDtmiOrTermV3.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "name", "schema", "dtmi:dtdl:property:comment;3", "dtmi:dtdl:property:description;3", "dtmi:dtdl:property:displayName;3", "dtmi:dtdl:property:name;3", "dtmi:dtdl:property:schema;3".
* A member [MUST NOT](spec/Requirement-ClassMapValuePropertyInvalidDtmiV3.json) be present if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassMapValuePropertyNotDtmiNorTermV3.json) be present if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [SHALL NOT](spec/Completion-ClassMapValuePropertyUndefinedTermV3.json) be present if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassMapValuePropertyFormallyUndefinedTermV3.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### Object

Example:

```json
{
  "@context": "dtmi:dtdl:context;3",
  "@id": "dtmi:example:gamma_chi;1",
  "@type": "Interface",
  "schemas": {
    "@id": "dtmi:example:gamma_phi;1",
    "@type": "Object"
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassObjectRequiredPropertiesV3.json):

* @type
  * Value [MUST](spec/Requirement-ClassObjectTypeStringOrArrayV3.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassObjectTypeIncludesMaterialV3.json) include either string "Object" or string "dtmi:dtdl:class:Object;3".
  * [SHOULD NOT](spec/Recommendation-ClassObjectTypeIncludesTermAndDtmiV3.json) include both "Object" and "dtmi:dtdl:class:Object;3".
  * [SHOULD NOT](spec/Recommendation-ClassObjectTypeDuplicatesMaterialV3.json) include more than one instance of either "Object" or "dtmi:dtdl:class:Object;3".
  * String "Object" is [RECOMMENDED](spec/Recommendation-ClassObjectTypePreferTermToDtmiV3.json) over string "dtmi:dtdl:class:Object;3".
  * [SHALL NOT](spec/Completion-ClassObjectTypeIncludesIrrelevantDtmiOrTermV3.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "Object" or "dtmi:dtdl:class:Object;3", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassObjectTypeIncludesInvalidDtmiV3.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MUST NOT](spec/Requirement-ClassObjectTypeIncludesNotDtmiNorTermV3.json) include any string that contains ":" but does not start with "dtmi:".
  * [SHALL NOT](spec/Completion-ClassObjectTypeIncludesUndefinedTermV3.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.

The following members are [OPTIONAL](spec/Allowance-ClassObjectOptionalPropertiesV3.json) unless otherwise noted:

* @context
  * [MUST](spec/Requirement-ClassObjectContextConformsV3.json) conform to the specified [context](#context) rules.
* @id
  * [REQUIRED](spec/Requirement-ClassObjectIdRequiredV3.json) when the Object element is included in Interface member "schemas".
  * Value [MUST](spec/Requirement-ClassObjectIdIsDtmiV3.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassObjectIdNotArrayV3.json) be an array.
  * Value [MUST](spec/Requirement-ClassObjectIdDuplicateV3.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassObjectPropertyCommentStringV3.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassObjectPropertyCommentStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassObjectPropertyCommentDtmiV3.json) be expressed as "dtmi:dtdl:property:comment;3" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassObjectPropertyCommentTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassObjectPropertyCommentTermAndDtmiV3.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;3".
* description
  * Value [MUST](spec/Requirement-ClassObjectPropertyDescriptionLangStringV3.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassObjectPropertyDescriptionStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassObjectPropertyDescriptionDtmiV3.json) be expressed as "dtmi:dtdl:property:description;3" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassObjectPropertyDescriptionTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassObjectPropertyDescriptionTermAndDtmiV3.json) be expressed as both "description" and "dtmi:dtdl:property:description;3".
* displayName
  * Value [MUST](spec/Requirement-ClassObjectPropertyDisplayNameLangStringV3.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassObjectPropertyDisplayNameStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassObjectPropertyDisplayNameDtmiV3.json) be expressed as "dtmi:dtdl:property:displayName;3" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassObjectPropertyDisplayNameTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassObjectPropertyDisplayNameTermAndDtmiV3.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;3".
* fields
  * Value [MUST](spec/Requirement-ClassObjectPropertyFieldsElementV3.json) be a DTDL element, a dependent reference to DTDL element, or an array of DTDL elements and dependent references to DTDL elements.
  * For each included dependent reference, the model [SHALL](spec/Completion-ClassObjectPropertyFieldsDependentReferenceV3.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * Each included or referentially included DTDL element [MUST](spec/Requirement-ClassObjectPropertyFieldsTypeConformanceV3.json) conform to the definition of DTDL element [Field](#field).
  * Member name [MAY](spec/Allowance-ClassObjectPropertyFieldsDtmiV3.json) be expressed as "dtmi:dtdl:property:fields;3" instead of "fields", but "fields" is [RECOMMENDED](spec/Recommendation-ClassObjectPropertyFieldsTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassObjectPropertyFieldsTermAndDtmiV3.json) be expressed as both "fields" and "dtmi:dtdl:property:fields;3".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* Members with names starting with "@" other than "@context", "@id", and "@type" [MUST NOT](spec/Requirement-ClassObjectInvalidKeywordsV3.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [SHALL NOT](spec/Completion-ClassObjectPropertyIrrelevantDtmiOrTermV3.json) be present if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "fields", "dtmi:dtdl:property:comment;3", "dtmi:dtdl:property:description;3", "dtmi:dtdl:property:displayName;3", "dtmi:dtdl:property:fields;3".
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassObjectPropertyFormallyIrrelevantDtmiOrTermV3.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "fields", "dtmi:dtdl:property:comment;3", "dtmi:dtdl:property:description;3", "dtmi:dtdl:property:displayName;3", "dtmi:dtdl:property:fields;3".
* A member [MUST NOT](spec/Requirement-ClassObjectPropertyInvalidDtmiV3.json) be present if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassObjectPropertyNotDtmiNorTermV3.json) be present if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [SHALL NOT](spec/Completion-ClassObjectPropertyUndefinedTermV3.json) be present if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassObjectPropertyFormallyUndefinedTermV3.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### Property

Example:

```json
{
  "@context": "dtmi:dtdl:context;3",
  "@id": "dtmi:example:gamma_omega;1",
  "@type": "Interface",
  "contents": {
    "@type": "Property",
    "name": "gamma_psi",
    "schema": "long"
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassPropertyRequiredPropertiesV3.json):

* @type
  * Value [MUST](spec/Requirement-ClassPropertyTypeStringOrArrayV3.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassPropertyTypeIncludesMaterialV3.json) include either string "Property" or string "dtmi:dtdl:class:Property;3".
  * [SHOULD NOT](spec/Recommendation-ClassPropertyTypeIncludesTermAndDtmiV3.json) include both "Property" and "dtmi:dtdl:class:Property;3".
  * [SHOULD NOT](spec/Recommendation-ClassPropertyTypeDuplicatesMaterialV3.json) include more than one instance of either "Property" or "dtmi:dtdl:class:Property;3".
  * String "Property" is [RECOMMENDED](spec/Recommendation-ClassPropertyTypePreferTermToDtmiV3.json) over string "dtmi:dtdl:class:Property;3".
  * [SHALL NOT](spec/Completion-ClassPropertyTypeIncludesIrrelevantDtmiOrTermV3.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "Property" or "dtmi:dtdl:class:Property;3", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassPropertyTypeIncludesInvalidDtmiV3.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MUST NOT](spec/Requirement-ClassPropertyTypeIncludesNotDtmiNorTermV3.json) include any string that contains ":" but does not start with "dtmi:".
  * [SHALL NOT](spec/Completion-ClassPropertyTypeIncludesUndefinedTermV3.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
* name
  * Value [MUST](spec/Requirement-ClassPropertyPropertyNameStringV3.json) be a [representational string](#representational-string) or an array containing exactly one representational string.
  * String value [MUST NOT](spec/Requirement-ClassPropertyPropertyNameStringLengthV3.json) be more than 512 characters in length.
  * String value [MUST](spec/Requirement-ClassPropertyPropertyNamePatternV3.json) match regular expression `^[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?$`.
  * String value [MUST](spec/Requirement-ClassPropertyPropertyNameUniqueAmongInterfaceContentsV3.json) be unique among the included values of "name" members of all elements included or referentially included in the "contents" member of any parent [Interface](#interface) element.
  * String value [MUST](spec/Requirement-ClassPropertyPropertyNameUniqueAmongRelationshipPropertiesV3.json) be unique among the included values of "name" members of all elements included or referentially included in the "properties" member of any parent [Relationship](#relationship) element.
  * Member name [MAY](spec/Allowance-ClassPropertyPropertyNameDtmiV3.json) be expressed as "dtmi:dtdl:property:name;3" instead of "name", but "name" is [RECOMMENDED](spec/Recommendation-ClassPropertyPropertyNameTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassPropertyPropertyNameTermAndDtmiV3.json) be expressed as both "name" and "dtmi:dtdl:property:name;3".
* schema
  * Value [MUST](spec/Requirement-ClassPropertyPropertySchemaElementV3.json) be a DTDL element, a dependent reference to a DTDL element, a string from one of the rows in a [Standard schemas](#standard-schemas) table, a string defined by an extension referenced in the active context, or an array containing exactly one DTDL element, dependent reference to a DTDL element, string from one of the rows in a Standard schemas table, or string defined by an extension referenced in the active context.
  * If the value is a dependent reference or an array containing a dependent reference, the model [SHALL](spec/Completion-ClassPropertyPropertySchemaDependentReferenceV3.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * If present, an included or referentially included DTDL element [MUST](spec/Requirement-ClassPropertyPropertySchemaTypeConformanceV3.json) conform to the definition of DTDL element [Array](#array) or [Enum](#enum) or [Map](#map) or [Object](#object) or DTDLv2 element [Array](../v2/DTDL.Specification.v2.md#array) or [Enum](../v2/DTDL.Specification.v2.md#enum) or [Map](../v2/DTDL.Specification.v2.md#map) or [Object](../v2/DTDL.Specification.v2.md#object).
  * If a string from one of the rows in a Standard schemas table is included, a string from column "Term" is [RECOMMENDED](spec/Recommendation-ClassPropertyPropertySchemaPreferTermToDtmiV3.json) over a string from column "DTMI".
  * Member name [MAY](spec/Allowance-ClassPropertyPropertySchemaDtmiV3.json) be expressed as "dtmi:dtdl:property:schema;3" instead of "schema", but "schema" is [RECOMMENDED](spec/Recommendation-ClassPropertyPropertySchemaTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassPropertyPropertySchemaTermAndDtmiV3.json) be expressed as both "schema" and "dtmi:dtdl:property:schema;3".

The following members are [OPTIONAL](spec/Allowance-ClassPropertyOptionalPropertiesV3.json):

* @context
  * [MUST](spec/Requirement-ClassPropertyContextConformsV3.json) conform to the specified [context](#context) rules.
* @id
  * Value [MUST](spec/Requirement-ClassPropertyIdIsDtmiV3.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassPropertyIdNotArrayV3.json) be an array.
  * Value [MUST](spec/Requirement-ClassPropertyIdDuplicateV3.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassPropertyPropertyCommentStringV3.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassPropertyPropertyCommentStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassPropertyPropertyCommentDtmiV3.json) be expressed as "dtmi:dtdl:property:comment;3" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassPropertyPropertyCommentTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassPropertyPropertyCommentTermAndDtmiV3.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;3".
* description
  * Value [MUST](spec/Requirement-ClassPropertyPropertyDescriptionLangStringV3.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassPropertyPropertyDescriptionStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassPropertyPropertyDescriptionDtmiV3.json) be expressed as "dtmi:dtdl:property:description;3" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassPropertyPropertyDescriptionTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassPropertyPropertyDescriptionTermAndDtmiV3.json) be expressed as both "description" and "dtmi:dtdl:property:description;3".
* displayName
  * Value [MUST](spec/Requirement-ClassPropertyPropertyDisplayNameLangStringV3.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassPropertyPropertyDisplayNameStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassPropertyPropertyDisplayNameDtmiV3.json) be expressed as "dtmi:dtdl:property:displayName;3" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassPropertyPropertyDisplayNameTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassPropertyPropertyDisplayNameTermAndDtmiV3.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;3".
* writable
  * Value [MUST](spec/Requirement-ClassPropertyPropertyWritableBooleanV3.json) be a [representational boolean](#representational-boolean) or an array containing no more than one representational boolean.
  * Member name [MAY](spec/Allowance-ClassPropertyPropertyWritableDtmiV3.json) be expressed as "dtmi:dtdl:property:writable;3" instead of "writable", but "writable" is [RECOMMENDED](spec/Recommendation-ClassPropertyPropertyWritableTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassPropertyPropertyWritableTermAndDtmiV3.json) be expressed as both "writable" and "dtmi:dtdl:property:writable;3".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* Members with names starting with "@" other than "@context", "@id", and "@type" [MUST NOT](spec/Requirement-ClassPropertyInvalidKeywordsV3.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [SHALL NOT](spec/Completion-ClassPropertyPropertyIrrelevantDtmiOrTermV3.json) be present if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "name", "schema", "writable", "dtmi:dtdl:property:comment;3", "dtmi:dtdl:property:description;3", "dtmi:dtdl:property:displayName;3", "dtmi:dtdl:property:name;3", "dtmi:dtdl:property:schema;3", "dtmi:dtdl:property:writable;3".
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassPropertyPropertyFormallyIrrelevantDtmiOrTermV3.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "name", "schema", "writable", "dtmi:dtdl:property:comment;3", "dtmi:dtdl:property:description;3", "dtmi:dtdl:property:displayName;3", "dtmi:dtdl:property:name;3", "dtmi:dtdl:property:schema;3", "dtmi:dtdl:property:writable;3".
* A member [MUST NOT](spec/Requirement-ClassPropertyPropertyInvalidDtmiV3.json) be present if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassPropertyPropertyNotDtmiNorTermV3.json) be present if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [SHALL NOT](spec/Completion-ClassPropertyPropertyUndefinedTermV3.json) be present if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassPropertyPropertyFormallyUndefinedTermV3.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### Relationship

Example:

```json
{
  "@context": "dtmi:dtdl:context;3",
  "@id": "dtmi:example:gamma_glikk;1",
  "@type": "Interface",
  "contents": {
    "@type": "Relationship",
    "name": "gamma_fuddle"
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassRelationshipRequiredPropertiesV3.json):

* @type
  * Value [MUST](spec/Requirement-ClassRelationshipTypeStringOrArrayV3.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassRelationshipTypeIncludesMaterialV3.json) include either string "Relationship" or string "dtmi:dtdl:class:Relationship;3".
  * [SHOULD NOT](spec/Recommendation-ClassRelationshipTypeIncludesTermAndDtmiV3.json) include both "Relationship" and "dtmi:dtdl:class:Relationship;3".
  * [SHOULD NOT](spec/Recommendation-ClassRelationshipTypeDuplicatesMaterialV3.json) include more than one instance of either "Relationship" or "dtmi:dtdl:class:Relationship;3".
  * String "Relationship" is [RECOMMENDED](spec/Recommendation-ClassRelationshipTypePreferTermToDtmiV3.json) over string "dtmi:dtdl:class:Relationship;3".
  * [SHALL NOT](spec/Completion-ClassRelationshipTypeIncludesIrrelevantDtmiOrTermV3.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "Relationship" or "dtmi:dtdl:class:Relationship;3", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassRelationshipTypeIncludesInvalidDtmiV3.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MUST NOT](spec/Requirement-ClassRelationshipTypeIncludesNotDtmiNorTermV3.json) include any string that contains ":" but does not start with "dtmi:".
  * [SHALL NOT](spec/Completion-ClassRelationshipTypeIncludesUndefinedTermV3.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
* name
  * Value [MUST](spec/Requirement-ClassRelationshipPropertyNameStringV3.json) be a [representational string](#representational-string) or an array containing exactly one representational string.
  * String value [MUST NOT](spec/Requirement-ClassRelationshipPropertyNameStringLengthV3.json) be more than 512 characters in length.
  * String value [MUST](spec/Requirement-ClassRelationshipPropertyNamePatternV3.json) match regular expression `^[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?$`.
  * String value [MUST](spec/Requirement-ClassRelationshipPropertyNameUniqueAmongInterfaceContentsV3.json) be unique among the included values of "name" members of all elements included or referentially included in the "contents" member of any parent [Interface](#interface) element.
  * Member name [MAY](spec/Allowance-ClassRelationshipPropertyNameDtmiV3.json) be expressed as "dtmi:dtdl:property:name;3" instead of "name", but "name" is [RECOMMENDED](spec/Recommendation-ClassRelationshipPropertyNameTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassRelationshipPropertyNameTermAndDtmiV3.json) be expressed as both "name" and "dtmi:dtdl:property:name;3".

The following members are [OPTIONAL](spec/Allowance-ClassRelationshipOptionalPropertiesV3.json):

* @context
  * [MUST](spec/Requirement-ClassRelationshipContextConformsV3.json) conform to the specified [context](#context) rules.
* @id
  * Value [MUST](spec/Requirement-ClassRelationshipIdIsDtmiV3.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassRelationshipIdNotArrayV3.json) be an array.
  * Value [MUST](spec/Requirement-ClassRelationshipIdDuplicateV3.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassRelationshipPropertyCommentStringV3.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassRelationshipPropertyCommentStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassRelationshipPropertyCommentDtmiV3.json) be expressed as "dtmi:dtdl:property:comment;3" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassRelationshipPropertyCommentTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassRelationshipPropertyCommentTermAndDtmiV3.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;3".
* description
  * Value [MUST](spec/Requirement-ClassRelationshipPropertyDescriptionLangStringV3.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassRelationshipPropertyDescriptionStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassRelationshipPropertyDescriptionDtmiV3.json) be expressed as "dtmi:dtdl:property:description;3" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassRelationshipPropertyDescriptionTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassRelationshipPropertyDescriptionTermAndDtmiV3.json) be expressed as both "description" and "dtmi:dtdl:property:description;3".
* displayName
  * Value [MUST](spec/Requirement-ClassRelationshipPropertyDisplayNameLangStringV3.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassRelationshipPropertyDisplayNameStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassRelationshipPropertyDisplayNameDtmiV3.json) be expressed as "dtmi:dtdl:property:displayName;3" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassRelationshipPropertyDisplayNameTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassRelationshipPropertyDisplayNameTermAndDtmiV3.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;3".
* maxMultiplicity
  * Value [MUST](spec/Requirement-ClassRelationshipPropertyMaxMultiplicityIntegerV3.json) be a [representational integer](#representational-integer) or an array containing no more than one representational integer.
  * If present, integer value [MUST NOT](spec/Requirement-ClassRelationshipPropertyMaxMultiplicityMinValueV3.json) be less than 1.
  * Member name [MAY](spec/Allowance-ClassRelationshipPropertyMaxMultiplicityDtmiV3.json) be expressed as "dtmi:dtdl:property:maxMultiplicity;3" instead of "maxMultiplicity", but "maxMultiplicity" is [RECOMMENDED](spec/Recommendation-ClassRelationshipPropertyMaxMultiplicityTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassRelationshipPropertyMaxMultiplicityTermAndDtmiV3.json) be expressed as both "maxMultiplicity" and "dtmi:dtdl:property:maxMultiplicity;3".
* minMultiplicity
  * Value [MUST](spec/Requirement-ClassRelationshipPropertyMinMultiplicityIntegerV3.json) be a [representational integer](#representational-integer) or an array containing no more than one representational integer.
  * If present, integer value [MUST](spec/Requirement-ClassRelationshipPropertyMinMultiplicityExactValueV3.json) be 0.
  * Member name [MAY](spec/Allowance-ClassRelationshipPropertyMinMultiplicityDtmiV3.json) be expressed as "dtmi:dtdl:property:minMultiplicity;3" instead of "minMultiplicity", but "minMultiplicity" is [RECOMMENDED](spec/Recommendation-ClassRelationshipPropertyMinMultiplicityTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassRelationshipPropertyMinMultiplicityTermAndDtmiV3.json) be expressed as both "minMultiplicity" and "dtmi:dtdl:property:minMultiplicity;3".
* properties
  * Value [MUST](spec/Requirement-ClassRelationshipPropertyPropertiesElementV3.json) be a DTDL element, a dependent reference to DTDL element, or an array of DTDL elements and dependent references to DTDL elements.
  * For each included dependent reference, the model [SHALL](spec/Completion-ClassRelationshipPropertyPropertiesDependentReferenceV3.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * Each included or referentially included DTDL element [MUST](spec/Requirement-ClassRelationshipPropertyPropertiesTypeConformanceV3.json) conform to the definition of DTDL element [Property](#property) or DTDLv2 element [Property](../v2/DTDL.Specification.v2.md#property).
  * Member name [MAY](spec/Allowance-ClassRelationshipPropertyPropertiesDtmiV3.json) be expressed as "dtmi:dtdl:property:properties;3" instead of "properties", but "properties" is [RECOMMENDED](spec/Recommendation-ClassRelationshipPropertyPropertiesTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassRelationshipPropertyPropertiesTermAndDtmiV3.json) be expressed as both "properties" and "dtmi:dtdl:property:properties;3".
* target
  * Value [MUST](spec/Requirement-ClassRelationshipPropertyTargetIsDtmiV3.json) be a DTMI or an array containing no more than one DTMI.
  * Note that any included DTMI is a non-dependent reference.
  * Member name [MAY](spec/Allowance-ClassRelationshipPropertyTargetDtmiV3.json) be expressed as "dtmi:dtdl:property:target;3" instead of "target", but "target" is [RECOMMENDED](spec/Recommendation-ClassRelationshipPropertyTargetTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassRelationshipPropertyTargetTermAndDtmiV3.json) be expressed as both "target" and "dtmi:dtdl:property:target;3".
* writable
  * Value [MUST](spec/Requirement-ClassRelationshipPropertyWritableBooleanV3.json) be a [representational boolean](#representational-boolean) or an array containing no more than one representational boolean.
  * Member name [MAY](spec/Allowance-ClassRelationshipPropertyWritableDtmiV3.json) be expressed as "dtmi:dtdl:property:writable;3" instead of "writable", but "writable" is [RECOMMENDED](spec/Recommendation-ClassRelationshipPropertyWritableTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassRelationshipPropertyWritableTermAndDtmiV3.json) be expressed as both "writable" and "dtmi:dtdl:property:writable;3".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* Members with names starting with "@" other than "@context", "@id", and "@type" [MUST NOT](spec/Requirement-ClassRelationshipInvalidKeywordsV3.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [SHALL NOT](spec/Completion-ClassRelationshipPropertyIrrelevantDtmiOrTermV3.json) be present if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "maxMultiplicity", "minMultiplicity", "name", "properties", "target", "writable", "dtmi:dtdl:property:comment;3", "dtmi:dtdl:property:description;3", "dtmi:dtdl:property:displayName;3", "dtmi:dtdl:property:maxMultiplicity;3", "dtmi:dtdl:property:minMultiplicity;3", "dtmi:dtdl:property:name;3", "dtmi:dtdl:property:properties;3", "dtmi:dtdl:property:target;3", "dtmi:dtdl:property:writable;3".
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassRelationshipPropertyFormallyIrrelevantDtmiOrTermV3.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "maxMultiplicity", "minMultiplicity", "name", "properties", "target", "writable", "dtmi:dtdl:property:comment;3", "dtmi:dtdl:property:description;3", "dtmi:dtdl:property:displayName;3", "dtmi:dtdl:property:maxMultiplicity;3", "dtmi:dtdl:property:minMultiplicity;3", "dtmi:dtdl:property:name;3", "dtmi:dtdl:property:properties;3", "dtmi:dtdl:property:target;3", "dtmi:dtdl:property:writable;3".
* A member [MUST NOT](spec/Requirement-ClassRelationshipPropertyInvalidDtmiV3.json) be present if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassRelationshipPropertyNotDtmiNorTermV3.json) be present if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [SHALL NOT](spec/Completion-ClassRelationshipPropertyUndefinedTermV3.json) be present if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassRelationshipPropertyFormallyUndefinedTermV3.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

### Telemetry

Example:

```json
{
  "@context": "dtmi:dtdl:context;3",
  "@id": "dtmi:example:gamma_thnad;1",
  "@type": "Interface",
  "contents": {
    "@type": "Telemetry",
    "name": "gamma_quan",
    "schema": "string"
  }
}
```

The following members are [REQUIRED](spec/Requirement-ClassTelemetryRequiredPropertiesV3.json):

* @type
  * Value [MUST](spec/Requirement-ClassTelemetryTypeStringOrArrayV3.json) be a string or an array of strings.
  * [MUST](spec/Requirement-ClassTelemetryTypeIncludesMaterialV3.json) include either string "Telemetry" or string "dtmi:dtdl:class:Telemetry;3".
  * [SHOULD NOT](spec/Recommendation-ClassTelemetryTypeIncludesTermAndDtmiV3.json) include both "Telemetry" and "dtmi:dtdl:class:Telemetry;3".
  * [SHOULD NOT](spec/Recommendation-ClassTelemetryTypeDuplicatesMaterialV3.json) include more than one instance of either "Telemetry" or "dtmi:dtdl:class:Telemetry;3".
  * String "Telemetry" is [RECOMMENDED](spec/Recommendation-ClassTelemetryTypePreferTermToDtmiV3.json) over string "dtmi:dtdl:class:Telemetry;3".
  * [SHALL NOT](spec/Completion-ClassTelemetryTypeIncludesIrrelevantDtmiOrTermV3.json) include any string conforming to [DTMI](#digital-twin-model-identifier) syntax rules or listed in the [Reserved strings](#reserved-strings) table other than "Telemetry" or "dtmi:dtdl:class:Telemetry;3", except as explicitly designated by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
  * [MUST NOT](spec/Requirement-ClassTelemetryTypeIncludesInvalidDtmiV3.json) include a string that starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
  * [MUST NOT](spec/Requirement-ClassTelemetryTypeIncludesNotDtmiNorTermV3.json) include any string that contains ":" but does not start with "dtmi:".
  * [SHALL NOT](spec/Completion-ClassTelemetryTypeIncludesUndefinedTermV3.json) include any string that does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context. If the absence of such a string cannot be conclusively verified because the model is contextually incomplete, the element is considered to be *informally co-typed*.
* name
  * Value [MUST](spec/Requirement-ClassTelemetryPropertyNameStringV3.json) be a [representational string](#representational-string) or an array containing exactly one representational string.
  * String value [MUST NOT](spec/Requirement-ClassTelemetryPropertyNameStringLengthV3.json) be more than 512 characters in length.
  * String value [MUST](spec/Requirement-ClassTelemetryPropertyNamePatternV3.json) match regular expression `^[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?$`.
  * String value [MUST](spec/Requirement-ClassTelemetryPropertyNameUniqueAmongInterfaceContentsV3.json) be unique among the included values of "name" members of all elements included or referentially included in the "contents" member of any parent [Interface](#interface) element.
  * Member name [MAY](spec/Allowance-ClassTelemetryPropertyNameDtmiV3.json) be expressed as "dtmi:dtdl:property:name;3" instead of "name", but "name" is [RECOMMENDED](spec/Recommendation-ClassTelemetryPropertyNameTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassTelemetryPropertyNameTermAndDtmiV3.json) be expressed as both "name" and "dtmi:dtdl:property:name;3".
* schema
  * Value [MUST](spec/Requirement-ClassTelemetryPropertySchemaElementV3.json) be a DTDL element, a dependent reference to a DTDL element, a string from one of the rows in a [Standard schemas](#standard-schemas) table, a string defined by an extension referenced in the active context, or an array containing exactly one DTDL element, dependent reference to a DTDL element, string from one of the rows in a Standard schemas table, or string defined by an extension referenced in the active context.
  * If the value is a dependent reference or an array containing a dependent reference, the model [SHALL](spec/Completion-ClassTelemetryPropertySchemaDependentReferenceV3.json) contain a DTDL element with an "@id" member whose value matches the DTMI of the dependent reference, which is thereby referentially included.
  * If present, an included or referentially included DTDL element [MUST](spec/Requirement-ClassTelemetryPropertySchemaTypeConformanceV3.json) conform to the definition of DTDL element [Array](#array) or [Enum](#enum) or [Map](#map) or [Object](#object) or DTDLv2 element [Array](../v2/DTDL.Specification.v2.md#array) or [Enum](../v2/DTDL.Specification.v2.md#enum) or [Map](../v2/DTDL.Specification.v2.md#map) or [Object](../v2/DTDL.Specification.v2.md#object).
  * If a string from one of the rows in a Standard schemas table is included, a string from column "Term" is [RECOMMENDED](spec/Recommendation-ClassTelemetryPropertySchemaPreferTermToDtmiV3.json) over a string from column "DTMI".
  * Member name [MAY](spec/Allowance-ClassTelemetryPropertySchemaDtmiV3.json) be expressed as "dtmi:dtdl:property:schema;3" instead of "schema", but "schema" is [RECOMMENDED](spec/Recommendation-ClassTelemetryPropertySchemaTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassTelemetryPropertySchemaTermAndDtmiV3.json) be expressed as both "schema" and "dtmi:dtdl:property:schema;3".

The following members are [OPTIONAL](spec/Allowance-ClassTelemetryOptionalPropertiesV3.json):

* @context
  * [MUST](spec/Requirement-ClassTelemetryContextConformsV3.json) conform to the specified [context](#context) rules.
* @id
  * Value [MUST](spec/Requirement-ClassTelemetryIdIsDtmiV3.json) be a string that conforms to the specified [DTMI](#digital-twin-model-identifier) rules; value [MUST NOT](spec/Requirement-ClassTelemetryIdNotArrayV3.json) be an array.
  * Value [MUST](spec/Requirement-ClassTelemetryIdDuplicateV3.json) be unique among the values of all "@id" members of all elements in the model.
* comment
  * Value [MUST](spec/Requirement-ClassTelemetryPropertyCommentStringV3.json) be a [representational string](#representational-string) or an array containing no more than one representational string.
  * If present, string value [MUST NOT](spec/Requirement-ClassTelemetryPropertyCommentStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassTelemetryPropertyCommentDtmiV3.json) be expressed as "dtmi:dtdl:property:comment;3" instead of "comment", but "comment" is [RECOMMENDED](spec/Recommendation-ClassTelemetryPropertyCommentTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassTelemetryPropertyCommentTermAndDtmiV3.json) be expressed as both "comment" and "dtmi:dtdl:property:comment;3".
* description
  * Value [MUST](spec/Requirement-ClassTelemetryPropertyDescriptionLangStringV3.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassTelemetryPropertyDescriptionStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassTelemetryPropertyDescriptionDtmiV3.json) be expressed as "dtmi:dtdl:property:description;3" instead of "description", but "description" is [RECOMMENDED](spec/Recommendation-ClassTelemetryPropertyDescriptionTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassTelemetryPropertyDescriptionTermAndDtmiV3.json) be expressed as both "description" and "dtmi:dtdl:property:description;3".
* displayName
  * Value [MUST](spec/Requirement-ClassTelemetryPropertyDisplayNameLangStringV3.json) be a [localizable string](#localizable-string).
  * Each string value [MUST NOT](spec/Requirement-ClassTelemetryPropertyDisplayNameStringLengthV3.json) be more than 512 characters in length.
  * Member name [MAY](spec/Allowance-ClassTelemetryPropertyDisplayNameDtmiV3.json) be expressed as "dtmi:dtdl:property:displayName;3" instead of "displayName", but "displayName" is [RECOMMENDED](spec/Recommendation-ClassTelemetryPropertyDisplayNameTermV3.json).
  * Member name [MUST NOT](spec/Requirement-ClassTelemetryPropertyDisplayNameTermAndDtmiV3.json) be expressed as both "displayName" and "dtmi:dtdl:property:displayName;3".

All members other than those explitly listed above are forbidden or permitted according to the following rules:

* Members with names starting with "@" other than "@context", "@id", and "@type" [MUST NOT](spec/Requirement-ClassTelemetryInvalidKeywordsV3.json) be present.
* Except as explicitly designated by an extension referenced in the active context, a member [SHALL NOT](spec/Completion-ClassTelemetryPropertyIrrelevantDtmiOrTermV3.json) be present if the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "name", "schema", "dtmi:dtdl:property:comment;3", "dtmi:dtdl:property:description;3", "dtmi:dtdl:property:displayName;3", "dtmi:dtdl:property:name;3", "dtmi:dtdl:property:schema;3".
* Except as explicitly designated by an extension referenced in the active context, a member [MUST NOT](spec/Requirement-ClassTelemetryPropertyFormallyIrrelevantDtmiOrTermV3.json) be present if the element is not informally co-typed and the member's name conforms to [DTMI](#digital-twin-model-identifier) syntax rules or is listed in the [Reserved strings](#reserved-strings) table, unless its name is in the following list: "comment", "description", "displayName", "name", "schema", "dtmi:dtdl:property:comment;3", "dtmi:dtdl:property:description;3", "dtmi:dtdl:property:displayName;3", "dtmi:dtdl:property:name;3", "dtmi:dtdl:property:schema;3".
* A member [MUST NOT](spec/Requirement-ClassTelemetryPropertyInvalidDtmiV3.json) be present if the member's name starts with "dtmi:" but does not conform to [DTMI](#digital-twin-model-identifier) syntax rules.
* A member [MUST NOT](spec/Requirement-ClassTelemetryPropertyNotDtmiNorTermV3.json) be present if the member's name does not start with "@" and contains ":" but does not start with "dtmi:".
* A member [SHALL NOT](spec/Completion-ClassTelemetryPropertyUndefinedTermV3.json) be present if the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.
* A member [MUST NOT](spec/Requirement-ClassTelemetryPropertyFormallyUndefinedTermV3.json) be present if the element is not informally co-typed and the member's name does not start with "@" and does not contain ":" and is not listed in the [Reserved strings](#reserved-strings) table and is not defined by an extension referenced in the active context.

## Limits and exclusions

In addition to the direct requirements on members of various [DTDL elements](#dtdl-element), there are restrictions on the element hierarchies formed via inclusion and referential inclusion.
Specifically:

* There [MUST NOT](spec/Requirement-ClassArrayPropertiesElementSchemaSchemaMaxDepthV3.json) be more than 5 "elementSchema" or "schema" members in any path from a DTDL [Array](#array) element to another DTDL element.
* There [MUST NOT](spec/Requirement-ClassComponentPropertiesSchemaContentsExcludeComponentV3.json) be a path of "schema" or "contents" members from any DTDL [Component](#component) element to any DTDL [Component](#component) element.
* In the union of all paths of "extends" members rooted at a given DTDL [Interface](#interface) element, the total count of all values among all such members [MUST NOT](spec/Requirement-ClassInterfacePropertiesExtendsMaxCountV3.json) exceed 1024 values.
* There [MUST NOT](spec/Requirement-ClassInterfacePropertiesExtendsMaxDepthV3.json) be more than 10 members in any path of "extends" members from a DTDL [Interface](#interface) element to another DTDL element.
* In the union of all paths of "contents" or "fields" or "enumValues" or "request" or "response" or "properties" or "schema" or "elementSchema" or "mapValue" members rooted at a given DTDL [Interface](#interface) element, including those imported via "extends", the total count of all values among all such members MUST NOT exceed 100000 values.
* There [MUST NOT](spec/Requirement-ClassMapPropertiesElementSchemaSchemaMaxDepthV3.json) be more than 5 "elementSchema" or "schema" members in any path from a DTDL [Map](#map) element to another DTDL element.
* There [MUST NOT](spec/Requirement-ClassObjectPropertiesElementSchemaSchemaMaxDepthV3.json) be more than 5 "elementSchema" or "schema" members in any path from a DTDL [Object](#object) element to another DTDL element.

The JSON text of each Interface definition is limited to 1 MiByte.
This is the total number of bytes inclusive of the opening and closing curly braces for each Interface definition.
This limit does not include the text of any descendant Interface.

## Representational literal

A representational literal is a JSON value that represents a literal value.
The representation can be in the form of a bare literal, an untyped value object, or a typed value object.
When a member includes a representational literal, the member is also considered to include the literal value itself.

### Representational string

To be a conformant *representational string*, a JSON value [MUST](spec/Requirement-RepresentationalStringOrObjectV3.json) be either a string or an object.

* If the representational string is a string, the string value itself is considered to be the value of the representational string.
* If the representational string is an object, the following constraints and conditions apply:
  * Every member in the object [MUST](spec/Requirement-RepresentationalStringOnlyKeywordsV3.json) have a name that starts with "@".
  * The object [MUST](spec/Requirement-RepresentationalStringHasValueV3.json) have a member with name "@value".
  * The value of member "@value" [MUST](spec/Requirement-RepresentationalStringValueStringV3.json) be a string.
  * The object [SHOULD](spec/Recommendation-RepresentationalStringHasTypeV3.json) have a member with name "@type".
  * If present, member "@type" [MUST](spec/Requirement-RepresentationalStringTypeStringV3.json) have value "xsd:string" or "http://www.w3.org/2001/XMLSchema#string".
  * The object [MUST NOT](spec/Requirement-RepresentationalStringOnlyValueAndTypeV3.json) have any member with name other than "@value" or "@type".
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

To be a conformant *representational integer*, a JSON value [MUST](spec/Requirement-RepresentationalIntegerOrObjectV3.json) be either an integer or an object.

* If the representational integer is an integer, the integer value itself is considered to be the value of the representational integer.
* If the representational integer is an object, the following constraints and conditions apply:
  * Every member in the object [MUST](spec/Requirement-RepresentationalIntegerOnlyKeywordsV3.json) have a name that starts with "@".
  * The object [MUST](spec/Requirement-RepresentationalIntegerHasValueV3.json) have a member with name "@value".
  * The value of member "@value" [MUST](spec/Requirement-RepresentationalIntegerValueIntegerV3.json) be an integer.
  * The object [SHOULD](spec/Recommendation-RepresentationalIntegerHasTypeV3.json) have a member with name "@type".
  * If present, member "@type" [MUST](spec/Requirement-RepresentationalIntegerTypeIntegerV3.json) have value "xsd:integer" or "http://www.w3.org/2001/XMLSchema#integer".
  * The object [MUST NOT](spec/Requirement-RepresentationalIntegerOnlyValueAndTypeV3.json) have any member with name other than "@value" or "@type".
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

To be a conformant *representational boolean*, a JSON value [MUST](spec/Requirement-RepresentationalBooleanOrObjectV3.json) be either a boolean or an object.

* If the representational boolean is a boolean, the boolean value itself is considered to be the value of the representational boolean.
* If the representational boolean is an object, the following constraints and conditions apply:
  * Every member in the object [MUST](spec/Requirement-RepresentationalBooleanOnlyKeywordsV3.json) have a name that starts with "@".
  * The object [MUST](spec/Requirement-RepresentationalBooleanHasValueV3.json) have a member with name "@value".
  * The value of member "@value" [MUST](spec/Requirement-RepresentationalBooleanValueBooleanV3.json) be a boolean.
  * The object [SHOULD](spec/Recommendation-RepresentationalBooleanHasTypeV3.json) have a member with name "@type".
  * If present, member "@type" [MUST](spec/Requirement-RepresentationalBooleanTypeBooleanV3.json) have value "xsd:boolean" or "http://www.w3.org/2001/XMLSchema#boolean".
  * The object [MUST NOT](spec/Requirement-RepresentationalBooleanOnlyValueAndTypeV3.json) have any member with name other than "@value" or "@type".
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

To be a conformant *localizable string*, a JSON value [MUST](spec/Requirement-LocalizableStringOrArrayOrObjectV3.json) be a string, an array, or an object.

If the localizable string is an array, the following constraints and conditions apply:

* Each value in the array [MUST](spec/Requirement-LocalizableStringArrayElementStringOrObjectV3.json) be either a string or an object.
* For each value in the array that is an object, the following constraints and conditions apply:
  * Every member in the object [MUST](spec/Requirement-LocalizableStringArrayElementOnlyKeywordsV3.json) have a name that starts with "@".
  * The object [MUST](spec/Requirement-LocalizableStringArrayElementHasValueV3.json) have a member with name "@value".
  * The value of member "@value" [MUST](spec/Requirement-LocalizableStringArrayElementValueStringV3.json) be a string.
  * The object [SHOULD](spec/Recommendation-LocalizableStringArrayElementHasLanguageV3.json) have a member with name "@language".
  * If present, member "@language" [MUST](spec/Requirement-LocalizableStringArrayElementLanguageValueRegexV3.json) have a string value that matches regular expression `^[a-z]{2,4}(-[A-Z][a-z]{3})?(-([A-Z]{2}|[0-9]{3}))?$`.
  * If present, member "@language" [MUST NOT](spec/Requirement-LocalizableStringArrayElementLanguageValueUniqueV3.json) have a value that matches the value of the "@language" member of any other object in the array.
  * The object [MUST NOT](spec/Requirement-LocalizableStringArrayElementOnlyValueAndLanguageV3.json) have any member with name other than "@value" or "@language".

* The array [MUST NOT](spec/Requirement-LocalizableStringArrayOnlyOneDefaultV3.json) contain more than one of the following values:
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

* The name of each member [MUST](spec/Requirement-LocalizableStringObjectMemberNameRegexV3.json) match regular expression `^[a-z]{2,4}(-[A-Z][a-z]{3})?(-([A-Z]{2}|[0-9]{3}))?$`.
* Each member in the object [MUST](spec/Requirement-LocalizableStringObjectMemberValueStringV3.json) have a value that is a string.

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

When a DTDL element member is designated to permit a string from one of the rows in a Standard schemas table, a string value from either column of any row of the following table [MAY](spec/Allowance-ValuePrimitiveSchemaV3.json) be used for a value included by the member, unless a restriction described in [Limits and exclusions](#limits-and-exclusions) precludes a Primitive schemas value.
When selecting for a DTDL element member a string value from the following table, a string from column "Term" is [RECOMMENDED](spec/Recommendation-ValuePrimitiveSchemaTermV3.json) over a string from column "DTMI".

| Term | DTMI |
| --- | --- |
| "boolean" | "dtmi:dtdl:instance:Schema:boolean;3" |
| "date" | "dtmi:dtdl:instance:Schema:date;3" |
| "dateTime" | "dtmi:dtdl:instance:Schema:dateTime;3" |
| "double" | "dtmi:dtdl:instance:Schema:double;3" |
| "duration" | "dtmi:dtdl:instance:Schema:duration;3" |
| "float" | "dtmi:dtdl:instance:Schema:float;3" |
| "integer" | "dtmi:dtdl:instance:Schema:integer;3" |
| "long" | "dtmi:dtdl:instance:Schema:long;3" |
| "string" | "dtmi:dtdl:instance:Schema:string;3" |
| "time" | "dtmi:dtdl:instance:Schema:time;3" |

### Geospatial schemas

When a DTDL element member is designated to permit a string from one of the rows in a Standard schemas table, a string value from either column of any row of the following table [MAY](spec/Allowance-ValueGeospatialSchemaV3.json) be used for a value included by the member, unless a restriction described in [Limits and exclusions](#limits-and-exclusions) precludes a Geospatial schemas value.
When selecting for a DTDL element member a string value from the following table, a string from column "Term" is [RECOMMENDED](spec/Recommendation-ValueGeospatialSchemaTermV3.json) over a string from column "DTMI".

| Term | DTMI |
| --- | --- |
| "lineString" | "dtmi:standard:schema:geospatial:lineString;3" |
| "multiLineString" | "dtmi:standard:schema:geospatial:multiLineString;3" |
| "multiPoint" | "dtmi:standard:schema:geospatial:multiPoint;3" |
| "multiPolygon" | "dtmi:standard:schema:geospatial:multiPolygon;3" |
| "point" | "dtmi:standard:schema:geospatial:point;3" |
| "polygon" | "dtmi:standard:schema:geospatial:polygon;3" |

## Reserved strings

The following table itemizes strings that must not be used in some circumstances that otherwise permit a wide range of string values.
The particular circumstances that disallow these strings are explicitly designated with reference to this "Reserved strings" table.

| Term | DTMI |
| --- | --- |
| "AdjunctType" | "dtmi:dtdl:class:AdjunctType;3" |
| "Alias" | "dtmi:dtdl:class:Alias;3" |
| "aliasFor" | "dtmi:dtdl:property:aliasFor;3" |
| "Array" | "dtmi:dtdl:class:Array;3" |
| "asynchronous" | "dtmi:dtdl:instance:CommandType:asynchronous;3" |
| "boolean" | "dtmi:dtdl:instance:Schema:boolean;3" |
| "Boolean" | "dtmi:dtdl:class:Boolean;3" |
| "Command" | "dtmi:dtdl:class:Command;3" |
| "CommandPayload" | "dtmi:dtdl:class:CommandPayload;3" |
| "CommandRequest" | "dtmi:dtdl:class:CommandRequest;3" |
| "CommandResponse" | "dtmi:dtdl:class:CommandResponse;3" |
| "commandType" | "dtmi:dtdl:property:commandType;3" |
| "CommandType" | "dtmi:dtdl:class:CommandType;3" |
| "comment" | "dtmi:dtdl:property:comment;3" |
| "ComplexSchema" | "dtmi:dtdl:class:ComplexSchema;3" |
| "Component" | "dtmi:dtdl:class:Component;3" |
| "Content" | "dtmi:dtdl:class:Content;3" |
| "contents" | "dtmi:dtdl:property:contents;3" |
| "date" | "dtmi:dtdl:instance:Schema:date;3" |
| "Date" | "dtmi:dtdl:class:Date;3" |
| "dateTime" | "dtmi:dtdl:instance:Schema:dateTime;3" |
| "DateTime" | "dtmi:dtdl:class:DateTime;3" |
| "description" | "dtmi:dtdl:property:description;3" |
| "displayName" | "dtmi:dtdl:property:displayName;3" |
| "double" | "dtmi:dtdl:instance:Schema:double;3" |
| "Double" | "dtmi:dtdl:class:Double;3" |
| "DtdlExtension" | "dtmi:dtdl:meta:DtdlExtension;3" |
| "duration" | "dtmi:dtdl:instance:Schema:duration;3" |
| "Duration" | "dtmi:dtdl:class:Duration;3" |
| "elementSchema" | "dtmi:dtdl:property:elementSchema;3" |
| "Entity" | "dtmi:dtdl:class:Entity;3" |
| "Enum" | "dtmi:dtdl:class:Enum;3" |
| "enumValue" | "dtmi:dtdl:property:enumValue;3" |
| "EnumValue" | "dtmi:dtdl:class:EnumValue;3" |
| "enumValues" | "dtmi:dtdl:property:enumValues;3" |
| "exponent" | "dtmi:dtdl:property:exponent;3" |
| "extends" | "dtmi:dtdl:property:extends;3" |
| "Field" | "dtmi:dtdl:class:Field;3" |
| "fields" | "dtmi:dtdl:property:fields;3" |
| "float" | "dtmi:dtdl:instance:Schema:float;3" |
| "Float" | "dtmi:dtdl:class:Float;3" |
| "integer" | "dtmi:dtdl:instance:Schema:integer;3" |
| "Integer" | "dtmi:dtdl:class:Integer;3" |
| "Interface" | "dtmi:dtdl:class:Interface;3" |
| "languageMajorVersion" | "dtmi:dtdl:property:languageMajorVersion;3" |
| "LatentType" | "dtmi:dtdl:class:LatentType;3" |
| "lineString" | "dtmi:standard:schema:geospatial:lineString;3" |
| "long" | "dtmi:dtdl:instance:Schema:long;3" |
| "Long" | "dtmi:dtdl:class:Long;3" |
| "Map" | "dtmi:dtdl:class:Map;3" |
| "mapKey" | "dtmi:dtdl:property:mapKey;3" |
| "MapKey" | "dtmi:dtdl:class:MapKey;3" |
| "mapValue" | "dtmi:dtdl:property:mapValue;3" |
| "MapValue" | "dtmi:dtdl:class:MapValue;3" |
| "maxMultiplicity" | "dtmi:dtdl:property:maxMultiplicity;3" |
| "metamodel" | "dtmi:dtdl:meta:metamodel;3" |
| "minMultiplicity" | "dtmi:dtdl:property:minMultiplicity;3" |
| "model" | "dtmi:dtdl:meta:model;3" |
| "multiLineString" | "dtmi:standard:schema:geospatial:multiLineString;3" |
| "multiPoint" | "dtmi:standard:schema:geospatial:multiPoint;3" |
| "multiPolygon" | "dtmi:standard:schema:geospatial:multiPolygon;3" |
| "name" | "dtmi:dtdl:property:name;3" |
| "NamedEntity" | "dtmi:dtdl:class:NamedEntity;3" |
| "NamedLatentType" | "dtmi:dtdl:class:NamedLatentType;3" |
| "NumericSchema" | "dtmi:dtdl:class:NumericSchema;3" |
| "Object" | "dtmi:dtdl:class:Object;3" |
| "point" | "dtmi:standard:schema:geospatial:point;3" |
| "polygon" | "dtmi:standard:schema:geospatial:polygon;3" |
| "PrimitiveSchema" | "dtmi:dtdl:class:PrimitiveSchema;3" |
| "properties" | "dtmi:dtdl:property:properties;3" |
| "Property" | "dtmi:dtdl:class:Property;3" |
| "Relationship" | "dtmi:dtdl:class:Relationship;3" |
| "request" | "dtmi:dtdl:property:request;3" |
| "response" | "dtmi:dtdl:property:response;3" |
| "schema" | "dtmi:dtdl:property:schema;3" |
| "Schema" | "dtmi:dtdl:class:Schema;3" |
| "SchemaField" | "dtmi:dtdl:class:SchemaField;3" |
| "schemas" | "dtmi:dtdl:property:schemas;3" |
| "SemanticType" | "dtmi:dtdl:class:SemanticType;3" |
| "SemanticUnit" | "dtmi:dtdl:class:SemanticUnit;3" |
| "string" | "dtmi:dtdl:instance:Schema:string;3" |
| "String" | "dtmi:dtdl:class:String;3" |
| "symbol" | "dtmi:dtdl:property:symbol;3" |
| "synchronous" | "dtmi:dtdl:instance:CommandType:synchronous;3" |
| "target" | "dtmi:dtdl:property:target;3" |
| "Telemetry" | "dtmi:dtdl:class:Telemetry;3" |
| "TemporalSchema" | "dtmi:dtdl:class:TemporalSchema;3" |
| "time" | "dtmi:dtdl:instance:Schema:time;3" |
| "Time" | "dtmi:dtdl:class:Time;3" |
| "Unit" | "dtmi:dtdl:class:Unit;3" |
| "UnitAttribute" | "dtmi:dtdl:class:UnitAttribute;3" |
| "valueSchema" | "dtmi:dtdl:property:valueSchema;3" |
| "writable" | "dtmi:dtdl:property:writable;3" |

## Context

Every [DTDL element](#dtdl-element) may have &mdash; and every top-level element **must** have &mdash; a "@context" member.
The following constraints and conditions apply to every DTDL v3 "@context" member:

* Member value [MUST](spec/Requirement-ContextStringOrArrayQuantV3.json) be a string or an array of strings.
* Each included string value [MUST](spec/Requirement-ContextDtmiWithVersionQuantV3.json) conform to the [Digital Twin Model Identifier](#digital-twin-model-identifier) syntax, and it [MUST](spec/Requirement-ContextDtmiWithVersionQuantV3.json) contain a version number.
* Each included string value other than "dtmi:dtdl:context;3" [SHALL](spec/Completion-ContextDefinedLanguageExtensionQuantV3.json) refer to a defined DTDL language extension.
* Member [MUST](spec/Requirement-TopLevelDtdlContextV3.json) include string value "dtmi:dtdl:context;3" if member is in a top-level element.
* If present, string value "dtmi:dtdl:context;3" [MUST](spec/Requirement-ContextDtdlFirstOrOnlyV3.json) be the only value or the first value in the array.
* Member [SHOULD NOT](spec/Recommendation-ContextUniqueValuesV3.json) include more than one instance of any given string value.

The *de-versioned* value of a DTMI is the portion of the string value to the left of the semicolon.
For example, the de-versioned value of "dtmi:ex:foo;3" is "dtmi:ex:foo".

Given this definition, the following constraint also applies to the values of a "@context" member:

* Member [SHOULD NOT](spec/Recommendation-ContextRepeatsDeversionedValueV3.json) include multiple string values that have the same de-versioned value.

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

For example, in the following model, the active context for the DTDL Inteface and Command elements is the set { "dtmi:dtdl:context;3", "dtmi:ex:foo;2" }.
The active context of the DTDL Relationship element is the set { "dtmi:dtdl:context;3", "dtmi:ex:foo;1" }, because value "dtmi:ex:foo;1" occurs lower in the hierarchy than value "dtmi:ex:foo;2" and later in the array of strings than value "dtmi:ex:foo;3":

```json
{
  "@context": [
      "dtmi:dtdl:context;3",
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

* It [MUST](spec/Requirement-DtmiIsStringV3.json) be a string.
* It [MUST](spec/Requirement-DtmiRegexV3.json) conform to the regular expression `^dtmi:[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?(?::[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?)*(?:;[1-9][0-9]{0,8}(?:\\.[1-9][0-9]{0,5})?)?$`.
* When used as the value of an "@id" member, it [MUST NOT](spec/Requirement-DtmiReservedPrefixesV3.json) begin with any of the following prefixes:
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

