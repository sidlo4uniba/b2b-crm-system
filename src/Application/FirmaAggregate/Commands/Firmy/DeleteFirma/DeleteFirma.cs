using CRMBackend.Application.Common.Interfaces.Repositories;

namespace CRMBackend.Application.FirmaAggregate.Commands.Firmy.DeleteFirma
{
    public record DeleteFirmaCommand : IRequest
    {
        public required int Id { get; init; }
    }

    public class DeleteFirmaCommandHandler : IRequestHandler<DeleteFirmaCommand>
    {
        private readonly IWriteRepository<Domain.AggregateRoots.FirmaAggregate.Firma> _repository;

        public DeleteFirmaCommandHandler(IWriteRepository<Domain.AggregateRoots.FirmaAggregate.Firma> repository)
        {
            _repository = repository;
        }

        public async Task Handle(DeleteFirmaCommand request, CancellationToken cancellationToken)
        {
            var firma = await _repository.GetByIdAsync(request.Id, cancellationToken);
            Guard.Against.NotFound(request.Id, firma);
            _repository.Delete(firma);
            await _repository.SaveAsync(cancellationToken);
        }
    }
} 
