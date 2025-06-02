using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Domain.AggregateRoots.DodavatelAggregate;
using CRMBackend.Domain.AggregateRoots.KategoriaProduktuAggregate;
using Microsoft.EntityFrameworkCore;

namespace CRMBackend.Application.DodavatelAggregate.Commands.Tovary.UpdateTovar
{
    public record UpdateTovarCommand : IRequest
    {
        public required int DodavatelId { get; init; }
        public required int TovarId { get; init; }
        public required string InterneId { get; init; }
        public required string Nazov { get; init; }
        public required int KategoriaId { get; init; }
        public required decimal Cena { get; init; }
        public string? ObrazokURL { get; init; }
        public string? Ean { get; init; }
    }

    public class UpdateTovarCommandHandler : IRequestHandler<UpdateTovarCommand>
    {
        private readonly IWriteRepository<Domain.AggregateRoots.DodavatelAggregate.Dodavatel> _dodavatelRepository;
        private readonly IWriteRepository<KategoriaProduktu> _kategorieRepository;

        public UpdateTovarCommandHandler(IWriteRepository<Domain.AggregateRoots.DodavatelAggregate.Dodavatel> dodavatelRepository, IWriteRepository<KategoriaProduktu> kategorieRepository)
        {
            _dodavatelRepository = dodavatelRepository;
            _kategorieRepository = kategorieRepository;
        }

        public async Task Handle(UpdateTovarCommand request, CancellationToken cancellationToken)
        {
            var dodavatel = await _dodavatelRepository.GetByIdWithIncludesAsync(
                request.DodavatelId,
                query => query.Include(d => d.Tovary.Where(t => t.Id == request.TovarId)),
                cancellationToken);

            Guard.Against.NotFound(request.DodavatelId, dodavatel);

            var tovar = dodavatel.Tovary.FirstOrDefault();
            Guard.Against.NotFound(request.TovarId, tovar, $"Tovar with Id {request.TovarId} not found for Dodavatel {request.DodavatelId}.");
            tovar.InterneId = request.InterneId;
            tovar.Nazov = request.Nazov;
            tovar.Cena = request.Cena;
            if (tovar.KategoriaId != request.KategoriaId)
            {
                var kategoria = await _kategorieRepository.GetByIdAsync(request.KategoriaId, cancellationToken);
                Guard.Against.NotFound(request.KategoriaId, kategoria);
                tovar.Kategoria = kategoria;
            }
            tovar.SetObrazok(request.ObrazokURL);
            tovar.SetEan(request.Ean);

            await _dodavatelRepository.SaveAsync(cancellationToken);
        }
    }
} 
