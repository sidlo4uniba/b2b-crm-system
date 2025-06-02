using CRMBackend.Domain.AggregateRoots;
using CRMBackend.Domain.AggregateRoots.DodavatelAggregate;
using CRMBackend.Domain.AggregateRoots.KategorieProduktovAggregate;
using CRMBackend.Domain.AggregateRoots.TovarAggregate;
using CRMBackend.Domain.Exceptions;
using CRMBackend.Domain.ValueObjects;
using FluentAssertions;
using NUnit.Framework;

namespace CRMBackend.Domain.UnitTests.AggregateRoots.TovarAggregate;

public class TovarTests
{
    private Tovar _tovar;
    private Dodavatel _testDodavatel;

    [SetUp]
    public void Setup()
    {
        _testDodavatel = new Dodavatel 
        {
            NazovFirmy = "Test Dodavatel",
            Email = "dodavatel@test.com",
            Telefon = "987654321"
        };

        _tovar = new Tovar
        {
            Dodavatel = _testDodavatel,
            InterneId = "TEST123",
            Nazov = "Test Tovar",
            Kategoria = new KategorieProduktov { Nazov = "Elektronika" },
            Cena = 100.0m
        };
    }

    [Test]
    public void SetCena_ShouldThrow_WhenValueIsNegative()
    {
        FluentActions.Invoking(() => _tovar.Cena = -0.1m)
            .Should().Throw<DomainValidationException>()
            .WithMessage("Cena nemôže byť záporná");
    }

    [Test]
    public void SetCena_ShouldAcceptZeroValue()
    {
        _tovar.Cena = 0;
        _tovar.Cena.Should().Be(0);
    }

    [Test]
    public void SetObrazok_ShouldAcceptNullValue()
    {
        _tovar.SetObrazok(null);
        _tovar.ObrazokURL.Should().BeNull();
    }

    [Test]
    public void SetEan_ShouldAcceptNullValue()
    {
        _tovar.SetEan(null);
        _tovar.Ean.Should().BeNull();
    }

    [Test]
    public void AddVariant_ShouldThrow_WhenVariantIsDuplicate()
    {
        var variant1 = new VariantTovar("#FFFFFF", Velkost.M) { Tovar = _tovar, Cena = 100.0m };
        var variant2 = new VariantTovar("#FFFFFF", Velkost.M) { Tovar = _tovar, Cena = 120.0m };

        _tovar.AddVariant(variant1);
        FluentActions.Invoking(() => _tovar.AddVariant(variant2))
            .Should().Throw<DomainValidationException>()
            .WithMessage("Duplicitná varianta");
    }

    [Test]
    public void RemoveVariant_ShouldRemoveVariant_WhenVariantExists()
    {
        var variant = new VariantTovar("#FFFFFF", Velkost.M) { Tovar = _tovar, Cena = 100.0m, Id = 1 };
        _tovar.AddVariant(variant);

        _tovar.RemoveVariant(1);
        _tovar.Varianty.Should().NotContain(variant);
    }

    [Test]
    public void RemoveVariant_ShouldThrow_WhenVariantDoesNotExist()
    {
        FluentActions.Invoking(() => _tovar.RemoveVariant(999))
            .Should().Throw<DomainValidationException>()
            .WithMessage("Varianta nebola nájdená");
    }

    [Test]
    public void RemoveVariant_ShouldRemoveCorrectVariant_WhenMultipleVariantsExist()
    {
        var variant1 = new VariantTovar("#000000", Velkost.S) { Tovar = _tovar, Cena = 50.0m, Id = 1 };
        var variant2 = new VariantTovar("#FFFFFF", Velkost.M) { Tovar = _tovar, Cena = 100.0m, Id = 2 };
        
        _tovar.AddVariant(variant1);
        _tovar.AddVariant(variant2);
        
        _tovar.RemoveVariant(1);
        _tovar.Varianty.Should().NotContain(variant1);
        _tovar.Varianty.Should().Contain(variant2);
    }

    [Test]
    public void SetDodavatel_ShouldThrow_WhenDodavatelIsAlreadySet()
    {
        var newDodavatel = new Dodavatel 
        {
            NazovFirmy = "New Dodavatel",
            Email = "new@test.com",
            Telefon = "123456789"
        };

        FluentActions.Invoking(() => _tovar.Dodavatel = newDodavatel)
            .Should().Throw<DomainValidationException>()
            .WithMessage("Dodávateľa možno nastaviť iba raz pri vytvorení tovaru.");
    }
} 
