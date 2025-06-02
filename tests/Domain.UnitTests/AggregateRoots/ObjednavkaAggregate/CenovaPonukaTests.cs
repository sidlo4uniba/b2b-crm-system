using CRMBackend.Domain.AggregateRoots;
using CRMBackend.Domain.AggregateRoots.DodavatelAggregate;
using CRMBackend.Domain.AggregateRoots.FirmaAggregate;
using CRMBackend.Domain.AggregateRoots.KategorieProduktovAggregate;
using CRMBackend.Domain.AggregateRoots.ObjednavkaAggregate;
using CRMBackend.Domain.AggregateRoots.TovarAggregate;
using CRMBackend.Domain.Entities;
using CRMBackend.Domain.Enums;
using CRMBackend.Domain.Exceptions;
using CRMBackend.Domain.ValueObjects;
using FluentAssertions;
using NUnit.Framework;

namespace CRMBackend.Domain.UnitTests.AggregateRoots.ObjednavkaAggregate;

public class CenovaPonukaTests
{
    private CenovaPonuka _ponuka;
    private CenovaPonukaTovar _polozka;

    [SetUp]
    public void Setup()
    {
        var firma = new Firma
        {
            Nazov = "Test Firma",
            ICO = "12345678",
            Adresa = new Adresa
            {
                Ulica = "Test Ulica",
                Mesto = "Test Mesto",
                PSC = "12345",
                Krajina = "Test Krajina"
            }
        };

        _ponuka = new CenovaPonuka()
        {
            Objednavka = new Objednavka()
            {
                Firma = firma,
                KontaktnaOsoba = new KontaktnaOsoba
                {
                    Id = 1,
                    Firma = firma,
                    Meno = "Test Meno",
                    Priezvisko = "Test Priezvisko",
                    Telefon = "123456789",
                    Email = "test@example.com"
                }
            }
        };

        var tovar = new Tovar
        {
            InterneId = "TEST123",
            Nazov = "Test Tovar",
            Kategoria = new KategorieProduktov
            {
                Nazov = "Kategoria Tovar",
            },
            Cena = 100.0m,
            Dodavatel = new Dodavatel {
                NazovFirmy = "Test Dodavatel",
                Email = "dodavatel@test.com",
                Telefon = "987654321"
            }
        };
        
        _polozka = new CenovaPonukaTovar(tovar)
        {
            Mnozstvo = 3
        };
    }

    [Test]
    public void SetFinalnaCena_ShouldThrow_WhenValueIsNegative()
    {
        FluentActions.Invoking(() => _ponuka.SetFinalnaCena(-0.1m))
            .Should().Throw<DomainValidationException>()
            .WithMessage("Finálna cena nemôže byť záporná.");
    }

    [Test]
    public void SetFinalnaCena_ShouldAcceptZeroValue()
    {
        _ponuka.SetFinalnaCena(0);
        _ponuka.FinalnaCena.Should().Be(0);
    }

    [Test]
    public void SetFinalnaCena_ShouldThrow_WhenStatusIsSchvalene()
    {
        _ponuka.SetStav(StavCenovejPonuky.Schvalene);
        FluentActions.Invoking(() => _ponuka.SetFinalnaCena(100m))
            .Should().Throw<DomainValidationException>()
            .WithMessage("Schválenú ponuku nemožno upraviť.");
    }

    [Test]
    public void AddPolozka_ShouldThrow_WhenStatusIsNotNeriesene()
    {
        _ponuka.SetStav(StavCenovejPonuky.Poslane);
        FluentActions.Invoking(() => _ponuka.AddPolozka(_polozka))
            .Should().Throw<DomainValidationException>()
            .WithMessage("Položky možno pridávať iba v stave Neriesene.");
    }

    [Test]
    public void RemovePolozka_ShouldThrow_WhenStatusIsNotNeriesene()
    {
        _ponuka.AddPolozka(_polozka);
        _ponuka.SetStav(StavCenovejPonuky.Poslane);
        FluentActions.Invoking(() => _ponuka.RemovePolozka(_polozka.Id))
            .Should().Throw<DomainValidationException>()
            .WithMessage("Položky možno odstraňovať iba v stave Neriesene.");
    }

    [Test]
    public void AktualizujPovodneCeny_ShouldThrow_WhenStatusIsNotNeriesene()
    {
        _ponuka.SetStav(StavCenovejPonuky.Poslane);
        FluentActions.Invoking(() => _ponuka.AktualizujPovodneCeny())
            .Should().Throw<DomainValidationException>()
            .WithMessage("Pôvodné ceny možno aktualizovať iba v stave Neriesene.");
    }

    [Test]
    public void SetFinalnaCena_ShouldSetValue_WhenPositive()
    {
        _ponuka.SetFinalnaCena(100.0m);
        _ponuka.FinalnaCena.Should().Be(100.0m);
    }

    [Test]
    public void AddPolozka_ShouldAddItem_WhenStatusIsNeriesene()
    {
        _ponuka.AddPolozka(_polozka);
        _ponuka.Polozky.Should().Contain(_polozka);
    }

    [Test]
    public void RemovePolozka_ShouldRemoveItem_WhenStatusIsNeriesene()
    {
        _ponuka.AddPolozka(_polozka);
        _ponuka.RemovePolozka(_polozka.Id);
        _ponuka.Polozky.Should().NotContain(_polozka);
    }

    [Test]
    public void AktualizujPovodneCeny_ShouldUpdatePrices_WhenStatusIsNeriesene()
    {
        _ponuka.AddPolozka(_polozka);
        _ponuka.AktualizujPovodneCeny();
        _polozka.PovodnaCena.Should().Be(_polozka.Tovar!.Cena);
    }

    [Test]
    public void SetStav_ShouldChangeState_WhenValidTransition()
    {
        _ponuka.SetStav(StavCenovejPonuky.Poslane);
        _ponuka.Stav.Should().Be(StavCenovejPonuky.Poslane);
    }
} 
