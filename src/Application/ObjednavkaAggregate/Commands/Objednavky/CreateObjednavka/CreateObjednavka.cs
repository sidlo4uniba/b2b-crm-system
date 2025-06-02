using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Ardalis.GuardClauses;
using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Domain.AggregateRoots.ObjednavkaAggregate;
using CRMBackend.Domain.AggregateRoots.FirmaAggregate;
using Microsoft.EntityFrameworkCore;

namespace CRMBackend.Application.ObjednavkaAggregate.Commands.Objednavky.CreateObjednavka
{
    public record CreateObjednavkaCommand : IRequest<int>
    {
        public required int FirmaId { get; init; }
        public required int KontaktnaOsobaId { get; init; }        
    }

    public class CreateObjednavkaCommandHandler : IRequestHandler<CreateObjednavkaCommand, int>
    {
        private readonly IWriteRepository<Objednavka> _repository;
        private readonly IWriteRepository<Firma> _firmaRepository;

        public CreateObjednavkaCommandHandler(
            IWriteRepository<Objednavka> repository,
            IWriteRepository<Firma> firmaRepository)
        {
            _repository = repository;
            _firmaRepository = firmaRepository;
        }

        public async Task<int> Handle(CreateObjednavkaCommand request, CancellationToken cancellationToken)
        {
            var firma = await _firmaRepository.GetByIdWithIncludesAsync(
                request.FirmaId, 
                query => query.Include(f => f.KontaktneOsoby), 
                cancellationToken);
            
            Guard.Against.NotFound(request.FirmaId, firma);

            var kontaktnaOsoba = firma.KontaktneOsoby.FirstOrDefault(o => o.Id == request.KontaktnaOsobaId);
            Guard.Against.NotFound(request.KontaktnaOsobaId, kontaktnaOsoba);

            var objednavka = new Objednavka
            {
                Firma = firma,
                KontaktnaOsoba = kontaktnaOsoba
            };

            _repository.Add(objednavka);
            await _repository.SaveAsync(cancellationToken);

            var initialPonuka = new CenovaPonuka { Objednavka = objednavka };
            objednavka.AddCenovaPonuka(initialPonuka);

            await _repository.SaveAsync(cancellationToken);

            return objednavka.Id;
        }
    }
} 
