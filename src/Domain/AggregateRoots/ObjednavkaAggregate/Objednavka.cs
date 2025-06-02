using CRMBackend.Domain.AggregateRoots.FirmaAggregate;
using Plainquire.Filter.Abstractions;

namespace CRMBackend.Domain.AggregateRoots.ObjednavkaAggregate;

[EntityFilter(Prefix = "")]
public class Objednavka : BaseAuditableEntity, IAggregateRoot
{
    public required Firma Firma { get; set; }
    public int FirmaId { get; private set; }

    public required KontaktnaOsoba KontaktnaOsoba { get; set; }
    public int KontaktnaOsobaId { get; private set; }

    public ObjednavkaFaza Faza { get; private set; } = ObjednavkaFaza.Nacenenie;

    public string? Poznamka { get; private set; }
    public ChybaKlienta? ChybaKlienta { get; private set; }

    public DateTime? OcakavanyDatumDorucenia { get; private set; }
    
    private DateTime? _naplanovanyDatumVyroby;
    public DateTime? NaplanovanyDatumVyroby
    {
        get => _naplanovanyDatumVyroby;
        set
        {
            if (value == null && Faza == ObjednavkaFaza.VyrobaCaka)
                throw new DomainValidationException("Plánovaný dátum výroby nemožno odstrániť, keď je objednávka vo fáze 'VyrobaCaka'.");
                        
            _naplanovanyDatumVyroby = value?.ToUniversalTime();
        }
    }

    private bool _zrusene;
    public bool Zrusene
    {
        get => _zrusene;
        set
        {
            if (value == true && Faza == ObjednavkaFaza.Vybavene)
                throw new DomainValidationException("Hotovú objednávku nemožno zrušiť.");
            _zrusene = value;
        }
    }

    private bool _zaplatene;
    public bool Zaplatene
    {
        get => _zaplatene;
        set
        {
            if(value == false && _zaplatene == true && Faza == ObjednavkaFaza.Vybavene)
                throw new DomainValidationException("Objednávku nemožno nastaviť ako nezaplatenú, keď je vybavená.");
            _zaplatene = value;
            if (value == true && Faza == ObjednavkaFaza.PlatbaCaka)
                SetFaza(ObjednavkaFaza.Vybavene);
        }
    }
    
    public CenovaPonuka? PoslednaCenovaPonuka { get; private set; }
    public int? PoslednaCenovaPonukaId { get; private set; }

    private readonly List<CenovaPonuka> _cenovePonuky = new();
    public IEnumerable<CenovaPonuka> CenovePonuky => _cenovePonuky.AsReadOnly();

    public void SetChybaKlienta(ChybaKlienta? chybaKlienta)
    {
        if (chybaKlienta.HasValue && ChybaKlienta == null)
        {
            ChybaKlienta = chybaKlienta;
            AddDomainEvent(new ChybaKlientaZaznamenanaEvent(FirmaId, chybaKlienta.Value));
        }
        else
        {
            ChybaKlienta = chybaKlienta;
        }
    }

    public void SetOcakavanyDatumDorucenia(DateTime? datum)
    {
        OcakavanyDatumDorucenia = datum?.ToUniversalTime();
    }

    public void SetPoznamka(string? poznamka)
    {
        Poznamka = poznamka;
    }


    public void AddCenovaPonuka(CenovaPonuka cenovaPonuka)
    {
        if (Faza != ObjednavkaFaza.Nacenenie)
            throw new DomainValidationException("Cenovú ponuku možno pridať iba vo fáze Nacenenie.");
        if (PoslednaCenovaPonuka != null && PoslednaCenovaPonuka.Stav != StavCenovejPonuky.Zrusene)
            throw new DomainValidationException("Nemôžete pridať novú cenovú ponuku, pokiaľ posledná cenová ponuka nie je zrušená.");
        if (cenovaPonuka.Stav != StavCenovejPonuky.Neriesene)
            throw new DomainValidationException("Cenovú ponuku možno pridať iba v stave Neriesene.");
        _cenovePonuky.Add(cenovaPonuka);
        PoslednaCenovaPonuka = cenovaPonuka;
    }
    
    public void UpdateCenovaPonuka(CenovaPonuka cenovaPonuka)
    {
        if (Faza != ObjednavkaFaza.Nacenenie)
            throw new DomainValidationException("Cenovú ponuku možno upraviť iba vo fáze Nacenenie.");
        PoslednaCenovaPonuka = cenovaPonuka;
    }
    

    private void PoslanaCenovaPonuka()
    {
        if (PoslednaCenovaPonuka == null)
            throw new DomainValidationException("Žiadna cenová ponuka na označenie ako poslaná.");
        if (PoslednaCenovaPonuka.Stav != StavCenovejPonuky.Neriesene)
            throw new DomainValidationException("Cenová ponuka musí byť v stave Neriesene, aby sa dala označiť ako poslaná.");
        PoslednaCenovaPonuka.SetStav(StavCenovejPonuky.Poslane);
    }

