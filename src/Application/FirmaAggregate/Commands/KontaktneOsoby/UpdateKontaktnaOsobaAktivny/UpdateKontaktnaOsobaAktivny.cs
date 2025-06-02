using CRMBackend.Application.Common.Interfaces.Repositories;

namespace CRMBackend.Application.FirmaAggregate.Commands.KontaktneOsoby.UpdateKontaktnaOsobaAktivny
{
    public record UpdateKontaktnaOsobaAktivnyCommand : IRequest
    {
        public required int FirmaId { get; init; }
        public required int KontaktnaOsobaId { get; init; }
        public required bool Aktivny { get; init; }
    }

    public class UpdateKontaktnaOsobaAktivnyCommandHandler : IRequestHandler<UpdateKontaktnaOsobaAktivnyCommand>
    {
        private readonly IWriteRepository<Domain.AggregateRoots.FirmaAggregate.Firma> _repository;

        public UpdateKontaktnaOsobaAktivnyCommandHandler(IWriteRepository<Domain.AggregateRoots.FirmaAggregate.Firma> repository)
        {
            _repository = repository;
        }

        public async Task Handle(UpdateKontaktnaOsobaAktivnyCommand request, CancellationToken cancellationToken)
        {
            var firma = await _repository.GetByIdWithIncludesAsync(
                request.FirmaId,
                query => query.Include(f => f.KontaktneOsoby.Where(o => o.Id == request.KontaktnaOsobaId)),
                cancellationToken);
            Guard.Against.NotFound(request.FirmaId, firma);
            
            var kontaktnaOsoba = firma.KontaktneOsoby.FirstOrDefault(o => o.Id == request.KontaktnaOsobaId);
            Guard.Against.NotFound(request.KontaktnaOsobaId, kontaktnaOsoba);
            
            kontaktnaOsoba.Aktivny = request.Aktivny;

            await _repository.SaveAsync(cancellationToken);
        }
    }
} 
