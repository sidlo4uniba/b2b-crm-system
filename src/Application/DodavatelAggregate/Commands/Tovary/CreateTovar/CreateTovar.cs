using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Domain.AggregateRoots.KategoriaProduktuAggregate;

namespace CRMBackend.Application.DodavatelAggregate.Commands.Tovary.CreateTovar
{
    public record CreateTovarCommand : IRequest<int>
    {
        public required int DodavatelId { get; init; }
        public required string InterneId { get; init; }
        public required string Nazov { get; init; }
        public required int KategoriaId { get; init; }
        public required decimal Cena { get; init; }
        public string? ObrazokURL { get; init; }
        public string? Ean { get; init; }
        public bool? Aktivny { get; init; }
    }

    public class CreateTovarCommandHandler : IRequestHandler<CreateTovarCommand, int>
    {
        private readonly IWriteRepository<Domain.AggregateRoots.DodavatelAggregate.Dodavatel> _dodavatelRepository;
        private readonly IWriteRepository<KategoriaProduktu> _kategorieRepository;

        public CreateTovarCommandHandler(IWriteRepository<Domain.AggregateRoots.DodavatelAggregate.Dodavatel> dodavatelRepository, IWriteRepository<KategoriaProduktu> kategorieRepository)
        {
            _dodavatelRepository = dodavatelRepository;
            _kategorieRepository = kategorieRepository;
        }

        public async Task<int> Handle(CreateTovarCommand request, CancellationToken cancellationToken)
        {
            var dodavatel = await _dodavatelRepository.GetByIdAsync(request.DodavatelId, cancellationToken);
            Guard.Against.NotFound(request.DodavatelId, dodavatel);
            var kategoria = await _kategorieRepository.GetByIdAsync(request.KategoriaId, cancellationToken);
            Guard.Against.NotFound(request.KategoriaId, kategoria);
            var tovar = new Domain.AggregateRoots.TovarAggregate.Tovar
            {
                Dodavatel = dodavatel,
                InterneId = request.InterneId,
                Nazov = request.Nazov,
                Cena = request.Cena,
                KategoriaId = request.KategoriaId,
                Kategoria = kategoria,
                Aktivny = request.Aktivny ?? true,
            };
            if (request.ObrazokURL is not null)
            {
                tovar.SetObrazok(request.ObrazokURL);
            }
            if (request.Ean is not null)
            {
                tovar.SetEan(request.Ean);
            }
            dodavatel.AddTovar(tovar);

            await _dodavatelRepository.SaveAsync(cancellationToken);
            return tovar.Id;
        }
    }
} 
