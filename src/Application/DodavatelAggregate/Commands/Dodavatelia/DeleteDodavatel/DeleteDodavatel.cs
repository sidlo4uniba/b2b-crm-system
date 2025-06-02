using CRMBackend.Application.Common.Interfaces.Repositories;

namespace CRMBackend.Application.DodavatelAggregate.Commands.Dodavatelia.DeleteDodavatel
{
    public record DeleteDodavatelCommand : IRequest
    {
        public required int Id { get; init; }
    }

    public class DeleteDodavatelCommandHandler : IRequestHandler<DeleteDodavatelCommand>
    {
        private readonly IWriteRepository<Domain.AggregateRoots.DodavatelAggregate.Dodavatel> _repository;
        public DeleteDodavatelCommandHandler(IWriteRepository<Domain.AggregateRoots.DodavatelAggregate.Dodavatel> repository)
        {
            _repository = repository;
        }
        public async Task Handle(DeleteDodavatelCommand request, CancellationToken cancellationToken)
        {
            var dodavatel = await _repository.GetByIdAsync(request.Id, cancellationToken);
            Guard.Against.NotFound(request.Id, dodavatel);
            _repository.Delete(dodavatel);
            await _repository.SaveAsync(cancellationToken);
        }
    }
} 
