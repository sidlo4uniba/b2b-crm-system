using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Ardalis.GuardClauses;
using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Domain.AggregateRoots.ObjednavkaAggregate;
using CRMBackend.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CRMBackend.Application.ObjednavkaAggregate.Commands.Objednavky.UpdateObjednavkaFaza
{
    public record UpdateObjednavkaFazaCommand : IRequest
    {
        public required int ObjednavkaId { get; init; }
        public required ObjednavkaFaza Faza { get; init; }
    }

    public class UpdateObjednavkaFazaCommandHandler : IRequestHandler<UpdateObjednavkaFazaCommand>
    {
        private readonly IWriteRepository<Objednavka> _repository;
        public UpdateObjednavkaFazaCommandHandler(IWriteRepository<Objednavka> repository)
        {
            _repository = repository;
        }
        public async Task Handle(UpdateObjednavkaFazaCommand request, CancellationToken cancellationToken)
        {
            var objednavka = await _repository.GetByIdWithIncludesAsync(
                request.ObjednavkaId,
                query => query.Include(o => o.PoslednaCenovaPonuka),
                cancellationToken);

            Guard.Against.NotFound(request.ObjednavkaId, objednavka);

            objednavka.SetFaza(request.Faza);

            await _repository.SaveAsync(cancellationToken);
        }
    }
} 
