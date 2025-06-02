using System;
using System.Threading;
using System.Threading.Tasks;
using Ardalis.GuardClauses;
using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Domain.AggregateRoots.ObjednavkaAggregate;
using MediatR;

namespace CRMBackend.Application.ObjednavkaAggregate.Commands.Objednavky.UpdateObjednavkaOcakavanyDatumDorucenia
{
    public record UpdateObjednavkaOcakavanyDatumDoruceniaCommand : IRequest
    {
        public required int ObjednavkaId { get; init; }
        public DateTime? OcakavanyDatumDorucenia { get; init; }
    }

    public class UpdateObjednavkaOcakavanyDatumDoruceniaCommandHandler : IRequestHandler<UpdateObjednavkaOcakavanyDatumDoruceniaCommand>
    {
        private readonly IWriteRepository<Objednavka> _objednavkaRepository;

        public UpdateObjednavkaOcakavanyDatumDoruceniaCommandHandler(IWriteRepository<Objednavka> objednavkaRepository)
        {
            _objednavkaRepository = objednavkaRepository;
        }

        public async Task Handle(UpdateObjednavkaOcakavanyDatumDoruceniaCommand request, CancellationToken cancellationToken)
        {
            var objednavka = await _objednavkaRepository.GetByIdAsync(request.ObjednavkaId, cancellationToken);
            Guard.Against.NotFound(request.ObjednavkaId, objednavka);

            objednavka.SetOcakavanyDatumDorucenia(request.OcakavanyDatumDorucenia);


            await _objednavkaRepository.SaveAsync(cancellationToken);
        }
    }
} 
