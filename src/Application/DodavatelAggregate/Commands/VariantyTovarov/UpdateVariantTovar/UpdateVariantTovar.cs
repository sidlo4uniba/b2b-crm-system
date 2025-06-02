using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Domain.AggregateRoots.TovarAggregate;
using CRMBackend.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace CRMBackend.Application.DodavatelAggregate.Commands.VariantyTovarov.UpdateVariantTovar
{
    public record UpdateVariantTovarCommand : IRequest
    {
        public required int TovarId { get; init; }
        public required int VariantId { get; init; }
        public string? FarbaHex { get; init; }
        public Velkost? Velkost { get; init; }
        public required decimal Cena { get; init; }
        public string? ObrazokURL { get; init; }
    }

    public class UpdateVariantTovarCommandHandler : IRequestHandler<UpdateVariantTovarCommand>
    {
        private readonly IWriteRepository<Tovar> _repository;

        public UpdateVariantTovarCommandHandler(IWriteRepository<Tovar> repository)
        {
            _repository = repository;
        }

        public async Task Handle(UpdateVariantTovarCommand request, CancellationToken cancellationToken)
        {
            var tovar = await _repository.GetByIdWithIncludesAsync(
                request.TovarId,
                query => query.Include(t => t.Varianty),
                cancellationToken);

            Guard.Against.NotFound(request.TovarId, tovar);

            var variant = tovar.Varianty.FirstOrDefault();
            Guard.Against.NotFound(request.VariantId, variant);
    
            variant.SetFarbaVelkost(request.FarbaHex, request.Velkost);
            variant.SetCena(request.Cena);
            variant.SetObrazok(request.ObrazokURL);

            await _repository.SaveAsync(cancellationToken);
        }
    }
} 
