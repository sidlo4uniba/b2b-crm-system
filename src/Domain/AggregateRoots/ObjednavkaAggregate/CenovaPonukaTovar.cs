using CRMBackend.Domain.AggregateRoots.TovarAggregate;
using Plainquire.Filter.Abstractions;

namespace CRMBackend.Domain.AggregateRoots.ObjednavkaAggregate;

[EntityFilter(Prefix = "")]
public class CenovaPonukaTovar : BaseEntity
{
    public int CenovaPonukaId { get; private set; }
    public CenovaPonuka CenovaPonuka { get; set; } = null!;
    public Tovar? Tovar { get; private set; }
    public int? TovarId { get; private set; }
    public VariantTovar? VariantTovar { get; private set; }
    public int? VariantTovarId { get; private set; }
    public bool JeVariantTovaru => VariantTovarId.HasValue;
    public required int Mnozstvo
    {
        get => _mnozstvo;
        set
        {
            if (value <= 0)
                throw new DomainValidationException("Množstvo musí byť väčšie ako 0.");
            _mnozstvo = value;
        }
    }
    private int _mnozstvo;
    public decimal PovodnaCena { get; private set; }

    // Private parameterless constructor for EF Core
    private CenovaPonukaTovar() { }

    public CenovaPonukaTovar(Tovar tovar, VariantTovar? variantTovar = null)
    {
        if (variantTovar != null && variantTovar.TovarId != tovar.Id)
            throw new DomainValidationException("Variant tovaru nepatrí k zadanému tovaru.");

        Tovar = tovar;
        TovarId = tovar.Id;
        VariantTovar = variantTovar;
        VariantTovarId = variantTovar?.Id;
    }

    public void SetPovodnaCena(decimal cena)
    {
        if (cena < 0)
            throw new DomainValidationException("Pôvodná cena nemôže byť záporná.");
        PovodnaCena = cena;
    }
}
