using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Ardalis.GuardClauses;
using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Domain.AggregateRoots.ObjednavkaAggregate;

namespace CRMBackend.Application.ObjednavkaAggregate.Commands.Objednavky.DeleteObjednavka
{
    public record DeleteObjednavkaCommand : IRequest
    {
        public required int ObjednavkaId { get; init; }
    }

    public class DeleteObjednavkaCommandHandler : IRequestHandler<DeleteObjednavkaCommand>
    {
        private readonly IWriteRepository<Objednavka> _repository;
        public DeleteObjednavkaCommandHandler(IWriteRepository<Objednavka> repository)
        {
            _repository = repository;
        }
        public async Task Handle(DeleteObjednavkaCommand request, CancellationToken cancellationToken)
        {
            var objednavka = await _repository.GetByIdAsync(request.ObjednavkaId, cancellationToken);
            Guard.Against.NotFound(request.ObjednavkaId, objednavka);
            _repository.Delete(objednavka);
            await _repository.SaveAsync(cancellationToken);
        }
    }
} 
