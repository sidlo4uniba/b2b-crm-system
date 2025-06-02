namespace CRMBackend.Application.ObjednavkaAggregate.Commands.CenovePonuky;

public record CenovaPonukaTovarCommandDto
{
    public int? TovarId { get; init; }
    public int? VariantTovarId { get; init; }
    public required int Mnozstvo { get; init; }
}
