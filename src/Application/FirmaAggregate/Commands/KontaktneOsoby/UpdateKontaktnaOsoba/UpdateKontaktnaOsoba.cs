using CRMBackend.Application.Common.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CRMBackend.Application.FirmaAggregate.Commands.KontaktneOsoby.UpdateKontaktnaOsoba
{
    public record UpdateKontaktnaOsobaCommand : IRequest
    {
        public required int FirmaId { get; init; }
        public required int KontaktnaOsobaId { get; init; }
        public required string Meno { get; init; }
        public required string Priezvisko { get; init; }
        public required string Telefon { get; init; }
        public required string Email { get; init; }
    }

    public class UpdateKontaktnaOsobaCommandHandler : IRequestHandler<UpdateKontaktnaOsobaCommand>
    {
        private readonly IWriteRepository<Domain.AggregateRoots.FirmaAggregate.Firma> _repository;

        public UpdateKontaktnaOsobaCommandHandler(IWriteRepository<Domain.AggregateRoots.FirmaAggregate.Firma> repository)
        {
            _repository = repository;
        }

        public async Task Handle(UpdateKontaktnaOsobaCommand request, CancellationToken cancellationToken)
        {
            var firma = await _repository.GetByIdWithIncludesAsync(
                request.FirmaId,
                query => query.Include(f => f.KontaktneOsoby.Where(o => o.Id == request.KontaktnaOsobaId)),
                cancellationToken);
            Guard.Against.NotFound(request.FirmaId, firma);

            var kontaktnaOsoba = firma.KontaktneOsoby.FirstOrDefault();
            Guard.Against.NotFound(request.KontaktnaOsobaId, kontaktnaOsoba);

            kontaktnaOsoba.Meno = request.Meno;
            kontaktnaOsoba.Priezvisko = request.Priezvisko;
            kontaktnaOsoba.Telefon = request.Telefon;
            kontaktnaOsoba.Email = request.Email;

            await _repository.SaveAsync(cancellationToken);
        }
    }
} 