    private void ZrusCenovuPonuku()
    {
        if (PoslednaCenovaPonuka == null)
            throw new DomainValidationException("Žiadna cenová ponuka na zrušenie.");
        if (PoslednaCenovaPonuka.Stav == StavCenovejPonuky.Schvalene)
            throw new DomainValidationException("Schválenú cenovú ponuku nemožno zrušiť. Musíte vytvoriť novú objednávku a túto zrušiť.");
        if (Faza != ObjednavkaFaza.Nacenenie && Faza != ObjednavkaFaza.NacenenieCaka)
            throw new DomainValidationException("Cenovú ponuku možno zrušiť iba vo fázach Nacenenie alebo NacenenieCaka.");
        PoslednaCenovaPonuka.SetStav(StavCenovejPonuky.Zrusene);
    }

    private void SchvalitCenovuPonuku()
    {
        if (PoslednaCenovaPonuka == null)
            throw new DomainValidationException("Žiadna cenová ponuka na schválenie.");
        if (PoslednaCenovaPonuka.Stav != StavCenovejPonuky.Poslane)
            throw new DomainValidationException("Cenová ponuka musí byť v stave Poslane, aby sa dala schváliť.");
        PoslednaCenovaPonuka.SetStav(StavCenovejPonuky.Schvalene);
    }

    public void SetFaza(ObjednavkaFaza novaFaza)
    {
        if (Faza == novaFaza)
            return;
            
        if (Zrusene)
            throw new DomainValidationException("Zrušená objednávka nemôže meniť fázu.");

        if (novaFaza == ObjednavkaFaza.PlatbaCaka && Zaplatene)
            throw new DomainValidationException("Nemôžete nastaviť fázu 'PlatbaCaka', keď je objednávka už zaplatená.");
        
        if (novaFaza == ObjednavkaFaza.VyrobaCaka && NaplanovanyDatumVyroby == null)
            throw new DomainValidationException("Pre nastavenie fázy 'VyrobaCaka' musí byť nastavený plánovaný dátum výroby.");

        var allowedTransitions = new Dictionary<ObjednavkaFaza, List<ObjednavkaFaza>>
        {
            { ObjednavkaFaza.Nacenenie, [ObjednavkaFaza.NacenenieCaka] },
            { ObjednavkaFaza.NacenenieCaka, [ObjednavkaFaza.Nacenenie, ObjednavkaFaza.VyrobaNeriesene] },
            { ObjednavkaFaza.VyrobaNeriesene, [ObjednavkaFaza.VyrobaNemozna, ObjednavkaFaza.VyrobaCaka] },
            
            // Keď výrobný manažér určí, že výroba je opäť možná po úprave
            // očakávaného dátumu dodania alebo vyriešení technických problémov. Detaily je možné pridať do poznámky.
            { ObjednavkaFaza.VyrobaNemozna, [ObjednavkaFaza.VyrobaNeriesene, ObjednavkaFaza.VyrobaCaka] },

            { ObjednavkaFaza.VyrobaCaka, [ObjednavkaFaza.OdoslanieCaka, ObjednavkaFaza.VyrobaNemozna, ObjednavkaFaza.VyrobaNeriesene] },
            { ObjednavkaFaza.OdoslanieCaka, [ObjednavkaFaza.PlatbaCaka, ObjednavkaFaza.Vybavene, ObjednavkaFaza.VyrobaCaka] },
            { ObjednavkaFaza.PlatbaCaka, [ObjednavkaFaza.Vybavene, ObjednavkaFaza.OdoslanieCaka] },
            { ObjednavkaFaza.Vybavene, [ObjednavkaFaza.PlatbaCaka, ObjednavkaFaza.OdoslanieCaka] }
        };

        if (!allowedTransitions.ContainsKey(Faza) || !allowedTransitions[Faza].Contains(novaFaza))
            throw new DomainValidationException($"Neplatný prechod z fázy '{Faza}' do fázy '{novaFaza}'.");

        switch (Faza)
        {
            case ObjednavkaFaza.NacenenieCaka when novaFaza == ObjednavkaFaza.Nacenenie:
                ZrusCenovuPonuku();
                Faza = ObjednavkaFaza.Nacenenie;
                var novaPonuka = new CenovaPonuka { Objednavka = this };
                AddCenovaPonuka(novaPonuka);
                break;
            case ObjednavkaFaza.NacenenieCaka when novaFaza == ObjednavkaFaza.VyrobaNeriesene:
                SchvalitCenovuPonuku();
                break;
            case ObjednavkaFaza.Nacenenie when novaFaza == ObjednavkaFaza.NacenenieCaka:
                PoslanaCenovaPonuka();
                break;
        }

        if (novaFaza == ObjednavkaFaza.Vybavene && Faza != ObjednavkaFaza.Vybavene)
        {
            AddDomainEvent(new ObjednavkaVybavenaEvent(FirmaId));
        }

        Faza = novaFaza;
    }
} 
