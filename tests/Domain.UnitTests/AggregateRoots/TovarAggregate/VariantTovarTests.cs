using CRMBackend.Domain.AggregateRoots;
using CRMBackend.Domain.AggregateRoots.DodavatelAggregate;
using CRMBackend.Domain.AggregateRoots.KategorieProduktovAggregate;
using CRMBackend.Domain.AggregateRoots.TovarAggregate;
using CRMBackend.Domain.Exceptions;
using CRMBackend.Domain.ValueObjects;
using FluentAssertions;
using NUnit.Framework;

namespace CRMBackend.Domain.UnitTests.AggregateRoots.TovarAggregate;

public class VariantTovarTests
{
    private Tovar _tovar;

    [SetUp]
    public void Setup()
    {
        _tovar = new Tovar
        {
            InterneId = "TEST123",
            Nazov = "Test Tovar",
            Kategoria = new KategorieProduktov { Nazov = "Elektronika" },
            Cena = 100.0m,
            Dodavatel = new Dodavatel {
                NazovFirmy = "Test Dodavatel",
                Email = "dodavatel@test.com",
                Telefon = "987654321"
            }
        };
    }

    [Test]
    public void Constructor_ShouldThrow_WhenBothFarbaAndVelkostAreNull()
    {
        FluentActions.Invoking(() => new VariantTovar(null, null) { Tovar = _tovar, Cena = 50.0m })
            .Should().Throw<DomainValidationException>()
            .WithMessage("Aspoň jedna z hodnôt Farba alebo Veľkosť musí byť nastavená");
    }

    [Test]
    public void Constructor_ShouldThrow_WhenFarbaIsInvalidHexColor()
    {
        FluentActions.Invoking(() => new VariantTovar("invalid", Velkost.M) { Tovar = _tovar, Cena = 50.0m })
            .Should().Throw<DomainValidationException>()
            .WithMessage("Farba musí byť platný hexadecimálny kód farby");
    }

    [Test]
    public void Constructor_ShouldAcceptValidFarba()
    {
        var variant = new VariantTovar("#FFFFFF", null) { Tovar = _tovar, Cena = 50.0m };
        variant.FarbaHex.Should().Be("#FFFFFF");
        variant.Velkost.Should().BeNull();
    }

    [Test]
    public void Constructor_ShouldAcceptValidVelkost()
    {
        var variant = new VariantTovar(null, Velkost.M) { Tovar = _tovar, Cena = 50.0m };
        variant.FarbaHex.Should().BeNull();
        variant.Velkost.Should().Be(Velkost.M);
    }

    [Test]
    public void Constructor_ShouldAcceptBothFarbaAndVelkost()
    {
        var variant = new VariantTovar("#000000", Velkost.L) { Tovar = _tovar, Cena = 50.0m };
        variant.FarbaHex.Should().Be("#000000");
        variant.Velkost.Should().Be(Velkost.L);
    }

    [Test]
    public void SetCena_ShouldThrow_WhenValueIsNegative()
    {
        var variant = new VariantTovar("#FFFFFF", Velkost.M) { Tovar = _tovar, Cena = 50.0m };
        FluentActions.Invoking(() => variant.Cena = -0.1m)
            .Should().Throw<DomainValidationException>()
            .WithMessage("Cena nemôže byť záporná");
    }

    [Test]
    public void SetCena_ShouldAcceptZeroValue()
    {
        var variant = new VariantTovar("#FFFFFF", Velkost.M) { Tovar = _tovar, Cena = 50.0m };
        variant.Cena = 0;
        variant.Cena.Should().Be(0);
    }

    [Test]
    public void SetCena_ShouldAcceptPositiveValue()
    {
        var variant = new VariantTovar("#FFFFFF", null) { Tovar = _tovar, Cena = 50.0m };
        variant.Cena = 100.0m;
        variant.Cena.Should().Be(100.0m);
    }

    [Test]
    public void SetObrazok_ShouldAcceptNullValue()
    {
        var variant = new VariantTovar("#FFFFFF", null) { Tovar = _tovar, Cena = 50.0m };
        variant.SetObrazok(null);
        variant.ObrazokURL.Should().BeNull();
    }

    [Test]
    public void SetObrazok_ShouldAcceptValidUrl()
    {
        var variant = new VariantTovar("#FFFFFF", null) { Tovar = _tovar, Cena = 50.0m };
        var url = "https://example.com/image.jpg";
        variant.SetObrazok(url);
        variant.ObrazokURL.Should().Be(url);
    }
} 
