using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Domain.ValueObjects;

namespace CRMBackend.Application.FirmaAggregate.Commands.Firmy.CreateFirma
{
    public record CreateFirmaCommand : IRequest<int>
    {
        public required string Nazov { get; init; }
        public required string ICO { get; init; }
        public required Adresa Adresa { get; init; }
        public string? IcDph { get; init; }
    }

    public class CreateFirmaCommandHandler : IRequestHandler<CreateFirmaCommand, int>
    {
        private readonly IWriteRepository<Domain.AggregateRoots.FirmaAggregate.Firma> _repository;

        public CreateFirmaCommandHandler(IWriteRepository<Domain.AggregateRoots.FirmaAggregate.Firma> repository)
        {
            _repository = repository;
        }

        public async Task<int> Handle(CreateFirmaCommand request, CancellationToken cancellationToken)
        {
            var firma = new Domain.AggregateRoots.FirmaAggregate.Firma
            {
                Nazov = request.Nazov,
                ICO = request.ICO,
                Adresa = request.Adresa
            };
            if (request.IcDph is not null)
            {
                firma.SetIcDph(request.IcDph);
            }
            _repository.Add(firma);
            await _repository.SaveAsync(cancellationToken);
            return firma.Id;
        }
    }
}
