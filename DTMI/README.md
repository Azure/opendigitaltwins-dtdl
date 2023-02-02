# Digital Twin Modeling Identifier

## Contents

* [DTMI syntax](#dtmi-syntax)
* [Usage-specific syntax restrictions](#usage-specific-syntax-restrictions)
* [Validation regular expressions](#validation-regular-expressions)
* [Validation code in C](#validation-code-in-c)
* [Formal ABNF](#formal-abnf)
* [URI compatibility](#uri-compatibility)

## Introduction

This document describes the syntax of the Digital Twin Modeling Identifier (DTMI), provides reference implementations of validators for the syntax using regular expressions and C code, formally defines the identifier syntax, and demonstrates that it specializes the URI grammar.

## DTMI syntax

A DTMI has three components: scheme, path, and version.
Scheme and path are separated by a colon (*:*), while path and version are separated by a semicolon (*;*).
The format looks like this:

`<scheme> : <path> ; <version>`

The scheme is the string literal "dtmi" in lowercase.
The path is a sequence of one or more segments, separated by colons.
The version is a numeric value.

Each path segment is a non-empty string containing only letters, digits, and underscores.
The first character may not be a digit, and the last character may not be an underscore.
Segments are thus representable as identifiers in all common programming languages.

Segments are partitioned into user segments and system segments.
If a segment begins with an underscore, it is a system segment; if it begins with a letter, it is a user segment.
If a DTMI contains at least one system segment, it is a system DTMI; otherwise, it is a user DTMI.

The version (and the preceding semicolon) may be omitted entirely.
If present, the version is either a one-part (integer) value or a two-part (major.minor) value.

The length of a one-part version or the major part of a two-part version is limited to nine digits, because the number 999,999,999 fits in a 32-bit signed integer value.
The first digit of a version may not be zero, so there is no ambiguity regarding whether version 1 matches version 01 since the latter is invalid.

The length of the minor part of a two-part version is limited to six digits, because the number 999,999,999.999,999 fits in a double-precision floating-point value.
The minor part of a two-part version may not start with a zero, so there is no ambiguity regarding whether version 1.1 matches version 1.01 since the latter is invalid.
This restriction includes as a special case that the minor part may not be zero, so there is no ambiguity regarding whether version 1 matches version 1.0 since the latter is invalid.

Here is an example of a valid DTMI:

`dtmi:foo_bar:_16:baz33:qux;12`

The path contains four segments: *foo_bar*, *_16*, *baz33*, and *qux*.
One of the segments (*_16*) is a system segment, and therefore the identifier is a system DTMI.
The version is 12.

Equivalence of DTMIs is case-sensitive.

The maximum length of a DTMI is 4096 characters.  The maximum length of a user DTMI is 2048 characters.

Developers are encouraged to take reasonable precautions against identifier collisions.  At a minimum, this means not using DTMIs with very short lengths or only common terms, such as:

`dtmi:myDevice;1`

Such identifiers are perfectly acceptable in sample documents but should never be used in definitions that are deployed in any fashion.

For any definition that is the property of an organization with a registered domain name, a suggested approach to generating identifiers is to use the reversed order of domain segments as initial path segments, followed by further segments that are expected to be collectively unique among definitions within the domain.  For example:

`dtmi:com:fabrikam:industrialProducts:airQualitySensor;1`

This practice will not eliminate the possibility of collisions, but it will limit accidental collisions to developers who are organizationally proximate.
It will also simplify the process of identifying malicious definitions when there is a clear mismatch between the identifier and the account that uploaded the definition.

## Usage-specific syntax restrictions

Services, tools, and languages (and other such artifacts or standards) are permitted to impose additional restrictions on the identifiers they accept or allow.
Such additional restrictions may include, but are not limited to:

* a smaller limit on identifier length
* requirement for the presence of a version component
* requirement for the absence of a version component
* restrictions on version syntax, such as disallowed two-part versions
* disallowance of system DTMIs
* reservations of identifiers with specific path prefixes

Such restrictions may apply to all identifiers used in the artifact or standard, or they may apply only to particular uses therein.

## Validation regular expressions

The following regular expression can be used to assess whether a string satisfies the DTMI syntax for user identifiers (modulo the 2048-character length restriction, which must be checked separately):

```regex
^dtmi:[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?(?::[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?)*(?:;[1-9][0-9]{0,8}(?:\.[1-9][0-9]{0,5})?)?$
```

The following regular expression can be used to assess whether a string satisfies the full DTMI syntax, including both user and system identifiers (modulo the 4096-character length restriction, which must be checked separately):

```regex
^dtmi:(?:_+[A-Za-z0-9]|[A-Za-z])(?:[A-Za-z0-9_]*[A-Za-z0-9])?(?::(?:_+[A-Za-z0-9]|[A-Za-z])(?:[A-Za-z0-9_]*[A-Za-z0-9])?)*(?:;[1-9][0-9]{0,8}(?:\.[1-9][0-9]{0,5})?)?$
```

## Validation code in C

Because C does not support regular expressions, and because C is often used in environments for which a minimal footprint is critical, following is a reference implementation of a C function that performs DTMI syntax validation on a null-terminated `id` string.

* The bool `sysok` parameter indicates whether to accept identifiers in the section of DTMI space reserved for system use.
* The bool `part2ok` parameter indicates whether to accept identifiers with 2-part versions.
* The bool `reqver` parameter indicates whether a version component is required.

```C
bool checkdtmi(const char* id, bool sysok, bool part2ok, bool reqver)
{
    // check for "dtmi:" prefix
    if (strlen(id) < 5 || strncmp(id, "dtmi:", 5) != 0) return false;

    // length must not exceed 2048 or (if sysok) 4096 chars
    if (strlen(id) > (sysok ? 4096 : 2048)) return false;

    // must be at least one segment; we know id[4] == ':' from above
    int pos = 4;
    while (id[pos] == ':')
    {
        // segment must start with letter or (if sysok) underscore
        ++pos;
        if (!(isalpha(id[pos]) || (sysok && id[pos] == '_'))) return false;

        // check all chars until separator or terminator
        ++pos;
        while (id[pos] != ':' && id[pos] != ';' && id[pos] != '\0')
        {
            // chars within segment must be alpha, num, or underscore
            if (!isalpha(id[pos]) && !isdigit(id[pos]) && id[pos] != '_') return false;
            ++pos;
        }

        // segment must not end with underscore
        if (id[pos - 1] == '_') return false;

        // at end of loop, id[pos] must be ':' or ';' or '\0'
    }

    // if reqver, version required
    if (id[pos] == '\0') return !reqver;

    ++pos;
    int majorpos = pos;

    // major version must start with non-zero digit
    if (id[pos] < '1' || id[pos] > '9') return false;
    ++pos;

    // check all chars until point or terminator
    while (id[pos] != '.' && id[pos] != '\0')
    {
        // chars must be numeric
        if (!isdigit(id[pos])) return false;
        ++pos;
    }

    // max of 9 digits for major
    if (pos - majorpos > 9) return false;

    if (id[pos] == '\0') return true;

    // minor version allowed only if part2ok
    if (!part2ok) return false;

    ++pos;
    int minorpos = pos;

    // minor version must start with non-zero digit
    if (id[pos] < '1' || id[pos] > '9') return false;
    ++pos;

    // check all chars until terminator
    while (id[pos] != '\0')
    {
        // chars must be numeric
        if (!isdigit(id[pos])) return false;
        ++pos;
    }

    // max of 6 digits for minor
    if (pos - minorpos > 6) return false;

    return true;
}
```

## Formal ABNF

According to IETF [RFC 7595, Guidelines and Registration Procedures for URI Schemes](https://tools.ietf.org/html/rfc7595), the syntax of all new URI schemes must be defined using the specification format of IETF [RFC 5234, Augmented BNF for Syntax Specifications: ABNF](https://tools.ietf.org/html/rfc5234).  Following is an ABNF specification for the format of DTMIs:

```ABNF
dtmi =            "dtmi" ":" dtpath [ ";" dtver ]
dtpath =          dtseg *(":" dtseg)
dtseg =           dtuserseg / dssysseg
dtuserseg =       ALPHA [ *(ALPHA / DIGIT / "_") (ALPHA / DIGIT) ]
dtsysseg =        "_" *(ALPHA / DIGIT / "_") (ALPHA / DIGIT)
dtver =           digitnz 0*8DIGIT [ "." digitnz 0*5DIGIT ]
digitnz =         %x31-39
                  ; 1-9
```

A DTMI is formally defined as a "dtmi" scheme identifier, a colon, and a Digital Twin path, optionally followed by a semicolon and a Digital Twin version:

* A Digital Twin path is a sequence of one or more Digital Twin segments, separated by colons.
  * A Digital Twin segment is either a user segment or a system segment.
    * A user segment has a leading letter optionally followed by a series of letters, digits, or underscores followed by terminal letter or digit.
    * A system segment has a leading underscore followed by a series of zero or more letters, digits, or underscores followed by terminal letter or digit.
* A Digital Twin version is a non-zero digit followed by zero to eight digits, optionally followed by a decimal point, a non-zero digit, and zero to five digits.

## URI compatibility

IETF [RFC 3986, Uniform Resource Identifier (URI): Generic Syntax](https://tools.ietf.org/html/rfc3986) states "URI scheme specifications must define their own syntax so that all strings matching their scheme-specific syntax will also match the `<absolute-URI>` grammar."  Following is a specialization of `<absolute-URI>` grammar that includes the full DTMI syntax:

```ABNF
absolute-URI =    scheme ":" hier-part
scheme =          "dtmi"
hier-part =       path-rootless
path-rootless =   segment-nz
segment-nz =      1*pchar
pchar =           ALPHA / DIGIT / "_" / ":" / ";" / "."
```

The most critical aspect of `<absolute-URI>` grammar is a set of five ABNF productions for the `<hier-part>` non-terminal, only one of which matches a given URI reference.  For the DTMI scheme, the matching non-terminal is `<path-rootless>`.
