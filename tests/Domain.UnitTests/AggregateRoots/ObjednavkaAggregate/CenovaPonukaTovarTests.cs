using CRMBackend.Domain.AggregateRoots;
using CRMBackend.Domain.AggregateRoots.DodavatelAggregate;
using CRMBackend.Domain.AggregateRoots.KategorieProduktovAggregate;
using CRMBackend.Domain.AggregateRoots.ObjednavkaAggregate;
using CRMBackend.Domain.AggregateRoots.TovarAggregate;
using CRMBackend.Domain.Exceptions;
using CRMBackend.Domain.ValueObjects;
using FluentAssertions;
using NUnit.Framework;

namespace CRMBackend.Domain.UnitTests.AggregateRoots.ObjednavkaAggregate;

public class CenovaPonukaTovarTests
{
    private Tovar _tovar;
    private VariantTovar _variant;

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

        _variant = new VariantTovar("#FFFFFF", Velkost.M)
        {
            Cena = 50.0m,
            Tovar = _tovar
        };
    }

    [Test]
    public void Constructor_ShouldThrow_WhenBothTovarAndVariantAreNull()
    {
        FluentActions.Invoking(() => new CenovaPonukaTovar(null, null) { Mnozstvo = 1 })
            .Should().Throw<DomainValidationException>()
            .WithMessage("Musí byť nastavený tovar alebo variant.");
    }

    [Test]
    public void Constructor_ShouldThrow_WhenBothTovarAndVariantAreSet()
    {
        FluentActions.Invoking(() => new CenovaPonukaTovar(_tovar, _variant) { Mnozstvo = 1 })
            .Should().Throw<DomainValidationException>()
            .WithMessage("Tovar a variant nemôžu byť nastavené súčasne.");
    }

    [Test]
    public void Constructor_ShouldAcceptTovar_WhenVariantIsNull()
    {
        var polozka = new CenovaPonukaTovar(_tovar, null) { Mnozstvo = 1 };
        polozka.Tovar.Should().Be(_tovar);
        polozka.VariantTovar.Should().BeNull();
    }

    [Test]
    public void Constructor_ShouldAcceptVariant_WhenTovarIsNull()
    {
        var polozka = new CenovaPonukaTovar(null, _variant) { Mnozstvo = 1 };
        polozka.VariantTovar.Should().Be(_variant);
        polozka.Tovar.Should().BeNull();
    }

    [Test]
    public void SetTovar_ShouldClearVariant_WhenTovarIsSet()
    {
        var polozka = new CenovaPonukaTovar(null, _variant) { Mnozstvo = 1 };
        polozka.SetTovar(_tovar);
        
        polozka.Tovar.Should().Be(_tovar);
        polozka.VariantTovar.Should().BeNull();
    }

    [Test]
    public void SetVariantTovar_ShouldClearTovar_WhenVariantIsSet()
    {
        var polozka = new CenovaPonukaTovar(_tovar, null) { Mnozstvo = 1 };
        polozka.SetVariantTovar(_variant);
        
        polozka.VariantTovar.Should().Be(_variant);
        polozka.Tovar.Should().BeNull();
    }

    [Test]
    public void SetMnozstvo_ShouldThrow_WhenValueIsZeroOrNegative()
    {
        var polozka = new CenovaPonukaTovar(_tovar, null) { Mnozstvo = 1 };
        FluentActions.Invoking(() => polozka.Mnozstvo = 0)
            .Should().Throw<DomainValidationException>()
            .WithMessage("Množstvo musí byť väčšie ako 0.");
    }

    [Test]
    public void SetPovodnaCena_ShouldThrow_WhenValueIsNegative()
    {
        var polozka = new CenovaPonukaTovar(_tovar, null) { Mnozstvo = 1 };
        FluentActions.Invoking(() => polozka.SetPovodnaCena(-0.1m))
            .Should().Throw<DomainValidationException>()
            .WithMessage("Pôvodná cena nemôže byť záporná.");
    }

    [Test]
    public void SetPovodnaCena_ShouldAcceptZeroValue()
    {
        var polozka = new CenovaPonukaTovar(_tovar, null) { Mnozstvo = 1 };
        polozka.SetPovodnaCena(0);
        polozka.PovodnaCena.Should().Be(0);
    }

    [Test]
    public void SetTovar_ShouldSetTovar_WhenVariantIsNull()
    {
        var polozka = new CenovaPonukaTovar(variantTovar: _variant) { Mnozstvo = 1 };
        polozka.SetTovar(_tovar);
        polozka.Tovar.Should().Be(_tovar);
        polozka.VariantTovar.Should().BeNull();
    }

    [Test]
    public void SetVariantTovar_ShouldSetVariant_WhenTovarIsNull()
    {
        var polozka = new CenovaPonukaTovar(tovar: _tovar) { Mnozstvo = 1 };
        polozka.SetVariantTovar(_variant);
        polozka.VariantTovar.Should().Be(_variant);
        polozka.Tovar.Should().BeNull();
    }

    [Test]
    public void SetMnozstvo_ShouldSetValue_WhenPositive()
    {
        var polozka = new CenovaPonukaTovar(_tovar, null) { Mnozstvo = 1 };
        polozka.Mnozstvo = 5;
        polozka.Mnozstvo.Should().Be(5);
    }

    [Test]
    public void SetPovodnaCena_ShouldSetValue_WhenPositive()
    {
        var polozka = new CenovaPonukaTovar(_tovar, null) { Mnozstvo = 1 };
        polozka.SetPovodnaCena(100.0m);
        polozka.PovodnaCena.Should().Be(100.0m);
    }

    [Test]
    public void SetPovodnaCena_ShouldSetValue_WhenZero()
    {
        var polozka = new CenovaPonukaTovar(_tovar, null) { Mnozstvo = 1 };
        polozka.SetPovodnaCena(0);
        polozka.PovodnaCena.Should().Be(0);
    }
} 
