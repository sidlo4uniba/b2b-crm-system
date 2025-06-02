using Ardalis.GuardClauses;
using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Domain.AggregateRoots.KategoriaProduktuAggregate;
using MediatR;

namespace CRMBackend.Application.KategorieProduktovAggregate.Commands.KategorieProduktov.UpdateKategorieProduktov;

public record UpdateKategorieProduktovCommand : IRequest
{
    public required int Id { get; init; }
    public required string Nazov { get; init; }
}

public class UpdateKategorieProduktovCommandHandler : IRequestHandler<UpdateKategorieProduktovCommand>
{
    private readonly IWriteRepository<KategoriaProduktu> _repository;

    public UpdateKategorieProduktovCommandHandler(IWriteRepository<KategoriaProduktu> repository)
    {
        _repository = repository;
    }

    public async Task Handle(UpdateKategorieProduktovCommand request, CancellationToken cancellationToken)
    {
        var kategorieProduktov = await _repository.GetByIdAsync(request.Id, cancellationToken);
        Guard.Against.NotFound(request.Id, kategorieProduktov);

        kategorieProduktov.Nazov = request.Nazov;


        await _repository.SaveAsync(cancellationToken);
    }
} 
