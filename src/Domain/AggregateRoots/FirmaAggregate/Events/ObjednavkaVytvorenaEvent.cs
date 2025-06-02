namespace CRMBackend.Domain.Events;

public class ObjednavkaVytvorenaEvent : BaseEvent
{
    public ObjednavkaVytvorenaEvent(int firmaId, DateTime datumVytvorenia)
    {
        FirmaId = firmaId;
        DatumVytvorenia = datumVytvorenia;
    }

    public int FirmaId { get; }
    public DateTime DatumVytvorenia { get; }
} 
