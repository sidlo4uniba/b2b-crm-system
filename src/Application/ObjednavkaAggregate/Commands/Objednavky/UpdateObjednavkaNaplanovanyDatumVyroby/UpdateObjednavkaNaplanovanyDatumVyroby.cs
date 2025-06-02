using System;
using System.Threading;
using System.Threading.Tasks;
using Ardalis.GuardClauses;
using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Domain.AggregateRoots.ObjednavkaAggregate;
using MediatR;

namespace CRMBackend.Application.ObjednavkaAggregate.Commands.Objednavky.UpdateObjednavkaNaplanovanyDatumVyroby
{
    public record UpdateObjednavkaNaplanovanyDatumVyrobyCommand : IRequest
    {
        public required int ObjednavkaId { get; init; }
        public DateTime? NaplanovanyDatumVyroby { get; init; }
    }

    public class UpdateObjednavkaNaplanovanyDatumVyrobyCommandHandler : IRequestHandler<UpdateObjednavkaNaplanovanyDatumVyrobyCommand>
    {
        private readonly IWriteRepository<Objednavka> _objednavkaRepository;

        public UpdateObjednavkaNaplanovanyDatumVyrobyCommandHandler(IWriteRepository<Objednavka> objednavkaRepository)
        {
            _objednavkaRepository = objednavkaRepository;
        }

        public async Task Handle(UpdateObjednavkaNaplanovanyDatumVyrobyCommand request, CancellationToken cancellationToken)
        {
            var objednavka = await _objednavkaRepository.GetByIdAsync(request.ObjednavkaId, cancellationToken);
            Guard.Against.NotFound(request.ObjednavkaId, objednavka);

            objednavka.NaplanovanyDatumVyroby = request.NaplanovanyDatumVyroby;


            await _objednavkaRepository.SaveAsync(cancellationToken);
        }
    }
} 
