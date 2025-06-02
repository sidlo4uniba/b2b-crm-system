using CRMBackend.Application.Common.Interfaces.Repositories;

namespace CRMBackend.Application.FirmaAggregate.Commands.KontaktneOsoby.DeleteKontaktnaOsoba
{
    public record DeleteKontaktnaOsobaCommand : IRequest
    {
        public required int FirmaId { get; init; }
        public required int KontaktnaOsobaId { get; init; }
    }

    public class DeleteKontaktnaOsobaCommandHandler : IRequestHandler<DeleteKontaktnaOsobaCommand>
    {
        private readonly IWriteRepository<Domain.AggregateRoots.FirmaAggregate.Firma> _repository;

        public DeleteKontaktnaOsobaCommandHandler(IWriteRepository<Domain.AggregateRoots.FirmaAggregate.Firma> repository)
        {
            _repository = repository;
        }

        public async Task Handle(DeleteKontaktnaOsobaCommand request, CancellationToken cancellationToken)
        {
            var firma = await _repository.GetByIdWithIncludesAsync(
                request.FirmaId,
                query => query.Include(f => f.KontaktneOsoby.Where(o => o.Id == request.KontaktnaOsobaId)),
                cancellationToken);
            Guard.Against.NotFound(request.FirmaId, firma);

            var kontaktnaOsoba = firma.KontaktneOsoby.FirstOrDefault();
            Guard.Against.NotFound(request.KontaktnaOsobaId, kontaktnaOsoba);
            
            firma.RemoveKontaktnaOsoba(request.KontaktnaOsobaId);

            await _repository.SaveAsync(cancellationToken);
        }
    }
} 
