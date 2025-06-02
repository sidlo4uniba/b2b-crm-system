using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Ardalis.GuardClauses;
using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Domain.AggregateRoots.ObjednavkaAggregate;
using CRMBackend.Domain.Enums;

namespace CRMBackend.Application.ObjednavkaAggregate.Commands.Objednavky.UpdateObjednavkaChybaKlienta
{
    public record UpdateObjednavkaChybaKlientaCommand : IRequest
    {
        public required int ObjednavkaId { get; init; }
        public ChybaKlienta? ChybaKlienta { get; init; }
    }

    public class UpdateObjednavkaChybaKlientaCommandHandler : IRequestHandler<UpdateObjednavkaChybaKlientaCommand>
    {
        private readonly IWriteRepository<Objednavka> _repository;
        
        public UpdateObjednavkaChybaKlientaCommandHandler(IWriteRepository<Objednavka> repository)
        {
            _repository = repository;
        }
        
        public async Task Handle(UpdateObjednavkaChybaKlientaCommand request, CancellationToken cancellationToken)
        {
            var objednavka = await _repository.GetByIdAsync(request.ObjednavkaId, cancellationToken);
            Guard.Against.NotFound(request.ObjednavkaId, objednavka);
            
            objednavka.SetChybaKlienta(request.ChybaKlienta);
            
            await _repository.SaveAsync(cancellationToken);
        }
    }
} 