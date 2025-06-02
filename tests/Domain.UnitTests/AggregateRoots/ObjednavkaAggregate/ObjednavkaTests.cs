using CRMBackend.Domain.AggregateRoots;
using CRMBackend.Domain.Entities;
using CRMBackend.Domain.Enums;
using CRMBackend.Domain.Exceptions;
using CRMBackend.Domain.ValueObjects;
using FluentAssertions;
using NUnit.Framework;
using System;
using System.Linq;
using CRMBackend.Domain.AggregateRoots.FirmaAggregate;
using CRMBackend.Domain.AggregateRoots.ObjednavkaAggregate;

namespace CRMBackend.Domain.UnitTests.AggregateRoots.ObjednavkaAggregate;

[TestFixture]
public class ObjednavkaTests
{
    private Objednavka _objednavka = null!;
    private CenovaPonuka _cenovaPonuka = null!;

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

        var kontaktnaOsoba = new KontaktnaOsoba
        {
            Id = 1,
            Firma = firma,
            Meno = "Test Meno",
            Priezvisko = "Test Priezvisko",
            Telefon = "123456789",
            Email = "test@example.com"
        };

        _cenovaPonuka = new CenovaPonuka()
        {
            Objednavka = new Objednavka()
            {
                Firma = firma,
                KontaktnaOsoba = kontaktnaOsoba
            }
        };

