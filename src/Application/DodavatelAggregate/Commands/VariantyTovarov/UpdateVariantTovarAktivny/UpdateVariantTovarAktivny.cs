using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Domain.AggregateRoots.TovarAggregate;

namespace CRMBackend.Application.DodavatelAggregate.Commands.VariantyTovarov.UpdateVariantTovarAktivny
{
    public record UpdateVariantTovarAktivnyCommand : IRequest
    {
        public required int TovarId { get; init; }
        public required int VariantId { get; init; }
        public required bool Aktivny { get; init; }
    }

    public class UpdateVariantTovarAktivnyCommandHandler : IRequestHandler<UpdateVariantTovarAktivnyCommand>
    {
        private readonly IWriteRepository<Tovar> _repository;

        public UpdateVariantTovarAktivnyCommandHandler(IWriteRepository<Tovar> repository)
        {
            _repository = repository;
        }

        public async Task Handle(UpdateVariantTovarAktivnyCommand request, CancellationToken cancellationToken)
        {
            var tovar = await _repository.GetByIdWithIncludesAsync(
                request.TovarId,
                query => query.Include(t => t.Varianty.Where(v => v.Id == request.VariantId)),
                cancellationToken);

            Guard.Against.NotFound(request.TovarId, tovar);

            var variant = tovar.Varianty.FirstOrDefault();
            Guard.Against.NotFound(request.VariantId, variant);
            
            variant.Aktivny = request.Aktivny;

            await _repository.SaveAsync(cancellationToken);
        }
    }
} 
