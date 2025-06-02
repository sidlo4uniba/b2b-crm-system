using CRMBackend.Application.Common.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CRMBackend.Application.DodavatelAggregate.Commands.Tovary.UpdateTovarAktivny
{
    public record UpdateTovarAktivnyCommand : IRequest
    {
        public required int DodavatelId { get; init; }
        public required int TovarId { get; init; }
        public required bool Aktivny { get; init; }
    }

    public class UpdateTovarAktivnyCommandHandler : IRequestHandler<UpdateTovarAktivnyCommand>
    {
        private readonly IWriteRepository<Domain.AggregateRoots.DodavatelAggregate.Dodavatel> _dodavatelRepository;

        public UpdateTovarAktivnyCommandHandler(IWriteRepository<Domain.AggregateRoots.DodavatelAggregate.Dodavatel> dodavatelRepository)
        {
            _dodavatelRepository = dodavatelRepository;
        }

        public async Task Handle(UpdateTovarAktivnyCommand request, CancellationToken cancellationToken)
        {
            var dodavatel = await _dodavatelRepository.GetByIdWithIncludesAsync(
                request.DodavatelId,
                query => query
                    .Include(d => d.Tovary.Where(t => t.Id == request.TovarId))
                    .ThenInclude(t => t.Varianty),
                cancellationToken);

            Guard.Against.NotFound(request.DodavatelId, dodavatel);

            var tovar = dodavatel.Tovary.FirstOrDefault();
            Guard.Against.NotFound(request.TovarId, tovar);

            tovar.Aktivny = request.Aktivny;

            await _dodavatelRepository.SaveAsync(cancellationToken);
        }
    }
} 
