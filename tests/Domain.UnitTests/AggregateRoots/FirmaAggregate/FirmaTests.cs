using CRMBackend.Domain.AggregateRoots;
using CRMBackend.Domain.AggregateRoots.FirmaAggregate;
using CRMBackend.Domain.Entities;
using CRMBackend.Domain.Exceptions;
using CRMBackend.Domain.ValueObjects;
using FluentAssertions;
using NUnit.Framework;

namespace CRMBackend.Domain.UnitTests.AggregateRoots.FirmaAggregate;

public class FirmaTests
{
    private Firma _firma;

    [SetUp]
    public void Setup()
    {
        _firma = new Firma
        {
            Nazov = "Test Firma",
            ICO = "12345678",
            Adresa = new Adresa
            {
                Ulica = "Test",
                Mesto = "Test",
                PSC = "Test",
                Krajina = "Test"
            }
        };
    }

    [Test]
    public void UpdateSkoreSpolahlivosti_ShouldThrow_WhenValueIsBelowZero()
    {
        FluentActions.Invoking(() => _firma.UpdateSkoreSpolahlivosti(-0.1m))
            .Should().Throw<DomainValidationException>()
            .WithMessage("Skóre spoľahlivosti musí byť medzi 0 a 1");
    }

    [Test]
    public void UpdateSkoreSpolahlivosti_ShouldThrow_WhenValueIsAboveOne()
    {
        FluentActions.Invoking(() => _firma.UpdateSkoreSpolahlivosti(1.1m))
            .Should().Throw<DomainValidationException>()
            .WithMessage("Skóre spoľahlivosti musí byť medzi 0 a 1");
    }

    [Test]
    public void UpdateHodnotaObjednavok_ShouldThrow_WhenValueIsNegative()
    {
        FluentActions.Invoking(() => _firma.UpdateHodnotaObjednavok(-0.01m))
            .Should().Throw<DomainValidationException>()
            .WithMessage("Hodnota objednávok nemôže byť záporná");
    }

    [Test]
    public void AddKontaktnaOsoba_ShouldThrow_WhenEmailIsDuplicate()
    {
        var osoba1 = new KontaktnaOsoba 
        { 
            Meno = "Test",
            Priezvisko = "Test",
            Telefon = "123456789",
            Email = "test@test.com"
        };
        var osoba2 = new KontaktnaOsoba 
        { 
            Meno = "Test",
            Priezvisko = "Test",
            Telefon = "123456789",
            Email = "test@test.com"
        };

        _firma.AddKontaktnaOsoba(osoba1);
        FluentActions.Invoking(() => _firma.AddKontaktnaOsoba(osoba2))
            .Should().Throw<DomainValidationException>()
            .WithMessage("Duplicitný email nie je povolený");
    }

    [Test]
    public void AddKontaktnaOsoba_ShouldThrow_WhenEmailIsDuplicateCaseInsensitive()
    {
        var osoba1 = new KontaktnaOsoba 
        { 
            Meno = "Test",
            Priezvisko = "Test",
            Telefon = "123456789",
            Email = "test@test.com"
        };
        var osoba2 = new KontaktnaOsoba 
        { 
            Meno = "Test",
            Priezvisko = "Test",
            Telefon = "123456789",
            Email = "TEST@test.com"
        };

        _firma.AddKontaktnaOsoba(osoba1);
        FluentActions.Invoking(() => _firma.AddKontaktnaOsoba(osoba2))
            .Should().Throw<DomainValidationException>()
            .WithMessage("Duplicitný email nie je povolený");
    }

    [Test]
    public void RemoveKontaktnaOsoba_ShouldRemoveOsoba_WhenOsobaExists()
    {
        var osoba = new KontaktnaOsoba 
        { 
            Id = 1,
            Meno = "Test",
            Priezvisko = "Test",
            Telefon = "123456789",
            Email = "test@test.com"
        };
        _firma.AddKontaktnaOsoba(osoba);

        _firma.RemoveKontaktnaOsoba(1);
        _firma.KontaktneOsoby.Should().NotContain(osoba);
    }

    [Test]
    public void RemoveKontaktnaOsoba_ShouldThrow_WhenOsobaDoesNotExist()
    {
        FluentActions.Invoking(() => _firma.RemoveKontaktnaOsoba(999))
            .Should().Throw<DomainValidationException>()
            .WithMessage("Kontaktna osoba s danym ID neexistuje");
    }

    [Test]
    public void SetIcDph_ShouldAcceptNullValue()
    {
        _firma.SetIcDph(null);
        _firma.IcDph.Should().BeNull();
    }

    [Test]
    public void SetIcDph_ShouldAcceptEmptyString()
    {
        _firma.SetIcDph(string.Empty);
        _firma.IcDph.Should().Be(string.Empty);
    }
} 
