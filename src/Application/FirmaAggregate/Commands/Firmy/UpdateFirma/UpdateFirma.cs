using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Domain.ValueObjects;

namespace CRMBackend.Application.FirmaAggregate.Commands.Firmy.UpdateFirma
{
    public record UpdateFirmaCommand : IRequest
    {
        public required int Id { get; init; }
        public required string Nazov { get; init; }
        public required string ICO { get; init; }
        public required Adresa Adresa { get; init; }
        public string? IcDph { get; init; }
    }

    public class UpdateFirmaCommandHandler : IRequestHandler<UpdateFirmaCommand>
    {
        private readonly IWriteRepository<Domain.AggregateRoots.FirmaAggregate.Firma> _repository;

        public UpdateFirmaCommandHandler(IWriteRepository<Domain.AggregateRoots.FirmaAggregate.Firma> repository)
        {
            _repository = repository;
        }

        public async Task Handle(UpdateFirmaCommand request, CancellationToken cancellationToken)
        {
            var firma = await _repository.GetByIdAsync(request.Id, cancellationToken);
            Guard.Against.NotFound(request.Id, firma);
            firma.Nazov = request.Nazov;
            firma.ICO = request.ICO;
            firma.Adresa = request.Adresa;
            firma.SetIcDph(request.IcDph);

            await _repository.SaveAsync(cancellationToken);
        }
    }
}
