using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Domain.AggregateRoots.TovarAggregate;
using CRMBackend.Domain.ValueObjects;

namespace CRMBackend.Application.DodavatelAggregate.Commands.VariantyTovarov.CreateVariantTovar
{
    public record CreateVariantTovarCommand : IRequest<int>
    {
        public required int TovarId { get; init; }
        public string? FarbaHex { get; init; }
        public Velkost? Velkost { get; init; }
        public required decimal Cena { get; init; }
        public string? ObrazokURL { get; init; }
        public bool? Aktivny { get; init; }
    }

    public class CreateVariantTovarCommandHandler : IRequestHandler<CreateVariantTovarCommand, int>
    {
        private readonly IWriteRepository<Domain.AggregateRoots.TovarAggregate.Tovar> _repository;

        public CreateVariantTovarCommandHandler(IWriteRepository<Domain.AggregateRoots.TovarAggregate.Tovar> repository)
        {
            _repository = repository;
        }

        public async Task<int> Handle(CreateVariantTovarCommand request, CancellationToken cancellationToken)
        {
            var tovar = await _repository.GetByIdWithIncludesAsync(
                request.TovarId,
                query => query.Include(t => t.Varianty),
                cancellationToken);
            
            Guard.Against.NotFound(request.TovarId, tovar);

            var variant = new VariantTovar(request.FarbaHex, request.Velkost)
            {
                Tovar = tovar,
                Cena = request.Cena,
                Aktivny = request.Aktivny ?? true,
            };
            variant.SetCena(request.Cena);
            variant.SetObrazok(request.ObrazokURL);
            tovar.AddVariant(variant);

            await _repository.SaveAsync(cancellationToken);
            return variant.Id;
        }
    }
} 
