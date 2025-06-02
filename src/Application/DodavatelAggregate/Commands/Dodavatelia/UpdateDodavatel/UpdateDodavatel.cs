using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Domain.ValueObjects;

namespace CRMBackend.Application.DodavatelAggregate.Commands.Dodavatelia.UpdateDodavatel
{
    public record UpdateDodavatelCommand : IRequest
    {
        public required int Id { get; init; }
        public required string NazovFirmy { get; init; }
        public required string Email { get; init; }
        public required string Telefon { get; init; }
        public Adresa? Adresa { get; init; }
        public string? Poznamka { get; init; }
    }

    public class UpdateDodavatelCommandHandler : IRequestHandler<UpdateDodavatelCommand>
    {
        private readonly IWriteRepository<Domain.AggregateRoots.DodavatelAggregate.Dodavatel> _repository;
        public UpdateDodavatelCommandHandler(IWriteRepository<Domain.AggregateRoots.DodavatelAggregate.Dodavatel> repository)
        {
            _repository = repository;
        }
        public async Task Handle(UpdateDodavatelCommand request, CancellationToken cancellationToken)
        {
            var dodavatel = await _repository.GetByIdAsync(request.Id, cancellationToken);
            Guard.Against.NotFound(request.Id, dodavatel);
            dodavatel.NazovFirmy = request.NazovFirmy;
            dodavatel.Email = request.Email;
            dodavatel.Telefon = request.Telefon;
            dodavatel.SetAdresa(request.Adresa);
            dodavatel.SetPoznamka(request.Poznamka);

            await _repository.SaveAsync(cancellationToken);
        }
    }
} 
