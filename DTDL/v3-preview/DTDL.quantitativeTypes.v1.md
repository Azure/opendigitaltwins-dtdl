# QuantitativeTypes extension

**PREVIEW DOCUMENTATION**

This document provides a preliminary description of a future version of DTDL.
Preview functionality is provided without a service level agreement, and is not recommended for production uses.
Any and all aspects of the language described herein are subject to change without notice until this version of DTDL becomes generally available.
There is no obligation of continued support for any feature, aspect, or syntactical construct that does not make the transition to general availability.
For more information, see [Supplemental Terms of Use for Microsoft Azure Previews](https://azure.microsoft.com/en-us/support/legal/preview-supplemental-terms/).

**Version 1**

**Usable in DTDL version 3**

The QuantitativeTypes extension provides a set of standard semantic types that can be applied to CommandRequests, CommandResponses, Fields, MapValues, Properties, and Telemetries.
If a service supports the QuantitativeTypes extension, and if the QuantitativeTypes context is specified, the service recognizes and understands the semantic types, unit types, and units itemized below, as well as the `unit` property on each of the semantic types.

## QuantitativeTypes context

The context specifier for version 1 of the QuantitativeTypes extension is "dtmi:dtdl:extension:quantitativeTypes;1".

## Semantic types and units

The semantic types itemized below can co-type a CommandRequest, a CommandResponse, a Field, a MapValue, a Property, or a Telemetry in DTDL version 3.
When a CommandRequest, CommandResponse, Field, MapValue, Property, or Telemetry is co-typed with one of these semantic types, the value of the `unit` property must be an instance of the corresponding unit type, and the value of the `schema` property must be a numeric type.

Note that although most semantic types have matching unit types, there is not a strict one-to-one correspondence between semantic types and unit types.
For example, `Humidity` is expressed using `DensityUnit`, and `Luminosity` is expressed using `PowerUnit`.

The chart below itemizes semantic types, corresponding unit types, and available units for each unit type.

> Note:
The `TimeSpan` semantic type should not be confused with the `duration` schema type.
The `duration` schema is in ISO 8601 format; it is intended for calendar durations; and it does not play well with SI units.
The semantic unit for `TimeSpan` is `TimeUnit`, which gives temporal semantics to a numeric schema type.

| Semantic type | Unit type | Unit |
| --- | --- | --- |
| `Acceleration` | `AccelerationUnit` | `centimetrePerSecondSquared` <br> `gForce` <br> `metrePerSecondSquared` |
| `Angle` | `AngleUnit` | `degreeOfArc` <br> `minuteOfArc` <br> `radian` <br> `secondOfArc` <br> `turn` |
| `AngularAcceleration` | `AngularAccelerationUnit` | `radianPerSecondSquared` |
| `AngularVelocity` | `AngularVelocityUnit` | `degreePerSecond` <br> `radianPerSecond` <br> `revolutionPerMinute` <br> `revolutionPerSecond` |
| `ApparentEnergy` | `ApparentEnergyUnit` | `gigavoltAmpereHour` <br> `kilovoltAmpereHour` <br> `megavoltAmpereHour` <br> `voltAmpereHour` |
| `ApparentPower` | `ApparentPowerUnit` | `gigavoltAmpere` <br> `kilovoltAmpere` <br> `megavoltAmpere` <br> `millivoltAmpere` <br> `voltAmpere` |
| `Area` | `AreaUnit` | `acre` <br> `hectare` <br> `squareCentimetre` <br> `squareFoot` <br> `squareInch` <br> `squareKilometre` <br> `squareMetre` <br> `squareMillimetre` |
| `Capacitance` | `CapacitanceUnit` | `farad` <br> `microfarad` <br> `millifarad` <br> `nanofarad` <br> `picofarad` |
| `Concentration` | `Unitless` | `partsPerBillion` <br> `partsPerMillion` <br> `partsPerQuadrillion` <br> `partsPerTrillion` <br> `percent` <br> `unity` |
| `Current` | `CurrentUnit` | `ampere` <br> `kiloampere` <br> `microampere` <br> `milliampere` |
| `DataRate` | `DataRateUnit` | `bitPerSecond` <br> `bytePerSecond` <br> `exbibitPerSecond` <br> `exbibytePerSecond` <br> `gibibitPerSecond` <br> `gibibytePerSecond` <br> `kibibitPerSecond` <br> `kibibytePerSecond` <br> `mebibitPerSecond` <br> `mebibytePerSecond` <br> `tebibitPerSecond` <br> `tebibytePerSecond` <br> `yobibitPerSecond` <br> `yobibytePerSecond` <br> `zebibitPerSecond` <br> `zebibytePerSecond` |
| `DataSize` | `DataSizeUnit` | `bit` <br> `byte` <br> `exbibit` <br> `exbibyte` <br> `gibibit` <br> `gibibyte` <br> `kibibit` <br> `kibibyte` <br> `mebibit` <br> `mebibyte` <br> `tebibit` <br> `tebibyte` <br> `yobibit` <br> `yobibyte` <br> `zebibit` <br> `zebibyte` |
| `Density` | `DensityUnit` | `gramPerCubicMetre` <br> `kilogramPerCubicMetre` <br> `microgramPerCubicMetre` <br> `milligramPerCubicMetre` |
| `Distance` | `LengthUnit` | `astronomicalUnit` <br> `centimetre` <br> `foot` <br> `inch` <br> `kilometre` <br> `metre` <br> `micrometre` <br> `mile` <br> `millimetre` <br> `nanometre` <br> `nauticalMile` |
| `ElectricCharge` | `ChargeUnit` | `ampereHour` <br> `coulomb` <br> `milliampereHour` |
| `Energy` | `EnergyUnit` | `britishThermalUnit` <br> `electronvolt` <br> `gigajoule` <br> `gigawattHour` <br> `joule` <br> `kiloBritishThermalUnit` <br> `kilojoule` <br> `kilowattHour` <br> `megaelectronvolt` <br> `megajoule` <br> `megawattHour` <br> `milliwattHour` <br> `terawattHour` <br> `wattHour` |
| `EnergyRate` | `EnergyRateUnit` | `britishThermalUnitPerHour` <br> `gigajoulePerHour` <br> `joulePerHour` <br> `kiloBritishThermalUnitPerHour` <br> `kilojoulePerHour` <br> `kilowattHourPerYear` <br> `megajoulePerHour` |
| `Force` | `ForceUnit` | `newton` <br> `ounce` <br> `pound` <br> `ton` |
| `Frequency` | `FrequencyUnit` | `gigahertz` <br> `hertz` <br> `kilohertz` <br> `megahertz` <br> `millihertz` |
| `Humidity` | `DensityUnit` | `gramPerCubicMetre` <br> `kilogramPerCubicMetre` <br> `microgramPerCubicMetre` <br> `milligramPerCubicMetre` |
| `Illuminance` | `IlluminanceUnit` | `footcandle` <br> `lux` |
| `Inductance` | `InductanceUnit` | `henry` <br> `microhenry` <br> `millihenry` |
| `IonizingRadiationDose` | `IonizingRadiationDoseUnit` | `gray` <br> `microgray` <br> `microsievert` <br> `milligray` <br> `millisievert` <br> `sievert` |
| `Irradiance` | `IrradianceUnit` | `wattPerSquareMetre` |
| `Latitude` | `AngleUnit` | `degreeOfArc` <br> `minuteOfArc` <br> `radian` <br> `secondOfArc` <br> `turn` |
| `Length` | `LengthUnit` | `astronomicalUnit` <br> `centimetre` <br> `foot` <br> `inch` <br> `kilometre` <br> `metre` <br> `micrometre` <br> `mile` <br> `millimetre` <br> `nanometre` <br> `nauticalMile` |
| `Longitude` | `AngleUnit` | `degreeOfArc` <br> `minuteOfArc` <br> `radian` <br> `secondOfArc` <br> `turn` |
| `Luminance` | `LuminanceUnit` | `candelaPerSquareMetre` |
| `Luminosity` | `PowerUnit` | `gigawatt` <br> `horsepower` <br> `kilowatt` <br> `megawatt` <br> `microwatt` <br> `milliwatt` <br> `watt` |
| `LuminousFlux` | `LuminousFluxUnit` | `lumen` |
| `LuminousIntensity` | `LuminousIntensityUnit` | `candela` |
| `MagneticFlux` | `MagneticFluxUnit` | `maxwell` <br> `weber` |
| `MagneticInduction` | `MagneticInductionUnit` | `gauss` <br> `tesla` |
| `Mass` | `MassUnit` | `gram` <br> `kilogram` <br> `massPound` <br> `microgram` <br> `milligram` <br> `slug` <br> `tonne` |
| `MassFlowRate` | `MassFlowRateUnit` | `gramPerHour` <br> `gramPerSecond` <br> `kilogramPerHour` <br> `kilogramPerSecond` <br> `massPoundPerHour` |
| `Power` | `PowerUnit` | `gigawatt` <br> `horsepower` <br> `kilowatt` <br> `megawatt` <br> `microwatt` <br> `milliwatt` <br> `watt` |
| `Pressure` | `PressureUnit` | `bar` <br> `decapascal` <br> `hectopascal` <br> `inchesOfMercury` <br> `inchesOfWater` <br> `kilopascal` <br> `millibar` <br> `millimetresOfMercury` <br> `pascal` <br> `poundPerSquareInch` |
| `Radioactivity` | `RadioactivityUnit` | `becquerel` <br> `gigabecquerel` <br> `kilobecquerel` <br> `megabecquerel` |
| `ReactiveEnergy` | `ReactiveEnergyUnit` | `gigavoltAmpereReactiveHour` <br> `kilovoltAmpereReactiveHour` <br> `megavoltAmpereReactiveHour` <br> `voltAmpereReactiveHour` |
| `ReactivePower` | `ReactivePowerUnit` | `gigavoltAmpereReactive` <br> `kilovoltAmpereReactive` <br> `megavoltAmpereReactive` <br> `millivoltAmpereReactive` <br> `voltAmpereReactive` |
| `RelativeDensity` | `Unitless` | `partsPerBillion` <br> `partsPerMillion` <br> `partsPerQuadrillion` <br> `partsPerTrillion` <br> `percent` <br> `unity` |
| `RelativeHumidity` | `Unitless` | `partsPerBillion` <br> `partsPerMillion` <br> `partsPerQuadrillion` <br> `partsPerTrillion` <br> `percent` <br> `unity` |
| `Resistance` | `ResistanceUnit` | `kiloohm` <br> `megaohm` <br> `milliohm` <br> `ohm` |
| `SoundPressure` | `SoundPressureUnit` | `bel` <br> `decibel` |
| `Temperature` | `TemperatureUnit` | `degreeCelsius` <br> `degreeFahrenheit` <br> `kelvin` |
| `Thrust` | `ForceUnit` | `newton` <br> `ounce` <br> `pound` <br> `ton` |
| `TimeSpan` | `TimeUnit` | `day` <br> `hour` <br> `microsecond` <br> `millisecond` <br> `minute` <br> `nanosecond` <br> `second` <br> `year` |
| `Torque` | `TorqueUnit` | `newtonMetre` |
| `Velocity` | `VelocityUnit` | `centimetrePerSecond` <br> `kilometrePerHour` <br> `kilometrePerSecond` <br> `knot` <br> `metrePerHour` <br> `metrePerSecond` <br> `milePerHour` <br> `milePerSecond` |
| `Voltage` | `VoltageUnit` | `kilovolt` <br> `megavolt` <br> `microvolt` <br> `millivolt` <br> `volt` |
| `Volume` | `VolumeUnit` | `cubicCentimetre` <br> `cubicFoot` <br> `cubicInch` <br> `cubicMetre` <br> `fluidOunce` <br> `gallon` <br> `litre` <br> `millilitre` |
| `VolumeFlowRate` | `VolumeFlowRateUnit` | `cubicFootPerMinute` <br> `cubicMetrePerHour` <br> `cubicMetrePerMinute` <br> `cubicMetrePerSecond` <br> `gallonPerHour` <br> `gallonPerMinute` <br> `litrePerHour` <br> `litrePerSecond` <br> `millilitrePerHour` <br> `millilitrePerSecond` |

## Semantic type and unit examples

The following example shows an Interface with four `contents` elements that are all of type Telemetry.

* The element named "thermometer" has co-type Temperature and `unit` *degreeCelsius*.
* The element named "barometer" has co-type Pressure and `unit` *millibar*.
* The element named "humidityMeter" has co-type RelativeHumidity and `unit` *percent*.
* The element named "anemometer" has co-type Velocity and `unit` *metrePerSecond*.

One Telemetry has a `schema` value of *integer*, and the other three have `schema` values of *double*, all of which are valid since both *integer* and *double* are numeric schemas.

```json
{
    "@id": "dtmi:com:example:Sensor;1",
    "@type": "Interface",
    "contents": [
        {
            "@type": [ "Telemetry", "Temperature" ],
            "name": "thermometer",
            "schema": "double",
            "unit": "degreeCelsius"
        },
        {
            "@type": [ "Telemetry", "Pressure" ],
            "name": "barometer",
            "schema": "double",
            "unit": "millibar"
        },
        {
            "@type": [ "Telemetry", "RelativeHumidity" ],
            "name": "humidityMeter",
            "schema": "integer",
            "unit": "percent"
        },
        {
            "@type": [ "Telemetry", "Velocity" ],
            "name": "anemometer",
            "schema": "double",
            "unit": "metrePerSecond"
        }
    ],
    "@context": [
        "dtmi:dtdl:context;3",
        "",
        "dtmi:dtdl:extension:quantitativeTypes;1"
    ]
}
```

## Feature versions

The chart below lists the versions of the QuantitativeTypes extension that are currently available.

| Extension | Context | DTDL versions |
| --- | --- | --- |
| [QuantitativeTypes v1](./DTDL.quantitativeTypes.v1.md) | dtmi:dtdl:extension:quantitativeTypes;1 | [3](./DTDL.v3.md) |

