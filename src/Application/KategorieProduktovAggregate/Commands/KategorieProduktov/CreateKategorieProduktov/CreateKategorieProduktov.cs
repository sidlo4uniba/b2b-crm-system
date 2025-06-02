using Ardalis.GuardClauses;
using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Domain.AggregateRoots.KategoriaProduktuAggregate;
using MediatR;

namespace CRMBackend.Application.KategorieProduktovAggregate.Commands.KategorieProduktov.CreateKategorieProduktov;

public record CreateKategorieProduktovCommand : IRequest<int>
{
    public required string Nazov { get; init; }
}

public class CreateKategorieProduktovCommandHandler : IRequestHandler<CreateKategorieProduktovCommand, int>
{
    private readonly IWriteRepository<KategoriaProduktu> _repository;

    public CreateKategorieProduktovCommandHandler(IWriteRepository<KategoriaProduktu> repository)
    {
        _repository = repository;
    }

    public async Task<int> Handle(CreateKategorieProduktovCommand request, CancellationToken cancellationToken)
    {
        var kategorieProduktov = new KategoriaProduktu
        {
            Nazov = request.Nazov
        };

        _repository.Add(kategorieProduktov);
        await _repository.SaveAsync(cancellationToken);

        return kategorieProduktov.Id;
    }
} 