        _objednavka = new Objednavka
        {
            Firma = firma,
            KontaktnaOsoba = kontaktnaOsoba
        };
    }

    private void ArrangeObjednavkaState(ObjednavkaFaza targetFaza)
    {
        Assume.That(_objednavka.Faza == ObjednavkaFaza.Nacenenie);
        Assume.That(_objednavka.Zrusene == false);
        Assume.That(_objednavka.Zaplatene == false);

        if (targetFaza == ObjednavkaFaza.Nacenenie) return;

        _objednavka.AddCenovaPonuka(_cenovaPonuka);
        Assume.That(_objednavka.PoslednaCenovaPonuka is not null);
        Assume.That(_objednavka.PoslednaCenovaPonuka!.Stav == StavCenovejPonuky.Neriesene);
        Assume.That(_objednavka.Faza == ObjednavkaFaza.Nacenenie);

        _objednavka.SetFaza(ObjednavkaFaza.NacenenieCaka);
        Assume.That(_objednavka.Faza == ObjednavkaFaza.NacenenieCaka);
        Assume.That(_objednavka.PoslednaCenovaPonuka is not null);
        Assume.That(_objednavka.PoslednaCenovaPonuka!.Stav == StavCenovejPonuky.Poslane);
        if (targetFaza == ObjednavkaFaza.NacenenieCaka) return;

        _objednavka.SetFaza(ObjednavkaFaza.VyrobaNeriesene);
        Assume.That(_objednavka.Faza == ObjednavkaFaza.VyrobaNeriesene);
        Assume.That(_objednavka.PoslednaCenovaPonuka is not null);
        Assume.That(_objednavka.PoslednaCenovaPonuka!.Stav == StavCenovejPonuky.Schvalene);
        if (targetFaza == ObjednavkaFaza.VyrobaNeriesene) return;

        if (targetFaza == ObjednavkaFaza.VyrobaNemozna)
        {
            _objednavka.SetFaza(ObjednavkaFaza.VyrobaNemozna);
            Assume.That(_objednavka.Faza == ObjednavkaFaza.VyrobaNemozna);
            return;
        }

        _objednavka.SetNaplanovanyDatumVyroby(DateTime.Now.AddDays(5));
        Assume.That(_objednavka.NaplanovanyDatumVyroby is not null);

        _objednavka.SetFaza(ObjednavkaFaza.VyrobaCaka);
        Assume.That(_objednavka.Faza == ObjednavkaFaza.VyrobaCaka);
        if (targetFaza == ObjednavkaFaza.VyrobaCaka) return;

        _objednavka.SetFaza(ObjednavkaFaza.OdoslanieCaka);
        Assume.That(_objednavka.Faza == ObjednavkaFaza.OdoslanieCaka);
        if (targetFaza == ObjednavkaFaza.OdoslanieCaka) return;

        _objednavka.SetFaza(ObjednavkaFaza.PlatbaCaka);
        Assume.That(_objednavka.Faza == ObjednavkaFaza.PlatbaCaka);
        Assume.That(_objednavka.Zaplatene == false);
        if (targetFaza == ObjednavkaFaza.PlatbaCaka) return;

        _objednavka.OznacAkoZaplatene();
        Assume.That(_objednavka.Faza == ObjednavkaFaza.Vybavene);
        Assume.That(_objednavka.Zaplatene == true);
        if (targetFaza == ObjednavkaFaza.Vybavene) return;

        Assert.Fail($"Nepodarilo sa pripraviť stav pre cieľovú fázu: {targetFaza}");
    }

    private CenovaPonuka CreateCenovuPonuku()
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
        
        return new CenovaPonuka()
        {
            Objednavka = new Objednavka()
            {
                Firma = firma,
                KontaktnaOsoba = new KontaktnaOsoba
                {
                    Id = 1,
                    Firma = new Firma
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
                    },
                    Meno = "Test Meno",
                    Priezvisko = "Test Priezvisko",
                    Telefon = "123456789",
                    Email = "test@example.com"
                }
            }
        };
    }

    [Test]
    public void ZrusObjednavku_Throws_WhenAlreadyZrusene()
    {
        _objednavka.ZrusObjednavku();
        Assume.That(_objednavka.Zrusene == true);

        _objednavka.Invoking(o => o.ZrusObjednavku())
            .Should().Throw<DomainValidationException>()
            .WithMessage("Objednávka je už zrušená.");
        _objednavka.Zrusene.Should().BeTrue();
    }

    [Test]
    public void ZrusObjednavku_Throws_WhenInVybaveneFaza()
    {
        ArrangeObjednavkaState(ObjednavkaFaza.Vybavene);
        Assume.That(_objednavka.Faza == ObjednavkaFaza.Vybavene);
        Assume.That(_objednavka.Zaplatene == true);
        Assume.That(_objednavka.Zrusene == false);

        _objednavka.Invoking(o => o.ZrusObjednavku())
            .Should().Throw<DomainValidationException>()
            .WithMessage("Hotovú objednávku nemožno zrušiť.");
        _objednavka.Zrusene.Should().BeFalse();
    }

    [Test]
    public void ZrusObjednavku_SetsZruseneToTrue_WhenInValidFaza()
    {
        ArrangeObjednavkaState(ObjednavkaFaza.NacenenieCaka);
        Assume.That(_objednavka.Faza == ObjednavkaFaza.NacenenieCaka);
        Assume.That(_objednavka.Zrusene == false);

        _objednavka.ZrusObjednavku();

        _objednavka.Zrusene.Should().BeTrue();
        _objednavka.Faza.Should().Be(ObjednavkaFaza.NacenenieCaka);
    }

    [Test]
    public void OznacAkoZaplatene_Throws_WhenAlreadyZaplatene()
    {
        _objednavka.OznacAkoZaplatene();
        Assume.That(_objednavka.Zaplatene == true);

        _objednavka.Invoking(o => o.OznacAkoZaplatene())
            .Should().Throw<DomainValidationException>()
            .WithMessage("Objednávka je už zaplatená.");
        _objednavka.Zaplatene.Should().BeTrue();
    }

    [Test]
    public void OznacAkoZaplatene_SetsVybavene_WhenInPlatbaCaka()
    {
        ArrangeObjednavkaState(ObjednavkaFaza.PlatbaCaka);
        Assume.That(_objednavka.Faza == ObjednavkaFaza.PlatbaCaka);
        Assume.That(_objednavka.Zaplatene == false);

        _objednavka.OznacAkoZaplatene();

        _objednavka.Zaplatene.Should().BeTrue();
        _objednavka.Faza.Should().Be(ObjednavkaFaza.Vybavene);
    }

    [Test]
    public void OznacAkoZaplatene_SetsOnlyZaplatene_WhenNotInPlatbaCaka()
    {
        ArrangeObjednavkaState(ObjednavkaFaza.OdoslanieCaka);
        Assume.That(_objednavka.Faza == ObjednavkaFaza.OdoslanieCaka);
        Assume.That(_objednavka.Zaplatene == false);

        _objednavka.OznacAkoZaplatene();

        _objednavka.Zaplatene.Should().BeTrue();
        _objednavka.Faza.Should().Be(ObjednavkaFaza.OdoslanieCaka);
    }

    [Test]
    public void AddCenovaPonuka_Throws_WhenNotInNacenenie()
    {
        ArrangeObjednavkaState(ObjednavkaFaza.NacenenieCaka);
        Assume.That(_objednavka.Faza == ObjednavkaFaza.NacenenieCaka);

        _objednavka.Invoking(o => o.AddCenovaPonuka(_cenovaPonuka))
            .Should().Throw<DomainValidationException>()
            .WithMessage("Cenovú ponuku možno pridať iba vo fáze Nacenenie.");
    }

    [Test]
    public void AddCenovaPonuka_Throws_WhenLastPonukaNotZrusene()
    {
        _objednavka.AddCenovaPonuka(_cenovaPonuka);
        Assume.That(_objednavka.PoslednaCenovaPonuka == _cenovaPonuka);
        Assume.That(_objednavka.PoslednaCenovaPonuka!.Stav == StavCenovejPonuky.Neriesene);
        Assume.That(_objednavka.Faza == ObjednavkaFaza.Nacenenie);

        _objednavka.Invoking(o => o.AddCenovaPonuka(_cenovaPonuka))
            .Should().Throw<DomainValidationException>()
            .WithMessage("Nemôžete pridať novú cenovú ponuku, pokiaľ posledná cenová ponuka nie je zrušená.");

        _objednavka.CenovePonuky.Should().HaveCount(1);
        _objednavka.PoslednaCenovaPonuka.Should().Be(_cenovaPonuka);
    }

    [Test]
    public void AddCenovaPonuka_AddsPonukaAndSetsAsLast_WhenInNacenenieAndNoLastPonuka()
    {
        Assume.That(_objednavka.Faza == ObjednavkaFaza.Nacenenie);
        Assume.That(_objednavka.PoslednaCenovaPonuka == null);
        var novaPonuka = _cenovaPonuka;

        _objednavka.AddCenovaPonuka(novaPonuka);

        _objednavka.CenovePonuky.Should().Contain(novaPonuka);
        _objednavka.CenovePonuky.Should().HaveCount(1);
        _objednavka.PoslednaCenovaPonuka.Should().Be(novaPonuka);
        _objednavka.PoslednaCenovaPonuka!.Stav.Should().Be(StavCenovejPonuky.Neriesene);
        _objednavka.Faza.Should().Be(ObjednavkaFaza.Nacenenie);
    }

    [Test]
    public void AddCenovaPonuka_AddsPonuka_WhenLastPonukaIsZrusene()
    {
        _objednavka.AddCenovaPonuka(_cenovaPonuka);
        _objednavka.SetFaza(ObjednavkaFaza.NacenenieCaka);
        _objednavka.SetFaza(ObjednavkaFaza.Nacenenie);
        Assume.That(_objednavka.Faza == ObjednavkaFaza.Nacenenie);
        Assume.That(_objednavka.PoslednaCenovaPonuka == null);

        var druhaPonuka = CreateCenovuPonuku();
        _objednavka.AddCenovaPonuka(druhaPonuka);

        _objednavka.CenovePonuky.Should().HaveCount(2);
        _objednavka.PoslednaCenovaPonuka.Should().Be(druhaPonuka);
        _objednavka.PoslednaCenovaPonuka!.Stav.Should().Be(StavCenovejPonuky.Neriesene);
        _objednavka.Faza.Should().Be(ObjednavkaFaza.Nacenenie);
    }

    [Test]
    public void SetFaza_NacenenieToNacenenieCaka_SetsCorrectStavAndFaza()
    {
        _objednavka.AddCenovaPonuka(_cenovaPonuka);
        Assume.That(_objednavka.PoslednaCenovaPonuka == _cenovaPonuka);
        Assume.That(_cenovaPonuka.Stav == StavCenovejPonuky.Neriesene);
        Assume.That(_objednavka.Faza == ObjednavkaFaza.Nacenenie);

        _objednavka.SetFaza(ObjednavkaFaza.NacenenieCaka);

        _objednavka.Faza.Should().Be(ObjednavkaFaza.NacenenieCaka);
        _objednavka.PoslednaCenovaPonuka.Should().NotBeNull();
        _objednavka.PoslednaCenovaPonuka!.Stav.Should().Be(StavCenovejPonuky.Poslane);
    }

    [Test]
    public void SetFaza_NacenenieCakaToVyrobaNeriesene_SetsCorrectStavAndFaza()
    {
        ArrangeObjednavkaState(ObjednavkaFaza.NacenenieCaka);
        Assume.That(_objednavka.Faza == ObjednavkaFaza.NacenenieCaka);
        Assume.That(_objednavka.PoslednaCenovaPonuka is not null);
        Assume.That(_objednavka.PoslednaCenovaPonuka!.Stav == StavCenovejPonuky.Poslane);


        _objednavka.SetFaza(ObjednavkaFaza.VyrobaNeriesene);

        _objednavka.Faza.Should().Be(ObjednavkaFaza.VyrobaNeriesene);
        _objednavka.PoslednaCenovaPonuka.Should().NotBeNull();
        _objednavka.PoslednaCenovaPonuka!.Stav.Should().Be(StavCenovejPonuky.Schvalene);
    }

    [Test]
    public void SetFaza_NacenenieCakaToNacenenie_SetsPonukaToNullAndFaza()
    {
        ArrangeObjednavkaState(ObjednavkaFaza.NacenenieCaka);
        Assume.That(_objednavka.Faza == ObjednavkaFaza.NacenenieCaka);
        Assume.That(_objednavka.PoslednaCenovaPonuka != null);
        var povodnaPonuka = _objednavka.PoslednaCenovaPonuka;

        _objednavka.SetFaza(ObjednavkaFaza.Nacenenie);

        _objednavka.Faza.Should().Be(ObjednavkaFaza.Nacenenie);
        _objednavka.PoslednaCenovaPonuka.Should().BeNull();
        _objednavka.CenovePonuky.Should().Contain(povodnaPonuka);
    }

    [Test]
    public void SetFaza_Throws_WhenNoPonukaForNacenenieToNacenenieCaka()
    {
        Assume.That(_objednavka.Faza == ObjednavkaFaza.Nacenenie);
        Assume.That(_objednavka.PoslednaCenovaPonuka == null);

        _objednavka.Invoking(o => o.SetFaza(ObjednavkaFaza.NacenenieCaka))
            .Should().Throw<DomainValidationException>()
            .WithMessage("Žiadna cenová ponuka na označenie ako poslaná.");
    }

    [Test]
    public void SetFaza_Throws_WhenPonukaNotPoslaneForNacenenieCakaToVyrobaNeriesene()
    {
        _objednavka.AddCenovaPonuka(_cenovaPonuka);
        Assume.That(_objednavka.Faza == ObjednavkaFaza.Nacenenie);
        Assume.That(_objednavka.PoslednaCenovaPonuka!.Stav == StavCenovejPonuky.Neriesene);

        _objednavka.Invoking(o => o.SetFaza(ObjednavkaFaza.VyrobaNeriesene))
            .Should().Throw<DomainValidationException>()
            .WithMessage($"Neplatný prechod z fázy '{ObjednavkaFaza.Nacenenie}' do fázy '{ObjednavkaFaza.VyrobaNeriesene}'.");
    }

    [Test]
    public void SetFaza_Throws_WhenInvalidTransition_ExampleVyrobaNerieseneToOdoslanieCaka()
    {
        ArrangeObjednavkaState(ObjednavkaFaza.VyrobaNeriesene);
        Assume.That(_objednavka.Faza == ObjednavkaFaza.VyrobaNeriesene);

        _objednavka.Invoking(o => o.SetFaza(ObjednavkaFaza.OdoslanieCaka))
            .Should().Throw<DomainValidationException>()
            .WithMessage($"Neplatný prechod z fázy '{ObjednavkaFaza.VyrobaNeriesene}' do fázy '{ObjednavkaFaza.OdoslanieCaka}'.");
    }

    [Test]
    public void SetFaza_AllowsValidTransition_ExampleVyrobaNerieseneToVyrobaCaka()
    {
        ArrangeObjednavkaState(ObjednavkaFaza.VyrobaNeriesene);
        Assume.That(_objednavka.Faza == ObjednavkaFaza.VyrobaNeriesene);
        _objednavka.SetNaplanovanyDatumVyroby(DateTime.Now.AddDays(1));

        Action act = () => _objednavka.SetFaza(ObjednavkaFaza.VyrobaCaka);

        act.Should().NotThrow();
        _objednavka.Faza.Should().Be(ObjednavkaFaza.VyrobaCaka);
    }

    [Test]
    public void SetFaza_AllowsValidTransition_ExampleVyrobaNemoznaToVyrobaNeriesene()
    {
        ArrangeObjednavkaState(ObjednavkaFaza.VyrobaNemozna);
        Assume.That(_objednavka.Faza == ObjednavkaFaza.VyrobaNemozna);

        Action act = () => _objednavka.SetFaza(ObjednavkaFaza.VyrobaNeriesene);

        act.Should().NotThrow();
        _objednavka.Faza.Should().Be(ObjednavkaFaza.VyrobaNeriesene);
    }

    [Test]
    public void SetFaza_Throws_WhenSettingSameFaza()
    {
        ArrangeObjednavkaState(ObjednavkaFaza.VyrobaNeriesene);
        Assume.That(_objednavka.Faza == ObjednavkaFaza.VyrobaNeriesene);

        _objednavka.Invoking(o => o.SetFaza(ObjednavkaFaza.VyrobaNeriesene))
            .Should().Throw<DomainValidationException>()
            .WithMessage("Nemôžete nastaviť rovnakú fázu, v ktorej sa objednávka už nachádza.");
    }

    [Test]
    public void SetFaza_Throws_WhenZrusene()
    {
        ArrangeObjednavkaState(ObjednavkaFaza.NacenenieCaka);
        _objednavka.ZrusObjednavku();
        Assume.That(_objednavka.Zrusene == true);
        var currentFaza = _objednavka.Faza;

        _objednavka.Invoking(o => o.SetFaza(ObjednavkaFaza.VyrobaNeriesene))
            .Should().Throw<DomainValidationException>()
            .WithMessage("Zrušená objednávka nemôže meniť fázu.");
        _objednavka.Faza.Should().Be(currentFaza);
    }

    [Test]
    public void SetFaza_Throws_WhenSettingPlatbaCakaAndAlreadyZaplatene()
    {
        ArrangeObjednavkaState(ObjednavkaFaza.OdoslanieCaka);
        _objednavka.OznacAkoZaplatene();
        Assume.That(_objednavka.Faza == ObjednavkaFaza.OdoslanieCaka);
        Assume.That(_objednavka.Zaplatene == true);

        _objednavka.Invoking(o => o.SetFaza(ObjednavkaFaza.PlatbaCaka))
            .Should().Throw<DomainValidationException>()
            .WithMessage("Nemôžete nastaviť fázu 'PlatbaCaka', keď je objednávka už zaplatená.");
    }

    [Test]
    public void SetFaza_AllowsTransitionOdoslanieCakaToVybavene_WhenZaplatene()
    {
        ArrangeObjednavkaState(ObjednavkaFaza.OdoslanieCaka);
        _objednavka.OznacAkoZaplatene();
        Assume.That(_objednavka.Faza == ObjednavkaFaza.OdoslanieCaka);
        Assume.That(_objednavka.Zaplatene == true);

        Action act = () => _objednavka.SetFaza(ObjednavkaFaza.Vybavene);

        act.Should().NotThrow();
        _objednavka.Faza.Should().Be(ObjednavkaFaza.Vybavene);
    }

    [Test]
    public void SetFaza_Throws_OnInvalidTransitionFromOdoslanieCaka_WhenZaplatene()
    {
        ArrangeObjednavkaState(ObjednavkaFaza.OdoslanieCaka);
        _objednavka.OznacAkoZaplatene();
        Assume.That(_objednavka.Faza == ObjednavkaFaza.OdoslanieCaka);
        Assume.That(_objednavka.Zaplatene == true);

        _objednavka.Invoking(o => o.SetFaza(ObjednavkaFaza.VyrobaCaka))
            .Should().Throw<DomainValidationException>()
            .WithMessage($"Neplatný prechod z fázy '{ObjednavkaFaza.OdoslanieCaka}' do fázy '{ObjednavkaFaza.VyrobaCaka}'.");
    }

    [Test]
    public void SetFaza_AllowsTransitionOdoslanieCakaToPlatbaCaka_WhenNotZaplatene()
    {
        ArrangeObjednavkaState(ObjednavkaFaza.OdoslanieCaka);
        Assume.That(_objednavka.Faza == ObjednavkaFaza.OdoslanieCaka);
        Assume.That(_objednavka.Zaplatene == false);

        Action act = () => _objednavka.SetFaza(ObjednavkaFaza.PlatbaCaka);

        act.Should().NotThrow();
        _objednavka.Faza.Should().Be(ObjednavkaFaza.PlatbaCaka);
    }

    [Test]
    public void SetFaza_Throws_OnInvalidTransitionFromPlatbaCaka()
    {
        ArrangeObjednavkaState(ObjednavkaFaza.PlatbaCaka);
        Assume.That(_objednavka.Faza == ObjednavkaFaza.PlatbaCaka);

        _objednavka.Invoking(o => o.SetFaza(ObjednavkaFaza.OdoslanieCaka))
            .Should().Throw<DomainValidationException>()
            .WithMessage($"Neplatný prechod z fázy '{ObjednavkaFaza.PlatbaCaka}' do fázy '{ObjednavkaFaza.OdoslanieCaka}'.");
    }

    [Test]
    [TestCase(ObjednavkaFaza.Nacenenie)]
    [TestCase(ObjednavkaFaza.NacenenieCaka)]
    public void SetFaza_Throws_WhenSettingNaceneniePhasesDirectlyFromLaterPhase(ObjednavkaFaza targetFaza)
    {
        ArrangeObjednavkaState(ObjednavkaFaza.VyrobaNeriesene);
        Assume.That(_objednavka.Faza == ObjednavkaFaza.VyrobaNeriesene);

        _objednavka.Invoking(o => o.SetFaza(targetFaza))
            .Should().Throw<DomainValidationException>()
            .WithMessage($"Neplatný prechod z fázy '{ObjednavkaFaza.VyrobaNeriesene}' do fázy '{targetFaza}'.");
    }

    [Test]
    [TestCase(ObjednavkaFaza.Nacenenie)]
    [TestCase(ObjednavkaFaza.NacenenieCaka)]
    [TestCase(ObjednavkaFaza.OdoslanieCaka)]
    [TestCase(ObjednavkaFaza.PlatbaCaka)]
    [TestCase(ObjednavkaFaza.Vybavene)]
    public void SetNaplanovanyDatumVyroby_Throws_WhenNotInVyrobaNerieseneOrVyrobaCaka(ObjednavkaFaza invalidFaza)
    {
        if (invalidFaza >= ObjednavkaFaza.NacenenieCaka)
        {
             ArrangeObjednavkaState(invalidFaza);
        }

        Assume.That(_objednavka.Faza == invalidFaza);

        _objednavka.Invoking(o => o.SetNaplanovanyDatumVyroby(DateTime.Now))
            .Should().Throw<DomainValidationException>()
            .WithMessage("Dátum výroby sa dá nastaviť iba vo fázach Vyroba.");
    }

    [Test]
    public void SetNaplanovanyDatumVyroby_SetsDate_DoesNotChangeFaza_WhenInVyrobaNeriesene()
    {
        ArrangeObjednavkaState(ObjednavkaFaza.VyrobaNeriesene);
        Assume.That(_objednavka.Faza == ObjednavkaFaza.VyrobaNeriesene);
        var datumVyroby = DateTime.Now.AddDays(7);

        _objednavka.SetNaplanovanyDatumVyroby(datumVyroby);

        _objednavka.NaplanovanyDatumVyroby.Should().Be(datumVyroby);
        _objednavka.Faza.Should().Be(ObjednavkaFaza.VyrobaNeriesene);
    }

    [Test]
    public void SetNaplanovanyDatumVyroby_UpdatesDate_DoesNotChangeFaza_WhenInVyrobaCaka()
    {
        ArrangeObjednavkaState(ObjednavkaFaza.VyrobaCaka);
        Assume.That(_objednavka.Faza == ObjednavkaFaza.VyrobaCaka);

        var initialDate = _objednavka.NaplanovanyDatumVyroby;
        var newDate = DateTime.Now.AddDays(15);
        Assume.That(initialDate.HasValue);

        _objednavka.SetNaplanovanyDatumVyroby(newDate);

        _objednavka.Faza.Should().Be(ObjednavkaFaza.VyrobaCaka);
        _objednavka.NaplanovanyDatumVyroby.Should().Be(newDate);
        _objednavka.NaplanovanyDatumVyroby.Should().NotBe(initialDate);
    }

    [Test]
    [TestCase(ObjednavkaFaza.VyrobaNeriesene)]
    [TestCase(ObjednavkaFaza.VyrobaCaka)]
    public void SetNaplanovanyDatumVyroby_CanSetToNull_WhenInValidFaza(ObjednavkaFaza validFaza)
    {
        ArrangeObjednavkaState(validFaza);
        Assume.That(_objednavka.Faza == validFaza);
        Assume.That(_objednavka.NaplanovanyDatumVyroby.HasValue);

        _objednavka.SetNaplanovanyDatumVyroby(null);

        _objednavka.Faza.Should().Be(validFaza);
        _objednavka.NaplanovanyDatumVyroby.Should().BeNull();
    }

    [Test]
    public void SetOcakavanyDatumDorucenia_SetsDate_DoesNotChangeFaza()
    {
        var expectedDate = DateTime.Now.AddDays(10).Date;
        var initialFaza = _objednavka.Faza;
        Assume.That(initialFaza == ObjednavkaFaza.Nacenenie);

        _objednavka.SetOcakavanyDatumDorucenia(expectedDate);

        _objednavka.OcakavanyDatumDorucenia.Should().Be(expectedDate);
        _objednavka.Faza.Should().Be(initialFaza);
    }

    [Test]
    public void SetOcakavanyDatumDorucenia_CanSetToNull()
    {
        _objednavka.SetOcakavanyDatumDorucenia(DateTime.Now);
        Assume.That(_objednavka.OcakavanyDatumDorucenia.HasValue);
        var initialFaza = _objednavka.Faza;

        _objednavka.SetOcakavanyDatumDorucenia(null);

        _objednavka.OcakavanyDatumDorucenia.Should().BeNull();
        _objednavka.Faza.Should().Be(initialFaza);
    }

    [Test]
    public void SetPoznamka_SetsCorrectly()
    {
        var note = "Toto je testovacia poznámka.";
        var initialFaza = _objednavka.Faza;

        _objednavka.SetPoznamka(note);

        _objednavka.Poznamka.Should().Be(note);
        _objednavka.Faza.Should().Be(initialFaza);
    }

    [Test]
    public void SetPoznamka_CanSetToNull()
    {
        _objednavka.SetPoznamka("Nejaká poznámka");
        Assume.That(!string.IsNullOrEmpty(_objednavka.Poznamka));
        var initialFaza = _objednavka.Faza;

        _objednavka.SetPoznamka(null);

        _objednavka.Poznamka.Should().BeNull();
        _objednavka.Faza.Should().Be(initialFaza);
    }

    [Test]
    public void SetFaza_NacenenieCakaToNacenenie_Throws_WhenPonukaIsSchvalene()
    {
        ArrangeObjednavkaState(ObjednavkaFaza.VyrobaNeriesene);
        Assume.That(_objednavka.Faza == ObjednavkaFaza.VyrobaNeriesene);
        Assume.That(_objednavka.PoslednaCenovaPonuka is not null);
        Assume.That(_objednavka.PoslednaCenovaPonuka!.Stav == StavCenovejPonuky.Schvalene);

        _objednavka.Invoking(o => o.SetFaza(ObjednavkaFaza.Nacenenie))
            .Should().Throw<DomainValidationException>()
            .WithMessage($"Neplatný prechod z fázy '{ObjednavkaFaza.VyrobaNeriesene}' do fázy '{ObjednavkaFaza.Nacenenie}'.");
    }
}
