using CRMBackend.Application.Common.Interfaces.Repositories;

namespace CRMBackend.Application.FirmaAggregate.Commands.KontaktneOsoby.CreateKontaktnaOsoba
{
    public record CreateKontaktnaOsobaCommand : IRequest<int>
    {
        public required int FirmaId { get; init; }
        public required string Meno { get; init; }
        public required string Priezvisko { get; init; }
        public required string Telefon { get; init; }
        public required string Email { get; init; }
        public bool? Aktivny { get; init; }
    }

    public class CreateKontaktnaOsobaCommandHandler : IRequestHandler<CreateKontaktnaOsobaCommand, int>
    {
        private readonly IWriteRepository<Domain.AggregateRoots.FirmaAggregate.Firma> _repository;

        public CreateKontaktnaOsobaCommandHandler(IWriteRepository<Domain.AggregateRoots.FirmaAggregate.Firma> repository)
        {
            _repository = repository;
        }

        public async Task<int> Handle(CreateKontaktnaOsobaCommand request, CancellationToken cancellationToken)
        {
            var firma = await _repository.GetByIdAsync(request.FirmaId, cancellationToken);
            Guard.Against.NotFound(request.FirmaId, firma);
            var kontaktnaOsoba = new Domain.AggregateRoots.FirmaAggregate.KontaktnaOsoba
            {
                Meno = request.Meno,
                Priezvisko = request.Priezvisko,
                Telefon = request.Telefon,
                Email = request.Email,
                Aktivny = request.Aktivny ?? true,
            };
            firma.AddKontaktnaOsoba(kontaktnaOsoba);

            await _repository.SaveAsync(cancellationToken);
            return kontaktnaOsoba.Id;
        }
    }
} 
