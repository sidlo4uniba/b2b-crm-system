namespace CRMBackend.Domain.Events;
using CRMBackend.Domain.Enums;

public class ChybaKlientaZaznamenanaEvent : BaseEvent
{
    public ChybaKlientaZaznamenanaEvent(int firmaId, ChybaKlienta chybaKlienta)
    {
        FirmaId = firmaId;
        ChybaKlienta = chybaKlienta;
    }

    public int FirmaId { get; }
    public ChybaKlienta ChybaKlienta { get; }
} 