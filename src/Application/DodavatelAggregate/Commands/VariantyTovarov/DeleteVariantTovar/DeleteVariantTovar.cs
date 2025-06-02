using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Domain.AggregateRoots.TovarAggregate;

namespace CRMBackend.Application.DodavatelAggregate.Commands.VariantyTovarov.DeleteVariantTovar
{
    public record DeleteVariantTovarCommand : IRequest
    {
        public required int TovarId { get; init; }
        public required int VariantId { get; init; }
    }

    public class DeleteVariantTovarCommandHandler : IRequestHandler<DeleteVariantTovarCommand>
    {
        private readonly IWriteRepository<Tovar> _repository;

        public DeleteVariantTovarCommandHandler(IWriteRepository<Tovar> repository)
        {
            _repository = repository;
        }

        public async Task Handle(DeleteVariantTovarCommand request, CancellationToken cancellationToken)
        {
            var tovar = await _repository.GetByIdWithIncludesAsync(
                request.TovarId,
                query => query.Include(t => t.Varianty.Where(v => v.Id == request.VariantId)),
                cancellationToken);
                
            Guard.Against.NotFound(request.TovarId, tovar);
            
            var variant = tovar.Varianty.FirstOrDefault(v => v.Id == request.VariantId);
            Guard.Against.NotFound(request.VariantId, variant);
            
            tovar.RemoveVariant(request.VariantId);

            await _repository.SaveAsync(cancellationToken);
        }
    }
} 
