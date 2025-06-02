using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Domain.AggregateRoots.FirmaAggregate;
using CRMBackend.Domain.AggregateRoots.ObjednavkaAggregate;
using FluentValidation.Results;
using ValidationException = CRMBackend.Application.Common.Exceptions.ValidationException;

namespace CRMBackend.Application.ObjednavkaAggregate.Commands.Objednavky.PatchObjednavka
{
    public record PatchObjednavkaCommand : IRequest
    {
        public required int ObjednavkaId { get; init; }
        public int? KontaktnaOsobaId { get; init; }
        public bool? Zaplatene { get; init; }
        public bool? Zrusene { get; init; }
        public string? Poznamka { get; init; }
    }

    public class PatchObjednavkaCommandHandler : IRequestHandler<PatchObjednavkaCommand>
    {
        private readonly IWriteRepository<Objednavka> _objednavkaRepository;
        private readonly IReadRepository<KontaktnaOsoba> _kontaktnaOsobaRepository;

        public PatchObjednavkaCommandHandler(
            IWriteRepository<Objednavka> objednavkaRepository,
            IReadRepository<KontaktnaOsoba> kontaktnaOsobaRepository)
        {
            _objednavkaRepository = objednavkaRepository;
            _kontaktnaOsobaRepository = kontaktnaOsobaRepository;
        }
        public async Task Handle(PatchObjednavkaCommand request, CancellationToken cancellationToken)
        {
            var objednavka = await _objednavkaRepository.GetByIdAsync(request.ObjednavkaId, cancellationToken);
            Guard.Against.NotFound(request.ObjednavkaId, objednavka);

            if (request.KontaktnaOsobaId.HasValue)
            {
                var kontaktnaOsoba = await _kontaktnaOsobaRepository
                    .GetQueryableNoTracking()
                    .Where(o => o.Id == request.KontaktnaOsobaId.Value)
                    .FirstOrDefaultAsync(cancellationToken);
                Guard.Against.NotFound(request.KontaktnaOsobaId.Value, kontaktnaOsoba);
                if (kontaktnaOsoba.FirmaId != objednavka.FirmaId)
                {
                    var failure = new ValidationFailure(nameof(request.KontaktnaOsobaId), "Vybraná kontaktná osoba nepatrí firme danej objednávky.");
                    throw new ValidationException(new List<ValidationFailure> { failure });
                }
                objednavka.KontaktnaOsoba = kontaktnaOsoba;
            }

            if (request.Zaplatene.HasValue)
            {
                objednavka.Zaplatene = request.Zaplatene.Value;
            }

            if (request.Zrusene.HasValue)
            {
                objednavka.Zrusene = request.Zrusene.Value;
            }

            if (request.Poznamka is not null)
            {
                objednavka.SetPoznamka(request.Poznamka);
            }

            await _objednavkaRepository.SaveAsync(cancellationToken);
        }
    }
} 
