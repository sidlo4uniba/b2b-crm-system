namespace CRMBackend.Domain.Events;

public class ObjednavkaVybavenaEvent : BaseEvent
{
    public ObjednavkaVybavenaEvent(int firmaId)
    {
        FirmaId = firmaId;
    }

    public int FirmaId { get; }
} 