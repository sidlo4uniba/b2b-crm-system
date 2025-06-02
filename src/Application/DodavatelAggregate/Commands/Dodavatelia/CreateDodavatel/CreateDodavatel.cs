using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Domain.ValueObjects;

namespace CRMBackend.Application.DodavatelAggregate.Commands.Dodavatelia.CreateDodavatel
{
    public record CreateDodavatelCommand : IRequest<int>
    {
        public required string NazovFirmy { get; init; }
        public required string Email { get; init; }
        public required string Telefon { get; init; }
        public Adresa? Adresa { get; init; }
        public string? Poznamka { get; init; }
        public bool? Aktivny { get; init; }
    }

    public class CreateDodavatelCommandHandler : IRequestHandler<CreateDodavatelCommand, int>
    {
        private readonly IWriteRepository<Domain.AggregateRoots.DodavatelAggregate.Dodavatel> _repository;
        public CreateDodavatelCommandHandler(IWriteRepository<Domain.AggregateRoots.DodavatelAggregate.Dodavatel> repository)
        {
            _repository = repository;
        }
        public async Task<int> Handle(CreateDodavatelCommand request, CancellationToken cancellationToken)
        {
            var dodavatel = new Domain.AggregateRoots.DodavatelAggregate.Dodavatel
            {
                NazovFirmy = request.NazovFirmy,
                Email = request.Email,
                Telefon = request.Telefon,
                Aktivny = request.Aktivny ?? true
            };
            if (request.Adresa is not null)
            {
                dodavatel.SetAdresa(request.Adresa);
            }
            if (request.Poznamka is not null)
            {
                dodavatel.SetPoznamka(request.Poznamka);
            }
            _repository.Add(dodavatel);
            await _repository.SaveAsync(cancellationToken);
            return dodavatel.Id;
        }
    }
} 
